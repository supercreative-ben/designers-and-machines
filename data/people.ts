import { EVENTS } from "./events";
import { GUESTS } from "./guests";

export type Attendee = {
  name: string;
  /** X (Twitter) handle without the @ — null when the guest didn't share one */
  handle: string | null;
  /** Local compressed avatar, downloaded by scripts/import-guests.mjs */
  avatar?: string;
  /** Dinner editions attended, as event ids like "2026-03" */
  editions: string[];
};

/**
 * Attendees who aren't in the Lu.ma guest exports. The bulk of the list is
 * generated into data/guests.ts. Merge a new month's checked-in CSV with
 * scripts/merge-guests.mjs so earlier attendance is preserved.
 */
const MORE_ATTENDEES: Attendee[] = [
  { name: "Ben Issen", handle: "ben_issen", editions: [] },
];

// Confirmed demo givers count as attendees even if the guest export missed
// them. Scheduled speakers do not count until the host publishes the recap.
const speakerAttendees: Attendee[] = EVENTS.filter((event) => !event.upcoming).flatMap((event) =>
  event.speakers.map(({ name, handle }) => ({
    name,
    handle,
    editions: [event.id],
  }))
);

const byKey = new Map<string, Attendee>();
for (const attendee of [...GUESTS, ...speakerAttendees, ...MORE_ATTENDEES]) {
  const key = (attendee.handle ?? attendee.name).toLowerCase();
  const existing = byKey.get(key);
  if (!existing) {
    byKey.set(key, { ...attendee, editions: [...attendee.editions] });
    continue;
  }
  if (!existing.avatar && attendee.avatar) existing.avatar = attendee.avatar;
  for (const edition of attendee.editions) {
    if (!existing.editions.includes(edition)) existing.editions.push(edition);
  }
}

export const ATTENDEES: Attendee[] = [...byKey.values()];
