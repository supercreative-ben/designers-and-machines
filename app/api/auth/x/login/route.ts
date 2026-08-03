import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { oauth1Header } from "@/lib/oauth1";

/**
 * Starts X sign-in. Two flows, picked by which env vars are set:
 *
 * - OAuth 1.0a (X_CONSUMER_KEY / X_CONSUMER_SECRET) — preferred. The access
 *   token response includes user_id and screen_name directly, so it never
 *   touches GET /2/users/me, which is heavily rate-limited on the free tier
 *   and has a known platform regression returning 403s.
 * - OAuth 2.0 PKCE (X_CLIENT_ID / X_CLIENT_SECRET) — fallback.
 */
export async function GET(req: NextRequest) {
  const fail = (reason: string) => {
    const home = new URL("/#chat", req.nextUrl.origin);
    home.searchParams.set("chat_error", reason);
    return NextResponse.redirect(home);
  };

  const cookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };

  const consumerKey = process.env.X_CONSUMER_KEY;
  const consumerSecret = process.env.X_CONSUMER_SECRET;
  if (consumerKey && consumerSecret) {
    const tokenRes = await fetch("https://api.x.com/oauth/request_token", {
      method: "POST",
      headers: {
        authorization: oauth1Header({
          method: "POST",
          url: "https://api.x.com/oauth/request_token",
          consumerKey,
          consumerSecret,
          params: {
            oauth_callback: `${req.nextUrl.origin}/api/auth/x/callback`,
          },
        }),
      },
    });
    if (!tokenRes.ok) {
      console.error(
        `X request_token failed: ${tokenRes.status}`,
        await tokenRes.text().catch(() => "<unreadable body>")
      );
      return fail(`request_token_${tokenRes.status}`);
    }
    const data = new URLSearchParams(await tokenRes.text());
    const token = data.get("oauth_token");
    const tokenSecret = data.get("oauth_token_secret");
    if (!token || !tokenSecret || data.get("oauth_callback_confirmed") !== "true") {
      console.error("X request_token returned an unexpected body");
      return fail("request_token_body");
    }

    const authorize = new URL("https://api.x.com/oauth/authenticate");
    authorize.searchParams.set("oauth_token", token);

    const res = NextResponse.redirect(authorize);
    // The request-token secret is needed to sign the access-token exchange.
    res.cookies.set("x_oauth1_request", `${token}:${tokenSecret}`, cookie);
    return res;
  }

  const clientId = process.env.X_CLIENT_ID;
  if (!clientId || !process.env.X_CLIENT_SECRET) {
    return fail("unconfigured");
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
  res.cookies.set("x_oauth_state", state, cookie);
  res.cookies.set("x_oauth_verifier", verifier, cookie);
  return res;
}
