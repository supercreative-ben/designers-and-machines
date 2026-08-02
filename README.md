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

## Deploy

Designed to deploy on [Vercel](https://vercel.com/new): import the GitHub repo and deploy with the default Next.js settings.
