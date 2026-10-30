import { NextResponse } from "next/server";
import { tweetImageSource } from "@/lib/tweet-image-source.mjs";
import { downloadTweetImage, savedTweetImage } from "@/lib/tweet-images";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get("url") ?? "";
  if (!tweetImageSource(source)) return new NextResponse("Invalid image source", { status: 400 });
  const saved = savedTweetImage(source);
  if (saved) {
    return NextResponse.redirect(new URL(saved, request.url), {
      status: 307,
      headers: { "cache-control": "public, max-age=86400, s-maxage=31536000" },
    });
  }
  const image = await downloadTweetImage(source);
  if (!image) return new NextResponse("Image unavailable", { status: 502 });
  return new NextResponse(new Uint8Array(image), {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
    },
  });
}
