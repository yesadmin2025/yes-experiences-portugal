/**
 * Source-level lock for the approved homepage structure.
 *
 * Reads `src/routes/index.tsx` as text and asserts it satisfies
 * `src/content/approved-homepage-structure.ts`:
 *
 *   1. Section count — exactly APPROVED_SECTION_COUNT `<section>` tags.
 *   2. Section identity + order — every approved section is found in
 *      the source in the right relative position, identified by either
 *      its `aria-labelledby` id or its `{/* N — NAME *\/}` marker
 *      comment immediately above it.
 *   3. Per-section spacing floor — the section's className contains a
 *      `py-N` (or `pb-N`) value with N ≥ the spec's floor at the
 *      mobile (unprefixed) Tailwind breakpoint.
 *   4. Layout invariants — `.container-x` appears at least
 *      APPROVED_SECTION_COUNT - 1 times (every section except the
 *      hero wraps its content in `.container-x`).
 *
 * This is a source-text lint, not a render test. That's deliberate:
 *   - It catches structural regressions in CI in milliseconds, before
 *     any Playwright run.
 *   - The matching live-DOM assertions belong in a Playwright spec
 *     (e2e/homepage-structure.spec.ts) which can additionally verify
 *     no horizontal overflow at each MOBILE_BREAKPOINTS width.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  APPROVED_HOMEPAGE_SECTIONS,
  APPROVED_SECTION_COUNT,
  MOBILE_LAYOUT_INVARIANTS,
  type ApprovedSection,
} from "../../content/approved-homepage-structure";

const INDEX_PATH = resolve(process.cwd(), "src/routes/index.tsx");
const SOURCE = readFileSync(INDEX_PATH, "utf8");

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

interface SectionMatch {
  /** Character index of the opening `<section` tag. */
  index: number;
  /** Full opening tag, including all attributes up to (and including) `>`. */
  openTag: string;
  /** className string extracted from the open tag, or "" if none. */
  className: string;
  /** aria-labelledby value extracted from the open tag, or null. */
  ariaLabelledBy: string | null;
}

/**
 * Walk the source and return every `<section …>` opening tag with its
 * className + aria-labelledby parsed out. Multi-line attributes are
 * supported (the homepage uses both inline and prop-wrapped forms).
 */
function findSections(source: string): SectionMatch[] {
  const out: SectionMatch[] = [];
  const re = /<section\b([^>]*)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    const attrs = m[1];
    const classNameMatch = attrs.match(/className=(?:"([^"]*)"|\{`([^`]*)`\})/);
    const ariaMatch = attrs.match(/aria-labelledby="([^"]+)"/);
    out.push({
      index: m.index,
      openTag: m[0],
      className: classNameMatch?.[1] ?? classNameMatch?.[2] ?? "",
      ariaLabelledBy: ariaMatch?.[1] ?? null,
    });
  }
  return out;
}

/**
 * Find the `{/* N — NAME *\/}` marker comment that appears most
 * recently before `index` in the source. Returns the trimmed marker
 * text (e.g. "1 — HERO") or null if none.
 */
function markerAbove(source: string, index: number): string | null {
  const slice = source.slice(0, index);
  const re = /\{\s*\/\*\s*([^*]+?)\s*\*\/\s*\}/g;
  let last: string | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(slice)) !== null) {
    last = m[1].trim();
  }
  return last;
}

/**
 * Resolve every approved section to the rendered <section> that
 * carries its identity. Returns matches in spec order with the source
 * `<section>` index, so the next test can assert ordering.
 */
function resolveApprovedToSource(): {
  spec: ApprovedSection;
  match: SectionMatch | null;
}[] {
  const allSections = findSections(SOURCE);
  return APPROVED_HOMEPAGE_SECTIONS.map((spec) => {
    let match: SectionMatch | null = null;
    if (spec.ariaLabelledBy) {
      match =
        allSections.find((s) => s.ariaLabelledBy === spec.ariaLabelledBy) ??
        null;
    } else if (spec.marker) {
      match =
        allSections.find((s) => {
          const marker = markerAbove(SOURCE, s.index);
          return marker === spec.marker;
        }) ?? null;
    }
    return { spec, match };
  });
}

/**
 * Parse the largest `py-N` (or `pb-N` if `kind === "pb"`) value from
 * a className string. Considers ONLY unprefixed (mobile) classes —
 * `md:py-32` and `lg:py-40` are deliberately ignored because the spec
 * is the mobile floor.
 */
function parseMobileSpacing(
  className: string,
  kind: "py" | "pb",
): number | null {
  const tokens = className.split(/\s+/).filter(Boolean);
  let max: number | null = null;
  for (const t of tokens) {
    if (t.includes(":")) continue; // skip md:, lg:, hover:, etc.
    const m = t.match(new RegExp(`^${kind}-(\\d+)$`));
    if (m) {
      const n = Number(m[1]);
      if (max === null || n > max) max = n;
    }
  }
  return max;
}

/* ------------------------------------------------------------------ */
/* tests                                                              */
/* ------------------------------------------------------------------ */

describe("Approved homepage structure (source lock)", () => {
  it(`renders exactly ${APPROVED_SECTION_COUNT} <section> tags`, () => {
    const sections = findSections(SOURCE);
    expect(
      sections.length,
      `Expected ${APPROVED_SECTION_COUNT} top-level <section> tags in src/routes/index.tsx, ` +
        `found ${sections.length}. If you intentionally added or removed a section, ` +
        `update src/content/approved-homepage-structure.ts FIRST, then re-run the suite.`,
    ).toBe(APPROVED_SECTION_COUNT);
  });

  describe("section identity", () => {
    const resolved = resolveApprovedToSource();
    for (const { spec, match } of resolved) {
      it(`#${spec.order} "${spec.name}" is present in the source`, () => {
        expect(
          match,
          spec.ariaLabelledBy
            ? `Could not find a <section aria-labelledby="${spec.ariaLabelledBy}"> in src/routes/index.tsx. ` +
                `Either restore the section or update the spec.`
            : `Could not find a <section> immediately preceded by the comment ` +
                `{/* ${spec.marker} */} in src/routes/index.tsx.`,
        ).not.toBeNull();
      });
    }
  });

  it("sections appear in the approved top-to-bottom order", () => {
    const resolved = resolveApprovedToSource();
    const indices = resolved.map((r) => r.match?.index ?? -1);
    // All present (covered by the per-section tests too, but assert
    // here so a partial regression doesn't mask an ordering bug).
    expect(indices.every((i) => i >= 0)).toBe(true);
    const sorted = [...indices].sort((a, b) => a - b);
    expect(
      indices,
      "Approved sections appear out of order in src/routes/index.tsx. " +
        "Expected order: " +
        APPROVED_HOMEPAGE_SECTIONS.map((s) => `#${s.order} ${s.name}`).join(
          " → ",
        ),
    ).toEqual(sorted);
  });

  describe("per-section mobile spacing floor", () => {
    const resolved = resolveApprovedToSource();
    for (const { spec, match } of resolved) {
      const rule = spec.requiredSpacing;
      if (rule === null) continue;
      if (rule.kind === "min-h-vh") {
        it(`#${spec.order} "${spec.name}" uses at least min-h-[${rule.minVh}vh] at mobile`, () => {
          expect(match).not.toBeNull();
          // Hero pattern is `min-h-[80vh] md:min-h-[94vh]` — match the
          // first (mobile) value and check the vh number.
          const m = match!.className.match(/(?<!:)min-h-\[(\d+)vh\]/);
          expect(
            m,
            `Section "${spec.name}" must declare a mobile min-h-[Nvh] of at least ${rule.minVh}vh.`,
          ).not.toBeNull();
          expect(Number(m![1])).toBeGreaterThanOrEqual(rule.minVh);
        });
        continue;
      }
      it(`#${spec.order} "${spec.name}" has ${rule.kind}-${rule.minScale} or larger at mobile`, () => {
        expect(match).not.toBeNull();
        const found = parseMobileSpacing(match!.className, rule.kind);
        expect(
          found,
          `Section "${spec.name}" must include a mobile ${rule.kind}-N class with N ≥ ${rule.minScale}. ` +
            `Found className: "${match!.className}"`,
        ).not.toBeNull();
        expect(found).toBeGreaterThanOrEqual(rule.minScale);
      });
    }
  });

  describe("layout invariants", () => {
    it("uses .container-x in at least every non-hero section", () => {
      if (!MOBILE_LAYOUT_INVARIANTS.containerXWrapperPerSection) return;
      const count = (SOURCE.match(/className="[^"]*\bcontainer-x\b/g) ?? [])
        .length;
      const floor = APPROVED_SECTION_COUNT - 1;
      expect(
        count,
        `Expected at least ${floor} occurrences of .container-x (one per non-hero section), found ${count}.`,
      ).toBeGreaterThanOrEqual(floor);
    });

    it("hero uses overflow-hidden so the slow zoom never causes horizontal scroll", () => {
      const hero = findSections(SOURCE).find(
        (s) => markerAbove(SOURCE, s.index) === "1 — HERO",
      );
      expect(hero).toBeDefined();
      expect(
        /\boverflow-hidden\b/.test(hero!.className),
        "Hero <section> must include `overflow-hidden` to satisfy the no-horizontal-scroll invariant at mobile widths.",
      ).toBe(true);
    });
  });
});
