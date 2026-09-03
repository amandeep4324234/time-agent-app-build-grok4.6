import { COPY } from "@/lib/timeframe/copy";
import type { MixShare } from "@/lib/timeframe/types";

const WEDGES: { key: keyof MixShare; label: string; color: string }[] = [
  { key: "work", label: "work", color: "#4ADE80" },
  { key: "sink", label: "sink", color: "#F87171" },
  { key: "games", label: "games", color: "#FBBF24" },
  { key: "other-known", label: "other-known", color: "#60A5FA" },
  { key: "unclassified", label: "unclassified", color: "#94A3B8" },
];

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const s = polar(cx, cy, r, a0);
  const e = polar(cx, cy, r, a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}
function polar(cx: number, cy: number, r: number, a: number) {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export function MixRing({
  mix,
  unclassifiedPct,
}: {
  mix: MixShare | null;
  unclassifiedPct: number | null;
}) {
  const cx = 100;
  const cy = 100;
  const r = 72;
  let angle = -Math.PI / 2;
  const segs =
    mix == null
      ? []
      : WEDGES.map((w) => {
          const frac = mix[w.key];
          const a0 = angle;
          const a1 = angle + frac * Math.PI * 2;
          angle = a1;
          return { ...w, a0, a1, frac };
        }).filter((s) => s.frac > 0.001);

  return (
    <article className="tf-card tf-enter flex min-h-[312px] flex-col p-4 md:h-[360px] md:p-6" style={{ animationDelay: "120ms" }}>
      <div className="flex items-start justify-between gap-3">
        <p className="tf-label">{COPY.mixHeader}</p>
        {unclassifiedPct != null && unclassifiedPct > 15 ? (
          <span className="rounded-full border border-line-2 px-2 py-0.5 text-[12px] font-medium text-fg-4">
            {COPY.unclassifiedBadge(unclassifiedPct)}
          </span>
        ) : null}
      </div>
      {mix == null ? (
        <p className="mt-6 text-sm text-fg-3">{COPY.cardEmpty}</p>
      ) : (
        <div className="mt-4 flex flex-1 flex-col items-center gap-4 md:flex-row md:items-center">
          <svg width="200" height="200" viewBox="0 0 200 200" className="shrink-0" role="img" aria-label={COPY.mixHeader}>
            {segs.map((s) => (
              <path
                key={s.key}
                d={arc(cx, cy, r, s.a0, s.a1)}
                fill="none"
                stroke={s.color}
                strokeWidth="18"
                strokeLinecap="butt"
              />
            ))}
            <circle cx={cx} cy={cy} r="52" fill="#14171F" />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fill="#9AA3B5"
              fontSize="11"
            >
              {COPY.mixCaption}
            </text>
          </svg>
          <ul className="grid w-full grid-cols-1 gap-2 text-sm">
            {WEDGES.map((w) => (
              <li key={w.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-fg-2">
                  <span className="size-2.5 rounded-sm" style={{ background: w.color }} />
                  {w.label}
                </span>
                <span className="tf-mono text-fg">{Math.round(mix[w.key] * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
