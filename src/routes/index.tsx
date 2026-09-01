import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "../components/icons";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "אור בנפש — עמותה לתמיכה במתמודדי נפש" },
      {
        name: "description",
        content:
          "אור בנפש היא עמותה לתמיכה במתמודדי נפש. ליווי אישי, ייעוץ מקצועי, קבוצות תמיכה וקהילה — לא תהיו לבד בדרך.",
      },
      { property: "og:title", content: "אור בנפש — עמותה לתמיכה במתמודדי נפש" },
      {
        property: "og:description",
        content: "ליווי, ייעוץ וקהילה בדרך לריפוי. לא תהיו לבד בדרך.",
      },
    ],
  }),
  component: HomePage,
});

const SUPPORT_CARDS: { icon: typeof Heart; title: string; desc: string; tone: Tone }[] = [
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
];

const SERVICES = [
  { icon: HandHeart, title: "ליווי משפחתי", desc: "תמיכה בבני משפחה ובני זוג" },
  { icon: Sparkles, title: "סדנאות העצמה", desc: "כלים לריפוי וצמיחה" },
  { icon: Users, title: "קהילה מקוונת", desc: "שייכות בכל רגע ובכל מקום" },
  { icon: LifeBuoy, title: "הפניה לטיפול", desc: "גישור לטיפול מקצועי מתאים" },
];

const INFO = [
  { title: "משבר נפשי", desc: "הרגעה, הכלה והפניה לטיפול בעת משבר.", cta: "לקבלת סיוע" },
  { title: "סיפורי החלמה", desc: "קולות של תקווה ממתמודדים שחלקו את דרכם.", cta: "בואו לקרוא" },
  { title: "מידע שימושי", desc: "כל מה שחשוב לדעת על בריאות הנפש וזכויות.", cta: "בואו לגלות" },
  { title: "התנדבות איתנו", desc: "שעות של משמעות — הצטרפו למעגל התמיכה.", cta: "להרשמה" },
];

const STATS = [
  { value: "+12,000", label: "מתמודדים ומשפחות לוו" },
  { value: "24/7", label: "קו חירום חם ודיסקרטי" },
  { value: "+450", label: "מתנדבים ומלווים" },
  { value: "100%", label: "ללא תיוג וללא שיפוט" },
];

function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative mx-auto flex min-h-[88vh] max-w-4xl flex-col items-center justify-center px-4 py-28 text-center">
          <span className="btn-pill inline-flex items-center gap-2 bg-background/30 px-4 py-2 text-sm font-bold text-background backdrop-blur-sm">
            <Sparkles className="h-4 w-4" /> עמותה לתמיכה במתמודדי נפש
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-tight text-background drop-shadow-sm sm:text-6xl">
            לא תהיו לבד <br className="hidden sm:block" /> בדרך אל האור
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-background/90">
            אנחנו כאן בשבילך — ליווי אישי, ייעוץ מקצועי וקהילה חמה, באהבה ובכבוד,
            ללא תיוג וללא שיפוט.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              to="/donate"
              className="btn-pill inline-flex items-center gap-2 bg-accent px-8 py-4 text-base font-bold text-accent-foreground shadow-soft hover:brightness-105"
            >
              <Heart className="h-5 w-5" /> לתרומה
            </Link>
            <a
              href="tel:*3042"
              className="btn-pill inline-flex items-center gap-2 bg-background/20 px-8 py-4 text-base font-bold text-background backdrop-blur-sm hover:bg-background/30"
            >
              לקבלת סיוע — *3042
            </a>
          </div>
        </div>
      </section>

      {/* SUPPORT CARDS GRID */}
      <section className="relative -mt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {SUPPORT_CARDS.map((c) => (
              <SupportCard key={c.title} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* INTRO / ABOUT PREVIEW */}
      <section className="relative overflow-hidden py-24">
        <div className="blob-sun absolute -left-20 top-10 h-72 w-72 opacity-50" />
        <div className="blob-leaf absolute -right-20 bottom-0 h-72 w-72 opacity-50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="order-2 lg:order-1">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              הדרך שלנו
            </span>
            <h2 className="mt-3 font-display text-3xl font-black text-foreground sm:text-4xl">
              כל אדם ראוי לתמיכה, לקשב ולתקווה
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              אור בנפש נולדה מתוך האמונה שריפוי מתחיל בקשר. אנו מלווים מתמודדי נפש
              ובני משפחותיהם בליווי אישי וקבוצתי, בייעוץ מקצועי ובקהילה מכילה —
              כדי שאף אחד לא יישאר לבד מול האתגרים שבדרך.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "דיסקרטיות מלאה וכיבוד זכויות הפרט",
                "צוות מקצועי ומתנדבים מנוסים",
                "ליווי לאורך כל הדרך — ללא תיוג",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-foreground">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf/15 text-leaf">
                    <Heart className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">{t}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/about"
              className="btn-pill mt-8 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary/90"
            >
              הכירו עוד עלינו <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-[2rem] shadow-card">
              <img
                src={meadowImg}
                alt="שביל בשדה ירוק פורח — דרך של תקווה"
                width={1280}
                height={960}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-primary/70 to-transparent p-6 text-background">
                <p className="font-display text-lg font-800">דרך של תקווה</p>
                <span className="rounded-full bg-background/30 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                  יחד לאורך כל הדרך
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              תחומי התמיכה שלנו
            </span>
            <h2 className="mt-3 font-display text-3xl font-black text-foreground sm:text-4xl">
              מעגל שלם של תמיכה
            </h2>
            <p className="mt-4 text-muted-foreground">
              מליווי אישי ועד קהילה — בנינו רשת בטוחה שמחזיקה אתכם בכל רגע.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="group rounded-[1.5rem] border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-800 text-foreground">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/activities"
              className="btn-pill inline-flex items-center gap-2 border border-primary bg-transparent px-6 py-3 text-sm font-bold text-primary hover:bg-primary/10"
            >
              לכל תחומי התמיכה <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 rounded-[2rem] bg-gradient-to-l from-primary to-leaf p-8 text-primary-foreground shadow-soft sm:p-12 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-4xl font-black sm:text-5xl">{s.value}</p>
                <p className="mt-2 text-sm opacity-90">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFO / KNOW section */}
      <section className="bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              כדאי לדעת ולהכיר
            </span>
            <h2 className="mt-3 font-display text-3xl font-black text-foreground sm:text-4xl">
              מידע שעושה סדר
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {INFO.map((c) => (
              <div
                key={c.title}
                className="flex flex-col rounded-[1.5rem] border border-border bg-card p-6 shadow-card"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun/20 text-sun-foreground">
                  <Sun className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-800 text-foreground">
                  {c.title}
                </h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.desc}</p>
                <Link
                  to="/activities"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2"
                >
                  {c.cta} <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Quote className="mx-auto h-12 w-12 text-primary/30" />
          <blockquote className="mt-6 font-display text-2xl font-700 leading-relaxed text-foreground sm:text-3xl">
            "כשהגעתי לאור בנפש הרגשתי שלראשונה מישהו באמת שומע אותי. הליווי
            החזיר לי את התקווה ואת הקול שלי."
          </blockquote>
          <p className="mt-6 text-sm font-semibold text-muted-foreground">
            נ' — בוגרת מסלול ליווי אישי
          </p>
        </div>
      </section>
    </div>
  );
}

type Tone = "primary" | "leaf" | "sun";

function SupportCard({
  icon: Icon,
  title,
  desc,
  tone,
}: {
  icon: typeof Heart;
  title: string;
  desc: string;
  tone: Tone;
}) {
  const toneClasses: Record<Tone, string> = {
    primary: "bg-primary/10 text-primary",
    leaf: "bg-leaf/15 text-leaf-foreground",
    sun: "bg-sun/20 text-sun-foreground",
  };
  return (
    <div className="group rounded-[1.5rem] border border-border bg-card p-6 text-center shadow-card transition-transform hover:-translate-y-1">
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
      >
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-4 font-display text-base font-800 text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
