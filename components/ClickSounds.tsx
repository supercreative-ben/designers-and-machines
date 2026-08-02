"use client";

import { useEffect } from "react";

/**
 * Plays a tiny synthesized tick whenever an interactive element (button or
 * link) is pressed anywhere on the page. Web Audio only — no sound files.
 * The AudioContext is created inside the pointerdown handler, which counts
 * as a user gesture, so no separate unlock step is needed.
 */
export default function ClickSounds() {
  useEffect(() => {
    let ctx: AudioContext | null = null;

    const blip = (opts: {
      from: number;
      to: number;
      duration: number;
      volume: number;
      type: OscillatorType;
      delay?: number;
    }) => {
      ctx ??= new AudioContext();
      if (ctx.state === "suspended") void ctx.resume();
      const t = ctx.currentTime + (opts.delay ?? 0);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = opts.type;
      osc.frequency.setValueAtTime(opts.from, t);
      osc.frequency.exponentialRampToValueAtTime(opts.to, t + opts.duration * 0.6);
      gain.gain.setValueAtTime(opts.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + opts.duration + 0.01);
    };

    // Generic UI tick: short falling triangle blip.
    const tick = () =>
      blip({ from: 2400, to: 1100, duration: 0.05, volume: 0.06, type: "triangle" });

    // Tab switch: softer two-note rising chirp, clearly distinct from the tick.
    const tabSound = () => {
      blip({ from: 700, to: 900, duration: 0.045, volume: 0.05, type: "sine" });
      blip({ from: 1100, to: 1500, duration: 0.06, volume: 0.045, type: "sine", delay: 0.05 });
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      if (target.closest("[data-sound='tab']")) tabSound();
      else if (target.closest("button, a")) tick();
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      window.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  return null;
}
