import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Creature } from "@/components/timeframe/Creature";
import { ProductHeader } from "@/components/timeframe/ProductHeader";
import { COPY } from "@/lib/timeframe/copy";
import { classifyLabel } from "@/lib/timeframe/classify";
import {
  breakBlock,
  cancelBlock,
  completeBlock,
  startBlock,
} from "@/lib/timeframe/block";
import { GOLDENS } from "@/lib/timeframe/metrics";
import { useTfStore } from "@/lib/timeframe/store";
import { useLedger } from "@/lib/timeframe/use-ledger";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/block")({ component: BlockPage });

const TARGETS: { label: string; minutes: number | null }[] = [
  { label: "25", minutes: 25 },
  { label: "15", minutes: 15 },
  { label: "45", minutes: 45 },
  { label: "open-ended", minutes: null },
];

function BlockPage() {
  const { ledger } = useLedger();
  const floor = useTfStore((s) => s.settings.deathFloor);
  const setFloor = useTfStore((s) => s.setDeathFloor);
  const block = useTfStore((s) => s.block);
  const setBlock = useTfStore((s) => s.setBlock);
  const paid = useTfStore((s) => s.isPaid());

  const replay = useMemo(
    () =>
      ledger
        .filter((r) => r.logical_day === GOLDENS.android_live_day.logical_day)
        .sort((a, b) => a.started_at_ms - b.started_at_ms),
    [ledger],
  );

  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [target, setTarget] = useState<number | null>(25);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  const current = replay[cursor];
  const elapsedMin = block
    ? Math.floor(((block.ended_at_ms ?? Date.now()) - block.started_at_ms) / 60000)
    : 0;

  const startReplay = () => {
    setCursor(0);
    setPlaying(true);
    setBlock(startBlock(target, floor, "computer"));
    if (timer.current) window.clearInterval(timer.current);
    let i = 0;
    timer.current = window.setInterval(() => {
      i += 1;
      setCursor(i);
      const row = replay[i];
      const st = useTfStore.getState();
      const b = st.block;
      if (!b || b.state !== "active") {
        if (timer.current) window.clearInterval(timer.current);
        setPlaying(false);
        return;
      }
      if (!row) {
        st.setBlock(completeBlock(b));
        setPlaying(false);
        if (timer.current) window.clearInterval(timer.current);
        return;
      }
      const cat = classifyLabel(row.label, st.pins);
      if (cat === "work") {
        st.setBlock({
          ...b,
          grown_ms: b.grown_ms + row.seconds * 1000,
          focus_label: row.label,
        });
      } else if (cat === "sink" && row.seconds >= st.settings.deathFloor) {
        const priv = false;
        st.setBlock(breakBlock(b, row.canonical_app, priv));
        setPlaying(false);
        if (timer.current) window.clearInterval(timer.current);
      } else if (cat === "private" && row.seconds >= st.settings.deathFloor) {
        // private never kills live blocks
        st.setBlock({ ...b });
      }
      if (b.target_minutes && b.grown_ms / 60000 >= b.target_minutes) {
        st.setBlock(completeBlock(b));
        setPlaying(false);
        if (timer.current) window.clearInterval(timer.current);
      }
    }, 280);
  };

  const state = block?.state ?? "idle";
  const deathLine =
    state === "broken"
      ? block?.killer_private
        ? COPY.brokenPrivate
        : COPY.broken(block?.killer_label ?? "sink", floor)
      : state === "cancelled"
        ? COPY.cancelled
        : state === "completed"
          ? `${COPY.completed} · ${COPY.targetReached(block?.target_minutes ?? elapsedMin)}`
          : null;

  return (
    <div className="min-h-screen bg-base">
      <ProductHeader live={state === "active"} />
      <main id="content" className="mx-auto max-w-[720px] px-4 py-6 md:px-6">
        <h1 className="text-2xl font-semibold">Block</h1>
        <p className="mt-2 text-sm text-fg-3">{COPY.replayLabel}</p>

        <section className="tf-card mt-6 flex flex-col items-center p-6" style={{ borderRadius: 16 }}>
          <Creature
            grownMs={block?.grown_ms ?? 0}
            paid={paid}
            state={state === "idle" ? "idle" : state}
            size={128}
          />
          <p className="tf-display mt-4 text-[48px] leading-none text-accent">
            {state === "active" ? formatElapsed(block?.grown_ms ?? 0) : formatElapsed(block?.grown_ms ?? 0)}
          </p>
          <p className="mt-2 text-sm text-fg-3">
            {state === "active" ? COPY.focusLive : state}
          </p>
          {deathLine ? <p className="mt-4 text-sm text-sink">{deathLine}</p> : null}
          {current && playing ? (
            <p className="tf-mono mt-2 text-xs text-fg-4">{current.label}</p>
          ) : null}
        </section>

        <div className="mt-6">
          <p className="tf-label">Target</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TARGETS.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setTarget(t.minutes)}
                className={cn(
                  "h-11 rounded-full px-4 text-sm",
                  target === t.minutes ? "bg-raised text-fg" : "text-fg-3",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="tf-label">{COPY.deathFloor}</p>
          <div className="mt-2 flex gap-2">
            {([3, 5, 10] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setFloor(n)}
                className={cn(
                  "h-11 min-w-11 rounded-full px-4 text-sm",
                  floor === n ? "bg-raised text-fg" : "text-fg-3",
                )}
              >
                {n}s
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {state === "idle" || state === "cancelled" || state === "completed" || state === "broken" ? (
            <button
              type="button"
              onClick={startReplay}
              className="inline-flex h-12 items-center rounded-full bg-fg px-5 text-sm font-medium text-inverse"
            >
              {state === "broken" ? COPY.newBlock : COPY.startBlock}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (block) setBlock(cancelBlock(block));
                setPlaying(false);
                if (timer.current) window.clearInterval(timer.current);
              }}
              className="inline-flex h-12 items-center rounded-full border border-line-2 px-5 text-sm"
            >
              {COPY.endBlock}
            </button>
          )}
        </div>
        {cursor >= replay.length && playing === false && state === "completed" ? (
          <p className="mt-4 text-sm text-fg-3">{COPY.endOfReplay}</p>
        ) : null}
      </main>
    </div>
  );
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
