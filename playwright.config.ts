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
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  // Snapshot config — visual regression tests. A 0.2% pixel-diff budget
  // tolerates sub-pixel font rendering jitter without hiding real layout
  // breakage; an 8-pixel max diff per channel keeps anti-aliasing noise
  // from registering as a regression.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.002,
      threshold: 0.15,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  projects: [
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "bun run dev",
        url: "http://localhost:8080",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
