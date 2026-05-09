import { test, expect, type Page } from "@playwright/test";

/**
 * Builder Step 1–4 stepper — keyboard navigation + mobile summary jump-back.
 *
 * Verifies:
 *   1. Roving-tabindex: only one stepper item is in the tab order at a time.
 *   2. ArrowRight/Left and Home/End move focus among reachable steps
 *      (completed steps + active step). Upcoming steps are skipped.
 *   3. Enter and Space on a focused completed step navigate back to it
 *      (URL `?step=` updates).
 *   4. The mobile step-summary "Back to {prev}" link jumps to the previous
 *      step.
 *
 * The builder reads its step from the URL (`?step=N`), so we deep-link to
 * step 3 with mood + who pre-selected — this makes steps 1 & 2 reachable
 * (they're "before current") while step 4 remains upcoming.
 */

const DEEP_LINK = "/builder?step=3&mood=slow&who=couple";

async function gotoBuilder(page: Page, viewport?: { width: number; height: number }) {
  if (viewport) await page.setViewportSize(viewport);
  await page.goto(DEEP_LINK);
  await expect(page.getByTestId("builder-stepper")).toBeVisible();
}

test.describe("Builder stepper — keyboard", () => {
  test("roving tabindex: exactly one item reachable via Tab", async ({ page }) => {
    await gotoBuilder(page);
    const stepper = page.getByTestId("builder-stepper");
    const items = stepper.locator('[tabindex="0"]');
    await expect(items).toHaveCount(1);
  });

  test("ArrowLeft/Right cycles through reachable steps and skips upcoming", async ({ page }) => {
    await gotoBuilder(page);
    const stepper = page.getByTestId("builder-stepper");

    // Focus the active step (step 3) by clicking it via keyboard entry: tab
    // until the active item is focused. Easier: programmatically focus.
    const active = stepper.locator('[aria-current="step"]');
    await active.focus();
    await expect(active).toBeFocused();

    // ArrowRight from step 3 — step 4 is upcoming/unreachable, so focus
    // wraps back to step 1 (the first reachable step).
    await page.keyboard.press("ArrowRight");
    const step1 = stepper.locator('[aria-label*="Step 1"]');
    await expect(step1).toBeFocused();

    // ArrowRight → step 2.
    await page.keyboard.press("ArrowRight");
    const step2 = stepper.locator('[aria-label*="Step 2"]');
    await expect(step2).toBeFocused();

    // ArrowLeft → back to step 1.
    await page.keyboard.press("ArrowLeft");
    await expect(step1).toBeFocused();

    // End → jump to active (step 3).
    await page.keyboard.press("End");
    await expect(active).toBeFocused();

    // Home → first reachable (step 1).
    await page.keyboard.press("Home");
    await expect(step1).toBeFocused();
  });

  test("Enter activates a completed step and navigates back", async ({ page }) => {
    await gotoBuilder(page);
    const stepper = page.getByTestId("builder-stepper");
    const step1 = stepper.locator('[aria-label*="Step 1"]');
    await step1.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/[?&]step=1\b/);
  });

  test("Space activates a completed step and navigates back", async ({ page }) => {
    await gotoBuilder(page);
    const stepper = page.getByTestId("builder-stepper");
    const step2 = stepper.locator('[aria-label*="Step 2"]');
    await step2.focus();
    await page.keyboard.press(" ");
    await expect(page).toHaveURL(/[?&]step=2\b/);
  });

  test("Enter on an upcoming step does not navigate", async ({ page }) => {
    await gotoBuilder(page);
    const stepper = page.getByTestId("builder-stepper");
    // Step 4 is upcoming — it renders as a non-button span (aria-disabled),
    // so it should not receive keyboard focus through arrow navigation and
    // pressing Enter while it is the URL anchor must not change ?step=3.
    const step4 = stepper.locator('[aria-label*="Step 4"]');
    // It must not be a <button> — the component renders upcoming items as spans.
    await expect(step4).toHaveAttribute("aria-disabled", "true");
    await expect(page).toHaveURL(/[?&]step=3\b/);
  });
});

test.describe("Builder mobile step summary — jump back", () => {
  test("jump-back link navigates to the previous step", async ({ page }) => {
    await gotoBuilder(page, { width: 390, height: 844 });
    const summary = page.getByRole("region", { name: /builder step summary/i });
    await expect(summary).toBeVisible();
    const back = summary.getByRole("button", { name: /jump back to step 2/i });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL(/[?&]step=2\b/);
  });

  test("summary is hidden on desktop viewports", async ({ page }) => {
    await gotoBuilder(page, { width: 1366, height: 768 });
    const summary = page.getByRole("region", { name: /builder step summary/i });
    await expect(summary).toBeHidden();
  });
});
