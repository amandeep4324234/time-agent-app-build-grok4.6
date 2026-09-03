export type Device = "phone" | "computer";
export type Source = "android" | "chrome_extension";
export type PinnableCategory = "work" | "sink" | "games" | "other";
export type Category =
  | "work"
  | "sink"
  | "games"
  | "other-known"
  | "unclassified"
  | "private"
  | "system";

export type SessionKind = "flicker" | "glance" | "block";

export interface SessionRow {
  id: string;
  source: Source;
  device: Device;
  label: string;
  started_at: string;
  ended_at: string | null;
  seconds: number;
  minutes: number;
  timezone?: string;
  session_kind?: SessionKind | null;
}

export interface SessionEnvelope {
  schema: "timeframe.usage_sessions/v1";
  exported_at: string;
  count: number;
  sessions: SessionRow[];
}

export interface EnrichedSession extends SessionRow {
  started_at_ms: number;
  ended_at_ms: number;
  timezone: string;
  canonical_app: string;
  category: Category;
  session_kind: SessionKind;
  logical_day: string;
}

export interface Entitlement {
  aid: string | null;
  tier: "free" | "pro";
  plan: "monthly" | "annual" | "skin" | null;
  src: string | null;
  ref: string | null;
  skin: "classic" | null;
  valid_until: string | null;
  jti: string | null;
}

export type BlockState = "idle" | "active" | "completed" | "broken" | "cancelled";

export interface FocusBlock {
  block_id: string;
  started_at_ms: number;
  ended_at_ms: number | null;
  target_minutes: number | null;
  state: BlockState;
  killer_label: string | null;
  killer_private: boolean;
  death_floor_s: number;
  focus_label: string | null;
  origin_device: Device;
  grown_ms: number;
}

export interface MixShare {
  work: number;
  sink: number;
  games: number;
  "other-known": number;
  unclassified: number;
}

export interface TopSink {
  label: string;
  hours: number;
  median_s: number;
  count: number;
}

export interface HeatCell {
  day: string; // YYYY-MM-DD logical
  hour: number; // 0–23 where 0 = 04:00 local
  minutes: number;
  kind: "blank" | "zero" | "data";
}

export interface DayMetrics {
  day: string;
  focus_hours: number | null;
  sink_hours: number | null;
  deep_blocks: number | null;
  longest_min: number | null;
  mix: MixShare | null;
  unclassified_pct: number | null;
  top_sinks: TopSink[];
  phone_hours: number | null;
  computer_hours: number | null;
  phone_present: boolean;
  computer_present: boolean;
  light_day: boolean;
  tracked_minutes: number;
}

export interface WeekMetrics {
  start: string;
  end: string;
  D: number;
  D_p: number;
  D_c: number;
  union_h: number;
  sum_h: number;
  double_count_h: number;
  unclassified_pct: number;
  focus_hours: number;
  sink_hours: number;
  deep_blocks: number;
  longest_min: number;
  footer: string;
  days: string[];
}

export interface Settings {
  deathFloor: 3 | 5 | 10;
  onboarded: boolean;
  tz: string;
}

export interface Pins {
  work: string[];
  killers: string[];
  games: string[];
}

export const SEED_WORK = [
  "Grok",
  "ChatGPT",
  "GitHub",
  "localhost",
  "AWS",
  "Lovable",
  "gemini",
  "aistudio",
  "qwen",
  "agentrouter",
  "vercel",
  "apify",
  "21st.dev",
] as const;

export const SEED_KILLERS = ["Instagram", "YouTube", "Discord", "Reddit"] as const;

export const DEFAULT_TZ = "Asia/Kolkata";
export const AFK_S = 180;
export const FLICKER_S = 5;
export const GAP_COLLAPSE_S = 15;
export const FILLER_INCIDENT_S = 60;
export const FILLER_POOL = 0.1;
export const LIGHT_DAY_MIN = 45;
export const DEEP_BLOCK_MIN = 15;
export const DEFAULT_DEATH_FLOOR = 5;
export const LOGICAL_DAY_OFFSET_H = 4;
