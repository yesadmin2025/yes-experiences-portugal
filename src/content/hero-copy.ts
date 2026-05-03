/**
 * Single source of truth for the home hero copy.
 *
 * Edit strings here ONLY. The home route (`src/routes/index.tsx`) and the
 * e2e snapshot spec (`e2e/hero-copy.spec.ts`) both import from this file,
 * so the rendered UI, the SSR meta tags, and the regression test cannot
 * drift apart.
 *
 * Approved positioning (locked):
 *   The client shapes the journey in real time and books instantly.
 *   Local guidance is available on demand, never required.
 */
export const HERO_COPY = {
  eyebrow: "PRIVATE · BY LOCALS · IN REAL TIME",
  headlineLine1: "Portugal is the stage.",
  headlineLine2: "You write the story.",
  subheadline:
    "Choose the places, pace and moments that feel right — from private days to celebrations, groups and full journeys — with local guidance whenever you want it. Confirm instantly.",
  primaryCta: "Create Your Story",
  secondaryCta: "Explore Signature Experiences",
  microcopy: "Create it in real time. Confirm instantly. A local guide is here if you need one.",
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
