import { EVENTS } from "./events";

export type Attendee = {
  name: string;
  /** X (Twitter) handle without the @ */
  handle: string;
};

/**
 * Everyone who has attended a dinner. Past demo givers are included
 * automatically from the lineups; paste additional attendees below —
 * one { name, handle } per person.
 */
const MORE_ATTENDEES: Attendee[] = [
  { name: "Ben Issen", handle: "ben_issen" },
];

/**
 * X posts about the dinners, rendered as embedded tweets at the bottom of
 * the People tab. One status URL per entry, e.g.
 * "https://x.com/ben_issen/status/1234567890123456789".
 */
export const TWEETS: string[] = [];

const speakerAttendees: Attendee[] = EVENTS.flatMap((event) =>
  event.speakers.map(({ name, handle }) => ({ name, handle }))
);

const seen = new Set<string>();
export const ATTENDEES: Attendee[] = [
  ...MORE_ATTENDEES,
  ...speakerAttendees,
].filter((attendee) => {
  const key = attendee.handle.toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
