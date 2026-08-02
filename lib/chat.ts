import { get, list, put } from "@vercel/blob";
import type { SessionUser } from "./session";

/**
 * Chat storage on Vercel Blob (private store). Each message is its own
 * immutable blob under chat/msg/, so concurrent posts never clobber each
 * other. Pathnames start with a zero-padded timestamp so lexicographic
 * order is chronological order.
 */

export type ChatMessage = {
  id: string;
  text: string;
  sentAt: number;
  user: SessionUser;
};

const PREFIX = "chat/msg/";
const MAX_MESSAGES = 60;

export async function addMessage(
  user: SessionUser,
  text: string
): Promise<ChatMessage> {
  const sentAt = Date.now();
  const id = `${String(sentAt).padStart(15, "0")}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const message: ChatMessage = { id, text, sentAt, user };
  await put(`${PREFIX}${id}.json`, JSON.stringify(message), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  return message;
}

export async function listMessages(): Promise<ChatMessage[]> {
  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
  const recent = blobs
    .sort((a, b) => (a.pathname < b.pathname ? -1 : 1))
    .slice(-MAX_MESSAGES);

  const messages = await Promise.all(
    recent.map(async (blob): Promise<ChatMessage | null> => {
      try {
        const res = await get(blob.pathname, { access: "private" });
        if (!res || res.statusCode !== 200) return null;
        const text = await new Response(res.stream).text();
        return JSON.parse(text) as ChatMessage;
      } catch {
        return null;
      }
    })
  );
  return messages.filter((m): m is ChatMessage => m !== null);
}
