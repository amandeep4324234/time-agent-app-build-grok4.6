import { create } from "zustand";
import { persist } from "zustand/middleware";
import demoEnvelope from "../../data/demo-sessions.json" with { type: "json" };
import { defaultPins } from "./classify";
import { buildLedger, parseEnvelope } from "./ingest";
import {
  DEFAULT_DEATH_FLOOR,
  DEFAULT_TZ,
  type EnrichedSession,
  type Entitlement,
  type FocusBlock,
  type Pins,
  type PinnableCategory,
  type SessionEnvelope,
  type Settings,
} from "./types";

const DEMO = demoEnvelope as SessionEnvelope;

export interface TfState {
  settings: Settings;
  pins: Pins;
  overrides: Record<string, PinnableCategory>;
  entitlement: Entitlement;
  block: FocusBlock | null;
  imported: SessionEnvelope | null;
  setDeathFloor: (n: 3 | 5 | 10) => void;
  setOnboarded: (v: boolean) => void;
  setPins: (pins: Pins) => void;
  togglePin: (label: string, group: "work" | "killers" | "games") => void;
  setEntitlement: (e: Entitlement) => void;
  setBlock: (b: FocusBlock | null) => void;
  importEnvelope: (env: SessionEnvelope) => void;
  ledger: () => EnrichedSession[];
  envelope: () => SessionEnvelope;
  isPaid: () => boolean;
}

const FREE_ENT: Entitlement = {
  aid: null,
  tier: "free",
  plan: null,
  src: null,
  ref: null,
  skin: null,
  valid_until: null,
  jti: null,
};

export const useTfStore = create<TfState>()(
  persist(
    (set, get) => ({
      settings: {
        deathFloor: DEFAULT_DEATH_FLOOR,
        onboarded: false,
        tz: DEFAULT_TZ,
      },
      pins: defaultPins(),
      overrides: {},
      entitlement: FREE_ENT,
      block: null,
      imported: null,
      setDeathFloor: (n) =>
        set((s) => ({ settings: { ...s.settings, deathFloor: n } })),
      setOnboarded: (v) =>
        set((s) => ({ settings: { ...s.settings, onboarded: v } })),
      setPins: (pins) => set({ pins }),
      togglePin: (label, group) =>
        set((s) => {
          const list = s.pins[group];
          const has = list.includes(label);
          return {
            pins: {
              ...s.pins,
              [group]: has ? list.filter((x) => x !== label) : [...list, label],
            },
          };
        }),
      setEntitlement: (e) => set({ entitlement: e }),
      setBlock: (b) => set({ block: b }),
      importEnvelope: (env) => {
        const parsed = parseEnvelope(env);
        if (parsed) set({ imported: parsed });
      },
      envelope: () => get().imported ?? DEMO,
      ledger: () => {
        const s = get();
        return buildLedger(s.imported ?? DEMO, s.pins, s.overrides);
      },
      isPaid: () => get().entitlement.tier === "pro",
    }),
    {
      name: "tf_store",
      partialize: (s) => ({
        settings: s.settings,
        pins: s.pins,
        overrides: s.overrides,
        entitlement: s.entitlement,
        imported: s.imported,
      }),
    },
  ),
);

export function freeEntitlement(aid: string | null = null): Entitlement {
  return { ...FREE_ENT, aid };
}

export { DEMO };
