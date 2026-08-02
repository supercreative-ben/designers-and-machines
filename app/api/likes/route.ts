import { del, list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

/**
 * Public like counts for speaker projects. Each like is one blob at
 * likes/{eventId}/{handle}/{visitorId}, so likes and unlikes from different
 * visitors never conflict. Every project starts with 1 baseline like.
 *
 *   GET  /api/likes?visitor=<id>          -> { counts, liked }
 *   POST /api/likes { key, visitor, liked } -> { count }
 */

const PREFIX = "likes/";
const BASELINE = 1;
const KEY = /^[0-9]{4}-[0-9]{2}\/[A-Za-z0-9_]{1,15}$/;
const VISITOR = /^[a-zA-Z0-9-]{8,64}$/;

export async function GET(req: NextRequest) {
  const visitor = req.nextUrl.searchParams.get("visitor") ?? "";
  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });

  const counts: Record<string, number> = {};
  const liked: string[] = [];
  for (const blob of blobs) {
    // likes/2026-03/pablostanley/<visitorId>
    const parts = blob.pathname.split("/");
    if (parts.length !== 4) continue;
    const key = `${parts[1]}/${parts[2]}`;
    counts[key] = (counts[key] ?? BASELINE) + 1;
    if (parts[3] === visitor) liked.push(key);
  }
  return NextResponse.json({ counts, liked, baseline: BASELINE });
}

export async function POST(req: NextRequest) {
  let body: { key?: string; visitor?: string; liked?: boolean } = {};
  try {
    body = await req.json();
  } catch {}
  const { key = "", visitor = "", liked } = body;
  if (!KEY.test(key) || !VISITOR.test(visitor) || typeof liked !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const pathname = `${PREFIX}${key}/${visitor}`;
  if (liked) {
    await put(pathname, "1", {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "text/plain",
    });
  } else {
    await del(pathname).catch(() => {});
  }

  const { blobs } = await list({ prefix: `${PREFIX}${key}/`, limit: 1000 });
  return NextResponse.json({ count: BASELINE + blobs.length });
}
