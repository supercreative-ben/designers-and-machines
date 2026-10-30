// Archive the public images used by selected recap posts, including quoted posts.
// node scripts/cache-tweet-images.mjs --edition 2026-10
// Omit --edition to refresh all curated recap posts. Existing copies are kept.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { getTweet } from "react-tweet/api";
import ts from "typescript";
import { downloadTweetImage, tweetImageSource } from "../lib/tweet-image-source.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = `${root}data/tweet-images.json`;
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--edition" || !/^\d{4}-\d{2}$/.test(args[1]))) {
  throw new Error("Usage: node scripts/cache-tweet-images.mjs [--edition YYYY-MM]");
}
const edition = args[1];
const file = ts.createSourceFile("events.ts", readFileSync(`${root}data/events.ts`, "utf8"), ts.ScriptTarget.Latest, true);
const events = file.statements.filter(ts.isVariableStatement)
  .flatMap((statement) => [...statement.declarationList.declarations])
  .find((entry) => entry.name.getText(file) === "EVENTS")?.initializer;
if (!events || !ts.isArrayLiteralExpression(events)) throw new Error("Expected a static EVENTS array.");
const ids = new Set();
for (const event of events.elements) {
  if (!ts.isObjectLiteralExpression(event)) continue;
  const properties = event.properties.filter(ts.isPropertyAssignment);
  const eventId = properties.find((property) => property.name.getText(file) === "id")?.initializer;
  if (edition && (!eventId || !ts.isStringLiteral(eventId) || eventId.text !== edition)) continue;
  const tweets = properties.find((property) => property.name.getText(file) === "tweets")?.initializer;
  if (!tweets || !ts.isArrayLiteralExpression(tweets)) continue;
  for (const tweet of tweets.elements) {
    if (ts.isStringLiteral(tweet)) {
      const id = tweet.text.match(/\/status\/(\d+)/)?.[1];
      if (id) ids.add(id);
    }
  }
}
if (!ids.size) throw new Error("No selected recap posts found.");

const sources = new Map();
function collect(value) {
  const parsed = tweetImageSource(value);
  if (parsed) sources.set(parsed.key, value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
}
for (const id of ids) {
  const tweet = await getTweet(id);
  if (!tweet) throw new Error(`Could not read selected post ${id}.`);
  collect(tweet);
}

mkdirSync(`${root}public/tweets`, { recursive: true });
let downloaded = 0;
const failed = [];
for (const [key, source] of sources) {
  if (manifest[key] && existsSync(`${root}public${manifest[key]}`)) continue;
  const image = await downloadTweetImage(source);
  if (!image) { failed.push(key); continue; }
  const filename = `${createHash("sha256").update(key).digest("hex").slice(0, 20)}.jpg`;
  writeFileSync(`${root}public/tweets/${filename}`, image);
  manifest[key] = `/tweets/${filename}`;
  downloaded++;
}
writeFileSync(manifestPath, `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))), null, 2)}\n`);
console.log(JSON.stringify({ posts: ids.size, uniqueImages: sources.size, downloaded, failed }, null, 2));
if (failed.length) process.exitCode = 1;
