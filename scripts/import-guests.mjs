// Imports checked-in guests from Lu.ma guest-list CSV exports into
// data/guests.ts, and downloads a compressed avatar for everyone with an X
// handle into public/people/. Re-run after adding a new month's CSV below.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const FILES = [
  ["2026-03", "/Users/beni/Downloads/Designers & Machines      March 2026 - Guests - 2026-08-03-01-14-27.csv"],
  ["2026-04", "/Users/beni/Downloads/Designers & Machines April 2026 - Guests - 2026-08-03-01-14-09.csv"],
  ["2026-05", "/Users/beni/Downloads/Designers & Machines May 2026 - Guests - 2026-08-03-01-13-45.csv"],
  ["2026-06", "/Users/beni/Downloads/Designers & Machines June 2026 - Guests - 2026-08-03-01-13-25.csv"],
  ["2026-08", "/Users/beni/Downloads/Designers & Machines August 2026 - Guests - 2026-08-21-06-05-48.csv"],
];

const HANDLE_COLUMN = "What is your X (Twitter) handle?";

/** Minimal RFC 4180 CSV parser (quotes, escaped quotes, newlines in cells). */
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cell += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

/** "@Foo", "x.com/foo?s=21", "https://twitter.com/foo" -> "foo"; junk -> null */
function normalizeHandle(raw) {
  if (!raw) return null;
  let value = raw.trim();
  const url = value.match(/(?:x\.com|twitter\.com)\/(?:#!\/)?@?([A-Za-z0-9_]{1,15})/i);
  if (url) return url[1];
  value = value.replace(/^@/, "").split(/[/?\s]/)[0];
  if (!/^[A-Za-z0-9_]{1,15}$/.test(value)) return null;
  if (/^(none|na|no|nil|null|x|nope)$/i.test(value)) return null;
  return value;
}

function titleCase(name) {
  return name
    .toLowerCase()
    .replace(/(^|[\s\-'])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
}

// key -> { name, handle, editions:Set }
const guests = new Map();
for (const [edition, file] of FILES) {
  const rows = parseCsv(readFileSync(file, "utf8"));
  const header = rows[0];
  const col = Object.fromEntries(header.map((h, i) => [h, i]));
  let checkedIn = 0;
  for (const row of rows.slice(1)) {
    if (!row[col.checked_in_at]) continue;
    checkedIn++;
    const rawName = row[col.name] || `${row[col.first_name] ?? ""} ${row[col.last_name] ?? ""}`;
    const name = titleCase(rawName.trim());
    if (!name) continue;
    const handle = normalizeHandle(row[col[HANDLE_COLUMN]]);
    const key = (handle ?? row[col.email] ?? name).toLowerCase();
    const existing = guests.get(key);
    if (existing) {
      existing.editions.add(edition);
      if (!existing.handle && handle) existing.handle = handle;
    } else {
      guests.set(key, { name, handle, editions: new Set([edition]) });
    }
  }
  console.log(`${edition}: ${checkedIn} checked in (${rows.length - 1} rows)`);
}

const list = [...guests.values()];
console.log(`total unique guests: ${list.length}, with X handle: ${list.filter((g) => g.handle).length}`);

// --- Download compressed avatars for everyone with a handle ---
mkdirSync("public/people", { recursive: true });
let downloaded = 0, failed = [];
for (const guest of list) {
  if (!guest.handle) continue;
  const out = `public/people/${guest.handle.toLowerCase()}.jpg`;
  if (existsSync(out)) { guest.avatar = `/${out.slice(7)}`; continue; }
  try {
    // fxtwitter gives us the pbs.twimg.com URL without auth
    const res = await fetch(`https://api.fxtwitter.com/${guest.handle}`, {
      headers: { "user-agent": "designers-and-machines-import" },
    });
    const json = res.ok ? await res.json() : null;
    let url = json?.user?.avatar_url;
    if (!url) {
      url = `https://unavatar.io/twitter/${guest.handle}?fallback=false`;
    } else {
      url = url.replace("_normal", "_200x200");
    }
    const img = await fetch(url);
    if (!img.ok) throw new Error(`avatar fetch ${img.status}`);
    const tmp = `/tmp/avatar-${guest.handle}`;
    writeFileSync(tmp, Buffer.from(await img.arrayBuffer()));
    // Compress: 96px square JPEG (grid shows 44px, so 2x retina is covered)
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "80", "-Z", "96", tmp, "--out", out], { stdio: "ignore" });
    guest.avatar = `/${out.slice(7)}`;
    downloaded++;
    await new Promise((r) => setTimeout(r, 350)); // be polite to fxtwitter
  } catch {
    failed.push(guest.handle);
  }
}
console.log(`avatars downloaded: ${downloaded}, failed: ${failed.length}${failed.length ? " -> " + failed.join(", ") : ""}`);

// --- Generate data/guests.ts ---
const entries = list
  .map((g) => {
    const fields = [
      `name: ${JSON.stringify(g.name)}`,
      `handle: ${g.handle ? JSON.stringify(g.handle) : "null"}`,
    ];
    if (g.avatar) fields.push(`avatar: ${JSON.stringify(g.avatar)}`);
    fields.push(`editions: ${JSON.stringify([...g.editions])}`);
    return `  { ${fields.join(", ")} },`;
  })
  .join("\n");

writeFileSync(
  "data/guests.ts",
  `// Generated by scripts/import-guests.mjs from Lu.ma guest-list exports —
// checked-in guests only. Re-run the script to refresh; edit by hand only
// for one-off fixes.
import type { Attendee } from "./people";

export const GUESTS: Attendee[] = [
${entries}
];
`
);
console.log("wrote data/guests.ts");
