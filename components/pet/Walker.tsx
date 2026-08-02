"use client";

import { useEffect, useRef, useState } from "react";
import { Sprite } from "./Sprite";
import {
  MAN_IDLE,
  MAN_WALK,
  MAN_COLS,
  MAN_ROWS,
  DOG_IDLE,
  DOG_WALK,
  DOG_COLS,
  DOG_ROWS,
} from "./frames";
import { PARAMS } from "./params";
import { unlockAudio, playBlip } from "./audio";

type Point = { x: number; y: number };

type Scene = {
  manPos: Point;
  dogPos: Point;
  manFrame: string[];
  dogFrame: string[];
  manFacingLeft: boolean;
  dogFacingLeft: boolean;
};

function clampToScreen(pt: Point, margin: number): Point {
  return {
    x: Math.min(Math.max(pt.x, margin), window.innerWidth - margin),
    y: Math.min(Math.max(pt.y, margin), window.innerHeight - margin),
  };
}

function randomTarget(margin: number): Point {
  return {
    x: margin + Math.random() * (window.innerWidth - margin * 2),
    y: margin + Math.random() * (window.innerHeight - margin * 2),
  };
}

// Random point in a ring around `center`, biased away from dead center.
function pointNear(center: Point, radius: number, margin: number): Point {
  const angle = Math.random() * Math.PI * 2;
  const r = radius * (0.3 + 0.7 * Math.random());
  return clampToScreen(
    { x: center.x + Math.cos(angle) * r, y: center.y + Math.sin(angle) * r },
    margin,
  );
}

/**
 * Tiny pixel man + dog that wander the viewport. Rendered as a
 * pointer-events-none overlay so the rest of the site stays interactive;
 * clicks are observed via a window listener instead (skipping UI controls)
 * to send the man to the click point. Arrow keys steer him directly.
 */
export function Walker() {
  const p = PARAMS;

  const manPosRef = useRef<Point>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const manTargetRef = useRef<Point>(randomTarget(80));
  const manWaitUntilRef = useRef(0);
  const manPhaseRef = useRef(0);

  const dogPosRef = useRef<Point>({
    x: window.innerWidth / 2 - 60,
    y: window.innerHeight / 2 + 30,
  });
  const dogTargetRef = useRef<Point>({ ...dogPosRef.current });
  const dogWaitUntilRef = useRef(0);
  const dogPhaseRef = useRef(0);
  const dogWagPhaseRef = useRef(0);
  const dogFacingLeftRef = useRef(false);

  const manStepIdxRef = useRef(0);
  const dogStepIdxRef = useRef(0);

  const [scene, setScene] = useState<Scene>(() => ({
    manPos: { ...manPosRef.current },
    dogPos: { ...dogPosRef.current },
    manFrame: MAN_IDLE,
    dogFrame: DOG_IDLE[0],
    manFacingLeft: false,
    dogFacingLeft: false,
  }));

  const arrowKeysRef = useRef<Set<string>>(new Set());

  // Click anywhere sends the man there (and unlocks audio). Clicks on
  // buttons/links/the dock card are left alone so the UI keeps working.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      unlockAudio();
      const el = e.target as HTMLElement | null;
      if (el?.closest("button, a, input, textarea, select, [role='dialog']"))
        return;
      manTargetRef.current = { x: e.clientX, y: e.clientY };
      manWaitUntilRef.current = 0;
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    const isArrow = (key: string) =>
      key === "ArrowUp" ||
      key === "ArrowDown" ||
      key === "ArrowLeft" ||
      key === "ArrowRight";
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isArrow(e.key)) return;
      e.preventDefault();
      unlockAudio();
      arrowKeysRef.current.add(e.key);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (isArrow(e.key)) arrowKeysRef.current.delete(e.key);
    };
    const onBlur = () => arrowKeysRef.current.clear();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const { man, dog, sound, edgeMargin } = PARAMS;

      // --- Man: arrow-key steering overrides wandering ---
      const manPos = manPosRef.current;
      let manFacingLeft = false;
      let manWalking = false;

      const keys = arrowKeysRef.current;
      const dirX =
        (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0);
      const dirY =
        (keys.has("ArrowDown") ? 1 : 0) - (keys.has("ArrowUp") ? 1 : 0);

      if (dirX !== 0 || dirY !== 0) {
        const len = Math.hypot(dirX, dirY);
        manPos.x = Math.min(
          Math.max(manPos.x + (dirX / len) * man.speed * dt, 8),
          window.innerWidth - 8,
        );
        manPos.y = Math.min(
          Math.max(manPos.y + (dirY / len) * man.speed * dt, 8),
          window.innerHeight - 8,
        );
        manPhaseRef.current += man.stepRate * dt;
        if (dirX !== 0) manFacingLeft = dirX < 0;
        manWalking = true;
        // Park the wander target where he is, so releasing the keys makes him
        // rest for pauseSeconds and then resume wandering on his own.
        manTargetRef.current = { x: manPos.x, y: manPos.y };
        manWaitUntilRef.current = 0;
      } else {
        const manTarget = manTargetRef.current;
        const mdx = manTarget.x - manPos.x;
        const mdy = manTarget.y - manPos.y;
        const mDist = Math.hypot(mdx, mdy);

        if (mDist < 2) {
          if (manWaitUntilRef.current === 0) {
            manWaitUntilRef.current = now + man.pauseSeconds * 1000;
          } else if (now >= manWaitUntilRef.current) {
            manTargetRef.current = randomTarget(edgeMargin);
            manWaitUntilRef.current = 0;
          }
        } else {
          const step = Math.min(man.speed * dt, mDist);
          manPos.x += (mdx / mDist) * step;
          manPos.y += (mdy / mDist) * step;
          manPhaseRef.current += man.stepRate * dt;
          manFacingLeft = manTarget.x < manPos.x;
          manWalking = true;
        }
      }

      // --- Dog: sniffs around freely but stays within leash range of the man ---
      const dogPos = dogPosRef.current;
      const distToMan = Math.hypot(manPos.x - dogPos.x, manPos.y - dogPos.y);

      // If the current destination has drifted out of leash range (man walked
      // away), immediately pick a new spot near him.
      const targetNearMan =
        Math.hypot(
          dogTargetRef.current.x - manPos.x,
          dogTargetRef.current.y - manPos.y,
        ) <= dog.leash;
      if (!targetNearMan) {
        dogTargetRef.current = pointNear(manPos, dog.leash, edgeMargin);
        dogWaitUntilRef.current = 0;
      }

      const dogTarget = dogTargetRef.current;
      const ddx = dogTarget.x - dogPos.x;
      const ddy = dogTarget.y - dogPos.y;
      const dDist = Math.hypot(ddx, ddy);

      if (dDist < 2) {
        if (dogWaitUntilRef.current === 0) {
          dogWaitUntilRef.current = now + dog.pauseSeconds * 1000;
        } else if (now >= dogWaitUntilRef.current) {
          dogTargetRef.current = pointNear(manPos, dog.leash, edgeMargin);
          dogWaitUntilRef.current = 0;
        }
      } else {
        // Sprint to catch up when he falls behind the leash radius.
        const sprint = distToMan > dog.leash ? 1.6 : 1;
        const step = Math.min(dog.speed * sprint * dt, dDist);
        dogPos.x += (ddx / dDist) * step;
        dogPos.y += (ddy / dDist) * step;
        dogPhaseRef.current += dog.stepRate * sprint * dt;
        if (Math.abs(ddx) > 1) dogFacingLeftRef.current = ddx < 0;
      }

      // Tail wag runs on its own clock so it keeps moving while he stands.
      dogWagPhaseRef.current += dog.wagRate * dt;

      // --- Frame selection ---
      const dogWalking = dDist >= 2;
      const manFrame = manWalking
        ? MAN_WALK[Math.floor(manPhaseRef.current) % MAN_WALK.length]
        : MAN_IDLE;
      const dogFrame = dogWalking
        ? DOG_WALK[Math.floor(dogPhaseRef.current) % DOG_WALK.length]
        : DOG_IDLE[Math.floor(dogWagPhaseRef.current) % DOG_IDLE.length];

      // --- Footstep sounds on contact frames (0 and 2 of the walk cycles) ---
      if (sound.enabled && sound.volume > 0) {
        // Man: soft tick each time a foot hits the ground, alternating pitch.
        const manIdx = Math.floor(manPhaseRef.current) % MAN_WALK.length;
        if (
          manWalking &&
          manIdx !== manStepIdxRef.current &&
          (manIdx === 0 || manIdx === 2)
        ) {
          playBlip({
            freq: manIdx === 0 ? 170 : 195,
            duration: 0.045,
            volume: sound.volume * 0.12,
            type: "triangle",
          });
        }
        manStepIdxRef.current = manIdx;

        // Dog: lighter, higher, quieter paw taps.
        const dogIdx = Math.floor(dogPhaseRef.current) % DOG_WALK.length;
        if (
          dogWalking &&
          dogIdx !== dogStepIdxRef.current &&
          (dogIdx === 0 || dogIdx === 2)
        ) {
          playBlip({
            freq: dogIdx === 0 ? 340 : 385,
            duration: 0.03,
            volume: sound.volume * 0.06,
            type: "triangle",
          });
        }
        dogStepIdxRef.current = dogIdx;
      }

      setScene({
        manPos: { x: manPos.x, y: manPos.y },
        dogPos: { x: dogPos.x, y: dogPos.y },
        manFrame,
        dogFrame,
        manFacingLeft: manWalking && manFacingLeft,
        dogFacingLeft: dogFacingLeftRef.current,
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const manW = MAN_COLS * p.man.pixelSize;
  const manH = MAN_ROWS * p.man.pixelSize;
  const dogW = DOG_COLS * p.dog.pixelSize;
  const dogH = DOG_ROWS * p.dog.pixelSize;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 15,
      }}
    >
      {p.shadow && (
        <>
          <div
            style={{
              position: "absolute",
              left: scene.manPos.x - manW * 0.4,
              top: scene.manPos.y - p.man.pixelSize * 0.5,
              width: manW * 0.8,
              height: p.man.pixelSize,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: scene.dogPos.x - dogW * 0.4,
              top: scene.dogPos.y - p.dog.pixelSize * 0.5,
              width: dogW * 0.8,
              height: p.dog.pixelSize,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.35)",
            }}
          />
        </>
      )}
      <div
        style={{
          position: "absolute",
          left: scene.manPos.x - manW / 2,
          top: scene.manPos.y - manH,
          transform: scene.manFacingLeft ? "scaleX(-1)" : undefined,
        }}
      >
        <Sprite
          frame={scene.manFrame}
          pixelSize={p.man.pixelSize}
          color={p.man.color}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: scene.dogPos.x - dogW / 2,
          top: scene.dogPos.y - dogH,
          transform: scene.dogFacingLeft ? "scaleX(-1)" : undefined,
        }}
      >
        <Sprite
          frame={scene.dogFrame}
          pixelSize={p.dog.pixelSize}
          color={p.dog.color}
        />
      </div>
    </div>
  );
}
