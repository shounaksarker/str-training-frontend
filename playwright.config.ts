import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3005",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node tests/fixtures/mock-api.mjs",
      url: "http://localhost:8010/__health",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "PLAYWRIGHT_TEST=1 BACKEND_API_URL=http://localhost:8010 npm run dev -- --hostname localhost --port 3005",
      url: "http://localhost:3005",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
