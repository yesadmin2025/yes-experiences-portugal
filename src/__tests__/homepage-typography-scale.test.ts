/**
 * Homepage typography scale — canonical mobile→desktop ramp.
 *
 * Locks in the agreed scale so future edits can't accidentally
 * desync section H2 sizes at the mobile viewport (393/430px).
 *
 * Two tiers exist on the homepage:
 *
 *   · MAJOR section H2 (Studio, Why YES, Signatures, Groups, Final CTA)
 *     → text-[2.5rem] sm:text-[2.85rem] md:text-[4.15rem] (or 3.6rem
 *       on the dark Final CTA — desktop-only deviation).
 *
 *   · SUB-section H2 (Three ways)
 *     → text-[1.85rem] sm:text-[2.1rem] md:text-[2.4rem]
 *
 * Eyebrow labels above each section are uppercase Inter, weight 700,
 * tracking 0.28em, size 11px (canonical .he-eyebrow-bar utility).
 * Inline eyebrow size variants must stay >=11px / tracking >=0.28em
 * to remain a11y-legible on the charcoal/ivory mix.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const indexPath = resolve(__dirname, "../routes/index.tsx");
const src = readFileSync(indexPath, "utf8");

interface SectionH2 {
  id: string;
  /** Mobile size in rem — the value before any sm:/md: prefix. */
  mobileRem: number;
  /** sm: breakpoint size in rem (375px+ but <768px window). */
  smRem: number;
  /** md: breakpoint size in rem. */
  mdRem: number;
}

function findH2Block(id: string): string {
  const re = new RegExp(`id="${id}"[^>]*className="([^"]+)"`);
  const m = src.match(re);
  if (!m) throw new Error(`H2 with id="${id}" not found`);
  return m[1];
}

function extractRem(cls: string, prefix: string | null): number | null {
  // Match e.g. text-[2.5rem] or sm:text-[2.85rem]
  const re = prefix
    ? new RegExp(`${prefix}:text-\\[(\\d+(?:\\.\\d+)?)rem\\]`)
    : /(?:^|\s)text-\[(\d+(?:\.\d+)?)rem\]/;
  const m = cls.match(re);
  return m ? parseFloat(m[1]) : null;
}

describe("Homepage H2 — major section ramp", () => {
  const MAJOR_IDS = ["studio-title", "why-yes-title", "signatures-title", "groups-title"];

  for (const id of MAJOR_IDS) {
    it(`#${id} uses 2.5rem → 2.85rem → 4.15rem ramp`, () => {
      const cls = findH2Block(id);
      expect(extractRem(cls, null), `#${id}: mobile size`).toBe(2.5);
      expect(extractRem(cls, "sm"), `#${id}: sm size`).toBe(2.85);
      expect(extractRem(cls, "md"), `#${id}: md size`).toBe(4.15);
    });
  }

  it("#final-cta-title shares mobile/sm scale (md is lower on dark hero)", () => {
    const cls = findH2Block("final-cta-title");
    expect(extractRem(cls, null)).toBe(2.5);
    expect(extractRem(cls, "sm")).toBe(2.85);
    // Final CTA is on dark teal — md is intentionally smaller (3.6rem)
    // for dark-on-dark legibility / paragraph-density balance.
    expect(extractRem(cls, "md")).toBe(3.6);
  });
});

describe("Homepage H2 — sub-section ramp", () => {
  it("#paths-title uses 1.85rem → 2.1rem → 2.4rem ramp", () => {
    const cls = findH2Block("paths-title");
    expect(extractRem(cls, null)).toBe(1.85);
    expect(extractRem(cls, "sm")).toBe(2.1);
    expect(extractRem(cls, "md")).toBe(2.4);
  });
});

describe("Homepage eyebrow labels — canonical utility usage", () => {
  // The canonical eyebrow on the homepage is .he-eyebrow-bar
  // (defined in styles.css: 11px, weight 700, tracking 0.28em).
  // Each major section intro must use it.
  it("every major section intro uses .he-eyebrow-bar", () => {
    const requiredEyebrows = [
      "Three ways in",
      "Experience Studio",
      "Why YES",
      "Signature experiences",
      "Groups",
    ];
    for (const label of requiredEyebrows) {
      const re = new RegExp(`he-eyebrow-bar[^"]*"[^>]*>\\s*(?:<[^>]+>\\s*)?${label.replace(/&/g, "&amp;")}`);
      expect(re.test(src), `missing .he-eyebrow-bar wrapper for "${label}"`).toBe(true);
    }
  });
});
