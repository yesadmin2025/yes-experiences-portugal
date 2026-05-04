/**
 * Hero — chapter cross-fade visual checks (MOBILE viewport).
 *
 * Mirrors `hero-chapter-crossfade.spec.ts` but pinned to the iPhone 14
 * viewport (393×851, DPR 2.75) — the canonical Core memory target for
 * this project. Mobile is where:
 *
 *   - the copy column is narrowest (max-w-[19.5rem] xs:max-w-[21rem]),
 *     so any layout drift mid-fade is loudest,
 *   - the video is portrait 9:16 source on a portrait viewport, so the
 *     overlay text sits closer to chapter copy and any overlap stutter
 *     is most visible,
 *   - the 30fps re-encoded film is decoded under mobile-class CPU
 *     budgets in CI emulation.
 *
 * Same contract as desktop:
 *   - During the 600ms cosine cross-fade BOTH overlays render with
 *     opacities ∈ (0,1) summing to ~1.
 *   - After OVERLAP_MS the previous overlay is unmounted.
 */
import { test, expect, devices, type Page } from "@playwright/test";
import { HERO_SCENES } from "../src/content/hero-scenes-manifest";

const VIDEO_SELECTOR = ".hero-story-stage video[data-hero-film='true']";
const OVERLAP_MS = 600;

test.use({
  ...devices["iPhone 14"],
  // Force the canonical mobile viewport even if the device descriptor
  // ever drifts — this is the size the team browses on.
  viewport: { width: 393, height: 851 },
});

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
      return parseFloat(getComputedStyle(el).opacity || "1");
    };
    return {
      hasPrev: !!prev,
      hasCurrent: !!current,
      prevOpacity: opacityOf(prev),
      currentOpacity: opacityOf(current),
    };
  });
}

test.describe("Hero — chapter cross-fade (mobile 393×851)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForVideoMetadata(page);
  });

  for (let i = 0; i < HERO_SCENES.length - 1; i += 1) {
    const outgoing = HERO_SCENES[i];
    const incoming = HERO_SCENES[i + 1];
    const boundary = outgoing.endTime;

    test(`mobile cross-fade "${outgoing.id}" → "${incoming.id}" at t≈${boundary}s`, async ({
      page,
    }) => {
      // Park just before the boundary inside the outgoing chapter.
      await seekAndPause(page, Math.max(0, boundary - 0.15));
      await expect(
        page.locator("section[data-hero-scene]").first(),
      ).toHaveAttribute("data-hero-scene", outgoing.id);

      // Cross the boundary — alpha begins ramping 0 → 1 over OVERLAP_MS.
      await seekAndPause(page, boundary + 0.1);

      // Sample at three points across the 600ms transition window.
      const samples: OverlaySample[] = [];
      for (const waitMs of [150, 300, 450]) {
        await page.waitForTimeout(waitMs - (samples.length ? 150 : 0));
        samples.push(await sampleOverlays(page));
      }

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
        `[mobile] no mid-fade sample. samples=${JSON.stringify(samples, null, 2)}`,
      ).toBeTruthy();

      if (midFadeSample) {
        // Cosine ease — complementary opacities, sum ≈ 1.
        const sum =
          midFadeSample.prevOpacity + midFadeSample.currentOpacity;
        expect(sum).toBeGreaterThan(0.85);
        expect(sum).toBeLessThan(1.15);
      }

      // Snapshot the narrow mobile copy column mid-transition.
      await seekAndPause(page, boundary + 0.1);
      await page.waitForTimeout(300);
      const copyColumn = page.locator(".hero-copy-column").first();
      await expect(copyColumn).toBeVisible();
      await copyColumn.scrollIntoViewIfNeeded();
      await expect(copyColumn).toHaveScreenshot(
        `hero-crossfade-mobile-${outgoing.id}-to-${incoming.id}.png`,
        { maxDiffPixelRatio: 0.05 },
      );
    });
  }

  test("[mobile] after OVERLAP_MS the previous overlay is unmounted", async ({
    page,
  }) => {
    const boundary = HERO_SCENES[0].endTime;
    await seekAndPause(page, Math.max(0, boundary - 0.15));
    await seekAndPause(page, boundary + 0.1);
    await page.waitForTimeout(OVERLAP_MS + 200);

    expect(
      await page.locator('[data-hero-overlay="prev"]').count(),
    ).toBe(0);
    expect(
      await page.locator('[data-hero-overlay="current"]').count(),
    ).toBe(1);
  });
});
