import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { test } from "node:test";
import ts from "typescript";

// Use the installed TypeScript compiler, like verify-avatar-storage.mjs.
// Load the real data, or small fixtures for future-edition edge cases.
function loader(overrides = {}) {
  const cache = new Map();
  function load(path) {
    const filename = resolve(path);
    if (filename in overrides) return overrides[filename];
    if (cache.has(filename)) return cache.get(filename);
    const exports = {};
    cache.set(filename, exports);
    const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    new Function("require", "exports", outputText)((specifier) => load(resolve(dirname(filename), `${specifier}.ts`)), exports);
    return exports;
  }
  return load;
}

const load = loader();
const directory = load("lib/webmcp/directory.ts");
const { DIRECTORY_TOOLS } = load("lib/webmcp/tools.ts");
const { getModelContext, registerDirectoryTools } = load("lib/webmcp/register.ts");
const today = new Date("2026-10-22T12:00:00-07:00");

async function call(name, args) {
  const result = await DIRECTORY_TOOLS.find((tool) => tool.name === name).execute(args);
  return { ...result, data: JSON.parse(result.content[0].text) };
}

test("events include the confirmed October schedule without inventing a venue or roster", () => {
  const result = directory.listEvents({ status: "upcoming" }, today);
  assert.equal(result.total, 1);
  const october = result.items[0];
  assert.equal(october.id, "2026-10");
  assert.equal(october.startsAt, "2026-10-29T18:30:00-07:00");
  assert.equal(october.timeZone, "America/Los_Angeles");
  assert.equal(october.venueConfirmed, false);
  assert.equal(october.publishedAttendeeCount, null);
  assert.equal(october.publishedDemoCount, null);
  const { LUMA_EVENT_SLUG } = load("data/site.ts");
  assert.equal(october.registrationUrl, `https://luma.com/${LUMA_EVENT_SLUG}`);
  assert.equal(directory.listEvents({ status: "past" }, today).total, 6);
  assert.equal(directory.getEvent("2026-03", today).date, null);
});

test("an overdue recap stops being upcoming without becoming confirmed attendance", () => {
  const later = new Date("2026-11-01T12:00:00-08:00");
  assert.equal(directory.listEvents({ status: "upcoming" }, later).total, 0);
  const october = directory.getEvent("2026-10", later);
  assert.equal(october.status, "past");
  assert.equal(october.recapPublished, false);
  assert.equal(october.publishedAttendeeCount, null);
});

test("September reconciles to 35 public attendees and six actual demos", () => {
  const event = directory.getEvent("2026-09", today);
  const people = directory.searchAttendees({ eventId: event.id, limit: 50 });
  assert.equal(event.publishedAttendeeCount, 35);
  assert.equal(people.total, 35);
  assert.equal(event.demos.length, 6);
  assert.equal(event.demos.every((demo) => demo.status === "presented"), true);
  assert.equal(event.recapUrls[0], "https://x.com/elenahuxy/status/2103370645484847175");
  for (const demo of event.demos) assert(people.items.some((person) => person.id === demo.personId));
});

test("people search handles accents, case, @, project names and edition-specific roles", () => {
  const micka = directory.searchAttendees({ query: " @MICKA_design " });
  assert.equal(micka.total, 1);
  assert(micka.items[0].editions.includes("2026-09"));
  assert(micka.items[0].demoEventIds.includes("2026-03"));
  assert.equal(directory.searchAttendees({ query: "Pierre Louis Soulie" }).total, 1);
  assert.equal(directory.searchAttendees({ query: "Human Memory", eventId: "2026-09", role: "demo_giver" }).total, 1);
  assert.equal(directory.searchAttendees({ query: "Maayan", eventId: "2026-04", role: "demo_giver" }).total, 0);
  assert.equal(directory.searchAttendees({ query: "Maayan", eventId: "2026-09", role: "demo_giver" }).total, 1);
  assert.deepEqual(directory.searchAttendees({ query: "ben_issen" }).items[0].editions, ["2026-06"]);
  assert.equal(directory.searchAttendees({ eventId: "2026-10" }).attendancePublished, false);
});

test("pagination traverses all records exactly once and handles empty pages", () => {
  const ids = [];
  let offset = 0;
  let total;
  do {
    const page = directory.searchAttendees({ limit: 7, offset });
    assert(page.items.length <= 7);
    total = page.total;
    ids.push(...page.items.map((person) => person.id));
    offset = page.nextOffset;
  } while (offset !== null);
  assert.equal(ids.length, total);
  assert.equal(new Set(ids).size, total);
  const empty = directory.searchAttendees({ offset: 1000000 });
  assert.deepEqual(empty.items, []);
  assert.equal(empty.nextOffset, null);
  assert.equal(directory.searchDemos({ query: "no-such-project-xyz" }).total, 0);
});

test("demo search returns project and profile links, including repeated presenters", () => {
  const demos = directory.searchDemos({ query: "micka" });
  assert.equal(demos.total, 2);
  assert.equal(demos.items[0].eventId, "2026-09");
  assert.equal(demos.items[0].projectUrl, "https://humanmemory.dev/");
  assert.equal(demos.items[0].profileUrl, "https://x.com/micka_design");
  assert.equal(directory.searchDemos({ query: "penguin.music" }).items[0].name, "Manan Dua");
  assert.equal(directory.searchDemos({ eventId: "2026-09" }).total, 6);
});

test("scheduled speakers and private fields never become past attendees", () => {
  const fixtures = loader({
    [resolve("data/events.ts")]: { EVENTS: [
      { id: "2026-01", title: "January", venue: "SF", speakers: [] },
      { id: "2026-12", title: "December", venue: "SF", upcoming: true, speakers: [{ name: "Future Speaker", handle: "future" }] },
    ] },
    [resolve("data/guests.ts")]: { GUESTS: [{ name: "Past Guest", handle: null, editions: ["2026-01"], email: "private@example.test", phone: "private", registrationAnswers: { private: true } }] },
  });
  const fixturePeople = fixtures("data/people.ts").ATTENDEES;
  assert.equal(fixturePeople.some((person) => person.handle === "future"), false);
  const fixtureDirectory = fixtures("lib/webmcp/directory.ts");
  const result = fixtureDirectory.searchAttendees({});
  assert.equal(result.total, 1);
  assert.equal(fixtureDirectory.searchAttendees({ query: "ben_issen" }).total, 0);
  assert.equal(result.items[0].profileUrl, null);
  assert.deepEqual(Object.keys(result.items[0]).sort(), ["id", "name", "handle", "profileUrl", "editions", "demoEventIds"].sort());
  assert.equal(JSON.stringify(result).includes("private"), false);
  assert.equal(fixtureDirectory.searchDemos({}).items[0].status, "scheduled");
});

test("all exposed tools validate malformed inputs and unknown editions", async () => {
  for (const args of [null, [], "hello", { limit: 0 }, { limit: 51 }, { limit: 1.5 }, { offset: -1 }, { offset: Infinity }, { query: "x".repeat(201) }, { extra: true }, { query: 123 }, { role: "admin" }]) {
    assert.equal((await call("dm_search_attendees", args)).isError, true, JSON.stringify(args));
  }
  assert.equal((await call("dm_get_event", {})).isError, true);
  assert.equal((await call("dm_get_event", { eventId: " " })).isError, true);
  for (const name of ["dm_get_event", "dm_search_attendees", "dm_search_demos"]) {
    const result = await call(name, { eventId: "missing" });
    assert.equal(result.isError, true);
    assert.match(result.data.error, /dm_list_events/);
  }
  assert.equal((await call("dm_list_events", { status: "unknown" })).isError, true);
  assert.equal((await call("dm_search_demos", {})).isError, undefined);
  assert.equal(DIRECTORY_TOOLS.every((tool) => tool.annotations.readOnlyHint), true);
  assert(JSON.stringify(DIRECTORY_TOOLS).length < 16000);
});

test("feature detection prefers document, falls back to navigator, and safely skips unsupported browsers", () => {
  const current = { registerTool() {} };
  const legacy = { registerTool() {} };
  assert.equal(getModelContext({ modelContext: current }, { modelContext: legacy }), current);
  assert.equal(getModelContext({ modelContext: {} }, { modelContext: legacy }), legacy);
  assert.equal(getModelContext({}, {}), null);
});

test("current signal-based registration cleans up and remounts", async () => {
  const registered = new Map();
  const errors = [];
  const context = {
    async registerTool(tool, { signal }) {
      if (registered.has(tool.name)) throw new Error("Duplicate");
      registered.set(tool.name, tool);
      signal.addEventListener("abort", () => registered.delete(tool.name), { once: true });
    },
  };
  const first = registerDirectoryTools(context, DIRECTORY_TOOLS, (error) => errors.push(error));
  await first.ready;
  assert.equal(registered.size, 4);
  first.dispose();
  assert.equal(registered.size, 0);
  const second = registerDirectoryTools(context, DIRECTORY_TOOLS, (error) => errors.push(error));
  await second.ready;
  assert.equal(registered.size, 4);
  second.dispose();
  assert.deepEqual(errors, []);
});

test("legacy async registration cannot delete tools from a Strict Mode remount", async () => {
  const registered = new Set();
  const errors = [];
  let resolveFirst;
  let first = true;
  const context = {
    async registerTool(tool) {
      if (first) {
        first = false;
        await new Promise((resolve) => { resolveFirst = resolve; });
      }
      if (registered.has(tool.name)) throw new Error("Duplicate");
      registered.add(tool.name);
    },
    unregisterTool(name) { registered.delete(name); },
  };
  const old = registerDirectoryTools(context, DIRECTORY_TOOLS, (error) => errors.push(error));
  await Promise.resolve();
  old.dispose();
  const next = registerDirectoryTools(context, DIRECTORY_TOOLS, (error) => errors.push(error));
  resolveFirst();
  await Promise.all([old.ready, next.ready]);
  assert.equal(registered.size, 4);
  assert.deepEqual(errors, []);
  next.dispose();
  assert.equal(registered.size, 0);
});

test("registration failures are caught without unregistering someone else's tools", async () => {
  const removed = [];
  const errors = [];
  const context = {
    async registerTool() { throw new Error("Disabled by host"); },
    unregisterTool(name) { removed.push(name); },
  };
  const registration = registerDirectoryTools(context, DIRECTORY_TOOLS, (error) => errors.push(error));
  await registration.ready;
  registration.dispose();
  assert.equal(errors.length, 4);
  assert.deepEqual(removed, []);
});
