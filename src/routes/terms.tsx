import { createFileRoute, Link } from "@tanstack/react-router";
import { COPY } from "@/lib/timeframe/copy";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  return (
    <main className="mx-auto min-h-screen max-w-[720px] px-4 py-10 md:px-6">
      <p className="tf-label">
        <Link to="/" className="text-fg-3 no-underline">
          Timeframe
        </Link>
      </p>
      <h1 className="mt-4 text-2xl font-semibold">Terms</h1>
      <p className="mt-6 max-w-xl text-pretty leading-relaxed text-fg-2">{COPY.terms}</p>
    </main>
  );
}
