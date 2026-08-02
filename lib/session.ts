import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Minimal signed session: base64url(JSON payload) + "." + HMAC-SHA256 tag,
 * stored in an httpOnly cookie. No external auth library needed.
 */

export const SESSION_COOKIE = "dm_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  /** X user id */
  id: string;
  name: string;
  /** X handle without the @ */
  handle: string;
  /** X profile image URL */
  avatar: string;
};

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(user: SessionUser): string {
  const payload = Buffer.from(
    JSON.stringify({ ...user, exp: Date.now() + MAX_AGE_SECONDS * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const tag = token.slice(dot + 1);
  const expected = sign(payload);
  const a = Buffer.from(tag);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    const { id, name, handle, avatar } = data;
    if (!id || !name || !handle) return null;
    return { id, name, handle, avatar: avatar ?? "" };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}
