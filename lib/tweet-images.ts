import savedImages from "../data/tweet-images.json";
import { tweetImageSource } from "./tweet-image-source.mjs";

const SAVED_IMAGES: Record<string, string> = savedImages;

export function savedTweetImage(source: string): string | null {
  const parsed = tweetImageSource(source);
  return parsed ? SAVED_IMAGES[parsed.key] ?? null : null;
}

/** Rewrites photos, avatars, badges, video posters, and nested quoted tweets. */
export function localizeTweetImages<T>(tweet: T, origin: string): T {
  function visit(value: unknown, key = ""): unknown {
    if (["text", "full_text", "expanded_url", "display_url", "href"].includes(key)) return value;
    if (typeof value === "string" && tweetImageSource(value)) {
      // react-tweet strips image extensions and adds size queries. The dynamic
      // route accepts both image.jpg and image, preserving the source query.
      const target = new URL("/api/tweet-image/image.jpg", origin);
      target.searchParams.set("url", value);
      return target.href;
    }
    if (Array.isArray(value)) return value.map((entry) => visit(entry));
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, visit(entry, key)]));
    }
    return value;
  }
  return visit(tweet) as T;
}

export { downloadTweetImage } from "./tweet-image-source.mjs";
