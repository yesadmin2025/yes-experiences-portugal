/**
 * Homepage typography scale — refined mobile→desktop ramp (v2).
 *
 * Locks the lighter, more editorial mobile scale agreed in the
 * Nov 2026 refinement pass. Mobile H2s now sit between 1.7rem and
 * 2rem (down from 2.5rem) with `font-medium` weight on the body of
 * the page; only the hero remains visually dominant.
 *
 * Tiers on the homepage:
 *
 *   · MAJOR section H2 (Studio, Why YES, Signatures, Groups)
 *     → text-[2rem] sm:text-[2.4rem] md:text-[3.6rem] (medium weight)
 *
 *   · Final CTA H2 (dark teal surface)
 *     → text-[2rem] sm:text-[2.4rem] md:text-[3.2rem]
 *
 *   · SUB-section H2 (Three ways)
 *     → text-[1.7rem] sm:text-[1.95rem] md:text-[2.4rem]
 *
 * Eyebrows: .he-eyebrow-bar utility (11px, 700, 0.28em) — unchanged.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const indexPath = resolve(__dirname, "../routes/index.tsx");
const src = readFileSync(indexPath, "utf8");

function findH2Block(id: string): string {
  const re = new RegExp(`id="${id}"[^>]*className="([^"]+)"`);
  const m = src.match(re);
  if (!m) throw new Error(`H2 with id="${id}" not found`);
  return m[1];
}

function extractRem(cls: string, prefix: string | null): number | null {
  const re = prefix
    ? new RegExp(`${prefix}:text-\\[(\\d+(?:\\.\\d+)?)rem\\]`)
    : /(?:^|\s)text-\[(\d+(?:\.\d+)?)rem\]/;
  const m = cls.match(re);
  return m ? parseFloat(m[1]) : null;
}

describe("Homepage H2 — major section ramp (refined)", () => {
  const MAJOR_IDS = ["studio-title", "why-yes-title", "signatures-title", "groups-title"];

  for (const id of MAJOR_IDS) {
    it(`#${id} uses 2rem → 2.4rem → 3.6rem ramp`, () => {
      const cls = findH2Block(id);
      expect(extractRem(cls, null), `#${id}: mobile size`).toBe(2);
      expect(extractRem(cls, "sm"), `#${id}: sm size`).toBe(2.4);
      expect(extractRem(cls, "md"), `#${id}: md size`).toBe(3.6);
    });
  }

  it("#final-cta-title uses 2rem → 2.4rem → 3.2rem ramp (lower md on dark surface)", () => {
    const cls = findH2Block("final-cta-title");
    expect(extractRem(cls, null)).toBe(2);
    expect(extractRem(cls, "sm")).toBe(2.4);
    expect(extractRem(cls, "md")).toBe(3.2);
  });
});

describe("Homepage H2 — sub-section ramp (refined)", () => {
  it("#paths-title uses 1.7rem → 1.95rem → 2.4rem ramp", () => {
    const cls = findH2Block("paths-title");
    expect(extractRem(cls, null)).toBe(1.7);
    expect(extractRem(cls, "sm")).toBe(1.95);
    expect(extractRem(cls, "md")).toBe(2.4);
  });
});

describe("Homepage eyebrow labels — canonical utility usage", () => {
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
