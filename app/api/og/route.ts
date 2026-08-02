import { NextRequest, NextResponse } from "next/server";

/**
 * Resolves a page's Open Graph image and redirects to it, so the Preview tab
 * can show project cards from nothing but the project URL. Cached for a day.
 *
 *   /api/og?url=https://efecto.app/
 */

export const revalidate = 86400;

function extractImage(html: string, base: URL): string | null {
  const metas = html.match(/<meta[^>]*>/gi) ?? [];
  for (const key of ["og:image", "twitter:image"]) {
    for (const tag of metas) {
      if (
        new RegExp(`(?:property|name)=["']${key}(?::secure_url)?["']`, "i").test(
          tag
        )
      ) {
        const content = tag.match(/content=["']([^"']+)["']/i);
        if (content) {
          try {
            return new URL(content[1], base).toString();
          } catch {
            continue;
          }
        }
      }
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return new NextResponse("Invalid url", { status: 400 });
  }

  try {
    const res = await fetch(target, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; DesignersAndMachines/1.0; +https://designersandmachines.com)",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return new NextResponse("Upstream error", { status: 502 });
    }
    const html = await res.text();
    const image = extractImage(html, target);
    if (!image) {
      return new NextResponse("No Open Graph image found", { status: 404 });
    }
    const redirect = NextResponse.redirect(image, 302);
    redirect.headers.set(
      "cache-control",
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
    return redirect;
  } catch {
    return new NextResponse("Failed to fetch page", { status: 502 });
  }
}
