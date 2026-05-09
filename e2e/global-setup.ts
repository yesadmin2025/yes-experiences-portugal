import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Playwright globalSetup — runs once before any test worker boots.
 *
 * Currently performs a non-blocking system-library precheck against the
 * Chromium binary Playwright will use (see scripts/check-playwright-libs.mjs).
 * If `libglib-2.0` / `libnss3` / etc. are missing on the host, the user
 * gets an actionable warning before the headless shell crashes with
 * `Target page, context or browser has been closed`.
 */
export default async function globalSetup() {
  const script = fileURLToPath(new URL("../scripts/check-playwright-libs.mjs", import.meta.url));
  if (!existsSync(script)) return;
  spawnSync(process.execPath, [script], { stdio: "inherit" });
}
