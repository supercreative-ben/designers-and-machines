"use client";

import * as React from "react";
import { getActiveLocations, type CodeLocation } from "@/lib/strudel";

/**
 * Live Strudel code overlay for the main page. Renders the current track's
 * source and, while the music plays, draws Strudel-playground-style boxes
 * around the notes that are sounding right now (their character ranges come
 * from the scheduler's haps — see getActiveLocations).
 */

type Part = { text: string; active: boolean };

function buildParts(code: string, ranges: CodeLocation[]): Part[] {
  if (ranges.length === 0) return [{ text: code, active: false }];
  const bounds = new Set([0, code.length]);
  for (const r of ranges) {
    bounds.add(Math.max(0, Math.min(code.length, r.start)));
    bounds.add(Math.max(0, Math.min(code.length, r.end)));
  }
  const sorted = [...bounds].sort((a, b) => a - b);
  const parts: Part[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    if (start >= end) continue;
    parts.push({
      text: code.slice(start, end),
      active: ranges.some((r) => r.start <= start && end <= r.end),
    });
  }
  return parts;
}

export default function CodeOverlay({
  code,
  visible,
}: {
  code: string;
  visible: boolean;
}) {
  const [ranges, setRanges] = React.useState<CodeLocation[]>([]);

  // Poll the scheduler every frame; re-render only when the set of playing
  // ranges actually changes.
  React.useEffect(() => {
    if (!visible) {
      setRanges([]);
      return;
    }
    let raf = 0;
    let lastKey = "";
    const tick = () => {
      const locs = getActiveLocations();
      const key = locs
        .map((l) => `${l.start}-${l.end}`)
        .sort()
        .join(",");
      if (key !== lastKey) {
        lastKey = key;
        setRanges(locs);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  if (!visible) return null;

  const parts = buildParts(code, ranges);

  return (
    <div className="pointer-events-none fixed inset-y-0 left-0 z-[15] flex w-[min(30vw,420px)] items-center pl-6">
      <pre className="pointer-events-auto max-h-[78vh] w-full overflow-y-auto whitespace-pre-wrap break-words font-mono text-[11.5px] leading-[1.7] text-[#6E6B67] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {parts.map((part, i) =>
          part.active ? (
            <span
              key={i}
              className="rounded-[3px] bg-white/[0.14] text-white shadow-[0_0_0_1.5px_rgba(255,255,255,0.85)]"
            >
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </pre>
    </div>
  );
}
