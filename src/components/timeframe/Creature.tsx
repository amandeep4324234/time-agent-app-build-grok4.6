import { cn } from "@/lib/cn";
import { creatureScale } from "@/lib/timeframe/block";
import type { BlockState } from "@/lib/timeframe/types";

export function Creature({
  grownMs,
  paid,
  state,
  size = 96,
  className,
}: {
  grownMs: number;
  paid: boolean;
  state: BlockState | "egg" | "idle";
  size?: number;
  className?: string;
}) {
  const dead = state === "broken" || state === "cancelled";
  const egg = state === "egg";
  const scale = egg ? 0.72 : creatureScale(grownMs, paid);
  const dim = dead || state === "idle" || egg;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      style={{
        transform: `scale(${scale})`,
        opacity: dead ? 0.4 : 1,
        transition: "transform 600ms cubic-bezier(0.16,1,0.3,1), opacity 400ms cubic-bezier(0.7,0,0.84,0)",
      }}
    >
      <defs>
        <radialGradient id="tf-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity={dim ? 0.12 : 0.35} />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="48" cy="48" r="40" fill="url(#tf-glow)" />
      {egg ? (
        <ellipse
          cx="48"
          cy="50"
          rx="18"
          ry="24"
          fill="none"
          stroke="#22D3EE"
          strokeWidth="2"
          opacity="0.85"
        />
      ) : (
        <g
          fill="none"
          stroke={dead ? "#474E5F" : "#22D3EE"}
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M32 58c4 10 28 10 32 0" />
          <ellipse cx="48" cy="44" rx="20" ry="16" />
          <circle cx="41" cy="42" r="2.2" fill={dead ? "#474E5F" : "#22D3EE"} />
          <circle cx="55" cy="42" r="2.2" fill={dead ? "#474E5F" : "#22D3EE"} />
          {!dead && paid ? <path d="M48 18v8M48 70v8M18 44h8M70 44h8" opacity="0.7" /> : null}
        </g>
      )}
    </svg>
  );
}
