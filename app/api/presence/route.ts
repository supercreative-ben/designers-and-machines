import { del, list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

/**
 * Live visitor count. Every open tab POSTs a heartbeat (~25s) with a random
 * session id; a visitor counts as online if their last beat is fresher than
 * ACTIVE_MS. Beats live as tiny blobs under presence/ and stale ones are
 * garbage-collected opportunistically.
 */

const PREFIX = "presence/";
const ACTIVE_MS = 70_000; // just over two missed heartbeats
const STALE_MS = 10 * 60_000;
const ID = /^[a-zA-Z0-9-]{8,64}$/;

async function countActive(): Promise<number> {
  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
  const now = Date.now();
  let count = 0;
  const stale: string[] = [];
  for (const blob of blobs) {
    const age = now - new Date(blob.uploadedAt).getTime();
    if (age < ACTIVE_MS) count += 1;
    else if (age > STALE_MS) stale.push(blob.pathname);
  }
  if (stale.length) void del(stale).catch(() => {});
  return count;
}

export async function GET() {
  return NextResponse.json({ count: await countActive() });
}

export async function POST(req: NextRequest) {
  let id = "";
  try {
    id = ((await req.json()) as { id?: string })?.id ?? "";
  } catch {}
  if (!ID.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await put(`${PREFIX}${id}`, String(Date.now()), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "text/plain",
  });
  return NextResponse.json({ count: await countActive() });
}
