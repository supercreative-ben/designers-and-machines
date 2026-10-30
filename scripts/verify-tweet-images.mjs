import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import ts from "typescript";
import sharp from "sharp";
import { getMediaUrl } from "../node_modules/react-tweet/dist/utils.js";
import * as source from "../lib/tweet-image-source.mjs";

const require = createRequire(import.meta.url);
const saved = JSON.parse(readFileSync("data/tweet-images.json", "utf8"));
function load(path, modules) {
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const exports = {};
  new Function("require", "exports", code)((name) => {
    if (name in modules) return modules[name];
    throw new Error(`Unexpected import: ${name}`);
  }, exports);
  return exports;
}
const images = load("lib/tweet-images.ts", {
  "../data/tweet-images.json": saved,
  "./tweet-image-source.mjs": source,
});
function imageRoute(overrides = {}) {
  return load("app/api/tweet-image/[image]/route.ts", {
    "next/server": require("next/server"),
    "@/lib/tweet-image-source.mjs": source,
    "@/lib/tweet-images": { ...images, ...overrides },
  }).GET;
}
const photo = "https://pbs.twimg.com/media/HV3GK4PaMAA-Shh.jpg";

test("all embed image types, including quoted photos and badges, become first-party URLs", () => {
  const original = {
    text: photo,
    user: { profile_image_url_https: "https://pbs.twimg.com/profile_images/123/avatar_normal.jpg", highlighted_label: { badge: { url: "https://pbs.twimg.com/profile_images/456/badge.jpg" } } },
    mediaDetails: [{ media_url_https: photo, expanded_url: "https://x.com/example/status/1/photo/1" }],
    quoted_tweet: { mediaDetails: [{ media_url_https: photo }] },
    video: { poster: photo, variants: [{ url: "https://video.twimg.com/movie.mp4" }] },
  };
  const result = images.localizeTweetImages(original, "https://example.test");
  for (const url of [result.user.profile_image_url_https, result.user.highlighted_label.badge.url, result.mediaDetails[0].media_url_https, result.quoted_tweet.mediaDetails[0].media_url_https, result.video.poster]) {
    assert.equal(new URL(url).origin, "https://example.test");
    assert(source.tweetImageSource(new URL(url).searchParams.get("url")));
  }
  assert.equal(result.text, photo);
  assert.equal(result.video.variants[0].url, original.video.variants[0].url);
  assert.equal(result.mediaDetails[0].expanded_url, original.mediaDetails[0].expanded_url);
  assert.equal(original.mediaDetails[0].media_url_https, photo);
});

test("react-tweet's actual size conversion still resolves the saved image, with X offline", async () => {
  const tweet = images.localizeTweetImages({ mediaDetails: [{ media_url_https: photo }] }, "https://example.test");
  const url = getMediaUrl(tweet.mediaDetails[0], "small");
  assert.equal(new URL(url).pathname, "/api/tweet-image/image");
  const response = await imageRoute({ downloadTweetImage() { throw new Error("X is offline"); } })(new Request(url));
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), `https://example.test${images.savedTweetImage(photo)}`);
  assert.equal(images.savedTweetImage("https://pbs.twimg.com/media/HV3GK4PaMAA-Shh?format=jpg&name=small"), images.savedTweetImage(photo));
});

test("October's photos, all three authors, and affiliation badges are real saved JPEGs", async () => {
  const required = [
    "/media/HV3GK4PaMAA-Shh", "/media/HV3GK4VawAAjLoS", "/media/HV3GK4SaUAA4K2i", "/media/HV3GK4Wa8AAnUFo", "/media/HV3UzTiaYAA54zz",
    "/profile_images/2084475473615376385/_CerJ-ca_normal.jpg",
    "/profile_images/1705451300232867840/NEeXM01e_normal.jpg",
    "/profile_images/2052469152338923520/5s7nwrOz_normal.jpg",
    "/profile_images/2001373914610700291/b0TRY2xZ_bigger.jpg",
    "/profile_images/1901703151838990336/HbEaiJIr_bigger.jpg",
  ];
  for (const key of required) assert(saved[key], `Missing archived image: ${key}`);
  for (const path of new Set(Object.values(saved))) {
    assert.match(path, /^\/tweets\/[a-f0-9]{20}\.jpg$/);
    const meta = await sharp(readFileSync(`public${path}`)).metadata();
    assert.equal(meta.format, "jpeg");
    assert(meta.width > 0 && meta.height > 0 && meta.width <= 1600 && meta.height <= 1600);
  }
});

test("private, spoofed, credentialed, and non-image source URLs cannot be fetched", async () => {
  for (const url of ["http://pbs.twimg.com/media/test.jpg", "https://pbs.twimg.com.evil.test/media/test.jpg", "https://pbs.twimg.com@evil.test/media/test.jpg", "https://user:pass@pbs.twimg.com/media/test.jpg", "https://pbs.twimg.com:444/media/test.jpg", "https://127.0.0.1/media/test.jpg", "https://pbs.twimg.com/not-an-image", "https://pbs.twimg.com/media/%2fsecret.jpg"]) {
    assert.equal(source.tweetImageSource(url), null, url);
    assert.equal((await imageRoute()(new Request(`https://example.test/api/tweet-image/image.jpg?url=${encodeURIComponent(url)}`))).status, 400);
    assert.equal(await source.downloadTweetImage(url, () => { throw new Error("must not fetch"); }), null);
  }
});

test("new images are fetched on the server, bounded, decoded, and cached as JPEGs", async () => {
  const input = await sharp({ create: { width: 2000, height: 1000, channels: 3, background: "#123456" } }).png().toBuffer();
  const result = await source.downloadTweetImage("https://pbs.twimg.com/media/new.jpg", async (url, options) => {
    assert.equal(url.hostname, "pbs.twimg.com");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.referer, "https://x.com/");
    assert.equal(url.searchParams.get("name"), "large");
    return new Response(input, { headers: { "content-type": "image/png" } });
  });
  const meta = await sharp(result).metadata();
  assert.equal(meta.width, 1600); assert.equal(meta.height, 800); assert.equal(meta.format, "jpeg");
  const response = await imageRoute({ downloadTweetImage: async () => result })(new Request("https://example.test/api/tweet-image/image.jpg?url=https://pbs.twimg.com/media/new.jpg"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/jpeg");
  assert.match(response.headers.get("cache-control"), /s-maxage/);
});

test("failed, corrupt, SVG, and oversized responses never become cached image successes", async () => {
  for (const fetcher of [
    async () => new Response(null, { status: 403 }),
    async () => new Response("<svg/>", { headers: { "content-type": "image/svg+xml" } }),
    async () => new Response("not an image", { headers: { "content-type": "image/jpeg" } }),
    async () => new Response("too big", { headers: { "content-type": "image/jpeg", "content-length": "9000000" } }),
    async () => { throw new Error("offline"); },
  ]) assert.equal(await source.downloadTweetImage(photo, fetcher), null);
  let cancelled = false;
  const body = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(3 * 1024 * 1024)); }, cancel() { cancelled = true; } });
  assert.equal(await source.downloadTweetImage(photo, async () => new Response(body, { headers: { "content-type": "image/jpeg" } })), null);
  assert.equal(cancelled, true);
  const response = await imageRoute({ downloadTweetImage: async () => null })(new Request("https://example.test/api/tweet-image/image?url=https://pbs.twimg.com/media/new.jpg"));
  assert.equal(response.status, 502);
  assert.equal(response.headers.has("cache-control"), false);
});

test("the tweet endpoint rewrites image URLs before returning the embed payload", async () => {
  const GET = load("app/api/tweet/[id]/route.ts", {
    "next/server": require("next/server"),
    "react-tweet/api": { getTweet: async () => ({ id_str: "123", mediaDetails: [{ media_url_https: photo }] }) },
    "@/lib/tweet-images": images,
  }).GET;
  const response = await GET(new Request("https://example.test/api/tweet/123?images=local-v1"), { params: Promise.resolve({ id: "123" }) });
  const { data } = await response.json();
  assert.equal(new URL(data.mediaDetails[0].media_url_https).origin, "https://example.test");
  assert.equal(response.status, 200);
});
