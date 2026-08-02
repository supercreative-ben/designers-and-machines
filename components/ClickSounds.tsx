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

    const tick = () => {
      ctx ??= new AudioContext();
      if (ctx.state === "suspended") void ctx.resume();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.03);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest("button, a")) tick();
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      window.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  return null;
}
