/**
 * Thin wrapper around @strudel/web. The library is loaded lazily on first
 * play (it boots an audio context and registers globals), so it costs
 * nothing until the visitor actually starts the music.
 */

type StrudelModule = typeof import("@strudel/web");

export type CodeLocation = { start: number; end: number };

type Hap = {
  whole?: { begin: { valueOf(): number }; end: { valueOf(): number } };
  part?: { begin: { valueOf(): number }; end: { valueOf(): number } };
  context?: { locations?: { start?: unknown; end?: unknown }[] };
};

type StrudelRepl = {
  scheduler?: {
    started?: boolean;
    pattern?: { queryArc(begin: number, end: number): Hap[] };
    now?: () => number;
  };
};

let strudel: StrudelModule | null = null;
let repl: StrudelRepl | null = null;
let ready: Promise<void> | null = null;

function ensureStrudel(): Promise<void> {
  if (!ready) {
    ready = import("@strudel/web").then(async (mod) => {
      // initStrudel resolves once the audio engine is fully prebaked;
      // calling evaluate before that throws. It returns the repl, whose
      // scheduler we query for live note highlighting.
      repl = (await mod.initStrudel()) as StrudelRepl;
      strudel = mod;
    });
  }
  return ready;
}

export async function playTrack(code: string) {
  await ensureStrudel();
  await strudel!.evaluate(code);
}

export async function stopMusic() {
  if (!ready) return;
  await ready;
  strudel!.hush();
}

/**
 * Source-code char ranges of the notes/atoms currently sounding, for the
 * live code overlay's highlight boxes. Strudel's haps carry the character
 * ranges they were parsed from (context.locations); filtering the current
 * cycle's haps to those sounding right now yields the playing spans.
 * Empty when nothing is playing.
 */
export function getActiveLocations(): CodeLocation[] {
  const sched = repl?.scheduler;
  if (!sched || !sched.started || !sched.pattern || !sched.now) return [];
  let now: number;
  try {
    now = sched.now();
  } catch {
    return [];
  }
  if (typeof now !== "number" || Number.isNaN(now)) return [];
  const cycle = Math.floor(now);
  let haps: Hap[];
  try {
    haps = sched.pattern.queryArc(cycle, cycle + 1);
  } catch {
    return [];
  }
  const out: CodeLocation[] = [];
  for (const hap of haps) {
    const span = hap.whole ?? hap.part;
    if (!span) continue;
    const begin = span.begin.valueOf();
    const end = span.end.valueOf();
    if (now < begin || now >= end) continue;
    const locations = hap.context?.locations;
    if (!Array.isArray(locations)) continue;
    for (const loc of locations) {
      if (typeof loc?.start === "number" && typeof loc?.end === "number") {
        out.push({ start: loc.start, end: loc.end });
      }
    }
  }
  return out;
}
