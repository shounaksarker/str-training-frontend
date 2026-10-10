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

The Next.js, TypeScript, and Tailwind foundation is in place. The dashboard, underwriting workflow, API integration, shadcn/ui components, and Playwright tests will be added in reviewable steps.

## Planned structure

- `src/app` — routes, layouts, and the small Next.js BFF layer
- `src/features/training` — dashboard, underwriting form, review, and result components
- `src/components/ui` — reusable shadcn/ui primitives
- `src/lib/api` — typed API calls and endpoint constants

The backend is responsible for underwriting calculations and scoring. The frontend will convert displayed percentages to fractional API values and present the backend's calculated results.
