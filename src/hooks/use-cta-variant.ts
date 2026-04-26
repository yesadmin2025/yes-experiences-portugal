// Stub kept for backwards compatibility with cached module graphs.
// The hero CTA variant A/B/C system was removed; consumers default to variant A.
const VARIANTS = {
  A: { id: "A", primary: "Design & Secure Your Experience", secondary: "Explore Signature Experiences" },
  B: { id: "B", primary: "Commission Your Bespoke Journey", secondary: "View Our Destination Portfolio" },
  C: { id: "C", primary: "Reserve Your Private Itinerary", secondary: "Browse the Curated Collection" },
} as const;

export type CtaVariant = (typeof VARIANTS)[keyof typeof VARIANTS];

export function useCtaVariant(): CtaVariant {
  return VARIANTS.A;
}
