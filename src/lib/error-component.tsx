import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-base px-6 text-center text-fg">
      <span className="text-sink" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">The ledger couldn't be read</h1>
      <p className="max-w-md text-sm break-words text-fg-3">
        {error.message || "Nothing was fabricated. Try reading it again."}
      </p>
    </main>
  );
}
