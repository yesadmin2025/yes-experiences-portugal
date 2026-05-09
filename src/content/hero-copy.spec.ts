/**
 * FROZEN HERO COPY SPEC — approved wording for the final hero chapter.
 */
export const HERO_COPY_SPEC = {
  eyebrow: "BUILD IT LIVE",
  headlineLine1: "Build it live.",
  headlineLine2: "Confirm instantly.",
  subheadline: "Real local guidance whenever you want it.",
  primaryCta: "Create Your Story",
  secondaryCta: "Explore Signature Experiences",
  microcopy: "Instant booking. No forms. No waiting.",
} as const;

export type HeroSpecKey = keyof typeof HERO_COPY_SPEC;
