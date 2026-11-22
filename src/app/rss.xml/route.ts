import { NextResponse } from "next/server";
import { generateRssFeed } from "@/lib/rss";

export const dynamic = "force-static";

export async function GET() {
  const rssXml = await generateRssFeed("/rss.xml");

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
