import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALL_SHIPPED_STRINGS, BANNED, scanBanned } from "./copy.ts";

describe("copy registry", () => {
  it("contains no banned phrases", () => {
    const hits = ALL_SHIPPED_STRINGS.flatMap((s) =>
      scanBanned(s).map((b) => `${b} in "${s}"`),
    );
    assert.equal(hits.length, 0, hits.join("\n"));
  });

  it("keeps required honest phrases", () => {
    assert.ok(ALL_SHIPPED_STRINGS.some((s) => s.includes("focus-set time")));
    assert.ok(ALL_SHIPPED_STRINGS.some((s) => s.includes("% of tracked time")));
  });

  it("has a non-empty banned list", () => {
    for (const p of BANNED) assert.ok(p.length >= 3);
  });
});
