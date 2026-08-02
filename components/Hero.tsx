"use client";

import * as React from "react";
import GravityLines from "./GravityLines";

const STAGE_WIDTH = 755;
const STAGE_HEIGHT = 312;

const ROPE_ANCHORS: [string, string] = ["rope-anchor-a", "rope-anchor-b"];

const NAV_ITEMS = ["Preview", "Play", "Chat", "Join"] as const;

function HeadShape(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 290 262" fill="none" aria-hidden {...props}>
      <path
        d="M130 0
           C58 0 0 58 0 130
           L0 148
           C0 164 13 177 29 177
           L62 177
           L62 250
           C62 257 67 262 74 262
           L223 262
           C230 262 235 257 235 250
           L235 205
           C248 203 260 197 269 188
           C283 174 290 157 290 139
           C290 60 218 0 130 0
           Z"
        fill="#4A4744"
      />
    </svg>
  );
}

function BlockShape(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 245 262" fill="none" aria-hidden {...props}>
      <path d="M0 0 H245 V157 H145 V262 H0 Z" fill="#4A4744" />
    </svg>
  );
}

export default function Hero() {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const update = () =>
      setScale(Math.min(1, (window.innerWidth - 32) / STAGE_WIDTH));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section className="relative flex h-dvh min-h-[560px] flex-col overflow-hidden">
      {/* Artwork stage */}
      <div className="flex min-h-0 flex-1 items-center justify-center pt-16">
        <div
          className="relative shrink-0"
          style={{
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-serif text-[420px] leading-none text-[#2B2826]"
          >
            &amp;
          </span>
          <HeadShape className="absolute left-0 top-0 h-[262px] w-[290px]" />
          <BlockShape className="absolute right-0 top-0 h-[262px] w-[245px]" />
          {/* Rope attachment points (measured by GravityLines) */}
          <div
            id={ROPE_ANCHORS[0]}
            className="absolute size-px"
            style={{ left: 118, top: 85 }}
          />
          <div
            id={ROPE_ANCHORS[1]}
            className="absolute size-px"
            style={{ left: 638, top: 92 }}
          />
        </div>
      </div>

      {/* Text + nav */}
      <div className="pointer-events-none relative z-20 flex flex-col items-center px-6 pb-10">
        <h1 className="text-sm font-medium text-[#EDEAE6]">
          Designers and Machines
        </h1>
        <p className="mt-1.5 max-w-[290px] text-center text-sm leading-snug text-[#8B8885]">
          Monthly demo dinners in SF for designers who explore how we create
          with machines.
        </p>
        <nav className="pointer-events-auto mt-6 flex items-center rounded-full border border-white/[0.06] bg-[#2A2725]/90 px-2 py-1.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-full px-5 py-1.5 text-[13px] text-[#A29E9A] transition-colors hover:text-[#EDEAE6]"
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Interactive rope layer (above artwork, below text/nav) */}
      <GravityLines
        className="absolute inset-0 z-10 cursor-crosshair"
        anchorIds={ROPE_ANCHORS}
        lineColor="#FF4433"
        lineWidth={3}
        gravity={5}
        friction={10}
        slack={10}
        holeSize={12}
        holeColor="#111111"
        interactionRadius={100}
        pushStrength={15}
      />
    </section>
  );
}
