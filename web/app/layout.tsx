import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "NagiGen AI", description: "Create AI images from your ideas." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
