export type Track = {
  id: string;
  name: string;
  /** Strudel pattern code, evaluated by @strudel/web. */
  code: string;
};

// Placeholder patterns — swap in the real Strudel songs when ready.
export const TRACKS: Track[] = [
  {
    id: "slow-ties",
    name: "Slow Ties",
    code: `note("<c3 eb3 g3 bb3>")
  .sound("sawtooth")
  .lpf(sine.range(200, 800).slow(8))
  .gain(0.4)
  .room(0.6)
  .slow(2)`,
  },
  {
    id: "machine-hum",
    name: "Machine Hum",
    code: `stack(
  note("c2 ~ c2 ~").sound("sine").gain(0.5),
  s("hh*4").gain(0.15)
).cpm(60)`,
  },
];
