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

// Reveal telemetry: tracks how every `.reveal` / `.reveal-stagger` /
// `.section-enter` element actually gets shown — by IntersectionObserver,
// by the initial mount sweep, or by the delayed (250ms) safety-net sweep.
// Helps diagnose "section stays invisible during fast mobile scroll".
// • If `pending > 0` after ~1s → IO genuinely missed an element.
// • If `sweepDelayed` is large on mobile → IO fires too late; tune
//   rootMargin/threshold.
// • If `sweepInitial` dominates → most reveals were already on-screen at
//   mount (deep-link, refresh mid-page, or fast fling before first frame).
//
// Entry-mode telemetry: every reveal is also tagged with the navigation
// entry that produced this page load — `hash` (URL had #fragment),
// `scroll-restore` (browser restored a non-zero scrollY without a hash —
// e.g. back/forward cache), or `cold` (fresh top-of-page load). This lets
// us answer: "for hash/deep-link entries, how many reveals are caught by
// sweepInitial vs IO?" — exactly the case where the IO routinely misses
// elements that are already past the fold at t=0.
//
// Counters are always collected (cheap); console logging only happens
// when ?scroll-debug is active. Inspect via `window.__yesRevealTelemetry.report()`.
type RevealSource = "io" | "sweepInitial" | "sweepDelayed";
type RevealEntry = "cold" | "hash" | "scroll-restore";
type RevealBucket = {
  total: number;
  io: number;
  sweepInitial: number;
  sweepDelayed: number;
  readonly pending: number;
};
type RevealEntryBucket = {
  io: number;
  sweepInitial: number;
  sweepDelayed: number;
};
type RevealTelemetry = {
  entry: RevealEntry;
  hash: string;
  initialScrollY: number;
  reveal: RevealBucket;
  sectionEnter: RevealBucket;
  byEntry: Record<RevealEntry, { reveal: RevealEntryBucket; sectionEnter: RevealEntryBucket }>;
  log: (
    bucket: "reveal" | "sectionEnter",
    source: RevealSource,
    selector?: string,
  ) => void;
  setTotal: (bucket: "reveal" | "sectionEnter", total: number) => void;
  report: () => unknown;
  reset: () => void;
};

declare global {
  interface Window {
    __yesRevealTelemetry?: RevealTelemetry;
  }
}

function makeBucket(): RevealBucket {
  return {
    total: 0,
    io: 0,
    sweepInitial: 0,
    sweepDelayed: 0,
    get pending() {
      return Math.max(0, this.total - this.io - this.sweepInitial - this.sweepDelayed);
    },
  };
}

function makeEntryBuckets(): RevealTelemetry["byEntry"] {
  const empty = (): RevealEntryBucket => ({ io: 0, sweepInitial: 0, sweepDelayed: 0 });
  return {
    cold: { reveal: empty(), sectionEnter: empty() },
    hash: { reveal: empty(), sectionEnter: empty() },
    "scroll-restore": { reveal: empty(), sectionEnter: empty() },
  };
}

function detectEntry(win: Window): { entry: RevealEntry; hash: string; initialScrollY: number } {
  const hash = win.location.hash || "";
  const initialScrollY = win.scrollY || win.pageYOffset || 0;
  let entry: RevealEntry = "cold";
  if (hash && hash !== "#") {
    entry = "hash";
  } else if (initialScrollY > 1) {
    // Browser restored scroll position (e.g. bfcache, back/forward) without
    // a hash. We bucket this separately because it produces the same
    // "many reveals already past the fold" pattern as a hash entry.
    entry = "scroll-restore";
  }
  return { entry, hash, initialScrollY };
}

function getRevealTelemetry(): RevealTelemetry {
  if (typeof window === "undefined") {
    // SSR: return a no-op shim so call sites stay simple.
    return {
      entry: "cold",
      hash: "",
      initialScrollY: 0,
      reveal: makeBucket(),
      sectionEnter: makeBucket(),
      byEntry: makeEntryBuckets(),
      log: () => {},
      setTotal: () => {},
      report: () => null,
      reset: () => {},
    };
  }
  if (window.__yesRevealTelemetry) return window.__yesRevealTelemetry;

  const debug = getScrollDebugFlags(window).enabled;
  const { entry, hash, initialScrollY } = detectEntry(window);
  const state: RevealTelemetry = {
    entry,
    hash,
    initialScrollY,
    reveal: makeBucket(),
    sectionEnter: makeBucket(),
    byEntry: makeEntryBuckets(),
    log(bucket, source, selector) {
      const b = state[bucket];
      b[source] += 1;
      state.byEntry[state.entry][bucket][source] += 1;
      if (debug) {
        // eslint-disable-next-line no-console
        console.debug(
          `[reveal-telemetry] ${bucket} via ${source} (entry=${state.entry})`,
          selector ?? "",
          {
            total: b.total,
            io: b.io,
            sweepInitial: b.sweepInitial,
            sweepDelayed: b.sweepDelayed,
            pending: b.pending,
          },
        );
      }
    },
    setTotal(bucket, total) {
      state[bucket].total = total;
    },
    report() {
      const snapshot = {
        entry: state.entry,
        hash: state.hash,
        initialScrollY: state.initialScrollY,
        reveal: {
          total: state.reveal.total,
          io: state.reveal.io,
          sweepInitial: state.reveal.sweepInitial,
          sweepDelayed: state.reveal.sweepDelayed,
          pending: state.reveal.pending,
        },
        sectionEnter: {
          total: state.sectionEnter.total,
          io: state.sectionEnter.io,
          sweepInitial: state.sectionEnter.sweepInitial,
          sweepDelayed: state.sectionEnter.sweepDelayed,
          pending: state.sectionEnter.pending,
        },
        byEntry: state.byEntry,
      };
      // eslint-disable-next-line no-console
      console.groupCollapsed(
        `[reveal-telemetry] entry=${state.entry}${state.hash ? ` ${state.hash}` : ""} y=${state.initialScrollY}`,
      );
      // eslint-disable-next-line no-console
      console.table([
        { bucket: "reveal", ...snapshot.reveal },
        { bucket: "sectionEnter", ...snapshot.sectionEnter },
      ]);
      // Per-entry breakdown highlights how hash/deep-link entries lean
      // on sweepInitial vs IO compared to a cold top-of-page load.
      const rows: Array<Record<string, unknown>> = [];
      (["cold", "hash", "scroll-restore"] as RevealEntry[]).forEach((e) => {
        rows.push({ entry: e, bucket: "reveal", ...state.byEntry[e].reveal });
        rows.push({ entry: e, bucket: "sectionEnter", ...state.byEntry[e].sectionEnter });
      });
      // eslint-disable-next-line no-console
      console.table(rows);
      // eslint-disable-next-line no-console
      console.groupEnd();
      return snapshot;
    },
    reset() {
      state.reveal = makeBucket();
      state.sectionEnter = makeBucket();
      state.byEntry = makeEntryBuckets();
    },
  };
  window.__yesRevealTelemetry = state;
  return state;
}

function describeReveal(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls =
    typeof el.className === "string"
      ? el.className.split(/\s+/).filter(Boolean).slice(0, 2).map((c) => `.${c}`).join("")
      : "";
  return `${tag}${id}${cls}`;
}

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
    const telemetry = getRevealTelemetry();
    telemetry.setTotal("reveal", els.length);

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

    const revealEl = (target: HTMLElement, source: RevealSource) => {
      if (target.classList.contains("is-visible")) return;
      // Only apply our cadence when no inline delay is already set, so
      // route-level overrides still win.
      if (target.classList.contains("reveal-stagger") && !target.style.transitionDelay) {
        const idx = indexByEl.get(target) ?? 0;
        target.style.transitionDelay = `${idx * STAGGER_MS}ms`;
      }
      target.classList.add("is-visible");
      telemetry.log("reveal", source, describeReveal(target));
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Reveal when intersecting OR when the element has already
          // scrolled past the viewport (bottom ≤ 0). On fast mobile
          // flings the IO can skip the intersecting callback entirely;
          // without this guard those items would stay invisible until
          // the user scrolls back. Mirrors the .section-enter observer.
          const passed = entry.boundingClientRect.bottom <= 0;
          if (!entry.isIntersecting && !passed) return;
          revealEl(entry.target as HTMLElement, "io");
          io.unobserve(entry.target);
        });
      },
      // Lower threshold + small negative bottom margin so reveals fire
      // a touch earlier on tall mobile sections, reducing the "snap in"
      // feel during quick scrolling.
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    els.forEach((el) => io.observe(el));

    // Initial sweep: any reveal already on-screen at mount (e.g. after
    // a deep-link / refresh near the bottom of the page, or after a
    // very fast scroll before the IO has reported) is shown right away.
    const sweep = (source: "sweepInitial" | "sweepDelayed") => {
      const vh = window.innerHeight || 0;
      els.forEach((el) => {
        if (el.classList.contains("is-visible")) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top < vh * 0.95) {
          revealEl(el, source);
          io.unobserve(el);
        }
      });
    };
    sweep("sweepInitial");
    // Safety net for extreme fling scrolls: re-sweep once shortly after
    // mount to catch anything the IO missed during the first frame.
    const t = window.setTimeout(() => sweep("sweepDelayed"), 250);

    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
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

    const telemetry = getRevealTelemetry();
    telemetry.setTotal("sectionEnter", els.length);

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const markVisible = (el: Element, source: RevealSource) => {
      if (el.classList.contains("is-visible")) return;
      el.classList.add("is-visible");
      telemetry.log("sectionEnter", source, describeReveal(el));
    };

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
          markVisible(entry.target, "io");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.02, rootMargin: "0px 0px -8% 0px" },
    );

    els.forEach((el) => io.observe(el));

    // Initial + delayed sweep mirrors the reveal observer: on very fast
    // mobile flings the IO can miss a section entirely. Force-show any
    // wrapper already on-screen (or scrolled past) at mount, then
    // re-check shortly after to catch anything still pending.
    const sweep = (source: "sweepInitial" | "sweepDelayed") => {
      const vh = window.innerHeight || 0;
      els.forEach((el) => {
        if (el.classList.contains("is-visible")) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top < vh * 0.98) {
          markVisible(el, source);
          io.unobserve(el);
        }
      });
    };
    sweep("sweepInitial");
    const t = window.setTimeout(() => sweep("sweepDelayed"), 250);

    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
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
