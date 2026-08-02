/**
 * Thin wrapper around @strudel/web. The library is loaded lazily on first
 * play (it boots an audio context and registers globals), so it costs
 * nothing until the visitor actually starts the music.
 */

type StrudelGlobals = {
  evaluate: (code: string) => Promise<unknown>;
  hush: () => void;
};

let ready: Promise<void> | null = null;

function ensureStrudel(): Promise<void> {
  if (!ready) {
    ready = import("@strudel/web").then((mod) => {
      mod.initStrudel();
    });
  }
  return ready;
}

export async function playTrack(code: string) {
  await ensureStrudel();
  const g = globalThis as unknown as StrudelGlobals;
  await g.evaluate(code);
}

export async function stopMusic() {
  if (!ready) return;
  await ready;
  (globalThis as unknown as StrudelGlobals).hush();
}
