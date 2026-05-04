/**
 * Hero scene copy variants — A/B test definitions.
 *
 * Variants modify ONLY the per-scene `main` lines and `support`
 * microline. They MUST NEVER touch:
 *   - the locked HERO_COPY (eyebrow, H1, sub, CTAs, microcopy)
 *   - the underlying video / image / position / pan
 *   - the scene `id`s (used as analytics keys)
 *
 * Why these constraints exist:
 *   • HERO_COPY is byte-locked by HERO_COPY_SPEC and CI
 *     (`hero-copy-byte-exact.spec.ts`, `hero-copy-lock.yml`). Varying
 *     it would fail the pipeline and the verifier endpoint.
 *   • The scene id is the join key for impressions / conversions in
 *     the `hero_ab_events` table. Renaming would orphan history.
 *
 * Each experiment ships with a `control` (the current production
 * copy, byte-identical to the manifest) plus one or more challengers
 * with a clear hypothesis. Add new variants here only.
 */

import type { HeroScene } from "@/content/hero-scenes-manifest";
import { HERO_SCENES } from "@/content/hero-scenes-manifest";

export type SceneCopyOverride = Pick<HeroScene, "main" | "support">;

export type HeroCopyVariant = {
  id: string;
  /** Short hypothesis shown in admin / analytics — never to users. */
  hypothesis: string;
  /** scene.id → override. Missing scenes fall back to control copy. */
  scenes: Record<string, SceneCopyOverride>;
};

export type HeroExperiment = {
  /** Stable analytics key. NEVER rename — that resets all history. */
  key: string;
  /** Inclusive list of variant ids that participate. First MUST be "control". */
  variants: readonly HeroCopyVariant[];
  /** Equal-weight 50/50 (or N-way) split unless overridden. */
  weights?: Record<string, number>;
};

/** Helper: pull the control directly from the production manifest. */
const controlScenes: Record<string, SceneCopyOverride> = Object.fromEntries(
  HERO_SCENES.map((s) => [s.id, { main: s.main, support: s.support }]),
);

/**
 * Experiment 1 — `hero_copy_v1`.
 *
 * Hypothesis we test:
 *   A. Control — minimal poetic phrasing ("We come / to you.").
 *   B. Benefit-led — explicit value ("Picked up at your door.").
 *   C. Question-led — engages the reader's own scenario.
 *
 * The action-scene CTAs are NOT touched in any variant — only the
 * scene copy beats above the CTAs. Conversion is measured on
 * `cta_click` + `builder_start` downstream.
 */
export const HERO_COPY_EXPERIMENT: HeroExperiment = {
  key: "hero_copy_v1",
  variants: [
    {
      id: "control",
      hypothesis: "Current cinematic phrasing — emotional, minimal.",
      scenes: controlScenes,
    },
    {
      id: "benefit",
      hypothesis:
        "Spell out the concrete benefit on every scene — likely to lift " +
        "click-through with first-time visitors who scan more than they read.",
      scenes: {
        arrival: {
          main: ["Picked up", "at your door."],
          support: "Private driver. Anywhere in the region.",
        },
        discovery: {
          main: ["See places", "tours don't reach."],
          support: "Routed by people who live here.",
        },
        "local-hands": {
          main: ["Hosted by", "local families."],
          support: "Real wineries. Real kitchens.",
        },
        celebrate: {
          main: ["A day", "you'll talk about."],
          support: "Birthdays, anniversaries, big yeses.",
        },
        action: {
          main: ["Design it now.", "Confirmed instantly."],
          support: "No forms. No waiting.",
        },
      },
    },
    {
      id: "question",
      hypothesis:
        "Lead with the visitor's own scenario as a question — higher " +
        "engagement, especially on mobile where dwell time is short.",
      scenes: {
        arrival: {
          main: ["Where should", "we meet you?"],
          support: "We pick you up. Anywhere.",
        },
        discovery: {
          main: ["Want to see", "the real Portugal?"],
          support: "The places locals keep.",
        },
        "local-hands": {
          main: ["Wine, food,", "or both today?"],
          support: "Hosted by real families.",
        },
        celebrate: {
          main: ["Marking a", "moment soon?"],
          support: "Birthdays, anniversaries, proposals.",
        },
        action: {
          main: ["Ready to", "build it?"],
          support: "No forms. No waiting.",
        },
      },
    },
  ],
};

export const HERO_EXPERIMENTS = [HERO_COPY_EXPERIMENT] as const;

/**
 * Resolve a variant's scenes back into full HeroScene objects, using
 * the manifest as the visual + media source of truth and only
 * swapping the copy fields.
 */
export function applyVariantToScenes(
  variant: HeroCopyVariant,
  baseScenes: readonly HeroScene[] = HERO_SCENES,
): readonly HeroScene[] {
  return baseScenes.map((scene) => {
    const override = variant.scenes[scene.id];
    if (!override) return scene;
    return { ...scene, main: override.main, support: override.support };
  });
}
