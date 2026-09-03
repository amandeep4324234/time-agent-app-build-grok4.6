import { classifyLabel } from "./classify";
import type { FocusBlock, Pins } from "./types";

export function newBlockId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `blk_${Date.now().toString(16)}`;
}

export function startBlock(
  targetMinutes: number | null,
  deathFloor: number,
  origin: "phone" | "computer" = "computer",
): FocusBlock {
  return {
    block_id: newBlockId(),
    started_at_ms: Date.now(),
    ended_at_ms: null,
    target_minutes: targetMinutes,
    state: "active",
    killer_label: null,
    killer_private: false,
    death_floor_s: deathFloor,
    focus_label: null,
    origin_device: origin,
    grown_ms: 0,
  };
}

export function stepBlock(
  block: FocusBlock,
  label: string,
  dtMs: number,
  pins: Pins,
): FocusBlock {
  if (block.state !== "active") return block;
  const cat = classifyLabel(label, pins);
  if (cat === "work") {
    return { ...block, grown_ms: block.grown_ms + dtMs, focus_label: label };
  }
  if (cat === "sink") {
    // caller must confirm ≥ death floor
    return block;
  }
  return block;
}

export function breakBlock(
  block: FocusBlock,
  killer: string,
  isPrivate: boolean,
  now = Date.now(),
): FocusBlock {
  return {
    ...block,
    state: "broken",
    ended_at_ms: now,
    killer_label: isPrivate ? null : killer,
    killer_private: isPrivate,
  };
}

export function cancelBlock(block: FocusBlock, now = Date.now()): FocusBlock {
  return { ...block, state: "cancelled", ended_at_ms: now };
}

export function completeBlock(block: FocusBlock, now = Date.now()): FocusBlock {
  return { ...block, state: "completed", ended_at_ms: now };
}

export function creatureScale(grownMs: number, paid: boolean): number {
  const min = paid ? 30 * 60 * 1000 : 10 * 60 * 1000;
  const t = Math.min(1, grownMs / min);
  return 0.72 + t * 0.28;
}
