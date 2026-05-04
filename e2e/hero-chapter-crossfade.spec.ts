/**
 * Hero — chapter cross-fade visual checks.
 *
 * The chapter overlays use a 600ms eased cross-fade (cosine S-curve)
 * when playback crosses a chapter boundary: the OUTGOING block fades
 * 1→0 while the INCOMING block fades 0→1 simultaneously, with their
 * opacities summing to ~1 throughout the transition.
 *
 * This spec verifies the transition itself — not just the steady-state
 * mid-chapter view that `hero-chapter-timeline.spec.ts` covers. We:
 *
 *   1. Seek the film to ~50ms BEFORE a chapter boundary, let the rAF
 *      tick lock the outgoing chapter as active.
 *   2. Step currentTime ~100ms PAST the boundary, which triggers the
 *      cross-fade (heroPrevIndex set, alpha ramps from 0 to 1 over
 *      600ms). We do NOT freeze rAF — we want the transition running.
 *   3. While the transition is in flight, sample both overlays and
 *      assert: both rendered, both opacities ∈ (0, 1), and their sum
 *      is close to 1 (cosine ease is complementary by construction).
 *   4. Snapshot the copy column mid-transition so any future change
 *      to the overlap rendering / easing curve is caught visually.
 *
 * We capture this for every interior chapter boundary so each
 * cross-fade is independently verified.
 */
import { test, expect, type Page } from "@playwright/test";
import { HERO_SCENES } from "../src/content/hero-scenes-manifest";

const VIDEO_SELECTOR = ".hero-story-stage video[data-hero-film='true']";
const OVERLAP_MS = 600;

async function waitForVideoMetadata(page: Page) {
  await page.locator(VIDEO_SELECTOR).waitFor({ state: "attached" });
  await page.evaluate(
    (sel) =>
      new Promise<void>((resolve) => {
        const v = document.querySelector(sel) as HTMLVideoElement | null;
        if (!v) return resolve();
        if (v.readyState >= 1) return resolve();
        v.addEventListener("loadedmetadata", () => resolve(), { once: true });
      }),
    VIDEO_SELECTOR,
  );
}

/**
 * Seek to `t` and pause without disabling animations — the cross-fade
 * uses CSS opacity transitions driven by React state (heroFadeAlpha),
 * which is updated via rAF. We need rAF + transitions live.
 */
async function seekAndPause(page: Page, t: number) {
  await page.evaluate(
    ({ sel, t: time }) => {
      const v = document.querySelector(sel) as HTMLVideoElement | null;
      if (!v) throw new Error("hero film not found");
      v.pause();
      v.currentTime = time;
    },
    { sel: VIDEO_SELECTOR, t },
  );
  // One rAF for the seek to land + the rAF tick to commit state.
  await page.evaluate(
    () =>
      new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      ),
  );
}

type OverlaySample = {
  hasPrev: boolean;
  hasCurrent: boolean;
  prevOpacity: number;
  currentOpacity: number;
  prevSceneText: string;
  currentSceneText: string;
};

async function sampleOverlays(page: Page): Promise<OverlaySample> {
  return page.evaluate(() => {
    const prev = document.querySelector<HTMLElement>(
      '[data-hero-overlay="prev"]',
    );
    const current = document.querySelector<HTMLElement>(
      '[data-hero-overlay="current"]',
    );
    const opacityOf = (el: HTMLElement | null) => {
      if (!el) return -1;
      const cs = getComputedStyle(el);
      return parseFloat(cs.opacity || "1");
    };
    return {
      hasPrev: !!prev,
      hasCurrent: !!current,
      prevOpacity: opacityOf(prev),
      currentOpacity: opacityOf(current),
      prevSceneText: prev?.textContent?.trim() || "",
      currentSceneText: current?.textContent?.trim() || "",
    };
  });
}

test.describe("Hero — chapter cross-fade", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForVideoMetadata(page);
  });

  // Boundary i sits at HERO_SCENES[i].endTime === HERO_SCENES[i+1].startTime.
  // We test every interior boundary (skip the trailing endTime which has
  // no following chapter to cross-fade INTO).
  for (let i = 0; i < HERO_SCENES.length - 1; i += 1) {
    const outgoing = HERO_SCENES[i];
    const incoming = HERO_SCENES[i + 1];
    const boundary = outgoing.endTime;

    test(`cross-fade between "${outgoing.id}" → "${incoming.id}" at t≈${boundary}s`, async ({
      page,
    }) => {
      // 1. Park ~150ms BEFORE the boundary, inside the outgoing chapter.
      await seekAndPause(page, Math.max(0, boundary - 0.15));

      // Sanity check: section reports the outgoing chapter active.
      await expect(
        page.locator("section[data-hero-scene]").first(),
      ).toHaveAttribute("data-hero-scene", outgoing.id);

      // 2. Step ~100ms PAST the boundary. This triggers the
      //    boundary-crossing branch: heroPrevIndex = outgoing,
      //    heroSceneIndex = incoming, alpha begins ramping 0 → 1
      //    over OVERLAP_MS.
      await seekAndPause(page, boundary + 0.1);

      // 3. Sample the overlay stack at three points across the 600ms
      //    transition window: ~150ms (early), ~300ms (mid), ~450ms (late).
      //    By construction (cosine S-curve) prevOpacity + currentOpacity
      //    should be ≈ 1 at every sample.
      const samples: OverlaySample[] = [];
      for (const waitMs of [150, 300, 450]) {
        await page.waitForTimeout(waitMs - (samples.length ? 150 : 0));
        samples.push(await sampleOverlays(page));
      }

      // At least one sample must catch BOTH overlays present and mid-fade.
      const midFadeSample = samples.find(
        (s) =>
          s.hasPrev &&
          s.hasCurrent &&
          s.prevOpacity > 0.05 &&
          s.prevOpacity < 0.95 &&
          s.currentOpacity > 0.05 &&
          s.currentOpacity < 0.95,
      );
      expect(
        midFadeSample,
        `no mid-fade sample captured. samples=${JSON.stringify(samples, null, 2)}`,
      ).toBeTruthy();

      if (midFadeSample) {
        // Complementary opacities — cosine ease is symmetric.
        expect(
          midFadeSample.prevOpacity + midFadeSample.currentOpacity,
        ).toBeGreaterThan(0.85);
        expect(
          midFadeSample.prevOpacity + midFadeSample.currentOpacity,
        ).toBeLessThan(1.15);

        // Outgoing block carries the previous chapter's main copy
        // (only when the previous chapter has visible main lines —
        // the very first chapter has main: [], so skip that check).
        if (outgoing.main.length > 0) {
          for (const line of outgoing.main) {
            expect(midFadeSample.prevSceneText).toContain(line);
          }
        }
        if (incoming.main.length > 0) {
          for (const line of incoming.main) {
            expect(midFadeSample.currentSceneText).toContain(line);
          }
        }
      }

      // 4. Snapshot mid-transition. We seek again to land at ~300ms
      //    after the boundary deterministically before screenshot.
      await seekAndPause(page, boundary + 0.1);
      await page.waitForTimeout(300);
      const copyColumn = page.locator(".hero-copy-column").first();
      await expect(copyColumn).toBeVisible();
      await copyColumn.scrollIntoViewIfNeeded();
      await expect(copyColumn).toHaveScreenshot(
        `hero-crossfade-${outgoing.id}-to-${incoming.id}.png`,
        { maxDiffPixelRatio: 0.04 },
      );
    });
  }

  test("after OVERLAP_MS the previous overlay is unmounted (single overlay steady state)", async ({
    page,
  }) => {
    // Cross the first boundary, wait well past OVERLAP_MS, and verify
    // the prev overlay is gone — leaving a single rendered chapter.
    const boundary = HERO_SCENES[0].endTime;
    await seekAndPause(page, Math.max(0, boundary - 0.15));
    await seekAndPause(page, boundary + 0.1);
    await page.waitForTimeout(OVERLAP_MS + 200);

    const prevCount = await page
      .locator('[data-hero-overlay="prev"]')
      .count();
    expect(prevCount).toBe(0);
    const currentCount = await page
      .locator('[data-hero-overlay="current"]')
      .count();
    expect(currentCount).toBe(1);
  });
});
