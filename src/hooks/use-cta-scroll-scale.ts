import { useEffect, useRef } from "react";

export type CtaScrollScaleOptions = {
  /** Scale at scrollY = 0. Default 0.96. */
  from?: number;
  /** Scale at scrollY ≥ distance. Default 1.015. */
  to?: number;
  /** Scroll distance (px) over which the ramp completes. Default 280. */
  distance?: number;
  /**
   * If true, the hook reads `--cta-scroll-from`, `--cta-scroll-to`, and
   * `--cta-scroll-distance` from the element's computed style and lets
   * them override the JS defaults. Re-reads on every rAF tick so you can
   * tweak from devtools and see it live. Default true.
   */
  readFromCss?: boolean;
};

/**
 * useCtaScrollScale — writes a single CSS variable `--cta-scroll-scale`
 * on the target element that ramps from `from` (at scrollY = 0) to `to`
 * (at scrollY ≥ `distance`). Pure presentational scroll cue used by the
 * hero CTAs to grow subtly as the user begins exploring.
 *
 * Configuration model:
 *  • Pass `from`, `to`, `distance` as props for the canonical defaults.
 *  • OR override at any CSS scope with `--cta-scroll-from`, `--cta-scroll-to`,
 *    `--cta-scroll-distance`. CSS wins when present so designers can
 *    retune the drift window without touching the hook.
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
 *  • Respects prefers-reduced-motion (pins to `to` so layout is stable).
 *  • Does NOT change classes — only sets a CSS variable consumed by transform.
 */
export function useCtaScrollScale<T extends HTMLElement = HTMLElement>(
  fromOrOptions: number | CtaScrollScaleOptions = 0.96,
  to = 1.015,
  distance = 280,
) {
  const ref = useRef<T | null>(null);

  // Normalise the two call signatures into a single options object.
  const opts: Required<CtaScrollScaleOptions> =
    typeof fromOrOptions === "object"
      ? {
          from: fromOrOptions.from ?? 0.96,
          to: fromOrOptions.to ?? 1.015,
          distance: fromOrOptions.distance ?? 280,
          readFromCss: fromOrOptions.readFromCss ?? true,
        }
      : { from: fromOrOptions, to, distance, readFromCss: true };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Resolve a numeric CSS var, falling back to the JS default. */
    const readVar = (name: string, fallback: number) => {
      if (!opts.readFromCss) return fallback;
      const raw = getComputedStyle(el).getPropertyValue(name).trim();
      if (!raw) return fallback;
      const n = parseFloat(raw);
      return Number.isFinite(n) ? n : fallback;
    };

    if (reduceMotion) {
      const to = readVar("--cta-scroll-to", opts.to);
      el.style.setProperty("--cta-scroll-scale", String(to));
      return;
    }

    let rafId = 0;
    let pending = false;

    const apply = () => {
      pending = false;
      const from = readVar("--cta-scroll-from", opts.from);
      const to = readVar("--cta-scroll-to", opts.to);
      const distance = Math.max(1, readVar("--cta-scroll-distance", opts.distance));

      // Hard min/max so float drift or overscroll can never escape the
      // design envelope. Sorted defensively in case someone passes
      // from > to (shrink-on-scroll).
      const lo = Math.min(from, to);
      const hi = Math.max(from, to);

      const y = Math.max(0, Math.min(distance, window.scrollY));
      const t = y / distance;
      // Smoothstep — symmetric ease-in-out, C¹-continuous at both ends.
      // Softer takeoff than ease-out cubic; the button drifts up rather
      // than springing.
      const eased = t * t * (3 - 2 * t);
      const raw = from + (to - from) * eased;
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
  }, [opts.from, opts.to, opts.distance, opts.readFromCss]);

  return ref;
}
