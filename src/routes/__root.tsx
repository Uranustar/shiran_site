import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import {
  ScrollProgress,
  CustomCursor,
  useScrollReveal,
  useGlobalSpotlight,
  Magnetic,
} from "../components/fx";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Phone, MessageCircle, Heart, Mail, MapPin, ArrowLeft } from "../components/icons";

const NAV = [
  { to: "/", label: "דף הבית" },
  { to: "/about", label: "אודות" },
  { to: "/activities", label: "תחומי תמיכה" },
  { to: "/volunteer", label: "התנדבות" },
  { to: "/contact", label: "צור קשר" },
] as const;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">העמוד לא נמצא</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          מצטערים, העמוד שחיפשת אינו קיים או הועבר.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="btn-pill inline-flex items-center justify-center bg-primary px-6 py-3 text-sm text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">העמוד לא נטען</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          משהו השתבש אצלנו. ניתן לרענן את הדף או לחזור לדף הבית.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-pill inline-flex items-center justify-center bg-primary px-6 py-3 text-sm text-primary-foreground hover:bg-primary/90"
          >
            נסה שוב
          </button>
          <Link
            to="/"
            className="btn-pill inline-flex items-center justify-center border border-input bg-background px-6 py-3 text-sm text-foreground hover:bg-accent"
          >
            דף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "description",
        content: "מצמיחים מהלב — עמותה לתמיכה במתמודדי נפש. ליווי, ייעוץ וקהילה בדרך לריפוי.",
      },
      { property: "og:title", content: "מצמיחים מהלב — עמותה לתמיכה במתמודדי נפש" },
      { property: "og:description", content: "ליווי, ייעוץ וקהילה בדרך לריפוי. לא תהיו לבד." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800;900&family=Assistant:wght@300;400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  useScrollReveal(pathname, isAdmin ? undefined : "main.ed-main");
  useGlobalSpotlight();

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollProgress />
      {!isAdmin && <CustomCursor />}
      <SiteChrome />
      <main className={`relative pt-[4.5rem] ${isAdmin ? "" : "ed-main"}`}>
        <Outlet />
      </main>
      <SiteFooter />
      {!isAdmin && <FloatingActions />}
    </QueryClientProvider>
  );
}

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function Wordmark({ invert = false }: { invert?: boolean }) {
  return (
    <span className="flex items-baseline gap-1.5 leading-none">
      <span
        className={`font-display text-xl font-black tracking-tight ${invert ? "text-paper" : "text-ink"}`}
      >
        מצמיחים
      </span>
      <span className="font-serif-italic text-xl text-primary">מהלב</span>
      <Heart className="h-3.5 w-3.5 self-center fill-blossom text-blossom" />
    </span>
  );
}

/** True while the fixed header overlaps a dark hero ([data-hero-dark]). */
function useOverDarkHero() {
  const [over, setOver] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const check = () => {
      const el = document.querySelector("[data-hero-dark]");
      setOver(!!el && el.getBoundingClientRect().bottom > 72);
    };
    check();
    const raf = requestAnimationFrame(check);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [pathname]);
  return over;
}

function SiteChrome() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  const overDark = useOverDarkHero();
  const light = open || overDark;
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled && !light ? "bg-paper/85 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-8">
          <Link to="/" className="relative z-[70]" aria-label="מצמיחים מהלב — דף הבית">
            <Wordmark invert={light} />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                className={`link-line group flex items-baseline gap-1 py-1 text-[15px] font-semibold transition-colors duration-300 ${light ? "text-paper" : "text-ink"}`}
                activeProps={{ "aria-current": "page" as const }}
                activeOptions={{ exact: item.to === "/" }}
              >
                <span className="text-[10px] font-bold text-muted-foreground transition-colors group-hover:text-primary">
                  0{i + 1}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="relative z-[70] flex items-center gap-2 sm:gap-3">
            <a
              href="tel:*3042"
              className={`hidden items-center gap-2 text-sm font-bold sm:inline-flex ${light ? "text-paper" : "text-ink"}`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-soft absolute inset-0 rounded-full bg-primary" />
                <span className="relative h-2 w-2 rounded-full bg-primary" />
              </span>
              <span dir="ltr">*3042</span>
            </a>
            <Magnetic>
              <Link
                to="/donate"
                className="btn-pill inline-flex items-center gap-2 bg-sun px-5 py-2.5 text-sm font-black text-ink hover:bg-ink hover:text-sun"
              >
                לתרומה
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Magnetic>
            <button
              type="button"
              aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors lg:hidden ${
                light ? "border-paper/30 text-paper" : "border-ink/20 text-ink"
              }`}
            >
              {open ? "סגירה" : "תפריט"}
              <span className="relative block h-2.5 w-4">
                <span
                  className={`absolute inset-x-0 top-0 h-[1.5px] bg-current transition-all duration-300 ${open ? "top-1/2 rotate-45" : ""}`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-[1.5px] bg-current transition-all duration-300 ${open ? "bottom-auto top-1/2 -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen menu */}
      <div
        className={`fixed inset-0 z-[45] flex flex-col bg-ink text-paper transition-[clip-path] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] lg:hidden ${
          open
            ? "[clip-path:circle(150%_at_90%_2rem)]"
            : "pointer-events-none [clip-path:circle(0%_at_90%_2rem)]"
        }`}
        aria-hidden={!open}
      >
        <nav className="mt-24 flex flex-1 flex-col justify-center px-6">
          {NAV.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              tabIndex={open ? 0 : -1}
              className="group flex items-baseline gap-4 border-b border-paper/10 py-4 transition-all duration-500"
              style={{
                transitionDelay: open ? `${150 + i * 60}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "none" : "translateY(30px)",
              }}
            >
              <span className="text-xs font-bold text-sun">0{i + 1}</span>
              <span className="font-display text-5xl font-black tracking-tight group-hover:text-sun">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-paper/10 px-6 py-6 text-sm">
          <a
            href="tel:*3042"
            tabIndex={open ? 0 : -1}
            className="flex items-center gap-2 font-bold"
          >
            <Phone className="h-4 w-4 text-primary" /> לייעוץ דיסקרטי <span dir="ltr">*3042</span>
          </a>
          <span className="font-serif-italic text-paper/60">לא תהיו לבד</span>
        </div>
      </div>
    </>
  );
}

function FloatingActions() {
  const [open, setOpen] = useState(false);
  // the dark hero has its own call buttons — keep the FAB out of the way there
  const hidden = useOverDarkHero() && !open;
  const actions = [
    { href: "tel:*3042", label: "לייעוץ דיסקרטי", icon: Phone },
    { href: "https://wa.me/9720000000", label: "וואטסאפ", icon: MessageCircle, external: true },
    { href: "/contact", label: "דברו איתנו", icon: Mail },
  ];
  return (
    <div
      className={`fixed bottom-5 left-4 z-40 flex flex-col-reverse items-start gap-2 transition-all duration-500 lg:left-6 ${
        hidden ? "pointer-events-none translate-y-6 opacity-0" : ""
      }`}
    >
      <button
        type="button"
        aria-label={open ? "סגירת אפשרויות יצירת קשר" : "פתיחת אפשרויות יצירת קשר"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-paper ring-4 ring-paper/60 transition-transform duration-300 hover:scale-105"
      >
        {!open && (
          <span className="animate-ping-soft absolute inset-0 rounded-full bg-primary/40" />
        )}
        <span
          className={`relative transition-transform duration-300 ${open ? "rotate-[135deg]" : ""}`}
        >
          {open ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </span>
      </button>
      {actions.map((a, i) => {
        const Icon = a.icon;
        const cls = `inline-flex items-center gap-2 rounded-full border border-ink bg-paper px-4 py-2.5 text-sm font-bold text-ink transition-all duration-300 hover:bg-sun ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`;
        const style = { transitionDelay: open ? `${(actions.length - i) * 50}ms` : "0ms" };
        return a.href.startsWith("/") ? (
          <Link
            key={a.label}
            to={a.href}
            className={cls}
            style={style}
            onClick={() => setOpen(false)}
          >
            <Icon className="h-4 w-4" /> {a.label}
          </Link>
        ) : (
          <a
            key={a.label}
            href={a.href}
            target={a.external ? "_blank" : undefined}
            rel={a.external ? "noreferrer" : undefined}
            className={cls}
            style={style}
          >
            <Icon className="h-4 w-4" /> {a.label}
          </a>
        );
      })}
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="grain relative mt-32 overflow-hidden bg-ink text-paper">
      {/* CTA */}
      <div className="mx-auto max-w-[1400px] px-4 pt-24 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <span className="text-xs font-bold tracking-widest text-sun">(תרומה)</span>
            <h3 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
              יחד, אף אחד
              <br />
              <span className="font-serif-italic font-normal text-primary">לא נשאר</span> לבד.
            </h3>
          </div>
          <div className="lg:col-span-4 lg:text-left">
            <p className="text-base text-paper/70 lg:mr-auto lg:max-w-xs">
              התרומה שלך מאפשרת ליווי, ייעוץ וקהילה למתמודדי נפש ולבני משפחותיהם.
            </p>
            <Magnetic strength={0.4}>
              <Link
                to="/donate"
                data-cursor="תודה ♥"
                className="mt-6 inline-flex h-36 w-36 items-center justify-center rounded-full bg-sun text-center font-display text-xl font-black leading-tight text-ink transition-transform duration-500 hover:scale-110 hover:rotate-[-8deg]"
              >
                לתרומה
                <br />
                עכשיו
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-20 grid max-w-[1400px] gap-10 border-t border-paper/15 px-4 py-14 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Wordmark invert />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/60">
            עמותה לתמיכה במתמודדי נפש. אנו מלווים אנשים ומשפחות בדרך לריפוי באהבה, במקצועיות ובכבוד
            — ללא תיוג וללא שיפוט.
          </p>
        </div>
        <div className="lg:col-span-3">
          <h4 className="text-xs font-bold tracking-widest text-sun">(ניווט)</h4>
          <ul className="mt-5 space-y-2 text-base">
            {[...NAV, { to: "/donate", label: "תרומות" } as const].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="link-line text-paper/80 hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-3">
          <h4 className="text-xs font-bold tracking-widest text-sun">(צור קשר)</h4>
          <ul className="mt-5 space-y-3 text-sm text-paper/80">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> <span dir="ltr">*3042</span> — קו לייעוץ
              דיסקרטי
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> info@orbanefesh.org.il
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" /> רחוב התקווה 12, תל אביב
            </li>
          </ul>
        </div>
      </div>

      {/* Giant wordmark */}
      <div aria-hidden className="select-none overflow-hidden px-2">
        <p className="whitespace-nowrap text-center font-display text-[13.5vw] font-black leading-[0.8] tracking-tighter text-paper/[0.06]">
          מצמיחים מהלב
        </p>
      </div>

      <div className="border-t border-paper/15">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-paper/50 sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} מצמיחים מהלב — עמותה רשומה. כל הזכויות שמורות.</p>
          <p>נבנה באהבה</p>
        </div>
      </div>
    </footer>
  );
}
