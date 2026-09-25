import { NextRequest, NextResponse } from "next/server";
import { savedAvatarUrl } from "@/data/avatars";
import { AVATAR_HANDLE, loadAvatar } from "@/lib/avatar-storage";

export const runtime = "nodejs";
const WEEK = 604800;

/** Local deployment assets first, then durable private Blob copies. */
export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle") ?? "";
  if (!AVATAR_HANDLE.test(handle)) {
    return new NextResponse("Invalid handle", { status: 400 });
  }
  const saved = savedAvatarUrl(handle);
  if (saved) return NextResponse.redirect(new URL(saved, req.url));

  const image = await loadAvatar(handle);
  if (image) {
    return new NextResponse(new Uint8Array(image).buffer, {
      headers: {
        "content-type": "image/jpeg",
        "cache-control": `public, max-age=86400, s-maxage=${WEEK}, stale-while-revalidate=${WEEK * 4}`,
      },
    });
  }
  const letter = handle[0].toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#55524F"/><text x="48" y="63" font-family="system-ui, sans-serif" font-size="40" fill="#EDEAE6" text-anchor="middle">${letter}</text></svg>`;
  return new NextResponse(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=60, s-maxage=300",
    },
  });
}
