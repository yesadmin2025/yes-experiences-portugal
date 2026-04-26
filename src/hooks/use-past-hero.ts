import { useEffect, useState } from "react";

/**
 * Shared single source-of-truth for "the user has scrolled past the hero
 * and our post-hero CTA surfaces should now be available".
 *
 * Both <MobileStickyCTA> and <FloatingActions> consume this hook so the
 * threshold, persistence, BFCache handling, and reveal moment stay in
 * lockstep. Change it once here and every post-hero surface follows.
 *
 * Behavior
 * --------
 * • Returns true once `window.scrollY` exceeds `threshold` (default 600px).
 * • Persists the "passed hero" flag in sessionStorage so that on back/
 *   forward navigation or a BFCache restore the user is still considered
 *   past the hero — they've already proven they're engaged in this session.
 * • Re-evaluates on `pageshow` (fires for both initial load and BFCache
 *   restores).
 * • SSR-safe: starts `false` on the server; hydrates to the real value
 *   after mount so the first server-rendered HTML matches the client.
 * • Fires a one-time `yes:past_hero` DOM CustomEvent the first time the
 *   threshold is crossed in this tab. The accessible-announcer hook
 *   listens for it to deliver a polite SR notification exactly once.
 *
 * Why a custom event instead of a useEffect on the consumer
 * ---------------------------------------------------------
 * Multiple components share this hook. If each consumer also wired up its
 * own "first true" useEffect, we'd announce N times. Centralising the
 * "first crossing" signal in the hook itself + a single global event keeps
 * the announcement guaranteed to be one-shot per session/tab.
 */

const STORAGE_KEY = "yes:passedHero";
/** One-shot event name. Listeners can subscribe via `window.addEventListener`. */
export const PAST_HERO_EVENT = "yes:past_hero";

export type UsePastHeroOptions = {
  /** Scroll threshold in px. Default 600. */
  threshold?: number;
  /**
   * Optional media query that must match for the hook to ever return true.
   * Used by MobileStickyCTA, which only activates below the lg breakpoint.
   * Default: undefined (always active).
   */
  mediaQuery?: string;
};

function readPersisted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markPersisted() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* storage may be blocked — fail silently */
  }
}

/**
 * Module-scoped guard so the `yes:past_hero` event is dispatched at most
 * once per tab (across multiple consumers and across re-renders).
 */
let didAnnouncePastHero = false;

function dispatchPastHeroOnce() {
  if (typeof window === "undefined" || didAnnouncePastHero) return;
  didAnnouncePastHero = true;
  try {
    window.dispatchEvent(new CustomEvent(PAST_HERO_EVENT));
  } catch {
    /* noop */
  }
}

export function usePastHero({ threshold = 600, mediaQuery }: UsePastHeroOptions = {}) {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = mediaQuery ? window.matchMedia(mediaQuery) : null;

    const evaluate = () => {
      // Media-query gate (e.g. mobile-only). When it doesn't match, the
      // hook reports false regardless of scroll — the consumer is hidden
      // entirely at this breakpoint.
      if (mq && !mq.matches) {
        setPastHero(false);
        return;
      }

      const pastNow = window.scrollY > threshold;
      if (pastNow) {
        markPersisted();
        dispatchPastHeroOnce();
        setPastHero(true);
        return;
      }

      // Not currently past the threshold, but if the user crossed it
      // earlier in this session (and is now returning via back/forward
      // or a BFCache restore), keep the surfaces available.
      const persisted = readPersisted();
      if (persisted) dispatchPastHeroOnce();
      setPastHero(persisted);
    };

    // pageshow fires on initial load AND on BFCache restores — a clean
    // hook for "remember where the user was" behavior.
    const onPageShow = () => evaluate();

    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("pageshow", onPageShow);
    mq?.addEventListener?.("change", evaluate);
    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("pageshow", onPageShow);
      mq?.removeEventListener?.("change", evaluate);
    };
  }, [threshold, mediaQuery]);

  return pastHero;
}
