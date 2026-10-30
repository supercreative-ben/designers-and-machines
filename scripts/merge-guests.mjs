// Merge one edition without needing historical exports. Preview by default:
// node scripts/merge-guests.mjs --edition 2026-10 --csv /private/tmp/guests.csv
// Add --write only after reviewing the counts and resolving identity conflicts.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import ts from "typescript";

const HANDLE_COLUMN = "What is your X (Twitter) handle?";
const GUEST_FILE = fileURLToPath(new URL("../data/guests.ts", import.meta.url));

export function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  if (quoted) throw new Error("Unclosed quoted CSV field; no data written.");
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export function normalizeHandle(raw = "") {
  let value = raw.trim();
  if (/^(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\//i.test(value)) {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!/^\/@?[A-Za-z0-9_]{1,15}\/?$/.test(url.pathname)) return null;
    value = url.pathname.replace(/^\/@?/, "").replace(/\/$/, "");
  }
  value = value.replace(/^@/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(value)) return null;
  if (/^(none|na|n_a|no|nil|null|x|nope|home|intent|share|explore|search|settings|notifications|messages|i)$/i.test(value)) return null;
  return value;
}

const nameKey = (name) => name.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();

// Read only the static, public fields rather than executing a TypeScript file.
export function readGuests(source) {
  const file = ts.createSourceFile("guests.ts", source, ts.ScriptTarget.Latest, true);
  const declaration = file.statements.filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((entry) => entry.name.getText(file) === "GUESTS");
  if (!declaration?.initializer || !ts.isArrayLiteralExpression(declaration.initializer)) {
    throw new Error("Expected a static GUESTS array; no data written.");
  }
  return declaration.initializer.elements.map((entry) => {
    if (!ts.isObjectLiteralExpression(entry)) throw new Error("Unsupported guest entry.");
    const guest = {};
    for (const property of entry.properties) {
      if (!ts.isPropertyAssignment(property)) throw new Error("Unsupported guest field.");
      const key = property.name.getText(file).replace(/^["']|["']$/g, "");
      const value = property.initializer;
      if (["name", "handle", "avatar"].includes(key) && ts.isStringLiteral(value)) guest[key] = value.text;
      else if (key === "handle" && value.kind === ts.SyntaxKind.NullKeyword) guest.handle = null;
      else if (key === "editions" && ts.isArrayLiteralExpression(value) && value.elements.every(ts.isStringLiteral)) {
        guest.editions = value.elements.map((edition) => edition.text);
      } else throw new Error(`Unsupported guest field: ${key}.`);
    }
    if (!guest.name || !(guest.handle === null || typeof guest.handle === "string") || !guest.editions) {
      throw new Error("Incomplete guest entry.");
    }
    return guest;
  });
}

export function mergeGuests(existing, csv, edition) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(edition)) throw new Error("Edition must be YYYY-MM.");
  const [rawHeader, ...rows] = parseCsv(csv);
  if (!rawHeader) throw new Error("Empty CSV; no data written.");
  const header = rawHeader.map((value) => value.replace(/^\uFEFF/, "").trim());
  if (new Set(header).size !== header.length) throw new Error("Duplicate CSV headers; no data written.");
  const col = Object.fromEntries(header.map((value, index) => [value, index]));
  if (!("checked_in_at" in col)) throw new Error("Missing checked_in_at: RSVP/Going is not proof of attendance.");
  if (!("name" in col) && !("first_name" in col && "last_name" in col)) throw new Error("Missing guest name columns.");
  const guests = existing.map((guest) => ({ ...guest, editions: [...guest.editions] }));
  const report = { rows: rows.length, checkedIn: 0, newGuests: 0, addedMemberships: 0, alreadyRecorded: 0, issues: [] };
  const seen = new Map();
  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2;
    if (row.length !== header.length) throw new Error(`CSV row ${rowNumber} has the wrong number of fields.`);
    const checkIn = row[col.checked_in_at].trim();
    if (!checkIn) continue;
    if (!Number.isFinite(Date.parse(checkIn)) || /^(false|no|0|null)$/i.test(checkIn)) {
      throw new Error(`CSV row ${rowNumber} has an invalid checked_in_at value.`);
    }
    report.checkedIn++;
    const name = (row[col.name] || `${row[col.first_name] ?? ""} ${row[col.last_name] ?? ""}`).trim().replace(/\s+/g, " ");
    if (!name) { report.issues.push({ row: rowNumber, reason: "Missing name" }); continue; }
    const handle = normalizeHandle(row[col[HANDLE_COLUMN]]);
    // Email is used only in memory to distinguish duplicate export rows. It is
    // never included in output, reports, generated source, or committed files.
    const privateKey = row[col.email]?.trim().toLowerCase();
    const key = handle ? `x:${handle.toLowerCase()}` : `name:${nameKey(name)}`;
    const previous = seen.get(key);
    if (!handle && previous && previous.privateKey !== privateKey) {
      report.issues.push({ row: rowNumber, name, reason: "Same name without a shared handle; confirm identity" });
      continue;
    }
    const handles = handle ? guests.filter((guest) => guest.handle?.toLowerCase() === handle.toLowerCase()) : [];
    const names = guests.filter((guest) => nameKey(guest.name) === nameKey(name));
    let match;
    if (handles.length === 1) match = handles[0];
    else if (handles.length > 1 || names.length > 0) {
      // Never infer a changed/missing handle or a namesake match. Repeated
      // rows created in this import are safe; historical name matches need review.
      if (names.length === 1 && (
        (previous && previous.guest === names[0]) ||
        (!handle && !names[0].handle && names[0].editions.includes(edition))
      )) match = names[0];
      else {
        report.issues.push({ row: rowNumber, name, reason: "Name/handle match needs host confirmation" });
        continue;
      }
    }
    if (!match) {
      match = { name, handle, editions: [edition] };
      guests.push(match);
      report.newGuests++;
      report.addedMemberships++;
    } else if (!match.editions.includes(edition)) {
      match.editions.push(edition);
      report.addedMemberships++;
    } else report.alreadyRecorded++;
    seen.set(key, { privateKey, guest: match });
  }
  report.editionGuests = guests.filter((guest) => guest.editions.includes(edition)).length;
  return { guests, report };
}

export function renderGuests(guests) {
  const entries = guests.map((guest) => {
    const fields = [`name: ${JSON.stringify(guest.name)}`, `handle: ${JSON.stringify(guest.handle)}`];
    if (guest.avatar) fields.push(`avatar: ${JSON.stringify(guest.avatar)}`);
    fields.push(`editions: ${JSON.stringify(guest.editions)}`);
    return `  { ${fields.join(", ")} },`;
  }).join("\n");
  return `// Generated by scripts/import-guests.mjs from Lu.ma guest-list exports —\n// checked-in guests only. Re-run the script to refresh; edit by hand only\n// for one-off fixes.\nimport type { Attendee } from "./people";\n\nexport const GUESTS: Attendee[] = [\n${entries}\n];\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    let edition, csvPath, write = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--edition") edition = args[++i];
      else if (args[i] === "--csv") csvPath = args[++i];
      else if (args[i] === "--write") write = true;
      else throw new Error(`Unknown argument: ${args[i]}`);
    }
    if (!edition || !csvPath) throw new Error("Usage: node scripts/merge-guests.mjs --edition YYYY-MM --csv /private/tmp/guests.csv [--write]");
    const { guests, report } = mergeGuests(readGuests(readFileSync(GUEST_FILE, "utf8")), readFileSync(csvPath, "utf8"), edition);
    console.log(JSON.stringify({ edition, mode: write ? "write" : "preview", ...report }, null, 2));
    if (report.issues.length) throw new Error("Resolve the reported identities before importing; no data written.");
    if (write) { writeFileSync(GUEST_FILE, renderGuests(guests)); console.log("Merged public guest fields; historical editions preserved."); }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
