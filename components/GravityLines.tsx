"use client";

import * as React from "react";

const SEGMENTS = 20;
const CONSTRAINT_ITERATIONS = 5;
const DEFAULT_GAP = 530;

type RopePoint = {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  pinned: boolean;
};

type Rope = {
  points: RopePoint[];
  type: "default" | "user";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isDragging?: boolean;
};

export interface GravityLinesProps {
  lineColor?: string;
  lineWidth?: number;
  gravity?: number;
  friction?: number;
  /** Extra rope length as a percentage of the straight-line distance. */
  slack?: number;
  holeSize?: number;
  holeColor?: string;
  interactionRadius?: number;
  pushStrength?: number;
  /**
   * Element ids the default rope attaches to. Positions are measured every
   * frame, so the rope stays glued to the elements through layout changes.
   */
  anchorIds?: [string, string];
  className?: string;
}

function createPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): RopePoint[] {
  const points: RopePoint[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    points.push({ x, y, oldX: x, oldY: y, pinned: i === 0 || i === SEGMENTS });
  }
  return points;
}

export default function GravityLines({
  lineColor = "#FF4433",
  lineWidth = 3,
  gravity = 5,
  friction = 10,
  slack = 10,
  holeSize = 12,
  holeColor = "#111111",
  interactionRadius = 100,
  pushStrength = 15,
  anchorIds,
  className,
}: GravityLinesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sizeRef = React.useRef({ width: 0, height: 0, dpr: 1 });
  const mouseRef = React.useRef({ x: -1000, y: -1000, vx: 0, vy: 0 });
  const ropesRef = React.useRef<Rope[]>([]);
  const draggingRef = React.useRef<Rope | null>(null);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current = {
      x,
      y,
      vx: x - mouseRef.current.x,
      vy: y - mouseRef.current.y,
    };
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000, vx: 0, vy: 0 };
  }, []);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingRef.current) {
      draggingRef.current.isDragging = false;
      draggingRef.current.endX = x;
      draggingRef.current.endY = y;
      draggingRef.current = null;
    } else {
      const rope: Rope = {
        points: createPoints(x, y, x, y),
        type: "user",
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        isDragging: true,
      };
      ropesRef.current.push(rope);
      draggingRef.current = rope;
    }
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getAnchors = () => {
      const { width, height } = sizeRef.current;
      if (anchorIds) {
        const a = document.getElementById(anchorIds[0]);
        const b = document.getElementById(anchorIds[1]);
        if (a && b) {
          const cr = canvas.getBoundingClientRect();
          const ar = a.getBoundingClientRect();
          const br = b.getBoundingClientRect();
          return {
            ax: ar.left + ar.width / 2 - cr.left,
            ay: ar.top + ar.height / 2 - cr.top,
            bx: br.left + br.width / 2 - cr.left,
            by: br.top + br.height / 2 - cr.top,
          };
        }
      }
      return {
        ax: width / 2 - DEFAULT_GAP / 2,
        ay: height / 2,
        bx: width / 2 + DEFAULT_GAP / 2,
        by: height / 2,
      };
    };

    const resetDefaultRopes = () => {
      const { ax, ay, bx, by } = getAnchors();
      ropesRef.current.forEach((rope) => {
        if (rope.type !== "default") return;
        rope.startX = ax;
        rope.startY = ay;
        rope.endX = bx;
        rope.endY = by;
        for (let i = 0; i < rope.points.length; i++) {
          const p = rope.points[i];
          const t = i / (rope.points.length - 1);
          p.x = ax + (bx - ax) * t;
          p.y = ay + (by - ay) * t;
          p.oldX = p.x;
          p.oldY = p.y;
        }
      });
    };

    ropesRef.current = [
      {
        points: createPoints(0, 0, 0, 0),
        type: "default",
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
      },
    ];
    draggingRef.current = null;

    let frame = 0;

    const animate = () => {
      const { width, height, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const g = gravity * 0.1;
      const f = 1 - friction * 0.01;
      const anchors = getAnchors();
      const mouse = mouseRef.current;

      ropesRef.current.forEach((rope) => {
        let startX: number, startY: number, endX: number, endY: number;

        if (rope.type === "default") {
          startX = anchors.ax;
          startY = anchors.ay;
          endX = anchors.bx;
          endY = anchors.by;
          rope.startX = startX;
          rope.startY = startY;
          rope.endX = endX;
          rope.endY = endY;
        } else {
          startX = rope.startX;
          startY = rope.startY;
          if (rope.isDragging) {
            endX = mouse.x === -1000 ? startX : mouse.x;
            endY = mouse.x === -1000 ? startY : mouse.y;
          } else {
            endX = rope.endX;
            endY = rope.endY;
          }
        }

        // Holes at both attachment points
        ctx.fillStyle = holeColor;
        ctx.beginPath();
        ctx.arc(startX, startY, holeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(endX, endY, holeSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const points = rope.points;
        const spanX = endX - startX;
        const spanY = endY - startY;
        const spanDist = Math.sqrt(spanX * spanX + spanY * spanY);
        const segmentLength = spanDist / (points.length - 1);

        // Verlet integration
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (p.pinned) {
            p.x = i === 0 ? startX : endX;
            p.y = i === 0 ? startY : endY;
            continue;
          }

          const vx = (p.x - p.oldX) * f;
          const vy = (p.y - p.oldY) * f;
          p.oldX = p.x;
          p.oldY = p.y;
          p.x += vx;
          p.y += vy + g;

          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < interactionRadius) {
            const force = (interactionRadius - dist) / interactionRadius;
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * force * pushStrength;
            p.y += Math.sin(angle) * force * pushStrength;
          }
        }

        // Stick constraints
        for (let iter = 0; iter < CONSTRAINT_ITERATIONS; iter++) {
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) continue;
            const diff = dist - segmentLength * (1 + slack * 0.01);
            const percent = diff / dist / 2;
            const offsetX = dx * percent;
            const offsetY = dy * percent;
            if (!p1.pinned) {
              p1.x += offsetX;
              p1.y += offsetY;
            }
            if (!p2.pinned) {
              p2.x -= offsetX;
              p2.y -= offsetY;
            }
          }
        }

        // Draw as smooth quadratic segments
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length - 2; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        if (points.length > 2) {
          ctx.quadraticCurveTo(
            points[points.length - 2].x,
            points[points.length - 2].y,
            points[points.length - 1].x,
            points[points.length - 1].y
          );
        }
        ctx.stroke();
      });

      frame = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        sizeRef.current = { width, height, dpr };
        // Re-initialize default ropes on resize to prevent explosion
        resetDefaultRopes();
      }
    });

    resizeObserver.observe(canvas.parentElement!);
    frame = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [
    lineColor,
    lineWidth,
    gravity,
    friction,
    slack,
    holeSize,
    holeColor,
    interactionRadius,
    pushStrength,
    anchorIds,
  ]);

  return (
    <div
      className={className}
      style={{ overflow: "hidden" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
