import { defineConfig, devices } from "@playwright/test";

// Local config that targets the already-running dev server on :8080.
// The default playwright.config.ts boots its own server on :5173, which
// collides with vite's actual port (8080) in this sandbox.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://localhost:8080", trace: "off" },
  projects: [{ name: "mobile-chromium", use: { ...devices["Pixel 5"] } }],
});
