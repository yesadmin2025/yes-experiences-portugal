/**
 * Hero reveal cadence — measured 220ms ease-out regression.
 *
 * The cinematic hero declares a four-step reveal (eyebrow → headlineLine1
 * → headlineLine2 → finalBlock), each transitioning over 220ms with
 * `ease-out`. The static spec in `hero-typography-colors.spec.ts` checks
 * the *declared* timing (data-* attrs + `transition-duration`). This
 * file goes one step further and **measures the real transition** to
 * catch drift caused by:
 *
 *   • somebody changing duration-[220ms] → duration-300
 *   • a parent rule re-pointing `transition-timing-function` to linear/spring
 *   • a CSS override that disables the transition entirely (would resolve
 *     instantly and fall outside the tolerance window)
 *
 * Method: for each reveal target, force a fresh opacity transition by
 * setting `style.opacity = '0'`, waiting two frames so the change is
 * committed, restoring the class-driven opacity, and timing the gap
 * between the trigger and the `transitionend` event for `opacity`.
 *
 * Tolerance: 220ms ± 60ms. The lower bound (160ms) catches duration
 * cuts; the upper bound (280ms) catches drift toward 300/400ms or
 * spring-style easing. Easing curve is asserted via the computed
 * `transition-timing-function` (parsed safely past the comma in
 * `cubic-bezier(...)`).
 */

import { test, expect, type Page } from "@playwright/test";

const REVEAL_SELECTORS = [
  '[data-hero-reveal="eyebrow"]',
  '[data-hero-reveal="headlineLine1"]',
  '[data-hero-reveal="headlineLine2"]',
  '[data-hero-reveal="finalBlock"]',
] as const;

const TARGET_MS = 220;
const TOLERANCE_MS = 60;

/** Split a comma-separated CSS list without breaking on commas inside parens. */
function firstCssListItem(value: string): string {
  return (value.split(/,(?![^()]*\))/)[0] ?? "").trim();
}

async function measureTransition(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    return new Promise<number>((resolve, reject) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) return reject(new Error(`not found: ${sel}`));

      // Force a fresh transition: drop to opacity 0 inline, wait two
      // animation frames so the browser commits the new style, then
      // remove the inline override so the class-driven opacity:1
      // re-applies and triggers the 220ms transition.
      el.style.opacity = "0";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const start = performance.now();
          const onEnd = (ev: TransitionEvent) => {
            if (ev.propertyName !== "opacity") return;
            el.removeEventListener("transitionend", onEnd);
            window.clearTimeout(timer);
            el.style.opacity = "";
            resolve(performance.now() - start);
          };
          el.addEventListener("transitionend", onEnd);
          const timer = window.setTimeout(() => {
            el.removeEventListener("transitionend", onEnd);
            el.style.opacity = "";
            reject(new Error(`transitionend timeout for ${sel}`));
          }, 2000);
          el.style.opacity = "";
        });
      });
    });
  }, selector);
}

async function readTimingFunction(page: Page, selector: string): Promise<string> {
  const raw = await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) throw new Error(`not found: ${sel}`);
    return window.getComputedStyle(el).transitionTimingFunction;
  }, selector);
  return firstCssListItem(raw);
}

test.describe("Hero reveal cadence — measured 220ms ease-out", () => {
  test("each reveal target finishes a fresh opacity transition in 220ms ± 60ms with ease-out", async ({
    page,
  }) => {
    // ?hero=last freezes the film on the final beat so all reveals are
    // already in their visible end-state — perfect baseline for forcing
    // a fresh trip from opacity:0 → opacity:1 without racing the video.
    await page.goto("/?hero=last", { waitUntil: "domcontentloaded" });
    await page.locator('[data-hero-cinematic="true"]').waitFor({ state: "visible" });

    // Wait for fonts so layout is fully settled before measuring.
    await page.evaluate(async () => {
      type FF = { ready?: Promise<unknown> };
      const f = (document as unknown as { fonts?: FF }).fonts;
      if (f?.ready) await f.ready;
    });

    for (const sel of REVEAL_SELECTORS) {
      const easing = await readTimingFunction(page, sel);
      // Chromium serializes `ease-out` as `cubic-bezier(0, 0, 0.58, 1)`.
      // Both forms are accepted; nothing else (linear / cubic-bezier
      // with custom control points / spring) is.
      expect(
        ["ease-out", "cubic-bezier(0, 0, 0.58, 1)"].includes(easing),
        `${sel} must transition with ease-out, got "${easing}"`,
      ).toBe(true);

      const measured = await measureTransition(page, sel);
      expect(
        measured,
        `${sel} measured transition ${measured.toFixed(1)}ms is outside ` +
          `${TARGET_MS}ms ± ${TOLERANCE_MS}ms`,
      ).toBeGreaterThanOrEqual(TARGET_MS - TOLERANCE_MS);
      expect(
        measured,
        `${sel} measured transition ${measured.toFixed(1)}ms is outside ` +
          `${TARGET_MS}ms ± ${TOLERANCE_MS}ms`,
      ).toBeLessThanOrEqual(TARGET_MS + TOLERANCE_MS);
    }
  });

  test("data-hero-reveal-order declares strict sequential order 1→2→3→4", async ({
    page,
  }) => {
    await page.goto("/?hero=last", { waitUntil: "domcontentloaded" });
    await page.locator('[data-hero-cinematic="true"]').waitFor({ state: "visible" });

    const orders = await page.evaluate((selectors) => {
      return selectors.map((sel) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        return el?.dataset.heroRevealOrder ?? null;
      });
    }, [...REVEAL_SELECTORS]);

    expect(orders).toEqual(["1", "2", "3", "4"]);
  });
});
