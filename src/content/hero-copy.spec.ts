/**
 * FROZEN HERO COPY SPEC — approved wording.
 *
 * Do NOT edit these strings without an explicit product sign-off. The verifier
 * at `/api/verify-hero` asserts that the live `HERO_COPY` source matches this
 * spec verbatim AND that every published page renders these exact strings.
 *
 * Goals encoded in this spec:
 *  - Instant booking tone (no forms, no waiting, no email requests)
 *  - Guided by a real local person
 *  - Intimate, premium, human voice
 *  - Covers any occasion (days, journeys, proposals, celebrations, groups)
 *  - Real-time human guidance always available
 */
export const HERO_COPY_SPEC = {
  eyebrow: "PRIVATE · BY LOCALS · ANY OCCASION",
  headlineLine1: "Portugal is the stage.",
  headlineLine2: "You write the story.",
  subheadline:
    "Designed by you, at your rhythm — for a private day, a celebration or a full journey, guided by local knowledge.",
  primaryCta: "Create Your Story",
  secondaryCta: "Explore Signature Experiences",
  microcopy: "Instant confirmation. No forms. No waiting.",
} as const;

export type HeroSpecKey = keyof typeof HERO_COPY_SPEC;
