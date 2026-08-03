"use client";

import * as React from "react";

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

export default function TweetEmbed({ url }: { url: string }) {
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
