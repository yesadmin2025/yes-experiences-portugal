import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

/**
 * FloatingActions
 *  - Subtle floating CTA ("Start Your Experience") — always visible.
 *  - Scroll-to-top button — appears once the user has scrolled past ~600px.
 * Both are stacked in the bottom-right and stay out of the way on mobile.
 */
export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div
      className="fixed right-5 md:right-8 z-40 flex flex-col items-end gap-3 print:hidden bottom-24 md:bottom-8"
      // On mobile, sit above the MobileStickyCTA bar (≈64px + iOS safe-area).
      // The lg+ floating pill keeps its original bottom-8 spacing.
      style={{ bottom: undefined }}
    >
      {/* Floating CTA — hidden on mobile (< lg) where MobileStickyCTA owns
          the primary call-to-action surface. Visible from lg up so desktop
          users still get the persistent "Start Your Experience" anchor. */}
      <Link
        to="/builder"
        aria-label="Start your experience"
        className="hidden lg:inline-flex group items-center gap-2 rounded-full border border-[color:var(--teal)]/60 bg-[color:var(--ivory)]/95 backdrop-blur-md px-5 py-2.5 text-[12px] uppercase tracking-[0.18em] text-[color:var(--teal)] shadow-[0_8px_24px_-12px_rgba(41,91,97,0.35)] hover:-translate-y-0.5 hover:border-[color:var(--teal)] hover:bg-[color:var(--teal)] hover:text-[color:var(--ivory)] transition-all duration-500"
      >
        Start Your Experience
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-[color:var(--gold)] group-hover:bg-[color:var(--ivory)] transition-colors duration-500"
        />
      </Link>

      {/* Scroll to top */}
      <button
        type="button"
        onClick={scrollTop}
        aria-label="Scroll to top"
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        className={
          "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--ivory)]/95 backdrop-blur-md text-[color:var(--charcoal)] shadow-[0_6px_18px_-10px_rgba(46,46,46,0.35)] transition-all duration-500 hover:-translate-y-0.5 hover:border-[color:var(--teal)]/60 hover:text-[color:var(--teal)] " +
          (showTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-2 pointer-events-none")
        }
      >
        <ArrowUp size={16} strokeWidth={1.6} />
      </button>
    </div>
  );
}
