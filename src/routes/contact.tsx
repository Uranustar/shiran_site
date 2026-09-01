import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, MapPin, Heart, MessageCircle, LifeBuoy } from "../components/icons";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "צור קשר — מצמיחים מהלב" },
      {
        name: "description",
        content:
          "צרו קשר עם מצמיחים מהלב — קו חירום, וואטסאפ, דוא״ל וכתובת. הפנייה דיסקרטית ומכבדת.",
      },
      { property: "og:title", content: "צור קשר — מצמיחים מהלב" },
      {
        property: "og:description",
        content: "קו חירום, וואטסאפ ופנייה דיסקרטית — אנחנו כאן בשבילך.",
      },
    ],
  }),
  component: ContactPage,
});

const CHANNELS = [
  { icon: LifeBuoy, title: "קו חירום חם", value: "*3042", sub: "זמין 24/7, דיסקרטי", href: "tel:*3042", tone: "primary" as const },
  { icon: MessageCircle, title: "וואטסאפ", value: "050-0000000", sub: "ימים א'-ה' 9:00–20:00", href: "https://wa.me/9720000000", tone: "leaf" as const },
  { icon: Mail, title: "דוא״ל", value: "info@orbanefesh.org.il", sub: "חוזרים תוך יומיים", href: "mailto:info@orbanefesh.org.il", tone: "sun" as const },
];

const toneRing: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  leaf: "bg-leaf/15 text-leaf-foreground",
  sun: "bg-sun/20 text-sun-foreground",
};

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const { error: err } = await supabase.from("contact_messages").insert({
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      topic: String(fd.get("topic") ?? ""),
      message: String(fd.get("message") ?? ""),
    });
    setSending(false);
    if (err) {
      setError("אירעה תקלה בשליחה. אפשר לנסות שוב או להתקשר אלינו.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/15 to-background py-20">
        <div className="blob-teal absolute -left-16 -top-10 h-72 w-72 opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">צור קשר</span>
          <h1 className="mt-3 font-display text-4xl font-black text-foreground sm:text-5xl">אנחנו כאן בשבילך</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            פנייה דיסקרטית, מכבדת וללא התחייבות. בחרו את הערוץ הנוח לכם.
          </p>
        </div>
      </section>

      {/* channels */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-3">
            {CHANNELS.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="group rounded-[1.5rem] border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneRing[c.tone]}`}>
                  <c.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-base font-extrabold text-foreground">{c.title}</h3>
                <p className="mt-1 font-display text-xl font-black text-primary">{c.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* form + info */}
      <section className="py-12">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf/15 text-leaf-foreground">
                  <Heart className="h-8 w-8" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-black text-foreground">ההודעה נשלחה!</h2>
                <p className="mt-3 text-muted-foreground">תודה שפנית אלינו. נחזור אליך בהקדם.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-pill mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                >
                  שליחת הודעה נוספת
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-black text-foreground">שלחו לנו הודעה</h2>
                <p className="mt-1 text-sm text-muted-foreground">כל פנייה נענית בדיסקרטיות מלאה.</p>
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="שם מלא" name="name" placeholder="ישראל ישראלי" />
                    <Field label="טלפון" name="phone" type="tel" placeholder="050-0000000" />
                  </div>
                  <Field label="דוא״ל" name="email" type="email" placeholder="you@example.com" />
                  <div>
                    <label htmlFor="topic" className="text-sm font-semibold text-foreground">נושא הפנייה</label>
                    <select
                      id="topic"
                      className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>בקשת סיוע / ליווי</option>
                      <option>ייעוץ מקצועי</option>
                      <option>התנדבות</option>
                      <option>תרומה</option>
                      <option>אחר</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="msg" className="text-sm font-semibold text-foreground">הודעה</label>
                    <textarea
                      id="msg"
                      required
                      rows={5}
                      placeholder="ספרו לנו בקצרה כיצד נוכל לסייע"
                      className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-primary" />
                    אישרתי שמצמיחים מהלב תיצור איתי קשר בנוגע לפנייתי.
                  </label>
                  <button
                    type="submit"
                    className="btn-pill inline-flex w-full items-center justify-center gap-2 bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-soft hover:bg-primary/90"
                  >
                    <Heart className="h-5 w-5" /> שליחת ההודעה
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-muted/50 p-6">
              <h3 className="font-display text-lg font-extrabold text-foreground">פרטים נוספים</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> *3042 — קו לייעוץ דיסקרטי
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" /> info@orbanefesh.org.il
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" /> רחוב התקווה 12, תל אביב
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                עמותה רשומה (ע״ר) — אישור תרומה לפי סעיף 46.
              </p>
            </div>
            <div className="rounded-[2rem] bg-gradient-to-br from-primary/10 via-sun/10 to-leaf/10 p-6">
              <h3 className="font-display text-lg font-extrabold text-foreground">שעות פעילות משרד</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex justify-between"><span>ימים א'-ה'</span><span className="font-semibold text-foreground">9:00–20:00</span></li>
                <li className="flex justify-between"><span>שישי</span><span className="font-semibold text-foreground">9:00–13:00</span></li>
                <li className="flex justify-between"><span>קו חירום</span><span className="font-semibold text-foreground">24/7</span></li>
              </ul>
            </div>
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
