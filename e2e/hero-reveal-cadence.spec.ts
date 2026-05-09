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

      // Step 1 — drive opacity to 0 inline and wait long enough for the
      // existing 220ms transition to fully complete at 0 (otherwise the
      // next change interrupts mid-flight and `transitionend` may never
      // fire). 400ms gives a safe buffer over the declared 220ms.
      el.style.opacity = "0";
      window.setTimeout(() => {
        // Step 2 — listen, then remove the inline override so the class
        // opacity:1 re-applies and triggers a fresh measured transition.
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
        // Force a layout flush so the next style change is seen as a transition.
        void el.offsetHeight;
        el.style.opacity = "";
      }, 400);
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
      // Tailwind's `ease-out` utility compiles to `cubic-bezier(0,0,0.2,1)`;
      // the CSS keyword `ease-out` serializes as `cubic-bezier(0,0,0.58,1)`.
      // Both are accepted "ease-out" curves — anything else (linear, spring,
      // custom control points) is a regression.
      const ALLOWED_EASE = [
        "ease-out",
        "cubic-bezier(0, 0, 0.58, 1)",
        "cubic-bezier(0, 0, 0.2, 1)",
      ];
      expect(
        ALLOWED_EASE.includes(easing),
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
