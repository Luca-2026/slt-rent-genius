import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for SLT Rental E2E tests.
 * - Tests run against the locally running Vite dev server (port 8080).
 * - The sandbox keeps a dev server alive, so we do not spin up a new one.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  workers: 4,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080",
    trace: "retain-on-failure",
    actionTimeout: 8_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
