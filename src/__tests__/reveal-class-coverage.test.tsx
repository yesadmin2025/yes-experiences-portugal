/**
 * Reveal class coverage — `.reveal`, `.reveal-stagger`, `.section-enter`.
 *
 * For each animation class, verifies that:
 *   1. Every element actually receives the `.is-visible` class once
 *      claimed by the IntersectionObserver.
 *   2. The matching telemetry bucket (`reveal` for `.reveal` /
 *      `.reveal-stagger`, `sectionEnter` for `.section-enter`) records
 *      the correct totals and per-source counts.
 *   3. The two buckets are isolated — claiming a `.reveal` does not
 *      inflate the `sectionEnter` counters and vice versa.
 *   4. Mixed-class trees (all three classes on the page at once)
 *      partition cleanly: every element is counted in exactly one
 *      bucket and every element ends up `.is-visible`.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { act } from "react";

// SiteLayout pulls heavy children that we don't need for these tests.
vi.mock("@/components/Navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/FloatingActions", () => ({ FloatingActions: () => null }));
vi.mock("@/components/WhatsAppFab", () => ({ WhatsAppFab: () => null }));
vi.mock("@/components/MobileStickyCTA", () => ({ MobileStickyCTA: () => null }));
vi.mock("@/components/PostHeroAnnouncer", () => ({ PostHeroAnnouncer: () => null }));
vi.mock("@/lib/smooth-anchor-scroll", () => ({
  installSmoothAnchorScroll: () => () => {},
}));

import { SiteLayout } from "@/components/SiteLayout";

// Fake IntersectionObserver — captures every observed target. Each
// SiteLayout effect creates one observer; we keep them in registration
// order so tests can address the reveal vs section-enter observer.
class FakeIO {
  static instances: FakeIO[] = [];
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  targets = new Set<Element>();
  constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = cb;
    this.options = options;
    FakeIO.instances.push(this);
  }
  observe(t: Element) {
    this.targets.add(t);
  }
  unobserve(t: Element) {
    this.targets.delete(t);
  }
  disconnect() {
    this.targets.clear();
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  fire(entries: Partial<IntersectionObserverEntry>[]) {
    const full = entries.map(
      (e) =>
        ({
          isIntersecting: false,
          intersectionRatio: 0,
          time: 0,
          rootBounds: null,
          intersectionRect: { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRectReadOnly,
          ...e,
        }) as IntersectionObserverEntry,
    );
    this.callback(full, this as unknown as IntersectionObserver);
  }
  /** Fire intersect=true for every target this observer holds. */
  fireAllVisible() {
    this.fire(
      Array.from(this.targets).map((target) => ({
        target,
        isIntersecting: true,
        boundingClientRect: { top: 100, bottom: 200, left: 0, right: 100, width: 100, height: 100, x: 0, y: 100, toJSON: () => ({}) } as DOMRectReadOnly,
      })),
    );
  }
  static reset() {
    FakeIO.instances = [];
  }
}

const VH = 800;

beforeEach(() => {
  delete (window as unknown as { __yesRevealTelemetry?: unknown }).__yesRevealTelemetry;
  FakeIO.reset();
  vi.stubGlobal("IntersectionObserver", FakeIO as unknown as typeof IntersectionObserver);
  Object.defineProperty(window, "innerHeight", { value: VH, configurable: true });
  vi.stubGlobal(
    "matchMedia",
    (q: string) =>
      ({
        matches: false,
        media: q,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
  window.history.replaceState({}, "", "/");
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true, writable: true });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/**
 * In JSDOM every element returns a default rect of (0,0,0,0). The
 * initial sweep in SiteLayout treats this as "above the fold"
 * (`rect.top < vh * 0.95`) and immediately reveals + unobserves every
 * element. So tests don't need to fire IO entries — the sweepInitial
 * counter does the work, and we just assert `io + sweepInitial ==
 * total` (which holds whether the work was done by IO or by sweep).
 */

describe("reveal class coverage — .reveal / .reveal-stagger / .section-enter", () => {
  it(".reveal: each element gets .is-visible and lands in the `reveal` bucket", () => {
    const items = Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="reveal" data-kind="reveal" />
    ));
    render(<SiteLayout>{items}</SiteLayout>);

    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    expect(els).toHaveLength(3);

    // Initial sweep claims everything synchronously (default JSDOM
    // rect = 0,0,0,0 satisfies the on-screen check).

    const t = window.__yesRevealTelemetry!;
    expect(t.reveal.total).toBe(3);
    expect(t.reveal.io + t.reveal.sweepInitial).toBe(3);
    expect(t.reveal.pending).toBe(0);
    // Cross-bucket isolation: section-enter must stay untouched.
    expect(t.sectionEnter.total).toBe(0);
    expect(t.sectionEnter.io).toBe(0);
    expect(t.sectionEnter.sweepInitial).toBe(0);
    expect(t.sectionEnter.sweepDelayed).toBe(0);

    els.forEach((el) => expect(el.classList.contains("is-visible")).toBe(true));
  });

  it(".reveal-stagger: each element gets .is-visible, lands in `reveal` bucket, and receives a transition delay", () => {
    // Wrap stagger items in a parent so SiteLayout assigns sequential
    // delays based on sibling index.
    render(
      <SiteLayout>
        <section>
          <div className="reveal-stagger" data-i="0" />
          <div className="reveal-stagger" data-i="1" />
          <div className="reveal-stagger" data-i="2" />
        </section>
      </SiteLayout>,
    );

    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal-stagger"));
    expect(els).toHaveLength(3);

    // Initial sweep claims everything synchronously.

    const t = window.__yesRevealTelemetry!;
    expect(t.reveal.total).toBe(3);
    expect(t.reveal.io + t.reveal.sweepInitial).toBe(3);
    expect(t.reveal.pending).toBe(0);
    expect(t.sectionEnter.total).toBe(0);

    els.forEach((el) => expect(el.classList.contains("is-visible")).toBe(true));
    // Stagger cadence side-effect: each sibling gets a transitionDelay
    // proportional to its sibling index (0ms, 110ms, 220ms in
    // SiteLayout's current cadence). We assert monotonically
    // non-decreasing rather than exact values so cadence tweaks don't
    // break this test.
    const delays = els.map((el) => parseInt(el.style.transitionDelay || "0", 10));
    expect(delays[0]).toBe(0);
    expect(delays[1]).toBeGreaterThan(0);
    expect(delays[2]).toBeGreaterThanOrEqual(delays[1]);
  });

  it(".section-enter: each element gets .is-visible and lands in the `sectionEnter` bucket", () => {
    const sections = Array.from({ length: 2 }, (_, i) => (
      <section key={i} className="section-enter" data-kind="section" />
    ));
    render(<SiteLayout>{sections}</SiteLayout>);

    const els = Array.from(document.querySelectorAll<HTMLElement>(".section-enter"));
    expect(els).toHaveLength(2);

    // Initial sweep claims everything synchronously.

    const t = window.__yesRevealTelemetry!;
    expect(t.sectionEnter.total).toBe(2);
    expect(t.sectionEnter.io + t.sectionEnter.sweepInitial).toBe(2);
    expect(t.sectionEnter.pending).toBe(0);
    // Cross-bucket isolation: reveal bucket must stay at zero.
    expect(t.reveal.total).toBe(0);
    expect(t.reveal.io).toBe(0);
    expect(t.reveal.sweepInitial).toBe(0);
    expect(t.reveal.sweepDelayed).toBe(0);

    els.forEach((el) => expect(el.classList.contains("is-visible")).toBe(true));
  });

  it("mixed tree: counters partition cleanly across .reveal, .reveal-stagger and .section-enter", () => {
    render(
      <SiteLayout>
        <section className="section-enter">
          <div className="reveal" />
          <div className="reveal-stagger" />
          <div className="reveal-stagger" />
        </section>
        <section className="section-enter">
          <div className="reveal" />
        </section>
      </SiteLayout>,
    );

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal, .reveal-stagger"));
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".section-enter"));
    expect(reveals).toHaveLength(4);
    expect(sections).toHaveLength(2);

    // Initial sweeps for both observers claim everything synchronously
    // at mount under JSDOM's default rect of (0,0,0,0).

    const t = window.__yesRevealTelemetry!;
    // Per-class counter assertions:
    expect(t.reveal.total).toBe(4);
    expect(t.reveal.io + t.reveal.sweepInitial).toBe(4);
    expect(t.reveal.pending).toBe(0);
    expect(t.sectionEnter.total).toBe(2);
    expect(t.sectionEnter.io + t.sectionEnter.sweepInitial).toBe(2);
    expect(t.sectionEnter.pending).toBe(0);

    // Class-flip side-effect: every animated node ends up visible.
    [...reveals, ...sections].forEach((el) =>
      expect(el.classList.contains("is-visible")).toBe(true),
    );

    // Conservation check: the sum across both buckets equals the total
    // animated nodes — proving no element is double-counted and none
    // is missed.
    const totalClaimed =
      t.reveal.io +
      t.reveal.sweepInitial +
      t.reveal.sweepDelayed +
      t.sectionEnter.io +
      t.sectionEnter.sweepInitial +
      t.sectionEnter.sweepDelayed;
    expect(totalClaimed).toBe(reveals.length + sections.length);
  });
});
