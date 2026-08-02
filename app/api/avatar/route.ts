import { NextRequest, NextResponse } from "next/server";

/**
 * Serves X profile pictures through our own origin. fxtwitter is tried first:
 * it returns the real avatar URL and 404s on unknown handles, while
 * unavatar.io rate-limits aggressively (429s) and can serve X's generic
 * placeholder image with a 200. Successful images are cached for a week on
 * the CDN; if both sources fail we return a lettered placeholder with a
 * short cache so the next visit can retry.
 *
 *   /api/avatar?handle=pablostanley
 */

export const revalidate = 604800;

const HANDLE = /^[A-Za-z0-9_]{1,15}$/;
const WEEK = 604800;

async function fetchAvatar(
  handle: string
): Promise<{ body: ArrayBuffer; type: string } | null> {
  try {
    const res = await fetch(`https://api.fxtwitter.com/${handle}`, {
      next: { revalidate: WEEK },
    });
    if (res.ok) {
      const data = await res.json();
      const url: string | undefined = data?.user?.avatar_url?.replace(
        "_normal",
        "_400x400"
      );
      if (url) {
        const img = await fetch(url, { next: { revalidate: WEEK } });
        if (img.ok) {
          return {
            body: await img.arrayBuffer(),
            type: img.headers.get("content-type") ?? "image/jpeg",
          };
        }
      }
    }
  } catch {}

  try {
    const res = await fetch(`https://unavatar.io/x/${handle}?fallback=false`, {
      next: { revalidate: WEEK },
    });
    if (res.ok) {
      return {
        body: await res.arrayBuffer(),
        type: res.headers.get("content-type") ?? "image/png",
      };
    }
  } catch {}

  return null;
}

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle") ?? "";
  if (!HANDLE.test(handle)) {
    return new NextResponse("Invalid handle", { status: 400 });
  }

  const image = await fetchAvatar(handle);
  if (image) {
    return new NextResponse(image.body, {
      headers: {
        "content-type": image.type,
        "cache-control": `public, s-maxage=${WEEK}, stale-while-revalidate=${WEEK * 4}`,
      },
    });
  }

  const letter = handle[0].toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="#55524F"/><text x="40" y="53" font-family="system-ui, sans-serif" font-size="34" fill="#A5A19D" text-anchor="middle">${letter}</text></svg>`;
  return new NextResponse(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, s-maxage=300",
    },
  });
}
