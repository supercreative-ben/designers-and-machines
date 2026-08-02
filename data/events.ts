export type Speaker = {
  name: string;
  /** X (Twitter) handle without the @ */
  handle: string;
  /** Link to the project they demoed */
  projectUrl?: string;
  /**
   * Optional manual override for the project card image. When omitted, the
   * project's own Open Graph image is fetched automatically via /api/og.
   */
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

/**
 * Adding a month = one entry here. Adding a speaker = name, X handle, and
 * project URL — the avatar comes from their X profile (unavatar.io) and the
 * project card image from the project page's Open Graph tags, automatically.
 * Ordered oldest to newest; the last entry can be the upcoming month.
 */
export const EVENTS: DemoEvent[] = [
  {
    id: "2026-03",
    title: "March 2026 lineup",
    venue: "Hosted at Rox in San Francisco",
    speakers: [
      {
        name: "Lele Zhang",
        handle: "CherrilynnZ",
        projectUrl: "https://lelezhang.design/draw",
      },
      {
        name: "Pablo Stanley",
        handle: "pablostanley",
        projectUrl: "https://efecto.app/",
      },
      {
        name: "Micka Touillaud",
        handle: "micka_design",
        projectUrl: "https://www.fluidfunctionalism.com/",
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

/** Project card image: manual override, or the page's own OG image. */
export function projectImageUrl(speaker: Speaker): string | null {
  if (speaker.projectImage) return speaker.projectImage;
  if (speaker.projectUrl)
    return `/api/og?url=${encodeURIComponent(speaker.projectUrl)}`;
  return null;
}
