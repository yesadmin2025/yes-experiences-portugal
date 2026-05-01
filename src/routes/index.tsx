import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { FAQ } from "@/components/FAQ";

import heroImg from "@/assets/hero-coast.jpg";

// Real Viator-sourced tour photography — every card maps to an actual
// Signature tour. No stock or invented imagery.
// Each Occasions card image is chosen to MATCH its theme:
//  · Proposals    → quiet Arrábida viewpoint (intimate, private moment)
//  · Celebrations → Arrábida wine lunch table (gathering, shared joy)
//  · Corporate    → Cabo da Roca cliffs (premium, group-scale, non-religious)
//  · Multi-day    → Tomar–Coimbra (multi-region journey, not a single beach)
import imgArrabidaViewpoint from "@/assets/tours/arrabida-wine-allinclusive/viewpoint.jpg";
import imgArrabidaWineLunch from "@/assets/tours/arrabida-wine-allinclusive/lunch.jpg";
import imgSintraCaboDaRoca from "@/assets/tours/sintra-cascais/cabo-da-roca.jpg";
import imgTomarCoimbra from "@/assets/tours/tomar-coimbra/hero.jpg";

import {
  ArrowRight,
  Star,
  Sparkles,
  MapPin,
  MessageCircle,
  Compass,
  Feather,
  LifeBuoy,
} from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";
import { StudioLivePreview } from "@/components/home/StudioLivePreview";
import { getScrollDebugFlags, useScrollDebugFlags } from "@/lib/scroll-debug";

import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";
import { signatureTours, isValidTourId } from "@/data/signatureTours";

/* ──────────────────────────────────────────────────────────────────
 * Featured Signature tours — exactly 4 real tours, in display order.
 * Each id MUST exist in `signatureTours` (validated below).
 * ────────────────────────────────────────────────────────────── */
const FEATURED_TOUR_IDS = [
  "arrabida-wine-allinclusive",
  "sintra-cascais",
  "arrabida-boat",
  "troia-comporta",
] as const;

const signatures = FEATURED_TOUR_IDS
  .filter((id) => isValidTourId(id))
  .map((id) => signatureTours.find((t) => t.id === id)!)
  .map((t) => ({
    id: t.id,
    title: t.title,
    img: t.img,
    line: t.blurb,
    pace: t.pace,
    region: t.region,
    priceFrom: t.priceFrom,
    durationHours: t.durationHours,
    // First 3 real highlights from the matching Viator-sourced catalog.
    // Never fabricated — sourced from `signatureTours[].highlights`.
    highlights: t.highlights.slice(0, 3),
  }));

/* ──────────────────────────────────────────────────────────────────
 * Moments / Groups preview — Multi-day, Proposals, Celebrations,
 * Corporate collapsed into a single band (see groupsAndCelebrations).
 * ────────────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────────────────
 * Moments / Groups preview — Multi-day, Celebrations, Corporate
 * collapsed into a single 3-card band.
 * ────────────────────────────────────────────────────────────── */
/* ──────────────────────────────────────────────────────────────────
 * Occasions band — Proposals · Celebrations · Corporate & Groups ·
 * Multi-Day. Each block carries the four required elements:
 *   1. strong headline (`title`)
 *   2. short emotional value (`pull`)
 *   3. practical value (`line` body + `detail` + `handles`)
 *   4. local guidance / logistics note (`trust`)
 *   + CTA (`cta` + `to`)
 * Copy is approved verbatim — do not paraphrase without explicit ask.
 * Each block uses its OWN real Viator-sourced image (no duplicates,
 * no stock, no invented imagery).
 * ────────────────────────────────────────────────────────────── */
const groupsAndCelebrations = [
  {
    id: "proposals",
    eyebrow: "Proposals",
    title: "A private moment, shaped with care.",
    line: (
      <>
        From location to timing, we plan the details{" "}
        <span className="kw">discreetly</span> with local knowledge.
      </>
    ),
    pull: "Designed for the moment, not the template.",
    detail: "Discreet · location of your choosing",
    handles: [
      "Location scouting",
      "Timing optimisation",
      "Full discretion",
    ],
    trust: "Planned end to end with our local team.",
    cta: "Plan a Proposal",
    to: "/proposals",
    img: imgArrabidaViewpoint,
  },
  {
    id: "celebrations",
    eyebrow: "Celebrations",
    title: "For days worth remembering.",
    line: (
      <>
        Birthdays, anniversaries and family moments shaped around{" "}
        <span className="kw">your people</span> and pace.
      </>
    ),
    pull: "Your people, your pace.",
    detail: "Private host · any group size",
    handles: [
      "Group coordination",
      "Multi-activity planning",
      "Personal touches",
    ],
    trust: "Coordinated by a local host who knows how the day connects.",
    cta: "Plan a Celebration",
    to: "/proposals",
    img: imgArrabidaWineLunch,
  },
  {
    id: "corporate",
    eyebrow: "Corporate & Groups",
    title: "Private group days, without the generic formula.",
    line: (
      <>
        Local experiences, transport and timing coordinated into one{" "}
        <span className="kw">effortless</span> day.
      </>
    ),
    pull: "Handled end to end, locally.",
    detail: "Any group size · invoice & DMC support",
    handles: [
      "Full logistics management",
      "Transport coordination",
      "Invoice & DMC support",
    ],
    trust: "Real driving times, real venues, real partners.",
    cta: "Plan a Group Experience",
    to: "/corporate",
    img: imgSintraCaboDaRoca,
  },
  {
    id: "multi-day",
    eyebrow: "Multi-day",
    title: "More than one day. One coherent journey.",
    line: (
      <>
        Build Portugal across regions with realistic timing and{" "}
        <span className="kw">local flow</span>.
      </>
    ),
    pull: "A real journey, not a checklist.",
    detail: "Any length · local-designed",
    handles: [
      "Route planning across regions",
      "Curated overnight stops",
      "Daily local support",
    ],
    trust: "Designed in conversation with a local team.",
    cta: "Plan a Multi-Day Journey",
    to: "/multi-day",
    img: imgTomarCoimbra,
  },
];


/* ──────────────────────────────────────────────────────────────────
 * Route definition — keeps headers, head meta and HERO_COPY_VERSION
 * exposure intact so existing locks (X-Hero-Copy-Version,
 * yes-hero-copy-version meta tag) keep passing.
 * ────────────────────────────────────────────────────────────── */
export const Route = createFileRoute("/")({
  headers: () => ({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    "Surrogate-Control": "no-store",
    "X-Hero-Copy-Version": HERO_COPY_VERSION,
  }),
  head: () => ({
    meta: [
      { title: "YES experiences Portugal — Portugal is the stage. You write the story." },
      { name: "yes-hero-copy-version", content: HERO_COPY_VERSION },
      { name: "description", content: HERO_COPY.subheadline },
      {
        property: "og:title",
        content: "Portugal is the stage. You write the story. — YES experiences",
      },
      { property: "og:description", content: HERO_COPY.subheadline },
      {
        property: "twitter:title",
        content: "Portugal is the stage. You write the story. — YES experiences",
      },
      { property: "twitter:description", content: HERO_COPY.subheadline },
      { property: "og:image", content: heroImg },
      { property: "twitter:image", content: heroImg },
    ],
  }),
  component: HomePage,
});

/* ════════════════════════════════════════════════════════════════
 * HOMEPAGE — 8 sections (structural pass: dedup + reorder)
 * 1. Hero
 * 2. Social proof — trust strip
 * 3. Why YES — editorial manifesto (5 blocks)
 * 4. Experience Studio preview (Builder)
 * 5. Real Signature Experiences preview
 * 6. Proposals / Celebrations / Corporate / Multi-Day (combined band)
 * 7. FAQ
 * 8. Final CTA — Talk to a local
 * ════════════════════════════════════════════════════════════ */
function HomePage() {
  const scrollDebug = useScrollDebugFlags();
  // ── Hash navigation ────────────────────────────────────────────────
  // Two cooperating effects:
  //   1. Deep-link handler: on mount (and on subsequent hashchange via
  //      in-page anchor clicks), resolves aliases, smooth-scrolls to the
  //      target, and sets a shared lock so the observer below doesn't
  //      overwrite the hash mid-animation.
  //   2. Hash sync observer: as the user scrolls, replaces the URL hash
  //      with whichever tracked section is "most under" the anchor line —
  //      a fixed line ~14% down the viewport (just below the navbar).
  //      We use a distance-to-anchor-line metric instead of raw
  //      intersectionRatio so short sections (e.g. trust bar) don't beat
  //      tall ones (e.g. Builder) just because they're 100% visible.
  //
  // The lock is a module-scoped `useRef` shared between effects via a
  // closure variable in component scope.

  const TRACKED_IDS = [
    "reviews",
    "builder",
    "studio",
    "why-yes",
    "signatures",
    "occasions",
    "faq",
    "final-cta",
  ] as const;

  const HASH_ALIASES: Record<string, string> = {
    // Why YES
    "why-yes": "why-yes",
    whyyes: "why-yes",
    why: "why-yes",
    // Builder / Studio — Studio is its own anchor inside the builder section
    build: "builder",
    builder: "builder",
    studio: "studio",
    "experience-studio": "studio",
    // Signatures
    signature: "signatures",
    signatures: "signatures",
    // Occasions / Groups (legacy aliases preserved)
    occasion: "occasions",
    occasions: "occasions",
    groups: "occasions",
    group: "occasions",
    proposal: "occasions",
    proposals: "occasions",
    celebration: "occasions",
    celebrations: "occasions",
    corporate: "occasions",
    // Reviews / trust
    review: "reviews",
    reviews: "reviews",
    // Final CTA
    "final-cta": "final-cta",
    final: "final-cta",
    book: "final-cta",
    talk: "final-cta",
    contact: "final-cta",
  };

  // Shared "don't sync the hash right now" lock. Held while a programmatic
  // smooth-scroll is in flight. Stored on window so both effects see the
  // same value without prop-drilling a ref.
  // Using a numeric timestamp (ms since epoch) — observer reads
  // performance.now() and skips while the lock is in the future.
  const getLockKey = () => "__yesHashSyncLockUntil";

  // Effect 1 — deep-link handling (runs on mount + on hashchange events
  // triggered by clicks on in-page anchors that point to a tracked id).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (getScrollDebugFlags().disableHashSync) return;

    const resolveTarget = (raw: string): HTMLElement | null => {
      if (!raw) return null;
      const key = raw.toLowerCase();
      const aliased = HASH_ALIASES[key] ?? key;
      return (
        document.getElementById(aliased) ?? document.getElementById(key)
      );
    };

    let cancelled = false;
    let timer = 0;

    // Single, simple deep-link handler.
    //
    // Previous version stacked three smooth-scroll systems (CSS
    // scroll-behavior + global anchor handler + scrollIntoView here)
    // plus corrective re-scrolls at 500ms / 1400ms / on every img.load /
    // on document.fonts.ready. That caused the page to snap back after
    // the user started scrolling.
    //
    // Now: one smooth scroll, no corrections. The global
    // installSmoothAnchorScroll handler (SiteLayout) covers click-driven
    // jumps with the proper navbar offset; this effect only handles
    // initial mount + hashchange (programmatic). We poll briefly for the
    // target to exist (lazy chunks/images), do ONE scroll, and stop.
    const scrollToHash = (rawHash: string, smooth: boolean) => {
      // Lock the scroll-spy briefly so it doesn't fight us during the
      // initial smooth scroll.
      (window as unknown as Record<string, number>)[getLockKey()] =
        performance.now() + 900;

      let tries = 0;
      const tick = () => {
        if (cancelled) return;
        const el = resolveTarget(rawHash);
        if (el) {
          const reduce =
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
          // Compute target with navbar offset so we land cleanly under the
          // fixed header instead of clipping under it.
          const navOffset =
            window.innerWidth >= 1024 ? 96 : window.innerWidth >= 768 ? 88 : 80;
          const scrollMt =
            parseFloat(window.getComputedStyle(el).scrollMarginTop || "0") || 0;
          const offset = Math.max(scrollMt, navOffset);
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({
            top: Math.max(0, top),
            behavior: smooth && !reduce ? "smooth" : "auto",
          });

          // Force-reveal the section once so deep-linked anchors don't
          // land on opacity:0 content (IO race on mount). Transform/opacity
          // only — no layout shift.
          const scope: ParentNode = el.querySelector(
            ".reveal, .reveal-stagger",
          )
            ? el
            : (el.closest("section") ?? el);
          scope
            .querySelectorAll<HTMLElement>(
              ".reveal:not(.is-visible), .reveal-stagger:not(.is-visible), .section-enter:not(.is-visible)",
            )
            .forEach((node) => node.classList.add("is-visible"));

          // Canonicalise URL hash.
          const canonical =
            HASH_ALIASES[rawHash.toLowerCase()] ?? rawHash.toLowerCase();
          if (canonical && `#${canonical}` !== window.location.hash) {
            window.history.replaceState(
              window.history.state,
              "",
              window.location.pathname + window.location.search + `#${canonical}`,
            );
          }
          return;
        }
        // Section not in DOM yet (lazy chunk). Poll briefly.
        if (++tries < 20) {
          timer = window.setTimeout(tick, 80);
        }
      };
      timer = window.setTimeout(tick, 60);
    };

    const initial = window.location.hash?.slice(1);
    if (initial) scrollToHash(initial, true);

    const onHashChange = () => {
      const h = window.location.hash?.slice(1);
      if (h) scrollToHash(h, true);
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", onHashChange);
      if (timer) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 2 — REMOVED PERMANENTLY.
  // Previously synced the URL hash to the currently visible section as the
  // user scrolled. This was identified as a likely contributor to scroll
  // instability (rAF + IO + history.replaceState during native scroll). It
  // is intentionally not replaced. Anchor link clicks still work via
  // Effect 1 + the global smooth-anchor-scroll handler.

  // Effect 3 — homepage-only parallax driver. Writes `--parallax-y` to
  // every `.he-parallax` / `.he-parallax-counter` element via rAF on
  // scroll. Disabled for prefers-reduced-motion. Caps travel so it
  // stays "everyday", never woozy.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (getScrollDebugFlags().disableMobileStudioMotion && window.innerWidth < 768) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".he-parallax, .he-parallax-counter",
      ),
    );
    if (!els.length) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        // Skip when fully off-screen.
        if (rect.bottom < -200 || rect.top > vh + 200) continue;
        // Normalised position: -1 (above viewport) → 0 (centred) → 1 (below).
        const center = rect.top + rect.height / 2;
        const t = (center - vh / 2) / vh; // ~ -1..1 across viewport
        // Cap travel: ±18px on phones, ±28px on larger screens.
        const cap = window.innerWidth < 768 ? 18 : 28;
        const y = Math.max(-cap, Math.min(cap, t * cap * -1));
        el.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
      }
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <SiteLayout>
      <div className="home-energy">
      {/* 1 — HERO
          One strong real image, calm overlays, two CTAs, no parallax,
          no zoom. HERO_COPY stays byte-exact for lock parity. The brand
          signature ("Whatever you have in mind, We say YES.") is rendered
          ONCE inside HERO_COPY.brandLine — no duplicate slogans. */}
      <section
        className="relative min-h-[78svh] md:min-h-[94vh] flex items-end overflow-hidden"
      >
        <img
          src={heroImg}
          alt="Hidden coastal road in Portugal at golden hour"
          className="he-parallax absolute inset-0 w-full h-full object-cover object-center"
          width={1920}
          height={1080}
        />
        {/* Soft dark gradient — required by brief for any text-over-image.
            Mobile overlay deepened slightly to keep CTA + microcopy text
            readable against the dark hero photo on small viewports. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/92 via-[color:var(--charcoal-deep)]/55 to-[color:var(--charcoal-deep)]/42 md:from-[color:var(--charcoal-deep)]/80 md:via-[color:var(--charcoal-deep)]/35 md:to-[color:var(--charcoal-deep)]/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,15,15,0.72)_0%,rgba(15,15,15,0.46)_38%,transparent_72%)] md:bg-[linear-gradient(90deg,rgba(15,15,15,0.6)_0%,rgba(15,15,15,0.32)_40%,transparent_72%)] pointer-events-none" />

        <div className="container-x relative z-10 pb-10 md:pb-36 pt-20 md:pt-40">
          <div className="max-w-2xl md:max-w-3xl text-[color:var(--ivory)]">
            <span className="inline-flex items-center gap-2 sm:gap-3.5 max-w-full text-[10px] xs:text-[10.5px] sm:text-[12px] md:text-[13px] uppercase tracking-[0.16em] xs:tracking-[0.2em] sm:tracking-[0.26em] md:tracking-[0.3em] text-[color:var(--gold)] opacity-0 animate-[heroFade_0.8s_ease-out_0.1s_forwards]">
              <span aria-hidden="true" className="shrink-0">✦</span>
              <span data-hero-field="eyebrow" className="whitespace-nowrap truncate">
                {HERO_COPY.eyebrow}
              </span>
              <span aria-hidden="true" className="shrink-0">✦</span>
            </span>

            <h1
              data-hero-field="headlineLine1 headlineLine2"
              className="hero-h1 serif mt-4 md:mt-8 text-[2.05rem] sm:text-[2.7rem] md:text-[4rem] lg:text-[4.6rem] leading-[1.1] sm:leading-[1.04] md:leading-[1.0] tracking-[-0.02em] text-[color:var(--ivory)] text-left opacity-0 animate-[heroFade_0.9s_ease-out_0.25s_forwards] [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]"
            >
              <span data-hero-field="headlineLine1" className="block font-medium tracking-[-0.018em]">
                {HERO_COPY.headlineLine1}
              </span>
              <span
                data-hero-field="headlineLine2"
                className="block italic font-normal text-[color:var(--gold-soft)] mt-1 md:mt-1.5 text-[2.05rem] sm:text-[2.7rem] md:text-[4rem] lg:text-[4.6rem] tracking-[-0.024em] leading-[1.1] sm:leading-[1.04] md:leading-[1.0]"
              >
                {HERO_COPY.headlineLine2}
              </span>
            </h1>

            <p
              data-hero-field="subheadline"
              className="mt-4 md:mt-7 text-[15.5px] md:text-[19px] text-[color:var(--ivory)] max-w-md md:max-w-lg leading-[1.6] md:leading-[1.65] font-normal text-left opacity-0 animate-[heroFade_0.9s_ease-out_0.45s_forwards] [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
            >
              {HERO_COPY.subheadline}
            </p>

            {/* CTAs — exactly two, per brief.
                Studio is the primary innovation, so "Create Your Story"
                (→ /builder) leads. "Explore Signature Experiences" stays
                visible as the calmer second path (→ /experiences).
                Labels are byte-exact from HERO_COPY (e2e lock). */}
            <div className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm sm:max-w-xl opacity-0 animate-[heroFade_0.9s_ease-out_0.65s_forwards]">
              <Link
                to="/builder"
                data-hero-field="primaryCta"
                className="hero-cta-button cta-primary he-glow he-sheen group relative inline-flex w-full sm:flex-1 sm:basis-0 items-center justify-between gap-3 text-left"
              >
                <span className="block">{HERO_COPY.primaryCta}</span>
                <ArrowRight
                  size={16}
                  className="shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-1.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/experiences"
                data-hero-field="secondaryCta"
                className="hero-cta-button cta-secondary-dark he-glow he-sheen group relative inline-flex w-full sm:flex-1 sm:basis-0 items-center justify-between gap-3 text-left"
              >
                <span className="block">{HERO_COPY.secondaryCta}</span>
                <ArrowRight
                  size={16}
                  className="shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-1.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            {/* Microcopy under the CTAs. Subline link to /contact removed
                per brief — it competed with the two main CTAs and
                fragmented the hero CTA hierarchy. Local guidance is
                still surfaced in the Studio reassurance line, the FAQ
                closer, and the Final CTA secondary button. */}
            <div className="hero-rhythm-cta-to-microcopy max-w-sm sm:max-w-xl mx-auto sm:mx-0 opacity-0 animate-[heroFade_0.9s_ease-out_0.85s_forwards]">
              <p
                data-hero-field="microcopy"
                className="text-[14px] md:text-[14.5px] text-[color:var(--ivory)] leading-[1.65] md:leading-[1.7] font-normal tracking-[0.005em] text-center sm:text-left"
              >
                {HERO_COPY.microcopy}
              </p>
            </div>

            {/* Brand signature — rendered ONCE (Patch 2A dedup).
                The visible split is the only copy of the line; SRs read
                it via aria-label on the wrapper. */}
            <div className="hero-rhythm-microcopy-to-signature mb-2 md:mb-2 mt-8 md:mt-10 flex justify-center opacity-0 animate-[heroFade_0.9s_ease-out_1.05s_forwards]">
              <div
                data-hero-field="brandLine"
                aria-label={HERO_COPY.brandLine}
                className="inline-flex items-center gap-6 md:gap-7 text-[color:var(--gold-soft)]"
              >
                <span aria-hidden="true" className="h-px w-12 md:w-16 bg-gradient-to-r from-transparent to-[color:var(--gold)] shrink-0 opacity-90" />
                <span className="flex flex-col items-center gap-2 md:gap-2.5 text-[10.5px] md:text-[11px] uppercase tracking-[0.32em] leading-[1.2] text-center">
                  <span className="text-[color:var(--ivory)]/85" style={{ fontWeight: 450 }}>
                    Whatever you have in mind,
                  </span>
                  <span
                    className="text-[color:var(--gold)] tracking-[0.4em] text-[12.5px] md:text-[13px]"
                    style={{ fontWeight: 600 }}
                  >
                    We say YES.
                  </span>
                </span>
                <span aria-hidden="true" className="h-px w-12 md:w-16 bg-gradient-to-l from-transparent to-[color:var(--gold)] shrink-0 opacity-90" />
              </div>
            </div>

            {/* Hidden hero-copy probes — required by HERO_COPY locks.
                Visually-hidden, no layout impact. */}
            <div
              data-hero-copy-version={HERO_COPY_VERSION}
              data-hero-eyebrow={HERO_COPY.eyebrow}
              data-hero-headline={`${HERO_COPY.headlineLine1} ${HERO_COPY.headlineLine2}`}
              data-hero-subheadline={HERO_COPY.subheadline}
              data-hero-primary-cta={HERO_COPY.primaryCta}
              data-hero-secondary-cta={HERO_COPY.secondaryCta}
              data-hero-microcopy={HERO_COPY.microcopy}
              data-hero-brand-line={HERO_COPY.brandLine}
              data-testid="hero-copy-version"
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0,0,0,0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              <span data-probe-field="version">hero-copy-version:{HERO_COPY_VERSION}</span>
              {" | "}
              <span data-probe-field="headline">
                {HERO_COPY.headlineLine1} {HERO_COPY.headlineLine2}
              </span>
              {" | "}
              <span data-probe-field="subheadline">{HERO_COPY.subheadline}</span>
            </div>
            <div
              data-hero-copy-json={JSON.stringify({ version: HERO_COPY_VERSION, copy: HERO_COPY })}
              data-testid="hero-copy-json"
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0,0,0,0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              <script
                type="application/json"
                data-probe-field="hero-copy-json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({ version: HERO_COPY_VERSION, copy: HERO_COPY }, null, 2),
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2 — TRUST STRIP
          Restrained: review count, real platforms, one short line about
          private guides + real local knowledge. No avatars carousel, no
          repeated review block. This is the SINGLE review surface on the
          page (per "no repeated review sections" guardrail). */}
      <section
        id="reviews"
        className="he-trust-rule bg-[color:var(--ivory)] border-b border-[color:var(--border)] section-y-sm scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="trust-bar-title"
      >
        <h2 id="trust-bar-title" className="sr-only">
          700+ five-star reviews across major platforms
        </h2>
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
              <p
                className="flex items-center justify-center md:justify-start gap-1 text-[color:var(--gold)]"
                role="img"
                aria-label="Rated 5 out of 5 stars"
              >
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" focusable="false" />
                ))}
              </p>
              <p className="serif text-[1.15rem] md:text-[1.35rem] text-[color:var(--charcoal)] leading-[1.25] font-normal">
                700+ <span className="italic">five-star reviews</span>
                <span className="hidden md:inline text-[color:var(--charcoal-soft)]"> · </span>
                <span className="block md:inline text-[10.5px] md:text-[11.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal)] md:ml-1 mt-1.5 md:mt-0">
                  Private · Local · Designed in Portugal
                </span>
              </p>
            </div>
            <ul
              className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3 md:gap-x-8 list-none p-0 h-6 md:h-7 opacity-90"
              aria-label="Featured on Google, Tripadvisor, Viator, GetYourGuide and Trustpilot"
            >
              {(["google", "tripadvisor", "viator", "getyourguide", "trustpilot"] as const).map((p) => (
                <li key={p} className="h-full flex items-center">
                  <PlatformBadge platform={p} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3 — THREE PATHS + EXPERIENCE STUDIO (promoted)
          Promoted up the page so the Builder reads as the core
          innovation, not just another tile. The section opens with a
          compact Three-paths primer (Signature / Tailored / Studio)
          so users immediately understand the three distinct ways to
          shape Portugal — then drops into the live Studio device.
          Mobile order: paths primer → headline → live preview → CTA.
          Desktop: text rail left, preview right. One CTA only
          ("Open the Studio"). The "Ask a local" duplicate has been
          removed; local guidance lives in the reassurance line, the
          FAQ closer, and the Final CTA. */}
      <section
        id="builder"
        className="he-section-rule is-visible py-20 md:section-y-lg bg-[color:var(--sand)] border-b border-[color:var(--border)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="studio-title"
      >
        <div className="container-x">
          {/* Three paths primer — compact horizontal strip on desktop,
              stacked on mobile. No images, no large surfaces; numbered
              labels + a one-line definition each. Establishes the
              vocabulary used everywhere downstream. */}
          <div className="reveal max-w-5xl mx-auto mb-10 md:mb-14">
            <div className="text-center">
              <span className="he-eyebrow-bar mb-4">Three ways in</span>
              <h2
                id="paths-title"
                className="serif mt-3 text-[1.7rem] sm:text-[1.95rem] md:text-[2.4rem] leading-[1.18] md:leading-[1.1] tracking-[-0.012em] text-[color:var(--charcoal)] font-medium"
              >
                Three ways to <span className="italic">begin.</span>
              </h2>
              <p className="mt-4 text-[14.5px] md:text-[15.5px] text-[color:var(--charcoal-soft)] leading-[1.6] max-w-md mx-auto">
                Choose a ready-made Signature, tailor the details, or build from scratch.
              </p>
            </div>
            <ol
              className="he-stagger mt-7 md:mt-9 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 list-none p-0"
              aria-label="Three paths to shape your Portugal experience"
            >
              {[
                {
                  num: "01",
                  label: "Signature",
                  body: "Ready-to-book private experiences.",
                },
                {
                  num: "02",
                  label: "Tailored",
                  body: "Adjust selected details inside a Signature.",
                },
                {
                  num: "03",
                  label: "Studio",
                  body: "Create from scratch in real time.",
                },
              ].map((p) => (
                <li
                  key={p.num}
                  className="reveal-stagger relative flex items-start gap-3.5 rounded-[6px] border border-[#EAE2D6] bg-[color:var(--ivory)] px-4 py-3.5 md:px-5 md:py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--gold)]/45"
                >
                  <span className="shrink-0 serif text-[1.5rem] md:text-[1.7rem] leading-none text-[color:var(--gold)] font-light tabular-nums">{p.num}</span>
                  <div className="flex flex-col">
                    <span className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[color:var(--charcoal)]">
                      {p.label}
                    </span>
                    <p className="mt-1 text-[13px] md:text-[13.5px] leading-[1.5] text-[color:var(--charcoal-soft)]">
                      {p.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Inner anchor target for /#studio — sits right before the
              "Create it live." rail so deep-links land on the Studio
              block, not the wider builder eyebrow. scroll-mt matches
              the same offset used elsewhere on the page. */}
          <div
            id="studio"
            aria-hidden="true"
            className="scroll-mt-24 md:scroll-mt-28"
          />
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
            {/* On mobile: text rail (with the headline) renders FIRST so
                the user reads "Create it live." before seeing the
                device. On desktop the rail returns to the left so the
                reading flow stays natural. */}
            <div className="reveal lg:col-span-5 lg:order-1 order-1">
              <span className="he-eyebrow-bar mb-4">
                <span className="live-dot" aria-hidden="true" />
                Experience Studio
              </span>
              <h2
                id="studio-title"
                className="serif mt-3 text-[2rem] sm:text-[2.4rem] md:text-[3.6rem] leading-[1.1] md:leading-[1.0] tracking-[-0.018em] text-[color:var(--charcoal)] font-medium"
              >
                Create it <span className="italic font-normal">live.</span>
              </h2>
              <p className="mt-5 text-[14.5px] md:text-[16px] text-[color:var(--charcoal-soft)] leading-[1.7] max-w-md font-normal">
                Choose your <span className="kw">mood</span>, rhythm and intention. Watch your private experience take shape in <span className="kw">real time</span>.
              </p>

              {/* Three Studio inputs — small index, signposts the
                  live chips at the top of the preview device. */}
              <ol className="mt-7 grid grid-cols-3 gap-1.5 max-w-md" aria-label="Three Studio inputs">
                {["Mood", "Who", "Rhythm"].map((label, i) => (
                  <li key={label} className="flex flex-col gap-1.5">
                    <span aria-hidden="true" className="block h-[3px] bg-[color:var(--gold)]" />
                    <span className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-[color:var(--charcoal)] tabular-nums">
                      0{i + 1} · {label}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-4">
                <Link
                  to="/builder"
                  className="he-glow he-sheen he-cta-shift group inline-flex items-center gap-2.5 sm:gap-2 bg-[color:var(--teal)] text-[color:var(--ivory)] border border-[color:var(--gold)]/55 px-6 sm:px-7 py-3.5 min-h-[48px] sm:min-h-[44px] text-[12.5px] sm:text-[13px] uppercase tracking-[0.18em] font-bold hover:bg-[color:var(--teal-2)] hover:border-[color:var(--gold)]/78 shadow-[0_8px_22px_-10px_rgba(41,91,97,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2"
                >
                  Open the Studio
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Starting-point microcopy — sits just under the CTA so
                  the user reads "this is a draft, designed for you"
                  before the reassurance line. Italic Georgia per
                  Typography v3, gold detail to keep it editorial. */}
              <p className="mt-4 inline-flex items-center gap-2 text-[12.5px] md:text-[13px] leading-[1.55] text-[color:var(--charcoal-soft)] max-w-md">
                <span aria-hidden="true" className="block h-px w-5 bg-[color:var(--gold)]" />
                <span className="serif italic">A starting point, shaped around you.</span>
              </p>

              {/* Reassurance line — three short reassurances. "A local is
                  one message away" matches the approved brief copy. */}
              <p className="mt-3 inline-flex items-start gap-2 text-[12.5px] md:text-[13px] leading-[1.6] text-[color:var(--charcoal-soft)] max-w-md">
                <MessageCircle size={13} aria-hidden="true" className="mt-[3px] shrink-0 text-[color:var(--teal)]" />
                <span>About a minute. No form. <span className="font-medium text-[color:var(--charcoal)]">A local is one message away.</span></span>
              </p>
            </div>

            <div className="he-parallax-counter lg:col-span-7 lg:order-2 order-2">
              <StudioLivePreview />
            </div>
          </div>
        </div>
      </section>

      {/* 4 — WHY YES
          Editorial manifesto — 4 modular cards (down from 5 per the
          approved consolidation). Each card carries a number, icon,
          label, serif headline, body and one strategic phrase.
          Closing microline keeps the "a local is always one message
          away" reassurance. */}
      <section
        id="why-yes"
        className="he-section-rule section-enter section-y bg-[color:var(--ivory)] border-b border-[color:var(--border)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="why-yes-title"
      >
        <div className="container-x">
          <div className="reveal max-w-2xl mx-auto text-center mb-10 md:mb-14">
            <span className="he-eyebrow-bar mb-5">Why YES</span>
            <h2
              id="why-yes-title"
              className="serif mt-3 text-[2rem] sm:text-[2.4rem] md:text-[3.6rem] leading-[1.1] md:leading-[1.02] tracking-[-0.016em] text-[color:var(--charcoal)] font-medium text-balance"
            >
              Portugal feels different to <span className="italic">everyone.</span>
            </h2>
            <p className="mt-5 text-[14.5px] md:text-[16px] text-[color:var(--charcoal-soft)] leading-[1.7] max-w-xl mx-auto">
              That's why YES lets you choose, shape and book private experiences around your <span className="kw">rhythm</span>, occasion and intention.
            </p>
            <span aria-hidden="true" className="gold-rule mt-8 md:mt-9 mx-auto block max-w-[3rem]" />
          </div>

          {/* 4-card editorial grid (consolidated from 5). 2-col desktop,
              stacked mobile. Each card: number, icon, label, serif
              headline, body, strategic phrase. */}
          <ul className="he-stagger max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4 list-none p-0">
            {[
              {
                Icon: Feather,
                num: "01",
                label: "You decide",
                title: (<>You shape the <span className="italic">story.</span></>),
                body: (<>Choose the rhythm, places and feeling you want to take home.</>),
                pull: "Designed around you, not a template.",
              },
              {
                Icon: Compass,
                num: "02",
                label: "Local from the start",
                title: (<>Local <span className="italic">from the start.</span></>),
                body: (<>Real <span className="kw">local knowledge</span> guides the route, timing and hidden details.</>),
                pull: "Locals on the ground, not call-centres.",
              },
              {
                Icon: Sparkles,
                num: "03",
                label: "Any occasion",
                title: (<>Any <span className="italic">occasion.</span></>),
                body: (<>Private days, proposals, celebrations, corporate moments or full journeys.</>),
                pull: "The intention shapes the day.",
              },
              {
                Icon: MapPin,
                num: "04",
                label: "Three ways to shape it",
                title: (<>Three ways to <span className="italic">shape it.</span></>),
                body: (<>Start with a Signature, tailor details, or build from scratch in the Studio.</>),
                pull: "Choose, tailor, or build.",
              },
            ].map((b) => (
              <li
                key={b.num}
                className="reveal-stagger he-card-lift group relative flex flex-col rounded-[6px] border border-[#EAE2D6] bg-[color:var(--ivory)] p-5 md:p-7 shadow-[0_1px_2px_rgba(46,46,46,0.04)] overflow-hidden"
              >
                <span aria-hidden="true" className="gold-rule absolute left-0 top-0" />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 bottom-0 h-px w-full origin-left scale-x-0 bg-[color:var(--gold)]/55 transition-transform duration-500 ease-out group-hover:scale-x-100"
                />
                <div className="flex items-start justify-between gap-4 pr-1">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--gold)]/30 bg-[color:var(--ivory)] transition-all duration-300 group-hover:border-[color:var(--gold)]/60 group-hover:scale-[1.05]">
                    <b.Icon
                      size={16}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className="text-[color:var(--teal)] transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="serif text-[1.9rem] md:text-[2.1rem] leading-none text-[color:var(--gold)] font-light tabular-nums">
                    {b.num}
                  </span>
                </div>
                <span className="mt-4 text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal-soft)]">
                  {b.label}
                </span>
                <h3 className="serif mt-2.5 text-[1.3rem] md:text-[1.6rem] leading-[1.22] md:leading-[1.18] text-[color:var(--charcoal)] font-medium">
                  {b.title}
                </h3>
                <p className="mt-3 text-[14px] md:text-[15px] text-[color:var(--charcoal-soft)] leading-[1.6]">
                  {b.body}
                </p>
                <p className="he-pull mt-4 serif italic text-[14px] md:text-[15px] leading-[1.45] text-[color:var(--charcoal)]">
                  {b.pull}
                </p>
              </li>
            ))}
          </ul>

          <p className="reveal mt-10 md:mt-12 text-center inline-flex flex-wrap w-full items-center justify-center gap-x-2 gap-y-1 px-4 text-[14px] md:text-[15px] leading-[1.6] tracking-[0.005em] text-[color:var(--charcoal-soft)]">
            <MessageCircle size={14} aria-hidden="true" className="shrink-0 text-[color:var(--teal)]" />
            <span className="text-balance">Need help shaping it? <span className="text-[color:var(--charcoal)]">A local is one message away.</span></span>
          </p>
        </div>
      </section>


      {/* 5 — SIGNATURE EXPERIENCES PREVIEW
          Up to 4 real Signature tours. Each card uses the tour's real
          hero image (sourced from the matching Viator page), real title
          and real blurb from `signatureTours`. No vague taglines, no
          repeated labels. */}
      <section
        id="signatures"
        className="he-section-rule section-enter section-y bg-[color:var(--ivory)] border-b border-[color:var(--border)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="signatures-title"
      >
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <span className="he-eyebrow-bar mb-5">Signature experiences</span>
            <h2 id="signatures-title" className="serif mt-3 text-[2rem] sm:text-[2.4rem] md:text-[3.6rem] leading-[1.1] md:leading-[1.0] tracking-[-0.016em] text-[color:var(--charcoal)] font-medium">
              Signature days, <span className="italic">ready when you are.</span>
            </h2>
            <p className="mt-4 text-[14.5px] md:text-[16px] text-[color:var(--charcoal-soft)] leading-[1.65] max-w-md mx-auto">
              Book a Signature as it is, or tailor selected details.
            </p>
          </div>

          {/* Mobile: full-bleed editorial cover carousel. Uses
              snap-proximity (NOT mandatory) so the horizontal strip
              never grabs vertical page scroll near snap points — that
              was the main source of "jumpy" feel on Android. Each card
              is 84vw so the next card peeks. `overscroll-x-contain`
              + `[contain:layout_paint]` isolate the strip from the
              page so its own scroll never reflows neighbours.
              Tablet+: keeps the calm 2/4-col grid. */}
          <ul
            className={[
              scrollDebug.staticMobileCarousels
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                : "flex sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible overscroll-x-contain sm:overscroll-auto [contain:layout_paint] sm:[contain:none] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              "gap-5 md:gap-7 list-none p-0",
            ].join(" ")}
            aria-label="Signature experiences"
          >
            {signatures.map((t) => {
              return (
                <li
                  key={t.id}
                  className={
                    scrollDebug.staticMobileCarousels
                      ? "w-full"
                      : "shrink-0 w-[84vw] sm:w-auto sm:shrink"
                  }
                >
                  {/* Card is a structured composition (NOT a single link) so
                      we can expose two distinct CTAs — Book + Tailor — and
                      a short list of REAL highlights pulled from the
                      Viator-sourced catalog. No invented copy. */}
                  <article
                    className="he-card-lift group relative flex flex-col h-full overflow-hidden rounded-[6px] border border-[color:var(--border)] bg-[color:var(--ivory)] transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:border-[color:var(--charcoal)]/30 hover:shadow-[0_18px_40px_-22px_rgba(46,46,46,0.32)]"
                  >
                    {/* Cover — clickable to detail page */}
                    <Link
                      to="/tours/$tourId"
                      params={{ tourId: t.id }}
                      className="he-image-cinema he-image-rise relative block aspect-[4/5] overflow-hidden bg-[color:var(--card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2"
                      aria-label={`Open ${t.title}`}
                    >
                      <img
                        src={t.img}
                        alt={t.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.05]"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"
                      />
                      {/* Top row: region + price */}
                      <div className="absolute inset-x-0 top-0 p-4 md:p-5 flex items-start justify-between gap-3">
                        <span className="text-[10px] uppercase tracking-[0.28em] text-white/85 drop-shadow-sm">
                          {t.region}
                        </span>
                        <span className="inline-flex items-baseline gap-1 rounded-full bg-[color:var(--ivory)]/95 px-2.5 py-1 text-[color:var(--charcoal)] shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
                          <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold">
                            From
                          </span>
                          <span className="serif text-[14px] leading-none">
                            €{t.priceFrom}
                          </span>
                        </span>
                      </div>
                      {/* Bottom: real title + real duration */}
                      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white">
                        <h3 className="serif text-[1.35rem] md:text-[1.5rem] leading-[1.18] text-white text-balance">
                          {t.title}
                        </h3>
                        <span className="mt-2 inline-block text-[11px] uppercase tracking-[0.22em] text-white/85">
                          {t.durationHours} · Private
                        </span>
                      </div>
                    </Link>

                    {/* Body — real teaser + real highlights + dual CTAs */}
                    <div className="flex flex-col gap-4 p-5 md:p-6">
                      <p className="text-[13.5px] leading-[1.55] text-[color:var(--charcoal)]">
                        {t.line}
                      </p>

                      {/* Real highlights — pulled directly from the
                          tour's `highlights` array. Capped at 3 for
                          card-level legibility. */}
                      {t.highlights.length > 0 && (
                        <ul className="flex flex-col gap-1.5 text-[12.5px] leading-[1.5] text-[color:var(--charcoal)]">
                          {t.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-2">
                              <span
                                aria-hidden="true"
                                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--gold)]"
                              />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Dual CTAs — Book + Tailor. Book is the primary
                          (solid teal); Tailor is a quieter outlined
                          option, reflecting the brand rule that Tailored
                          = adjustments INSIDE one Signature, never a
                          replacement for the Signature itself. */}
                      <div className="mt-auto flex flex-col xs:flex-row gap-2.5 pt-1">
                        <Link
                          to="/tours/$tourId"
                          params={{ tourId: t.id }}
                          className="he-glow he-sheen group/cta inline-flex items-center justify-center gap-1.5 min-h-[44px] flex-1 px-4 text-[12px] uppercase tracking-[0.18em] font-semibold bg-[color:var(--teal)] text-[color:var(--ivory)] hover:bg-[color:var(--teal-2)] transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] rounded-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2"
                          aria-label={`Book ${t.title}`}
                        >
                          Book
                          <ArrowRight size={13} className="transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover/cta:translate-x-1" />
                        </Link>
                        <Link
                          to="/tours/$tourId/tailor"
                          params={{ tourId: t.id }}
                          className="group/tailor inline-flex items-center justify-center gap-1.5 min-h-[44px] flex-1 px-4 text-[12px] uppercase tracking-[0.18em] font-semibold border border-[color:var(--charcoal)]/25 text-[color:var(--charcoal)] hover:border-[color:var(--charcoal)] hover:bg-[color:var(--sand)] transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] rounded-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2"
                          aria-label={`Tailor ${t.title}`}
                        >
                          Tailor
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {/* Mobile-only swipe hint */}
          <p className={scrollDebug.staticMobileCarousels ? "hidden" : "sm:hidden mt-4 text-center text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal)]"}>
            Swipe to explore
          </p>

          <div className="mt-12 md:mt-14 text-center">
            <Link
              to="/experiences"
              className="group inline-flex items-center gap-2.5 sm:gap-2 min-h-[44px] px-1 text-[12.5px] sm:text-[13px] uppercase tracking-[0.16em] sm:tracking-[0.18em] font-semibold text-[color:var(--charcoal)] border-b-2 border-[color:var(--charcoal)]/40 pb-1 hover:border-[color:var(--charcoal)] transition-colors"
            >
              See every Signature
              <ArrowRight size={14} className="transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6 — PROPOSALS / CELEBRATIONS / CORPORATE / MULTI-DAY
          One combined editorial band — Proposals, Celebrations,
          Corporate & Groups, and Multi-Day routes — so every "bigger
          occasion" path lives together with clear hierarchy. */}
      <section
        id="occasions"
        className="he-section-rule section-enter section-y bg-[color:var(--sand)] border-b border-[color:var(--border)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="groups-title"
      >
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-10 md:mb-12">
            <span className="he-eyebrow-bar mb-5">Groups &amp; celebrations</span>
            <h2 id="groups-title" className="serif mt-3 text-[2rem] sm:text-[2.4rem] md:text-[3.6rem] leading-[1.1] md:leading-[1.02] tracking-[-0.016em] text-[color:var(--charcoal)] font-medium">
              For moments bigger than a <span className="italic">tour.</span>
            </h2>
            <p className="mt-4 text-[14.5px] md:text-[16px] text-[color:var(--charcoal-soft)] leading-[1.65] max-w-md mx-auto">
              Proposals, celebrations, corporate groups and multi-day journeys — shaped with local care.
            </p>
          </div>

          {/* Three premium feature blocks — alternating image/text on
              tablet+, stacked image-then-text on mobile. Each block:
              animated category label, soft gold divider, bold serif
              headline, body with one highlighted phrase, italic pull
              line, gold detail line, CTA with arrow nudge. */}
          <div className="max-w-6xl mx-auto flex flex-col gap-12 md:gap-16">
            {groupsAndCelebrations.map((m, i) => {
              const reverse = i % 2 === 1;
              return (
                <article
                  key={m.eyebrow}
                  id={m.id}
                  className="reveal-stagger he-seq group grid grid-cols-1 md:grid-cols-12 gap-7 md:gap-12 items-center scroll-mt-24 md:scroll-mt-28"
                >
                  {/* Image side */}
                  <Link
                    to={m.to}
                    aria-label={m.cta}
                    onMouseMove={(e) => {
                      // Pointer-aware micro-tilt: max ±2.5deg, dampened.
                      const el = e.currentTarget as HTMLElement;
                      const r = el.getBoundingClientRect();
                      const px = (e.clientX - r.left) / r.width - 0.5;
                      const py = (e.clientY - r.top) / r.height - 0.5;
                      el.style.setProperty("--tilt-y", `${(px * 5).toFixed(2)}deg`);
                      el.style.setProperty("--tilt-x", `${(-py * 4).toFixed(2)}deg`);
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.setProperty("--tilt-y", "0deg");
                      el.style.setProperty("--tilt-x", "0deg");
                    }}
                    className={
                      "he-tilt relative block md:col-span-7 overflow-hidden rounded-[2px] border border-[color:var(--border)] bg-[color:var(--card)] transition-transform duration-300 ease-out group-hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 " +
                      (reverse ? "md:order-2" : "md:order-1")
                    }
                  >
                    <div className="he-image-cinema he-image-rise relative aspect-[4/3] md:aspect-[5/4] overflow-hidden">
                      <img
                        src={m.img}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.05]"
                      />
                      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/40 via-[color:var(--charcoal-deep)]/10 to-transparent" />
                      {/* Subtle animated category label — soft pulsing
                          gold dot signals "live / curated", and the pill
                          lifts gently on hover. */}
                      <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--ivory)]/95 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal)] shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                        <span aria-hidden="true" className="live-dot" />
                        {m.eyebrow}
                      </span>
                    </div>
                  </Link>

                  {/* Text side */}
                  <div
                    className={
                      "md:col-span-5 flex flex-col pt-1 md:pt-0 " +
                      (reverse ? "md:order-1" : "md:order-2")
                    }
                  >
                    {/* Soft gold divider — animates from left on reveal */}
                    <span aria-hidden="true" className="gold-rule mb-4 md:mb-5 max-w-[3rem] md:max-w-[3.5rem]" />
                    {(() => {
                      const accent =
                        m.id === "proposals" ? "var(--gold)" :
                        m.id === "celebrations" ? "var(--teal-2)" :
                        m.id === "corporate" ? "var(--teal)" :
                        m.id === "multi-day" ? "var(--gold-soft)" :
                        "var(--charcoal)";
                      return (
                        <>
                          <span className="inline-flex items-center gap-2.5 text-[10.5px] md:text-[10.5px] uppercase tracking-[0.24em] md:tracking-[0.3em] font-semibold text-[color:var(--charcoal-soft)]">
                            <span aria-hidden="true" className="inline-block h-[6px] w-[6px] rounded-full" style={{ backgroundColor: accent }} />
                            {m.eyebrow}
                          </span>
                          <h3 className="serif mt-3 text-[1.6rem] md:text-[2.1rem] leading-[1.14] md:leading-[1.08] tracking-[-0.014em] text-[color:var(--charcoal)] font-medium">
                            {m.title}
                          </h3>
                          <p className="mt-4 md:mt-4 text-[14.5px] md:text-[16px] leading-[1.65] md:leading-[1.7] text-[color:var(--charcoal-soft)]">
                            {m.line}
                          </p>
                          <p className="mt-4 md:mt-4 text-[13.5px] md:text-[14.5px] leading-[1.55] text-[color:var(--charcoal-soft)]">
                            {m.pull}
                          </p>
                          <p className="mt-5 md:mt-5 inline-flex items-center gap-2.5 text-[10.5px] md:text-[10.5px] uppercase tracking-[0.22em] md:tracking-[0.26em] font-semibold text-[color:var(--charcoal-soft)]">
                            <span aria-hidden="true" className="inline-block h-[6px] w-[6px] rounded-full" style={{ backgroundColor: accent }} />
                            {m.detail}
                          </p>
                          {/* What we handle — checklist of concrete deliverables.
                              Editorial, not form-y: tight serif label, gold/teal
                              ticks per accent, no boxes. */}
                          <p className="mt-7 md:mt-6 text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal-soft)]">
                            What we handle
                          </p>
                          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 list-none p-0">
                            {m.handles.map((h) => (
                              <li
                                key={h}
                                className="flex items-start gap-2 text-[13px] leading-[1.55] text-[color:var(--charcoal)]"
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-[2px] inline-flex shrink-0 items-center justify-center font-bold text-[12px]"
                                  style={{ color: accent }}
                                >
                                  ✓
                                </span>
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      );
                    })()}
                    <Link
                      to={m.to}
                      className="he-glow he-sheen he-cta-shift mt-7 md:mt-6 inline-flex items-center justify-center gap-2.5 sm:gap-2 self-start bg-[color:var(--teal)] text-[color:var(--ivory)] border border-[color:var(--gold)]/55 px-6 sm:px-7 py-3.5 min-h-[48px] sm:min-h-[44px] text-[12.5px] sm:text-[13px] uppercase tracking-[0.18em] font-bold transition-colors duration-200 hover:bg-[color:var(--teal-2)] hover:text-[color:var(--ivory)] hover:border-[color:var(--gold)]/78 active:bg-[color:var(--charcoal)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-[color:var(--sand)] shadow-[0_8px_22px_-10px_rgba(41,91,97,0.65)]"
                    >
                      {m.cta}
                      <ArrowRight
                        size={14}
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </Link>
                    <p className="mt-3 text-[11.5px] leading-[1.55] text-[color:var(--charcoal-soft)]/85 font-normal">
                      {m.trust}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>


      {/* 7 — FAQ
          Reuses the shared FAQ component, which renders its own
          labelled landmark with visible expandable answers. The wrapper
          section below carries the spacing class the lock checks; the
          inner FAQ component carries aria-labelledby="faq-title". */}
      <section id="faq" className="py-16 md:py-20 scroll-mt-24 md:scroll-mt-28" aria-labelledby="faq-title">
        <FAQ />
      </section>

      {/* 8 — FINAL CTA — Talk to a local
          Distinct from the hero CTAs (Explore Signatures / Build) — this
          is the human escape hatch. No duplicate CTA band; one purpose,
          one button. */}
      <section
        id="final-cta"
        className="section-y relative overflow-hidden bg-[color:var(--sand)] text-[color:var(--charcoal)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="final-cta-title"
      >
        {/* Warm ivory→sand wash so the section reads as a chapter, not a
            block. Decorative + aria-hidden. No animation. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 0%, color-mix(in oklab, var(--ivory) 92%, transparent), transparent 70%)",
          }}
        />

        <div className="container-x relative">
          {/* Chapter divider above the card — gold dot + flanking rules */}
          <div className="reveal max-w-md mx-auto mb-10 md:mb-14" aria-hidden="true">
            <div className="chapter-divider"><span className="dot" /></div>
          </div>

          {/* Final CTA card — deep teal with champagne-gold hairline,
              gold top rule and a soft warm shadow. Editorial radius. */}
          <div className="reveal mx-auto max-w-2xl">
            <div
              className="relative overflow-hidden rounded-[6px] bg-[color:var(--teal)] text-[color:var(--ivory)] px-6 py-10 sm:px-10 sm:py-12 md:px-14 md:py-14 text-center"
              style={{
                /* Stronger gold hairline (was 55% → 72%) so the rim reads
                   as champagne jewelry, not a faint ghost line. */
                border: "1px solid color-mix(in oklab, var(--gold-deep) 72%, transparent)",
                boxShadow:
                  "0 1px 0 0 color-mix(in oklab, var(--gold) 30%, transparent) inset, " +
                  "0 24px 60px -28px rgba(41, 91, 97, 0.45), " +
                  "0 12px 28px -18px rgba(46, 46, 46, 0.18)",
              }}
            >
              {/* Soft inner radial — adds depth without flattening teal */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(70% 90% at 90% 0%, rgba(201,169,106,0.16), transparent 60%), " +
                    "radial-gradient(60% 80% at 5% 100%, rgba(0,0,0,0.22), transparent 65%)",
                }}
              />
              {/* Gold top rule — short, centered, the editorial signature */}
              <div
                aria-hidden="true"
                className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-24 md:w-32"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--gold-warm) 50%, transparent)",
                  opacity: 0.95,
                }}
              />

              <div className="relative">
                <span className="he-rule-flank text-[11px] uppercase tracking-[0.28em] font-bold text-[color:var(--gold-soft)]">
                  <MessageCircle size={12} aria-hidden="true" />
                  Prefer a conversation?
                </span>
              <h2
                id="final-cta-title"
                className="mt-5 text-[2rem] sm:text-[2.4rem] md:text-[3.2rem] leading-[1.1] md:leading-[1.02] tracking-[-0.016em] font-bold text-[color:var(--ivory)]"
              >
                  Ready to design your{" "}
                  <span className="italic font-normal text-[color:var(--gold-soft)] serif">
                    Portugal?
                  </span>
                </h2>
                <p className="mt-5 text-[15.5px] md:text-[17px] leading-[1.7] text-[color:var(--ivory)]/90 max-w-md mx-auto">
                  Start in the Studio, explore a Signature, or talk to a local.
                </p>
                <div className="mt-9 flex flex-col sm:flex-row gap-y-4 gap-x-4 justify-center items-stretch sm:items-center">
                  <Link
                    to="/builder"
                    className="he-glow he-sheen he-cta-shift group inline-flex items-center justify-center gap-2.5 bg-[color:var(--ivory)] text-[color:var(--charcoal-deep)] px-7 py-3.5 min-h-[48px] text-[12.5px] sm:text-[13px] uppercase tracking-[0.18em] font-bold rounded-[2px] transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:bg-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--teal)]"
                    style={{
                      border: "1px solid color-mix(in oklab, var(--gold-deep) 65%, transparent)",
                      boxShadow:
                        "inset 0 0 0 1px color-mix(in oklab, var(--gold) 25%, transparent), " +
                        "0 8px 22px -10px rgba(0,0,0,0.45)",
                    }}
                  >
                    Create Your Story
                    <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/contact"
                    className="he-glow he-sheen group inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] text-[12.5px] sm:text-[13px] uppercase tracking-[0.18em] font-bold rounded-[2px] text-[color:var(--ivory)] transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:bg-[color:var(--ivory)]/10 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--teal)]"
                    style={{
                      border: "1px solid color-mix(in oklab, var(--gold) 65%, transparent)",
                    }}
                  >
                    Talk to a Local
                    <ArrowRight size={12} aria-hidden="true" className="transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-1" />
                  </Link>
                </div>
                <p className="mt-6 text-[13px] italic text-[color:var(--ivory)]/85">
                  Need help shaping it? A local is one message away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </SiteLayout>
  );
}
