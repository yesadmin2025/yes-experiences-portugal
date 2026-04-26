import { useEffect, useRef } from "react";

/**
 * useCtaScrollScale — writes a single CSS variable `--cta-scroll-scale`
 * on the target element that ramps from `from` (at scrollY = 0) to `to`
 * (at scrollY ≥ `distance`). Pure presentational scroll cue used by the
 * hero CTAs to grow subtly as the user begins exploring.
 *
 * Design notes:
 *  • Easing is a smoothstep-style symmetric ease-in-out (`t² · (3 − 2t)`)
 *    rather than a hard ease-out cubic. The growth is gentler at both
 *    ends — no sudden lurch off the rest scale, no abrupt settle — which
 *    reads as "premium drift" rather than "bounce".
 *  • Output is hard-clamped to the `[from, to]` window so subpixel float
 *    drift, overscroll, or rubber-band scrolling can never push the
 *    scale outside the design envelope.
 *
 * Constraints:
 *  • rAF-throttled, single passive scroll listener.
 *  • No layout reads beyond window.scrollY → no thrash.
 *  • Respects prefers-reduced-motion (pins to `to` so layout is stable).
 *  • Does NOT change classes — only sets a CSS variable consumed by transform.
 */
export function useCtaScrollScale<T extends HTMLElement = HTMLElement>(
  from = 0.96,
  to = 1.015,
  distance = 280,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      el.style.setProperty("--cta-scroll-scale", String(to));
      return;
    }

    // Hard min/max so float drift or overscroll can never escape the
    // design envelope. Sorted defensively in case a caller passes
    // from > to (e.g. shrink-on-scroll).
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);

    let rafId = 0;
    let pending = false;

    const apply = () => {
      pending = false;
      const y = Math.max(0, Math.min(distance, window.scrollY));
      const t = y / distance;
      // Smoothstep — symmetric ease-in-out, C¹-continuous at both ends.
      // Softer takeoff than ease-out cubic; the button drifts up rather
      // than springing.
      const eased = t * t * (3 - 2 * t);
      const raw = from + (to - from) * eased;
      // Clamp to the design envelope.
      const value = Math.max(lo, Math.min(hi, raw));
      el.style.setProperty("--cta-scroll-scale", value.toFixed(4));
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [from, to, distance]);

  return ref;
}
