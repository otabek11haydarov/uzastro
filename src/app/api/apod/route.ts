import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  try {
    const r = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}`, { next: { revalidate: 3600 } });
    if (!r.ok) return NextResponse.json({ error: `NASA ${r.status}` }, { status: 502 });
    const d = await r.json();
    return NextResponse.json({
      title: d.title,
      explanation: d.explanation,
      url: d.media_type === "image" ? d.url : d.url,
      media_type: d.media_type,
      date: d.date,
      copyright: d.copyright,
    });
  } catch {
    return NextResponse.json({ error: "NASA bilan aloqa yo‘q" }, { status: 502 });
  }
}
