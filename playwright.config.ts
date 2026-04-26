import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for E2E tests.
 *
 * • Boots the project's vite dev server on a fixed port so tests are
 *   self-contained — no manual `bun run dev` required.
 * • Runs against Chromium at a mobile-ish viewport by default so the
 *   sticky-CTA tests exercise the `(max-width: 1023.98px)` mediaQuery
 *   gate that <MobileStickyCTA> uses.
 * • Single worker locally — these tests scroll the same page, parallel
 *   workers don't add value and just compete for the dev server.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
