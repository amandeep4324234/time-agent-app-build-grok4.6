import { Check } from "lucide-react";
import { SEED_KILLERS, SEED_WORK } from "@/lib/timeframe/types";
import { cn } from "@/lib/cn";

export function PinChips({
  work,
  killers,
  games,
  onToggle,
}: {
  work: string[];
  killers: string[];
  games: string[];
  onToggle: (label: string, group: "work" | "killers" | "games") => void;
}) {
  const extraWork = work.filter((w) => !(SEED_WORK as readonly string[]).includes(w));
  const extraKill = killers.filter((w) => !(SEED_KILLERS as readonly string[]).includes(w));
  return (
    <div className="space-y-6">
      <Group
        title="Work"
        hint="focus-set"
        color="focus"
        items={[...SEED_WORK, ...extraWork]}
        selected={work}
        onToggle={(l) => onToggle(l, "work")}
      />
      <Group
        title="Killers"
        hint="sink"
        color="sink"
        items={[...SEED_KILLERS, ...extraKill]}
        selected={killers}
        onToggle={(l) => onToggle(l, "killers")}
      />
      <Group
        title="Games"
        hint="own category"
        color="games"
        items={["chess.com", ...games.filter((g) => g !== "chess.com")]}
        selected={games}
        onToggle={(l) => onToggle(l, "games")}
      />
    </div>
  );
}

function Group({
  title,
  hint,
  items,
  selected,
  onToggle,
  color,
}: {
  title: string;
  hint: string;
  items: readonly string[];
  selected: string[];
  onToggle: (label: string) => void;
  color: "focus" | "sink" | "games";
}) {
  const mark =
    color === "focus" ? "text-focus" : color === "sink" ? "text-sink" : "text-games";
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="tf-label">{hint}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((label) => {
          const on = selected.includes(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => onToggle(label)}
              className={cn(
                "inline-flex h-11 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors duration-150",
                on
                  ? "border-line-3 bg-overlay text-fg"
                  : "border-line text-fg-3 hover:text-fg",
              )}
              aria-pressed={on}
            >
              {on ? <Check className={cn("size-3", mark)} strokeWidth={2.4} /> : null}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
