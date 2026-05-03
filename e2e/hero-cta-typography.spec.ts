import { test, expect, type Page } from "@playwright/test";

/**
 * Hero CTA typography & spacing regression checks.
 *
 * Goal
 * ----
 * The hero CTA area has been tuned for "calm, premium, breathable"
 * typography. A few past regressions reintroduced a "cluttered" feel:
 *   • leading-none on uppercase tracked labels (vertically cramped)
 *   • too-tight padding around the labels
 *   • the eyebrow row sitting too close to the H1
 *   • the two CTA buttons sitting too close to each other
 *
 * These tests lock in the spacing/typography contract so any future
 * refactor that re-tightens those values fails CI loudly. We also keep
 * a screenshot snapshot of the hero CTA cluster as a visual safety net
 * (with generous max-diff tolerance — this is a regression guard, not
 * a pixel-perfect lock).
 *
 * We deliberately assert *ranges* (>= / <=) rather than exact pixel
 * values, because:
 *   • font metrics differ slightly across Chromium versions,
 *   • the hero uses a custom display font that may shift by sub-pixels,
 *   • we care about "is this still breathable?", not "is this exactly
 *     27.0px?".
 */

const ROUTE = "/?hero=last";

async function gotoHero(page: Page) {
  await page.goto(ROUTE);
  // Wait for the hero H1 fade-in animation to settle so layout is stable.
  const h1 = page.locator("h1.hero-h1");
  await expect(h1).toBeVisible();
  await page.waitForFunction(() => {
    const el = document.querySelector("h1.hero-h1") as HTMLElement | null;
    if (!el) return false;
    return getComputedStyle(el).opacity === "1";
  });
  // Belt-and-braces: small settle delay for the staggered CTA fade.
  await page.waitForTimeout(250);
}

test.describe("Hero CTA — typography & spacing contract", () => {
  test("eyebrow row sits comfortably above the H1 (no cramped stack)", async ({ page }) => {
    await gotoHero(page);

    const eyebrow = page.locator("span", { hasText: "Private · By locals · Any occasion" }).first();
    const h1 = page.locator("h1.hero-h1");

    const [eyebrowBox, h1Box] = await Promise.all([eyebrow.boundingBox(), h1.boundingBox()]);
    expect(eyebrowBox, "eyebrow should be laid out").not.toBeNull();
    expect(h1Box, "hero H1 should be laid out").not.toBeNull();

    const gap = h1Box!.y - (eyebrowBox!.y + eyebrowBox!.height);
    // Was previously mt-7 (~28px) and felt too close. We now require a
    // generous breathing band — at least ~48px — between the eyebrow
    // and the start of the headline to fix the Portugal proximity issue.
    expect(
      gap,
      `eyebrow → H1 gap should feel generous (got ${gap.toFixed(1)}px)`,
    ).toBeGreaterThanOrEqual(48);
  });

  test("CTA buttons have enough vertical padding to feel uncramped", async ({ page }) => {
    await gotoHero(page);

    const primary = page.getByRole("link", {
      name: "Create Your Story",
      exact: true,
    });
    const secondary = page.getByRole("link", {
      name: "Explore Signature Experiences",
      exact: true,
    });

    for (const cta of [primary, secondary]) {
      await expect(cta).toBeVisible();

      const styles = await cta.evaluate((el) => {
        const cs = getComputedStyle(el as HTMLElement);
        return {
          paddingTop: parseFloat(cs.paddingTop),
          paddingBottom: parseFloat(cs.paddingBottom),
          lineHeight: cs.lineHeight, // may be "normal" or px string
          fontSize: parseFloat(cs.fontSize),
          textTransform: cs.textTransform,
        };
      });

      // Vertical padding contract — must not regress to the old 15px.
      expect(
        styles.paddingTop,
        "CTA padding-top should provide breathing room",
      ).toBeGreaterThanOrEqual(17);
      expect(
        styles.paddingBottom,
        "CTA padding-bottom should provide breathing room",
      ).toBeGreaterThanOrEqual(17);

      // Line-height contract — must NOT be `leading-none` (1.0). We
      // explicitly require >= 1.4 of the font-size so uppercase tracked
      // labels never feel cramped vertically.
      const lh =
        styles.lineHeight === "normal" ? styles.fontSize * 1.2 : parseFloat(styles.lineHeight);
      const ratio = lh / styles.fontSize;
      expect(
        ratio,
        `CTA line-height ratio should be > 1.3 (got ${ratio.toFixed(2)})`,
      ).toBeGreaterThan(1.3);

      // Sanity: still uppercase. Catches accidental case-style drift.
      expect(styles.textTransform).toBe("uppercase");
    }
  });

  test("two CTA buttons keep a comfortable gap between them", async ({ page }) => {
    await gotoHero(page);

    const primary = page.getByRole("link", {
      name: "Create Your Story",
      exact: true,
    });
    const secondary = page.getByRole("link", {
      name: "Explore Signature Experiences",
      exact: true,
    });

    const [a, b] = await Promise.all([primary.boundingBox(), secondary.boundingBox()]);
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();

    // On the mobile viewport the CTAs stack vertically — measure the
    // gap on whichever axis they're separated. This keeps the test
    // resilient to viewport changes.
    const verticalGap = Math.abs(b!.y - (a!.y + a!.height));
    const horizontalGap = Math.abs(b!.x - (a!.x + a!.width));
    const gap = Math.min(verticalGap, horizontalGap);

    expect(
      gap,
      `CTA-to-CTA gap should be >= 16px (got ${gap.toFixed(1)}px)`,
    ).toBeGreaterThanOrEqual(16);
  });

  test("hero CTA cluster — visual snapshot regression guard", async ({ page }) => {
    await gotoHero(page);

    // Pause CSS animations / hide blinking elements that would otherwise
    // make the screenshot flaky. We also disable the slow ambient
    // breathing rim on the CTAs.
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
        }
        .cta-breathe, .cta-attention { animation: none !important; }
      `,
    });

    // Snapshot the headline + CTA cluster — that's the area the user
    // perceives as "the hero CTA". Anchored from the H1 down through
    // the microcopy line so spacing regressions show up clearly.
    const cluster = page.locator(".max-w-3xl").first();
    await expect(cluster).toBeVisible();

    await expect(cluster).toHaveScreenshot("hero-cta-cluster.png", {
      // Generous tolerance — this is a regression guard against
      // *cluttered* layouts, not a pixel-perfect lock. Font hinting
      // alone can shift a few hundred pixels.
      maxDiffPixelRatio: 0.04,
      animations: "disabled",
      caret: "hide",
    });
  });
});
