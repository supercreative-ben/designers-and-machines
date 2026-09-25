import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";
import sharp from "sharp";

// Exercise storage precedence, actual image decoding, and upstream failures
// without depending on X availability or production credentials.
const code = ts.transpileModule(readFileSync("lib/avatar-storage.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
function harness({ stored = null, fetcher = async () => { throw new Error("offline"); }, failWrite = false } = {}) {
  const writes = [];
  const exports = {};
  const blob = {
    get: async () => stored ? { statusCode: 200, stream: new Response(stored).body } : null,
    put: async (...args) => { if (failWrite) throw new Error("unavailable"); writes.push(args); },
  };
  new Function("require", "exports", "process", "fetch", code)(
    name => name === "@vercel/blob" ? blob : sharp,
    exports, { env: { BLOB_READ_WRITE_TOKEN: "test-only" } }, fetcher,
  );
  return { load: exports.loadAvatar, writes };
}
const image = await sharp({ create: { width: 240, height: 180, channels: 3, background: "#123456" } }).png().toBuffer();

test("saved image survives upstream failure and is never overwritten", async () => {
  const h = harness({ stored: image });
  assert.deepEqual(Buffer.from(await h.load("Example", "https://pbs.twimg.com/old.jpg")), image);
  assert.equal(h.writes.length, 0);
});
test("new authenticated image is decoded, resized and saved immutably", async () => {
  const h = harness({ fetcher: async () => new Response(image, { headers: { "content-type": "image/png" } }) });
  const result = await h.load("Example", "https://pbs.twimg.com/photo.png");
  const meta = await sharp(result).metadata();
  assert.equal(meta.width, 96); assert.equal(meta.height, 96); assert.equal(meta.format, "jpeg");
  assert.equal(h.writes[0][0], "avatars/v1/example.jpg");
  assert.equal(h.writes[0][2].access, "private");
  assert.equal(h.writes[0][2].allowOverwrite, false);
});
test("stale source recovers from the current public profile", async () => {
  const h = harness({ fetcher: async url => {
    const value = String(url);
    if (value.endsWith("old.jpg")) return new Response(null, { status: 404 });
    if (value.includes("api.fxtwitter.com")) return Response.json({ user: { avatar_url: "https://pbs.twimg.com/current.png" } });
    return new Response(image, { headers: { "content-type": "image/png" } });
  } });
  assert(await h.load("example", "https://pbs.twimg.com/old.jpg"));
  assert.equal(h.writes.length, 1);
});
test("invalid handles and untrusted source hosts are never requested", async () => {
  const urls = [];
  const h = harness({ fetcher: async url => { urls.push(String(url)); throw new Error("offline"); } });
  assert.equal(await h.load("../private"), null);
  assert.equal(await h.load("example", "http://127.0.0.1/secret"), null);
  assert.deepEqual(urls, ["https://api.fxtwitter.com/example"]);
});
test("oversized and corrupt image responses are not persisted", async () => {
  for (const headers of [{ "content-type": "image/png", "content-length": "6000000" }, { "content-type": "image/png" }]) {
    const h = harness({ fetcher: async () => new Response("not an image", { headers }) });
    assert.equal(await h.load("example", "https://pbs.twimg.com/bad.png"), null);
    assert.equal(h.writes.length, 0);
  }
});
test("a storage write outage still serves the validated image", async () => {
  const h = harness({ failWrite: true, fetcher: async () => new Response(image, { headers: { "content-type": "image/png" } }) });
  assert(await h.load("example", "https://pbs.twimg.com/photo.png"));
});

test("both reported broken chat profiles have valid local photos", async () => {
  // The two broken profiles reported in the screenshot must never depend on X.
  for (const handle of ["luorui2025", "shahdappp"]) {
    const meta = await sharp(readFileSync(`public/people/${handle}.jpg`)).metadata();
    assert.equal(meta.format, "jpeg");
    assert(meta.width > 0 && meta.width <= 96);
  }
});
