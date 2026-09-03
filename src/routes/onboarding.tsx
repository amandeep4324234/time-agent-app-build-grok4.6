import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Creature } from "@/components/timeframe/Creature";
import { PinChips } from "@/components/timeframe/PinChips";
import { COPY } from "@/lib/timeframe/copy";
import { useTfStore } from "@/lib/timeframe/store";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

function Onboarding() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const pins = useTfStore((s) => s.pins);
  const togglePin = useTfStore((s) => s.togglePin);
  const setOnboarded = useTfStore((s) => s.setOnboarded);
  const navigate = useNavigate();

  return (
    <main className="mx-auto min-h-screen max-w-[720px] px-4 py-10 md:px-6">
      {step === 0 ? (
        <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <Creature grownMs={0} paid={false} state="egg" size={140} />
          <h1 className="tf-display mt-8 text-[40px] leading-[1.1]">
            {COPY.eggLine1}
          </h1>
          <p className="mt-3 text-lg text-fg-3">{COPY.eggLine2}</p>
          <button
            type="button"
            className="mt-10 inline-flex h-12 items-center rounded-full bg-fg px-6 text-sm font-medium text-inverse"
            onClick={() => setStep(1)}
          >
            Hatch
          </button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="py-8">
          <h1 className="text-[32px] font-semibold leading-tight">
            {COPY.webHonestyHeadline}
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-fg-2">
            {COPY.webHonestyBody}
          </p>
          <p className="mt-4 text-sm text-fg-3">{COPY.webHonestyDisclosure}</p>
          <button
            type="button"
            className="mt-10 inline-flex h-12 items-center rounded-full bg-fg px-6 text-sm font-medium text-inverse"
            onClick={() => setStep(2)}
          >
            {COPY.skipHonesty}
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="py-8">
          <h1 className="text-[32px] font-semibold">Pin your stack</h1>
          <p className="mt-2 text-sm text-fg-3">{COPY.pinSub}</p>
          <div className="mt-8">
            <PinChips
              work={pins.work}
              killers={pins.killers}
              games={pins.games}
              onToggle={togglePin}
            />
          </div>
          <button
            type="button"
            className="mt-10 inline-flex h-12 items-center rounded-full bg-fg px-6 text-sm font-medium text-inverse"
            onClick={() => {
              setOnboarded(true);
              void navigate({ to: "/app" });
            }}
          >
            {COPY.savePins}
          </button>
        </section>
      ) : null}
    </main>
  );
}
