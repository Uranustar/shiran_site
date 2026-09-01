import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Brain, Users, LifeBuoy, Sparkles, ArrowLeft, HandHeart } from "../components/icons";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "אודות — מצמיחים מהלב" },
      {
        name: "description",
        content:
          "הסיפור, המסר והערכים של מצמיחים מהלב — עמותה לתמיכה במתמודדי נפש.",
      },
      { property: "og:title", content: "אודות — מצמיחים מהלב" },
      {
        property: "og:description",
        content: "הסיפור, המסר והערכים של מצמיחים מהלב — עמותה לתמיכה במתמודדי נפש.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: Heart, title: "כבוד וכבוד הדדי", desc: "כל אדם ראוי ליחס מכבד, ללא שיפוט וללא תיוג." },
  { icon: Brain, title: "מקצועיות", desc: "צוות מיומן ומנוסה, מלווה בהכשרה מתמדת." },
  { icon: Sparkles, title: "דיסקרטיות", desc: "פרטיות מלאה ושמירה על צנעת הפרט בכל מגע." },
  { icon: Users, title: "קהילתיות", desc: "ריפוי קורה בתוך קשר — אנו בונים מעגלי שייכות." },
];

const TEAM = [
  { name: "ד״ר רונה אבני", role: "מנכ״לית ומנהלת קלינית", tone: "primary" },
  { name: "איתי לוי", role: "רכז קהילה ומתנדבים", tone: "leaf" },
  { name: "מיה כהן", role: "אחראית קו החירום", tone: "sun" },
  { name: "נועם דרור", role: "יועצת משפחתית ראשית", tone: "primary" },
];

function AboutPage() {
  return (
    <div>
      {/* Page hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/15 to-background py-20">
        <div className="blob-teal absolute -right-16 -top-10 h-72 w-72 opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            אודותינו
          </span>
          <h1 className="mt-3 font-display text-4xl font-black text-foreground sm:text-5xl">
            קמנו כדי שאף אחד לא יישאר לבד
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            מצמיחים מהלב היא עמותה התנדבותית שהוקמה מתוך ידיעה עמוקה: ריפוי מתחיל בקשר.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-black text-foreground">הסיפור שלנו</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                מצמיחים מהלב נולדה מתוך חוויה אישית — משפחה שחיפשה תמיכה ולא מצאה כתף
                אנושית שתחזיק אותה. הבנו שבין הקליניקה לבין הבידוד יש מרחב שלם של
                קשר, קשב וקהילה — והחלטנו לבנות אותו.
              </p>
              <p>
                היום אנו מלווים אלפי מתמודדי נפש ובני משפחותיהם בליווי אישי וקבוצתי,
                בייעוץ מקצועי, בקו חירום חם ובקהילה מכילה — הכל באהבה ובכבוד.
              </p>
            </div>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-primary/10 via-sun/10 to-leaf/10 p-8">
            <h3 className="font-display text-xl font-extrabold text-foreground">המסר שלנו</h3>
            <p className="mt-4 text-lg font-medium leading-relaxed text-foreground">
              "מחלה אינה זהות. כל אדם הוא שלם, ראוי ובעל יכולת להחלים — ואנחנו כאן
              כדי ללכת איתו בדרך."
            </p>
            <Link
              to="/activities"
              className="btn-pill mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              תחומי התמיכה <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-black text-foreground">הערכים שמובילים אותנו</h2>
            <p className="mt-3 text-muted-foreground">הם המצפן של כל מפגש, כל שיחה וכל יום.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold text-foreground">{v.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">הצוות שלנו</span>
            <h2 className="mt-3 font-display text-3xl font-black text-foreground">אנשים של קשר</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m) => {
              const ring =
                m.tone === "leaf"
                  ? "bg-leaf/15 text-leaf-foreground"
                  : m.tone === "sun"
                  ? "bg-sun/20 text-sun-foreground"
                  : "bg-primary/10 text-primary";
              return (
                <div key={m.name} className="rounded-[1.5rem] border border-border bg-card p-6 text-center shadow-card">
                  <span className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${ring}`}>
                    <HandHeart className="h-9 w-9" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-extrabold text-foreground">{m.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{m.role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-gradient-to-l from-primary to-leaf p-8 text-center text-primary-foreground shadow-soft sm:p-12">
            <h2 className="font-display text-2xl font-black sm:text-3xl">רוצים ללכת איתנו בדרך?</h2>
            <p className="mt-3 text-sm opacity-90">בואו להתנדב, לתרום או פשוט לשוחח.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/volunteer" className="btn-pill inline-flex items-center gap-2 bg-accent px-6 py-3 text-sm font-bold text-accent-foreground hover:brightness-105">
                <Heart className="h-4 w-4" /> להתנדבות
              </Link>
              <Link to="/donate" className="btn-pill inline-flex items-center gap-2 bg-background/20 px-6 py-3 text-sm font-bold text-primary-foreground backdrop-blur-sm hover:bg-background/30">
                <Heart className="h-4 w-4" /> לתרומה
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
