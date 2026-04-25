import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingActions } from "./FloatingActions";

export function SiteLayout({ children }: { children: ReactNode }) {
  // Reveal-on-scroll with a consistent, calm stagger rhythm.
  // Siblings sharing a parent reveal sequentially at a fixed cadence so
  // every section across the page breathes at the same pace.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-stagger");
    if (!els.length) return;

    if (
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
          if (
            target.classList.contains("reveal-stagger") &&
            !target.style.transitionDelay
          ) {
            const idx = indexByEl.get(target) ?? 0;
            target.style.transitionDelay = `${idx * STAGGER_MS}ms`;
          }
          target.classList.add("is-visible");
          io.unobserve(target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -80px 0px" },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
