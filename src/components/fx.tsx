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
/* Pointer-follow spotlight for any `.spotlight` element. */
export function useGlobalSpotlight() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.<HTMLElement>(".spotlight");
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
/* Calls `cb(progress 0..1)` as the element scrolls through the viewport.
 * `mode="through"`: 0 when its top hits the viewport bottom, 1 when its bottom
 * leaves the top. `mode="pin"`: 0 when its top hits the viewport top, 1 when
 * its bottom hits the viewport bottom (for sticky/pinned sections). */
export function useScrollProgress<T extends HTMLElement>(
  cb: (p: number) => void,
  mode: "through" | "pin" = "through",
) {
  const ref = useRef<T>(null);
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p =
        mode === "pin"
          ? -r.top / Math.max(1, r.height - vh)
          : (vh - r.top) / Math.max(1, r.height + vh);
      cbRef.current(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [mode]);
  return ref;
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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        ref={ref}
        className="h-full origin-right bg-primary"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editorial cursor: a small ring that trails the pointer, grows over links
 * and shows a label over elements with [data-cursor="..."]. The native cursor
 * stays visible. Fine pointers only. */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    let x = -100,
      y = -100,
      cx = x,
      cy = y,
      raf = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement | null;
      const lab = t?.closest?.<HTMLElement>("[data-cursor]")?.dataset["cursor"] ?? "";
      setLabel(lab);
      setHover(!lab && !!t?.closest?.("a, button, [role=button], input, textarea, select"));
      if (ref.current) ref.current.style.opacity = "1";
    };
    const onLeave = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      if (ref.current) ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);
  const size = label ? 96 : hover ? 56 : 28;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] opacity-0 transition-opacity duration-300"
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ease-out ${
          label
            ? "grid place-items-center bg-sun text-xs font-black text-ink"
            : hover
              ? "bg-primary/20 ring-1 ring-primary"
              : "ring-1 ring-ink/50"
        }`}
        style={{ width: size, height: size }}
      >
        {label}
      </div>
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
/* Headline whose words slide up from behind a mask, one after another. */
export function SplitWords({
  text,
  className = "",
  delay = 0,
  step = 70,
  emphasizeLast = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
  emphasizeLast?: boolean;
}) {
  const words = text.trim().split(/\s+/);
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span
            className={`animate-word-in inline-block ${
              emphasizeLast && i === words.length - 1 ? "font-serif-italic text-primary" : ""
            }`}
            style={{ animationDelay: `${delay + i * step}ms` }}
          >
            {w}
            {i < words.length - 1 ? "\u00a0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Paragraph whose words "light up" one by one as you scroll through it. */
export function ScrollLitText({ text, className = "" }: { text: string; className?: string }) {
  const words = text.trim().split(/\s+/);
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const ref = useScrollProgress<HTMLParagraphElement>((p) => {
    // light up between 15% and 65% of the pass-through
    const t = Math.min(1, Math.max(0, (p - 0.15) / 0.5));
    const lit = t * words.length;
    spans.current.forEach((s, i) => {
      if (s) s.style.opacity = String(Math.min(1, Math.max(0.15, lit - i + 0.15)));
    });
  });
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          ref={(el) => {
            spans.current[i] = el;
          }}
          className="transition-opacity duration-200"
          style={{ opacity: 0.15 }}
        >
          {w}{" "}
        </span>
      ))}
    </p>
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
export function Marquee({
  items,
  className = "",
  separator = "✺",
}: {
  items: string[];
  className?: string;
  separator?: string;
}) {
  const row = [...items, ...items];
  const track = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="animate-marquee flex shrink-0 items-center">
      {row.map((t, idx) => (
        <span key={idx} className="flex items-center whitespace-nowrap">
          <span className="px-6 sm:px-10">{t}</span>
          <span aria-hidden className="text-sun">
            {separator}
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`flex overflow-hidden ${className}`}>
      {track(false)}
      {track(true)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Guided breathing exercise. */
const PHASES = [
  { label: "שאיפה", hint: "נשמו פנימה לאט דרך האף", scale: 1, secs: 4 },
  { label: "החזקה", hint: "החזיקו את האוויר בעדינות", scale: 1, secs: 4 },
  { label: "נשיפה", hint: "שחררו לאט דרך הפה", scale: 0.5, secs: 6 },
  { label: "מנוחה", hint: "רגע של שקט", scale: 0.5, secs: 2 },
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
  const scale = running ? cur.scale : 0.62;

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
        data-cursor={running ? "עצירה" : "התחלה"}
        aria-label={running ? "עצירת תרגיל הנשימה" : "התחלת תרגיל נשימה"}
        className="relative grid h-72 w-72 place-items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:h-80 sm:w-80"
      >
        <span className="absolute inset-0 rounded-full border border-ink/25" />
        <span className="animate-spin-slow absolute inset-3 rounded-full border border-dashed border-ink/25" />
        <span
          className="absolute inset-8 rounded-full bg-sun"
          style={{
            transform: `scale(${scale})`,
            transition: `transform ${running ? cur.secs : 0.6}s cubic-bezier(0.45, 0, 0.55, 1)`,
          }}
        />
        <span className="relative z-10 flex flex-col items-center text-ink">
          {running ? (
            <>
              <span className="font-display text-2xl font-black">{cur.label}</span>
              <span className="font-display text-6xl font-black tabular-nums">{left}</span>
            </>
          ) : (
            <>
              <span className="font-serif-italic text-3xl">התחילו</span>
              <span className="mt-1 text-sm font-semibold opacity-70">דקה אחת בשבילך</span>
            </>
          )}
        </span>
      </button>
      <p
        className="mt-6 h-6 text-center text-base font-semibold text-muted-foreground"
        aria-live="polite"
      >
        {running
          ? cur.hint
          : cycles > 0
            ? `כל הכבוד! השלמת ${cycles} סבבי נשימה`
            : "תרגיל נשימה מרגיע — 4·4·6"}
      </p>
      <div className="mt-4 flex gap-2">
        {PHASES.map((p, idx) => (
          <span
            key={p.label}
            className={`h-1 transition-all duration-500 ${
              running && idx === phase ? "w-10 bg-ink" : "w-4 bg-ink/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
