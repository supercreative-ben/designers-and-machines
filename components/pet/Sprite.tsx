import * as React from "react";

type SpriteProps = {
  frame: string[];
  pixelSize: number;
  color: string;
};

export function Sprite({ frame, pixelSize, color }: SpriteProps) {
  const rows = frame.length;
  const cols = frame[0].length;

  const rects: React.ReactNode[] = [];
  frame.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "#") {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
      }
    }
  });

  return (
    <svg
      width={cols * pixelSize}
      height={rows * pixelSize}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      fill={color}
      style={{ display: "block" }}
    >
      {rects}
    </svg>
  );
}
