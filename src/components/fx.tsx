// Interactive / motion building blocks. All SSR-safe (window only touched in effects)
// and respectful of prefers-reduced-motion.
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/* ------------------------------------------------------------------ */
/* Scroll reveal: observes every [data-reveal] element (plus, optionally,
 * auto-tags sections inside `root`). Re-runs whenever `key` changes. */
export function useScrollReveal(key: unknown, autoTagRoot?: string) {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("fx-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-shown", "");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    const scan = () => {
      raf = 0;
      if (autoTagRoot) {
        document
          .querySelectorAll<HTMLElement>(
            `${autoTagRoot} > div > section:not([data-noreveal]) > div`,
          )
          .forEach((el) => {
            if (!el.hasAttribute("data-reveal") && !el.querySelector("[data-reveal]"))
              el.setAttribute("data-reveal", "");
          });
      }
      // observe() is idempotent, so re-scanning is cheap and safe.
      document.querySelectorAll("[data-reveal]:not([data-shown])").forEach((el) => io.observe(el));
    };
    // Wait a frame so freshly-rendered route content exists, then keep
    // watching for elements React adds later (e.g. CMS content loaded async).
    let raf = requestAnimationFrame(scan);
    const mo = new MutationObserver(() => {
      if (!raf) raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
    };
  }, [key, autoTagRoot]);
}

/* ------------------------------------------------------------------ */
/* Pointer-follow spotlight for any `.spotlight` / `.shadow-card` element. */
export function useGlobalSpotlight() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.<HTMLElement>(
        ".spotlight, .fx-main .shadow-card",
      );
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${e.clientX - r.left}px`);
      target.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
}

/* ------------------------------------------------------------------ */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1">
      <div
        ref={ref}
        className="h-full origin-right bg-gradient-to-l from-primary via-blossom to-sun"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Soft glow that trails the cursor (desktop / fine pointers only). */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    let x = window.innerWidth / 2,
      y = window.innerHeight / 2,
      cx = x,
      cy = y,
      raf = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (ref.current) ref.current.style.opacity = "1";
    };
    const loop = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      if (ref.current) ref.current.style.transform = `translate3d(${cx - 200}px, ${cy - 200}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1] h-[400px] w-[400px] rounded-full opacity-0 mix-blend-multiply transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 22%, transparent), transparent)",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 3D tilt on hover. */
export function TiltCard({
  children,
  className = "",
  max = 10,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`spotlight transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{ transformStyle: "preserve-3d", ...style }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Button/link wrapper that leans toward the cursor. */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const onMove = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="inline-block transition-transform duration-300 ease-out"
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Counts up when scrolled into view. Handles "+12,000", "100%", etc.
 * Values it can't parse (e.g. "24/7") are shown as-is. */
export function CountUp({ value, duration = 1800 }: { value: string; duration?: number }) {
  const m = value.match(/^(\D*?)([\d,]+)(\D*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const target = m ? Number(m[2]!.replace(/,/g, "")) : 0;
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    if (!m || !ref.current) return;
    if (prefersReducedMotion()) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          setN(Math.round(target * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!m) return <span>{value}</span>;
  const shown = n === null ? m[2] : n.toLocaleString("en-US");
  return (
    <span ref={ref} dir="ltr" className="tabular-nums">
      {m[1]}
      {shown}
      {m[3]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Cycles through words with a 3D flip-in. */
export function RotatingWords({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (words.length < 2 || prefersReducedMotion()) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);
  return (
    <span className="inline-block [perspective:600px]">
      <span key={i} className="animate-word-in inline-block text-gradient">
        {words[i]}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div
      className={`relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] ${className}`}
    >
      <div className="animate-marquee flex shrink-0 items-center gap-10 pe-10 hover:[animation-play-state:paused]">
        {row.map((t, idx) => (
          <span key={idx} className="flex items-center gap-10 whitespace-nowrap">
            <span>{t}</span>
            <span aria-hidden className="text-primary">
              ✦
            </span>
          </span>
        ))}
      </div>
      <div
        aria-hidden
        className="animate-marquee flex shrink-0 items-center gap-10 pe-10 hover:[animation-play-state:paused]"
      >
        {row.map((t, idx) => (
          <span key={idx} className="flex items-center gap-10 whitespace-nowrap">
            <span>{t}</span>
            <span className="text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Guided box-breathing exercise. */
const PHASES = [
  { label: "שאיפה", hint: "נשמו פנימה לאט דרך האף", scale: 1, secs: 4 },
  { label: "החזקה", hint: "החזיקו את האוויר בעדינות", scale: 1, secs: 4 },
  { label: "נשיפה", hint: "שחררו לאט דרך הפה", scale: 0.55, secs: 6 },
  { label: "מנוחה", hint: "רגע של שקט", scale: 0.55, secs: 2 },
] as const;

export function BreathingWidget() {
  const [running, setRunning] = useState(false);
  const [{ phase, left, cycles }, setState] = useState({
    phase: 0,
    left: PHASES[0].secs as number,
    cycles: 0,
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setState((s) => {
        if (s.left > 1) return { ...s, left: s.left - 1 };
        const next = (s.phase + 1) % PHASES.length;
        return { phase: next, left: PHASES[next]!.secs, cycles: s.cycles + (next === 0 ? 1 : 0) };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const cur = PHASES[phase]!;
  const scale = running ? cur.scale : 0.7;

  const toggle = () => {
    if (running) {
      setRunning(false);
    } else {
      setState((s) => ({ ...s, phase: 0, left: PHASES[0].secs }));
      setRunning(true);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={toggle}
        aria-label={running ? "עצירת תרגיל הנשימה" : "התחלת תרגיל נשימה"}
        className="group relative grid h-72 w-72 place-items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:h-80 sm:w-80"
      >
        {/* orbit ring */}
        <span className="animate-spin-slow absolute inset-0 rounded-full border-2 border-dashed border-primary/30" />
        {!running && (
          <span className="animate-ping-soft absolute inset-10 rounded-full bg-primary/25" />
        )}
        {/* breathing orb */}
        <span
          className="absolute inset-6 rounded-full shadow-[0_0_80px_-10px_var(--primary)]"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, color-mix(in oklab, white 70%, var(--sun)), var(--primary) 55%, color-mix(in oklab, var(--primary) 60%, var(--blossom)))",
            transform: `scale(${scale})`,
            transition: `transform ${running ? cur.secs : 0.6}s cubic-bezier(0.45, 0, 0.55, 1)`,
          }}
        />
        <span className="relative z-10 flex flex-col items-center text-primary-foreground drop-shadow">
          {running ? (
            <>
              <span className="font-display text-3xl font-black">{cur.label}</span>
              <span className="mt-1 font-display text-5xl font-black tabular-nums">{left}</span>
            </>
          ) : (
            <>
              <span className="font-display text-2xl font-black">לחצו להתחיל</span>
              <span className="mt-1 text-sm font-semibold opacity-90">דקה אחת בשבילך</span>
            </>
          )}
        </span>
      </button>
      <p
        className="mt-8 h-6 text-center text-base font-semibold text-muted-foreground"
        aria-live="polite"
      >
        {running
          ? cur.hint
          : cycles > 0
            ? `כל הכבוד! השלמת ${cycles} סבבי נשימה 💛`
            : "תרגיל נשימה מרגיע — 4·4·6"}
      </p>
      <div className="mt-4 flex gap-2">
        {PHASES.map((p, idx) => (
          <span
            key={p.label}
            className={`h-2 rounded-full transition-all duration-500 ${
              running && idx === phase ? "w-10 bg-primary" : "w-2 bg-primary/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
