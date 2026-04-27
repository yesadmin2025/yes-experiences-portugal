/**
 * FROZEN BRAND TOKENS — single source of truth for YES experiences
 * PORTUGAL brand colors and logo assets.
 *
 * Do NOT edit these values without an explicit brand sign-off. The
 * `src/lib/brand-tokens.test.ts` lock asserts that:
 *
 *   1. Every color here matches the corresponding CSS custom property
 *      declared in `src/styles.css` byte-for-byte.
 *   2. Every logo asset here is exactly the import target used by
 *      `src/components/Logo.tsx`.
 *   3. No other source file hard-codes a brand hex — components MUST
 *      consume the CSS tokens (var(--teal), var(--gold), …) instead.
 *
 * Together these three checks make accidental brand drift impossible:
 * a single edit to a hex or a swapped logo file breaks `bun run test`,
 * and the Hero Copy Lock CI workflow extends to brand drift too.
 */

/**
 * Approved brand palette. Hex values are intentionally uppercase to
 * match the existing `:root` declarations in `src/styles.css`. The
 * lock test is case-sensitive — keep them uppercase here AND in CSS.
 */
export const BRAND_COLORS = {
  teal: "#295B61",
  "teal-2": "#2A7C82",
  gold: "#C9A96A",
  "gold-soft": "#E1CFA6",
  ivory: "#FAF8F3",
  sand: "#F4EFE7",
  charcoal: "#2E2E2E",
  "charcoal-soft": "#5A5A5A",
  "charcoal-deep": "#1F1F1F",
} as const;

export type BrandColorToken = keyof typeof BRAND_COLORS;

/**
 * Approved logo variants. Every entry is the filename of the asset
 * inside `src/assets/`. The Logo component's `SOURCES` map is locked
 * against this object; adding/removing a theme here without updating
 * the component (and vice versa) fails the lock.
 */
export const BRAND_LOGO_VARIANTS = {
  "teal-on-ivory": "yes-logo-approved.png",
  "gold-on-charcoal": "yes-logo-approved-gold-silk.png",
} as const;

export type BrandLogoTheme = keyof typeof BRAND_LOGO_VARIANTS;

/**
 * Files that are EXEMPT from the "no hard-coded brand hex" rule. These
 * are the canonical sources where the hex literally has to live:
 *  - `src/styles.css` declares the CSS custom properties.
 *  - `src/lib/brand-tokens.ts` is this file.
 *  - `src/lib/brand-tokens.test.ts` asserts the values.
 *  - Anything under `src/generated/` is auto-written by build scripts
 *    (e.g. `brand-audit.json`) and re-derived from the same tokens.
 */
export const BRAND_HEX_EXEMPT_PATH_PREFIXES = [
  "src/styles.css",
  "src/lib/brand-tokens.ts",
  "src/lib/brand-tokens.test.ts",
  "src/generated/",
  // Tailwind config mirror — defines color palette from the same tokens.
  "src/tailwind.config.lov.json",
] as const;
