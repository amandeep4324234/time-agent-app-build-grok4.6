import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ProductHeader } from "@/components/timeframe/ProductHeader";
import { COPY } from "@/lib/timeframe/copy";
import { formatHours } from "@/lib/timeframe/day";
import { GOLDENS, computeDay, phoneBanner } from "@/lib/timeframe/metrics";
import { useTfStore } from "@/lib/timeframe/store";
import { useLedger } from "@/lib/timeframe/use-ledger";

export const Route = createFileRoute("/debrief")({ component: DebriefPage });

function DebriefPage() {
  const { ledger } = useLedger();
  const paid = useTfStore((s) => s.isPaid());
  const day = GOLDENS.android_live_day.logical_day;
  const m = useMemo(() => computeDay(day, ledger), [ledger, day]);
  const banner = useMemo(() => phoneBanner(ledger), [ledger]);
  const top = m.top_sinks[0];
  const pairA = m.top_sinks[0]?.label;
  const pairB = "GitHub";

  return (
    <div className="min-h-screen bg-base">
      <ProductHeader />
      <main id="content" className="mx-auto max-w-[720px] px-4 py-6 md:px-6">
        <h1 className="text-2xl font-semibold">Debrief</h1>
        <p className="mt-1 tf-label">{day}</p>
        <ol className="tf-card mt-6 divide-y divide-line p-0">
          <Line k={COPY.labelFocus} v={m.focus_hours == null ? "—" : `${formatHours(m.focus_hours)}h`} />
          <Line
            k="Top sink"
            v={
              !top
                ? COPY.sinkEmpty
                : paid
                  ? `Longest stretch went to ${top.label}`
                  : `${top.label} · ${formatHours(top.hours)}h`
            }
          />
          <Line
            k={COPY.labelBlocks}
            v={
              m.deep_blocks == null
                ? "—"
                : `${m.deep_blocks} · longest ${m.longest_min} min`
            }
          />
          <Line
            k="Writers"
            v={banner ? banner.copy : "phone up · computer up"}
          />
          <Line k="Light day" v={m.light_day ? COPY.lightDay : "—"} />
          <Line
            k="Named pair"
            v={
              paid
                ? `The day swung between ${pairB} and ${pairA ?? "sink"}`
                : `${pairB} ↔ ${pairA ?? "—"} ×${Math.max(1, m.top_sinks[0]?.count ?? 0)}`
            }
          />
        </ol>
      </main>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 px-5 py-4">
      <span className="tf-label">{k}</span>
      <span className="text-right text-sm text-fg">{v}</span>
    </li>
  );
}
