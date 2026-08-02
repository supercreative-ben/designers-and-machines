"use client";

import * as React from "react";
import { TRACKS } from "@/data/tracks";
import { playTrack, stopMusic } from "@/lib/strudel";

export type RopeSettings = {
  color: string;
  gravity: number;
};

const SWATCHES: { id: string; value: string; css: string }[] = [
  { id: "blue", value: "#2E2EFF", css: "#2E2EFF" },
  { id: "purple", value: "#8B30FF", css: "#8B30FF" },
  { id: "red", value: "#FF4433", css: "#FF4433" },
  { id: "orange", value: "#FF8324", css: "#FF8324" },
  { id: "yellow", value: "#FFD84D", css: "#FFD84D" },
  {
    id: "rainbow",
    value: "rainbow",
    css: "conic-gradient(from 220deg, #FF4433, #FFD84D, #2E2EFF, #FF48C4, #FF4433)",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[15px] font-medium text-white">{children}</div>;
}

function GravitySlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const min = 0;
  const max = 20;
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative h-11 overflow-hidden rounded-xl bg-[#1D1B1A]">
      <div
        className="absolute inset-y-0 left-0 rounded-xl bg-white"
        style={{ width: `${pct}%` }}
      />
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-white mix-blend-difference">
        {value}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Gravity"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
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

export default function PlayTab({
  settings,
  onSettingsChange,
}: {
  settings: RopeSettings;
  onSettingsChange: (settings: RopeSettings) => void;
}) {
  const [trackIndex, setTrackIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const track = TRACKS[trackIndex];

  const switchTrack = async (nextIndex: number) => {
    setTrackIndex(nextIndex);
    if (playing) {
      await playTrack(TRACKS[nextIndex].code);
    }
  };

  const togglePlay = async () => {
    if (playing) {
      setPlaying(false);
      await stopMusic();
    } else {
      setPlaying(true);
      await playTrack(track.code);
    }
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-5 pb-20 pt-5">
      <div className="flex flex-col gap-3">
        <SectionLabel>Ties</SectionLabel>
        <div className="flex items-center gap-2.5">
          {SWATCHES.map((swatch) => {
            const selected = settings.color === swatch.value;
            return (
              <button
                key={swatch.id}
                type="button"
                aria-label={`${swatch.id} ties`}
                onClick={() =>
                  onSettingsChange({ ...settings, color: swatch.value })
                }
                className={`size-7 rounded-full transition-transform hover:scale-110 ${
                  selected ? "ring-2 ring-white ring-offset-2 ring-offset-[#3A3735]" : ""
                }`}
                style={{ background: swatch.css }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionLabel>Gravity</SectionLabel>
        <GravitySlider
          value={settings.gravity}
          onChange={(gravity) => onSettingsChange({ ...settings, gravity })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionLabel>Music</SectionLabel>
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Previous track"
              disabled={trackIndex === 0}
              onClick={() => switchTrack(trackIndex - 1)}
              className="p-1 text-[#8B8885] transition-colors enabled:hover:text-white disabled:opacity-40"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next track"
              disabled={trackIndex === TRACKS.length - 1}
              onClick={() => switchTrack(trackIndex + 1)}
              className="p-1 text-white transition-colors enabled:hover:text-white disabled:opacity-40 disabled:text-[#8B8885]"
            >
              <Chevron direction="right" />
            </button>
          </div>
        </div>
        <pre className="overflow-x-hidden whitespace-pre-wrap break-words rounded-xl bg-[#1D1B1A] p-4 font-mono text-[13px] leading-relaxed text-[#8B8885]">
          {track.code}
        </pre>
        <button
          type="button"
          onClick={togglePlay}
          className={`self-start rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
            playing
              ? "bg-white text-black"
              : "bg-[#1D1B1A] text-[#A5A19D] hover:text-white"
          }`}
        >
          {playing ? `Stop — ${track.name}` : `Play ${track.name}`}
        </button>
      </div>
    </div>
  );
}
