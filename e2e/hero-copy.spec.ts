import { test, expect, type Page } from "@playwright/test";

/**
 * Hero copy lock — asserts every approved hero string is present
 * verbatim. Any drift in tone, punctuation or wording fails CI.
 *
 * If the brand copy changes intentionally, update HERO_COPY below in
 * the same PR as the route change. Treat this file as the single
 * source of truth for approved hero copy.
 */

export const HERO_COPY = {
  eyebrow: "Private · By locals · Any occasion",
  headlineLine1: "Portugal is the stage.",
  headlineLine2: "You write the story.",
  subheadline:
    "Designed by you, guided by local knowledge — from a private day to something worth celebrating.",
  primaryCta: "Create Your Story",
  secondaryCta: "Explore Signature Experiences",
  microcopy: "Instant confirmation. Personalized by you. No waiting, no forms.",
  brandLine: "Whatever you have in mind, we say YES.",
} as const;

async function gotoHero(page: Page) {
  await page.goto("/");
  const h1 = page.locator("h1.hero-h1");
  await expect(h1).toBeVisible();
  await page.waitForFunction(() => {
    const el = document.querySelector("h1.hero-h1") as HTMLElement | null;
    return !!el && getComputedStyle(el).opacity === "1";
  });
}

test.describe("Hero — approved copy lock", () => {
  test("eyebrow matches approved copy exactly", async ({ page }) => {
    await gotoHero(page);
    await expect(
      page.getByText(HERO_COPY.eyebrow, { exact: true }).first(),
    ).toBeVisible();
  });

  test("headline (both lines) matches approved copy exactly", async ({
    page,
  }) => {
    await gotoHero(page);
    const h1 = page.locator("h1.hero-h1");
    const text = (await h1.innerText()).replace(/\s+/g, " ").trim();
    expect(text).toBe(
      `${HERO_COPY.headlineLine1} ${HERO_COPY.headlineLine2}`,
    );
  });

  test("subheadline matches approved copy exactly", async ({ page }) => {
    await gotoHero(page);
    await expect(
      page.getByText(HERO_COPY.subheadline, { exact: true }),
    ).toBeVisible();
  });

  test("primary and secondary CTAs match approved labels", async ({ page }) => {
    await gotoHero(page);
    await expect(
      page.getByRole("link", { name: HERO_COPY.primaryCta, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: HERO_COPY.secondaryCta, exact: true }),
    ).toBeVisible();
  });

  test("microcopy under the buttons matches approved copy exactly", async ({
    page,
  }) => {
    await gotoHero(page);
    await expect(
      page.getByText(HERO_COPY.microcopy, { exact: true }),
    ).toBeVisible();
  });

  test("brand YES line matches approved copy exactly", async ({ page }) => {
    await gotoHero(page);
    await expect(
      page.getByText(HERO_COPY.brandLine, { exact: true }),
    ).toBeVisible();
  });
});
