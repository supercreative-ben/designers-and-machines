import { createHmac, randomBytes } from "crypto";

/**
 * Minimal OAuth 1.0a HMAC-SHA1 signing (RFC 5849), enough for the
 * "Sign in with X" three-legged flow. No external library needed.
 */

/** RFC 3986 percent-encoding — encodeURIComponent plus !'()*. */
function enc(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

export type OAuth1Request = {
  method: "GET" | "POST";
  /** Full URL; its query string is included in the signature base. */
  url: string;
  consumerKey: string;
  consumerSecret: string;
  /** Request/access token, once the flow has one. */
  token?: string;
  tokenSecret?: string;
  /** Extra oauth_* params (oauth_callback, oauth_verifier, ...). */
  params?: Record<string, string>;
  /** Overridable for tests only. */
  timestamp?: string;
  nonce?: string;
};

/** Builds the `OAuth ...` Authorization header for a signed request. */
export function oauth1Header(req: OAuth1Request): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: req.consumerKey,
    oauth_nonce: req.nonce ?? randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: req.timestamp ?? String(Math.floor(Date.now() / 1000)),
    oauth_version: "1.0",
    ...(req.token ? { oauth_token: req.token } : {}),
    ...req.params,
  };

  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;

  // Signature base: every query + oauth param, encoded, sorted, joined.
  const allParams: [string, string][] = [
    ...[...url.searchParams].map(([k, v]): [string, string] => [k, v]),
    ...Object.entries(oauthParams),
  ];
  const paramString = allParams
    .map(([k, v]): [string, string] => [enc(k), enc(v)])
    .sort(([ak, av], [bk, bv]) =>
      ak === bk ? (av < bv ? -1 : 1) : ak < bk ? -1 : 1
    )
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const base = `${req.method}&${enc(baseUrl)}&${enc(paramString)}`;
  const signingKey = `${enc(req.consumerSecret)}&${enc(req.tokenSecret ?? "")}`;
  const signature = createHmac("sha1", signingKey).update(base).digest("base64");

  const header = { ...oauthParams, oauth_signature: signature };
  return `OAuth ${Object.entries(header)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${enc(k)}="${enc(v)}"`)
    .join(", ")}`;
}
