import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, LifeBuoy, Users, HandHeart, Sparkles, Heart, ArrowLeft, Sun, Leaf } from "../components/icons";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "תחומי תמיכה — אור בנפש" },
      {
        name: "description",
        content:
          "ליווי אישי, ייעוץ מקצועי, קבוצות תמיכה, קו חירום, ליווי משפחתי וקהילה — תחומי התמיכה של אור בנפש.",
      },
      { property: "og:title", content: "תחומי תמיכה — אור בנפש" },
      {
        property: "og:description",
        content: "ליווי, ייעוץ, קבוצות תמיכה וקהילה למתמודדי נפש.",
      },
    ],
  }),
  component: ActivitiesPage,
});

const AREAS = [
  {
    icon: Brain,
    title: "תמיכה נפשית אישית",
    desc: "ליווי אישי וקשוב עם מלווה מנוסה, לאורך כל הדרך — מהמשבר ועד הצמיחה. מפגשים פרטניים, דיסקרטיים ובקצב שלך.",
    points: ["מלווה אישי קבוע", "מפגשים פרטניים", "ליווי לאורך זמן"],
    tone: "primary" as const,
  },
  {
    icon: LifeBuoy,
    title: "ייעוץ מקצועי",
    desc: "הכוונה ממומחי בריאות הנפש — פסיכולוגים, עו״סים ופסיכיאטרים — כדי למצוא את הטיפול המתאים לך ולבני משפחתך.",
    points: ["הערכה מקצועית", "הפניה לטיפול", "ייעוץ תרופתי"],
    tone: "leaf" as const,
  },
  {
    icon: Users,
    title: "קבוצות תמיכה",
    desc: "קבוצות קטנות ומונחות, מקוונות ופרונטליות, שבהן שייכות והבנה הופכות לכוח מרפא. לא תהיה לבד בחדר.",
    points: ["קבוצות מונחות", "מפגשים מקוונים", "קהילה מלווה"],
    tone: "sun" as const,
  },
  {
    icon: HandHeart,
    title: "ליווי משפחתי",
    desc: "תמיכה בבני זוג, הורים ואחים — כי המשפחה היא מעגל החיים. כלים, ידע ומרחב לנשימה.",
    points: ["ייעוץ לבני זוג", "סדנאות להורים", "תמיכה לאחים"],
    tone: "primary" as const,
  },
  {
    icon: Sparkles,
    title: "סדנאות והעצמה",
    desc: "סדנאות העצמה, כלים להתמודדות יומיומית ומרחבי יצירה — לבנות חוסן ולמצוא קול ומשמעות.",
    points: ["כלים להתמודדות", "מרחבי יצירה", "בניית חוסן"],
    tone: "leaf" as const,
  },
  {
    icon: Heart,
    title: "קו חירום חם",
    desc: "קו טלפון חם ודיסקרטי, זמין 24/7 — להכלה, להרגעה ולהפניה לטיפול בעת משבר. חייגו *3042.",
    points: ["זמין 24/7", "דיסקרטי", "הפניה מהירה"],
    tone: "sun" as const,
  },
];

const toneRing: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  leaf: "bg-leaf/15 text-leaf-foreground",
  sun: "bg-sun/20 text-sun-foreground",
};

function ActivitiesPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-leaf/15 to-background py-20">
        <div className="blob-leaf absolute -left-16 -top-10 h-72 w-72 opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">תחומי תמיכה</span>
          <h1 className="mt-3 font-display text-4xl font-black text-foreground sm:text-5xl">מעגל שלם של תמיכה</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            מליווי אישי ועד קהילה — בנינו רשת בטוחה שמחזיקה אתכם בכל רגע ובכל שלב בדרך.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          {AREAS.map((a) => (
            <div
              key={a.title}
              className="grid gap-6 rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center"
            >
              <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${toneRing[a.tone]}`}>
                <a.icon className="h-8 w-8" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-foreground">{a.title}</h2>
                <p className="mt-2 text-muted-foreground">{a.desc}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {a.points.map((p) => (
                    <li key={p} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/contact"
                className="btn-pill inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
              >
                פנייה <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Crisis band */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-sun/15 p-8 text-center sm:p-12">
            <Sun className="h-10 w-10 text-sun-foreground" />
            <h2 className="font-display text-2xl font-black text-foreground">במשבר עכשיו?</h2>
            <p className="max-w-xl text-muted-foreground">
              קו החירום שלנו זמין 24/7, חם ודיסקרטי. אתם לא לבד — חייגו ונדבר.
            </p>
            <a href="tel:*3042" className="btn-pill inline-flex items-center gap-2 bg-sun px-8 py-4 text-base font-bold text-sun-foreground shadow-soft hover:brightness-105">
              <Heart className="h-5 w-5" /> *3042 — קו חירום
            </a>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-gradient-to-l from-primary to-leaf p-8 text-center text-primary-foreground shadow-soft sm:p-12">
            <Leaf className="mx-auto h-10 w-10" />
            <h2 className="mt-3 font-display text-2xl font-black sm:text-3xl">מוכנים לצעוד את הצעד הראשון?</h2>
            <p className="mt-3 text-sm opacity-90">הפנייה דיסקרטית וללא התחייבות.</p>
            <Link to="/contact" className="btn-pill mt-6 inline-flex items-center gap-2 bg-accent px-7 py-3.5 text-base font-bold text-accent-foreground hover:brightness-105">
              <Heart className="h-5 w-5" /> צרו קשר
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
