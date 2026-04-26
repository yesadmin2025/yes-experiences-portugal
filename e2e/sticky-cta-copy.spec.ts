import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * E2E coverage for the post-hero sticky CTA *content* contract.
 *
 * This complements e2e/sticky-cta-visibility.spec.ts (which covers the
 * scroll-gate timing). Here we assert:
 *
 *   1. The on-screen copy matches the brand voice exactly:
 *        • Headline:  "Your Portugal journey by locals" (serif italic)
 *        • Eyebrow:   "Let your story begin"
 *        • Button:    "Begin the story"
 *   2. The button enters a loading state ("Opening…") on tap and the
 *      pre-loading state announces aria-busy/aria-disabled correctly,
 *      preventing double-submission.
 *   3. The polite live region announces the storytelling text exactly
 *      ("Begin your Portugal story with a local — shortcut available
 *      at the bottom of the screen.") once the user has scrolled past
 *      the hero.
 *   4. The hero scroll-gate behaviour is still respected — none of the
 *      copy/loading/announcement assertions can be observed while the
 *      user is sitting on the hero.
 *
 * If marketing wants to change the copy later, this file is the single
 * source of truth — fail loudly and on purpose.
 */

const HERO_THRESHOLD = 600;
const SCROLL_IDLE_MS = 220;
const IDLE_SETTLE_MS = SCROLL_IDLE_MS + 180;

const HEADLINE = "Your Portugal journey by locals";
const EYEBROW = "Let your story begin";
const BUTTON_IDLE = "Begin the story";
const BUTTON_LOADING = "Opening…";
const ARIA_LABEL = "Begin your Portugal story with a local";
const ANNOUNCEMENT =
  "Begin your Portugal story with a local — shortcut available at the bottom of the screen.";

/** The CTA <Link> — stable across copy tweaks via aria-label. */
function ctaLink(page: Page): Locator {
  return page.getByRole("link", { name: ARIA_LABEL });
}

/** Wrapper div that owns aria-hidden + opacity transitions. */
function stickyBar(page: Page): Locator {
  return ctaLink(page).locator("xpath=ancestor::div[contains(@class,'fixed')][1]");
}

/** The polite ARIA live region rendered by <PostHeroAnnouncer />. */
function liveRegion(page: Page): Locator {
  // role="status" + aria-live="polite" — there's exactly one in the layout.
  return page.locator('[role="status"][aria-live="polite"]');
}

/** Smoothly scroll to keep us "in motion" for `durationMs`. */
async function scrollOverTime(page: Page, targetY: number, durationMs: number) {
  await page.evaluate(
    async ({ targetY, durationMs }) => {
      const startY = window.scrollY;
      const delta = targetY - startY;
      const start = performance.now();
      return new Promise<void>((resolve) => {
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          window.scrollTo(0, startY + delta * t);
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    },
    { targetY, durationMs },
  );
}

/** Move past the hero and wait for the bar to actually appear. */
async function revealBar(page: Page) {
  await scrollOverTime(page, HERO_THRESHOLD + 400, 600);
  await page.waitForTimeout(IDLE_SETTLE_MS);
  await expect(stickyBar(page)).toHaveAttribute("aria-hidden", "false");
  await expect(stickyBar(page)).toBeVisible();
}

test.describe("Sticky CTA — copy, loading, and announcement contract", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await stickyBar(page).waitFor({ state: "attached" });
  });

  test("renders the storytelling headline, eyebrow, and button copy", async ({ page }) => {
    await revealBar(page);

    const bar = stickyBar(page);
    // Strict text matches — these are the exact strings marketing signed off.
    await expect(bar.getByText(HEADLINE, { exact: true })).toBeVisible();
    await expect(bar.getByText(EYEBROW, { exact: true })).toBeVisible();

    // Button shows the idle CTA label in its visible text.
    const cta = ctaLink(page);
    await expect(cta).toContainText(BUTTON_IDLE);

    // Headline uses the brand's serif italic treatment.
    const headline = bar.getByText(HEADLINE, { exact: true });
    const fontStyle = await headline.evaluate((el) => getComputedStyle(el).fontStyle);
    expect(fontStyle).toBe("italic");
    // The .serif utility maps to a non-system serif stack — assert it's
    // not the default sans by checking the family contains "serif".
    const fontFamily = await headline.evaluate((el) =>
      getComputedStyle(el).fontFamily.toLowerCase(),
    );
    expect(fontFamily).toContain("serif");
  });

  test("button has the correct accessible name and idle state attributes", async ({ page }) => {
    await revealBar(page);

    const cta = ctaLink(page);
    // aria-label is the source of truth for AT — must be the storytelling line.
    await expect(cta).toHaveAttribute("aria-label", ARIA_LABEL);
    // Idle state: not busy, not disabled, in the tab order.
    await expect(cta).toHaveAttribute("aria-busy", "false");
    await expect(cta).toHaveAttribute("aria-disabled", "false");
    await expect(cta).toHaveAttribute("data-state", "idle");
    await expect(cta).toHaveAttribute("data-cta", "explore_experiences");
  });

  test("enters a loading state on tap and blocks a second tap", async ({ page }) => {
    await revealBar(page);

    const cta = ctaLink(page);

    // First tap — fires navigation + lock. Use no-wait-after so we can
    // immediately assert loading state before the navigation settles.
    await cta.click({ noWaitAfter: true });

    // The label must swap to the loading copy and the link must mark
    // itself busy/disabled within the same frame.
    await expect(cta).toContainText(BUTTON_LOADING);
    await expect(cta).toHaveAttribute("aria-busy", "true");
    await expect(cta).toHaveAttribute("aria-disabled", "true");
    await expect(cta).toHaveAttribute("data-state", "submitting");

    // A second click must be a no-op — verify by counting analytics
    // intent events fired on window. The component dispatches a
    // CustomEvent("yes:cta_intent") per accepted tap.
    const intentCount = await page.evaluate(() => {
      const w = window as unknown as { __yesIntents?: number };
      w.__yesIntents = w.__yesIntents ?? 0;
      const handler = () => {
        w.__yesIntents = (w.__yesIntents ?? 0) + 1;
      };
      window.addEventListener("yes:cta_intent", handler);
      return w.__yesIntents;
    });
    expect(intentCount).toBe(0);

    // Try to click again — should be swallowed by the submit lock.
    await cta.click({ noWaitAfter: true, force: true }).catch(() => {
      /* pointer-events:none may reject — that's exactly the contract */
    });

    const after = await page.evaluate(() => {
      const w = window as unknown as { __yesIntents?: number };
      return w.__yesIntents ?? 0;
    });
    // Second tap must not have produced a new intent event.
    expect(after).toBe(0);
  });

  test("polite live region announces the storytelling text after scrolling past the hero", async ({
    page,
  }) => {
    const region = liveRegion(page);
    await expect(region).toHaveCount(1);

    // Before scrolling: the region is mounted but empty (no announcement
    // for users still inside the hero).
    await expect(region).toBeEmpty();

    // Scroll past the hero and settle.
    await revealBar(page);

    // The announcer fills the region with the exact storytelling line.
    await expect(region).toHaveText(ANNOUNCEMENT);

    // Live region has the right semantics for AT.
    await expect(region).toHaveAttribute("aria-live", "polite");
    await expect(region).toHaveAttribute("aria-atomic", "true");
  });

  test("preserves the hero scroll-gate while owning the new copy", async ({ page }) => {
    // Sitting on the hero: bar hidden, no announcement, no copy reachable.
    await expect(stickyBar(page)).toHaveAttribute("aria-hidden", "true");
    await expect(liveRegion(page)).toBeEmpty();

    // The link is in the DOM but inert / out of tab order — its
    // accessible name must NOT be reachable via getByRole when hidden.
    // Playwright's getByRole respects aria-hidden by default.
    await expect(
      page.getByRole("link", { name: ARIA_LABEL }),
    ).toHaveCount(0);

    // Scroll past + settle — now everything appears together.
    await revealBar(page);
    await expect(ctaLink(page)).toBeVisible();
    await expect(ctaLink(page)).toContainText(BUTTON_IDLE);
    await expect(liveRegion(page)).toHaveText(ANNOUNCEMENT);

    // Scroll back into the hero — bar hides, copy becomes unreachable
    // again. (The announcement is intentionally NOT cleared — we don't
    // want screen readers to re-announce on every threshold cross.)
    await scrollOverTime(page, 0, 600);
    await page.waitForTimeout(120);
    await expect(stickyBar(page)).toHaveAttribute("aria-hidden", "true");
    await expect(
      page.getByRole("link", { name: ARIA_LABEL }),
    ).toHaveCount(0);
  });
});
