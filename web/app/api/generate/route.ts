import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const sizes = new Set(["1024x1024", "1024x1536", "1536x1024"]);
const styles = new Set(["Realistic", "Anime", "Logo", "Poster", "3D", "Watercolor"]);
// Best-effort per-process guard. Use an edge/WAF or shared store for multi-instance production deployments.
const windows = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const entry = windows.get(ip);
  if (entry && entry.resetAt > now && entry.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many image requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } }
    );
  }
  if (!entry || entry.resetAt <= now) windows.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
  if (windows.size > 5000) {
    for (const [key, value] of windows) if (value.resetAt <= now) windows.delete(key);
  }

  try {
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json({ error: "Send a JSON request." }, { status: 415 });
    }
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "Image generation is not configured. Add OPENAI_API_KEY to your hosting environment." }, { status: 503 });
    }
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const style = typeof body.style === "string" && styles.has(body.style) ? body.style : "Realistic";
    const size = typeof body.size === "string" && sizes.has(body.size) ? body.size : "1024x1024";
    if (prompt.length < 3 || prompt.length > 2000) {
      return NextResponse.json({ error: "Prompt must be 3–2000 characters." }, { status: 400 });
    }

    const upstream = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.IMAGE_MODEL || "gpt-image-1", prompt: `Create a ${style.toLowerCase()} image. ${prompt}`, size }),
      cache: "no-store",
      signal: AbortSignal.timeout(110_000)
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      const status = upstream.status === 429 ? 429 : upstream.status === 400 ? 400 : 502;
      return NextResponse.json({ error: data?.error?.message || "Image provider request failed." }, { status });
    }
    const item = data?.data?.[0];
    const image = item?.b64_json ? `data:image/png;base64,${item.b64_json}` : item?.url;
    if (!image) return NextResponse.json({ error: "No image returned. Check provider model access and billing." }, { status: 502 });
    return NextResponse.json({ image }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json({ error: "Image generation timed out. Please try again." }, { status: 504 });
    }
    return NextResponse.json({ error: "Image generation failed. Check server logs and try again." }, { status: 500 });
  }
}
