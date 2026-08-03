import { NextRequest, NextResponse } from "next/server";
import { oauth1Header } from "@/lib/oauth1";
import {
  SESSION_COOKIE,
  type SessionUser,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/session";

/**
 * Completes X sign-in for both flows (see login/route.ts):
 * - OAuth 1.0a: ?oauth_token & ?oauth_verifier -> access token (which already
 *   carries user_id + screen_name; name/avatar are enriched via fxtwitter).
 * - OAuth 2.0 PKCE: ?code & ?state -> token -> GET /2/users/me.
 */
export async function GET(req: NextRequest) {
  const home = new URL("/#chat", req.nextUrl.origin);
  const fail = (reason: string) => {
    const url = new URL(home);
    url.searchParams.set("chat_error", reason);
    return NextResponse.redirect(url);
  };
  const succeed = (user: SessionUser, clearCookies: string[]) => {
    const res = NextResponse.redirect(home);
    res.cookies.set(SESSION_COOKIE, createSessionToken(user), sessionCookieOptions());
    for (const name of clearCookies) res.cookies.delete(name);
    return res;
  };

  // ---- OAuth 1.0a ----------------------------------------------------------

  // X sends ?denied=<token> when the user cancels the consent screen.
  if (req.nextUrl.searchParams.get("denied")) {
    return fail("x_access_denied");
  }

  const oauthToken = req.nextUrl.searchParams.get("oauth_token");
  const oauthVerifier = req.nextUrl.searchParams.get("oauth_verifier");
  if (oauthToken && oauthVerifier) {
    const consumerKey = process.env.X_CONSUMER_KEY;
    const consumerSecret = process.env.X_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret) return fail("unconfigured");

    const request = req.cookies.get("x_oauth1_request")?.value ?? "";
    const [expectedToken, tokenSecret] = request.split(":");
    if (!tokenSecret || oauthToken !== expectedToken) return fail("state");

    const url = "https://api.x.com/oauth/access_token";
    const accessRes = await fetch(url, {
      method: "POST",
      headers: {
        authorization: oauth1Header({
          method: "POST",
          url,
          consumerKey,
          consumerSecret,
          token: oauthToken,
          tokenSecret,
          params: { oauth_verifier: oauthVerifier },
        }),
      },
    });
    if (!accessRes.ok) {
      console.error(
        `X access_token failed: ${accessRes.status}`,
        await accessRes.text().catch(() => "<unreadable body>")
      );
      return fail(`access_token_${accessRes.status}`);
    }
    const data = new URLSearchParams(await accessRes.text());
    const id = data.get("user_id");
    const handle = data.get("screen_name");
    if (!id || !handle) {
      console.error("X access_token returned an unexpected body");
      return fail("access_token_body");
    }

    // Display name + avatar are cosmetic — enrich best-effort via fxtwitter
    // (public, no X API quota) and fall back to the handle alone.
    let name = handle;
    let avatar = "";
    try {
      const profileRes = await fetch(`https://api.fxtwitter.com/${handle}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (profileRes.ok) {
        const profile = (await profileRes.json()) as {
          user?: { name?: string; avatar_url?: string };
        };
        if (profile.user?.name) name = profile.user.name;
        avatar = (profile.user?.avatar_url ?? "").replace("_normal", "_400x400");
      }
    } catch {}

    return succeed({ id, name, handle, avatar }, ["x_oauth1_request"]);
  }

  // ---- OAuth 2.0 PKCE ------------------------------------------------------

  // X reports authorization failures (user denied, suspended app, ...) as an
  // `error` param instead of a code.
  const xError = req.nextUrl.searchParams.get("error");
  if (xError) {
    console.error(`X authorize step failed: ${xError}`);
    return fail(`x_${xError}`);
  }

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("unconfigured");

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

  return succeed(
    {
      id: me.data.id,
      name: me.data.name,
      handle: me.data.username,
      // "_normal" is a 48x48 thumbnail; request the 400x400 variant.
      avatar: (me.data.profile_image_url ?? "").replace("_normal", "_400x400"),
    },
    ["x_oauth_state", "x_oauth_verifier"]
  );
}
