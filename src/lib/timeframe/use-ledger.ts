import { useMemo } from "react";
import { buildLedger } from "./ingest";
import { DEMO, useTfStore } from "./store";

export function useLedger() {
  const imported = useTfStore((s) => s.imported);
  const pins = useTfStore((s) => s.pins);
  const overrides = useTfStore((s) => s.overrides);
  const envelope = imported ?? DEMO;
  const ledger = useMemo(
    () => buildLedger(envelope, pins, overrides),
    [envelope, pins, overrides],
  );
  return { ledger, envelope, bundled: imported === null };
}
