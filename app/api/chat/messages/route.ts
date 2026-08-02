import { NextRequest, NextResponse } from "next/server";
import { addMessage, listMessages } from "@/lib/chat";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

// Reading the chat is public; only posting requires a session.
export async function GET() {
  const messages = await listMessages();
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { text?: string } | null;
  const text = body?.text?.trim();
  if (!text || text.length > 500) {
    return NextResponse.json({ error: "invalid message" }, { status: 400 });
  }
  const message = await addMessage(user, text);
  return NextResponse.json({ message });
}
