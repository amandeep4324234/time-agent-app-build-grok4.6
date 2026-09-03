import { COPY, formatFooter } from "@/lib/timeframe/copy";
import { formatHours } from "@/lib/timeframe/day";
import type { WeekMetrics } from "@/lib/timeframe/types";

export function WeekCardView({
  week,
  label,
  focusSharePct,
  paid,
}: {
  week: WeekMetrics;
  label: string;
  focusSharePct: number;
  paid: boolean;
}) {
  const fullLabel = `${label} · ${focusSharePct}% focus-set time`;
  return (
    <div
      className="relative overflow-hidden rounded-md border-2 border-line bg-base"
      style={{ aspectRatio: "1080 / 1350" }}
    >
      <div className="flex h-full flex-col p-8">
        <p className="tf-label text-fg-3">{fullLabel}</p>
        <p className="tf-display mt-8 text-[64px] leading-none text-fg md:text-[72px]">
          {formatHours(week.focus_hours)}
        </p>
        <p className="mt-2 text-sm text-fg-3">{COPY.unitFocus}</p>
        <dl className="mt-10 space-y-4">
          <Row k={COPY.labelFocus} v={`${formatHours(week.focus_hours)}h`} />
          <Row k={COPY.labelSink} v={`${formatHours(week.sink_hours)}h`} />
          <Row k={COPY.labelBlocks} v={`${week.deep_blocks}`} />
          <Row k={COPY.labelLongest} v={`${week.longest_min} min`} />
        </dl>
        <p className="tf-mono mt-auto text-[12px] leading-snug text-fg-3">
          {week.footer ||
            formatFooter({
              D: week.D,
              Dp: week.D_p,
              Dc: week.D_c,
              U: week.unclassified_pct,
              H: week.double_count_h,
            })}
        </p>
      </div>
      {!paid ? (
        <span className="absolute bottom-6 right-8 text-[12px] font-medium tracking-wide text-fg-4">
          Timeframe
        </span>
      ) : null}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="tf-label">{k}</dt>
      <dd className="tf-mono text-2xl font-medium text-fg">{v}</dd>
    </div>
  );
}
