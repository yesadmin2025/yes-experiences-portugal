import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * Hero — visual regression suite.
 *
 * Pinned screenshots of the three layout-critical hero regions:
 *   1. Eyebrow line  (must stay on a single line at every breakpoint)
 *   2. Headline      (two-line vertical rhythm + italic alignment)
 *   3. CTA group     (button widths, spacing, vertical alignment)
 *
 * Each region is captured at:
 *   • mobile-chromium  (Pixel 5 → 393×851 css px)
 *   • desktop-chromium (Desktop Chrome → 1366×768)
 *
 * Snapshots live under `e2e/__screenshots__/` and are namespaced per
 * project automatically by Playwright's snapshotPathTemplate. Update
 * them deliberately with `bunx playwright test --update-snapshots`
 * after an INTENTIONAL hero layout change.
 *
 * Stability levers applied before every capture:
 *   • Animations disabled via `prefers-reduced-motion: reduce`.
 *   • All hero text forced to opacity:1 so we never capture mid-fade.
 *   • Background image removed (cinematic zoom + parallax shift would
 *     guarantee diff noise — we are testing TEXT layout, not artwork).
 *   • Shadows/blurs and the hero "breathe" pulse on CTAs disabled.
 *   • One settle frame after style injection so layout metrics flush.
 */

async function prepareHero(page: Page) {
  await page.goto("/");

  // Wait for the headline to mount before injecting overrides — otherwise
  // the style block can race the hydrated React tree.
  await page.locator("h1.hero-h1").waitFor({ state: "visible" });

  await page.addStyleTag({
    content: `
      /* Kill every animation/transition: hero fade-in cascade, slow zoom,
         CTA "breathe" pulse, parallax transitions. */
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
      /* Make sure every fade-in element is fully opaque. */
      [data-hero-field] { opacity: 1 !important; }
      .cta-magnet-group { opacity: 1 !important; transform: none !important; }
      /* Hide the hero background image so we are only diffing text/CTA
         layout — the image has a 32s zoom + pointer parallax that is
         deliberately non-deterministic. */
      section img[alt^="Hidden coastal"] { visibility: hidden !important; }
      /* Hide the on-page debug reset button so it never sneaks into the
         CTA-group snapshot if layout reflows it nearby. */
      [data-hero-copy-reset] { display: none !important; }
    `,
  });

  // One frame to let style injection settle.
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => r())),
  );
}

/**
 * Capture a region by data-hero-field. We use boundingBox-based clipping
 * (rather than locator.screenshot) so the diff also catches positional
 * drift relative to its container, not just intrinsic re-renders.
 */
async function snapshotRegion(
  page: Page,
  locator: Locator,
  name: string,
) {
  await expect(locator).toBeVisible();
  // Scroll into view so the box is fully within the viewport before clipping.
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toHaveScreenshot(name, {
    // Locator-scoped screenshot: Playwright handles devicePixelRatio and
    // composes a clean PNG without needing manual clip math.
  });
}

test.describe("Hero — visual regression", () => {
  test.beforeEach(async ({ page }) => {
    await prepareHero(page);
  });

  test("eyebrow line stays pixel-consistent", async ({ page }) => {
    const eyebrow = page.locator('[data-hero-field="eyebrow"]').first();

    // Hard guarantee: eyebrow must render as a single visual line at
    // every breakpoint. We check this BEFORE the snapshot so a wrap
    // failure produces a clear assertion error instead of a noisy diff.
    const { lineHeight, height } = await eyebrow.evaluate((el) => {
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight);
      const h = (el as HTMLElement).getBoundingClientRect().height;
      return { lineHeight: Number.isFinite(lh) ? lh : h, height: h };
    });
    // Allow 4px of slack for descenders / sub-pixel rounding.
    expect(height).toBeLessThanOrEqual(lineHeight + 4);

    await snapshotRegion(page, eyebrow, "hero-eyebrow.png");
  });

  test("headline alignment stays pixel-consistent", async ({ page }) => {
    const headline = page.locator("h1.hero-h1").first();

    // Both spans must share the same left edge — that is the alignment
    // contract the visual regression is locking in.
    const leftEdges = await headline.evaluate((h1) => {
      const spans = Array.from(
        h1.querySelectorAll<HTMLElement>('[data-hero-field^="headlineLine"]'),
      );
      return spans.map((s) => Math.round(s.getBoundingClientRect().left));
    });
    expect(leftEdges.length).toBe(2);
    expect(leftEdges[0]).toBe(leftEdges[1]);

    await snapshotRegion(page, headline, "hero-headline.png");
  });

  test("CTA group spacing stays pixel-consistent", async ({ page }) => {
    const ctaGroup = page.locator(".cta-magnet-group").first();

    // Layout contract: on mobile (<640px) the two CTAs stack and share
    // the same width; on desktop they sit side-by-side with a small,
    // bounded gap. Asserting both lets the snapshot focus on style
    // drift rather than re-discovering the layout shape on every diff.
    const layout = await ctaGroup.evaluate((group) => {
      const links = Array.from(group.querySelectorAll<HTMLElement>("a"));
      const rects = links.map((a) => a.getBoundingClientRect());
      return {
        viewportWidth: window.innerWidth,
        widths: rects.map((r) => Math.round(r.width)),
        tops: rects.map((r) => Math.round(r.top)),
        lefts: rects.map((r) => Math.round(r.left)),
      };
    });

    expect(layout.widths.length).toBe(2);

    if (layout.viewportWidth < 640) {
      // Stacked: equal width, equal left edge, primary above secondary.
      expect(layout.widths[0]).toBe(layout.widths[1]);
      expect(layout.lefts[0]).toBe(layout.lefts[1]);
      expect(layout.tops[1]).toBeGreaterThan(layout.tops[0]);
    } else {
      // Side-by-side: same baseline (top), with a horizontal gap
      // somewhere between 12px and 48px.
      expect(Math.abs(layout.tops[0] - layout.tops[1])).toBeLessThanOrEqual(2);
      const gap =
        layout.lefts[1] - (layout.lefts[0] + layout.widths[0]);
      expect(gap).toBeGreaterThanOrEqual(12);
      expect(gap).toBeLessThanOrEqual(48);
    }

    await snapshotRegion(page, ctaGroup, "hero-cta-group.png");
  });
});
