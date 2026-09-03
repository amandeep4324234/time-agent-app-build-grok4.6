import goldensJson from "../../data/goldens.json" with { type: "json" };
import { COPY, formatFooter } from "./copy";
import { addDays, hoursFromSeconds, mondayOf } from "./day";
import { deepBlocks, focusRuns } from "./focus-run";
import { durationMs, overlapSeconds, sumSeconds, toIntervals, unionAfterAfk } from "./union";
import {
  LIGHT_DAY_MIN,
  type DayMetrics,
  type EnrichedSession,
  type HeatCell,
  type MixShare,
  type TopSink,
  type WeekMetrics,
} from "./types";
import { logicalHour } from "./day";

export const GOLDENS = goldensJson as {
  D: number;
  D_p: string;
  D_c: string;
  union_h: number;
  sum_h: number;
  double_count_h: number;
  android_live_day: { logical_day: string; sessions: number; hours: number };
  banner: string;
  timezone: string;
  week_start: string;
  week_end: string;
};

function tracked(rows: EnrichedSession[]): EnrichedSession[] {
  return rows.filter(
    (r) => r.category !== "system" && r.category !== "private",
  );
}

function work(rows: EnrichedSession[]): EnrichedSession[] {
  return tracked(rows).filter((r) => r.category === "work");
}
function sink(rows: EnrichedSession[]): EnrichedSession[] {
  return tracked(rows).filter((r) => r.category === "sink");
}

export function computeDay(day: string, ledger: EnrichedSession[]): DayMetrics {
  const rows = ledger.filter((r) => r.logical_day === day);
  const t = tracked(rows);
  if (t.length === 0) {
    const phonePresent = rows.some((r) => r.device === "phone");
    const computerPresent = rows.some((r) => r.device === "computer");
    return {
      day,
      focus_hours: null,
      sink_hours: null,
      deep_blocks: null,
      longest_min: null,
      mix: null,
      unclassified_pct: null,
      top_sinks: [],
      phone_hours: phonePresent ? 0 : null,
      computer_hours: computerPresent ? 0 : null,
      phone_present: phonePresent,
      computer_present: computerPresent,
      light_day: false,
      tracked_minutes: 0,
    };
  }

  const focusS = unionAfterAfk(work(t));
  const sinkS = unionAfterAfk(sink(t));
  const runs = focusRuns(rows);
  const deep = deepBlocks(runs);

  const denom = t.reduce((a, r) => a + r.seconds, 0);
  const mixSec = {
    work: t.filter((r) => r.category === "work").reduce((a, r) => a + r.seconds, 0),
    sink: t.filter((r) => r.category === "sink").reduce((a, r) => a + r.seconds, 0),
    games: t.filter((r) => r.category === "games").reduce((a, r) => a + r.seconds, 0),
    "other-known": t.filter((r) => r.category === "other-known").reduce((a, r) => a + r.seconds, 0),
    unclassified: t.filter((r) => r.category === "unclassified").reduce((a, r) => a + r.seconds, 0),
  };
  const mix: MixShare = {
    work: mixSec.work / denom,
    sink: mixSec.sink / denom,
    games: mixSec.games / denom,
    "other-known": mixSec["other-known"] / denom,
    unclassified: mixSec.unclassified / denom,
  };

  const phoneRows = t.filter((r) => r.device === "phone");
  const computerRows = t.filter((r) => r.device === "computer");
  const phonePresent = ledger.some((r) => r.logical_day === day && r.device === "phone");
  const computerPresent = ledger.some((r) => r.logical_day === day && r.device === "computer");

  const trackedMin = denom / 60;
  const light =
    (phonePresent && phoneRows.reduce((a, r) => a + r.seconds, 0) / 60 < LIGHT_DAY_MIN) ||
    (computerPresent && computerRows.reduce((a, r) => a + r.seconds, 0) / 60 < LIGHT_DAY_MIN);

  return {
    day,
    focus_hours: hoursFromSeconds(focusS),
    sink_hours: hoursFromSeconds(sinkS),
    deep_blocks: deep.count,
    longest_min: deep.longestMin,
    mix,
    unclassified_pct: Math.round(mix.unclassified * 100),
    top_sinks: topSinks(sink(t)),
    phone_hours: phonePresent ? hoursFromSeconds(unionAfterAfk(phoneRows)) : null,
    computer_hours: computerPresent ? hoursFromSeconds(unionAfterAfk(computerRows)) : null,
    phone_present: phonePresent,
    computer_present: computerPresent,
    light_day: light,
    tracked_minutes: trackedMin,
  };
}

export function topSinks(rows: EnrichedSession[]): TopSink[] {
  const by = new Map<string, EnrichedSession[]>();
  for (const r of rows) {
    if (r.category === "private") continue;
    const list = by.get(r.canonical_app) ?? [];
    list.push(r);
    by.set(r.canonical_app, list);
  }
  const items: TopSink[] = [];
  for (const [label, list] of by) {
    const hours = hoursFromSeconds(unionAfterAfk(list));
    const lengths = list.map((r) => r.seconds).sort((a, b) => a - b);
    const mid = Math.floor(lengths.length / 2);
    const median =
      lengths.length === 0
        ? 0
        : lengths.length % 2
          ? lengths[mid]!
          : Math.round((lengths[mid - 1]! + lengths[mid]!) / 2);
    items.push({ label, hours, median_s: median, count: list.length });
  }
  items.sort((a, b) => b.hours - a.hours);
  return items.slice(0, 5);
}

export function computeWeek(
  start: string,
  ledger: EnrichedSession[],
  days = 7,
): WeekMetrics {
  const dayList = Array.from({ length: days }, (_, i) => addDays(start, i));
  const end = dayList[dayList.length - 1]!;
  const rows = ledger.filter((r) => r.logical_day >= start && r.logical_day <= end);
  const t = tracked(rows);
  const phone = t.filter((r) => r.device === "phone");
  const computer = t.filter((r) => r.device === "computer");

  const trackedDays = new Set(t.map((r) => r.logical_day));
  const phoneDays = new Set(phone.map((r) => r.logical_day));
  const computerDays = new Set(computer.map((r) => r.logical_day));
  const D = trackedDays.size;
  const Dp = phoneDays.size;
  const Dc = computerDays.size;

  const unionS = unionAfterAfk(t);
  const sumS = sumSeconds(t);
  const doubleS = Math.max(0, sumS - unionS);
  // overlapSeconds is the precise double-count of device unions
  const overlapS = overlapSeconds(phone, computer);

  const unclassifiedS = t.filter((r) => r.category === "unclassified").reduce((a, r) => a + r.seconds, 0);
  const U = t.length === 0 ? 0 : Math.round((unclassifiedS / sumS) * 100);

  const focusS = unionAfterAfk(work(t));
  const sinkS = unionAfterAfk(sink(t));
  const deep = deepBlocks(focusRuns(rows));

  const unionH = hoursFromSeconds(unionS);
  const sumH = hoursFromSeconds(sumS);
  const doubleH = hoursFromSeconds(overlapS || doubleS);

  return {
    start,
    end,
    D,
    D_p: Dp,
    D_c: Dc,
    union_h: unionH,
    sum_h: sumH,
    double_count_h: doubleH,
    unclassified_pct: U,
    focus_hours: hoursFromSeconds(focusS),
    sink_hours: hoursFromSeconds(sinkS),
    deep_blocks: deep.count,
    longest_min: deep.longestMin,
    footer: formatFooter({ D, Dp, Dc, U, H: doubleH }),
    days: dayList,
  };
}

export function computeHeatmap(weekStart: string, ledger: EnrichedSession[]): HeatCell[] {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const cells: HeatCell[] = [];
  for (const day of days) {
    const dayRows = tracked(ledger.filter((r) => r.logical_day === day));
    const present = dayRows.length > 0;
    const byHour = new Array<number>(24).fill(0);
    for (const r of dayRows) {
      // attribute whole session to start hour (good enough for 7×24 glance)
      const h = logicalHour(r.started_at_ms, r.timezone);
      byHour[h] = (byHour[h] ?? 0) + r.seconds / 60;
    }
    for (let h = 0; h < 24; h++) {
      const minutes = byHour[h] ?? 0;
      let kind: HeatCell["kind"];
      if (!present) kind = "blank";
      else if (minutes <= 0) kind = "zero";
      else kind = "data";
      cells.push({ day, hour: h, minutes, kind });
    }
  }
  return cells;
}

export function phoneBanner(ledger: EnrichedSession[]): { day: string; copy: string } | null {
  const phone = ledger.filter((r) => r.device === "phone");
  if (phone.length === 0) return null;
  const last = phone.reduce((a, b) => (a.ended_at_ms > b.ended_at_ms ? a : b));
  const next = addDays(last.logical_day, 1);
  return { day: next, copy: COPY.bannerPhone(formatBannerDay(next)) };
}

export function computerBanner(ledger: EnrichedSession[]): { day: string; copy: string } | null {
  const computer = ledger.filter((r) => r.device === "computer");
  const phone = ledger.filter((r) => r.device === "phone");
  if (computer.length === 0 || phone.length === 0) return null;
  const lastC = computer.reduce((a, b) => (a.ended_at_ms > b.ended_at_ms ? a : b));
  const lastP = phone.reduce((a, b) => (a.ended_at_ms > b.ended_at_ms ? a : b));
  if (lastP.ended_at_ms <= lastC.ended_at_ms) return null;
  const next = addDays(lastC.logical_day, 1);
  return { day: next, copy: COPY.bannerComputer(formatBannerDay(next)) };
}

function formatBannerDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function lastWriteAge(ms: number | null, now: number): string {
  if (ms === null) return "never";
  const s = Math.max(0, Math.floor((now - ms) / 1000));
  if (s < 60) return "just now";
  const min = Math.floor(s / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function weekMondayFor(day: string): string {
  return mondayOf(day);
}

export { durationMs, toIntervals };
