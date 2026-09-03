import { ArrowDown, ArrowUp } from "lucide-react";
import { COPY } from "@/lib/timeframe/copy";
import { formatHours } from "@/lib/timeframe/day";

export function MetricCard({
  label,
  value,
  unit,
  empty,
  aside,
  asideLabel,
  delta,
  lightDay,
  delay = 0,
}: {
  label: string;
  value: number | null;
  unit: string;
  empty?: string;
  aside?: number | null;
  asideLabel?: string;
  delta?: number | null;
  lightDay?: boolean;
  delay?: number;
}) {
  const isEmpty = value === null;
  return (
    <article
      className="tf-card tf-enter flex min-h-24 flex-col justify-between p-4 md:h-44 md:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="tf-label">{label}</p>
      {isEmpty ? (
        <p className="mt-3 text-sm text-fg-3">{empty ?? COPY.cardEmpty}</p>
      ) : (
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <p className="tf-mono text-[36px] font-medium leading-[1.1] text-fg">
              {formatHours(value)}
            </p>
            <p className="text-sm text-fg-3">{unit}</p>
          </div>
          {aside != null ? (
            <div className="text-right">
              <p className="tf-label">{asideLabel ?? COPY.labelLongest}</p>
              <p className="tf-mono text-2xl font-medium text-fg">{aside} min</p>
            </div>
          ) : null}
        </div>
      )}
      <div className="mt-3 min-h-5 text-sm text-fg-3">
        {lightDay ? (
          <span className="inline-flex rounded-full border border-line-2 px-2 py-0.5 text-[12px] font-medium text-fg-4">
            {COPY.lightDay}
          </span>
        ) : delta == null || isEmpty ? (
          <span className="text-faint">—</span>
        ) : delta > 0 ? (
          <span className="inline-flex items-center gap-1">
            <ArrowUp className="size-2" strokeWidth={2} aria-hidden />
            {formatHours(delta)}h
          </span>
        ) : delta < 0 ? (
          <span className="inline-flex items-center gap-1">
            <ArrowDown className="size-2" strokeWidth={2} aria-hidden />
            {formatHours(Math.abs(delta))}h
          </span>
        ) : (
          <span>—</span>
        )}
      </div>
    </article>
  );
}

export function DeepBlocksCard({
  count,
  longest,
  empty,
  lightDay,
}: {
  count: number | null;
  longest: number | null;
  empty?: boolean;
  lightDay?: boolean;
}) {
  return (
    <article className="tf-card tf-enter flex min-h-24 flex-col justify-between p-4 md:h-44 md:p-6" style={{ animationDelay: "80ms" }}>
      <p className="tf-label">{COPY.labelBlocks}</p>
      {empty || count === null ? (
        <p className="mt-3 text-sm text-fg-3">{COPY.cardEmpty}</p>
      ) : (
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="tf-mono text-[36px] font-medium leading-[1.1] text-fg">{count}</p>
            <p className="text-sm text-fg-3">{COPY.unitBlocks}</p>
          </div>
          <div className="text-right">
            <p className="tf-label">{COPY.labelLongest}</p>
            <p className="tf-mono text-2xl font-medium text-fg">{longest ?? 0} min</p>
          </div>
        </div>
      )}
      <div className="mt-3 min-h-5 text-sm text-fg-3">
        {lightDay ? (
          <span className="inline-flex rounded-full border border-line-2 px-2 py-0.5 text-[12px] font-medium text-fg-4">
            {COPY.lightDay}
          </span>
        ) : (
          <span className="text-faint"> </span>
        )}
      </div>
    </article>
  );
}
