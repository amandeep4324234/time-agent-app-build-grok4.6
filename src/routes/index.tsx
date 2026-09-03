import { createFileRoute, Link } from "@tanstack/react-router";
import { COPY } from "@/lib/timeframe/copy";
import { GOLDENS } from "@/lib/timeframe/metrics";
import { Creature } from "@/components/timeframe/Creature";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="min-h-screen bg-base">
      <div className="mx-auto max-w-[720px] px-4 py-16 md:px-6 md:py-24">
        <div className="flex items-center justify-between">
          <p className="tf-label">Timeframe</p>
          <Creature grownMs={0} paid={false} state="egg" size={40} />
        </div>
        <h1 className="tf-display mt-6 max-w-xl text-pretty text-[48px] leading-[1.08] text-fg md:text-[64px]">
          {COPY.heroThesis}
        </h1>
        <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-fg-3">
          {COPY.footnote}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/app"
            className="inline-flex h-12 items-center rounded-full bg-fg px-5 text-sm font-medium text-inverse no-underline"
          >
            {COPY.ctaLedger}
          </Link>
          <Link
            to="/checkout"
            className="inline-flex h-12 items-center rounded-full border border-line-2 px-5 text-sm font-medium text-fg no-underline"
          >
            {COPY.ctaPro}
          </Link>
        </div>

        <section className="mt-16" aria-label="Sample week goldens">
          <p className="tf-label">{COPY.demoPill}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat k="union" v={`${GOLDENS.union_h}h`} />
            <Stat k="sum" v={`${GOLDENS.sum_h}h`} />
            <Stat k="double-counted" v={`${GOLDENS.double_count_h}h`} />
            <Stat k="phone up" v={GOLDENS.D_p} />
          </div>
          <p className="mt-3 tf-mono text-xs text-fg-4">
            Tracked {GOLDENS.D} days · computer up {GOLDENS.D_c} · {GOLDENS.banner}
          </p>
        </section>

        <section className="mt-20">
          <h2 className="text-xl font-semibold">{COPY.pricingHeadline}</h2>
          <p className="mt-2 text-sm text-fg-3">{COPY.freeSub}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <PlanCard
              kicker="Free"
              title="The ledger"
              items={[
                "Phone + laptop log",
                "Three daily numbers + heatmap",
                '"Tracker off" honesty banner',
                "Creature on screen one — basic / one look",
                "Weekly Wrapped — watermarked",
                "Evening 6-line debrief — short local summary",
              ]}
            />
            <PlanCard
              kicker="Paid"
              title="Creature + card"
              items={[
                "Phone + laptop log",
                "Three daily numbers + heatmap",
                '"Tracker off" honesty banner',
                "Grows, streak, named killer, shareable card",
                "Clean card you would actually post",
                "Same debrief, plus nicer copy",
              ]}
            />
          </div>
          <p className="mt-4 text-sm text-fg-3">{COPY.paidSub}</p>
          <p className="mt-2 tf-mono text-xs text-fg-4">{COPY.paidHeader}</p>
        </section>

        <footer className="mt-20 flex flex-wrap gap-4 text-sm text-fg-4">
          <Link to="/terms" className="text-fg-4 no-underline hover:text-fg">
            Terms
          </Link>
          <Link to="/privacy" className="text-fg-4 no-underline hover:text-fg">
            Privacy
          </Link>
          <Link to="/onboarding" className="text-fg-4 no-underline hover:text-fg">
            Onboarding
          </Link>
        </footer>
      </div>
    </main>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="tf-card px-4 py-3">
      <p className="tf-label">{k}</p>
      <p className="tf-mono mt-1 text-lg text-fg">{v}</p>
    </div>
  );
}

function PlanCard({
  kicker,
  title,
  items,
}: {
  kicker: string;
  title: string;
  items: string[];
}) {
  return (
    <article className="tf-card p-5">
      <p className="tf-label">{kicker}</p>
      <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-fg-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-fg-4" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
