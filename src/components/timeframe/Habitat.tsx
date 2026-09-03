import { Creature } from "./Creature";
import { COPY } from "@/lib/timeframe/copy";
import type { BlockState } from "@/lib/timeframe/types";

export function Habitat({
  grownMs,
  paid,
  state,
  demo,
  streakDays,
}: {
  grownMs: number;
  paid: boolean;
  state: BlockState | "egg" | "idle";
  demo: boolean;
  streakDays?: number;
}) {
  const line = paid
    ? streakDays
      ? `${streakDays} day streak`
      : COPY.habitatStreak(0)
    : COPY.habitatIdle;
  return (
    <section className="tf-card relative flex h-[200px] items-center gap-4 overflow-hidden p-4 md:h-[120px] md:p-6">
      {demo ? (
        <span className="absolute right-3 top-3 rounded-full border border-line-2 bg-overlay px-2 py-0.5 text-[12px] font-medium text-fg-4">
          {COPY.demoPill}
        </span>
      ) : null}
      <Creature grownMs={grownMs} paid={paid} state={state} size={88} />
      <div>
        <p className="tf-label">Creature</p>
        <p className="mt-1 text-sm text-fg-3">{line}</p>
      </div>
    </section>
  );
}
