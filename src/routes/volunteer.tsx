import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Users, LifeBuoy, Brain, HandHeart, Sparkles, ArrowLeft } from "../components/icons";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "התנדבות — מצמיחים מהלב" },
      {
        name: "description",
        content:
          "הצטרפו למעגל התמיכה של מצמיחים מהלב — התנדבות כמלווה, בקו החירום, בקהילה ועוד.",
      },
      { property: "og:title", content: "התנדבות — מצמיחים מהלב" },
      {
        property: "og:description",
        content: "הצטרפו למעגל התמיכה של מצמיחים מהלב — שעות של משמעות.",
      },
    ],
  }),
  component: VolunteerPage,
});

const ROLES = [
  { icon: HandHeart, title: "מלווה אישי", desc: "ליווי אישי שוטף של מתמודד/ת לאורך תקופה.", tone: "primary" as const },
  { icon: LifeBuoy, title: "מתנדב/ת בקו החירום", desc: "הכשרה ומשמרות בקו 24/7 — הכלה והפניה.", tone: "leaf" as const },
  { icon: Users, title: "מנחה/ת קבוצה", desc: "הנחיית קבוצות תמיכה מקוונות ופרונטליות.", tone: "sun" as const },
  { icon: Brain, title: "איש/ת מקצוע", desc: "פסיכולוגים, עו״סים ומטפלים — ייעוץ והכוונה.", tone: "primary" as const },
  { icon: Sparkles, title: "צוות הסברה ותוכן", desc: "כתיבה, עריכה והעלאת תוכן מעצים.", tone: "leaf" as const },
  { icon: Heart, title: "עזרה לוגיסטית", desc: "אירועים, לוגיסטיקה וגיוס קהילה.", tone: "sun" as const },
];

const toneRing: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  leaf: "bg-leaf/15 text-leaf-foreground",
  sun: "bg-sun/20 text-sun-foreground",
};

function VolunteerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const { error: err } = await supabase.from("volunteer_applications").insert({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      role: String(fd.get("role") ?? ""),
      message: String(fd.get("message") ?? ""),
    });
    setSending(false);
    if (err) {
      setError("אירעה תקלה בשליחה. אפשר לנסות שוב.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-leaf/15 to-background py-20">
        <div className="blob-leaf absolute -right-16 -top-10 h-72 w-72 opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">התנדבות</span>
          <h1 className="mt-3 font-display text-4xl font-black text-foreground sm:text-5xl">שעות של משמעות</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            הצטרפו למעגל התמיכה של מצמיחים מהלב. כל שעת התנדבות היא עוד אדם שלא נשאר לבד.
          </p>
        </div>
      </section>

      {/* roles */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-black text-foreground">תפקידי התנדבות</h2>
            <p className="mt-3 text-muted-foreground">מליווי אישי ועד צוות הסברה — יש מקום לכל אחד ואחת.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((r) => (
              <div key={r.title} className="group rounded-[1.5rem] border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneRing[r.tone]}`}>
                  <r.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold text-foreground">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* process */}
      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-black text-foreground">איך מצטרפים?</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { n: "1", title: "מלאו טופס", desc: "ספרו לנו עליכם ועל תחום ההתנדבות שמתאים לכם." },
              { n: "2", title: "שיחת היכרות", desc: "שיחה קצרה ואישית להתאמת תפקיד והכשרה." },
              { n: "3", title: "מתחילים ללוות", desc: "הכשרה, ליווי צוות והצטרפות למעגל התמיכה." },
            ].map((s) => (
              <div key={s.n} className="rounded-[1.5rem] border border-border bg-card p-6 text-center shadow-card">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-xl font-black">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* form */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-card">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf/15 text-leaf-foreground">
                <Heart className="h-8 w-8" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-black text-foreground">תודה שבחרת ללכת איתנו!</h2>
              <p className="mt-3 text-muted-foreground">ניצור איתך קשר בהקדם לשיחת היכרות.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-pill mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
              >
                הגשת טופס נוסף
              </button>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-8">
              <h2 className="font-display text-2xl font-black text-foreground">טופס הרשמה להתנדבות</h2>
              <p className="mt-1 text-sm text-muted-foreground">הפרטים נשמרים בדיסקרטיות מלאה.</p>
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <Field label="שם מלא" name="name" placeholder="ישראל ישראלי" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="דוא״ל" name="email" type="email" placeholder="you@example.com" />
                  <Field label="טלפון" name="phone" type="tel" placeholder="050-0000000" />
                </div>
                <div>
                  <label htmlFor="role" className="text-sm font-semibold text-foreground">תחום התנדבות מועדף</label>
                  <select
                    id="role"
                    name="role"
                    className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>מלווה אישי</option>
                    <option>קו חירום</option>
                    <option>מנחה/ת קבוצה</option>
                    <option>איש/ת מקצוע</option>
                    <option>הסברה ותוכן</option>
                    <option>לוגיסטיקה ואירועים</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="exp" className="text-sm font-semibold text-foreground">ניסיון רלוונטי (לא חובה)</label>
                  <textarea
                    id="exp"
                    name="message"
                    rows={3}
                    placeholder="ספרו לנו בקצרה על ניסיונכם או זמינותכם"
                    className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-pill inline-flex w-full items-center justify-center gap-2 bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-soft hover:bg-primary/90 disabled:opacity-60"
                >
                  <Heart className="h-5 w-5" /> {sending ? "שולח…" : "שליחת הטופס"}
                </button>

              </form>
            </div>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Link to="/contact" className="btn-pill inline-flex items-center gap-2 border border-primary px-6 py-3 text-sm font-bold text-primary hover:bg-primary/10">
            שאלות? צרו איתנו קשר <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
