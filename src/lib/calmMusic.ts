// Site-wide calming music, generated live with the Web Audio API (no files).
//
// One engine, two modes:
//  - "ambient": a slowly evolving pad (chords crossfade every ~20s), a gently
//    drifting filter and an occasional soft bell — meditation-style background.
//  - "breath":  the same pad follows the breathing exercise (filter/volume open
//    on the inhale, close on the exhale) with a bell on each phase change.
//
// Browsers only allow audio to start inside a user gesture, so playback always
// begins from a click/tap/keypress — never on page load by itself.
//
// A tiny store (useSyncExternalStore) shares the state with React:
//  pref "on"   → ambient plays on every page (persisted; resumes on first gesture)
//  pref "off"  → silence everywhere, including the breathing exercise
//  pref null   → not chosen yet: no ambient, but the breathing exercise has music
import { useSyncExternalStore } from "react";

export type BreathPhase = "inhale" | "hold" | "exhale" | "rest";
type Mode = "ambient" | "breath";
type Pref = "on" | "off" | null;

// Four warm, open voicings (A add9 → F#m9 → D maj9 → E6/9).
const CHORDS = [
  [110, 164.81, 220, 277.18, 329.63, 493.88],
  [92.5, 138.59, 185, 220, 277.18, 415.3],
  [73.42, 110, 146.83, 185, 220, 329.63],
  [82.41, 123.47, 164.81, 207.65, 246.94, 369.99],
];
// A-major pentatonic bells.
const BELL_NOTES = [554.37, 659.25, 739.99, 880, 987.77, 1108.73];
const PHASE_BELLS: Record<BreathPhase, number> = {
  inhale: 659.25,
  hold: 880,
  exhale: 554.37,
  rest: 493.88,
};

function makeImpulse(ctx: AudioContext, seconds = 4, decay = 2.4) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

class CalmEngine {
  ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private reverb: ConvolverNode | null = null;
  private banks: GainNode[] = [];
  private sources: AudioScheduledSourceNode[] = [];
  private bank = 0;
  private mode: Mode = "ambient";
  private timer: ReturnType<typeof setInterval> | null = null;
  private tick = 0;
  private nextBell = 6;

  get running() {
    return this.ctx !== null;
  }

  start(mode: Mode) {
    if (this.ctx) return this.setMode(mode);
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.connect(ctx.destination);
    this.master = master;

    const reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.6;
    reverb.connect(wet).connect(master);
    this.reverb = reverb;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, now);
    filter.Q.value = 0.7;
    filter.connect(master);
    filter.connect(reverb);
    this.filter = filter;

    this.banks = CHORDS.map((chord, b) => {
      const bankGain = ctx.createGain();
      bankGain.gain.value = b === 0 ? 1 : 0;
      bankGain.connect(filter);
      chord.forEach((freq, i) => {
        const voice = ctx.createGain();
        voice.gain.value = (i === 0 ? 0.32 : 0.2) / chord.length;
        voice.connect(bankGain);
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
        const depth = ctx.createGain();
        lfo.frequency.value = 0.05 + i * 0.03;
        depth.gain.value = voice.gain.value * 0.5;
        lfo.connect(depth).connect(voice.gain);
        lfo.start(now);
        this.sources.push(lfo);
      });
      return bankGain;
    });
    this.bank = 0;

    this.timer = setInterval(() => this.onTick(), 1000);
    this.mode = mode === "ambient" ? "breath" : "ambient"; // force setMode to apply
    this.setMode(mode);
  }

  setMode(mode: Mode) {
    const { ctx, master, filter } = this;
    if (!ctx || !master || !filter || this.mode === mode) return;
    this.mode = mode;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(mode === "ambient" ? 0.38 : 0.45, now + 3);
    filter.frequency.cancelScheduledValues(now);
    filter.frequency.setValueAtTime(filter.frequency.value, now);
    filter.frequency.exponentialRampToValueAtTime(mode === "ambient" ? 900 : 500, now + 3);
    this.tick = 0;
    this.nextBell = 4 + Math.random() * 4;
  }

  private onTick() {
    const { ctx, filter } = this;
    if (!ctx || !filter || this.mode !== "ambient") return;
    this.tick++;
    const now = ctx.currentTime;
    // filter drifts slowly up and down — the music "breathes" by itself
    if (this.tick % 10 === 0) {
      filter.frequency.cancelScheduledValues(now);
      filter.frequency.setValueAtTime(filter.frequency.value, now);
      filter.frequency.exponentialRampToValueAtTime((this.tick / 10) % 2 ? 1400 : 650, now + 9.5);
    }
    // chord change every ~20s with a long crossfade
    if (this.tick % 20 === 0) {
      const from = this.banks[this.bank]!;
      this.bank = (this.bank + 1) % this.banks.length;
      const to = this.banks[this.bank]!;
      for (const [g, v] of [
        [from, 0],
        [to, 1],
      ] as const) {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(v, now + 7);
      }
    }
    if (this.tick >= this.nextBell) {
      this.bell(BELL_NOTES[Math.floor(Math.random() * BELL_NOTES.length)]!, 0.045);
      this.nextBell = this.tick + 5 + Math.random() * 7;
    }
  }

  setPhase(phase: BreathPhase, seconds: number) {
    const { ctx, filter, master } = this;
    if (!ctx || !filter || !master || this.mode !== "breath") return;
    const now = ctx.currentTime;
    const f = filter.frequency;
    const g = master.gain;
    f.cancelScheduledValues(now);
    g.cancelScheduledValues(now);
    f.setValueAtTime(f.value, now);
    g.setValueAtTime(g.value, now);
    if (phase === "inhale") {
      f.exponentialRampToValueAtTime(2400, now + seconds);
      g.linearRampToValueAtTime(0.6, now + seconds);
    } else if (phase === "exhale") {
      f.exponentialRampToValueAtTime(420, now + seconds);
      g.linearRampToValueAtTime(0.36, now + seconds);
    }
    this.bell(PHASE_BELLS[phase], 0.07);
  }

  private bell(freq: number, level: number) {
    const { ctx, master, reverb } = this;
    if (!ctx || !master || !reverb) return;
    const now = ctx.currentTime;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(level, now + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
    env.connect(master);
    env.connect(reverb);
    for (const [mult, amp] of [
      [1, 1],
      [2.76, 0.25],
    ] as const) {
      const osc = ctx.createOscillator();
      const lvl = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      lvl.gain.value = amp;
      osc.connect(lvl).connect(env);
      osc.start(now);
      osc.stop(now + 3.3);
    }
  }

  stop() {
    const { ctx, master } = this;
    if (!ctx || !master) return;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 1.5);
    const sources = this.sources;
    this.ctx = this.master = this.filter = this.reverb = null;
    this.banks = [];
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
    }, 1700);
  }
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

type Snapshot = {
  pref: Pref;
  playing: boolean;
  breathing: boolean;
  promptDismissed: boolean;
  ready: boolean; // client initialised (avoid SSR/hydration flashes)
};

const PREF_KEY = "calm-music-pref";
const PROMPT_KEY = "calm-music-prompt-dismissed";
const SERVER_SNAPSHOT: Snapshot = {
  pref: null,
  playing: false,
  breathing: false,
  promptDismissed: true,
  ready: false,
};

const engine = new CalmEngine();
let snap: Snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function set(patch: Partial<Snapshot>) {
  snap = { ...snap, ...patch, playing: engine.running };
  listeners.forEach((l) => l());
}

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode etc.) — choice just isn't remembered */
  }
}

/** Bring the engine in line with the current state. Call from user gestures. */
function sync() {
  const want = snap.breathing ? snap.pref !== "off" : snap.pref === "on";
  if (want) engine.start(snap.breathing ? "breath" : "ambient");
  else if (engine.running) engine.stop();
  set({});
}

let initialised = false;
let gestureHook: (() => void) | null = null;

export const calmMusic = {
  /** Read saved preferences; if music was on, resume at the first gesture. */
  init() {
    if (initialised || typeof window === "undefined") return;
    initialised = true;
    let pref: Pref = null;
    let dismissed = false;
    try {
      const p = localStorage.getItem(PREF_KEY);
      pref = p === "on" || p === "off" ? p : null;
      dismissed = localStorage.getItem(PROMPT_KEY) === "1";
    } catch {
      /* ignore */
    }
    set({ pref, promptDismissed: dismissed, ready: true });
    if (pref === "on") {
      gestureHook = () => {
        removeGestureHook();
        if (snap.pref === "on" && !engine.running) sync();
      };
      for (const ev of ["pointerdown", "keydown", "touchstart"])
        window.addEventListener(ev, gestureHook, { capture: true });
    }
  },
  setPref(pref: "on" | "off") {
    removeGestureHook();
    store(PREF_KEY, pref);
    store(PROMPT_KEY, "1");
    snap = { ...snap, pref, promptDismissed: true };
    sync();
  },
  toggle() {
    calmMusic.setPref(engine.running ? "off" : "on");
  },
  dismissPrompt() {
    store(PROMPT_KEY, "1");
    set({ promptDismissed: true });
  },
  breathStart() {
    snap = { ...snap, breathing: true };
    sync();
  },
  breathPhase(phase: BreathPhase, seconds: number) {
    if (snap.breathing) engine.setPhase(phase, seconds);
  },
  breathEnd() {
    if (!snap.breathing) return;
    snap = { ...snap, breathing: false };
    sync();
  },
};

function removeGestureHook() {
  if (!gestureHook) return;
  for (const ev of ["pointerdown", "keydown", "touchstart"])
    window.removeEventListener(ev, gestureHook, { capture: true });
  gestureHook = null;
}

export function useCalmMusic() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snap,
    () => SERVER_SNAPSHOT,
  );
}
