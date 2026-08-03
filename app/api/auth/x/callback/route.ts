import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/session";

/** Completes the X OAuth flow: code -> token -> profile -> session cookie. */
export async function GET(req: NextRequest) {
  const home = new URL("/#chat", req.nextUrl.origin);
  const fail = (reason: string) => {
    const url = new URL(home);
    url.searchParams.set("chat_error", reason);
    return NextResponse.redirect(url);
  };

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("unconfigured");

  // X reports authorization failures (user denied, suspended app, ...) as an
  // `error` param instead of a code.
  const xError = req.nextUrl.searchParams.get("error");
  if (xError) {
    console.error(`X authorize step failed: ${xError}`);
    return fail(`x_${xError}`);
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get("x_oauth_state")?.value;
  const verifier = req.cookies.get("x_oauth_verifier")?.value;
  if (!code || !state || !expectedState || !verifier || state !== expectedState)
    return fail("state");

  const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${req.nextUrl.origin}/api/auth/x/callback`,
      code_verifier: verifier,
    }),
  });
  if (!tokenRes.ok) {
    // Surface X's reason in the function logs: a 401 invalid_client means
    // the client id/secret env vars no longer match the X developer app.
    console.error(
      `X token exchange failed: ${tokenRes.status}`,
      await tokenRes.text().catch(() => "<unreadable body>")
    );
    return fail(`token_${tokenRes.status}`);
  }
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const meRes = await fetch(
    "https://api.x.com/2/users/me?user.fields=profile_image_url",
    { headers: { authorization: `Bearer ${access_token}` } }
  );
  if (!meRes.ok) {
    // A 429 here is the X free-tier rate limit on /2/users/me; a 403 usually
    // means the app is not attached to a developer-portal project.
    console.error(
      `X profile fetch failed: ${meRes.status}`,
      await meRes.text().catch(() => "<unreadable body>")
    );
    return fail(`profile_${meRes.status}`);
  }
  const me = (await meRes.json()) as {
    data: { id: string; name: string; username: string; profile_image_url?: string };
  };

  const token = createSessionToken({
    id: me.data.id,
    name: me.data.name,
    handle: me.data.username,
    // "_normal" is a 48x48 thumbnail; request the 400x400 variant.
    avatar: (me.data.profile_image_url ?? "").replace("_normal", "_400x400"),
  });

  const res = NextResponse.redirect(home);
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  res.cookies.delete("x_oauth_state");
  res.cookies.delete("x_oauth_verifier");
  return res;
}
