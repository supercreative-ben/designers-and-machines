import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { mergeGuests, normalizeHandle, parseCsv, readGuests, renderGuests } from "./merge-guests.mjs";

const header = 'name,email,checked_in_at,What is your X (Twitter) handle?,approval_status,private_answer\n';
const checked = "2026-10-30T01:40:00Z";
const original = [{ name: "Ada Lee", handle: "AdaLee", avatar: "/people/adalee.jpg", editions: ["2026-03", "2026-09"] }];

test("checked-in guests merge without replacing historical attendance or importing RSVPs", () => {
  const csv = header + `Ada Lee,private@example.com,${checked},https://x.com/adalee,approved,SECRET\n` +
    `No Show,absent@example.com,,@noshow,approved,SECRET\n` +
    `New Guest,new@example.com,${checked},@NewGuest,approved,SECRET\n`;
  const { guests, report } = mergeGuests(original, csv, "2026-10");
  assert.equal(report.checkedIn, 2);
  assert.equal(report.newGuests, 1);
  assert.equal(report.addedMemberships, 2);
  assert.deepEqual(report.issues, []);
  assert.deepEqual(guests[0], { ...original[0], editions: ["2026-03", "2026-09", "2026-10"] });
  assert.deepEqual(original[0].editions, ["2026-03", "2026-09"]);
  assert.equal(guests.some((guest) => guest.name === "No Show"), false);
  assert.equal(/SECRET|example\.com|private_answer/.test(renderGuests(guests) + JSON.stringify(report)), false);
  const repeated = mergeGuests(guests, csv, "2026-10");
  assert.deepEqual(repeated.guests, guests);
  assert.equal(repeated.report.addedMemberships, 0);
  assert.deepEqual(repeated.report.issues, []);
});

test("missing handles remain null; repeated imports do not duplicate them", () => {
  const csv = header + `Guest Without X,guest@example.com,${checked},,approved,\n`;
  const first = mergeGuests([], csv, "2026-10");
  assert.equal(first.guests[0].handle, null);
  const repeated = mergeGuests(first.guests, csv, "2026-10");
  assert.deepEqual(repeated.guests, first.guests);
  assert.deepEqual(repeated.report.issues, []);
});

test("historical namesakes and changed handles require review", () => {
  for (const handle of ["", "differenthandle"]) {
    const { guests, report } = mergeGuests(original, header + `Ada Lee,private@example.com,${checked},${handle},approved,\n`, "2026-10");
    assert.deepEqual(guests, original);
    assert.equal(report.issues.length, 1);
  }
  const csv = header + `Namesake,one@example.com,${checked},,approved,\n` + `Namesake,two@example.com,${checked},,approved,\n`;
  assert.equal(mergeGuests([], csv, "2026-10").report.issues.length, 1);
});

test("duplicate export rows reconcile to one membership", () => {
  const row = `Ada Lee,private@example.com,${checked},@AdaLee,approved,\n`;
  const { guests, report } = mergeGuests(original, header + row + row, "2026-10");
  assert.equal(guests.length, 1);
  assert.equal(report.checkedIn, 2);
  assert.equal(report.addedMemberships, 1);
  assert.equal(report.alreadyRecorded, 1);
});

test("CSV schema, check-in values, quoting, and UTF-8 BOM are checked", () => {
  assert.deepEqual(parseCsv('name,notes\r\n"Lee, Ada","line 1\nline 2 ""quoted"""\r\n'), [["name", "notes"], ["Lee, Ada", 'line 1\nline 2 "quoted"']]);
  assert.throws(() => parseCsv('name\n"unfinished'), /Unclosed/);
  assert.throws(() => mergeGuests([], "name,approval_status\nSomeone,approved", "2026-10"), /Missing checked_in_at/);
  assert.throws(() => mergeGuests([], header + "Someone,private@example.com,false,,approved,\n", "2026-10"), /invalid checked_in_at/);
  assert.throws(() => mergeGuests([], header + "Someone,too,few\n", "2026-10"), /wrong number/);
  assert.equal(mergeGuests([], "\uFEFF" + header, "2026-10").report.checkedIn, 0);
});

test("only profile handles are accepted; post URLs and prose cannot become identities", () => {
  assert.equal(normalizeHandle("https://twitter.com/AdaLee?s=21"), "AdaLee");
  assert.equal(normalizeHandle("x.com/adalee/"), "adalee");
  for (const value of ["https://x.com/adalee/status/123", "https://notx.com/adalee", "@AdaLee maybe", "https://x.com/i", "none", "N/A"]) {
    assert.equal(normalizeHandle(value), null);
  }
});

test("existing public data round-trips exactly and rejects executable data", () => {
  const source = readFileSync(new URL("../data/guests.ts", import.meta.url), "utf8");
  assert.equal(renderGuests(readGuests(source)), source);
  assert.throws(() => readGuests('export const GUESTS = getGuests();'), /static GUESTS/);
  assert.throws(() => readGuests('export const GUESTS = [{name: "Private", handle: null, email: "private@example.com", editions: []}];'), /Unsupported guest field/);
});
