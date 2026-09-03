# Designers and Machines

Monthly demo dinners in SF for designers who explore how we create with machines.

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

### Chat sign-in (X)

Posting in the chat requires signing in with X. Set `AUTH_SECRET` (any long random string) plus credentials from your [X developer app](https://developer.x.com/en/portal/dashboard), with `<site>/api/auth/x/callback` registered as a callback URL:

- **Preferred — OAuth 1.0a**: `X_CONSUMER_KEY` / `X_CONSUMER_SECRET` (the "Consumer Keys" on the app's Keys & Tokens page). This flow gets the user's identity from the sign-in itself and avoids `GET /2/users/me`, which is heavily rate-limited on the free API tier.
- **Fallback — OAuth 2.0**: `X_CLIENT_ID` / `X_CLIENT_SECRET`.
