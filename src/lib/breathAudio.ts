// Generative ambient music for the breathing exercise (Web Audio API).
// No audio files: a warm drone chord through a low-pass filter and reverb.
// The filter and volume "breathe" with the exercise (open on the inhale,
// close on the exhale), and a soft bell marks each phase change.

type Phase = "inhale" | "hold" | "exhale" | "rest";

// A-major add9 voicing — open, warm, unresolved but calm.
const CHORD = [110, 164.81, 220, 277.18, 329.63, 493.88];
// Pentatonic bell notes, one per phase.
const BELLS: Record<Phase, number> = {
  inhale: 659.25, // E5
  hold: 880, // A5
  exhale: 554.37, // C#5
  rest: 493.88, // B4
};

function makeImpulse(ctx: AudioContext, seconds = 3.5, decay = 2.6) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

export class BreathAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private reverb: ConvolverNode | null = null;
  private sources: AudioScheduledSourceNode[] = [];

  get running() {
    return this.ctx !== null;
  }

  start() {
    if (this.ctx) return;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.4, now + 2.5);
    master.connect(ctx.destination);
    this.master = master;

    const reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet).connect(master);
    this.reverb = reverb;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, now);
    filter.Q.value = 0.7;
    filter.connect(master);
    filter.connect(reverb);
    this.filter = filter;

    // Drone: two slightly detuned oscillators per note, each with a slow
    // tremolo at its own rate so the chord shimmers.
    CHORD.forEach((freq, i) => {
      const voice = ctx.createGain();
      voice.gain.value = (i === 0 ? 0.32 : 0.2) / CHORD.length;
      voice.connect(filter);
      for (const [type, detune] of [
        ["sine", -5],
        ["triangle", 5],
      ] as const) {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = detune;
        osc.connect(voice);
        osc.start(now);
        this.sources.push(osc);
      }
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.05 + i * 0.03;
      lfoGain.gain.value = voice.gain.value * 0.5;
      lfo.connect(lfoGain).connect(voice.gain);
      lfo.start(now);
      this.sources.push(lfo);
    });
  }

  /** Shape the sound for the current breathing phase. */
  setPhase(phase: Phase, seconds: number) {
    const { ctx, filter, master } = this;
    if (!ctx || !filter || !master) return;
    const now = ctx.currentTime;
    const f = filter.frequency;
    const g = master.gain;
    f.cancelScheduledValues(now);
    g.cancelScheduledValues(now);
    f.setValueAtTime(f.value, now);
    g.setValueAtTime(g.value, now);
    if (phase === "inhale") {
      f.exponentialRampToValueAtTime(2400, now + seconds);
      g.linearRampToValueAtTime(0.55, now + seconds);
    } else if (phase === "exhale") {
      f.exponentialRampToValueAtTime(420, now + seconds);
      g.linearRampToValueAtTime(0.32, now + seconds);
    }
    this.bell(BELLS[phase]);
  }

  private bell(freq: number) {
    const { ctx, master, reverb } = this;
    if (!ctx || !master || !reverb) return;
    const now = ctx.currentTime;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.07, now + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
    env.connect(master);
    env.connect(reverb);
    // fundamental + a quiet inharmonic partial for a bell-like tone
    for (const [mult, level] of [
      [1, 1],
      [2.76, 0.25],
    ] as const) {
      const osc = ctx.createOscillator();
      const lvl = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      lvl.gain.value = level;
      osc.connect(lvl).connect(env);
      osc.start(now);
      osc.stop(now + 3.3);
    }
  }

  /** Fade out and release the audio device. */
  stop() {
    const { ctx, master } = this;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 1.2);
    const sources = this.sources;
    this.ctx = this.master = this.filter = this.reverb = null;
    this.sources = [];
    setTimeout(() => {
      sources.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* already stopped */
        }
      });
      void ctx.close();
    }, 1400);
  }
}

export const PHASE_KEYS: Phase[] = ["inhale", "hold", "exhale", "rest"];
