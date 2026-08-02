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
  /** Shown on the event's Lineup card — format, the why of the event, etc.
   * One paragraph per array entry. */
  description?: string[];
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
      {
        name: "Sam Gorman",
        handle: "gormankind",
        projectUrl: "https://rivet.design/",
      },
      {
        name: "Eve Bouffard",
        handle: "eve_bouff",
        projectUrl: "https://www.ycombinator.com/",
      },
      {
        name: "Cynthia Chen",
        handle: "yescynfria",
        projectUrl: "https://hellothisis.cc/",
        // hellothisis.cc has no Open Graph image, so we ship a screenshot.
        projectImage: "/projects/hellothisis.png",
      },
    ],
  },
  {
    id: "2026-04",
    title: "April 2026 lineup",
    venue: "Hosted at Rox in San Francisco",
    speakers: [
      {
        name: "Daniel Farrell",
        handle: "D_R_Farrell",
        projectUrl: "https://onlook.com/",
        // onlook.com has no Open Graph image, so we ship a screenshot.
        projectImage: "/projects/onlook.png",
      },
      {
        name: "Harshit Beniwal",
        handle: "harshitbeni",
        projectUrl: "https://harshitbeni.com/apps",
      },
      {
        name: "Alex Burdin",
        handle: "buburdin",
        projectUrl: "https://handofyou.app/",
      },
    ],
  },
  {
    id: "2026-05",
    title: "May 2026 lineup",
    venue: "Hosted at Rox in San Francisco",
    // Two more demos that night ("Kyle" — Vizcom, and "Chris" — AI chat
    // prototype) are pending identity confirmation before being listed.
    speakers: [
      {
        name: "ML Howell",
        handle: "marlouiise",
        projectUrl: "https://doodle.mary-louise.com/",
        // No Open Graph image on the page, so we ship a screenshot.
        projectImage: "/projects/doodles.png",
      },
      {
        name: "Omar Abdul-Rahim",
        handle: "omarabdulrahim_",
        projectUrl: "https://avec.ai/",
      },
      {
        name: "Evil Rabbit",
        handle: "evilrabbit_",
        projectUrl: "https://vercel.com/geist",
      },
      {
        // Demoed the Composio logo agent; the case study page beats the raw
        // gallery (logos.composio.dev), which renders empty without JS data.
        name: "Malay Vasa",
        handle: "MalayVasa",
        projectUrl: "https://www.malayvasa.com/work/logo-agent",
        projectImage: "/projects/logo-agent.png",
      },
      {
        name: "Roy Jad",
        handle: "jad2222222",
        projectUrl: "https://humanoid-index.com/",
      },
    ],
  },
  {
    id: "2026-06",
    title: "June 2026 lineup",
    venue: "Hosted at PostHog in San Francisco",
    speakers: [
      {
        name: "Sam Gorman",
        handle: "gormankind",
        projectUrl: "https://rivet.design/",
      },
      {
        name: "Flora Guo",
        handle: "floguo",
        projectUrl: "https://www.floguo.com/",
      },
      {
        // Protodash is Stripe-internal; this links its public write-up.
        name: "Owen Williams",
        handle: "ow",
        projectUrl:
          "https://www.chatprd.ai/how-i-ai/stripe-owen-williams-on-buildling-internal-prototyping-studio",
      },
      {
        name: "Pierre-Louis Soulié",
        handle: "plsoulie",
        projectUrl: "https://nanocorp.so",
      },
      {
        name: "Evan Pun",
        handle: "evanpun",
        projectUrl: "https://ghostpanel.design/",
      },
    ],
  },
  {
    id: "2026-08",
    title: "August 2026",
    venue: "San Francisco",
    upcoming: true,
    description: ["5 demos, 5 min each. No slides."],
    speakers: [],
  },
];

/** X profile picture, proxied and cached by our own /api/avatar route. */
export function avatarUrl(handle: string) {
  return `/api/avatar?handle=${encodeURIComponent(handle)}`;
}

/** Project card image: manual override, or the page's own OG image. */
export function projectImageUrl(speaker: Speaker): string | null {
  if (speaker.projectImage) return speaker.projectImage;
  if (speaker.projectUrl)
    return `/api/og?url=${encodeURIComponent(speaker.projectUrl)}`;
  return null;
}
