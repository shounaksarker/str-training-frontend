# STR Training Frontend

Frontend for the short-term rental underwriting assessment. This is a separate Git repository alongside the provided backend and the `nextjs-nucleus` reference template.

## Requirements

- Node.js 22 (`nvm use 22`)
- npm
- The provided backend running at `http://localhost:8000`

## Run locally

```bash
nvm use 22
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The backend can be started from `../strs_fe_assessment_v1/backend` with `docker compose up -d --build`.

## Current milestone

The Next.js, TypeScript, Tailwind, and shadcn/ui foundation is in place. The dashboard shows live case status, progress, and previous scores. Property details, draft creation, and draft saving call the backend through Next.js BFF routes. The underwriting workspace captures purchase, revenue, and tax assumptions and displays backend-calculated returns after saving. Submission, results, and Playwright tests will be added in reviewable steps.

Set `BACKEND_API_URL` in `.env.local` if the backend is not at `http://127.0.0.1:8000`. The browser will call this app's `/api/dashboard`; only the server reads the backend URL. While the backend is running, `curl http://localhost:3000/api/dashboard` should return its seeded properties after starting `npm run dev`.

Sample listing images from the backend are not shown because they are unrelated placeholder photos.

## Planned structure

- `src/app` — routes, layouts, and the small Next.js BFF layer
- `src/features/training` — dashboard, underwriting form, review, and result components
- `src/components/ui` — reusable shadcn/ui primitives
- `src/lib/api` — typed backend calls and endpoint constants

The backend is responsible for underwriting calculations and scoring. The frontend will convert displayed percentages to fractional API values and present the backend's calculated results.
