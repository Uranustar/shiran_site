import { SplitWords } from "./fx";

/** Editorial page header shared by the inner pages. */
export function PageHero({
  n,
  eyebrow,
  title,
  lead,
}: {
  n: string;
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <section data-noreveal className="relative pb-16 pt-10 sm:pb-24 sm:pt-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-4 text-xs font-bold tracking-wide">
          <span className="text-ink">({n})</span>
          <span className="text-muted-foreground">{eyebrow}</span>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <h1 className="font-display text-6xl font-black leading-[0.92] tracking-[-0.04em] text-ink sm:text-8xl lg:col-span-8 xl:text-[8.5rem]">
            <SplitWords text={title} emphasizeLast step={80} />
          </h1>
          <p
            className="animate-word-in max-w-md text-lg leading-relaxed text-ink/70 lg:col-span-4"
            style={{ animationDelay: "400ms" }}
          >
            {lead}
          </p>
        </div>
      </div>
    </section>
  );
}
