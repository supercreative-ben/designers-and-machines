import { NextResponse } from "next/server";
import { getTweet } from "react-tweet/api";

/**
 * First-party tweet data for react-tweet embeds — served from our domain
 * and cached hard, so month cards don't wait on X's widgets.js iframes.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  try {
    const tweet = await getTweet(id);
    return NextResponse.json(
      { data: tweet ?? null },
      {
        status: tweet ? 200 : 404,
        headers: {
          "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch {
    return NextResponse.json({ data: null }, { status: 502 });
  }
}
