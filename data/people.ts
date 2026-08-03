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
 * generated into data/guests.ts by scripts/import-guests.mjs — add a new
 * month's CSV there and re-run it after each dinner.
 */
const MORE_ATTENDEES: Attendee[] = [
  { name: "Ben Issen", handle: "ben_issen", editions: [] },
];

/**
 * X posts about the dinners, rendered as embedded tweets at the bottom of
 * the People tab. One status URL per entry, e.g.
 * "https://x.com/ben_issen/status/1234567890123456789".
 */
export const TWEETS: string[] = [];

// Demo givers count as attendees of their month even if the guest export
// missed them (hosts and speakers don't always register through Lu.ma).
const speakerAttendees: Attendee[] = EVENTS.flatMap((event) =>
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
