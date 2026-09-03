import seedMapJson from "../../data/seed-map.json" with { type: "json" };
import {
  DEFAULT_TZ,
  SEED_KILLERS,
  SEED_WORK,
  type Category,
  type Pins,
  type PinnableCategory,
} from "./types";

type SeedCategory = "work" | "sink" | "games" | "other-known" | "private" | "system" | "unknown";

const SEED = (seedMapJson as { entries: Record<string, SeedCategory> }).entries;

const ALIASES: Record<string, string> = {
  instagram: "Instagram",
  "instagram.com": "Instagram",
  "com.instagram.android": "Instagram",
  youtube: "YouTube",
  "youtube.com": "YouTube",
  "m.youtube.com": "YouTube",
  "com.google.android.youtube": "YouTube",
  discord: "Discord",
  "discord.com": "Discord",
  "com.discord": "Discord",
  reddit: "Reddit",
  "reddit.com": "Reddit",
  "com.reddit.frontpage": "Reddit",
  github: "GitHub",
  "github.com": "GitHub",
  "com.github.android": "GitHub",
  grok: "Grok",
  "grok.x.ai": "Grok",
  "ai.x.grok": "Grok",
  chatgpt: "ChatGPT",
  "chatgpt.com": "ChatGPT",
  "chat.openai.com": "ChatGPT",
  "chess.com": "chess.com",
  chess: "chess.com",
  "mail.google.com": "Gmail",
  "com.google.android.gm": "Gmail",
  "notion.so": "Notion",
  "app.slack.com": "Slack",
  "com.whatsapp": "WhatsApp",
  "com.android.chrome": "Chrome",
  "com.android.deskclock": "Clock",
  "21st.dev": "21st.dev",
  "vercel.com": "vercel",
};

export function canonicalApp(label: string): string {
  const raw = label.trim();
  const lower = raw.toLowerCase();
  if (ALIASES[lower]) return ALIASES[lower];
  if (ALIASES[raw]) return ALIASES[raw];
  return raw;
}

function seedCategory(canonical: string): SeedCategory | null {
  if (SEED[canonical]) return SEED[canonical];
  const lower = canonical.toLowerCase();
  if (SEED[lower]) return SEED[lower];
  return null;
}

export function defaultPins(): Pins {
  return {
    work: [...SEED_WORK],
    killers: [...SEED_KILLERS],
    games: ["chess.com"],
  };
}

function pinHit(canonical: string, list: string[]): boolean {
  const lower = canonical.toLowerCase();
  return list.some((p) => p === canonical || p.toLowerCase() === lower);
}

export function classifyLabel(
  label: string,
  pins: Pins,
  overrides: Record<string, PinnableCategory> = {},
): Category {
  const canonical = canonicalApp(label);
  const seed = seedCategory(canonical);

  // Fence: seed private cannot be removed.
  if (seed === "private") return "private";

  const ov = overrides[canonical] ?? overrides[label];
  if (ov === "work") return "work";
  if (ov === "sink") return "sink";
  if (ov === "games") return "games";
  if (ov === "other") return "other-known";

  if (pinHit(canonical, pins.work) || pinHit(label, pins.work)) return "work";
  if (pinHit(canonical, pins.killers) || pinHit(label, pins.killers)) return "sink";
  if (pinHit(canonical, pins.games) || pinHit(label, pins.games)) return "games";

  if (seed === "work") return "work";
  if (seed === "sink") return "sink";
  if (seed === "games") return "games";
  if (seed === "system") return "system";
  if (seed === "other-known") return "other-known";
  if (seed === "unknown") return "unclassified";

  // Unpinned seed work/killers already handled. Phone Chrome is unknown.
  if (canonical === "Chrome") return "unclassified";

  return "unclassified";
}

export function isWork(cat: Category): boolean {
  return cat === "work";
}
export function isSink(cat: Category): boolean {
  return cat === "sink";
}
export function isFiller(cat: Category): boolean {
  return cat === "system" || cat === "unclassified" || cat === "games" || cat === "other-known";
}

export { DEFAULT_TZ };
