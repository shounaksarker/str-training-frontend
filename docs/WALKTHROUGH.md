# Assessment walkthrough (10–12 minutes)

Use this as a recording outline, not a claim that a video has already been recorded. Speak naturally and show the running application. Start with the supplied backend and frontend running; keep the browser, terminal, and editor ready. The backend stores submissions, so choose a case you are comfortable adding to your local data. The score in a live demo depends on that property's hidden analyst reference.

## 0:00–1:00 — Goal and setup

**Show:** Two sibling folders, `str-training-frontend` and `strs_fe_assessment_v1/backend`; browser on the dashboard.

**Say:** “This is a short-term rental analyst training app. A trainee selects a property, builds an underwriting, saves a draft, and submits a Mid revenue estimate. The backend compares that estimate with the analyst reference and returns a score. I built the frontend as a separate Next.js project, using the provided backend locally.”

Mention Node 22, the Docker backend on port 8000, and the frontend on port 3000 or your actual port. Avoid spending recording time on dependency installation.

## 1:00–2:15 — Dashboard

**Show:** Summary cards, progress bar, and property cards. Point out “Start case,” “Continue case,” and “View result” where your current data makes them available.

**Say:** “The dashboard is backed by `GET /api/dashboard`. It shows the case status, attempt count, latest score, and best score. I use the backend response directly rather than keeping a separate progress store in the browser.”

## 2:15–3:15 — Property and market context

**Show:** Open a property. Point out listing price, bed/bath/area, market description, and the action to start or continue a draft.

**Say:** “The property page provides context before any assumptions are entered. Starting a case creates an underwriting prefilled from the selected property, and an unfinished case can be resumed.”

## 3:15–6:30 — Build and save an underwriting

**Show:** Enter sample values. Keep the prefilled purchase price. Example inputs: down payment 20%, interest 6.5%, mortgage term 30 years, closing costs 3%; a furniture setup cost of $12,000 and monthly utilities of $450; tax assumptions 20%, 25%, 60%, and 30%; Low/Mid/High annual revenue of $90,000/$120,000/$150,000. Select a relevant deal tag. These are demo inputs, not an investment recommendation.

**Say:** “The form is grouped by the same concepts as the assessment. Percentages are human-friendly in the UI and converted to fractional values for the API. One-time costs and monthly expenses are separate line items. The Low, Mid, and High forecasts must be ordered.”

Click **Save draft**. Point out total out-of-pocket cash, tax savings, NOI, free cash flow, and cash-on-cash values. Reload the page briefly to show persistence.

**Say:** “The backend computes these figures when the required sections are complete. The frontend renders its response; it does not copy the financial formulas.”

## 6:30–7:45 — Validation and submission

**Show:** If you want to demonstrate validation without disturbing the saved draft, add an empty expense row and click **Save draft** to show the error; then remove it. Review the saved calculation, click **Review & submit**, and show the confirmation state. Confirm submission.

**Say:** “The form catches incomplete rows and impossible revenue ordering. It also prevents submission while changes are unsaved. The backend performs final validation and grading when I confirm.”

## 7:45–9:00 — Result and leaderboard

**Show:** Score, Mid forecast versus analyst reference, deviation explanation, scoring bands, and leaderboard rank. Return to the dashboard to show updated progress.

**Say:** “Only Mid annual revenue affects the score. The backend calculates absolute deviation from the reference: up to 10% earns 100, up to 25% earns 70, and beyond that earns 40. The result page uses the backend's score and breakdown. It also ranks recorded attempts.”

Do not predict the live score before submitting; each property has its own reference.

## 9:00–10:30 — Code structure and BFF

**Show:** `src/app`, `src/features/training/components`, `src/lib/api/endpoints.ts`, `src/lib/api/client.ts`, and one route handler such as `src/app/api/underwritings/[id]/route.ts`.

**Say:** “Server-rendered pages and the Next.js API routes share one typed backend client. Browser writes go through the Next.js BFF. Endpoint paths are centralized, and the backend URL stays server-side. The BFF only validates input and maps errors; FastAPI owns database changes, financial calculations, and scoring.”

## 10:30–11:30 — Tests and close

**Show:** `npm run test:e2e` output, or run it before recording and show the 4 passing tests. Point out `tests/e2e/training.spec.ts` and `tests/fixtures/mock-api.mjs`.

**Say:** “The browser tests run against a deterministic mock API, so they do not alter the supplied backend database. They cover the full journey for 100, 70, and 40 scores, draft persistence, and invalid input. A separate port and build directory keep them isolated from the local app.”

Finish by pointing to `README.md` for setup and verification commands.

## Before submission

- Run `npm run test:e2e` and `npm run build` with Node 22.
- Check the live backend dashboard and complete one manual flow.
- Record and watch the final video to confirm the screen, audio, and full result are visible.
- Commit and push the frontend repository yourself, then include the repository and video links requested by the assessment. This outline does not upload or submit anything.
