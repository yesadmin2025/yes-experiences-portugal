/**
 * Single source of truth for the home hero copy.
 *
 * Edit strings here ONLY. The home route (`src/routes/index.tsx`) and the
 * e2e snapshot spec (`e2e/hero-copy.spec.ts`) both import from this file,
 * so the rendered UI, the SSR meta tags, and the regression test cannot
 * drift apart.
 *
 * If you intentionally change brand copy, the version hash below changes
 * automatically and the cache-busting headers/meta on `/` will reflect it.
 */
export const HERO_COPY = {
  eyebrow: "PRIVATE · BY LOCALS · ANY OCCASION",
  headlineLine1: "Portugal is the stage.",
  headlineLine2: "You write the story.",
  subheadline:
    "Designed by you, at your rhythm — for a day, a journey, or a celebration — guided by a local who knows where the real moments happen.",
  primaryCta: "Create Your Story",
  secondaryCta: "Explore Signature Experiences",
  microcopy: "Designed by locals. Confirmed personally.",
  brandLine: "Whatever you have in mind, we say YES.",
} as const;

export type HeroCopyKey = keyof typeof HERO_COPY;

/**
 * Deterministic content-hash of every hero string. Used to bust SSR caches
 * and to expose a verifiable version on the rendered page.
 */
export const HERO_COPY_VERSION = Object.values(HERO_COPY)
  .join("|")
  .split("")
  .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0)
  .toString(36);
