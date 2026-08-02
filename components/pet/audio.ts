// Minimal Web Audio synth: short enveloped oscillator blips, no samples.

let ctx: AudioContext | null = null;

// Browsers only allow audio after a user gesture; call this on pointerdown.
export function unlockAudio() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
}

export function playBlip(opts: {
  freq: number;
  duration?: number;
  volume?: number;
  type?: OscillatorType;
}) {
  if (!ctx || ctx.state !== "running") return;
  const { freq, duration = 0.05, volume = 0.1, type = "sine" } = opts;
  if (volume <= 0) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration);
}
