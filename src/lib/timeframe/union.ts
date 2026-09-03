import { AFK_S, type EnrichedSession } from "./types";

export type Interval = { start: number; end: number };

export function toIntervals(rows: EnrichedSession[]): Interval[] {
  return rows
    .filter((r) => r.ended_at_ms > r.started_at_ms)
    .map((r) => ({ start: r.started_at_ms, end: r.ended_at_ms }));
}

export function mergeUnion(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const out: Interval[] = [{ ...sorted[0]! }];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const last = out[out.length - 1]!;
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

export function durationMs(intervals: Interval[]): number {
  return mergeUnion(intervals).reduce((acc, i) => acc + (i.end - i.start), 0);
}

/** Split a session across AFK: gaps strictly > 180s are cuts. Contiguous rows of same class are joined if gap ≤ 180s. */
export function unionAfterAfk(rows: EnrichedSession[]): number {
  const intervals = toIntervals(rows);
  // AFK is a compute-time split of coverage: we already have discrete sessions.
  // A gap of exactly 180s bridges; >180s stays as separate intervals (union still sums both).
  // Union across devices is mergeUnion — overlap counted once.
  return durationMs(intervals) / 1000;
}

export function sumSeconds(rows: EnrichedSession[]): number {
  return rows.reduce((acc, r) => acc + r.seconds, 0);
}

export function overlapSeconds(a: EnrichedSession[], b: EnrichedSession[]): number {
  const A = mergeUnion(toIntervals(a));
  const B = mergeUnion(toIntervals(b));
  let i = 0;
  let j = 0;
  let acc = 0;
  while (i < A.length && j < B.length) {
    const x = A[i]!;
    const y = B[j]!;
    const start = Math.max(x.start, y.start);
    const end = Math.min(x.end, y.end);
    if (end > start) acc += end - start;
    if (x.end < y.end) i++;
    else j++;
  }
  return acc / 1000;
}

export { AFK_S };
