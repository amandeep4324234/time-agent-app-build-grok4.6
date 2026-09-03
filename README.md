# Timeframe

An honest attention ledger. The phone and the browser already know — Timeframe just tells you the truth.

This is the **web app** built from the Timeframe MASTER-BUILD-SPEC inside the Grok App Builder sandbox (`time-agent-app-build-grok4.6`). Android / Kotlin is out of scope here; payments are simulated because no Razorpay keys were provided.

## What it is

Timeframe is a **witness**, not a discipline tool.

- **P1** The ledger never lies. Blank is not zero. Union, not sum.
- **P2** Confess the instrument. "Phone tracker off since Aug 28" is a feature.
- **P3** Reward approach. The creature grows with focus-set time; it is not a score.
- **P4** The creature rides on truth. Paid skins never rewrite the numbers.

Locked goldens for the demo week (Mon 24 Aug – Sun 30 Aug 2026, TZ `Asia/Kolkata`, logical day 04:00→04:00):

| Metric | Value |
|---|---|
| D | 7 |
| D_p / D_c | 1/7 · 7/7 |
| union | 39.37h |
| sum | 39.61h |
| double-counted | 0.24h |
| Android live day | 85 sessions / 7.02h |
| Banner | Phone tracker off since Aug 28 |

Free forever: the seven numbers, honesty banners, heatmap, export/import. Paid (simulated): creature growth, streak, named killer, clean share card.

## Routes

| Path | Screen |
|---|---|
| `/` | Landing + pricing |
| `/app` | Dashboard (seven cards) |
| `/week` | Week card + footer |
| `/block` | Focus-run replay |
| `/onboarding` | Egg → honesty → pin chips |
| `/debrief` | Six-line evening summary |
| `/checkout` | Simulated UPI grant |
| `/terms` `/privacy` | Stub legal |

## Stack (sandbox deviation)

Spec asked for Next.js App Router. This sandbox requires **TanStack Start + React 19 + Vite**, preview on `0.0.0.0:8080`. Full list in [`DEVIATIONS.md`](./DEVIATIONS.md).

## Run

```bash
npm install
npm run dev          # 0.0.0.0:8080
npm run typecheck
npm test
npm run build
```

Demo data lives in `src/data/` (and `spec-inputs/`). The original 1,563-row fixture was not in the instruction repo; a constructed envelope hits the locked goldens and is marked **Demo data**.

## Side notes (not wired)

- Razorpay / UPI live keys — checkout grants a local Pro entitlement (`tf_store`).
- `@vercel/postgres` — ledger is localStorage / zustand.
- Kotlin `:engine` twin and Android collector — not in this repo.
- PNG week-card export via satori/resvg — in-browser SVG instead.

Built as a functioning web app first. The little things can wait.
