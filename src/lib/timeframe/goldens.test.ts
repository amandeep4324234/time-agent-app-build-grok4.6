import { describe, it } from "node:test";
import assert from "node:assert/strict";
import demo from "../../data/demo-sessions.json" with { type: "json" };
import { defaultPins } from "./classify.ts";
import { buildLedger } from "./ingest.ts";
import { GOLDENS, computeDay, computeWeek, phoneBanner } from "./metrics.ts";
import type { SessionEnvelope } from "./types.ts";

describe("locked goldens", () => {
  const ledger = buildLedger(demo as SessionEnvelope, defaultPins());
  const week = computeWeek(GOLDENS.week_start, ledger, 7);
  const live = GOLDENS.android_live_day.logical_day;
  const dayRows = ledger.filter((r) => r.logical_day === live && r.device === "phone");

  it("hits week goldens", () => {
    assert.equal(week.D, GOLDENS.D);
    assert.equal(`${week.D_p}/${week.D}`, GOLDENS.D_p);
    assert.equal(`${week.D_c}/${week.D}`, GOLDENS.D_c);
    assert.equal(week.union_h, GOLDENS.union_h);
    assert.equal(week.sum_h, GOLDENS.sum_h);
    assert.equal(week.double_count_h, GOLDENS.double_count_h);
    assert.equal(
      week.footer,
      `Tracked 7 days · phone up 1/7 · computer up 7/7 · unclassified ${week.unclassified_pct}% · double-counted 0.24h`,
    );
  });

  it("hits the Android live day envelope", () => {
    assert.equal(dayRows.length, GOLDENS.android_live_day.sessions);
    const hours = dayRows.reduce((a, r) => a + r.seconds, 0) / 3600;
    assert.ok(Math.abs(hours - GOLDENS.android_live_day.hours) < 0.03);
  });

  it("banners phone off since Aug 28", () => {
    const banner = phoneBanner(ledger);
    assert.equal(banner?.copy, GOLDENS.banner);
  });

  it("does not leak private into top sinks", () => {
    const day = computeDay(live, ledger);
    assert.equal(
      day.top_sinks.some((s) => /screening|private|mhanational/i.test(s.label)),
      false,
    );
  });
});
