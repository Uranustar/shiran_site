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
  CursorGlow,
  useScrollReveal,
  useGlobalSpotlight,
  Magnetic,
} from "../components/fx";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Phone, MessageCircle, Heart, Mail, MapPin, Sparkles } from "../components/icons";

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
        href: "https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800;900&family=Assistant:wght@300;400;500;600;700&display=swap",
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

  useScrollReveal(pathname, isAdmin ? undefined : "main.fx-main");
  useGlobalSpotlight();

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollProgress />
      {!isAdmin && <CursorGlow />}
      <SiteChrome />
      <main className={`relative z-[2] pt-24 ${isAdmin ? "" : "fx-main"}`}>
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

function SiteChrome() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={`glass mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-3 transition-all duration-500 sm:px-5 ${
          scrolled ? "h-16 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.25)]" : "h-[4.5rem] shadow-soft"
        }`}
      >
        {/* Logo (start = right in RTL) */}
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blossom text-primary-foreground shadow-soft transition-transform duration-500 group-hover:rotate-[-12deg] group-hover:scale-110">
            <Heart className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-black text-foreground sm:text-xl">
              מצמיחים מהלב
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              עמותה לתמיכה במתמודדי נפש
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 rounded-full bg-muted/60 p-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative rounded-full px-4 py-2 text-sm font-semibold text-foreground/75 transition-all duration-300 hover:text-foreground aria-[current=page]:bg-background aria-[current=page]:text-primary aria-[current=page]:shadow-sm"
              activeProps={{ "aria-current": "page" as const }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Left cluster: phone + donate */}
        <div className="flex items-center gap-2">
          <a
            href="tel:*3042"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted xl:inline-flex"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <span className="animate-ping-soft absolute inset-0 rounded-full bg-primary/30" />
              <Phone className="relative h-4 w-4" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[11px] font-semibold text-muted-foreground">
                לייעוץ דיסקרטי
              </span>
              <span dir="ltr">*3042</span>
            </span>
          </a>
          <Magnetic>
            <Link
              to="/donate"
              className="btn-pill relative inline-flex items-center gap-2 overflow-hidden bg-foreground px-5 py-2.5 text-sm font-bold text-background shadow-soft"
            >
              <Heart className="h-4 w-4 text-blossom" />
              לתרומה
            </Link>
          </Magnetic>
          <button
            type="button"
            aria-label="תפריט"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground lg:hidden"
          >
            <span className="relative block h-3.5 w-5">
              <span
                className={`absolute inset-x-0 top-0 h-0.5 rounded bg-current transition-all duration-300 ${open ? "top-1/2 -translate-y-1/2 rotate-45" : ""}`}
              />
              <span
                className={`absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-0.5 rounded bg-current transition-all duration-300 ${open ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className={`mx-auto mt-2 max-w-7xl origin-top transition-all duration-400 lg:hidden ${
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <nav className="glass rounded-[1.75rem] p-3 shadow-soft">
          <div className="flex flex-col gap-1">
            {NAV.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-bold text-foreground transition-all hover:bg-muted aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"
                activeProps={{ "aria-current": "page" as const }}
                activeOptions={{ exact: item.to === "/" }}
                style={{
                  transitionDelay: open ? `${i * 40}ms` : "0ms",
                  transform: open ? "none" : "translateY(-6px)",
                }}
              >
                {item.label}
                <span className="text-xs text-muted-foreground">0{i + 1}</span>
              </Link>
            ))}
            <a
              href="tel:*3042"
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-base font-bold text-primary-foreground"
            >
              <Phone className="h-5 w-5" /> לייעוץ דיסקרטי <span dir="ltr">*3042</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

function FloatingActions() {
  const [open, setOpen] = useState(false);
  const actions = [
    {
      href: "tel:*3042",
      label: "לייעוץ דיסקרטי",
      icon: Phone,
      cls: "bg-primary text-primary-foreground",
    },
    {
      href: "https://wa.me/9720000000",
      label: "וואטסאפ",
      icon: MessageCircle,
      cls: "bg-[#25D366] text-white",
      external: true,
    },
    { href: "/contact", label: "דברו איתנו", icon: Mail, cls: "bg-sun text-sun-foreground" },
  ];
  return (
    <div className="fixed bottom-5 left-4 z-50 flex flex-col-reverse items-start gap-3 lg:left-6">
      <button
        type="button"
        aria-label={open ? "סגירת אפשרויות יצירת קשר" : "פתיחת אפשרויות יצירת קשר"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blossom text-primary-foreground shadow-[0_12px_30px_-8px_var(--primary)] transition-transform duration-300 hover:scale-110"
      >
        {!open && (
          <span className="animate-ping-soft absolute inset-0 rounded-full bg-primary/40" />
        )}
        <span
          className={`relative transition-transform duration-300 ${open ? "rotate-[135deg]" : ""}`}
        >
          {open ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
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
        const cls = `btn-pill inline-flex items-center gap-2 px-4 py-3 text-sm font-bold shadow-soft transition-all duration-300 ${a.cls} ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-75 opacity-0"
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
            <Icon className="h-5 w-5" /> {a.label}
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
            <Icon className="h-5 w-5" /> {a.label}
          </a>
        );
      })}
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="relative z-[2] mt-32 overflow-hidden bg-foreground text-background">
      {/* glow orbs */}
      <div className="animate-aurora pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-primary/40 blur-[100px]" />
      <div className="animate-aurora pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-blossom/30 blur-[100px] [animation-delay:-9s]" />

      {/* donate band */}
      <div className="relative mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 px-8 py-14 backdrop-blur-sm sm:px-14">
          <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5 text-sun" /> כל תרומה מצמיחה תקווה
              </span>
              <h3 className="mt-4 font-display text-3xl font-black sm:text-5xl">
                יחד <span className="text-gradient">לא תהיו לבד</span> בדרך
              </h3>
              <p className="mt-3 max-w-xl text-base opacity-75">
                התרומה שלך מאפשרת ליווי, ייעוץ וקהילה למתמודדי נפש ולבני משפחותיהם.
              </p>
            </div>
            <Magnetic strength={0.4}>
              <Link
                to="/donate"
                className="btn-pill group inline-flex shrink-0 items-center gap-3 bg-gradient-to-l from-sun to-blossom px-9 py-5 text-lg font-black text-foreground shadow-[0_20px_50px_-15px_var(--sun)]"
              >
                <Heart className="h-6 w-6 transition-transform duration-300 group-hover:scale-125" />
                לתרומה עכשיו
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blossom text-primary-foreground">
              <Heart className="h-6 w-6" />
            </span>
            <span className="font-display text-xl font-black">מצמיחים מהלב</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed opacity-70">
            עמותה לתמיכה במתמודדי נפש. אנו מלווים אנשים ומשפחות בדרך לריפוי באהבה, במקצועיות ובכבוד
            — ללא תיוג וללא שיפוט.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-extrabold opacity-90">ניווט</h4>
          <ul className="mt-4 space-y-2.5 text-sm opacity-70">
            {[...NAV, { to: "/donate", label: "תרומות" } as const].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-block transition-all hover:-translate-x-1 hover:text-sun hover:opacity-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-extrabold opacity-90">צור קשר</h4>
          <ul className="mt-4 space-y-3 text-sm opacity-75">
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

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs opacity-60 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} מצמיחים מהלב — עמותה רשומה. כל הזכויות שמורות.</p>
          <p className="flex items-center gap-1">
            נבנה באהבה <Heart className="h-3.5 w-3.5 text-blossom" />
          </p>
        </div>
      </div>
    </footer>
  );
}
