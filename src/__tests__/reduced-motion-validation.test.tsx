/**
 * Reduced-motion validation.
 *
 * Contract:
 *   - When `prefers-reduced-motion: reduce` is true, every reveal-class
 *     element MUST be visible immediately on mount (no waiting for IO,
 *     no waiting for the 1200ms fail-safe). Reduced-motion users must
 *     never stare at opacity:0 content.
 *   - When `prefers-reduced-motion: reduce` is FALSE, elements must NOT
 *     be force-marked visible at mount — they should wait for the IO
 *     (or sweep / fail-safe). This guards against accidentally treating
 *     normal users as reduced-motion.
 *   - Debug flags must NOT permanently disable motion: removing the QA
 *     flag from the URL between renders must restore normal behavior.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup, act } from "@testing-library/react";

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

class DeadIO {
  constructor(_cb: IntersectionObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function makeMatchMedia(map: Record<string, boolean>) {
  return (q: string): MediaQueryList =>
    ({
      matches: map[q] ?? false,
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

beforeEach(() => {
  delete (window as unknown as { __yesRevealTelemetry?: unknown }).__yesRevealTelemetry;
  vi.useFakeTimers();
  vi.stubGlobal("IntersectionObserver", DeadIO as unknown as typeof IntersectionObserver);
  Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true, writable: true });
  window.history.replaceState({}, "", "/");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("reduced-motion validation", () => {
  it("reduced-motion users get .is-visible immediately (synchronously after mount)", () => {
    vi.stubGlobal(
      "matchMedia",
      makeMatchMedia({ "(prefers-reduced-motion: reduce)": true }),
    );

    const { container } = render(
      <SiteLayout>
        <div className="reveal" data-testid="r1">a</div>
        <div className="reveal-stagger" data-testid="r2">b</div>
        <section className="section-enter" data-testid="s1">c</section>
      </SiteLayout>,
    );

    // No timers advanced — must already be visible.
    const targets = container.querySelectorAll(".reveal, .reveal-stagger, .section-enter");
    expect(targets.length).toBe(3);
    targets.forEach((el) => {
      expect(
        el.classList.contains("is-visible"),
        `${el.className} must be visible immediately under prefers-reduced-motion`,
      ).toBe(true);
    });
  });

  it("normal-motion users do NOT get force-visible at mount (waits for IO/sweep/fail-safe)", () => {
    vi.stubGlobal(
      "matchMedia",
      makeMatchMedia({ "(prefers-reduced-motion: reduce)": false, "(max-width: 767.98px)": false }),
    );
    // Make jsdom's getBoundingClientRect return an OFF-SCREEN rect so the
    // initial sweep doesn't catch the elements. We want to prove that
    // the reduced-motion shortcut isn't accidentally firing for normal users.
    const origGetRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      return {
        top: 5000,
        bottom: 5400,
        left: 0,
        right: 100,
        width: 100,
        height: 400,
        x: 0,
        y: 5000,
        toJSON: () => ({}),
      } as DOMRect;
    };

    try {
      const { container } = render(
        <SiteLayout>
          <div className="reveal" data-testid="r1">a</div>
          <section className="section-enter" data-testid="s1">b</section>
        </SiteLayout>,
      );

      // Right after mount: nothing should be is-visible yet (IO is dead,
      // elements are off-screen, fail-safe hasn't run).
      const targets = container.querySelectorAll(".reveal, .section-enter");
      const earlyVisible = Array.from(targets).filter((el) =>
        el.classList.contains("is-visible"),
      );
      expect(
        earlyVisible.length,
        "Normal-motion users must not be treated as reduced-motion at mount",
      ).toBe(0);

      // After the fail-safe budget (1200ms), they ARE visible — proving
      // the system still rescues them.
      act(() => {
        vi.advanceTimersByTime(1200);
      });
      targets.forEach((el) => {
        expect(el.classList.contains("is-visible")).toBe(true);
      });
    } finally {
      Element.prototype.getBoundingClientRect = origGetRect;
    }
  });
});
