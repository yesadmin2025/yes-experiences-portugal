import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * Hero CTA — tablet parity contract.
 *
 * Companion to `hero-cta-parity.spec.ts` (which runs at the project's
 * default mobile viewport). The hero CTA layout crosses Tailwind's `md:`
 * breakpoint at 768px, where the two buttons can shift from a stacked
 * column to an inline row. That transition is exactly where geometry
 * drift tends to creep in: a forgotten `md:w-auto`, asymmetric `md:px-*`,
 * or an icon offset that only manifests once the button is no longer
 * full-width.
 *
 * This spec re-runs the same parity contract — width, padding,
 * typography, icon layout — at two tablet viewports:
 *
 *   • 768×1024 (iPad portrait, exact `md:` boundary)
 *   • 1024×768 (iPad landscape, just below `lg:`)
 *
 * Tolerances match the mobile spec so a regression at any breakpoint
 * fails with the same signal.
 */

const ROUTE = "/";
const PX_TOLERANCE = 0.5;

const TABLET_VIEWPORTS = [
  { label: "iPad portrait (768×1024, md: boundary)", width: 768, height: 1024 },
  { label: "iPad landscape (1024×768, just below lg:)", width: 1024, height: 768 },
] as const;

async function gotoHero(page: Page) {
  await page.goto(ROUTE);
  const h1 = page.locator("h1.hero-h1");
  await expect(h1).toBeVisible();
  await page.waitForFunction(() => {
    const el = document.querySelector("h1.hero-h1") as HTMLElement | null;
    return !!el && getComputedStyle(el).opacity === "1";
  });
  // Freeze in-flight CTA fade/breathe animations so measurements are stable.
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
  await page.waitForTimeout(150);
}

type CtaMetrics = {
  width: number;
  height: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: string;
  textAlign: string;
  iconWidth: number;
  iconHeight: number;
  iconRightOffset: number;
  iconVerticalCenterOffset: number;
};

async function measure(cta: Locator): Promise<CtaMetrics> {
  return cta.evaluate((el) => {
    const button = el as HTMLElement;
    const cs = getComputedStyle(button);
    const rect = button.getBoundingClientRect();
    const icon = button.querySelector("svg") as SVGElement | null;
    if (!icon) {
      throw new Error("CTA is missing its icon (svg)");
    }
    const iconRect = icon.getBoundingClientRect();

    const lh =
      cs.lineHeight === "normal"
        ? parseFloat(cs.fontSize) * 1.2
        : parseFloat(cs.lineHeight);

    return {
      width: rect.width,
      height: rect.height,
      paddingTop: parseFloat(cs.paddingTop),
      paddingRight: parseFloat(cs.paddingRight),
      paddingBottom: parseFloat(cs.paddingBottom),
      paddingLeft: parseFloat(cs.paddingLeft),
      fontSize: parseFloat(cs.fontSize),
      lineHeight: lh,
      letterSpacing:
        cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing),
      textTransform: cs.textTransform,
      textAlign: cs.textAlign,
      iconWidth: iconRect.width,
      iconHeight: iconRect.height,
      iconRightOffset: rect.right - iconRect.right,
      iconVerticalCenterOffset: Math.abs(
        iconRect.top + iconRect.height / 2 - (rect.top + rect.height / 2),
      ),
    };
  });
}

function expectClose(
  label: string,
  a: number,
  b: number,
  tolerance = PX_TOLERANCE,
) {
  const delta = Math.abs(a - b);
  expect(
    delta,
    `${label}: primary=${a.toFixed(2)} vs secondary=${b.toFixed(2)} (Δ ${delta.toFixed(2)}px, max ${tolerance}px)`,
  ).toBeLessThanOrEqual(tolerance);
}

test.describe("Hero CTA — tablet parity (md: breakpoint and above)", () => {
  for (const vp of TABLET_VIEWPORTS) {
    test.describe(vp.label, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test("primary and secondary share width, padding, typography, icon layout", async ({
        page,
      }) => {
        await gotoHero(page);

        const primary = page.getByRole("link", {
          name: "Create Your Story",
          exact: true,
        });
        const secondary = page.getByRole("link", {
          name: "Explore Signature Experiences",
          exact: true,
        });

        await expect(primary).toBeVisible();
        await expect(secondary).toBeVisible();

        const [p, s] = await Promise.all([
          measure(primary),
          measure(secondary),
        ]);

        // ─── Geometry ─────────────────────────────────────────────────
        expectClose("width", p.width, s.width);
        expectClose("height", p.height, s.height, 1); // border-[1.5px] vs none can shift by ≤ 1px
        expectClose("padding-top", p.paddingTop, s.paddingTop);
        expectClose("padding-right", p.paddingRight, s.paddingRight);
        expectClose("padding-bottom", p.paddingBottom, s.paddingBottom);
        expectClose("padding-left", p.paddingLeft, s.paddingLeft);

        // ─── Typography ───────────────────────────────────────────────
        expectClose("font-size", p.fontSize, s.fontSize);
        expectClose("line-height", p.lineHeight, s.lineHeight);
        expectClose("letter-spacing", p.letterSpacing, s.letterSpacing, 0.05);
        expect(s.textTransform).toBe(p.textTransform);
        expect(s.textTransform).toBe("uppercase");
        expect(s.textAlign).toBe(p.textAlign);
        expect(s.textAlign).toBe("left");

        // ─── Icon layout ──────────────────────────────────────────────
        expectClose("icon-width", p.iconWidth, s.iconWidth);
        expectClose("icon-height", p.iconHeight, s.iconHeight);
        expectClose("icon right offset", p.iconRightOffset, s.iconRightOffset);
        expect(
          p.iconVerticalCenterOffset,
          `primary icon should be vertically centered (off by ${p.iconVerticalCenterOffset.toFixed(2)}px)`,
        ).toBeLessThanOrEqual(1);
        expect(
          s.iconVerticalCenterOffset,
          `secondary icon should be vertically centered (off by ${s.iconVerticalCenterOffset.toFixed(2)}px)`,
        ).toBeLessThanOrEqual(1);
      });

      test("both CTAs render an arrow icon (no decorative replacement)", async ({
        page,
      }) => {
        await gotoHero(page);

        for (const name of [
          "Create Your Story",
          "Explore Signature Experiences",
        ]) {
          const cta = page.getByRole("link", { name, exact: true });
          const svg = cta.locator("svg").first();
          await expect(svg).toBeVisible();
          const cls = await svg.getAttribute("class");
          expect(
            cls ?? "",
            `${name} should render an ArrowRight icon (got class="${cls}")`,
          ).toMatch(/lucide-arrow-right/);
        }
      });
    });
  }
});
