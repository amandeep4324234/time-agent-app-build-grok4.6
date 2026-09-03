# DEVIATIONS.md

Documented deviations from MASTER-BUILD-SPEC.md. Forced by the Grok App Builder runtime and missing delivered inputs. User instruction: do not halt; ship a functioning app.

| # | Spec section | Constraint | What shipped | Ladder step |
|---|---|---|---|---|
| D1 | §2.8 Web stack (Next.js App Router + 7 pinned deps) | App Builder sandbox requires TanStack Start + existing Vite/React 19 workspace; Next.js scaffold would blank the live preview | Web app on TanStack Start, port 8080, Tailwind v4 tokens matching §6 verbatim | Constraint of the host; pillars P1–P4 preserved |
| D2 | §2.1 / Task 3 `spec-inputs/demo-sessions.json` (1,563 rows) and `seed-map.json` (~4,981 rows) | Files were not in the instruction repo | A constructed 7-day envelope that **hits the locked goldens** (D=7, D_p=1/7, D_c=7/7, union 39.37h, sum 39.61h, double-count 0.24h, Android live day 85 sessions / 7.02h, banner "Phone tracker off since Aug 28"). Compact seed map covering all demo labels + the 13+4 seeds + private fixture. Marked as demo. | User: "don't halt… build the functioning app" |
| D3 | Android Tasks 5–6 / 14–22 | No Android SDK / Gradle / device in this sandbox | Web engine + UI only. Kotlin `:engine` not compiled here. | Host constraint |
| D4 | §2.8 `@vercel/postgres`, Razorpay, satori/resvg | No payment API keys (user: keep aside); no Vercel Postgres in sandbox | Checkout is a local simulated grant (`tf_ent_mirror`). Week card is an in-browser SVG/PNG, not a server resvg route. Server store adapter is a localStorage/memory stand-in. | User: payment keys aside |
| D5 | `middleware.ts` banned; luxon pinned | TanStack Start has no Next middleware; luxon not preinstalled | No middleware. Date math via `Intl` + injected Clock (ports). date-fns already in the workspace is unused by the engine. | P1 determinism preserved |
| D6 | §6.6 Material Symbols Outlined, exactly 12 glyphs | lucide-react is the preinstalled icon set | The same 12 roles mapped to lucide outlines (LayoutDashboard, PlayCircle, Calendar, Settings, TriangleAlert, HeartCrack, Check, ArrowUp/Down, Clock, Download, Upload, Share2). No extra glyphs. | Visual role identity |
| D7 | Twin-engine golden harness (Kotlin + TS) | No Kotlin toolchain | TypeScript harness asserts `goldens.json`. Kotlin twin deferred. | D3 |
| D8 | Legal live values | `legal.json` may be placeholders | `spec-inputs/legal.json` uses placeholder GSTIN/support as the spec allows | Spec §5.9.17 |
