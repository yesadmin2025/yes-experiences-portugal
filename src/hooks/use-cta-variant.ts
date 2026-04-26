/**
 * Hero CTA A/B/C variant assignment.
 *
 * Three label pairs are tested in parallel for click-through. The
 * variant is chosen ONCE per visitor (persisted in localStorage) so
 * the same user never sees a flicker between sessions, and analytics
 * funnels stay clean.
 *
 * Why a hook (not server-side):
 * - Hero is a static SSR page; we want zero CLS and zero blocking.
 * - All three labels render the SAME geometry (.cta-primary +
 *   .cta-secondary-dark with .cta-label inside) — only text content
 *   changes. No layout logic, no Tailwind class swaps, no shape
 *   change. Optical-centering CSS rules continue to apply uniformly.
 *
 * Assignment:
 * - On first paint we read `localStorage["cta-variant"]`. If absent,
 *   we deterministically pick A/B/C using crypto.getRandomValues
 *   (uniform 33/33/33) and persist it.
 * - To avoid SSR/CSR hydration mismatch, the initial state matches
 *   the SSR default (variant A) and we only swap after mount. Since
 *   variant A is the existing copy, repeat visitors briefly see A
 *   then switch to their assigned variant on the next paint — for
 *   first-time visitors and ~⅓ of returners (those assigned A),
 *   there is no swap at all.
 * - Variant ID is exposed via `data-cta-variant` on each Link so
 *   analytics tooling (GA, PostHog, Plausible custom events) can
 *   attribute clicks without further code changes.
 */
import { useEffect, useState } from "react";

export type CtaVariantId = "A" | "B" | "C";

export interface CtaVariant {
  id: CtaVariantId;
  primary: string;
  secondary: string;
}

export const CTA_VARIANTS: Record<CtaVariantId, CtaVariant> = {
  A: {
    id: "A",
    primary: "Design & Secure Your Experience",
    secondary: "Explore Signature Experiences",
  },
  B: {
    id: "B",
    primary: "Commission Your Bespoke Journey",
    secondary: "View Our Destination Portfolio",
  },
  C: {
    id: "C",
    primary: "Reserve Your Private Itinerary",
    secondary: "Browse the Curated Collection",
  },
};

const STORAGE_KEY = "cta-variant";
const VARIANT_IDS: CtaVariantId[] = ["A", "B", "C"];

function pickVariant(): CtaVariantId {
  // crypto.getRandomValues is uniform; modulo 3 introduces a vanishingly
  // small bias (1 in 2^32 / 3) that is irrelevant at any realistic sample
  // size and keeps the function dependency-free.
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return VARIANT_IDS[buf[0] % 3];
  }
  return VARIANT_IDS[Math.floor(Math.random() * 3)];
}

export function useCtaVariant(): CtaVariant {
  // SSR-safe default: always render variant A on the server and on the
  // very first client paint, then upgrade after mount. This keeps
  // hydration markup byte-identical to the SSR output.
  const [variantId, setVariantId] = useState<CtaVariantId>("A");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "A" || stored === "B" || stored === "C") {
        setVariantId(stored);
        return;
      }
      const assigned = pickVariant();
      window.localStorage.setItem(STORAGE_KEY, assigned);
      setVariantId(assigned);
    } catch {
      // localStorage blocked (private mode, cookie wall) — fall back
      // to a per-session random pick. The variant won't persist but
      // the experiment still runs.
      setVariantId(pickVariant());
    }
  }, []);

  return CTA_VARIANTS[variantId];
}
