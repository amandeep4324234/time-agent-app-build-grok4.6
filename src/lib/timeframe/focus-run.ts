import { DEEP_BLOCK_MIN, FILLER_INCIDENT_S, FILLER_POOL, type EnrichedSession } from "./types";

/*
## Focus-run (one rule)

A known sink ≥ death floor (default 5s, user 3/5/10) **ends** the run.

Everything else that is not work is **filler** (gap with no row, system, unknown, browser_generic, games, other non-work): it may sit inside the run only while **each filler incident is ≤60s** and **all filler ≤10% of the finished run**. Longer filler ends the run.

The run also requires **every contributing device** to be work, filler, or a ≤60s gap at that instant. A >60s hole on one device ends the run even if the other device is still busy.

Run length = **wall-clock** of that interval. Sub-floor sink flickers do not end the run; they still add wall time; they do not spend the 10% pool (they are sinks, just short).

Live blocks (the creature) do **not** use this cap. They die only on a known sink ≥ death floor, or cancel.
*/

export interface FocusRun {
  start: number;
  end: number;
  fillerMs: number;
}

function cls(s: EnrichedSession): "work" | "sink" | "filler" | "private" {
  if (s.category === "work") return "work";
  if (s.category === "sink") return "sink";
  if (s.category === "private") return "private";
  return "filler";
}

export function focusRuns(
  sessions: EnrichedSession[],
  floorS = 5,
): FocusRun[] {
  const sorted = [...sessions].sort((a, b) => a.started_at_ms - b.started_at_ms);
  const floorMs = floorS * 1000;
  const holeMs = FILLER_INCIDENT_S * 1000;
  const runs: FocusRun[] = [];
  let i = 0;

  const lastEndByDevice = new Map<string, number>();

  while (i < sorted.length) {
    const startSess = sorted[i]!;
    if (cls(startSess) !== "work") {
      lastEndByDevice.set(startSess.device, Math.max(lastEndByDevice.get(startSess.device) ?? 0, startSess.ended_at_ms));
      i++;
      continue;
    }
    const runStart = startSess.started_at_ms;
    let runEnd = startSess.ended_at_ms;
    let filler = 0;
    const contributing = new Set<string>([startSess.device]);
    lastEndByDevice.set(startSess.device, startSess.ended_at_ms);

    let j = i + 1;
    let endedAt: number | null = null;

    const endRun = (t: number) => {
      endedAt = t;
      if (t > runStart) runs.push({ start: runStart, end: t, fillerMs: filler });
    };

    while (j < sorted.length && endedAt === null) {
      const s = sorted[j]!;
      const kind = cls(s);

      if (kind === "work") {
        if (s.started_at_ms - runEnd > holeMs) {
          endRun(runEnd);
          break;
        }
        runEnd = Math.max(runEnd, s.ended_at_ms);
        contributing.add(s.device);
        lastEndByDevice.set(s.device, Math.max(lastEndByDevice.get(s.device) ?? 0, s.ended_at_ms));
        for (const d of contributing) {
          const last = lastEndByDevice.get(d) ?? runStart;
          if (runEnd - last > holeMs) {
            endRun(last + holeMs);
            break;
          }
        }
        j++;
        continue;
      }

      if (kind === "sink") {
        if (s.seconds * 1000 >= floorMs) {
          endRun(s.started_at_ms);
          break;
        }
        runEnd = Math.max(runEnd, s.ended_at_ms);
        lastEndByDevice.set(s.device, Math.max(lastEndByDevice.get(s.device) ?? 0, s.ended_at_ms));
        j++;
        continue;
      }

      // filler or private-as-filler for retrospective runs (private never kills)
      const gap = s.started_at_ms - runEnd;
      if (gap > holeMs) {
        endRun(runEnd);
        break;
      }
      if (s.seconds * 1000 > holeMs) {
        endRun(s.started_at_ms);
        break;
      }
      const gapClamped = Math.max(0, gap);
      const candidatePool = filler + gapClamped + s.seconds * 1000;
      const soFar = s.ended_at_ms - runStart;
      if (soFar > 0 && candidatePool > FILLER_POOL * soFar) {
        endRun(s.started_at_ms);
        break;
      }
      filler = candidatePool;
      runEnd = s.ended_at_ms;
      lastEndByDevice.set(s.device, Math.max(lastEndByDevice.get(s.device) ?? 0, s.ended_at_ms));
      j++;
    }

    if (endedAt === null) {
      endRun(runEnd);
    }

    const t = endedAt ?? runEnd;
    let next = i + 1;
    while (next < sorted.length && sorted[next]!.ended_at_ms <= t) next++;
    i = Math.max(next, i + 1);
  }

  return runs;
}

export function deepBlocks(runs: FocusRun[]): { count: number; longestMin: number } {
  if (runs.length === 0) return { count: 0, longestMin: 0 };
  const lengths = runs.map((r) => r.end - r.start);
  const deep = lengths.filter((ms) => ms >= DEEP_BLOCK_MIN * 60 * 1000);
  const longest = Math.max(...lengths);
  return {
    count: deep.length,
    longestMin: Math.round(longest / 60000),
  };
}
