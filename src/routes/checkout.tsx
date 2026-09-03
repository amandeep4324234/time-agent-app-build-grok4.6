import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import legalJson from "@/data/legal.json";
import { COPY } from "@/lib/timeframe/copy";
import { useTfStore, type TfState } from "@/lib/timeframe/store";
import type { Entitlement } from "@/lib/timeframe/types";

export const Route = createFileRoute("/checkout")({ component: Checkout });

const LEGAL = legalJson as {
  legal_name: string;
  city: string;
  gstin: string;
  support_email: string;
};

type Plan = "monthly" | "annual" | "skin";

function Checkout() {
  const [plan, setPlan] = useState<Plan>("monthly");
  const [done, setDone] = useState(false);
  const setEntitlement = useTfStore((s: TfState) => s.setEntitlement);
  const paid = useTfStore((s: TfState) => s.entitlement.tier === "pro");

  const grant = () => {
    const aid = crypto.randomUUID();
    const valid =
      plan === "skin"
        ? null
        : new Date(Date.now() + (plan === "annual" ? 365 : 30) * 86400000).toISOString();
    const e: Entitlement = {
      aid,
      tier: "pro",
      plan,
      src: "sim",
      ref: `sim_${aid.slice(0, 8)}`,
      skin: plan === "skin" ? "classic" : null,
      valid_until: valid,
      jti: aid,
    };
    setEntitlement(e);
    setDone(true);
  };

  return (
    <main className="mx-auto min-h-screen max-w-[720px] px-4 py-10 md:px-6">
      <p className="tf-label">
        <Link to="/" className="text-fg-3 no-underline">
          Timeframe
        </Link>
      </p>
      <h1 className="mt-4 text-[32px] font-semibold leading-tight">
        {COPY.pricingHeadline}
      </h1>
      <p className="mt-3 text-fg-3">{COPY.paidSub}</p>

      {done || paid ? (
        <section className="tf-card mt-8 p-6">
          <p className="text-lg font-medium">Pro is on this device.</p>
          <p className="mt-3 text-sm text-fg-3">
            Unlock on Android — open the app: Settings → Restore purchase, and enter this
            code:{" "}
            <span className="tf-mono text-fg">K7M2QP</span>. Code expires in 15 minutes.
          </p>
          <p className="mt-4 text-sm text-fg-4">
            Payment keys are not wired in this preview. This is a local simulated grant.
          </p>
          <Link to="/app" className="mt-6 inline-flex h-12 items-center text-sm text-fg">
            Back to the ledger →
          </Link>
        </section>
      ) : (
        <>
          <div className="mt-8 space-y-2">
            <PlanRow
              id="monthly"
              title="Subscribe ₹499/month"
              on={plan === "monthly"}
              onPick={() => setPlan("monthly")}
            />
            <PlanRow
              id="annual"
              title="Subscribe ₹2,999/year"
              on={plan === "annual"}
              onPick={() => setPlan("annual")}
            />
            <PlanRow
              id="skin"
              title="Buy once ₹599 (classic skin, forever)"
              on={plan === "skin"}
              onPick={() => setPlan("skin")}
            />
          </div>
          <p className="mt-4 text-sm text-fg-4">{COPY.gstLine}</p>
          <button
            type="button"
            onClick={grant}
            className="mt-8 inline-flex h-12 items-center rounded-full bg-fg px-6 text-sm font-medium text-inverse"
          >
            Continue · UPI first (simulated)
          </button>
        </>
      )}

      <footer className="mt-16 space-y-2 text-xs text-fg-4">
        <p>
          Sold by {LEGAL.legal_name}, {LEGAL.city}, India · GSTIN {LEGAL.gstin}
        </p>
        <p>
          Refunds: within 7 days of payment, write to {LEGAL.support_email} with your order
          ID for a full refund. No questions asked.
        </p>
        <p>
          <Link to="/terms" className="text-fg-3">
            Terms
          </Link>
          {" · "}
          <Link to="/privacy" className="text-fg-3">
            Privacy
          </Link>
        </p>
      </footer>
    </main>
  );
}

function PlanRow({
  title,
  on,
  onPick,
}: {
  id: string;
  title: string;
  on: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={
        on
          ? "flex h-14 w-full items-center rounded-md border border-line-3 bg-raised px-4 text-left text-sm"
          : "flex h-14 w-full items-center rounded-md border border-line px-4 text-left text-sm text-fg-3"
      }
    >
      {title}
    </button>
  );
}
