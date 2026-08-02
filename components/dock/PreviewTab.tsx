"use client";

import * as React from "react";
import Image from "next/image";
import { EVENTS, avatarUrl, projectImageUrl } from "@/data/events";
import type { TabId } from "./BottomDock";

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
  // Start on the latest month that has an announced lineup
  const lastAnnounced = React.useMemo(() => {
    const idx = EVENTS.findLastIndex(
      (e) => !e.upcoming && e.speakers.length > 0
    );
    return idx === -1 ? 0 : idx;
  }, []);
  const [index, setIndex] = React.useState(lastAnnounced);
  const event = EVENTS[index];

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 px-5 pb-4 pt-5 pr-14">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-medium text-white">{event.title}</h2>
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Previous month"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
              className="p-1 text-[#8B8885] transition-colors enabled:hover:text-white disabled:opacity-40"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              disabled={index === EVENTS.length - 1}
              onClick={() => setIndex((i) => i + 1)}
              className="p-1 text-white transition-colors enabled:hover:text-white disabled:opacity-40 disabled:text-[#8B8885]"
            >
              <Chevron direction="right" />
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-[#A5A19D]">{event.venue}</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-20">
        {event.upcoming ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
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
          <div className="flex flex-col gap-6">
            {event.speakers.map((speaker) => {
              const projectImage = projectImageUrl(speaker);
              return (
              <div key={speaker.handle} className="flex flex-col gap-3">
                <a
                  href={`https://x.com/${speaker.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3"
                >
                  <Image
                    src={avatarUrl(speaker.handle)}
                    alt={speaker.name}
                    width={34}
                    height={34}
                    className="size-[34px] rounded-full bg-[#55524F] object-cover"
                    unoptimized
                  />
                  <div>
                    <div className="text-sm font-medium text-white">
                      {speaker.name}
                    </div>
                    <div className="text-[13px] text-[#A5A19D] transition-colors group-hover:text-white">
                      @{speaker.handle}
                    </div>
                  </div>
                </a>
                {speaker.projectUrl && (
                  <a
                    href={speaker.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl bg-[#55524F] transition-opacity hover:opacity-90"
                  >
                    {projectImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={projectImage}
                        alt={`${speaker.name}'s project`}
                        className="aspect-[2/1] w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-[2/1] w-full" />
                    )}
                  </a>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
