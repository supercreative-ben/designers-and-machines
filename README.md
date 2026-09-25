# Designers and Machines

Monthly demo dinners in SF for designers who explore how we create with machines.

## Hosting an event

Start with the [Designers & Machines Event Runbook](EVENT-RUNBOOK.md) for event preparation, roles, the run of show, venue requirements, and organizer handoff. It includes the September 24, 2026 onboarding notes and pending items for edition #6.

The morning after an event, use the [day-after agent prompt and checklist](EVENT-RUNBOOK.md#next-day-website-update) to update checked-in attendees, actual demos, recap tweets, and the next month's Luma registration link. The agent will ask for missing inputs.

A single-screen site built with [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS). The hero features an interactive canvas — a red rope hangs between the two silhouettes, reacts to the cursor, and clicking twice anywhere creates new ropes.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `app/` — layout, page, and global styles
- `components/Hero.tsx` — hero layout: silhouettes, ampersand, text, and nav
- `components/GravityLines.tsx` — canvas rope physics (verlet integration), ported from a Framer code component
- `components/dock/` — bottom pill nav and the expanding card with the Preview / Play / Chat / Join tabs
- `data/events.ts` — monthly demo lineups shown in the Preview tab (sample data, replace with real lineups)
- `data/tracks.ts` — Strudel patterns for the Play tab's music section
- `data/site.ts` — site config (set `LUMA_EMBED_URL` to enable the Join tab embed)

## Deploy

Designed to deploy on [Vercel](https://vercel.com/new): import the GitHub repo and deploy with the default Next.js settings.

## Profile photos

Known profile photos are compressed JPEGs in `public/people/`, served by Vercel with each deployment. Chat, dinner guests, speakers, and the homepage use the same saved-photo inventory in `data/avatars.ts`. Run `node scripts/sync-avatar-manifest.mjs` after adding photos; the guest importer also runs it automatically.

For new profiles, `/api/avatar` reads the existing private Vercel Blob store under `avatars/v1/` before consulting X. Successful images are decoded, resized to 96×96, and saved without overwriting an existing copy. Sign-in saves the authenticated profile photo while its source is available. The browser uses first-party URLs and falls back to initials if any image fails. This uses the same `BLOB_READ_WRITE_TOKEN` as chat storage.

September 25 repair: recovered 12 additional photos, including `luorui2025` and `shahdappp`; all 29 current chat participants have local copies. Public lookups could not resolve `pallavibenawri`, `awwsillylife17`, `fleeting_land`, `yanatweets`, or `seansmithbuilds`; keep initials until a verified photo or updated handle is supplied.

Run `node --test scripts/verify-avatar-storage.mjs` for storage and failure-handling checks.
