"use client";

import * as React from "react";
import { ATTENDEES, TWEETS } from "@/data/people";
import { avatarUrl } from "@/data/events";
import type { TabId } from "./BottomDock";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        createTweet: (
          id: string,
          el: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement | undefined>;
      };
    };
  }
}

let widgetsScript: Promise<void> | null = null;

/** Loads X's widgets.js once, shared by every embedded tweet. */
function loadWidgets(): Promise<void> {
  if (!widgetsScript) {
    widgetsScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("widgets.js failed to load"));
      document.head.appendChild(script);
    });
  }
  return widgetsScript;
}

function TweetEmbed({ url }: { url: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    const id = url.match(/status(?:es)?\/(\d+)/)?.[1];
    if (!el || !id) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    loadWidgets()
      .then(() =>
        window.twttr?.widgets.createTweet(id, el, {
          theme: "dark",
          conversation: "none",
          dnt: true,
        })
      )
      .then((widget) => {
        if (!cancelled && !widget) setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      el.replaceChildren();
    };
  }, [url]);

  if (failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block truncate rounded-xl bg-white/[0.04] px-4 py-3 text-[13px] text-[#A5A19D] transition-colors hover:text-white"
      >
        {url.replace(/^https?:\/\//, "")}
      </a>
    );
  }
  return <div ref={ref} className="[&_iframe]:!max-w-full" />;
}

export default function PeopleTab({
  onNavigate,
}: {
  onNavigate: (tab: TabId) => void;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <header className="px-5 pb-4 pt-5">
        <h2 className="pr-12 text-[15px] font-medium text-white">People</h2>
        <p className="mt-1 text-sm text-[#A5A19D]">
          {ATTENDEES.length} designers have come to dinner
        </p>
      </header>

      <div className="px-5 pb-20">
        <div className="grid grid-cols-5 gap-x-3 gap-y-4">
          {ATTENDEES.map((person) => {
            const avatar =
              person.avatar ??
              (person.handle ? avatarUrl(person.handle) : null);
            const face = avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={person.name}
                loading="lazy"
                decoding="async"
                className="size-[44px] rounded-full bg-[#55524F] object-cover transition-transform duration-200 group-hover:scale-110"
              />
            ) : (
              // Guests who didn't share an X handle get an initial
              <span className="flex size-[44px] items-center justify-center rounded-full bg-[#55524F] text-sm font-medium text-[#D8D5D1]">
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

        <h3 className="mb-3 mt-8 text-sm font-medium text-white">
          Word on the street
        </h3>
        {TWEETS.length === 0 ? (
          <div className="flex h-[120px] w-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03]">
            <span className="px-6 text-center text-[13px] text-[#8B8885]">
              Posts about the dinners coming soon
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {TWEETS.map((url) => (
              <TweetEmbed key={url} url={url} />
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-sm leading-relaxed text-[#A5A19D]">
          Want to be part of it?{" "}
          <button
            type="button"
            onClick={() => onNavigate("join")}
            className="font-medium underline underline-offset-4 transition-colors hover:text-white"
          >
            Request to join the next dinner.
          </button>
        </p>
      </div>
    </div>
  );
}
