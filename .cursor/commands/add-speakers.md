# Add speakers to a Designers and Machines lineup

The user will give you a month (e.g. "April 2026 hosted at Rox") and a list of
speakers, usually as `<project url> <person name>` pairs. Turn them into
entries in `data/events.ts`. Everything else (X avatar, project OG image) is
fetched automatically at runtime — never download or hardcode images.

## Steps

1. **Find each person's X handle.** Search the web, but always verify against
   a primary source: their own website (curl it and grep for `x.com/` or
   `twitter.com/` links, or `twitter:creator` meta tags) or the project site
   itself. Do not guess handles.
2. **Confirm the project page has an OG image**:
   `curl -sL <url> | rg -io '<meta[^>]*og:image[^>]*>'`
   If a page has none, find a suitable image URL and set `projectImage` as a
   manual override on that speaker.
3. **Edit `data/events.ts`** only:
   - If the month exists as the `upcoming: true` entry, fill in its
     `speakers` and remove the `upcoming` flag, then append the next month as
     the new upcoming entry (same venue unless told otherwise).
   - Speaker shape: `{ name, handle, projectUrl }` — handle without the `@`.
   - Keep events ordered oldest → newest.
4. **Verify in the browser** (dev server usually runs on port 3001): open the
   Preview tab and check every avatar loads, every project card shows its OG
   image, and both links open. `https://unavatar.io/x/<handle>` should return
   the person's real profile picture — if it returns a placeholder, the
   handle is wrong.
5. **Commit and push** to `main` (Vercel deploys automatically).
