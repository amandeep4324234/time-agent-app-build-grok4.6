import { TriangleAlert } from "lucide-react";
import { COPY } from "@/lib/timeframe/copy";
import { formatHours } from "@/lib/timeframe/day";
import type { DayMetrics, HeatCell, TopSink } from "@/lib/timeframe/types";
import { cn } from "@/lib/cn";
import { weekdayShort } from "@/lib/timeframe/day";

export function TopSinksCard({ sinks }: { sinks: TopSink[] }) {
  return (
    <article className="tf-card tf-enter flex min-h-[312px] flex-col p-4 md:h-[360px] md:p-6" style={{ animationDelay: "160ms" }}>
      <p className="tf-label">Top 5 sinks</p>
      {sinks.length === 0 ? (
        <p className="mt-6 text-sm text-fg-3">{COPY.sinkEmpty}</p>
      ) : (
        <ul className="mt-4 flex flex-1 flex-col justify-between">
          {sinks.map((s) => (
            <li key={s.label} className="flex items-baseline justify-between gap-3 border-b border-line py-2 last:border-0">
              <span className="truncate text-fg-2">{s.label}</span>
              <span className="tf-mono shrink-0 text-sm text-fg">
                {formatHours(s.hours)}h · {Math.round(s.median_s / 60)}m med · ×{s.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function HoursBySourceCard({
  day,
  banner,
}: {
  day: DayMetrics;
  banner: string | null;
}) {
  const phone = day.phone_present ? day.phone_hours ?? 0 : null;
  const computer = day.computer_present ? day.computer_hours ?? 0 : null;
  const max = Math.max(phone ?? 0, computer ?? 0, 0.01);
  return (
    <article className="tf-card tf-enter flex min-h-[200px] flex-col p-4 md:h-[296px] md:p-6" style={{ animationDelay: "200ms" }}>
      {banner ? (
        <div
          className="mb-4 flex items-start gap-2 rounded-md border border-line bg-overlay px-3 py-2"
          style={{ borderLeft: "3px solid #F59E0B" }}
          role="status"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warn" strokeWidth={1.6} />
          <p className="text-sm font-semibold text-fg">{banner}</p>
        </div>
      ) : null}
      <p className="tf-label">Hours by source</p>
      <div className="mt-5 flex flex-1 flex-col justify-center gap-4">
        <SourceBar label={COPY.sourcePhone} hours={phone} max={max} present={day.phone_present} />
        <SourceBar label={COPY.sourceComputer} hours={computer} max={max} present={day.computer_present} />
      </div>
    </article>
  );
}

function SourceBar({
  label,
  hours,
  max,
  present,
}: {
  label: string;
  hours: number | null;
  max: number;
  present: boolean;
}) {
  const blank = !present;
  const width = blank || hours == null ? 0 : Math.max(4, (hours / max) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-fg-3">{label}</span>
        <span className="tf-mono text-fg">
          {blank ? "—" : hours == null ? "—" : `${formatHours(hours)}h`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-base">
        {blank ? (
          <div className="h-full w-full border border-dashed border-line" />
        ) : (
          <div
            className="h-full rounded-full bg-other"
            style={{ width: `${width}%` }}
          />
        )}
      </div>
    </div>
  );
}

export function HeatmapCard({ cells }: { cells: HeatCell[] }) {
  const days = [...new Set(cells.map((c) => c.day))];
  const hours = [0, 6, 12, 18];
  const hourLabel = (h: number) => String((h + 4) % 24).padStart(2, "0");
  return (
    <article className="tf-card tf-enter flex flex-col overflow-x-auto p-4 md:h-[296px] md:p-6" style={{ animationDelay: "240ms" }}>
      <p className="tf-label">{COPY.heatmapHeader}</p>
      <div className="mt-4 min-w-[520px]">
        <div className="mb-1 grid grid-cols-[36px_repeat(24,14px)] gap-0.5 text-[11px] text-fg-4 md:grid-cols-[36px_repeat(24,14px)]">
          <span />
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="text-center">
              {hours.includes(h) ? hourLabel(h) : ""}
            </span>
          ))}
        </div>
        {days.map((day) => (
          <div key={day} className="mb-0.5 grid grid-cols-[36px_repeat(24,14px)] items-center gap-0.5">
            <span className="text-[11px] text-fg-4">{weekdayShort(day).slice(0, 3)}</span>
            {cells
              .filter((c) => c.day === day)
              .map((c) => (
                <HeatSwatch key={`${c.day}-${c.hour}`} cell={c} />
              ))}
          </div>
        ))}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-fg-4">
          <span className="inline-flex items-center gap-1">
            <span className="size-2.5 border border-dashed border-line bg-transparent" />
            {COPY.noData}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2.5 bg-heat-zero" />
            {COPY.zeroMin}
          </span>
          {[16, 32, 48, 64, 88].map((o) => (
            <span
              key={o}
              className="size-2.5"
              style={{ background: `rgba(244,246,250,${o / 100})` }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

function HeatSwatch({ cell }: { cell: HeatCell }) {
  if (cell.kind === "blank") {
    return (
      <span
        className="size-[10px] border border-dashed border-line md:size-[14px]"
        title={`${cell.day} ${String((cell.hour + 4) % 24).padStart(2, "0")}:00 — no data`}
      />
    );
  }
  if (cell.kind === "zero") {
    return (
      <span
        className="size-[10px] bg-heat-zero md:size-[14px]"
        title={`${cell.day} 0 min`}
      />
    );
  }
  const o =
    cell.minutes >= 45 ? 0.88 : cell.minutes >= 30 ? 0.64 : cell.minutes >= 20 ? 0.48 : cell.minutes >= 10 ? 0.32 : 0.16;
  return (
    <span
      className={cn("size-[10px] md:size-[14px]")}
      style={{ background: `rgba(244,246,250,${o})` }}
      title={`${cell.day} ${Math.round(cell.minutes)} minutes tracked`}
    />
  );
}
