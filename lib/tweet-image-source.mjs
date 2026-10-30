import sharp from "sharp";

const MAX_BYTES = 8 * 1024 * 1024;

/** Only public X image paths can be fetched by the image endpoint. */
export function tweetImageSource(value) {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "pbs.twimg.com" || url.port || url.username || url.password) return null;
    if (!/^\/(media|profile_images|amplify_video_thumb|ext_tw_video_thumb|tweet_video_thumb)\/[A-Za-z0-9_./-]+$/.test(url.pathname)) return null;
    // react-tweet changes /media/id.jpg to /media/id?format=jpg&name=small.
    const key = url.pathname.startsWith("/media/")
      ? url.pathname.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "")
      : url.pathname;
    return { key, url };
  } catch {
    return null;
  }
}

/** Fallback for newly featured posts that have not been archived yet. */
export async function downloadTweetImage(source, fetcher = fetch) {
  const parsed = tweetImageSource(source);
  if (!parsed) return null;
  try {
    const url = parsed.url;
    if (url.pathname.startsWith("/media/")) {
      url.pathname = parsed.key;
      url.searchParams.set("format", "jpg");
      url.searchParams.set("name", "large");
    }
    const response = await fetcher(url, {
      headers: { "user-agent": "Mozilla/5.0", referer: "https://x.com/" },
      redirect: "error",
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 },
    });
    if (!response.ok || !/^image\/(jpeg|png|webp|gif|avif)(?:;|$)/i.test(response.headers.get("content-type") ?? "")) return null;
    if (Number(response.headers.get("content-length")) > MAX_BYTES || !response.body) return null;
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    return await sharp(Buffer.concat(chunks), { limitInputPixels: 40_000_000 })
      .rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 }).toBuffer();
  } catch {
    return null;
  }
}
