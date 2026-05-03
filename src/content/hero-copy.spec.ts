/**
 * FROZEN HERO COPY SPEC — approved wording.
 *
 * Do NOT edit these strings without an explicit product sign-off. The verifier
 * at `/api/verify-hero` asserts that the live `HERO_COPY` source matches this
 * spec verbatim AND that every published page renders these exact strings.
 *
 * Goals encoded in this spec:
 *  - Real-time shaping by the client (control)
 *  - Instant confirmation (no forms, no waiting, no email approvals)
 *  - Local guidance available on demand, never required
 *  - Covers any occasion (days, journeys, proposals, celebrations, groups)
 */
export const HERO_COPY_SPEC = {
  eyebrow: "PRIVATE · BY LOCALS · YOUR WAY",
  headlineLine1: "Portugal is the stage.",
  headlineLine2: "You write the story.",
  subheadline:
    "Choose the places, pace and moments that feel right — from private days to celebrations, groups and full journeys — with local guidance whenever you want it. Confirm instantly.",
  primaryCta: "Create Your Story",
  secondaryCta: "Explore Signature Experiences",
  microcopy: "Create it in real time. Confirm instantly. A local guide is here if you need one.",
} as const;

export type HeroSpecKey = keyof typeof HERO_COPY_SPEC;
