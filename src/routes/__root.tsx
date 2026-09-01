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

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import {
  Phone,
  MessageCircle,
  Heart,
  Menu,
  Mail,
  MapPin,
  ChevronDown,
} from "../components/icons";

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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          העמוד לא נטען
        </h1>
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
      { name: "description", content: "אור בנפש — עמותה לתמיכה במתמודדי נפש. ליווי, ייעוץ וקהילה בדרך לריפוי." },
      { property: "og:title", content: "אור בנפש — עמותה לתמיכה במתמודדי נפש" },
      { property: "og:description", content: "ליווי, ייעוץ וקהילה בדרך לריפוי. לא תהיו לבד." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
  return (
    <QueryClientProvider client={queryClient}>
      <SiteChrome />
      <main className="pt-20">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingActions />
    </QueryClientProvider>
  );
}

function SiteChrome() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo (start = right in RTL) */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Heart className="h-6 w-6" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-black text-foreground">אור בנפש</span>
            <span className="text-xs text-muted-foreground">עמותה לתמיכה במתמודדי נפש</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"
              activeProps={{ "aria-current": "page" as const }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster: phone + donate */}
        <div className="flex items-center gap-2">
          <a
            href="tel:*3042"
            className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft md:inline-flex"
          >
            <Phone className="h-4 w-4" />
            <span className="flex flex-col leading-none">
              <span className="text-xs font-semibold opacity-80">לייעוץ דיסקרטי</span>
              <span>*3042</span>
            </span>
          </a>
          <Link
            to="/donate"
            className="btn-pill inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-soft hover:brightness-105"
          >
            <Heart className="h-4 w-4" />
            לתרומה
          </Link>
          <button
            type="button"
            aria-label="תפריט"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function FloatingActions() {
  return (
    <div className="fixed bottom-6 left-4 z-50 flex flex-col gap-2 lg:left-6">
      <a
        href="tel:*3042"
        className="btn-pill inline-flex items-center gap-2 bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft"
      >
        <Phone className="h-5 w-5" />
        <span className="hidden sm:inline">לייעוץ דיסקרטי</span>
      </a>
      <a
        href="https://wa.me/9720000000"
        target="_blank"
        rel="noreferrer"
        className="btn-pill inline-flex items-center gap-2 bg-leaf px-4 py-3 text-sm font-bold text-leaf-foreground shadow-soft"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">וואטסאפ</span>
      </a>
      <Link
        to="/contact"
        className="btn-pill inline-flex items-center gap-2 bg-sun px-4 py-3 text-sm font-bold text-sun-foreground shadow-soft"
      >
        <Mail className="h-5 w-5" />
        <span className="hidden sm:inline">דברו איתנו</span>
      </Link>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/60">
      {/* donate band */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-10 overflow-hidden rounded-[2rem] bg-gradient-to-l from-primary via-primary to-leaf px-8 py-12 text-primary-foreground shadow-soft sm:px-12">
          <div className="blob-sun absolute -right-10 -top-10 h-48 w-48 opacity-60" />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-2xl font-black sm:text-3xl">יחד לא תהיו לבד בדרך</h3>
              <p className="mt-2 max-w-xl text-sm opacity-90">
                התרומה שלך מאפשרת ליווי, ייעוץ וקהילה למתמודדי נפש ולבני משפחותיהם.
              </p>
            </div>
            <Link
              to="/donate"
              className="btn-pill inline-flex shrink-0 items-center gap-2 bg-accent px-7 py-3.5 text-base font-bold text-accent-foreground hover:brightness-105"
            >
              <Heart className="h-5 w-5" />
              לתרומה
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Heart className="h-6 w-6" />
            </span>
            <span className="font-display text-xl font-black text-foreground">אור בנפש</span>
          </Link>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            עמותה לתמיכה במתמודדי נפש. אנו מלווים אנשים ומשפחות בדרך לריפוי באהבה,
            במקצועיות ובכבוד — ללא תיוג וללא שיפוט.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-800 text-foreground">ניווט</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/donate" className="hover:text-primary">
                תרומות
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-800 text-foreground">צור קשר</h4>
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
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} אור בנפש — עמותה רשומה. כל הזכויות שמורות.</p>
          <p className="flex items-center gap-1">
            נבנה באהבה <Heart className="h-3.5 w-3.5 text-primary" />
          </p>
        </div>
      </div>
    </footer>
  );
}
