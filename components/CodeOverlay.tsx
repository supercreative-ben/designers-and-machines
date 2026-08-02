"use client";

import * as React from "react";
import { getActiveLocations, type CodeLocation } from "@/lib/strudel";

/**
 * Live, editable Strudel code overlay for the main page. The source renders
 * full-height from the top left; notes currently sounding turn white (their
 * character ranges come from the scheduler's haps — see getActiveLocations).
 *
 * Editing works by stacking a transparent-text <textarea> over the <pre>
 * that paints the colors: both share identical font metrics and wrapping, so
 * the caret sits exactly on the painted text. Edits are debounced and then
 * hot-swap the running pattern.
 */

type Part = { text: string; active: boolean };

const CODE_CLASS =
  "w-full whitespace-pre-wrap break-words font-mono text-[11.5px] leading-[1.7]";

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
  onCodeChange,
}: {
  code: string;
  visible: boolean;
  onCodeChange: (code: string) => void;
}) {
  const [ranges, setRanges] = React.useState<CodeLocation[]>([]);
  const [draft, setDraft] = React.useState(code);
  const commitTimer = React.useRef<number | null>(null);

  // Track switches reset the draft (identical strings keep the caret).
  React.useEffect(() => {
    setDraft(code);
  }, [code]);

  React.useEffect(() => {
    return () => {
      if (commitTimer.current !== null) window.clearTimeout(commitTimer.current);
    };
  }, []);

  const handleChange = (value: string) => {
    setDraft(value);
    if (commitTimer.current !== null) window.clearTimeout(commitTimer.current);
    // Debounced commit hot-swaps the playing pattern via the parent.
    commitTimer.current = window.setTimeout(() => onCodeChange(value), 450);
  };

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

  const parts = buildParts(draft, ranges);

  return (
    <div className="fixed inset-y-0 left-0 z-[15] w-[min(30vw,420px)] overflow-y-auto py-5 pl-6 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="relative">
        <pre aria-hidden className={`${CODE_CLASS} text-[#6E6B67]`}>
          {parts.map((part, i) =>
            part.active ? (
              <span key={i} className="text-white">
                {part.text}
              </span>
            ) : (
              <span key={i}>{part.text}</span>
            )
          )}
          {/* Keeps the sizer one line taller than a trailing newline */}
          {"\n"}
        </pre>
        <textarea
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Strudel code"
          className={`${CODE_CLASS} absolute inset-0 h-full resize-none overflow-hidden bg-transparent text-transparent caret-white focus:outline-none`}
        />
      </div>
    </div>
  );
}
