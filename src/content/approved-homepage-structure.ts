/**
 * Approved homepage structure spec.
 *
 * Single source of truth for what the marketing homepage MUST contain
 * at mobile widths. Consumed by:
 *
 *   - src/routes/__tests__/homepage-structure.test.ts
 *       Vitest source-level checks: section identity, order, count,
 *       and spacing token presence in `src/routes/index.tsx`.
 *   - e2e/homepage-structure.spec.ts (optional Playwright suite)
 *       Renders the page at each `MOBILE_BREAKPOINTS` viewport and
 *       asserts the same identities + min spacing rules in the live
 *       DOM. Spacing rules are min-pixel floors derived from the
 *       Tailwind tokens below — generous enough to survive copy
 *       rewrites, strict enough to catch a `py-24` → `py-8` regression.
 *
 * IMPORTANT — when intentionally restructuring the homepage:
 *   1. Update this file FIRST (it's the spec).
 *   2. Run the suite. The Vitest check will tell you exactly which
 *      section ID / order / spacing rule drifted.
 *   3. If the diff is intentional, the test failure becomes the
 *      review checklist; update `src/routes/index.tsx` accordingly.
 *
 * NEVER edit `src/routes/index.tsx` and this spec in opposite
 * directions to "make tests pass" — that defeats the lock.
 */

/* ------------------------------------------------------------------ */
/* Breakpoints                                                        */
/* ------------------------------------------------------------------ */

/**
 * Mobile widths the regression suite covers. Heights are realistic
 * device viewports so above-the-fold checks are meaningful.
 *
 *  - 320×568  iPhone SE / smallest realistic Android. Tightest case.
 *  - 375×812  iPhone 13 mini / common small phones.
 *  - 390×844  iPhone 14/15 standard. Most common smartphone today.
 *  - 414×896  iPhone 14 Pro Max / large Android. Upper mobile bound.
 *
 * Heights match Playwright's `set_viewport_size` snap targets so live
 * specs don't get silently resized.
 */
export const MOBILE_BREAKPOINTS = [
  { name: "iphone-se", width: 320, height: 568 },
  { name: "iphone-13-mini", width: 375, height: 812 },
  { name: "iphone-14", width: 390, height: 844 },
  { name: "iphone-14-pro-max", width: 414, height: 896 },
] as const;

export type MobileBreakpointName = (typeof MOBILE_BREAKPOINTS)[number]["name"];

/**
 * Tailwind responsive prefix for the mobile range. The homepage uses
 * unprefixed (mobile) + `md:` (tablet+) + `lg:` (desktop). Anything
 * not gated by `md:` / `lg:` applies at the widths above.
 */
export const MOBILE_TAILWIND_PREFIX = "" as const;

/* ------------------------------------------------------------------ */
/* Section identity                                                   */
/* ------------------------------------------------------------------ */

/**
 * Every entry is one `<section>` rendered on the homepage, in the
 * exact top-to-bottom order they must appear at mobile.
 *
 * Identity strategy:
 *   - `ariaLabelledBy`  — preferred; matches `aria-labelledby="…"`
 *                         on the section. Survives copy edits.
 *   - `marker`          — fallback for sections that don't use
 *                         aria-labelledby (e.g. the hero, multi-day).
 *                         Matches the `{/* N — NAME *\/}` comment that
 *                         already lives above the section in
 *                         `src/routes/index.tsx`.
 *
 * `requiredSpacing` is the minimum Tailwind padding class the section
 * MUST carry at mobile (no `md:` prefix). The Vitest check parses the
 * className string and asserts the numeric scale is ≥ the floor below.
 * `null` means the section is intentionally exempt (e.g. the hero,
 * which uses `min-h-[80vh]` for spacing instead of `py-*`).
 */
export interface ApprovedSection {
  /** Position in the document, 1-indexed top to bottom. */
  order: number;
  /** Human-readable name for failing assertions. */
  name: string;
  /**
   * Stable identity. EXACTLY ONE of these must be set per entry.
   * - aria-labelledby id, OR
   * - the trailing text of the `{/* N — NAME *\/}` comment.
   */
  ariaLabelledBy?: string;
  marker?: string;
  /**
   * Minimum mobile vertical-padding class. The check parses `py-N`
   * (or `pb-N` for the final-CTA case) from the section's className
   * and asserts N >= floor. Tailwind scale: 1 unit = 0.25rem = 4px.
   */
  requiredSpacing:
    | { kind: "py"; minScale: number }
    | { kind: "pb"; minScale: number }
    | { kind: "min-h-vh"; minVh: number }
    | null;
}

/**
 * The approved structure (Patch 2B.1 — 9 sections).
 *
 * Brief: "Refactor the homepage into a calm, premium decision page" —
 * 1. Hero  2. Trust strip  3. Start here  4. Signature preview
 * 5. Studio preview  6. Multi-day tours  7. Groups & celebrations
 * 8. FAQ  9. Final CTA.
 *
 * Patch 2B.1: Multi-day was split out from Moments/Groups so multi-day
 * routes get their own breathing room; Proposals + Celebrations +
 * Corporate sit together in a dedicated Groups & celebrations band.
 *
 * To change a row: bump the spec, then update the source.
 *
 * Spacing token reference (from `src/styles.css` `:root` mobile values):
 *   .section-y     → 5rem  → minScale 20
 *   .section-y-lg  → 6rem  → minScale 24
 *   .section-y-sm  → 3.5rem → minScale 14
 */
export const APPROVED_HOMEPAGE_SECTIONS: readonly ApprovedSection[] = [
  {
    order: 1,
    name: "Hero",
    marker: "HERO",
    requiredSpacing: { kind: "min-h-vh", minVh: 80 },
  },
  {
    order: 2,
    name: "Trust strip — reviews + private guide line",
    ariaLabelledBy: "trust-bar-title",
    requiredSpacing: { kind: "py", minScale: 14 },
  },
  {
    order: 3,
    name: "Start here — primary + secondary paths",
    ariaLabelledBy: "start-paths-title",
    requiredSpacing: { kind: "py", minScale: 20 },
  },
  {
    order: 4,
    name: "Signature experiences preview",
    ariaLabelledBy: "signatures-title",
    requiredSpacing: { kind: "py", minScale: 20 },
  },
  {
    order: 5,
    name: "Experience Studio preview (map + summary)",
    ariaLabelledBy: "studio-title",
    requiredSpacing: { kind: "py", minScale: 24 },
  },
  {
    order: 6,
    name: "Multi-day tours — routes across Portugal",
    ariaLabelledBy: "multiday-title",
    requiredSpacing: { kind: "py", minScale: 20 },
  },
  {
    order: 7,
    name: "Groups & celebrations — proposals + celebrations + corporate",
    ariaLabelledBy: "groups-title",
    requiredSpacing: { kind: "py", minScale: 20 },
  },
  {
    order: 8,
    name: "FAQ — visible helpful answers",
    ariaLabelledBy: "faq-title",
    requiredSpacing: { kind: "py", minScale: 20 },
  },
  {
    order: 9,
    name: "Final CTA — talk to a local",
    marker: "FINAL CTA",
    requiredSpacing: { kind: "pb", minScale: 20 },
  },
] as const;

/** Total number of sections that MUST be present. */
export const APPROVED_SECTION_COUNT = APPROVED_HOMEPAGE_SECTIONS.length;

/* ------------------------------------------------------------------ */
/* Layout invariants (apply at every mobile breakpoint)               */
/* ------------------------------------------------------------------ */

/**
 * Page-wide rules that hold at every width in `MOBILE_BREAKPOINTS`.
 * The Playwright suite enforces these in the live DOM; the Vitest
 * suite asserts the source uses the supporting tokens (`container-x`,
 * `overflow-hidden` on the hero, etc.).
 */
export const MOBILE_LAYOUT_INVARIANTS = {
  /** No horizontal scroll at any mobile width. */
  noHorizontalOverflow: true,
  /**
   * Every section's content lives inside a `.container-x` wrapper so
   * gutters stay consistent. The Vitest check counts `.container-x`
   * occurrences and asserts ≥ APPROVED_SECTION_COUNT - 1 (hero is the
   * one exception — full-bleed background image).
   */
  containerXWrapperPerSection: true,
  /**
   * Minimum vertical gap between adjacent sections, in Tailwind scale
   * units, derived from the smallest `py-N` floor in the spec above.
   * The Playwright suite measures `getBoundingClientRect()` deltas
   * and asserts the gap ≥ this floor × 4px (Tailwind unit) × 2 (top
   * + bottom of adjacent sections).
   */
  minSectionGapTailwindScale: 16,
  /**
   * Tailwind unit in pixels — kept here so live specs don't hard-code
   * the constant.
   */
  tailwindUnitPx: 4,
} as const;

/* ------------------------------------------------------------------ */
/* Convenience getters                                                */
/* ------------------------------------------------------------------ */

/** Returns the approved section that matches a given aria-labelledby id. */
export function findApprovedSectionByAriaLabel(id: string): ApprovedSection | undefined {
  return APPROVED_HOMEPAGE_SECTIONS.find((s) => s.ariaLabelledBy === id);
}

/** Minimum vertical padding in CSS pixels for a `py-N` rule. */
export function spacingFloorPx(rule: ApprovedSection["requiredSpacing"]): number {
  if (rule === null) return 0;
  if (rule.kind === "min-h-vh") return 0; // measured differently
  return rule.minScale * MOBILE_LAYOUT_INVARIANTS.tailwindUnitPx;
}
