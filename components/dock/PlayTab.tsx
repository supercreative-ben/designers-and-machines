"use client";

import * as React from "react";
import { TRACKS } from "@/data/tracks";

export type RopeSettings = {
  color: string;
  gravity: number;
  radius: number;
  pushForce: number;
  friction: number;
  slack: number;
};

export type MusicState = {
  trackIndex: number;
  playing: boolean;
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

/** Dialkit-style dial: label inside the bar, monospace value on the right. */
function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative h-[52px] overflow-hidden rounded-[14px] bg-[#282523]">
      <div
        className="absolute inset-y-0 left-0 bg-[#4E4A47]"
        style={{ width: `${pct}%` }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
        <span className="text-[15px] text-[#EDEAE6]">{label}</span>
        <span className="font-mono text-[15px] tracking-tight text-[#EDEAE6]">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

export default function PlayTab({
  settings,
  onSettingsChange,
  music,
  onMusicChange,
}: {
  settings: RopeSettings;
  onSettingsChange: (settings: RopeSettings) => void;
  music: MusicState;
  onMusicChange: (music: MusicState) => void;
}) {
  const { trackIndex, playing } = music;
  const track = TRACKS[trackIndex];

  const togglePlay = () => {
    onMusicChange({ ...music, playing: !playing });
  };

  // Picking a theme changes the rope color and switches to its track:
  // blue -> One, purple -> Two, red -> Three, and so on.
  const pickTheme = (swatchIndex: number) => {
    onSettingsChange({ ...settings, color: SWATCHES[swatchIndex].value });
    onMusicChange({
      ...music,
      trackIndex: Math.min(swatchIndex, TRACKS.length - 1),
    });
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-5 pb-20 pt-5">
      <div className="flex flex-col gap-3">
        <SectionLabel>Theme</SectionLabel>
        <div className="flex items-center gap-2.5">
          {SWATCHES.map((swatch, i) => {
            const selected = settings.color === swatch.value;
            return (
              <button
                key={swatch.id}
                type="button"
                aria-label={`${swatch.id} theme`}
                onClick={() => pickTheme(i)}
                className={`size-7 rounded-full transition-transform hover:scale-110 ${
                  selected ? "ring-2 ring-white ring-offset-2 ring-offset-[#3A3735]" : ""
                }`}
                style={{ background: swatch.css }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Slider
          label="Gravity"
          value={settings.gravity}
          onChange={(gravity) => onSettingsChange({ ...settings, gravity })}
          min={0}
          max={20}
        />
        <Slider
          label="Radius"
          value={settings.radius}
          onChange={(radius) => onSettingsChange({ ...settings, radius })}
          min={10}
          max={300}
          step={5}
        />
        <Slider
          label="Push Force"
          value={settings.pushForce}
          onChange={(pushForce) => onSettingsChange({ ...settings, pushForce })}
          min={0}
          max={50}
        />
        <Slider
          label="Friction"
          value={settings.friction}
          onChange={(friction) => onSettingsChange({ ...settings, friction })}
          min={0}
          max={50}
        />
        <Slider
          label="Slack"
          value={settings.slack}
          onChange={(slack) => onSettingsChange({ ...settings, slack })}
          min={0}
          max={100}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SectionLabel>Music</SectionLabel>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause music" : "Play music"}
              className={`flex size-7 items-center justify-center rounded-full transition-colors ${
                playing
                  ? "bg-white text-black"
                  : "bg-white/[0.08] text-[#A5A19D] hover:text-white"
              }`}
            >
              {playing ? (
                <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                  <rect x="2" y="1.5" width="3" height="9" rx="1" fill="currentColor" />
                  <rect x="7" y="1.5" width="3" height="9" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                  <path d="M3.5 1.8v8.4c0 .5.55.8.98.54l6.6-4.2a.63.63 0 0 0 0-1.08l-6.6-4.2a.63.63 0 0 0-.98.54Z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
          <span className="text-sm text-[#A5A19D]">{track.name}</span>
        </div>
        <pre className="max-h-44 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words rounded-xl bg-[#1D1B1A] p-4 font-mono text-[13px] leading-relaxed text-[#8B8885]">
          {track.code}
        </pre>
      </div>
    </div>
  );
}
