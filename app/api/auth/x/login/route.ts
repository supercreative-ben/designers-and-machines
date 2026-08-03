import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Starts the X OAuth 2.0 Authorization Code + PKCE flow.
 * Requires X_CLIENT_ID / X_CLIENT_SECRET env vars (X developer app).
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.X_CLIENT_ID;
  if (!clientId || !process.env.X_CLIENT_SECRET) {
    const home = new URL("/#chat", req.nextUrl.origin);
    home.searchParams.set("chat_error", "unconfigured");
    return NextResponse.redirect(home);
  }

  const state = randomBytes(16).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const authorize = new URL("https://x.com/i/oauth2/authorize");
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set(
    "redirect_uri",
    `${req.nextUrl.origin}/api/auth/x/callback`
  );
  authorize.searchParams.set("scope", "users.read tweet.read");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(authorize);
  const cookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
  res.cookies.set("x_oauth_state", state, cookie);
  res.cookies.set("x_oauth_verifier", verifier, cookie);
  return res;
}
