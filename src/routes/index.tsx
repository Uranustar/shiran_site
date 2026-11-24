import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import heroImg from "../assets/hero.jpg";
import meadowImg from "../assets/meadow.jpg";
import {
  Heart,
  Brain,
  Users,
  LifeBuoy,
  HandHeart,
  Sun,
  Sparkles,
  ArrowLeft,
  Quote,
  Phone,
} from "../components/icons";
import {
  CountUp,
  Marquee,
  Magnetic,
  BreathingWidget,
  SplitWords,
  ScrollLitText,
  useScrollProgress,
} from "../components/fx";
import { ParticleHeart, heartLabel, type HeartStatus } from "../components/ParticleHeart";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "מצמיחים מהלב — עמותה לתמיכה במתמודדי נפש" },
      {
        name: "description",
        content:
          "מצמיחים מהלב היא עמותה לתמיכה במתמודדי נפש. ליווי אישי, ייעוץ מקצועי, קבוצות תמיכה וקהילה — לא תהיו לבד בדרך.",
      },
      {
        property: "og:title",
        content: "מצמיחים מהלב — עמותה לתמיכה במתמודדי נפש",
      },
      {
        property: "og:description",
        content: "ליווי, ייעוץ וקהילה בדרך לריפוי. לא תהיו לבד בדרך.",
      },
    ],
  }),
  component: HomePage,
});

type Tone = "primary" | "leaf" | "sun";

type SupportCardData = {
  icon: typeof Heart;
  title: string;
  desc: string;
  tone: Tone;
};

type ServiceData = {
  icon: typeof Heart;
  title: string;
  desc: string;
};

type StatData = {
  value: string;
  label: string;
};

type SiteContent = {
  hero?: {
    badge?: string;
    title?: string;
    description?: string;
    donateButton?: string;
    supportButton?: string;
  };
  support_cards?: {
    items?: Array<{
      title: string;
      desc: string;
      tone: Tone;
      icon: string;
    }>;
  };
  services?: {
    items?: Array<{
      title: string;
      desc: string;
      icon: string;
    }>;
  };
  stats?: {
    items?: StatData[];
  };
  testimonial?: {
    quote?: string;
    author?: string;
  };
};

const ICONS: Record<string, typeof Heart> = {
  Heart,
  Brain,
  Users,
  LifeBuoy,
  HandHeart,
  Sun,
  Sparkles,
};

const DEFAULT_SUPPORT_CARDS: SupportCardData[] = [
  {
    icon: Brain,
    title: "תמיכה נפשית אישית",
    desc: "ליווי אישי וקשוב לאורך כל הדרך",
    tone: "primary",
  },
  {
    icon: LifeBuoy,
    title: "ייעוץ מקצועי",
    desc: "הכוונה ממומחים בריאות הנפש",
    tone: "leaf",
  },
  {
    icon: Users,
    title: "קבוצות תמיכה",
    desc: "קהילה שמבינה ומלווה",
    tone: "sun",
  },
  {
    icon: Heart,
    title: "קו חירום חם",
    desc: "*3042 — זמין 24/7, דיסקרטי",
    tone: "primary",
  },
  {
    icon: HandHeart,
    title: "ליווי משפחתי",
    desc: "תמיכה בבני משפחה ובני זוג",
    tone: "primary",
  },
  {
    icon: Sparkles,
    title: "סדנאות העצמה",
    desc: "כלים לריפוי וצמיחה",
    tone: "leaf",
  },
];

const DEFAULT_SERVICES: ServiceData[] = [
  {
    icon: HandHeart,
    title: "ליווי משפחתי",
    desc: "תמיכה בבני משפחה ובני זוג",
  },
  {
    icon: Sparkles,
    title: "סדנאות העצמה",
    desc: "כלים לריפוי וצמיחה",
  },
  {
    icon: Users,
    title: "קהילה מקוונת",
    desc: "שייכות בכל רגע ובכל מקום",
  },
  {
    icon: LifeBuoy,
    title: "הפניה לטיפול",
    desc: "גישור לטיפול מקצועי מתאים",
  },
];

const DEFAULT_STATS: StatData[] = [
  {
    value: "+12,000",
    label: "מתמודדים ומשפחות לוו",
  },
  {
    value: "24/7",
    label: "קו חירום חם ודיסקרטי",
  },
  {
    value: "+450",
    label: "מתנדבים ומלווים",
  },
  {
    value: "100%",
    label: "ללא תיוג וללא שיפוט",
  },
];

const INFO = [
  {
    title: "משבר נפשי",
    desc: "הרגעה, הכלה והפניה לטיפול בעת משבר.",
    cta: "לקבלת סיוע",
  },
  {
    title: "סיפורי החלמה",
    desc: "קולות של תקווה ממתמודדים שחלקו את דרכם.",
    cta: "בואו לקרוא",
  },
  {
    title: "מידע שימושי",
    desc: "כל מה שחשוב לדעת על בריאות הנפש וזכויות.",
    cta: "בואו לגלות",
  },
  {
    title: "התנדבות איתנו",
    desc: "שעות של משמעות — הצטרפו למעגל התמיכה.",
    cta: "להרשמה",
  },
];

function HomePage() {
  const [siteContent, setSiteContent] = useState<SiteContent>({});

  useEffect(() => {
    async function loadContent() {
      const { data, error } = await supabase.from("site_content").select("section, content");

      if (error) {
        console.error("Failed to load site content:", error);
        return;
      }

      const contentMap = Object.fromEntries(
        (data ?? []).map((row) => [row.section, row.content]),
      ) as SiteContent;

      setSiteContent(contentMap);
    }

    loadContent();
  }, []);

  const hero = siteContent.hero;

  const supportCards: SupportCardData[] =
    siteContent.support_cards?.items?.map((item) => ({
      icon: ICONS[item.icon] ?? Heart,
      title: item.title,
      desc: item.desc,
      tone: item.tone,
    })) ?? DEFAULT_SUPPORT_CARDS;

  const services: ServiceData[] =
    siteContent.services?.items?.map((item) => ({
      icon: ICONS[item.icon] ?? Heart,
      title: item.title,
      desc: item.desc,
    })) ?? DEFAULT_SERVICES;

  const stats = siteContent.stats?.items ?? DEFAULT_STATS;

  const testimonial = siteContent.testimonial;

  return (
    <div className="overflow-x-clip">
      {/* ============================== HERO ============================== */}
      <HeroStage
        badge={hero?.badge ?? "עמותה לתמיכה במתמודדי נפש"}
        title={hero?.title ?? "לא תהיו לבד בדרך אל האור"}
        description={
          hero?.description ??
          "אנחנו כאן בשבילך — ליווי אישי, ייעוץ מקצועי וקהילה חמה, באהבה ובכבוד, ללא תיוג וללא שיפוט."
        }
        donateLabel={hero?.donateButton ?? "לתרומה"}
        supportLabel={hero?.supportButton ?? "לקבלת סיוע — *3042"}
      />

      {/* ============================ MARQUEE ============================ */}
      <section
        aria-hidden
        data-noreveal
        className="relative z-10 my-10 -rotate-2 bg-sun py-5 sm:my-16"
      >
        <Marquee
          className="font-display text-3xl font-black tracking-tight text-ink sm:text-5xl"
          items={["הקשבה", "תקווה", "קהילה", "ליווי אישי", "ללא שיפוט", "צמיחה", "חוסן", "כבוד"]}
        />
      </section>

      {/* =========================== MANIFESTO =========================== */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <SectionHead n="02" label="הדרך שלנו" />
          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ScrollLitText
                className="font-display text-3xl font-bold leading-[1.25] tracking-tight text-ink sm:text-5xl"
                text="מצמיחים מהלב נולדה מתוך האמונה שריפוי מתחיל בקשר. אנו מלווים מתמודדי נפש ובני משפחותיהם — כדי שאף אחד לא יישאר לבד מול האתגרים שבדרך."
              />
              <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-ink/15 bg-ink/15 sm:grid-cols-3">
                {[
                  "דיסקרטיות מלאה וכיבוד זכויות הפרט",
                  "צוות מקצועי ומתנדבים מנוסים",
                  "ליווי לאורך כל הדרך — ללא תיוג",
                ].map((text, i) => (
                  <div key={text} className="bg-paper p-6 transition-colors hover:bg-sun">
                    <span className="font-serif-italic text-3xl text-primary">{i + 1}.</span>
                    <p className="mt-6 text-base font-semibold text-ink">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4">
              <ParallaxPhoto />
              <Link
                to="/about"
                className="group mt-6 flex items-center justify-between border-b border-ink py-4 text-lg font-bold text-ink"
              >
                הכירו עוד עלינו
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink transition-all duration-300 group-hover:bg-ink group-hover:text-paper">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SUPPORT — HORIZONTAL ====================== */}
      <HorizontalCards cards={supportCards} />

      {/* ========================= SERVICES LIST ========================= */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <SectionHead n="04" label="תחומי התמיכה שלנו" />
          <h2 className="mt-8 max-w-4xl font-display text-5xl font-black leading-[0.95] tracking-tight text-ink sm:text-7xl">
            מעגל <span className="font-serif-italic font-normal text-primary">שלם</span> של תמיכה.
          </h2>
          <HoverList
            items={services.map((s) => ({ title: s.title, desc: s.desc, icon: s.icon }))}
          />
          <div className="mt-10">
            <Link
              to="/activities"
              className="btn-pill inline-flex items-center gap-2 border border-ink px-7 py-3.5 text-sm text-ink hover:bg-ink hover:text-paper"
            >
              לכל תחומי התמיכה <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================= STATS ============================= */}
      <section className="py-10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <SectionHead n="05" label="במספרים" />
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`border-ink/15 py-8 pe-4 ${i % 2 === 1 ? "border-r ps-4 sm:ps-8" : ""} ${
                  i === 2 ? "lg:border-r lg:ps-8" : ""
                } ${i < 2 ? "border-b lg:border-b-0" : ""}`}
              >
                <p className="font-display text-5xl font-black tracking-tighter text-ink sm:text-7xl xl:text-8xl">
                  <CountUp value={stat.value} />
                </p>
                <p className="mt-3 text-sm font-semibold text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ BREATHE ============================ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <SectionHead n="06" label="רגע לעצמך" />
          <div className="mt-10 grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 className="font-display text-6xl font-black leading-[0.92] tracking-tight text-ink sm:text-8xl">
                עצרו.
                <br />
                <span className="font-serif-italic font-normal text-primary">נשמו.</span>
                <br />
                אנחנו כאן.
              </h2>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/70">
                כשהכל מרגיש כבד מדי, נשימה איטית ומודעת יכולה להרגיע את מערכת העצבים תוך דקה. לחצו
                על העיגול ועקבו אחריו.
              </p>
              <a
                href="tel:*3042"
                className="group mt-8 inline-flex items-center gap-4 border-b border-ink pb-2 text-ink"
              >
                <span className="text-sm text-muted-foreground">צריכים לדבר עכשיו?</span>
                <span
                  dir="ltr"
                  className="font-display text-2xl font-black group-hover:text-primary"
                >
                  *3042
                </span>
              </a>
            </div>
            <div className="flex justify-center lg:col-span-6">
              <BreathingWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ============================= INFO ============================== */}
      <section className="py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <SectionHead n="07" label="כדאי לדעת ולהכיר" />
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
            {INFO.map((card, i) => (
              <Link
                key={card.title}
                to="/activities"
                className="spotlight group flex min-h-72 flex-col bg-paper p-7 transition-colors duration-300"
              >
                <span className="text-xs font-bold text-muted-foreground">0{i + 1}</span>
                <h3 className="mt-auto font-display text-2xl font-black text-ink">{card.title}</h3>
                <p className="mt-2 text-sm text-ink/65">{card.desc}</p>
                <span className="mt-6 flex items-center justify-between border-t border-ink/15 pt-4 text-sm font-bold text-ink">
                  {card.cta}
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-2" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== TESTIMONIAL ========================== */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <SectionHead n="08" label="קולות" />
          <figure className="relative mt-12 text-center">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-16 right-1/2 translate-x-1/2 font-serif-italic text-[14rem] leading-none text-sun sm:-top-24 sm:text-[20rem]"
            >
              ”
            </span>
            <blockquote className="relative mx-auto max-w-5xl font-serif-italic text-3xl leading-snug text-ink sm:text-5xl">
              {testimonial?.quote ??
                "כשהגעתי למצמיחים מהלב הרגשתי שלראשונה מישהו באמת שומע אותי. הליווי החזיר לי את התקווה ואת הקול שלי."}
            </blockquote>
            <figcaption className="mt-10 inline-flex items-center gap-3 text-sm font-bold text-ink">
              <span className="h-px w-10 bg-ink" />
              {testimonial?.author ?? "נ׳ — בוגרת מסלול ליווי אישי"}
              <span className="h-px w-10 bg-ink" />
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function HeroStage({
  badge,
  title,
  description,
  donateLabel,
  supportLabel,
}: {
  badge: string;
  title: string;
  description: string;
  donateLabel: string;
  supportLabel: string;
}) {
  const [status, setStatus] = useState<HeartStatus>("idle");
  return (
    <section
      data-noreveal
      data-hero-dark
      className="grain relative -mt-[4.5rem] h-[100svh] min-h-[640px] overflow-hidden bg-ink text-paper"
    >
      <ParticleHeart
        className="absolute inset-0"
        offsetY={-0.85}
        showHint={false}
        onStatus={setStatus}
      />

      {/* soft vignettes keep the text readable over the particles */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-ink via-ink/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-ink via-ink/60 to-transparent" />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1400px] flex-col px-4 pb-8 pt-[5.5rem] sm:px-8">
        <div className="flex items-center justify-between gap-3 border-b border-paper/15 pb-4 text-xs font-bold tracking-wide text-paper/60">
          <span className="text-paper">(01)</span>
          <span className="animate-word-in">{badge}</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> קו חם 24/7
          </span>
        </div>

        <h1 className="mt-8 text-center font-display text-[13vw] font-black leading-[0.92] tracking-[-0.045em] sm:mt-10 sm:text-[9vw] lg:text-[6.5vw] xl:text-[6.4rem]">
          <SplitWords text={title} emphasizeLast delay={100} step={90} />
        </h1>

        {/* the heart lives here (canvas behind) — hint floats under it */}
        <div className="flex flex-1 items-end justify-center pb-4">
          <span
            className="animate-word-in inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/10 px-4 py-2 text-sm font-bold backdrop-blur-md"
            style={{ animationDelay: "900ms" }}
          >
            <span
              className={`h-2 w-2 rounded-full ${status === "idle" ? "animate-pulse bg-sun" : "bg-primary"}`}
            />
            {heartLabel(status)}
          </span>
        </div>

        <div className="grid gap-6 border-t border-paper/15 pt-6 sm:grid-cols-2 sm:items-end">
          <p
            className="animate-word-in max-w-md text-base leading-relaxed text-paper/75 sm:text-lg"
            style={{ animationDelay: "600ms" }}
          >
            {description}
          </p>
          <div
            className="animate-word-in pointer-events-auto flex flex-wrap gap-3 sm:justify-end"
            style={{ animationDelay: "750ms" }}
          >
            <Magnetic>
              <Link
                to="/donate"
                className="btn-pill inline-flex items-center gap-2 bg-sun px-7 py-4 text-base text-ink hover:bg-paper"
              >
                {donateLabel}
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Magnetic>
            <a
              href="tel:*3042"
              className="btn-pill inline-flex items-center gap-2 border border-paper/40 px-7 py-4 text-base text-paper hover:bg-paper hover:text-ink"
            >
              <Phone className="h-4 w-4" />
              {supportLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-xs font-bold tracking-wide">
        <span className="text-ink">({n})</span>
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div data-reveal="rule" className="rule mt-3 opacity-20" />
    </div>
  );
}

function ParallaxPhoto() {
  const img = useRef<HTMLImageElement>(null);
  const ref = useScrollProgress<HTMLDivElement>((p) => {
    if (img.current) img.current.style.transform = `translateY(${(p - 0.5) * -60}px) scale(1.15)`;
  });
  return (
    <div ref={ref} data-reveal className="relative aspect-[4/5] overflow-hidden rounded-lg">
      <img
        ref={img}
        src={meadowImg}
        alt="שביל בשדה ירוק פורח — דרך של תקווה"
        width={1280}
        height={960}
        loading="lazy"
        className="h-full w-full scale-[1.15] object-cover"
      />
      <span className="absolute bottom-4 right-4 rounded-full bg-paper px-3 py-1.5 text-xs font-bold text-ink">
        דרך של תקווה
      </span>
    </div>
  );
}

const CARD_SKINS = [
  "bg-paper text-ink",
  "bg-sun text-ink",
  "bg-primary text-paper",
  "bg-blossom text-ink",
  "border border-paper/30 text-paper",
  "bg-sage text-ink",
];

function HorizontalCards({ cards }: { cards: SupportCardData[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const pin = useScrollProgress<HTMLDivElement>((p) => {
    const el = track.current;
    if (!el) return;
    if (!isDesktop) {
      el.style.transform = "";
      return;
    }
    const dist = el.scrollWidth - el.clientWidth;
    el.style.transform = `translateX(${p * dist}px)`;
  }, "pin");

  return (
    <section data-noreveal className="bg-ink text-paper">
      <div
        ref={pin}
        className="relative"
        style={{ height: isDesktop ? `${100 + cards.length * 32}vh` : undefined }}
      >
        <div className="flex flex-col justify-center overflow-hidden py-20 lg:sticky lg:top-0 lg:h-screen lg:py-0">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
            <div className="flex items-baseline justify-between text-xs font-bold">
              <span>(03)</span>
              <span className="text-paper/60">איך אנחנו עוזרים</span>
            </div>
            <div className="rule mt-3 bg-paper opacity-20" />
            <h2 className="mt-8 font-display text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
              יד מושטת,
              <span className="font-serif-italic font-normal text-sun"> בכל צורה.</span>
            </h2>
          </div>
          <div
            ref={track}
            className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 will-change-transform sm:px-8 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {cards.map((c, i) => {
              const Icon = c.icon;
              return (
                <article
                  key={c.title}
                  className={`flex h-[24rem] w-[78vw] shrink-0 snap-start flex-col rounded-lg p-7 sm:w-[22rem] lg:h-[28rem] lg:w-[26rem] ${CARD_SKINS[i % CARD_SKINS.length]}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-serif-italic text-5xl leading-none opacity-80">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Icon className="h-9 w-9" />
                  </div>
                  <h3 className="mt-auto font-display text-3xl font-black leading-tight tracking-tight lg:text-4xl">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-base opacity-75">{c.desc}</p>
                </article>
              );
            })}
            <Link
              to="/activities"
              data-cursor="לכולם"
              className="group flex h-[24rem] w-[60vw] shrink-0 snap-start flex-col items-center justify-center gap-4 rounded-lg border border-paper/25 text-center sm:w-[18rem] lg:h-[28rem]"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sun text-ink transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-45">
                <ArrowLeft className="h-8 w-8" />
              </span>
              <span className="font-display text-2xl font-black">לכל תחומי התמיכה</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HoverList({ items }: { items: { title: string; desc: string; icon: typeof Heart }[] }) {
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const imgs = [heroImg, meadowImg];

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let x = 0,
      y = 0,
      cx = 0,
      cy = 0,
      raf = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const loop = () => {
      cx += (x - cx) * 0.15;
      cy += (y - cy) * 0.15;
      if (preview.current) preview.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
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
    <div className="relative mt-14" onPointerLeave={() => setActive(null)}>
      {/* floating image preview (desktop) */}
      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 hidden lg:block"
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg transition-all duration-500 ${
            active === null ? "h-0 w-0 opacity-0" : "h-56 w-44 opacity-100"
          } ${active !== null && active % 2 ? "rotate-3" : "-rotate-3"}`}
        >
          {active !== null && (
            <img src={imgs[active % 2]} alt="" className="h-56 w-44 max-w-none object-cover" />
          )}
        </div>
      </div>

      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <Link
            key={it.title}
            to="/activities"
            onPointerEnter={() => setActive(i)}
            className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 overflow-hidden border-t border-ink/15 py-7 last:border-b sm:gap-8 sm:py-9"
          >
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-sun transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-y-100" />
            <span className="relative w-10 text-sm font-bold text-muted-foreground group-hover:text-ink">
              0{i + 1}
            </span>
            <span className="relative">
              <span className="block font-display text-3xl font-black tracking-tight text-ink transition-transform duration-500 group-hover:-translate-x-3 sm:text-5xl">
                {it.title}
              </span>
              <span className="mt-1 block text-sm text-ink/60 sm:text-base">{it.desc}</span>
            </span>
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-ink/30 text-ink transition-all duration-500 group-hover:rotate-[-45deg] group-hover:border-ink group-hover:bg-ink group-hover:text-sun">
              <Icon className="h-5 w-5 group-hover:hidden" />
              <ArrowLeft className="hidden h-5 w-5 group-hover:block" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
