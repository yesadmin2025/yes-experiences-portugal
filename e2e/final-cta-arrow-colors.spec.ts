import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * Final CTA arrow color contract — visual regression via computed style.
 *
 * The homepage final-CTA card has two buttons:
 *
 *   • Primary  ("Create Your Story") on ivory bg
 *       arrow color  : --gold       (#C9A96A) at rest
 *       arrow color  : --gold-deep  (#B89452) on hover
 *
 *   • Ghost    ("Talk to a Local")   on teal bg
 *       arrow color  : --gold-soft  (#E1CFA6) at rest
 *       arrow color  : --gold       (#C9A96A) on hover
 *
 *   Focus    (both): retains the rest-state arrow color, gains the
 *                    --gold focus ring (asserted via outline color).
 *
 * Why computed-style instead of pixel diff: Lucide arrows are 12–14px
 * SVGs and a 1-pixel screenshot diff threshold flaps on every CI run.
 * Reading `getComputedStyle(svg).color` resolves the CSS variable
 * deterministically and lets us assert *exact* RGB values, which is
 * the strongest possible regression check for the arrow color contract.
 *
 * The 8 brand tokens are locked in `src/lib/brand-tokens.ts` and the
 * extended palette (gold-deep / gold-soft / gold-warm / charcoal-deep)
 * is locked in `src/styles.css` :root. If those hex values ever
 * change, this spec must be updated in the same commit.
 */

// Hex values straight from src/styles.css :root — must match exactly.
const ARROW_COLORS = {
  gold:      "rgb(201, 169, 106)", // var(--gold)        #C9A96A
  goldSoft:  "rgb(225, 207, 166)", // var(--gold-soft)   #E1CFA6
  goldDeep:  "rgb(184, 148, 82)",  // var(--gold-deep)   #B89452
} as const;

async function gotoFinalCta(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  // Disable transitions/animations so hover color settles instantly —
  // Playwright already disables animations via expect.toHaveScreenshot
  // config but `page.hover()` -> getComputedStyle still races with
  // 300ms color transitions. Force-set transition: none everywhere.
  await page.addStyleTag({
    content: `*, *::before, *::after { transition: none !important; animation: none !important; }`,
  });
  // Scroll the final CTA card into view so it's fully laid out and
  // hoverable on mobile. The section is anchored as #final-cta.
  await page.locator("#final-cta").scrollIntoViewIfNeeded();
  await page.waitForTimeout(120); // settle reveal + scroll
}

/** Get the arrow <svg> nested inside a CTA link. */
function arrowOf(cta: Locator): Locator {
  return cta.locator("svg").first();
}

/** Read the resolved `color` (which SVG stroke=currentColor inherits). */
async function readColor(svg: Locator): Promise<string> {
  return svg.evaluate((el) => getComputedStyle(el).color);
}

test.describe("Final CTA arrow colors — primary vs ghost", () => {
  test("default (rest) state — primary=gold, ghost=gold-soft", async ({ page }) => {
    await gotoFinalCta(page);

    const primary = page.locator("#final-cta a", { hasText: "Create Your Story" });
    const ghost   = page.locator("#final-cta a", { hasText: "Talk to a Local" });

    // Move the pointer well outside both buttons so neither is in
    // hover state when we read computed style.
    await page.mouse.move(0, 0);

    const primaryColor = await readColor(arrowOf(primary));
    const ghostColor   = await readColor(arrowOf(ghost));

    expect.soft(primaryColor, "primary arrow rest = --gold").toBe(ARROW_COLORS.gold);
    expect.soft(ghostColor,   "ghost arrow rest = --gold-soft").toBe(ARROW_COLORS.goldSoft);

    // Contract: the two arrows are NEVER the same color at rest. That
    // visual hierarchy (full gold vs champagne) is what makes the
    // primary read as primary on ivory and the ghost read as ghost on
    // teal. If a refactor accidentally collapses both to the same
    // token, this assertion catches it loudly.
    expect(primaryColor).not.toBe(ghostColor);
  });

  test("hover state — primary deepens to gold-deep, ghost brightens to gold", async ({ page }) => {
    await gotoFinalCta(page);

    const primary = page.locator("#final-cta a", { hasText: "Create Your Story" });
    const ghost   = page.locator("#final-cta a", { hasText: "Talk to a Local" });

    // PRIMARY HOVER
    await primary.hover();
    const primaryHover = await readColor(arrowOf(primary));
    expect.soft(primaryHover, "primary arrow hover = --gold-deep").toBe(ARROW_COLORS.goldDeep);

    // Move off so the next hover starts clean
    await page.mouse.move(0, 0);
    await page.waitForTimeout(50);

    // GHOST HOVER
    await ghost.hover();
    const ghostHover = await readColor(arrowOf(ghost));
    expect.soft(ghostHover, "ghost arrow hover = --gold").toBe(ARROW_COLORS.gold);

    // Contract: hover states must move arrows in OPPOSITE directions on
    // the gold ramp — primary darkens (more weight on light bg), ghost
    // brightens (more visibility on dark bg). They should never both
    // resolve to the same color on hover.
    expect(primaryHover).not.toBe(ghostHover);
  });

  test("focus state — arrow color stays at rest value, focus ring is --gold", async ({ page }) => {
    await gotoFinalCta(page);

    const primary = page.locator("#final-cta a", { hasText: "Create Your Story" });
    const ghost   = page.locator("#final-cta a", { hasText: "Talk to a Local" });

    // PRIMARY FOCUS
    await primary.focus();
    const primaryFocus = await readColor(arrowOf(primary));
    expect.soft(primaryFocus, "primary arrow focus retains --gold").toBe(ARROW_COLORS.gold);

    const primaryRing = await primary.evaluate((el) => {
      const cs = getComputedStyle(el);
      // focus-visible:ring-2 ring-[color:var(--gold)] renders as a
      // box-shadow ring in Tailwind v4. We assert it contains the
      // --gold rgb fingerprint, regardless of the offset/blur values.
      return cs.boxShadow;
    });
    expect.soft(
      primaryRing,
      "primary focus ring contains --gold (#C9A96A)",
    ).toMatch(/rgb\(\s*201\s*,\s*169\s*,\s*106\s*\)/);

    // Reset focus before the next assertion
    await primary.evaluate((el) => (el as HTMLElement).blur());

    // GHOST FOCUS
    await ghost.focus();
    const ghostFocus = await readColor(arrowOf(ghost));
    expect.soft(ghostFocus, "ghost arrow focus retains --gold-soft").toBe(ARROW_COLORS.goldSoft);

    const ghostRing = await ghost.evaluate((el) => getComputedStyle(el).boxShadow);
    expect.soft(
      ghostRing,
      "ghost focus ring contains --gold (#C9A96A)",
    ).toMatch(/rgb\(\s*201\s*,\s*169\s*,\s*106\s*\)/);
  });

  test("approved palette boundary — arrows never resolve to white, black, or non-gold tokens", async ({ page }) => {
    await gotoFinalCta(page);

    const primary = page.locator("#final-cta a", { hasText: "Create Your Story" });
    const ghost   = page.locator("#final-cta a", { hasText: "Talk to a Local" });

    // Sample all three states for both buttons; flag any that resolve
    // outside the approved gold ramp (gold | gold-soft | gold-deep).
    const samples: { label: string; color: string }[] = [];

    await page.mouse.move(0, 0);
    samples.push({ label: "primary rest",  color: await readColor(arrowOf(primary)) });
    samples.push({ label: "ghost rest",    color: await readColor(arrowOf(ghost))   });

    await primary.hover();
    samples.push({ label: "primary hover", color: await readColor(arrowOf(primary)) });
    await page.mouse.move(0, 0);
    await ghost.hover();
    samples.push({ label: "ghost hover",   color: await readColor(arrowOf(ghost))   });
    await page.mouse.move(0, 0);

    await primary.focus();
    samples.push({ label: "primary focus", color: await readColor(arrowOf(primary)) });
    await primary.evaluate((el) => (el as HTMLElement).blur());
    await ghost.focus();
    samples.push({ label: "ghost focus",   color: await readColor(arrowOf(ghost))   });

    const approved = new Set<string>(Object.values(ARROW_COLORS));
    const offenders = samples.filter((s) => !approved.has(s.color));

    expect(
      offenders,
      `Arrows must always resolve to {--gold, --gold-soft, --gold-deep}. ` +
        `Offenders: ${offenders.map((o) => `${o.label}=${o.color}`).join(", ") || "(none)"}`,
    ).toEqual([]);
  });
});
