import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingActions } from "./FloatingActions";
import { WhatsAppFab } from "./WhatsAppFab";
import { MobileStickyCTA } from "./MobileStickyCTA";
import { PostHeroAnnouncer } from "./PostHeroAnnouncer";
import { installSmoothAnchorScroll } from "@/lib/smooth-anchor-scroll";
import {
  applyScrollDebugClasses,
  getScrollDebugFlags,
  reportScrollDebug,
} from "@/lib/scroll-debug";

export function SiteLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const flags = getScrollDebugFlags();
    if (!flags.enabled) return;
    applyScrollDebugClasses(flags);
    const timer = window.setTimeout(() => reportScrollDebug(), 500);
    return () => window.clearTimeout(timer);
  }, []);

  // Smooth anchor scroll with navbar offset — covers every <a href="#…">
  // on every page so jumps land cleanly below the fixed header rather
  // than getting clipped under it. Reduced-motion safe.
  useEffect(() => installSmoothAnchorScroll(), []);

  // Reveal-on-scroll with a consistent, calm stagger rhythm.
  // Siblings sharing a parent reveal sequentially at a fixed cadence so
  // every section across the page breathes at the same pace.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-stagger");
    if (!els.length) return;

    const flags = getScrollDebugFlags();
    const mobileRevealsDisabled =
      flags.disableMobileReveals && window.matchMedia("(max-width: 767.98px)").matches;

    if (
      mobileRevealsDisabled ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    // Unified cadence — small enough to feel continuous, slow enough to read.
    const STAGGER_MS = 110;
    const MAX_STEPS = 8; // cap so late items don't drift too far behind

    // Pre-assign a stagger index to every .reveal-stagger element based on
    // its position among same-class siblings under the same parent. This
    // guarantees a consistent rhythm without requiring inline delays.
    const staggerEls = document.querySelectorAll<HTMLElement>(".reveal-stagger");
    const indexByEl = new WeakMap<HTMLElement, number>();
    const groups = new Map<HTMLElement, HTMLElement[]>();
    staggerEls.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const arr = groups.get(parent) ?? [];
      arr.push(el);
      groups.set(parent, arr);
    });
    groups.forEach((items) => {
      items.forEach((el, i) => indexByEl.set(el, Math.min(i, MAX_STEPS)));
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          // Only apply our cadence when no inline delay is already set, so
          // route-level overrides still win.
          if (target.classList.contains("reveal-stagger") && !target.style.transitionDelay) {
            const idx = indexByEl.get(target) ?? 0;
            target.style.transitionDelay = `${idx * STAGGER_MS}ms`;
          }
          target.classList.add("is-visible");
          io.unobserve(target);
        });
      },
      { threshold: 0.14, rootMargin: "0px" },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Dedicated observer for `.section-enter` wrappers. Fires earlier than
  // the staggered-reveal observer above (rootMargin -8% bottom, very low
  // threshold) so tall sections in narrow mobile viewports begin their
  // calm fade-in as soon as the top edge appears, instead of waiting for
  // 14% of a 1000px+ section to be on screen — that delay was the main
  // cause of "section snaps in late" on mobile scroll. Opacity-only on
  // the CSS side ensures this never duplicates the inner reveals'
  // translateY rhythm.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll<HTMLElement>(".section-enter");
    if (!els.length) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Reveal both when the section is intersecting AND when it has
          // already scrolled past (bottom ≤ 0). The latter handles fast
          // fling-scroll on mobile where a tall section can leave the
          // viewport before the first callback fires — without this
          // guard the section would stay at opacity:0 forever.
          const passed = entry.boundingClientRect.bottom <= 0;
          if (!entry.isIntersecting && !passed) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.02, rootMargin: "0px 0px -8% 0px" },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingActions />
      <WhatsAppFab />
      <MobileStickyCTA />
      {/* Single polite SR announcer — fires once per tab when the user
          first scrolls past the hero, giving screen-reader users parity
          with sighted users who see the post-hero CTA surfaces appear. */}
      <PostHeroAnnouncer />
    </div>
  );
}
