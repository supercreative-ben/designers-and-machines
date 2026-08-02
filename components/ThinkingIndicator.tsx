"use client";

import * as React from "react";

/*
 * Loading indicator in the style of fluidfunctionalism.com's ThinkingIndicator:
 * a small glyph morphing between a circle and an infinity loop, next to
 * shimmering text that cycles through status words. Implemented with SMIL
 * path morphing + CSS so it needs no animation library.
 */

const CIRCLE_A =
  "M 12 8 C 14.21 8 16 9.79 16 12 C 16 14.21 14.21 16 12 16 C 9.79 16 8 14.21 8 12 C 8 9.79 9.79 8 12 8 Z";

const INFINITY =
  "M 12 12 C 14 8.5 19 8.5 19 12 C 19 15.5 14 15.5 12 12 C 10 8.5 5 8.5 5 12 C 5 15.5 10 15.5 12 12 Z";

const CIRCLE_B =
  "M 12 16 C 14.21 16 16 14.21 16 12 C 16 9.79 14.21 8 12 8 C 9.79 8 8 9.79 8 12 C 8 14.21 9.79 16 12 16 Z";

const EASE = "0.42 0 0.58 1";

export default function ThinkingIndicator({
  words = ["Loading"],
  className = "",
}: {
  words?: string[];
  className?: string;
}) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (words.length < 2) return;
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      4000
    );
    return () => clearInterval(interval);
  }, [words.length]);

  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b));

  return (
    <div
      role="status"
      className={`flex items-center gap-2 text-[#8B8885] ${className}`}
    >
      <span className="sr-only">Loading…</span>
      <svg
        aria-hidden
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d={CIRCLE_A}>
          <animate
            attributeName="d"
            dur="6s"
            repeatCount="indefinite"
            calcMode="spline"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines={`${EASE};${EASE};${EASE};${EASE}`}
            values={`${CIRCLE_A};${INFINITY};${CIRCLE_B};${INFINITY};${CIRCLE_A}`}
          />
        </path>
      </svg>
      {/* Grid keeps the width pinned to the longest word so cycling doesn't
          shift the layout. */}
      <span
        aria-hidden
        className="inline-grid overflow-hidden text-[13px] font-medium"
      >
        <span className="invisible col-start-1 row-start-1">{longest}</span>
        <span
          key={words[index]}
          className="shimmer-text word-in col-start-1 row-start-1"
        >
          {words[index]}
        </span>
      </span>
    </div>
  );
}
