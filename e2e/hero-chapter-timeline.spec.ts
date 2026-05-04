/**
 * Hero — chapter timeline visual regression.
 *
 * Locks the contract that "the right chapter overlay is visible at the
 * right playback time". We seek the cinematic film to a deterministic
 * point inside each chapter window, freeze the video, freeze all
 * animations, and:
 *
 *   1. Assert the hero <section>'s `data-hero-scene` matches the
 *      expected chapter id (sync invariant — overlays NEVER desync
 *      from the underlying film).
 *   2. Snapshot the chapter overlay region so future copy / layout
 *      drift inside any single chapter is caught as a pixel diff.
 *
 * These tests are independent of the auto-sync timeline scaling: we
 * read the chapter windows DIRECTLY from the manifest at runtime, so
 * if a developer re-paces the film the test still seeks to the centre
 * of each canonical chapter without any spec edit.
 */
import { test, expect, type Page } from "@playwright/test";
import { HERO_SCENES } from "../src/content/hero-scenes-manifest";

const VIDEO_SELECTOR = ".hero-story-stage video[data-hero-film='true']";

async function freezeHeroAt(page: Page, currentTime: number) {
  await page.evaluate(
    ({ sel, t }) => {
      const v = document.querySelector(sel) as HTMLVideoElement | null;
      if (!v) throw new Error(`hero film not found: ${sel}`);
      v.pause();
      v.currentTime = t;
    },
    { sel: VIDEO_SELECTOR, t: currentTime },
  );
  // Two RAFs: one for the seek to land, one for the rAF tick to commit
  // the new heroSceneIndex + flush the React render.
  await page.evaluate(
    () =>
      new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      ),
  );
}

async function prepareHero(page: Page) {
  await page.goto("/");
  await page.locator(VIDEO_SELECTOR).waitFor({ state: "attached" });
  // Wait until video metadata loaded — needed for the auto-sync
  // duration scaling and reliable currentTime seeks.
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
  // Disable transitions / cross-fade alpha animations so screenshots
  // capture the steady-state of the active chapter (not mid-fade).
  await page.addStyleTag({
    content: `
      *, *::before, *::after { animation: none !important; transition: none !important; }
      [data-hero-overlay="prev"] { display: none !important; }
      [data-hero-field] { opacity: 1 !important; }
      .hero-scene-message.is-on { opacity: 1 !important; }
    `,
  });
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => r())),
  );
}

test.describe("Hero — chapter timeline", () => {
  test.beforeEach(async ({ page }) => {
    await prepareHero(page);
  });

  for (let i = 0; i < HERO_SCENES.length; i += 1) {
    const scene = HERO_SCENES[i];
    // Centre of the chapter window — far from boundaries, so the rAF
    // tick deterministically resolves to this scene with no overlap.
    const mid = (scene.startTime + scene.endTime) / 2;

    test(`chapter "${scene.id}" (#${i + 1}/${HERO_SCENES.length}) is active at t=${mid.toFixed(1)}s`, async ({
      page,
    }) => {
      await freezeHeroAt(page, mid);

      const section = page.locator("section[data-hero-scene]").first();
      await expect(section).toHaveAttribute("data-hero-scene", scene.id);
      await expect(section).toHaveAttribute("data-hero-scene-index", String(i));

      // The hidden chapter marker for THIS scene must report active.
      const marker = page.locator(`[data-hero-scene-id="${scene.id}"]`).first();
      await expect(marker).toHaveAttribute("data-hero-active", "true");

      // Snapshot the active overlay region — copy column carries the
      // chapter eyebrow / message / support / CTAs (final scene only).
      const copyColumn = page.locator(".hero-copy-column").first();
      await expect(copyColumn).toBeVisible();
      await copyColumn.scrollIntoViewIfNeeded();
      await expect(copyColumn).toHaveScreenshot(`hero-chapter-${scene.id}.png`, {
        // Allow tiny anti-aliasing differences across hosts; we are
        // primarily catching wrong-chapter regressions, not sub-pixel.
        maxDiffPixelRatio: 0.02,
      });
    });
  }

  test("auto-sync timeline never lets overlays desync from currentTime", async ({
    page,
  }) => {
    // Sweep across the whole film at 0.5s intervals and assert that the
    // active scene's [startTime, endTime] always contains currentTime
    // (within 0.05s tolerance for rAF timing). This is the hard
    // invariant the auto-sync was added to defend.
    for (let t = 0.5; t < HERO_SCENES[HERO_SCENES.length - 1].endTime; t += 0.5) {
      await freezeHeroAt(page, t);
      const sceneId = await page
        .locator("section[data-hero-scene]")
        .first()
        .getAttribute("data-hero-scene");
      const scene = HERO_SCENES.find((s) => s.id === sceneId);
      expect(scene, `no scene resolved for t=${t}s`).toBeTruthy();
      if (!scene) continue;
      expect(t).toBeGreaterThanOrEqual(scene.startTime - 0.05);
      expect(t).toBeLessThanOrEqual(scene.endTime + 0.05);
    }
  });
});
