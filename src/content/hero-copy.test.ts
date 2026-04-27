import { describe, expect, it } from "vitest";
import { HERO_COPY } from "@/content/hero-copy";
import { HERO_COPY_SPEC } from "@/content/hero-copy.spec";

/**
 * Source-level lock: every key the rendered DOM is asserted against in
 * `e2e/hero-copy-byte-exact.spec.ts` MUST equal the FROZEN spec
 * byte-for-byte at the source level. This runs in jsdom (no browser
 * needed), so it executes everywhere the unit-test suite runs and
 * catches drift the moment the source file is edited — before the e2e
 * suite even spins up a browser.
 *
 * If a string here fails, the e2e DOM lock would also fail, but with a
 * far slower feedback loop. Treat this file as the first line of
 * defense; the e2e file as the second (it additionally proves the
 * markup actually renders the spec into the DOM).
 */

const FIELDS = [
  "eyebrow",
  "headlineLine1",
  "headlineLine2",
  "subheadline",
  "primaryCta",
  "secondaryCta",
  "microcopy",
] as const satisfies readonly (keyof typeof HERO_COPY_SPEC)[];

function describeFirstDiff(actual: string, expected: string): string {
  const max = Math.max(actual.length, expected.length);
  for (let i = 0; i < max; i++) {
    const a = actual.charCodeAt(i);
    const e = expected.charCodeAt(i);
    if (a !== e) {
      const fmt = (cp: number) =>
        Number.isNaN(cp) ? "<EOF>" : `U+${cp.toString(16).padStart(4, "0").toUpperCase()}`;
      return `first diff at index ${i}: actual=${fmt(a)} vs expected=${fmt(e)}`;
    }
  }
  return "lengths differ at end";
}

describe("Hero copy — source-level byte-exact lock", () => {
  for (const key of FIELDS) {
    it(`HERO_COPY.${key} === HERO_COPY_SPEC.${key}`, () => {
      const actual = HERO_COPY[key];
      const expected = HERO_COPY_SPEC[key];
      if (actual !== expected) {
        throw new Error(
          `HERO_COPY.${key} drifted from spec — ${describeFirstDiff(actual, expected)}\n` +
            `  expected: ${JSON.stringify(expected)}\n` +
            `  actual:   ${JSON.stringify(actual)}`,
        );
      }
      expect(actual).toBe(expected);
    });
  }

  it("microcopy contains no positive form/waiting/request vocabulary", () => {
    // The approved microcopy is intentionally allowed to NEGATE these
    // words ("No forms", "No waiting") — what we forbid is the positive
    // assertion of any of them. Strip "no <word>" pairs first, then
    // assert no remaining occurrence.
    const stripped = HERO_COPY_SPEC.microcopy.replace(/\bno\s+\w+/gi, "");
    const forbidden = [
      "form",
      "forms",
      "wait",
      "waiting",
      "request",
      "requests",
      "submit",
      "email",
      "approval",
      "approved",
    ];
    for (const word of forbidden) {
      expect(
        new RegExp(`\\b${word}\\b`, "i").test(stripped),
        `microcopy must not POSITIVELY contain "${word}" — got after stripping negations: ${JSON.stringify(stripped)}`,
      ).toBe(false);
    }
  });
});
