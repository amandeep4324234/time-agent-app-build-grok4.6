import { createFileRoute } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductHeader } from "@/components/timeframe/ProductHeader";
import { WeekCardView } from "@/components/timeframe/WeekCardView";
import { COPY } from "@/lib/timeframe/copy";
import { GOLDENS, computeWeek } from "@/lib/timeframe/metrics";
import { useTfStore } from "@/lib/timeframe/store";
import { useLedger } from "@/lib/timeframe/use-ledger";

export const Route = createFileRoute("/week")({ component: WeekPage });

function WeekPage() {
  const { ledger } = useLedger();
  const paid = useTfStore((s) => s.isPaid());
  const week = useMemo(
    () => computeWeek(GOLDENS.week_start, ledger, 7),
    [ledger],
  );
  const [label, setLabel] = useState<"phone this week" | "laptop this week" | "merged export">(
    "merged export",
  );
  const hasPhone = week.D_p > 0;
  const hasComputer = week.D_c > 0;
  const share =
    week.union_h > 0 ? Math.round((week.focus_hours / week.union_h) * 100) : 0;

  const empty = week.D === 0;

  return (
    <div className="min-h-screen bg-base">
      <ProductHeader />
      <main id="content" className="mx-auto max-w-[720px] px-4 py-6 md:px-6">
        <h1 className="text-2xl font-semibold">Week</h1>
        {empty ? (
          <div className="tf-card mt-6 p-6">
            <p>{COPY.weekEmpty}</p>
            <p className="mt-2 text-sm text-fg-3">{COPY.weekEmptySub}</p>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {hasPhone ? (
                <Chip
                  on={label === "phone this week"}
                  onClick={() => setLabel("phone this week")}
                >
                  {COPY.phoneThisWeek}
                </Chip>
              ) : null}
              {hasComputer ? (
                <Chip
                  on={label === "laptop this week"}
                  onClick={() => setLabel("laptop this week")}
                >
                  {COPY.laptopThisWeek}
                </Chip>
              ) : null}
              {hasPhone && hasComputer ? (
                <Chip
                  on={label === "merged export"}
                  onClick={() => setLabel("merged export")}
                >
                  {COPY.mergedExport}
                </Chip>
              ) : null}
            </div>
            <div className="mx-auto mt-6 max-w-[420px]">
              <WeekCardView week={week} label={label} focusSharePct={share} paid={paid} />
            </div>
            <p className="mt-4 text-sm text-fg-3">{COPY.preflight}</p>
            <button
              type="button"
              className="mt-4 inline-flex h-12 items-center gap-2 rounded-full border border-line-2 px-5 text-sm"
              onClick={() => {
                void navigator.clipboard.writeText(week.footer);
              }}
            >
              <Share2 className="size-5" strokeWidth={1.6} />
              Copy footer
            </button>
            {!paid ? (
              <p className="mt-4 text-sm text-fg-3">
                Watermarked on Free. The clean share card is Pro — the ledger stays free.
              </p>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        on
          ? "h-11 rounded-full bg-raised px-4 text-sm text-fg"
          : "h-11 rounded-full px-4 text-sm text-fg-3"
      }
    >
      {children}
    </button>
  );
}
