// Pixel-art frames. '#' is a lit pixel.

// --- Tiny man: 8 cols x 8 rows. Small square 2x2 head centered over a
// 4-wide body (head cols 3-4, body cols 2-5). ---

export const MAN_COLS = 8;
export const MAN_ROWS = 8;

export const MAN_IDLE = [
  "...##...",
  "...##...",
  "........",
  "..####..",
  "..####..",
  "..####..",
  "..#..#..",
  "..#..#..",
];

// 4-frame walk cycle: contact (legs apart) -> passing (legs together, body up)
export const MAN_WALK = [
  [
    "...##...",
    "...##...",
    "........",
    "..####..",
    "..####..",
    "..####..",
    ".#....#.",
    ".#....#.",
  ],
  [
    "...##...",
    "...##...",
    "..####..",
    "..####..",
    "..####..",
    "..####..",
    "...##...",
    "........",
  ],
  [
    "...##...",
    "...##...",
    "........",
    "..####..",
    "..####..",
    "..####..",
    ".#....#.",
    "#......#",
  ],
  [
    "...##...",
    "...##...",
    "..####..",
    "..####..",
    "..####..",
    "..####..",
    "..#..#..",
    "........",
  ],
];

// --- Dog: 12 cols x 7 rows, drawn facing right (tail left, snout right) ---
// The tail (cols 1-2) connects to the body and alternates between an "up"
// and a "down" pose so it reads as wagging, both while idle and while trotting.

export const DOG_COLS = 12;
export const DOG_ROWS = 7;

// 2-frame idle: standing still, tail wagging up/down
export const DOG_IDLE = [
  [
    "........##..",
    ".#......####",
    "..#.....##..",
    "..########..",
    "..########..",
    "..#.....#...",
    "..#.....#...",
  ],
  [
    "........##..",
    "........####",
    ".##.....##..",
    "..########..",
    "..########..",
    "..#.....#...",
    "..#.....#...",
  ],
];

// 4-frame trot cycle: legs spread -> gathered, tail up on contact frames
export const DOG_WALK = [
  [
    "........##..",
    ".#......####",
    "..#.....##..",
    "..########..",
    "..########..",
    ".#.......#..",
    "#.........#.",
  ],
  [
    "........##..",
    "........####",
    ".##.....##..",
    "..########..",
    "..########..",
    "...#...#....",
    "...#...#....",
  ],
  [
    "........##..",
    ".#......####",
    "..#.....##..",
    "..########..",
    "..########..",
    "..#......#..",
    ".#........#.",
  ],
  [
    "........##..",
    "........####",
    ".##.....##..",
    "..########..",
    "..########..",
    "....#..#....",
    "..#....#....",
  ],
];
