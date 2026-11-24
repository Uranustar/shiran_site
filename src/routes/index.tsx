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
  TiltCard,
  CountUp,
  RotatingWords,
  Marquee,
  Magnetic,
  BreathingWidget,
  prefersReducedMotion,
} from "../components/fx";
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
      <HomeHero
        badge={hero?.badge ?? "עמותה לתמיכה במתמודדי נפש"}
        title={hero?.title ?? "לא תהיו לבד בדרך אל האור"}
        description={
          hero?.description ??
          "אנחנו כאן בשבילך — ליווי אישי, ייעוץ מקצועי וקהילה חמה, באהבה ובכבוד, ללא תיוג וללא שיפוט."
        }
        donateLabel={hero?.donateButton ?? "לתרומה"}
        supportLabel={hero?.supportButton ?? "לקבלת סיוע — *3042"}
      />

      {/* SUPPORT CARDS GRID */}
      <section className="relative z-10 -mt-24 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {supportCards.map((card, i) => (
              <div
                key={card.title}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}
              >
                <SupportCard {...card} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section aria-hidden className="py-10">
        <Marquee
          className="font-display text-3xl font-black text-foreground/15 sm:text-5xl"
          items={["הקשבה", "תקווה", "קהילה", "ליווי אישי", "ללא שיפוט", "צמיחה", "חוסן", "כבוד"]}
        />
      </section>

      {/* INTRO / ABOUT PREVIEW */}
      <section className="relative py-20">
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div data-reveal className="order-2 lg:order-1">
            <SectionEyebrow>הדרך שלנו</SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-black leading-[1.1] text-foreground sm:text-5xl">
              כל אדם ראוי <span className="text-gradient-dark">לתמיכה, לקשב ולתקווה</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              מצמיחים מהלב נולדה מתוך האמונה שריפוי מתחיל בקשר. אנו מלווים מתמודדי נפש ובני
              משפחותיהם בליווי אישי וקבוצתי, בייעוץ מקצועי ובקהילה מכילה — כדי שאף אחד לא יישאר לבד
              מול האתגרים שבדרך.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "דיסקרטיות מלאה וכיבוד זכויות הפרט",
                "צוות מקצועי ומתנדבים מנוסים",
                "ליווי לאורך כל הדרך — ללא תיוג",
              ].map((text) => (
                <li
                  key={text}
                  className="group flex items-center gap-3 rounded-2xl border border-transparent p-2 text-foreground transition-all hover:border-border hover:bg-card hover:shadow-card"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blossom text-primary-foreground transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                    <Heart className="h-4 w-4" />
                  </span>
                  <span className="text-base font-semibold">{text}</span>
                </li>
              ))}
            </ul>

            <Magnetic>
              <Link
                to="/about"
                className="btn-pill group mt-9 inline-flex items-center gap-2 bg-foreground px-7 py-4 text-sm font-bold text-background shadow-soft"
              >
                הכירו עוד עלינו
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Magnetic>
          </div>

          <div data-reveal className="order-1 lg:order-2">
            <ParallaxImage />
          </div>
        </div>
      </section>

      {/* SERVICES — BENTO */}
      <section className="relative py-24">
        <div className="bg-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>תחומי התמיכה שלנו</SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl">
              מעגל <span className="text-gradient-dark">שלם</span> של תמיכה
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              מליווי אישי ועד קהילה — בנינו רשת בטוחה שמחזיקה אתכם בכל רגע.
            </p>
          </div>

          <div className="mt-14 grid auto-rows-[minmax(190px,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => {
              const Icon = service.icon;
              const featured = i === 0;
              return (
                <div
                  key={service.title}
                  data-reveal
                  style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
                  className={
                    featured ? "sm:col-span-2 lg:row-span-2" : i === 3 ? "sm:col-span-2" : ""
                  }
                >
                  <TiltCard
                    max={featured ? 5 : 9}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] p-7 ${
                      featured
                        ? "bg-gradient-to-br from-primary via-primary to-blossom text-primary-foreground shadow-soft"
                        : "border border-border bg-card/80 shadow-card backdrop-blur"
                    }`}
                  >
                    {featured && (
                      <>
                        <div className="animate-aurora absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sun/50 blur-3xl" />
                        <Heart className="animate-float absolute bottom-6 left-6 h-32 w-32 opacity-15" />
                      </>
                    )}
                    <span
                      className={`relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 ${
                        featured
                          ? "bg-white/20 backdrop-blur"
                          : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                      }`}
                    >
                      <Icon className="h-7 w-7" />
                    </span>
                    <div className="relative mt-auto pt-8">
                      <h3
                        className={`font-display font-black ${featured ? "text-3xl sm:text-4xl" : "text-xl text-foreground"}`}
                      >
                        {service.title}
                      </h3>
                      <p
                        className={`mt-2 ${featured ? "text-lg opacity-90" : "text-sm text-muted-foreground"}`}
                      >
                        {service.desc}
                      </p>
                    </div>
                    <span className="absolute left-6 top-7 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
                      <ArrowLeft className="h-5 w-5" />
                    </span>
                  </TiltCard>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/activities"
              className="btn-pill group inline-flex items-center gap-2 border-2 border-foreground/80 px-7 py-3.5 text-sm font-bold text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              לכל תחומי התמיכה
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            data-reveal
            className="relative overflow-hidden rounded-[2.5rem] bg-foreground p-10 text-background shadow-soft sm:p-14"
          >
            <div className="animate-aurora absolute -right-20 -top-32 h-80 w-80 rounded-full bg-primary/50 blur-[90px]" />
            <div className="animate-aurora absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-blossom/40 blur-[90px] [animation-delay:-7s]" />
            <div className="relative grid grid-cols-2 gap-y-10 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`px-4 text-center ${i % 2 === 1 ? "border-r border-white/10" : ""} ${i === 2 ? "lg:border-r lg:border-white/10" : ""}`}
                >
                  <p className="font-display text-3xl font-black sm:text-5xl lg:text-6xl">
                    <span className="text-gradient">
                      <CountUp value={stat.value} />
                    </span>
                  </p>
                  <p className="mt-3 text-sm font-medium opacity-75">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BREATHING EXERCISE */}
      <section className="relative py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div data-reveal>
            <SectionEyebrow>רגע לעצמך</SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-black leading-[1.1] text-foreground sm:text-5xl">
              עצרו. <span className="text-gradient-dark">נשמו.</span> אנחנו כאן.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              כשהכל מרגיש כבד מדי, נשימה איטית ומודעת יכולה להרגיע את מערכת העצבים תוך דקה. לחצו על
              העיגול ועקבו אחריו — שאיפה, החזקה ונשיפה ארוכה.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/70 p-4 text-sm backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </span>
              <span className="flex-1 text-muted-foreground">
                צריכים לדבר עם מישהו עכשיו? הקו שלנו זמין 24/7.
              </span>
              <a href="tel:*3042" className="font-bold text-primary hover:underline" dir="ltr">
                *3042
              </a>
            </div>
          </div>
          <div data-reveal className="flex justify-center">
            <BreathingWidget />
          </div>
        </div>
      </section>

      {/* INFO / KNOW */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            data-reveal
            className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div>
              <SectionEyebrow>כדאי לדעת ולהכיר</SectionEyebrow>
              <h2 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl">
                מידע שעושה סדר
              </h2>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INFO.map((card, i) => (
              <Link
                key={card.title}
                to="/activities"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}
                className="spotlight group flex min-h-64 flex-col rounded-[2rem] border border-border bg-card p-7 shadow-card transition-all duration-500 hover:-translate-y-2"
              >
                <span className="font-display text-5xl font-black text-foreground/10 transition-colors duration-500 group-hover:text-primary/40">
                  0{i + 1}
                </span>
                <h3 className="mt-auto font-display text-xl font-black text-foreground">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary transition-all group-hover:gap-3">
                  {card.cta}
                  <ArrowLeft className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-24">
        <div data-reveal className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-x-10 top-1/2 h-40 -translate-y-1/2 rounded-full bg-gradient-to-l from-primary/20 via-blossom/25 to-sun/25 blur-3xl" />
          <Quote className="relative mx-auto h-14 w-14 text-primary/40" />
          <blockquote className="relative mt-8 font-display text-3xl font-bold leading-snug text-foreground sm:text-4xl">
            "
            {testimonial?.quote ??
              "כשהגעתי למצמיחים מהלב הרגשתי שלראשונה מישהו באמת שומע אותי. הליווי החזיר לי את התקווה ואת הקול שלי."}
            "
          </blockquote>
          <div className="relative mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card/80 px-5 py-2.5 shadow-card backdrop-blur">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blossom text-primary-foreground">
              <Heart className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-muted-foreground">
              {testimonial?.author ?? "נ׳ — בוגרת מסלול ליווי אישי"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}

function HomeHero({
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
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--px", x.toFixed(3));
        el.style.setProperty("--py", y.toFixed(3));
      });
    };
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const layer = (depth: number) => ({
    transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px), 0)`,
    transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
  });

  return (
    <section ref={ref} data-noreveal className="relative px-3 sm:px-5">
      <div className="relative isolate mx-auto min-h-[min(92vh,880px)] max-w-[1600px] overflow-hidden rounded-[2.5rem] bg-foreground sm:rounded-[3rem]">
        <img
          src={heroImg}
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-[-4%] h-[108%] w-[108%] max-w-none object-cover opacity-70"
          style={layer(-30)}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-foreground/10" />

        {/* aurora orbs */}
        <div className="pointer-events-none absolute inset-0" style={layer(60)}>
          <div className="animate-aurora absolute -right-32 top-10 h-[30rem] w-[30rem] rounded-full bg-primary/60 mix-blend-screen blur-[90px]" />
          <div className="animate-aurora absolute -left-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-blossom/50 mix-blend-screen blur-[90px] [animation-delay:-6s]" />
          <div className="animate-aurora absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-sun/40 mix-blend-screen blur-[80px] [animation-delay:-12s]" />
        </div>

        {/* floating glass chips */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block" style={layer(-45)}>
          <div className="animate-float glass absolute right-[8%] top-[22%] flex items-center gap-3 rounded-2xl px-4 py-3 !bg-white/15 text-white shadow-soft">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Phone className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-black">24/7</span>
              <span className="text-xs opacity-80">קו חם ודיסקרטי</span>
            </span>
          </div>
          <div className="animate-float glass absolute bottom-[26%] left-[7%] flex items-center gap-3 rounded-2xl px-4 py-3 !bg-white/15 text-white shadow-soft [animation-delay:-3s]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Users className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-black">+450</span>
              <span className="text-xs opacity-80">מתנדבים ומלווים</span>
            </span>
          </div>
        </div>

        <div className="relative mx-auto flex min-h-[min(92vh,880px)] max-w-5xl flex-col items-center justify-center px-5 pb-36 pt-20 text-center text-white">
          <span className="animate-word-in inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping-soft absolute inset-0 rounded-full bg-sun" />
              <span className="relative h-2 w-2 rounded-full bg-sun" />
            </span>
            {badge}
          </span>

          <h1
            className="animate-word-in mt-7 font-display text-5xl font-black leading-[1.02] tracking-tight drop-shadow-lg sm:text-7xl lg:text-8xl"
            style={{ animationDelay: "120ms" }}
          >
            {title}
          </h1>

          <p
            className="animate-word-in mt-6 font-display text-2xl font-bold sm:text-3xl"
            style={{ animationDelay: "240ms" }}
          >
            כאן בשבילך עם{" "}
            <RotatingWords words={["הקשבה", "ליווי אישי", "תקווה", "קהילה חמה", "אהבה"]} />
          </p>

          <p
            className="animate-word-in mt-5 max-w-2xl text-lg text-white/80"
            style={{ animationDelay: "360ms" }}
          >
            {description}
          </p>

          <div
            className="animate-word-in mt-10 flex flex-col items-center gap-3 sm:flex-row"
            style={{ animationDelay: "480ms" }}
          >
            <Magnetic strength={0.35}>
              <Link
                to="/donate"
                className="btn-pill group inline-flex items-center gap-2 bg-gradient-to-l from-sun to-blossom px-9 py-4 text-base font-black text-foreground shadow-[0_18px_50px_-12px_var(--sun)]"
              >
                <Heart className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" />
                {donateLabel}
              </Link>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a
                href="tel:*3042"
                className="btn-pill inline-flex items-center gap-2 border border-white/30 bg-white/10 px-9 py-4 text-base font-bold text-white backdrop-blur-md hover:bg-white/20"
              >
                <Phone className="h-5 w-5" />
                {supportLabel}
              </a>
            </Magnetic>
          </div>

          <a
            href="#support"
            aria-label="גללו למטה"
            className="absolute bottom-32 hidden h-12 w-7 justify-center rounded-full border-2 border-white/40 pt-2 sm:flex"
            onClick={(e) => {
              e.preventDefault();
              window.scrollBy({ top: window.innerHeight * 0.75, behavior: "smooth" });
            }}
          >
            <span className="animate-scroll-cue h-2 w-1.5 rounded-full bg-white" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ParallaxImage() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.setProperty("--py", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="absolute -inset-4 -z-10 rotate-3 rounded-[2.5rem] bg-gradient-to-br from-primary/40 via-blossom/30 to-sun/40 blur-sm" />
      <TiltCard max={6} className="relative overflow-hidden rounded-[2.5rem] shadow-card">
        <img
          src={meadowImg}
          alt="שביל בשדה ירוק פורח — דרך של תקווה"
          width={1280}
          height={960}
          loading="lazy"
          className="h-full w-full scale-110 object-cover"
          style={{ transform: "translateY(calc(var(--py, 0) * -40px)) scale(1.12)" }}
        />
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl glass p-4">
          <p className="font-display text-lg font-black text-foreground">דרך של תקווה</p>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            יחד לאורך כל הדרך
          </span>
        </div>
      </TiltCard>
    </div>
  );
}

function SupportCard({ icon: Icon, title, desc, tone }: SupportCardData) {
  const toneClasses: Record<Tone, string> = {
    primary: "from-primary/20 to-primary/5 text-primary",
    leaf: "from-leaf/30 to-leaf/5 text-leaf-foreground",
    sun: "from-sun/40 to-sun/10 text-sun-foreground",
  };

  return (
    <TiltCard className="group h-full rounded-[1.75rem] border border-white/60 bg-card/85 p-5 text-center shadow-card backdrop-blur-xl sm:p-6">
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-8deg] group-hover:scale-110 ${toneClasses[tone] ?? toneClasses.primary}`}
      >
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-4 font-display text-base font-extrabold text-foreground sm:text-lg">
        {title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{desc}</p>
    </TiltCard>
  );
}
