import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { FAQ } from "@/components/FAQ";

import heroImg from "@/assets/hero-coast.jpg";

// Real Viator-sourced tour photography — every card maps to an actual
// Signature tour. No stock or invented imagery.
import imgArrabidaWineLunch from "@/assets/tours/arrabida-wine-allinclusive/lunch.jpg";
import imgTroiaBeach from "@/assets/tours/troia-comporta/beach.jpg";
import imgFatimaNazare from "@/assets/tours/fatima-nazare-obidos/nazare.jpg";

import {
  ArrowRight,
  Star,
  Sparkles,
  CalendarDays,
  MapPin,
  MessageCircle,
  Compass,
  Feather,
  LifeBuoy,
} from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";
import { LiveMapPreview } from "@/components/LiveMapPreview";

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
  }));

/* ──────────────────────────────────────────────────────────────────
 * Moments / Groups preview — Multi-day, Proposals, Celebrations,
 * Corporate collapsed into a single band (see groupsAndCelebrations).
 * ────────────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────────────────
 * Moments / Groups preview — Multi-day, Celebrations, Corporate
 * collapsed into a single 3-card band.
 * ────────────────────────────────────────────────────────────── */
const groupsAndCelebrations = [
  {
    id: "proposals",
    eyebrow: "Proposals",
    title: "A private moment, shaped with care.",
    line: (<>From the setting to the timing, we help shape the moment around your story, with <span className="kw">local knowledge</span> and discreet support.</>),
    pull: "Designed for the moment, not the template.",
    detail: "Discreet · location of your choosing",
    handles: [
      "Location scouting",
      "Timing optimisation",
      "Surprise logistics",
      "Full discretion",
    ],
    trust: "Completed 50+ proposals · 100% success rate",
    cta: "Plan a Proposal",
    to: "/proposals",
    img: imgArrabidaWineLunch,
  },
  {
    id: "celebrations",
    eyebrow: "Celebrations",
    title: "For days worth remembering.",
    line: (<>Birthdays, anniversaries, honeymoons or family moments — shaped around <span className="kw">your rhythm</span>, your people and the way you want to feel Portugal.</>),
    pull: "Your people, your pace, your Portugal.",
    detail: "Up to 14 guests · private host",
    handles: [
      "Group coordination",
      "Multi-activity planning",
      "Flexible scheduling",
      "Personal touches",
    ],
    trust: "Up to 14 guests · private host available",
    cta: "Plan a Celebration",
    to: "/proposals",
    img: imgFatimaNazare,
  },
  {
    id: "corporate",
    eyebrow: "Corporate & Groups",
    title: "Private group days, without the generic formula.",
    line: (<>For teams, incentives and private groups, we combine local experiences, timing, transport and logistics into a day that feels <span className="kw">effortless</span>.</>),
    pull: "End to end, handled by a local team.",
    detail: "Up to 30 pax · invoice & DMC support",
    handles: [
      "Full logistics management",
      "Group experience design",
      "Transport coordination",
      "Invoice & DMC support",
    ],
    trust: "Up to 30 guests · full team coordination",
    cta: "Plan a Group Experience",
    to: "/corporate",
    img: imgFatimaNazare,
  },
  {
    id: "multi-day",
    eyebrow: "Multi-day",
    title: "Routes across Portugal.",
    line: (<>Two to seven days, real driving times, real overnight stops — designed in conversation with a <span className="kw">local team</span>.</>),
    pull: "More than a day. A real journey.",
    detail: "2–7 days · local-designed",
    handles: [
      "Route planning",
      "Real driving times",
      "Curated overnight stops",
      "Local team support",
    ],
    trust: "Designed in conversation with a local team",
    cta: "Browse multi-day routes",
    to: "/multi-day",
    img: imgTroiaBeach,
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
 * HOMEPAGE — 10 sections (Patch 2C — Why YES inserted)
 * 1. Hero
 * 2. Trust strip
 * 3. Why YES — editorial manifesto (5 blocks)
 * 4. Start here decision block
 * 5. Signature experiences preview
 * 6. Experience Studio preview
 * 7. Multi-day tours
 * 8. Groups & celebrations
 * 9. FAQ
 * 10. Final CTA — Talk to a local
 * ════════════════════════════════════════════════════════════ */
function HomePage() {
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
    "why-yes",
    "builder",
    "proposals",
    "celebrations",
    "corporate",
    "reviews",
    "faq",
  ] as const;

  const HASH_ALIASES: Record<string, string> = {
    proposal: "proposals",
    celebration: "celebrations",
    corporate: "corporate",
    groups: "corporate",
    group: "corporate",
    review: "reviews",
    "why-yes": "why-yes",
    whyyes: "why-yes",
    why: "why-yes",
    studio: "builder",
    build: "builder",
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

    const scrollToHash = (rawHash: string, smooth: boolean) => {
      // Lock for ~1100ms — long enough for browsers' native smooth scroll
      // (~600–900ms on long pages) plus a safety buffer.
      (window as unknown as Record<string, number>)[getLockKey()] =
        performance.now() + 1100;

      let tries = 0;
      const tick = () => {
        if (cancelled) return;
        const el = resolveTarget(rawHash);
        if (el) {
          el.scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
            block: "start",
          });
          // Re-arm the lock once we actually scroll, since route
          // hydration may have just happened (clock effectively reset).
          (window as unknown as Record<string, number>)[getLockKey()] =
            performance.now() + 1100;
          // Normalise the URL to the canonical id (e.g. #proposal → #proposals)
          const canonical =
            HASH_ALIASES[rawHash.toLowerCase()] ?? rawHash.toLowerCase();
          if (canonical && `#${canonical}` !== window.location.hash) {
            window.history.replaceState(
              window.history.state,
              "",
              window.location.pathname +
                window.location.search +
                `#${canonical}`,
            );
          }
          return;
        }
        // Section not in DOM yet (images loading, lazy chunk). Poll up to
        // ~1.6s — enough for hero image + above-the-fold paint.
        if (++tries < 20) {
          timer = window.setTimeout(tick, 80);
        }
      };
      // Wait one frame so layout settles, then start trying.
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

  // Effect 2 — hash sync as the user scrolls. Per-section observer with
  // a thin "anchor band" near the top of the viewport. The chosen
  // section is whichever one currently *contains* the anchor line; if
  // none does (between sections), the section closest above wins.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;

    const targets = TRACKED_IDS.map((id) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;

    // Anchor line: just below the fixed navbar. Tuned per breakpoint so
    // it always sits a comfortable distance under the chrome on phones,
    // tablets and desktop — matching the scroll-mt offsets on sections.
    const anchorOffsetPx = () => {
      const w = window.innerWidth;
      if (w < 768) return 96; // mobile navbar ~64px + breathing room
      if (w < 1280) return 112; // tablet
      return 128; // desktop
    };

    let raf = 0;
    let lastWritten = window.location.hash;

    const compute = () => {
      raf = 0;
      const lockUntil =
        ((window as unknown as Record<string, number>)[getLockKey()] ?? 0);
      if (performance.now() < lockUntil) return;

      const anchor = anchorOffsetPx();
      const viewportH = window.innerHeight;

      // Find the section whose [top, bottom) range contains the anchor
      // line. Fallback: the closest section above the anchor.
      let chosenId = "";
      let bestAboveDistance = Infinity;

      for (const el of targets) {
        const rect = el.getBoundingClientRect();
        // Skip sections that are completely off-screen below.
        if (rect.top > viewportH) continue;
        // Section currently under the anchor line — winner.
        if (rect.top <= anchor && rect.bottom > anchor) {
          chosenId = el.id;
          break;
        }
        // Otherwise track the section whose top is closest to (but above)
        // the anchor line, so we keep a sensible hash between sections.
        if (rect.top <= anchor) {
          const d = anchor - rect.top;
          if (d < bestAboveDistance) {
            bestAboveDistance = d;
            chosenId = el.id;
          }
        }
      }

      // Don't write a hash before the first tracked section comes into
      // view (keeps the URL clean while the user is still on the hero).
      const firstRect = targets[0].getBoundingClientRect();
      if (firstRect.top > anchor) {
        if (window.location.hash) {
          window.history.replaceState(
            window.history.state,
            "",
            window.location.pathname + window.location.search,
          );
          lastWritten = "";
        }
        return;
      }

      const next = chosenId ? `#${chosenId}` : "";
      if (next !== lastWritten && next !== window.location.hash) {
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname + window.location.search + next,
        );
        lastWritten = next;
      } else if (next !== lastWritten) {
        lastWritten = next;
      }
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(compute);
    };

    // Triggers: scroll, resize, and any IO callback (covers lazy content
    // shifting layout). IO uses many thresholds across the anchor band so
    // we get callbacks at the right moments without needing a scroll
    // listener at all on capable browsers — but we add a passive scroll
    // listener too for buttery responsiveness during fast scrolls.
    const io = new IntersectionObserver(schedule, {
      threshold: [0, 0.05, 0.15, 0.3, 0.5, 0.75, 1],
      // Negative top margin = anchor band starts ~96–128px down.
      // Negative bottom margin = ignore sections that are still mostly
      // in the lower third of the viewport (gives the section above
      // priority until the new one truly takes over).
      rootMargin: "-96px 0px -55% 0px",
    });
    targets.forEach((el) => io.observe(el));

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // First pass after mount.
    schedule();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 3 — homepage-only parallax driver. Writes `--parallax-y` to
  // every `.he-parallax` / `.he-parallax-counter` element via rAF on
  // scroll. Disabled for prefers-reduced-motion. Caps travel so it
  // stays "everyday", never woozy.
  useEffect(() => {
    if (typeof window === "undefined") return;
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
        className="relative min-h-[80vh] md:min-h-[94vh] flex items-end overflow-hidden"
      >
        <img
          src={heroImg}
          alt="Hidden coastal road in Portugal at golden hour"
          className="he-parallax absolute inset-0 w-full h-full object-cover object-center"
          width={1920}
          height={1080}
        />
        {/* Soft dark gradient — required by brief for any text-over-image. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/85 via-[color:var(--charcoal-deep)]/45 to-[color:var(--charcoal-deep)]/40 md:from-[color:var(--charcoal-deep)]/80 md:via-[color:var(--charcoal-deep)]/35 md:to-[color:var(--charcoal-deep)]/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,15,15,0.65)_0%,rgba(15,15,15,0.4)_35%,transparent_70%)] md:bg-[linear-gradient(90deg,rgba(15,15,15,0.6)_0%,rgba(15,15,15,0.32)_40%,transparent_72%)] pointer-events-none" />

        <div className="container-x relative z-10 pb-14 md:pb-36 pt-32 md:pt-40">
          <div className="max-w-3xl text-[color:var(--ivory)]">
            <span className="inline-flex items-center gap-2 sm:gap-3.5 max-w-full text-[9.5px] xs:text-[10.5px] sm:text-[12px] md:text-[13px] uppercase tracking-[0.12em] xs:tracking-[0.16em] sm:tracking-[0.26em] md:tracking-[0.3em] text-[color:var(--gold)] opacity-0 animate-[heroFade_1.1s_ease-out_0.3s_forwards]">
              <span aria-hidden="true" className="shrink-0">✦</span>
              <span data-hero-field="eyebrow" className="whitespace-nowrap truncate">
                {HERO_COPY.eyebrow}
              </span>
              <span aria-hidden="true" className="shrink-0">✦</span>
            </span>

            <h1
              data-hero-field="headlineLine1 headlineLine2"
              className="hero-h1 serif mt-7 md:mt-10 text-[2.05rem] sm:text-5xl md:text-7xl lg:text-[5.4rem] leading-[1.08] sm:leading-[1.04] md:leading-[0.96] tracking-[-0.012em] text-[color:var(--ivory)] text-left opacity-0 animate-[heroFade_1.4s_ease-out_0.6s_forwards] [text-shadow:0_2px_18px_rgba(0,0,0,0.35)]"
            >
              <span data-hero-field="headlineLine1" className="block">
                {HERO_COPY.headlineLine1}
              </span>
              <span
                data-hero-field="headlineLine2"
                className="block italic font-medium text-[color:var(--gold-soft)] mt-1.5 md:mt-1 text-[2.2rem] sm:text-[3.4rem] md:text-[5rem] lg:text-[5.7rem] tracking-[-0.018em] leading-[1.05] md:leading-[0.96]"
              >
                {HERO_COPY.headlineLine2}
              </span>
            </h1>

            <p
              data-hero-field="subheadline"
              className="mt-8 md:mt-10 text-[17px] md:text-[22px] text-[color:var(--ivory)]/95 max-w-md md:max-w-lg leading-[1.6] md:leading-[1.75] font-light text-left opacity-0 animate-[heroFade_1.4s_ease-out_0.95s_forwards] [text-shadow:0_1px_8px_rgba(0,0,0,0.3)]"
            >
              {HERO_COPY.subheadline}
            </p>

            {/* CTAs — exactly two, per brief.
                Order swapped from the previous build: Signature first
                (Explore), Studio second (Build), so the calmer choice
                leads. Both kept full-width on mobile, equal-width on
                desktop, with identical internal anatomy. */}
            <div className="mt-12 md:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-4 w-full max-w-sm sm:max-w-xl opacity-0 animate-[heroFade_1.4s_ease-out_1.25s_forwards]">
              <Link
                to="/experiences"
                data-hero-field="primaryCta"
                className="hero-cta-button cta-primary he-glow he-sheen group relative inline-flex w-full sm:flex-1 sm:basis-0 items-center justify-between gap-3 text-left"
              >
                <span className="block">Explore Signature Experiences</span>
                <ArrowRight
                  size={16}
                  className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/builder"
                data-hero-field="secondaryCta"
                className="hero-cta-button cta-secondary-dark he-glow he-sheen group relative inline-flex w-full sm:flex-1 sm:basis-0 items-center justify-between gap-3 text-left"
              >
                <span className="block">Build your private journey</span>
                <ArrowRight
                  size={16}
                  className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="hero-rhythm-cta-to-microcopy max-w-sm sm:max-w-xl mx-auto sm:mx-0 opacity-0 animate-[heroFade_1.4s_ease-out_1.5s_forwards]">
              <p
                data-hero-field="microcopy"
                className="text-[14px] md:text-[14.5px] text-[color:var(--ivory)] leading-[1.65] md:leading-[1.7] font-normal tracking-[0.005em] text-center sm:text-left"
              >
                {HERO_COPY.microcopy}
              </p>
              <p className="mt-3 text-[13px] md:text-[13px] text-[color:var(--ivory)]/85 italic leading-[1.65] text-center sm:text-left">
                Prefer guidance?{" "}
                <Link
                  to="/contact"
                  className="link-soft link-soft--persistent text-[color:var(--ivory)]"
                >
                  A local designer can shape it with you.
                </Link>
              </p>
            </div>

            {/* Brand signature — rendered ONCE (Patch 2A dedup).
                The visible split is the only copy of the line; SRs read
                it via aria-label on the wrapper. */}
            <div className="hero-rhythm-microcopy-to-signature mb-2 md:mb-2 mt-8 md:mt-10 flex justify-center opacity-0 animate-[heroFade_1.4s_ease-out_1.75s_forwards]">
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
                  <Star key={i} size={15} fill="currentColor" strokeWidth={0} aria-hidden="true" focusable="false" />
                ))}
              </p>
              <p className="serif text-[1.35rem] md:text-[1.55rem] text-[color:var(--charcoal)] leading-[1.2]">
                700+ <span className="italic">five-star reviews</span>
                <span className="hidden md:inline text-[color:var(--charcoal-soft)]"> · </span>
                <span className="block md:inline text-[12px] md:text-[13px] uppercase tracking-[0.22em] font-semibold text-[color:var(--charcoal)] md:ml-1 mt-1 md:mt-0">
                  Private locals · designed in Portugal
                </span>
              </p>
            </div>
            <ul
              className="flex flex-wrap items-center justify-center md:justify-end gap-x-7 gap-y-3 md:gap-x-9 list-none p-0 h-7 md:h-8"
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

      {/* 3 — WHY YES
          Editorial manifesto: one title, one intro, five asymmetric
          blocks that bring together personalization, local knowledge,
          proximity, the choose/book innovation, and the simple-and-
          supported reassurance. Premium, human, intelligent — not a
          features grid. Soft fade-in only, no bounce, no parallax. */}
      <section
        id="why-yes"
        className="section-y bg-[color:var(--ivory)] border-b border-[color:var(--border)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="why-yes-title"
      >
        <div className="container-x">
          <div className="reveal max-w-2xl mx-auto text-center mb-12 md:mb-16">
            <span className="he-eyebrow-bar mb-5">Why YES</span>
            <h2
              id="why-yes-title"
              className="serif mt-3 text-[2.55rem] md:text-[4.15rem] leading-[1.0] tracking-[-0.02em] text-[color:var(--charcoal)] font-semibold text-balance"
            >
              Portugal isn't experienced the{" "}
              <span className="italic">same way</span> by everyone.
            </h2>
            <p className="mt-6 text-[15.5px] md:text-[17px] text-[color:var(--charcoal)] leading-[1.7] max-w-xl mx-auto">
              For some, it's wine. For others, the coast, history, food, or a moment that matters. Because no two people experience Portugal the same way, we chose to do things differently — not just in how we guide you, but in how you choose and create your experience from the very beginning.
            </p>
          </div>

          {/* Modular block grid — 5 premium editorial cards. 2-col desktop,
              stacked mobile. Each card: number, icon, label, serif headline,
              body. Scroll-stagger fade+rise via .reveal-stagger (cadence
              applied by SiteLayout). Hover: lift, warmer border, gold
              underline sweep. */}
          <ul className="he-stagger max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 list-none p-0">
            {[
              {
                Icon: Feather,
                num: "01",
                label: "Personal",
                title: (<>You shape the <span className="italic">story.</span></>),
                body: (<>Portugal becomes what you want it to be — a <span className="kw">private</span> day, a proposal, a celebration, a corporate experience or a full journey. You choose what you want to feel, how you move, and who you share it with.</>),
                pull: "Designed around you, not a template.",
              },
              {
                Icon: MapPin,
                num: "02",
                label: "Place",
                title: (<>Portugal is the <span className="italic">stage.</span></>),
                body: (<>From iconic places to <span className="kw">hidden gems</span>, every moment is set in the right place, at the right time — whether it's something simple or something you'll never forget.</>),
                pull: "The right place, at the right hour.",
              },
              {
                Icon: Compass,
                num: "03",
                label: "Local",
                title: (<>Local, from the <span className="italic">very beginning.</span></>),
                body: (<>Everything is guided by real <span className="kw">local</span> knowledge — with proximity, care and the kind of insight that only comes from living it.</>),
                pull: "Locals on the ground, not call-centres.",
              },
              {
                Icon: Sparkles,
                num: "04",
                label: "How you choose",
                title: (<>A different way to <span className="italic">choose.</span></>),
                body: (<>Start from a Signature, tailor selected details, or build your experience from scratch in the Studio — shaping it step by step, in <span className="kw">real time</span>.</>),
                pull: "Choose, tailor, or build — your call.",
              },
              {
                Icon: LifeBuoy,
                num: "05",
                label: "Supported",
                title: (<>Simple, clear, <span className="italic">supported.</span></>),
                body: (<>Even if this feels new, it's designed to be easy. You decide at <span className="kw">your rhythm</span>, with <span className="kw">local guidance</span> whenever you want it.</>),
                pull: "A local is one message away.",
                wide: true,
              },
            ].map((b) => (
              <li
                key={b.num}
                className={
                  "reveal-stagger he-card-lift group relative flex flex-col rounded-[6px] border border-[#E7DDD0] bg-[color:var(--ivory)] p-7 md:p-9 shadow-[0_1px_2px_rgba(46,46,46,0.04)] overflow-hidden " +
                  (b.wide ? "md:col-span-2" : "")
                }
              >
                {/* Animated gold rule — draws in on reveal */}
                <span aria-hidden="true" className="gold-rule absolute left-0 top-0" />
                {/* Gold sweep underline on hover (desktop) */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 bottom-0 h-px w-full origin-left scale-x-0 bg-[color:var(--gold)]/60 transition-transform duration-500 ease-out group-hover:scale-x-100"
                />
                <div className="flex items-start justify-between gap-4 pr-1">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--gold)]/35 bg-[color:var(--ivory)] transition-colors duration-300 group-hover:border-[color:var(--gold)]/70">
                    <b.Icon
                      size={18}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className="text-[color:var(--teal)] transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="he-num">
                    {b.num}
                  </span>
                </div>
                <span className="mt-5 text-[10.5px] uppercase tracking-[0.32em] font-semibold text-[color:var(--charcoal)]">
                  {b.label}
                </span>
                <h3 className="serif mt-3 text-[1.6rem] md:text-[1.95rem] leading-[1.18] text-[color:var(--charcoal)] font-semibold">
                  {b.title}
                </h3>
                <p className="mt-3.5 text-[15px] md:text-[15.5px] text-[color:var(--charcoal)] leading-[1.65]">
                  {b.body}
                </p>
                {/* One bold highlighted phrase per card */}
                <p className="he-pull mt-5 serif italic text-[15px] md:text-[16px] leading-[1.45] text-[color:var(--charcoal)]">
                  {b.pull}
                </p>
              </li>
            ))}
          </ul>

          {/* Closing microline */}
          <p className="reveal mt-10 md:mt-12 text-center inline-flex flex-wrap w-full items-center justify-center gap-x-2 gap-y-1 px-4 text-[10.5px] xs:text-[11.5px] sm:text-[12px] uppercase tracking-[0.18em] xs:tracking-[0.22em] sm:tracking-[0.28em] text-[color:var(--teal)]">
            <MessageCircle size={13} aria-hidden="true" className="shrink-0" />
            <span className="text-balance">A local is always one message away</span>
          </p>
        </div>
      </section>


      {/* 4 — EXPERIENCE STUDIO PREVIEW
          One clean band: map + route + summary. No "live" claim, no
          decorative blobs, no glow. Emphasizes route realism, timing,
          and human support. */}
      <section
        id="builder"
        className="section-y-lg bg-[color:var(--sand)] border-b border-[color:var(--border)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="studio-title"
      >
        <div className="container-x">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
            <div className="reveal lg:col-span-5">
              <span className="he-eyebrow-bar mb-4">
                <span className="live-dot" aria-hidden="true" />
                Live preview
              </span>
              <h2 id="studio-title" className="serif mt-3 text-[2.5rem] md:text-[3.6rem] leading-[1.0] tracking-[-0.02em] text-[color:var(--charcoal)] font-semibold">
                Create your experience <span className="italic">in Portugal</span>.
              </h2>
              <p className="serif italic mt-3 text-[1.05rem] md:text-[1.25rem] leading-[1.3] text-[color:var(--charcoal)]/85">
                In real time. Your way.
              </p>
              <p className="mt-5 text-[15.5px] md:text-[17px] text-[color:var(--charcoal)] leading-[1.7] max-w-md">
                Three quick choices &mdash; <span className="kw">mood</span>, <span className="kw">who</span>, <span className="kw">intention</span>. We shape a real day on the map. You adjust everything.
              </p>
              <ol className="mt-6 grid grid-cols-3 gap-1.5 max-w-md" aria-label="Three steps">
                {["Mood", "Who", "Intention"].map((label, i) => (
                  <li key={label} className="flex flex-col gap-1.5">
                    <span aria-hidden="true" className="block h-[3px] bg-[color:var(--gold)]" />
                    <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[color:var(--charcoal)]/70 tabular-nums">
                      0{i + 1} · {label}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[12px] leading-[1.5] text-[color:var(--charcoal)]/65 max-w-md">
                A starting point will be created for you &mdash; you can adjust everything.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-4">
                <Link
                  to="/builder"
                  className="he-glow he-sheen he-cta-shift group inline-flex items-center gap-2.5 sm:gap-2 bg-[color:var(--teal)] text-[color:var(--ivory)] px-6 sm:px-7 py-3.5 min-h-[48px] sm:min-h-[44px] text-[12.5px] sm:text-[13px] uppercase tracking-[0.18em] font-bold hover:bg-[color:var(--teal-2)] shadow-[0_8px_22px_-10px_rgba(41,91,97,0.65)]"
                >
                  Start your experience
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/experiences"
                  className="inline-flex items-center gap-2.5 sm:gap-2 min-h-[44px] px-1 text-[12.5px] sm:text-[13px] uppercase tracking-[0.18em] font-bold text-[color:var(--charcoal)] border-b-2 border-[color:var(--charcoal)]/40 pb-1 hover:border-[color:var(--charcoal)] transition-colors"
                >
                  Start from a Signature
                </Link>
              </div>
              <p className="mt-5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] xs:text-[11px] uppercase tracking-[0.16em] xs:tracking-[0.2em] sm:tracking-[0.24em] text-[color:var(--teal)]">
                <MessageCircle size={12} aria-hidden="true" className="shrink-0" />
                <span className="text-balance">Local guidance available while you build</span>
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="he-parallax-counter relative aspect-[4/3] md:aspect-[16/11] overflow-hidden rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ivory)] shadow-[0_8px_24px_-12px_rgba(46,46,46,0.18)]">
                <LiveMapPreview />
                <div className="hidden md:flex absolute bottom-4 right-4 flex-col gap-1.5 rounded-[4px] border border-[color:var(--gold)]/30 bg-[color:var(--ivory)]/95 backdrop-blur-sm px-4 py-3 shadow-[0_6px_18px_-8px_rgba(0,0,0,0.35)] max-w-[14rem]">
                  <span className="inline-flex items-center gap-2 text-[9.5px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
                    <span className="live-dot" aria-hidden="true" />
                    Live draft
                  </span>
                  <span className="serif text-[15px] leading-[1.2] text-[color:var(--charcoal)]">
                    4 stops &middot; ~7h &middot; Lisbon &rarr; Algarve
                  </span>
                  <span className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[color:var(--charcoal)]">
                    Reviewed by a local
                  </span>
                </div>
              </div>
              <div className="reveal md:hidden mt-4 flex flex-col gap-1.5 rounded-[4px] border border-[color:var(--gold)]/35 bg-[color:var(--ivory)] px-4 py-3.5 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.28)]">
                <span aria-hidden="true" className="gold-rule mb-1 max-w-[2.5rem]" />
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] font-semibold text-[color:var(--gold)]">
                  <span className="live-dot" aria-hidden="true" />
                  Live draft
                </span>
                <span className="serif text-[15.5px] leading-[1.2] text-[color:var(--charcoal)]">
                  4 stops &middot; ~7h &middot; Lisbon &rarr; Algarve
                </span>
                <span className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[color:var(--charcoal)]">
                  Reviewed by a local
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — SIGNATURE EXPERIENCES PREVIEW
          Up to 4 real Signature tours. Each card uses the tour's real
          hero image (sourced from the matching Viator page), real title
          and real blurb from `signatureTours`. No vague taglines, no
          repeated labels. */}
      <section
        className="section-y bg-[color:var(--ivory)] border-b border-[color:var(--border)]"
        aria-labelledby="signatures-title"
      >
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="he-eyebrow-bar mb-5">Signature experiences</span>
            <h2 id="signatures-title" className="serif mt-3 text-[2.55rem] md:text-[4.15rem] leading-[1.0] tracking-[-0.02em] text-[color:var(--charcoal)] font-semibold">
              Days <span className="italic">already designed.</span>
            </h2>
            <p className="mt-5 text-[15.5px] md:text-[17px] text-[color:var(--charcoal)] leading-[1.65] max-w-md mx-auto">
              Confirm a Signature as it ships, or tailor a few details inside.
            </p>
          </div>

          {/* Mobile: full-bleed editorial cover carousel (scroll-snap, no
              autoplay — site-wide forbidden). Each card is 84vw so the
              next card peeks. Tablet+: keeps the calm 2/4-col grid.
              Same card markup; layout is the only thing that changes. */}
          <ul
            className="
              flex sm:grid sm:grid-cols-2 lg:grid-cols-4
              gap-5 md:gap-7
              list-none p-0
              -mx-5 px-5 sm:mx-0 sm:px-0
              overflow-x-auto sm:overflow-visible
              snap-x snap-mandatory sm:snap-none
              [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
            "
            aria-label="Signature experiences"
          >
            {signatures.map((t) => {
              const paceLabel = Array.isArray(t.pace) ? t.pace[0] : t.pace;
              const hook =
                paceLabel === "Relaxed"
                  ? "Unhurried, all in one day"
                  : paceLabel === "Energetic"
                    ? "Big day, real ground covered"
                    : "Designed end to end";
              return (
                <li
                  key={t.id}
                  className="snap-center shrink-0 w-[84vw] sm:w-auto sm:shrink"
                >
                  <Link
                    to="/tours/$tourId"
                    params={{ tourId: t.id }}
                    className="group relative flex flex-col h-full overflow-hidden rounded-[6px] border border-[color:var(--border)] bg-[color:var(--charcoal)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[color:var(--charcoal)]/30 hover:shadow-[0_14px_30px_-14px_rgba(46,46,46,0.28)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2"
                  >
                    {/* Cover image — full card, editorial 4:5 */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--card)]">
                      <img
                        src={t.img}
                        alt={t.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
                      />
                      {/* Bottom-anchored gradient for text legibility (≤45%) */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                      />

                      {/* Top row: region eyebrow + price badge */}
                      <div className="absolute inset-x-0 top-0 p-4 md:p-5 flex items-start justify-between gap-3">
                        <span className="text-[10px] uppercase tracking-[0.28em] text-white/85 drop-shadow-sm">
                          {t.region}
                        </span>
                        <span className="inline-flex items-baseline gap-1 rounded-full bg-[color:var(--ivory)]/95 px-2.5 py-1 text-[color:var(--charcoal)] shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
                          <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-[color:var(--charcoal)]">
                            From
                          </span>
                          <span className="serif text-[14px] leading-none">
                            €{t.priceFrom}
                          </span>
                        </span>
                      </div>

                      {/* Bottom block: catchy hook + title + duration + CTA */}
                      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white">
                        <span className="inline-block text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
                          {hook}
                        </span>
                        <h3 className="serif mt-2 text-[1.35rem] md:text-[1.45rem] leading-[1.18] text-white text-balance">
                          {t.title}
                        </h3>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-[11px] uppercase tracking-[0.22em] text-white/80">
                            {t.durationHours} · Private
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] font-semibold text-white">
                            View
                            <ArrowRight
                              size={12}
                              className="transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile-only swipe hint */}
          <p className="sm:hidden mt-4 text-center text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal)]">
            Swipe to explore
          </p>

          <div className="mt-12 md:mt-14 text-center">
            <Link
              to="/experiences"
              className="inline-flex items-center gap-2.5 sm:gap-2 min-h-[44px] px-1 text-[12.5px] sm:text-[13px] uppercase tracking-[0.16em] sm:tracking-[0.18em] font-semibold text-[color:var(--charcoal)] border-b-2 border-[color:var(--charcoal)]/40 pb-1 hover:border-[color:var(--charcoal)] transition-colors"
            >
              See every Signature
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 8 — GROUPS & CELEBRATIONS
          Proposals + Celebrations + Corporate together in one calm
          band of 3 cards — distinct from multi-day so each occasion
          type has clear hierarchy. */}
      <section
        className="section-y bg-[color:var(--sand)] border-b border-[color:var(--border)]"
        aria-labelledby="groups-title"
      >
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <span className="he-eyebrow-bar mb-5">Groups &amp; celebrations</span>
            <h2 id="groups-title" className="serif mt-3 text-[2.6rem] md:text-[4.2rem] leading-[1.0] tracking-[-0.02em] text-[color:var(--charcoal)] font-semibold">
              When the <span className="italic font-medium">occasion</span> is bigger.
            </h2>
            <p className="mt-5 text-[15.5px] md:text-[17px] text-[color:var(--charcoal)] leading-[1.6] max-w-md mx-auto">
              <strong className="font-semibold">Proposals</strong>, private <strong className="font-semibold">celebrations</strong> and <strong className="font-semibold">corporate groups</strong> — quietly planned by a local team.
            </p>
          </div>

          {/* Three premium feature blocks — alternating image/text on
              tablet+, stacked image-then-text on mobile. Each block:
              animated category label, soft gold divider, bold serif
              headline, body with one highlighted phrase, italic pull
              line, gold detail line, CTA with arrow nudge. */}
          <div className="max-w-6xl mx-auto flex flex-col gap-20 md:gap-24">
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
                        "var(--charcoal)";
                      return (
                        <>
                          <span className="inline-flex items-center gap-2.5 text-[11px] md:text-[10.5px] uppercase tracking-[0.28em] md:tracking-[0.32em] font-bold text-[color:var(--charcoal)]">
                            <span aria-hidden="true" className="inline-block h-[6px] w-[6px] rounded-full" style={{ backgroundColor: accent }} />
                            {m.eyebrow}
                          </span>
                          <h3 className="serif mt-4 md:mt-3 text-[2.2rem] md:text-[2.85rem] leading-[1.04] md:leading-[1.04] tracking-[-0.02em] text-[color:var(--charcoal)] font-semibold">
                            {m.title}
                          </h3>
                          <p className="mt-5 md:mt-4 text-[16px] md:text-[16.5px] leading-[1.65] md:leading-[1.7] text-[color:var(--charcoal)]">
                            {m.line}
                          </p>
                          <p className="he-pull mt-6 md:mt-5 serif italic text-[16.5px] md:text-[17px] leading-[1.45] text-[color:var(--charcoal)] font-semibold" style={{ borderLeftColor: accent }}>
                            {m.pull}
                          </p>
                          <p className="mt-6 md:mt-5 inline-flex items-center gap-2.5 text-[11px] md:text-[10.5px] uppercase tracking-[0.22em] md:tracking-[0.24em] font-bold text-[color:var(--charcoal)]">
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
                      className="he-glow he-sheen he-cta-shift mt-7 md:mt-6 inline-flex items-center justify-center gap-2.5 sm:gap-2 self-start bg-[color:var(--teal)] text-[color:var(--ivory)] px-7 sm:px-7 py-3.5 min-h-[48px] sm:min-h-[44px] text-[12.5px] sm:text-[13px] uppercase tracking-[0.18em] font-bold transition-colors duration-200 hover:bg-[color:var(--teal-2)] hover:text-[color:var(--ivory)] active:bg-[color:var(--charcoal)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-[color:var(--sand)] shadow-[0_8px_22px_-10px_rgba(41,91,97,0.65)]"
                    >
                      {m.cta}
                      <ArrowRight
                        size={14}
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </Link>
                    <p className="mt-3 text-[11px] leading-[1.5] text-[color:var(--charcoal-soft)] italic">
                      {m.trust}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8.5 — TRUSTMARY REVIEWS — Branded wrapper around verified reviews */}
      <TrustmarySection />

      {/* 9 — FAQ
          Reuses the shared FAQ component, which renders its own
          labelled landmark with visible expandable answers. The wrapper
          section below carries the spacing class the lock checks; the
          inner FAQ component carries aria-labelledby="faq-title". */}
      <section id="faq" className="py-20 md:py-24 scroll-mt-24 md:scroll-mt-28" aria-labelledby="faq-title">
        <FAQ />
      </section>

      {/* 10 — FINAL CTA — Talk to a local
          Distinct from the hero CTAs (Explore Signatures / Build) — this
          is the human escape hatch. No duplicate CTA band; one purpose,
          one button. */}
      <section
        className="section-y relative overflow-hidden bg-[color:var(--teal)] text-[color:var(--ivory)] pb-20 md:pb-24"
        aria-labelledby="final-cta-title"
      >
        {/* FINAL CTA — solid teal base with editorial texture so it
            doesn't read as a flat block:
              · radial gold glow top-right (very low opacity)
              · subtle linear darken bottom-left for depth
              · faint diagonal noise via SVG dataurl (≤4% opacity)
            All decorative + aria-hidden. Reduced-motion safe (no
            animation on the texture). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 80% at 88% 10%, rgba(201,169,106,0.18), transparent 60%), " +
              "radial-gradient(70% 90% at 10% 100%, rgba(0,0,0,0.28), transparent 65%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        {/* Soft gold hairline at the very top — editorial signature, not a banner */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 md:w-48 bg-gradient-to-r from-transparent via-[color:var(--gold)]/70 to-transparent"
        />

        <div className="container-x relative">
          <div className="reveal max-w-xl mx-auto text-center">
            <span className="he-rule-flank text-[10.5px] uppercase tracking-[0.28em] font-bold text-[color:var(--gold-soft)]">
              <MessageCircle size={12} aria-hidden="true" />
              Prefer a conversation?
            </span>
            <h2
              id="final-cta-title"
              className="mt-5 text-[2.4rem] md:text-[3.6rem] leading-[1.02] tracking-[-0.02em] font-bold text-[color:var(--ivory)]"
            >
              Ready to design your{" "}
              <span className="italic font-normal text-[color:var(--gold-soft)] serif">
                Portugal?
              </span>
            </h2>
            <p className="mt-5 text-[15px] md:text-[17px] leading-[1.7] text-[color:var(--ivory)]/90">
              Start in the Studio. Explore Signatures. Or talk to a local — your
              journey, your way.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-y-4 gap-x-4 justify-center items-stretch sm:items-center">
              <Link
                to="/builder"
                className="he-glow he-sheen he-cta-shift group inline-flex items-center justify-center gap-2.5 bg-[color:var(--ivory)] text-[color:var(--charcoal)] px-7 py-3.5 min-h-[48px] text-[12.5px] sm:text-[13px] uppercase tracking-[0.18em] font-bold rounded-[2px] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--teal)] shadow-[0_8px_22px_-10px_rgba(0,0,0,0.5)]"
              >
                <ArrowRight size={14} aria-hidden="true" />
                Open the Studio
              </Link>
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] text-[12.5px] sm:text-[13px] uppercase tracking-[0.18em] font-bold rounded-[2px] border-2 border-[color:var(--ivory)]/85 text-[color:var(--ivory)] transition-all duration-200 hover:bg-[color:var(--ivory)]/10 hover:border-[color:var(--ivory)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--teal)]"
              >
                Talk to a local
                <ArrowRight size={12} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
            <p className="mt-6 text-[13px] italic text-[color:var(--ivory)]/85">
              A local is one message away.
            </p>
          </div>
        </div>
      </section>
      </div>
    </SiteLayout>
  );
}
