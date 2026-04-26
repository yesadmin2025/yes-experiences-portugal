import { useEffect, useRef } from "react";

/**
 * useCtaScrollScale — writes a single CSS variable `--cta-scroll-scale`
 * on the target element that ramps from `from` (at scrollY = 0) to `to`
 * (at scrollY ≥ `distance`). Pure presentational scroll cue used by the
 * hero CTAs to grow subtly as the user begins exploring.
 *
 * Constraints:
 *  • rAF-throttled, single passive scroll listener.
 *  • No layout reads beyond window.scrollY → no thrash.
 *  • Respects prefers-reduced-motion (pins to `to` so layout is stable).
 *  • Does NOT change classes — only sets a CSS variable consumed by transform.
 */
export function useCtaScrollScale<T extends HTMLElement = HTMLElement>(
  from = 0.94,
  to = 1.02,
  distance = 220,
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

    let rafId = 0;
    let pending = false;

    const apply = () => {
      pending = false;
      const y = Math.max(0, Math.min(distance, window.scrollY));
      const t = y / distance;
      // Ease-out cubic — quick early growth, soft settle.
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (to - from) * eased;
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
