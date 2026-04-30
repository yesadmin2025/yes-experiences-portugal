/**
 * Approved homepage structure spec (v3 — 13-block premium layout).
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
 *       DOM.
 *
 * Some sections are rendered by composed child components (e.g.
 * `<TheDifferenceSection />`, `<TrustmarySection />`). Those carry
 * `inComponent: true` — the source-level lock recognises them via
 * the JSX usage of the component name in `index.tsx` rather than a
 * literal `<section>` tag in that file.
 */

/* ------------------------------------------------------------------ */
/* Breakpoints                                                        */
/* ------------------------------------------------------------------ */

export const MOBILE_BREAKPOINTS = [
  { name: "iphone-se", width: 320, height: 568 },
  { name: "iphone-13-mini", width: 375, height: 812 },
  { name: "iphone-14", width: 390, height: 844 },
  { name: "iphone-14-pro-max", width: 414, height: 896 },
] as const;

export type MobileBreakpointName = (typeof MOBILE_BREAKPOINTS)[number]["name"];

export const MOBILE_TAILWIND_PREFIX = "" as const;

/* ------------------------------------------------------------------ */
/* Section identity                                                   */
/* ------------------------------------------------------------------ */

export interface ApprovedSection {
  /** Position in the document, 1-indexed top to bottom. */
  order: number;
  /** Human-readable name for failing assertions. */
  name: string;
  /** aria-labelledby id (preferred when the section is inline in index.tsx). */
  ariaLabelledBy?: string;
  /** `{/* N — NAME *\/}` marker comment text (fallback when no aria id). */
  marker?: string;
  /**
   * Component identifier for sections rendered by a composed child
   * component imported into `index.tsx`. The lock matches the JSX
   * usage `<ComponentName` in source order. Set this OR
   * ariaLabelledBy/marker — not both.
   */
  componentTag?: string;
  /**
   * True for sections rendered by a child component. Excluded from
   * the literal `<section>` count check in index.tsx.
   */
  inComponent?: boolean;
  /**
   * Minimum mobile vertical-padding class. `null` means exempt
   * (e.g. hero uses min-h instead of py-*). Skipped automatically for
   * `inComponent: true` rows — the parent component owns its spacing.
   */
  requiredSpacing:
    | { kind: "py"; minScale: number }
    | { kind: "pb"; minScale: number }
    | { kind: "min-h-vh"; minVh: number }
    | null;
}

/**
 * The approved 13-block structure (v3 — premium homepage rework).
 *
 * Order:
 *   1.  Hero
 *   2.  Trust strip
 *   3.  Why YES (manifesto)
 *   4.  The Difference (componentized)
 *   5.  Pick your path (Four Ways In)
 *   6.  Signature experiences preview
 *   7.  Experience Studio preview (map + summary)
 *   8.  Multi-day journeys
 *   9.  Groups & celebrations (Proposals + Celebrations + Corporate)
 *   10. Testimonials (Trustmary, componentized)
 *   11. FAQ
 *   12. Final CTA — talk to a local
 *   13. (Footer is rendered by SiteLayout, not counted here)
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
    name: "Why YES — editorial manifesto (5 blocks)",
    ariaLabelledBy: "why-yes-title",
    requiredSpacing: { kind: "py", minScale: 20 },
  },
  {
    order: 4,
    name: "The Difference — process & promise",
    componentTag: "TheDifferenceSection",
    inComponent: true,
    requiredSpacing: null,
  },
  {
    order: 5,
    name: "Pick your path — four ways to start",
    ariaLabelledBy: "start-paths-title",
    requiredSpacing: { kind: "py", minScale: 20 },
  },
  {
    order: 6,
    name: "Signature experiences preview",
    ariaLabelledBy: "signatures-title",
    requiredSpacing: { kind: "py", minScale: 20 },
  },
  {
    order: 7,
    name: "Experience Studio preview (map + summary)",
    ariaLabelledBy: "studio-title",
    requiredSpacing: { kind: "py", minScale: 24 },
  },
  {
    order: 8,
    name: "Multi-day journeys — routes across Portugal",
    ariaLabelledBy: "multiday-title",
    requiredSpacing: { kind: "py", minScale: 20 },
  },
  {
    order: 9,
    name: "Groups & celebrations — proposals + celebrations + corporate",
    ariaLabelledBy: "groups-title",
    requiredSpacing: { kind: "py", minScale: 20 },
  },
  {
    order: 10,
    name: "Testimonials — verified traveler reviews",
    componentTag: "TrustmarySection",
    inComponent: true,
    requiredSpacing: null,
  },
  {
    order: 11,
    name: "FAQ — visible helpful answers",
    ariaLabelledBy: "faq-title",
    requiredSpacing: { kind: "py", minScale: 20 },
  },
  {
    order: 12,
    name: "Final CTA — talk to a local",
    marker: "FINAL CTA",
    requiredSpacing: { kind: "pb", minScale: 20 },
  },
] as const;

/** Total number of approved blocks (including componentized rows). */
export const APPROVED_SECTION_COUNT = APPROVED_HOMEPAGE_SECTIONS.length;

/**
 * Number of `<section>` tags expected literally in src/routes/index.tsx.
 * Excludes rows whose JSX lives in a child component.
 */
export const APPROVED_INLINE_SECTION_COUNT = APPROVED_HOMEPAGE_SECTIONS.filter(
  (s) => !s.inComponent,
).length;

/* ------------------------------------------------------------------ */
/* Layout invariants                                                  */
/* ------------------------------------------------------------------ */

export const MOBILE_LAYOUT_INVARIANTS = {
  noHorizontalOverflow: true,
  containerXWrapperPerSection: true,
  /**
   * Floor for the inline-section .container-x count. Hero is the one
   * inline section that does not use a container-x wrapper (full-bleed
   * hero image), so the floor is INLINE - 1.
   */
  minSectionGapTailwindScale: 16,
  tailwindUnitPx: 4,
} as const;

/* ------------------------------------------------------------------ */
/* Convenience getters                                                */
/* ------------------------------------------------------------------ */

export function findApprovedSectionByAriaLabel(id: string): ApprovedSection | undefined {
  return APPROVED_HOMEPAGE_SECTIONS.find((s) => s.ariaLabelledBy === id);
}

export function spacingFloorPx(rule: ApprovedSection["requiredSpacing"]): number {
  if (rule === null) return 0;
  if (rule.kind === "min-h-vh") return 0;
  return rule.minScale * MOBILE_LAYOUT_INVARIANTS.tailwindUnitPx;
}
