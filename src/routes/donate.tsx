import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Sparkles, Users, LifeBuoy } from "../components/icons";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "תרומות — מצמיחים מהלב" },
      {
        name: "description",
        content:
          "התרומה שלך מאפשרת ליווי, ייעוץ וקהילה למתמודדי נפש. תרמו למצמיחים מהלב.",
      },
      { property: "og:title", content: "תרומות — מצמיחים מהלב" },
      {
        property: "og:description",
        content: "התרומה שלך מאפשרת ליווי, ייעוץ וקהילה למתמודדי נפש.",
      },
    ],
  }),
  component: DonatePage,
});

const TIERS = [
  { amount: 36, label: "חבר מלווה", desc: "שעת ליווי אישי למתמודד/ת", tone: "primary" as const },
  { amount: 120, label: "חבר תומך", desc: "חודש של קבוצת תמיכה למשתתף/ת", tone: "leaf" as const },
  { amount: 360, label: "חבר מאיר", desc: "הפעלת קו החירום ל-24 שעות", tone: "sun" as const },
];

const ring: Record<string, string> = {
  primary: "border-primary bg-primary/5",
  leaf: "border-leaf bg-leaf/5",
  sun: "border-sun bg-sun/10",
};

function DonatePage() {
  const [selected, setSelected] = useState<number | null>(120);
  const [custom, setCustom] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [monthly, setMonthly] = useState(false);

  const amount = custom ? Number(custom) : selected ?? 0;

  if (submitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md rounded-[2rem] border border-border bg-card p-8 text-center shadow-card">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf/15 text-leaf-foreground">
            <Heart className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-black text-foreground">תודה רבה!</h1>
          <p className="mt-3 text-muted-foreground">
            תרומתך תאפשר ליווי ותמיכה למתמודדי נפש. נשלח אליך אישור תרומה במייל בהקדם.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-pill mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
          >
            תרומה נוספת
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-sun/15 to-background py-20">
        <div className="blob-sun absolute -left-16 -top-10 h-72 w-72 opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">תרומות</span>
          <h1 className="mt-3 font-display text-4xl font-black text-foreground sm:text-5xl">אתם האור בדרך</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            התרומה שלך הופכת לשעת ליווי, לשיחת חירום ולקהילה מחזיקה. כל סכום עושה הבדל.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
          {/* tiers */}
          <div>
            <h2 className="font-display text-2xl font-black text-foreground">בחרו סכום תרומה</h2>
            <p className="mt-2 text-sm text-muted-foreground">הסכומים לדוגמה — ניתן גם לתרום כל סכום אחר.</p>
            <div className="mt-6 space-y-4">
              {TIERS.map((t) => {
                const active = selected === t.amount && !custom;
                return (
                  <button
                    key={t.amount}
                    onClick={() => {
                      setSelected(t.amount);
                      setCustom("");
                    }}
                    className={`flex w-full items-center gap-4 rounded-[1.5rem] border-2 p-5 text-start transition-all ${
                      active ? `${ring[t.tone]} shadow-card` : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="font-display text-3xl font-black text-foreground">₪{t.amount}</span>
                    <span className="flex flex-col">
                      <span className="font-display text-base font-extrabold text-foreground">{t.label}</span>
                      <span className="text-sm text-muted-foreground">{t.desc}</span>
                    </span>
                    {active && <Heart className="ms-auto h-5 w-5 text-primary" />}
                  </button>
                );
              })}

              <div className={`rounded-[1.5rem] border-2 p-5 ${custom ? "border-primary bg-primary/5 shadow-card" : "border-border bg-card"}`}>
                <label className="text-sm font-semibold text-foreground">סכום אחר (₪)</label>
                <input
                  type="number"
                  min={1}
                  value={custom}
                  onChange={(e) => {
                    setCustom(e.target.value);
                    setSelected(null);
                  }}
                  placeholder="למשל 180"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-lg font-bold text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={monthly}
                  onChange={(e) => setMonthly(e.target.checked)}
                  className="h-5 w-5 accent-primary"
                />
                תרומה חודשית קבועה
              </label>
              <span className="rounded-full bg-leaf/15 px-3 py-1 text-xs font-bold text-leaf-foreground">
                תמיכה לאורך זמן
              </span>
            </div>
          </div>

          {/* form */}
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-8">
            <h2 className="font-display text-xl font-extrabold text-foreground">פרטי התרומה</h2>
            <p className="mt-1 text-sm text-muted-foreground">תרומה בגובה ₪{amount || "—"}{monthly ? " / חודש" : ""}</p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Field label="שם מלא" name="name" placeholder="ישראל ישראלי" />
              <Field label="דוא״ל" name="email" type="email" placeholder="you@example.com" />
              <Field label="טלפון" name="phone" type="tel" placeholder="050-0000000" />
              <div>
                <label className="text-sm font-semibold text-foreground">הודעה (לא חובה)</label>
                <textarea
                  rows={3}
                  placeholder="ברצוני להקדיש את התרומה ל…"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-primary" />
                קראתי ואישרתי את תקנון העמותה ואת תנאי התרומה.
              </label>
              <button
                type="submit"
                disabled={!amount}
                className="btn-pill inline-flex w-full items-center justify-center gap-2 bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-soft hover:bg-primary/90 disabled:opacity-50"
              >
                <Heart className="h-5 w-5" /> לתרומה ₪{amount || "—"}{monthly ? " / חודש" : ""}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                אישור תרומה לפי סעיף 46 לפקודת מס הכנסה. תשלום מאובטח.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* impact */}
      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-black text-foreground">לאן הולכת התרומה שלך</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              { icon: LifeBuoy, title: "75% — תמיכה ישירה", desc: "ליווי, ייעוץ וקו חירום." },
              { icon: Users, title: "15% — קהילה ומתנדבים", desc: "הכשרת מתנדבים וקבוצות." },
              { icon: Sparkles, title: "10% — מנהל והסברה", desc: "שמירת רצף פעילות העמותה." },
            ].map((i) => (
              <div key={i.title} className="rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <i.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold text-foreground">{i.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{i.desc}</p>
              </div>
            ))}
          </div>
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
