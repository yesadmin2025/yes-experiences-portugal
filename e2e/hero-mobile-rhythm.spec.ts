import { test, expect, type Page } from "@playwright/test";

/**
 * Hero mobile vertical rhythm — locked tokens.
 *
 * The most fragile seam in the mobile hero is:
 *
 *   secondary CTA  ─┐
 *                   │  ← gap A: cta-to-microcopy
 *   "Instant confirmation. …"
 *                   │  ← gap B: microcopy-to-signature
 *   ─── WHATEVER YOU HAVE IN MIND, ───
 *       WE SAY YES.   ← gap C: signature internal line gap
 *
 * Every premium-feel pass we've done has had to re-tune these three
 * gaps. To stop them from regressing again, the values are pinned
 * to CSS custom properties (`--hero-rhythm-*`) defined in
 * `src/styles.css`, applied via the corresponding utility classes,
 * and verified here.
 *
 * If a future spacing tweak intentionally changes the rhythm, update
 * BOTH the CSS tokens AND the expected values below in the same PR.
 */

const ROUTE = "/";
const MOBILE_VIEWPORT = { width: 390, height: 844 } as const;

// Sub-pixel tolerance — absorbs rounding from `getBoundingClientRect`
// without letting a real regression slip through.
const PX_TOLERANCE = 1.5;

// Locked mobile values. Mirror src/styles.css :root.
// Tightened in the "cohesive signature" pass: each gap was reduced so
// secondary CTA → microcopy → brand sign-off reads as ONE flowing
// closing block instead of three floating elements.
const EXPECTED_MOBILE = {
  ctaToMicrocopyPx: 28,
  microcopyToSignaturePx: 44,
  signatureLineGapPx: 3,
} as const;

async function gotoHeroMobile(page: Page) {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.goto(ROUTE);

  const h1 = page.locator("h1.hero-h1");
  await expect(h1).toBeVisible();

  // Wait for the staggered fade-in chain to settle so layout is stable.
  await page.waitForFunction(() => {
    const els = Array.from(
      document.querySelectorAll(
        ".hero-rhythm-cta-to-microcopy, .hero-rhythm-microcopy-to-signature",
      ),
    );
    return (
      els.length >= 2 && els.every((el) => getComputedStyle(el as HTMLElement).opacity === "1")
    );
  });

  // Freeze any in-flight transitions for stable measurement.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  });
  await page.waitForTimeout(120);
}

function expectClose(label: string, actual: number, expected: number) {
  const delta = Math.abs(actual - expected);
  expect(
    delta,
    `${label}: actual=${actual.toFixed(2)}px, expected=${expected}px (Δ ${delta.toFixed(2)}px, max ${PX_TOLERANCE}px)`,
  ).toBeLessThanOrEqual(PX_TOLERANCE);
}

test.describe("Hero — mobile vertical rhythm tokens", () => {
  test("CSS tokens resolve to the expected mobile values", async ({ page }) => {
    await gotoHeroMobile(page);
    const tokens = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return {
        ctaToMicrocopy: cs.getPropertyValue("--hero-rhythm-cta-to-microcopy").trim(),
        microcopyToSignature: cs.getPropertyValue("--hero-rhythm-microcopy-to-signature").trim(),
        signatureLineGap: cs.getPropertyValue("--hero-rhythm-signature-line-gap").trim(),
      };
    });
    expect(tokens.ctaToMicrocopy).toBe(`${EXPECTED_MOBILE.ctaToMicrocopyPx}px`);
    expect(tokens.microcopyToSignature).toBe(`${EXPECTED_MOBILE.microcopyToSignaturePx}px`);
    expect(tokens.signatureLineGap).toBe(`${EXPECTED_MOBILE.signatureLineGapPx}px`);
  });

  test("rendered gaps between CTA, microcopy, and signature match the locked tokens", async ({
    page,
  }) => {
    await gotoHeroMobile(page);

    const secondaryCta = page.getByRole("link", {
      name: "Explore Signature Experiences",
      exact: true,
    });
    const microcopy = page.locator('[data-hero-field="microcopy"]');
    const signature = page.locator('[data-hero-field="brandLine"]');

    await expect(secondaryCta).toBeVisible();
    await expect(microcopy).toBeVisible();
    await expect(signature).toBeVisible();

    const measurements = await page.evaluate(() => {
      const get = (sel: string) =>
        (document.querySelector(sel) as HTMLElement).getBoundingClientRect();
      const cta = (
        Array.from(document.querySelectorAll('a[data-hero-field="secondaryCta"]'))[0] as HTMLElement
      ).getBoundingClientRect();
      const micro = get('[data-hero-field="microcopy"]');
      const sig = get('[data-hero-field="brandLine"]');
      const sigLines = Array.from(
        document.querySelectorAll('[data-hero-field="brandLine"] [aria-hidden="true"] > span'),
      ) as HTMLElement[];
      const line1 = sigLines[0]?.getBoundingClientRect();
      const line2 = sigLines[1]?.getBoundingClientRect();
      return {
        ctaBottom: cta.bottom,
        microTop: micro.top,
        microBottom: micro.bottom,
        sigTop: sig.top,
        line1Bottom: line1?.bottom ?? null,
        line2Top: line2?.top ?? null,
      };
    });

    const ctaToMicrocopy = measurements.microTop - measurements.ctaBottom;
    const microcopyToSignature = measurements.sigTop - measurements.microBottom;

    expectClose("CTA → microcopy gap", ctaToMicrocopy, EXPECTED_MOBILE.ctaToMicrocopyPx);
    expectClose(
      "microcopy → signature gap",
      microcopyToSignature,
      EXPECTED_MOBILE.microcopyToSignaturePx,
    );

    expect(measurements.line1Bottom, "signature line 1 must render").not.toBeNull();
    expect(measurements.line2Top, "signature line 2 must render").not.toBeNull();
    const signatureLineGap =
      (measurements.line2Top as number) - (measurements.line1Bottom as number);
    expectClose(
      "signature internal line gap",
      signatureLineGap,
      EXPECTED_MOBILE.signatureLineGapPx,
    );
  });

  test("rhythm utility classes are still wired to the correct elements", async ({ page }) => {
    await gotoHeroMobile(page);

    // If someone removes the utility class from the wrapper, the
    // !important token override goes away and the lock is lost — fail
    // loudly here rather than silently regressing the layout.
    await expect(
      page.locator('.hero-rhythm-cta-to-microcopy [data-hero-field="microcopy"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('.hero-rhythm-microcopy-to-signature [data-hero-field="brandLine"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('[data-hero-field="brandLine"] .hero-rhythm-signature-line-gap'),
    ).toHaveCount(1);
  });
});
