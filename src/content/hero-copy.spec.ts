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
  eyebrow: "REAL-TIME · YOURS · INSTANT",
  headlineLine1: "Portugal is the stage,",
  headlineLine2: "you write your story.",
  subheadline:
    "Choose the places, pace and moments in real time — from private days to celebrations, groups and full journeys. Local guidance whenever you want it. Confirmed instantly.",
  primaryCta: "Create Your Story",
  secondaryCta: "Explore Signature Experiences",
  microcopy: "You shape it in real time. Confirmed instantly. Local guidance on demand.",
} as const;

export type HeroSpecKey = keyof typeof HERO_COPY_SPEC;
