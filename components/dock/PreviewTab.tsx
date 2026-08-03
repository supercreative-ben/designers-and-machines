"use client";

import * as React from "react";
import Image from "next/image";
import { EVENTS, avatarUrl, projectImageUrl } from "@/data/events";
import { ATTENDEES } from "@/data/people";
import TweetEmbed from "../TweetEmbed";
import type { TabId } from "./BottomDock";

/** Stable per-browser id so likes survive reloads and can be undone. */
function visitorId(): string {
  let id = localStorage.getItem("dm-visitor-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("dm-visitor-id", id);
  }
  return id;
}

function LikeButton({
  count,
  liked,
  onToggle,
}: {
  count: number;
  liked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={liked ? "Unlike project" : "Like project"}
      aria-pressed={liked}
      className={`flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 py-2 text-sm font-medium transition-colors ${
        liked ? "text-[#EB5545]" : "text-[#D8D5D1] hover:text-white"
      }`}
    >
      <svg viewBox="0 0 16 16" className="size-[15px]" aria-hidden>
        <path
          d="M8 13.8 2.9 8.9a3.4 3.4 0 0 1 0-4.9 3.6 3.6 0 0 1 5 0l.1.1.1-.1a3.6 3.6 0 0 1 5 0 3.4 3.4 0 0 1 0 4.9L8 13.8Z"
          fill="currentColor"
        />
      </svg>
      {count}
    </button>
  );
}

/** Tight grid of everyone who came to this month's dinner. */
function AttendeeGrid({ eventId }: { eventId: string }) {
  const attendees = React.useMemo(
    () => ATTENDEES.filter((a) => a.editions.includes(eventId)),
    [eventId]
  );
  if (attendees.length === 0) return null;
  return (
    <div className="grid grid-cols-6 gap-x-2 gap-y-2.5">
      {attendees.map((person) => {
        const avatar =
          person.avatar ?? (person.handle ? avatarUrl(person.handle) : null);
        const face = avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={person.name}
            loading="lazy"
            decoding="async"
            className="size-10 rounded-full bg-[#55524F] object-cover transition-transform duration-200 group-hover:scale-110"
          />
        ) : (
          // Guests who didn't share an X handle get an initial
          <span className="flex size-10 items-center justify-center rounded-full bg-[#55524F] text-sm font-medium text-[#D8D5D1]">
            {person.name.charAt(0)}
          </span>
        );
        if (!person.handle) {
          return (
            <span
              key={person.name}
              title={person.name}
              className="flex justify-center"
            >
              {face}
            </span>
          );
        }
        return (
          <a
            key={person.handle}
            href={`https://x.com/${person.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`${person.name} — @${person.handle}`}
            className="group flex justify-center"
          >
            {face}
          </a>
        );
      })}
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
      <path
        d={direction === "left" ? "M10 3L5 8L10 13" : "M6 3L11 8L6 13"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PreviewTab({
  onNavigate,
}: {
  onNavigate: (tab: TabId) => void;
}) {
  // Start on the latest past event with an announced lineup — the upcoming
  // month is one click forward.
  const defaultIndex = React.useMemo(() => {
    const idx = EVENTS.findLastIndex(
      (e) => !e.upcoming && e.speakers.length > 0
    );
    return idx === -1 ? EVENTS.length - 1 : idx;
  }, []);
  const [index, setIndex] = React.useState(defaultIndex);
  const event = EVENTS[index];

  // Public like counts, keyed by "eventId/handle". Every project shows at
  // least the 1 baseline like until the real counts load.
  const [likes, setLikes] = React.useState<{
    counts: Record<string, number>;
    liked: Set<string>;
  }>({ counts: {}, liked: new Set() });
  // Keys the visitor toggled this session — they win over a late-arriving
  // initial fetch, so a slow GET can't undo an optimistic like.
  const localTogglesRef = React.useRef(new Map<string, boolean>());

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/likes?visitor=${visitorId()}`)
      .then((r) => r.json())
      .then((data: { counts: Record<string, number>; liked: string[] }) => {
        if (cancelled) return;
        const liked = new Set(data.liked);
        const counts = { ...data.counts };
        for (const [key, isLiked] of localTogglesRef.current) {
          if (isLiked && !liked.has(key)) {
            liked.add(key);
            counts[key] = (counts[key] ?? 1) + 1;
          } else if (!isLiked && liked.has(key)) {
            liked.delete(key);
            counts[key] = Math.max(1, (counts[key] ?? 1) - 1);
          }
        }
        setLikes({ counts, liked });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleLike = (key: string) => {
    const wasLiked = likes.liked.has(key);
    localTogglesRef.current.set(key, !wasLiked);
    // Optimistic flip; the POST response settles the real count.
    setLikes((prev) => {
      const liked = new Set(prev.liked);
      const counts = { ...prev.counts };
      if (wasLiked) liked.delete(key);
      else liked.add(key);
      counts[key] = Math.max(1, (counts[key] ?? 1) + (wasLiked ? -1 : 1));
      return { counts, liked };
    });
    fetch("/api/likes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, visitor: visitorId(), liked: !wasLiked }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { count: number } | null) => {
        if (data)
          setLikes((prev) => ({
            ...prev,
            counts: { ...prev.counts, [key]: data.count },
          }));
      })
      .catch(() => {});
  };

  // Same round button style as the card's close button
  const navButtonClass =
    "flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-[#A5A19D] transition-colors enabled:hover:text-white disabled:opacity-40";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="relative shrink-0 px-5 pb-4 pt-5">
        {/* Only the title needs to clear the nav buttons; the venue line
            below them can use the full card width. */}
        <h2 className="pr-[120px] text-[15px] font-medium text-white">
          {event.title}
        </h2>
        <p className="mt-1 text-sm text-[#A5A19D]">{event.venue}</p>
        {/* Pinned right so the buttons never shift with the title's width */}
        <div className="absolute right-[54px] top-3.5 flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous month"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
            className={navButtonClass}
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={index === EVENTS.length - 1}
            onClick={() => setIndex((i) => i + 1)}
            className={navButtonClass}
          >
            <Chevron direction="right" />
          </button>
        </div>
      </header>

      <div className="flex-1 px-5 pb-20">
        {event.upcoming ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            {event.description?.map((paragraph) => (
              <p
                key={paragraph}
                className="max-w-[240px] text-sm leading-relaxed text-[#EDEAE6]"
              >
                {paragraph}
              </p>
            ))}
            <p className="max-w-[220px] text-sm leading-relaxed text-[#A5A19D]">
              The lineup isn&apos;t announced yet. Want to show what
              you&apos;ve been making with machines?
            </p>
            <button
              type="button"
              onClick={() => onNavigate("join")}
              className="text-sm font-medium text-[#A5A19D] underline underline-offset-4 transition-colors hover:text-white"
            >
              Demo at the next dinner
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-9">
            <AttendeeGrid eventId={event.id} />
            {/* Data order, not like order — resorting after likes load made
                the cards jump around. */}
            {event.speakers.map((speaker) => {
              const projectImage = projectImageUrl(speaker);
              const likeKey = `${event.id}/${speaker.handle}`;
              return (
              <div key={speaker.handle} className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <a
                    href={`https://x.com/${speaker.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-w-0 items-center gap-3"
                  >
                    <Image
                      src={avatarUrl(speaker.handle)}
                      alt={speaker.name}
                      width={34}
                      height={34}
                      loading="lazy"
                      className="size-[34px] rounded-full bg-[#55524F] object-cover"
                      unoptimized
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">
                        {speaker.name}
                      </div>
                      <div className="truncate text-[13px] text-[#A5A19D] transition-colors group-hover:text-white">
                        @{speaker.handle}
                      </div>
                    </div>
                  </a>
                  <LikeButton
                    count={likes.counts[likeKey] ?? 1}
                    liked={likes.liked.has(likeKey)}
                    onToggle={() => toggleLike(likeKey)}
                  />
                </div>
                {speaker.projectUrl && (
                  <a
                    href={speaker.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl bg-[#55524F] transition-opacity hover:opacity-90"
                  >
                    {projectImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <Image
                        src={projectImage}
                        alt={`${speaker.name}'s project`}
                        width={560}
                        height={344}
                        loading="lazy"
                        className="h-[172px] w-full object-cover"
                      />
                    ) : (
                      <div className="h-[172px] w-full" />
                    )}
                  </a>
                )}
              </div>
              );
            })}

            {/* Featured photo from the dinner itself */}
            {event.featuredImage ? (
              <Image
                src={event.featuredImage}
                alt={`Photo from ${event.title}`}
                width={560}
                height={344}
                loading="lazy"
                className="h-[172px] w-full rounded-xl bg-[#55524F] object-cover"
              />
            ) : (
              <div className="flex h-[172px] w-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03]">
                <span className="text-[13px] text-[#8B8885]">
                  Dinner photo coming soon
                </span>
              </div>
            )}

            {/* Testimonials from X about this dinner */}
            {event.tweets && event.tweets.length > 0 && (
              <div className="flex flex-col gap-3">
                {event.tweets.map((url) => (
                  <TweetEmbed key={url} url={url} />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-center text-sm leading-relaxed text-[#A5A19D]">
                Want to be part of it?{" "}
                <button
                  type="button"
                  onClick={() => onNavigate("join")}
                  className="font-medium underline underline-offset-4 transition-colors hover:text-white"
                >
                  Request to join.
                </button>
              </p>
              <p className="text-center text-sm leading-relaxed text-[#A5A19D]">
                Want to host a future dinner?{" "}
                <a
                  href="https://twitter.com/ben_issen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-4 transition-colors hover:text-white"
                >
                  Contact Ben directly.
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
