import { DEFAULT_TZ, LOGICAL_DAY_OFFSET_H } from "./types";

export function parseIsoMs(iso: string): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) throw new Error(`unparseable timestamp: ${iso}`);
  return t;
}

export function zonedYmdHms(
  ms: number,
  tz: string,
): { y: number; m: number; d: number; hh: number; mm: number; ss: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(new Date(ms));
  const grab = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  return {
    y: grab("year"),
    m: grab("month"),
    d: grab("day"),
    hh: grab("hour"),
    mm: grab("minute"),
    ss: grab("second"),
  };
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function ymd(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/** Logical day = local calendar date of (instant − 4h). */
export function logicalDay(ms: number, tz: string = DEFAULT_TZ): string {
  const shifted = ms - LOGICAL_DAY_OFFSET_H * 3600 * 1000;
  const z = zonedYmdHms(shifted, tz);
  return ymd(z.y, z.m, z.d);
}

/** Hour bucket 0–23 where 0 is 04:00 local (logical-day hours 04→03). */
export function logicalHour(ms: number, tz: string = DEFAULT_TZ): number {
  const z = zonedYmdHms(ms, tz);
  return (z.hh + 24 - LOGICAL_DAY_OFFSET_H) % 24;
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d) + n * 86400000;
  const dt = new Date(utc);
  return ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function mondayOf(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const wd = new Date(utc).getUTCDay(); // 0 Sun
  const back = wd === 0 ? 6 : wd - 1;
  return addDays(day, -back);
}

export function formatDayShort(day: string, locale = "en-US"): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function weekdayShort(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  ]!;
}

export function hoursFromSeconds(s: number): number {
  return Math.round((s / 3600) * 100) / 100;
}

export function formatHours(h: number): string {
  return h.toFixed(2);
}

export function formatDurationH(h: number): string {
  const totalMin = Math.round(h * 60);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  if (hh === 0) return `${mm}m`;
  if (mm === 0) return `${hh}h`;
  return `${hh}h ${mm}m`;
}
