import {
  DEFAULT_TZ,
  FLICKER_S,
  type EnrichedSession,
  type Pins,
  type PinnableCategory,
  type SessionEnvelope,
  type SessionKind,
  type SessionRow,
} from "./types";
import { canonicalApp, classifyLabel } from "./classify";
import { logicalDay, parseIsoMs } from "./day";

function kindFromSeconds(seconds: number): SessionKind {
  if (seconds < FLICKER_S) return "flicker";
  if (seconds < 120) return "glance";
  return "block";
}

export function validateSession(row: SessionRow): string | null {
  if (!row.id) return "missing id";
  if (row.source !== "android" && row.source !== "chrome_extension") return "bad source";
  if (row.device !== "phone" && row.device !== "computer") return "bad device";
  if (!row.label) return "missing label";
  if (!row.started_at) return "missing started_at";
  if (row.seconds <= 0) return "seconds must be > 0";
  try {
    parseIsoMs(row.started_at);
    if (row.ended_at) parseIsoMs(row.ended_at);
  } catch {
    return "unparseable timestamp";
  }
  return null;
}

export function buildLedger(
  envelope: SessionEnvelope,
  pins: Pins,
  overrides: Record<string, PinnableCategory> = {},
): EnrichedSession[] {
  const seen = new Set<string>();
  const out: EnrichedSession[] = [];

  for (const raw of envelope.sessions) {
    if (seen.has(raw.id)) continue;
    seen.add(raw.id);
    const err = validateSession(raw);
    if (err) continue;

    const started_at_ms = parseIsoMs(raw.started_at);
    let ended_at_ms = raw.ended_at
      ? parseIsoMs(raw.ended_at)
      : started_at_ms + raw.seconds * 1000;
    let seconds = raw.seconds;
    const delta = Math.abs(ended_at_ms - started_at_ms - seconds * 1000) / 1000;
    if (delta > 1) {
      seconds = Math.max(1, Math.round((ended_at_ms - started_at_ms) / 1000));
      ended_at_ms = started_at_ms + seconds * 1000;
    }
    const tz = raw.timezone || DEFAULT_TZ;
    const canonical = canonicalApp(raw.label);
    const category = classifyLabel(raw.label, pins, overrides);
    out.push({
      ...raw,
      seconds,
      minutes: Math.round((seconds / 60) * 100) / 100,
      started_at_ms,
      ended_at_ms,
      timezone: tz,
      canonical_app: canonical,
      category,
      session_kind: kindFromSeconds(seconds),
      logical_day: logicalDay(started_at_ms, tz),
      ended_at: new Date(ended_at_ms).toISOString().replace(".000Z", "Z"),
    });
  }

  out.sort((a, b) => a.started_at_ms - b.started_at_ms || a.id.localeCompare(b.id));
  return collapseGaps(out);
}

function collapseGaps(rows: EnrichedSession[]): EnrichedSession[] {
  if (rows.length === 0) return rows;
  const byKey = new Map<string, EnrichedSession[]>();
  for (const r of rows) {
    const k = `${r.device}|${r.canonical_app}`;
    const list = byKey.get(k) ?? [];
    list.push(r);
    byKey.set(k, list);
  }
  const merged: EnrichedSession[] = [];
  for (const list of byKey.values()) {
    list.sort((a, b) => a.started_at_ms - b.started_at_ms);
    let cur = { ...list[0]! };
    for (let i = 1; i < list.length; i++) {
      const n = list[i]!;
      const gap = n.started_at_ms - cur.ended_at_ms;
      const sinkFlickerIntoWork =
        (cur.category === "work" && n.category === "sink" && n.session_kind === "flicker") ||
        (n.category === "work" && cur.category === "sink" && cur.session_kind === "flicker");
      if (gap >= 0 && gap < 15_000 && !sinkFlickerIntoWork && cur.category === n.category) {
        cur.ended_at_ms = Math.max(cur.ended_at_ms, n.ended_at_ms);
        cur.seconds = Math.round((cur.ended_at_ms - cur.started_at_ms) / 1000);
        cur.minutes = Math.round((cur.seconds / 60) * 100) / 100;
        cur.ended_at = new Date(cur.ended_at_ms).toISOString().replace(".000Z", "Z");
        cur.session_kind = kindFromSeconds(cur.seconds);
      } else {
        merged.push(cur);
        cur = { ...n };
      }
    }
    merged.push(cur);
  }
  merged.sort((a, b) => a.started_at_ms - b.started_at_ms);
  return merged;
}

export function parseEnvelope(data: unknown): SessionEnvelope | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.schema !== "timeframe.usage_sessions/v1") return null;
  if (!Array.isArray(d.sessions)) return null;
  return {
    schema: "timeframe.usage_sessions/v1",
    exported_at: String(d.exported_at ?? ""),
    count: Number(d.count ?? (d.sessions as unknown[]).length),
    sessions: d.sessions as SessionRow[],
  };
}
