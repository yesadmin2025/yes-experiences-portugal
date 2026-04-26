import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

/**
 * MobileStickyCTA
 *
 * A calm, premium sticky CTA bar shown only on small screens (< lg) once the
 * user has scrolled past the hero (~600px). It slides up from the bottom with
 * a slow, restrained motion that matches the rest of the homepage cadence,
 * and tracks "design & secure" intent on tap so we can measure conversion.
 *
 * Intent tracking strategy
 * ------------------------
 * Many analytics stacks may be present (GA4 via gtag, GTM via dataLayer, or
 * neither yet). We push to all available channels safely — no hard
 * dependencies, no console errors if nothing is wired up — and we also fire
 * a DOM CustomEvent ("yes:cta_intent") so any future tracking layer can
 * subscribe without us needing to re-touch this component.
 */

type IntentDetail = {
  cta: "design_secure";
  surface: "mobile_sticky";
  path: string;
  scroll_y: number;
  ts: number;
};

type GtagFn = (
  command: "event",
  eventName: string,
  params?: Record<string, unknown>,
) => void;

type DataLayerEntry = Record<string, unknown>;

interface TrackingWindow extends Window {
  dataLayer?: DataLayerEntry[];
  gtag?: GtagFn;
}

function trackIntent(detail: IntentDetail) {
  if (typeof window === "undefined") return;
  const w = window as TrackingWindow;

  // 1) GTM / dataLayer — push a structured event other tags can listen for.
  try {
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({
        event: "cta_intent",
        ...detail,
      });
    }
  } catch {
    /* swallow — tracking must never break UX */
  }

  // 2) GA4 / gtag — direct event for sites wired straight to gtag.
  try {
    if (typeof w.gtag === "function") {
      w.gtag("event", "cta_intent", detail);
    }
  } catch {
    /* noop */
  }

  // 3) DOM CustomEvent — open hook for any future analytics layer.
  try {
    window.dispatchEvent(new CustomEvent<IntentDetail>("yes:cta_intent", { detail }));
  } catch {
    /* noop */
  }
}

export function MobileStickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only on small screens — match Tailwind's lg breakpoint (1024px).
    const mqDesktop = window.matchMedia("(min-width: 1024px)");

    // Persist "passed hero" intent across navigations (incl. back/forward
    // and BFCache restores) via sessionStorage. Once the user has scrolled
    // past the hero anywhere on the site, the sticky CTA stays available
    // when they return — they've already proven they're past the fold.
    const STORAGE_KEY = "yes:passedHero";
    const HERO_THRESHOLD = 600;

    const readPersisted = (): boolean => {
      try {
        return window.sessionStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        return false;
      }
    };

    const markPersisted = () => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* storage may be blocked — fail silently */
      }
    };

    const evaluate = () => {
      // Hide entirely on desktop regardless of scroll position.
      if (mqDesktop.matches) {
        setVisible(false);
        return;
      }

      const pastHeroNow = window.scrollY > HERO_THRESHOLD;
      if (pastHeroNow) {
        markPersisted();
        setVisible(true);
        return;
      }

      // Not currently past the hero, but if the user has already crossed
      // it earlier in this session (and is now returning via back/forward
      // or a BFCache restore), keep the CTA visible.
      setVisible(readPersisted());
    };

    // pageshow fires on initial load AND on BFCache restores — perfect
    // hook for "remember where the user was" behavior.
    const onPageShow = () => evaluate();

    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("pageshow", onPageShow);
    mqDesktop.addEventListener?.("change", evaluate);
    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("pageshow", onPageShow);
      mqDesktop.removeEventListener?.("change", evaluate);
    };
  }, []);

  // Submit-lock: prevents double-taps from firing two navigations or two
  // analytics events. Mirrored in a ref so synchronous click handlers can
  // gate-check without waiting for a re-render.
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  // Watch the router's loading state — once navigation completes (or fails),
  // re-enable the button. A short safety-net timeout also re-enables the
  // CTA if for any reason routing never settles, so the bar never gets
  // stuck disabled.
  const isRouterLoading = useRouterState({
    select: (s) => s.isLoading || s.status === "pending",
  });

  useEffect(() => {
    if (!submitting) return;
    if (!isRouterLoading) {
      // Router has settled — release the lock on the next tick so any
      // synchronous re-tap from the same gesture is still suppressed.
      const t = window.setTimeout(() => {
        submittingRef.current = false;
        setSubmitting(false);
      }, 50);
      return () => window.clearTimeout(t);
    }
    // Safety net — never leave the button disabled longer than 4s.
    const safety = window.setTimeout(() => {
      submittingRef.current = false;
      setSubmitting(false);
    }, 4000);
    return () => window.clearTimeout(safety);
  }, [submitting, isRouterLoading]);

  // BFCache restore: if the user comes back via back/forward, reset the
  // lock so the CTA is interactive again immediately.
  useEffect(() => {
    const onPageShow = () => {
      submittingRef.current = false;
      setSubmitting(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handleIntent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Block the second (and Nth) tap entirely — no navigation, no analytics.
    if (submittingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);

    trackIntent({
      cta: "design_secure",
      surface: "mobile_sticky",
      path: typeof window !== "undefined" ? window.location.pathname : "/",
      scroll_y: typeof window !== "undefined" ? Math.round(window.scrollY) : 0,
      ts: Date.now(),
    });
  };

  return (
    <div
      // Pinned to the bottom on mobile only. Honors iOS safe-area insets so
      // the bar sits cleanly above the home indicator.
      className={[
        "lg:hidden fixed inset-x-0 bottom-0 z-40 print:hidden",
        "transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] will-change-transform",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-6 pointer-events-none",
      ].join(" ")}
      // Belt-and-braces a11y when the bar is hidden by scroll:
      //   • aria-hidden  → screen readers skip the subtree
      //   • inert        → removes every descendant from focus order, hit
      //                    testing, and the accessibility tree in one shot
      //                    (so the inner <Link> can't be tabbed to or
      //                    activated by AT even if pointer-events leaks)
      //   • pointer-events-none on the wrapper above blocks pointer input
      // React 19 forwards the `inert` boolean attribute natively.
      aria-hidden={!visible}
      inert={!visible}
    >
      {/* Soft gradient scrim above the bar — keeps the CTA legible against
          any underlying section without a hard edge. */}
      <div className="h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      <div
        className="bg-white border-t border-[color:var(--gold)]/30 shadow-[0_-8px_28px_-18px_rgba(15,23,42,0.18)]"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Left — restrained brand microcopy. Charcoal-soft, never gold. */}
          <div className="min-w-0 flex-1">
            <p className="serif text-[15px] leading-tight text-[color:var(--charcoal)] truncate">
              Your private Portugal experience
            </p>
            <p className="text-[10.5px] uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)] mt-0.5">
              Instant confirmation
            </p>
          </div>

          {/* CTA — matches the desktop primary action exactly.
              While submitting: pointer-events blocked, opacity dimmed,
              aria-disabled set, and the click handler short-circuits any
              extra taps. The visual change is calm — no spinner — to
              preserve the premium feel; the small dot turns into a thin
              progress hint via opacity only. */}
          <Link
            to="/builder"
            onClick={handleIntent}
            tabIndex={visible && !submitting ? 0 : -1}
            aria-disabled={submitting}
            aria-busy={submitting}
            data-cta="design_secure"
            data-cta-surface="mobile_sticky"
            data-state={submitting ? "submitting" : "idle"}
            className={[
              "group inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-white",
              "border border-[color:var(--gold)]/70 px-4 py-3 text-[10.5px] tracking-[0.2em] uppercase whitespace-nowrap",
              "transition-[opacity,background-color] duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              submitting
                ? "opacity-70 pointer-events-none cursor-default"
                : "",
            ].join(" ")}
            aria-label="Design and secure your experience"
          >
            {submitting ? "Opening…" : "Design \u0026 Secure"}
            <ArrowRight
              size={13}
              className={[
                "transition-transform duration-300",
                submitting ? "translate-x-0.5" : "group-hover:translate-x-0.5",
              ].join(" ")}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
