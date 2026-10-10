import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
const sizes = new Set(["1024x1024","1024x1536","1536x1024"]);
const styles = new Set(["Realistic","Anime","Logo","Poster","3D","Watercolor"]);
export async function POST(request: NextRequest) {
 try {
  const key=process.env.OPENAI_API_KEY;
  if(!key)return NextResponse.json({error:"Image generation is not configured. Add OPENAI_API_KEY to web/.env.local and restart the server."},{status:503});
  const body=await request.json();
  const prompt=typeof body.prompt==="string"?body.prompt.trim():"";
  const style=typeof body.style==="string"&&styles.has(body.style)?body.style:"Realistic";
  const size=typeof body.size==="string"&&sizes.has(body.size)?body.size:"1024x1024";
  if(prompt.length<3||prompt.length>2000)return NextResponse.json({error:"Prompt must be 3–2000 characters."},{status:400});
  const upstream=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.IMAGE_MODEL||"gpt-image-1",prompt:`Create a ${style.toLowerCase()} image. ${prompt}`,size}),cache:"no-store"});
  const data=await upstream.json();
  if(!upstream.ok)return NextResponse.json({error:data?.error?.message||"Image provider request failed."},{status:upstream.status===429?429:502});
  const item=data?.data?.[0]; const image=item?.b64_json?`data:image/png;base64,${item.b64_json}`:item?.url;
  if(!image)return NextResponse.json({error:"No image returned. Check provider model access."},{status:502});
  return NextResponse.json({image});
 } catch { return NextResponse.json({error:"Invalid request or image provider unavailable. Try again."},{status:500}); }
}
