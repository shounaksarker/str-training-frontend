# STR Training Frontend

A Next.js frontend for the short-term rental underwriting assessment. Trainees choose a property, save an investment forecast, submit it, and compare their Mid annual revenue estimate with an analyst reference. This repository sits beside the supplied `strs_fe_assessment_v1/backend` project. `nextjs-nucleus` was used as an architectural reference; this is a separate app.

## Run locally

Requirements: Node.js 22, npm, Docker for the supplied backend. From the assessment workspace root:

```bash
cd strs_fe_assessment_v1/backend
docker compose up -d --build
curl http://localhost:8000/api/health
```

In another terminal, also from the assessment workspace root:

```bash
cd str-training-frontend
nvm use 22
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The `.env.example` value is `BACKEND_API_URL=http://127.0.0.1:8000`; change it in `.env.local` if the backend runs elsewhere. If port 3000 is busy, use `npm run dev -- --port 3001` and open http://localhost:3001. The backend's first Docker start migrates and seeds six sample properties across four markets. See its own README for Docker troubleshooting and port overrides.

Quick checks:

```bash
curl http://localhost:8000/api/dashboard
curl http://localhost:3000/api/dashboard
```

The second request goes through the frontend BFF. The app has no authentication because the supplied backend has none. The backend and its Postgres volume hold drafts and submissions across frontend restarts.

## Product flow

1. **Dashboard:** See available properties, progress, latest and best scores, and whether each case is new, in progress, or submitted.
2. **Property:** Review listing details and market context. Start a draft prefilled with the property's price and address, or continue an existing draft.
3. **Underwriting:** Enter purchase financing, one-time setup costs, monthly operating expenses, tax assumptions, Low/Mid/High annual revenue, and optional deal tags. Save partial sections and return later. Percentages shown as `20` in the form are sent as `0.20` to the API.
4. **Calculated snapshot:** Once purchase, revenue, and tax sections are complete, the backend returns total out-of-pocket cash, tax savings, and scenario revenue, NOI, free cash flow, and cash-on-cash values. The frontend displays those values without recalculating them.
5. **Submit and review:** A confirmation step finalizes the draft. The result shows the backend score, Mid revenue comparison, and a rank among recorded submissions. The dashboard then reflects the attempt; the property can be attempted again.

The form checks required sections, Low ≤ Mid ≤ High revenue, and complete setup/expense rows before sending a save. Submission stays disabled until the backend has calculated a saved draft and no edits remain unsaved. The backend remains the final validator.

## Architecture

```text
Browser → Next.js pages / route handlers → typed API client → FastAPI → Postgres
```

| Path | Responsibility |
|---|---|
| `src/app` | Pages and small `/api` route handlers (BFF) |
| `src/features/training/components` | Dashboard, property cards, form editors, and actions |
| `src/components/ui` | Reusable UI primitives |
| `src/lib/api/endpoints.ts` | Backend endpoint constants |
| `src/lib/api/client.ts` | Server-side fetch, timeout, and backend error mapping |
| `src/lib/api/types.ts` | Request and response types and deal tag definitions |
| `tests/e2e` | Browser journeys and validation checks |
| `tests/fixtures/mock-api.mjs` | Deterministic API responses for browser tests |

Server-rendered pages call the shared API client. Browser actions such as creating, saving, and submitting a draft call this app's `/api` routes; those routes call the same client. `BACKEND_API_URL` stays on the server, and backend calls use `cache: "no-store"` so progress and results are fresh. This BFF is intentionally thin: it validates route input and maps errors, while FastAPI owns persistence, calculations, and scoring.

The UI uses Next.js 16 App Router, React, TypeScript, Tailwind CSS, and shadcn/ui components. Listing images are omitted because the provided sample image URLs are unrelated placeholder photos.

## Calculation and scoring

The backend calculates the investment figures from saved assumptions. In particular, total out-of-pocket cash is the down payment + closing costs + one-time setup costs. For each revenue scenario, NOI subtracts annual operating expenses and co-hosting fees; annual free cash flow subtracts annual debt service from NOI. Cash-on-cash return divides free cash flow by out-of-pocket cash. The backend also applies its scenario expense multipliers and tax depreciation assumptions. See `../strs_fe_assessment_v1/backend/app/services/underwriting_calculator.py` for the full formulas and rounding rules.

Only the **Mid annual revenue forecast** affects the training score:

```text
deviation = |trainee Mid revenue − analyst Mid revenue| / analyst Mid revenue
```

| Deviation from analyst reference | Rating | Score |
|---|---|---:|
| Up to and including 10% | Best | 100 |
| Over 10%, up to and including 25% | Medium | 70 |
| Over 25% | Low | 40 |

The hidden analyst reference is revealed on the result page after submission. These bands and the score breakdown come from the backend; the frontend only formats the response. Deal tags and the other revenue scenarios do not change the score.

## Verification

```bash
nvm use 22
npm run test:e2e
npm run lint
npm run build
```

For the first browser test run after `npm ci`, install Chromium with `npx playwright install chromium`. The Playwright command starts a mock API on port 8010 and a separate Next.js server on port 3005. It does not need Docker or modify the real backend database. The test server builds in `.next-playwright`, leaving a normal local dev server alone. Keep those two ports free during the run.

The mock resets before each test and supplies one property and a fixed $125,000 analyst Mid forecast. Four browser tests cover the complete dashboard → property → draft → submission → result journey for 100, 70, and 40 scores; draft persistence for costs and a tag; and invalid revenue/expense entries. The mock returns representative calculation and rating responses for UI testing; it is not a second calculation engine. Backend calculation and scoring are covered by the supplied backend's own tests.

On failure, Playwright saves screenshots and traces in `test-results/` and an HTML report in `playwright-report/`. Inspect them with `npx playwright show-report` or `npx playwright show-trace test-results/<test-name>/trace.zip`. Those generated directories are ignored by Git.

For a recording outline and submission handoff, see [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md).
