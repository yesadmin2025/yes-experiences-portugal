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
  // Stable analytics key. Bumped to v5 when the trimmed final-map master
  // timings were re-locked so returning visitors are not pinned to older
  // local assignments with stale copy cadence.
  key: "hero_copy_v5",
  // 100% weight on `control` for now — the cinematic spine IS the
  // approved hero. `benefit` and `question` remain defined so we can
  // re-enable the split (e.g. 60/20/20) later without rewiring any
  // analytics. Setting a variant's weight to 0 fully excludes it from
  // assignment but keeps it documented + previewable via
  // `?heroVariant=benefit` / `?heroVariant=question`.
  weights: { control: 1, benefit: 0, question: 0 },
  variants: [
    {
      id: "control",
      hypothesis: "Cinematic 'you design it' spine — current canonical hero.",
      scenes: controlScenes,
    },
    {
      id: "benefit",
      hypothesis:
        "Spell out the concrete benefit on every scene — likely to lift " +
        "click-through with first-time visitors who scan more than they read.",
      scenes: {
        imagine: {
          main: ["Design your", "Portugal day."],
          support: "Built around how you want to feel.",
        },
        choose: {
          main: ["Hidden gems,", "known by locals."],
          support: "Markets and azulejos, without the rush.",
        },
        taste: {
          main: ["A private day,", "crafted for you."],
          support: "Your people, your timing, your table.",
        },
        celebrate: {
          main: ["Celebrate", "without effort."],
          support: "Milestones handled with calm precision.",
        },
        corporate: {
          main: ["Teams together,", "properly hosted."],
          support: "Corporate moments, quietly coordinated.",
        },
        journey: {
          main: ["One perfect day", "to remember."],
          support: "A couple, a coast, a story in motion.",
        },
        build: {
          main: ["A journey", "across Portugal."],
          support: "From landmark to route, designed as one flow.",
        },
        confirm: {
          main: [],
          support: undefined,
        },
      },
    },
    {
      id: "question",
      hypothesis:
        "Lead with the visitor's own scenario as a question — higher " +
        "engagement, especially on mobile where dwell time is short.",
      scenes: {
        imagine: {
          main: ["What would", "your day be?"],
          support: "Tell us how you want it to feel.",
        },
        choose: {
          main: ["Hidden gems,", "known by locals?"],
          support: "Markets, azulejos, the places between.",
        },
        taste: {
          main: ["How private", "should it feel?"],
          support: "Your day, crafted around your people.",
        },
        celebrate: {
          main: ["What are you", "celebrating?"],
          support: "Milestones shaped with care.",
        },
        corporate: {
          main: ["A team day", "with purpose?"],
          support: "Corporate tables, privately orchestrated.",
        },
        journey: {
          main: ["One perfect day", "to remember?"],
          support: "A couple, a coast, a story in motion.",
        },
        build: {
          main: ["How far", "across Portugal?"],
          support: "From landmark to route, designed as one flow.",
        },
        confirm: {
          main: [],
          support: undefined,
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
