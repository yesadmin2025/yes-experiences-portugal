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
  eyebrow: "PRIVATE · LOCAL · INSTANTLY YOURS",
  headlineLine1: "Your Portugal story",
  headlineLine2: "starts here.",
  subheadline:
    "Choose the places, pace and moments that feel right — from private days to celebrations, groups and full journeys. Guided by local knowledge. Confirmed instantly.",
  primaryCta: "Create Your Story",
  secondaryCta: "Explore Signature Experiences",
  microcopy: "No forms. No waiting. Real-time guidance if you want it.",
} as const;

export type HeroSpecKey = keyof typeof HERO_COPY_SPEC;
