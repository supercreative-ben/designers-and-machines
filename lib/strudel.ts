/**
 * Thin wrapper around @strudel/web. The library is loaded lazily on first
 * play (it boots an audio context and registers globals), so it costs
 * nothing until the visitor actually starts the music.
 */

type StrudelModule = typeof import("@strudel/web");

let strudel: StrudelModule | null = null;
let ready: Promise<void> | null = null;

function ensureStrudel(): Promise<void> {
  if (!ready) {
    ready = import("@strudel/web").then(async (mod) => {
      // initStrudel resolves once the audio engine is fully prebaked;
      // calling evaluate before that throws.
      await mod.initStrudel();
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
