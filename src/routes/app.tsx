import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { ProductHeader } from "@/components/timeframe/ProductHeader";
import { Habitat } from "@/components/timeframe/Habitat";
import { DeepBlocksCard, MetricCard } from "@/components/timeframe/MetricCard";
import { MixRing } from "@/components/timeframe/MixRing";
import {
  HeatmapCard,
  HoursBySourceCard,
  TopSinksCard,
} from "@/components/timeframe/DashboardCards";
import { COPY } from "@/lib/timeframe/copy";
import { addDays, formatDayShort } from "@/lib/timeframe/day";
import { parseEnvelope } from "@/lib/timeframe/ingest";
import {
  GOLDENS,
  computeDay,
  computeHeatmap,
  phoneBanner,
  weekMondayFor,
} from "@/lib/timeframe/metrics";
import { useTfStore } from "@/lib/timeframe/store";
import { useLedger } from "@/lib/timeframe/use-ledger";
import { cn } from "@/lib/cn";

type AppSearch = { day?: string };

export const Route = createFileRoute("/app")({
  validateSearch: (s: Record<string, unknown>): AppSearch => ({
    day: typeof s.day === "string" ? s.day : undefined,
  }),
  component: AppPage,
});

function AppPage() {
  const { day: dayParam } = Route.useSearch();
  const navigate = useNavigate({ from: "/app" });
  const onboarded = useTfStore((s) => s.settings.onboarded);
  const paid = useTfStore((s) => s.isPaid());
  const block = useTfStore((s) => s.block);
  const { ledger, bundled } = useLedger();

  const defaultDay = GOLDENS.android_live_day.logical_day;
  const day = dayParam ?? defaultDay;
  const weekStart = weekMondayFor(GOLDENS.week_start);

  const metrics = useMemo(() => computeDay(day, ledger), [day, ledger]);
  const yesterday = useMemo(() => computeDay(addDays(day, -1), ledger), [day, ledger]);
  const heat = useMemo(() => computeHeatmap(weekStart, ledger), [ledger, weekStart]);
  const banner = useMemo(() => phoneBanner(ledger), [ledger]);

  const focusDelta =
    metrics.focus_hours != null && yesterday.focus_hours != null
      ? Math.round((metrics.focus_hours - yesterday.focus_hours) * 100) / 100
      : null;

  const demo = bundled;

  const setDay = (next: string) => {
    void navigate({ search: { day: next }, replace: true });
  };

  return (
    <div className="min-h-screen bg-base">
      <ProductHeader live={block?.state === "active"} />
      <main id="content" className="mx-auto max-w-[1200px] px-3 py-4 md:px-6 md:py-6">
        {!onboarded ? (
          <Link
            to="/onboarding"
            className="mb-4 flex h-11 items-center justify-between rounded-md border border-line bg-raised px-4 text-sm text-fg no-underline"
          >
            <span>{COPY.eggLine1} Pin your apps once.</span>
            <span className="text-fg-3">Onboarding →</span>
          </Link>
        ) : null}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2">
            <DaySelector day={day} onChange={setDay} />
            <LedgerIO />
          </div>
        </div>

        <div className="flex flex-col gap-3 md:gap-6">
          <Habitat
            grownMs={block?.grown_ms ?? 0}
            paid={paid}
            state={block?.state ?? (onboarded ? "idle" : "egg")}
            demo={demo}
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6">
            <MetricCard
              label={COPY.labelFocus}
              value={metrics.focus_hours}
              unit={COPY.unitFocus}
              delta={focusDelta}
              lightDay={metrics.light_day}
            />
            <MetricCard
              label={COPY.labelSink}
              value={metrics.sink_hours}
              unit={COPY.unitSink}
              lightDay={metrics.light_day}
              delay={40}
            />
            <DeepBlocksCard
              count={metrics.deep_blocks}
              longest={metrics.longest_min}
              empty={metrics.deep_blocks === null}
              lightDay={metrics.light_day}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-5">
              <MixRing mix={metrics.mix} unclassifiedPct={metrics.unclassified_pct} />
            </div>
            <div className="md:col-span-7">
              <TopSinksCard sinks={metrics.top_sinks} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-5">
              <HoursBySourceCard day={metrics} banner={banner?.copy ?? null} />
            </div>
            <div className="md:col-span-7">
              <HeatmapCard cells={heat} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DaySelector({ day, onChange }: { day: string; onChange: (d: string) => void }) {
  const start = GOLDENS.week_start;
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <div className="flex flex-wrap gap-1" role="tablist" aria-label="Logical day">
      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-md text-fg-3"
        onClick={() => onChange(addDays(day, -1))}
        aria-label="Previous day"
      >
        ←
      </button>
      {days.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          className={cn(
            "h-11 min-w-11 rounded-md px-2 text-xs",
            d === day ? "bg-raised text-fg" : "text-fg-3 hover:text-fg",
          )}
          aria-current={d === day ? "date" : undefined}
        >
          {formatDayShort(d)}
        </button>
      ))}
      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-md text-fg-3"
        onClick={() => onChange(addDays(day, 1))}
        aria-label="Next day"
      >
        →
      </button>
    </div>
  );
}

function LedgerIO() {
  const envelope = useTfStore((s) => s.envelope);
  const importEnvelope = useTfStore((s) => s.importEnvelope);
  const inputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const onExport = () => {
    const env = envelope();
    const blob = new Blob([JSON.stringify(env, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeframe-sessions.json";
    a.click();
    URL.revokeObjectURL(url);
    setMsg(COPY.exportResult(env.count));
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseEnvelope(JSON.parse(text) as unknown);
      if (!parsed) {
        setMsg(COPY.badExport);
        return;
      }
      if (parsed.sessions.length > 50_000) {
        setMsg(COPY.importTooLarge);
        return;
      }
      importEnvelope(parsed);
      setMsg(COPY.importResult(parsed.count));
    } catch {
      setMsg(COPY.badExport);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-md text-fg-3 hover:text-fg"
        onClick={onExport}
        aria-label="Export ledger"
        title="Export"
      >
        <Download className="size-4" strokeWidth={1.6} />
      </button>
      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-md text-fg-3 hover:text-fg"
        onClick={() => inputRef.current?.click()}
        aria-label="Import ledger"
        title="Import"
      >
        <Upload className="size-4" strokeWidth={1.6} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          void onImport(file);
          e.target.value = "";
        }}
      />
      {msg ? <span className="sr-only" role="status">{msg}</span> : null}
    </div>
  );
}
