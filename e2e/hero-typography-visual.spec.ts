/**
 * Hero typography — screenshot-based visual regression.
 *
 * Locks the rendered pixels of the hero copy block (eyebrow, headline
 * L1 + L2, subheadline) AFTER web fonts have loaded and reveals are
 * frozen at their final state via `?hero=last`.
 *
 * This complements the metric / token / fontload specs: those catch
 * declarative drift (family, weight, size); this catches everything
 * else — anti-alias, kerning shifts, italic glyph swaps, color tone,
 * gradient bleed-through behind the copy.
 *
 * Baselines live at:
 *   e2e/hero-typography-visual.spec.ts-snapshots/<name>-<project>.png
 *
 * To regenerate after an *intentional* design change:
 *   bunx playwright test hero-typography-visual --update-snapshots
 *
 * Threshold is intentionally tight (maxDiffPixelRatio 0.012, ~1.2%) so
 * a real regression — Portugal losing italic gold, headline losing
 * Montserrat, leading collapsing — fails the run, but normal sub-pixel
 * jitter from a different headless build does not.
 */

import { test, expect, type Page } from "@playwright/test";

async function prepHero(page: Page) {
  await page.goto("/?hero=last", { waitUntil: "domcontentloaded" });
  await page
    .locator('[data-hero-cinematic="true"]')
    .waitFor({ state: "visible" });
  await page
    .locator('[data-hero-field="headlineLine1"]:not(h1)')
    .waitFor({ state: "visible" });

  // Mask the background film — its frames are non-deterministic and
  // would dominate any pixel diff. We screenshot the copy column only.
  await page.evaluate(async () => {
    type FontFaceSetLike = { ready?: Promise<unknown> };
    const fonts = (document as unknown as { fonts?: FontFaceSetLike }).fonts;
    if (fonts?.ready) await fonts.ready;
    // Pause + hide the film + scrims so the snapshot only captures
    // typography on a transparent (becomes black via section bg) frame.
    const video = document.querySelector(
      '[data-hero-film="true"]',
    ) as HTMLVideoElement | null;
    if (video) {
      try {
        video.pause();
      } catch {}
      video.style.visibility = "hidden";
    }
    document
      .querySelectorAll('[data-hero-cinematic="true"] [aria-hidden="true"]')
      .forEach((el) => {
        (el as HTMLElement).style.visibility = "hidden";
      });
    // Wait two frames so the visibility change paints before we shoot.
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
}

test.describe("Hero typography — screenshot visual regression", () => {
  test("eyebrow + headline + subheadline match approved snapshot", async ({
    page,
  }, testInfo) => {
    await prepHero(page);

    // Bound the screenshot to the eyebrow → subheadline range. CTAs and
    // microcopy are covered by their own specs and shift across hero
    // variants.
    const eyebrow = page.locator('[data-hero-field="eyebrow"]');
    const sub = page.locator('[data-hero-field="subheadline"]');

    const region = await page.evaluate(() => {
      const eb = document.querySelector(
        '[data-hero-field="eyebrow"]',
      ) as HTMLElement | null;
      const sh = document.querySelector(
        '[data-hero-field="subheadline"]',
      ) as HTMLElement | null;
      if (!eb || !sh) throw new Error("hero copy bounds not found");
      const a = eb.getBoundingClientRect();
      const b = sh.getBoundingClientRect();
      const left = Math.floor(Math.min(a.left, b.left)) - 4;
      const right = Math.ceil(Math.max(a.right, b.right)) + 4;
      const top = Math.floor(a.top) - 4;
      const bottom = Math.ceil(b.bottom) + 4;
      return {
        x: Math.max(0, left),
        y: Math.max(0, top),
        width: right - left,
        height: bottom - top,
      };
    });

    await eyebrow.waitFor({ state: "visible" });
    await sub.waitFor({ state: "visible" });

    expect(region.width).toBeGreaterThan(120);
    expect(region.height).toBeGreaterThan(120);

    const buf = await page.screenshot({
      clip: region,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    });

    await expect(buf).toMatchSnapshot(
      [`hero-typography-${testInfo.project.name}.png`],
      {
        // Tight but resilient: ~1.2% of pixels can differ, each by up
        // to a moderate per-channel delta. A Portugal-italic regression
        // or a font swap is far above this floor.
        maxDiffPixelRatio: 0.012,
        threshold: 0.18,
      },
    );
  });
});
