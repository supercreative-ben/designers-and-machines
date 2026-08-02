export type Speaker = {
  name: string;
  /** X (Twitter) handle without the @ */
  handle: string;
  /** Link to the project they demoed */
  projectUrl?: string;
  /** Open Graph image for the project (absolute URL or /public path) */
  projectImage?: string;
};

export type DemoEvent = {
  id: string;
  title: string;
  venue: string;
  /** Upcoming events show a call-to-action instead of the lineup. */
  upcoming?: boolean;
  speakers: Speaker[];
};

// Sample data — replace with the real lineups.
// Ordered oldest to newest; the last entry can be the upcoming month.
export const EVENTS: DemoEvent[] = [
  {
    id: "2026-02",
    title: "February 2026 lineup",
    venue: "Hosted at Rox in San Francisco",
    speakers: [
      {
        name: "Ben Issen",
        handle: "ben_issen",
        projectUrl: "https://example.com",
      },
    ],
  },
  {
    id: "2026-03",
    title: "March 2026 lineup",
    venue: "Hosted at Rox in San Francisco",
    speakers: [
      {
        name: "Ben Issen",
        handle: "ben_issen",
        projectUrl: "https://example.com",
      },
      {
        name: "Pablo Stanley",
        handle: "pablo",
        projectUrl: "https://example.com",
      },
    ],
  },
  {
    id: "2026-04",
    title: "April 2026",
    venue: "Hosted at Rox in San Francisco",
    upcoming: true,
    speakers: [],
  },
];

export function avatarUrl(handle: string) {
  return `https://unavatar.io/x/${handle}`;
}
