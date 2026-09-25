import { get, put } from "@vercel/blob";
import sharp from "sharp";

export const AVATAR_HANDLE = /^[A-Za-z0-9_]{1,15}$/;
const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT = 5000;

function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/** Fetch only known image providers; decode and shrink before persisting. */
async function downloadImage(source: string): Promise<Buffer | null> {
  try {
    const url = new URL(source);
    if (url.protocol !== "https:" || url.hostname !== "pbs.twimg.com") return null;
    const response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(TIMEOUT),
      cache: "no-store",
    });
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) return null;
    if (Number(response.headers.get("content-length")) > MAX_BYTES) return null;
    if (!response.body) return null;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    return await sharp(Buffer.concat(chunks), { limitInputPixels: 16_000_000 })
      .rotate()
      .resize(96, 96, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch {
    return null;
  }
}

/** Saved copies are authoritative: an upstream outage never replaces one. */
export async function loadAvatar(handle: string, authenticatedSource?: string): Promise<Uint8Array | null> {
  if (!AVATAR_HANDLE.test(handle)) return null;
  const normalized = handle.toLowerCase();
  const pathname = `avatars/v1/${normalized}.jpg`;
  if (storageConfigured()) {
    try {
      const stored = await get(pathname, { access: "private", abortSignal: AbortSignal.timeout(TIMEOUT) });
      if (stored?.statusCode === 200) {
        return new Uint8Array(await new Response(stored.stream).arrayBuffer());
      }
    } catch {
      // A storage outage must not block sign-in or the visible fallback.
    }
  }

  let image = authenticatedSource ? await downloadImage(authenticatedSource) : null;
  if (!image) {
    try {
      const response = await fetch(`https://api.fxtwitter.com/${normalized}`, {
        signal: AbortSignal.timeout(TIMEOUT),
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        const source = data?.user?.avatar_url;
        if (typeof source === "string") image = await downloadImage(source);
      }
    } catch {
      // Unknown/deleted profiles render initials and can retry later.
    }
  }
  if (!image) return null;
  if (storageConfigured()) {
    try {
      await put(pathname, image, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "image/jpeg",
        abortSignal: AbortSignal.timeout(TIMEOUT),
      });
    } catch {
      // A concurrent request may have saved this same immutable pathname.
      // Still serve the validated photo if storage is temporarily unavailable.
    }
  }
  return new Uint8Array(image);
}
