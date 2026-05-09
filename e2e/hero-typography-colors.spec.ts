/**
 * Hero typography colors — brand-token regression.
 *
 * Validates that the *computed* foreground colors of the hero eyebrow
 * and headline resolve to the canonical YES brand palette:
 *
 *   • Teal      #295B61   (--teal)
 *   • Gold      #C9A96A   (--gold)        ← contained accent
 *   • Gold-soft #E1CFA6   (--gold-soft)   ← gold on dark surfaces
 *   • Ivory     #FAF8F3   (--ivory)       ← headline on dark video
 *   • Charcoal  #2E2E2E   (--charcoal)    ← headline on light surfaces
 *
 * Per-element contract (locked to brand guardrails):
 *   eyebrow        → gold OR gold-soft (champagne accent, contained use)
 *   headlineLine1  → ivory  (over dark hero film) OR teal/charcoal (light)
 *   headlineLine2  → ivory  (over dark hero film) OR teal           (light)
 *
 * Tolerance: ΔE-ish per-channel ±10/255 to absorb sub-pixel anti-alias
 * and color-mix compositing jitter. Text-shadows are *not* part of the
 * computed `color` property, so they don't affect this check — but the
 * tolerance is generous enough that any future shadow-blending into the
 * fill (e.g. text-fill-color: color-mix(...)) still passes if the base
 * token is correct.
 *
 * Any drift outside the allow-list (e.g. someone re-points the eyebrow
 * to white, or paints the headline in a non-brand grey) FAILS the build.
 */

import { test, expect, type Page } from "@playwright/test";

type RGB = { r: number; g: number; b: number };

function parseColor(input: string): RGB {
  const m = input
    .replace(/\s+/g, "")
    .match(/^rgba?\((\d+),(\d+),(\d+)(?:,([0-9.]+))?\)$/i);
  if (!m) throw new Error(`Unparseable color: "${input}"`);
  return { r: +m[1], g: +m[2], b: +m[3] };
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

const TOKENS = {
  teal: hexToRgb("#295B61"),
  gold: hexToRgb("#C9A96A"),
  goldSoft: hexToRgb("#E1CFA6"),
  goldWarm: hexToRgb("#D8BE82"),
  goldDeep: hexToRgb("#B89452"),
  ivory: hexToRgb("#FAF8F3"),
  charcoal: hexToRgb("#2E2E2E"),
} as const;

/** Per-channel tolerance — covers AA jitter + minor color-mix composition. */
const CHANNEL_TOL = 10;

function within(a: RGB, b: RGB, tol = CHANNEL_TOL): boolean {
  return (
    Math.abs(a.r - b.r) <= tol &&
    Math.abs(a.g - b.g) <= tol &&
    Math.abs(a.b - b.b) <= tol
  );
}

function fmt(c: RGB): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `rgb(${c.r},${c.g},${c.b}) / #${h(c.r)}${h(c.g)}${h(c.b)}`;
}

function matchesAny(
  actual: RGB,
  allow: Array<{ name: string; rgb: RGB }>,
): { ok: true; matched: string } | { ok: false; nearest: string; delta: number } {
  let best = { name: allow[0].name, delta: Number.POSITIVE_INFINITY };
  for (const t of allow) {
    if (within(actual, t.rgb)) return { ok: true, matched: t.name };
    const d =
      Math.abs(actual.r - t.rgb.r) +
      Math.abs(actual.g - t.rgb.g) +
      Math.abs(actual.b - t.rgb.b);
    if (d < best.delta) best = { name: t.name, delta: d };
  }
  return { ok: false, nearest: best.name, delta: best.delta };
}

async function getColor(page: Page, selector: string): Promise<RGB> {
  const raw = await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) throw new Error(`not found: ${sel}`);
    return window.getComputedStyle(el).color;
  }, selector);
  return parseColor(raw);
}

test.describe("Hero typography colors — YES brand-token regression", () => {
  test("eyebrow + headline computed colors match canonical tokens", async ({
    page,
  }) => {
    await page.goto("/?hero=last", { waitUntil: "domcontentloaded" });
    await page.locator('[data-hero-cinematic="true"]').waitFor({ state: "visible" });
    await page
      .locator('[data-hero-field="headlineLine1"]:not(h1)')
      .waitFor({ state: "visible" });

    // Wait for fonts so color resolution from CSS variables is stable.
    await page.evaluate(async () => {
      type FF = { ready?: Promise<unknown> };
      const f = (document as unknown as { fonts?: FF }).fonts;
      if (f?.ready) await f.ready;
    });

    const eyebrow = await getColor(page, '[data-hero-field="eyebrow"]');
    const line1 = await getColor(page, '[data-hero-field="headlineLine1"]:not(h1)');
    const line2 = await getColor(page, '[data-hero-field="headlineLine2"]');

    // Eyebrow MUST be in the gold family (Champagne Gold, contained accent).
    const eyebrowAllow = [
      { name: "gold (#C9A96A)", rgb: TOKENS.gold },
      { name: "gold-soft (#E1CFA6)", rgb: TOKENS.goldSoft },
      { name: "gold-warm (#D8BE82)", rgb: TOKENS.goldWarm },
      { name: "gold-deep (#B89452)", rgb: TOKENS.goldDeep },
    ];
    const eyebrowMatch = matchesAny(eyebrow, eyebrowAllow);
    expect(
      eyebrowMatch.ok,
      eyebrowMatch.ok
        ? "ok"
        : `Hero eyebrow color ${fmt(eyebrow)} is NOT in the gold family. ` +
            `Nearest token: ${eyebrowMatch.nearest} (Δ=${eyebrowMatch.delta}). ` +
            `Allowed: gold #C9A96A or gold-soft #E1CFA6.`,
    ).toBe(true);

    // Headline lines MUST resolve to YES brand tokens. Line 1 stays ivory
    // (or teal/charcoal on a future light skin). Line 2 (Georgia italic)
    // is the approved champagne accent — gold-soft on the dark hero film.
    const line1Allow = [
      { name: "ivory (#FAF8F3)", rgb: TOKENS.ivory },
      { name: "teal (#295B61)", rgb: TOKENS.teal },
      { name: "charcoal (#2E2E2E)", rgb: TOKENS.charcoal },
    ];
    const line2Allow = [
      { name: "ivory (#FAF8F3)", rgb: TOKENS.ivory },
      { name: "gold-soft (#E1CFA6)", rgb: TOKENS.goldSoft },
      { name: "gold (#C9A96A)", rgb: TOKENS.gold },
      { name: "teal (#295B61)", rgb: TOKENS.teal },
      { name: "charcoal (#2E2E2E)", rgb: TOKENS.charcoal },
    ];
    for (const [label, c, allow, allowedDesc] of [
      ["headlineLine1", line1, line1Allow, "ivory #FAF8F3, teal #295B61, charcoal #2E2E2E"],
      [
        "headlineLine2 (italic)",
        line2,
        line2Allow,
        "ivory #FAF8F3, gold-soft #E1CFA6, gold #C9A96A, teal #295B61, charcoal #2E2E2E",
      ],
    ] as const) {
      const m = matchesAny(c, allow);
      expect(
        m.ok,
        m.ok
          ? "ok"
          : `Hero ${label} color ${fmt(c)} is NOT a YES brand token. ` +
              `Nearest: ${m.nearest} (Δ=${m.delta}). ` +
              `Allowed: ${allowedDesc}.`,
      ).toBe(true);
    }
  });
});

