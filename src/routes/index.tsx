import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteLayout } from "@/components/SiteLayout";
import { FAQ } from "@/components/FAQ";
import { useHeroParallax } from "@/hooks/use-hero-parallax";
import { useCtaScrollScale } from "@/hooks/use-cta-scroll-scale";
import {
  CtaScrollDebugOverlay,
  useCtaScrollDebugToggle,
} from "@/components/CtaScrollDebugOverlay";
import heroImg from "@/assets/hero-coast.jpg";
import multiDayImg from "@/assets/multi-day.jpg";
import expWine from "@/assets/exp-wine.jpg";
import expCoastal from "@/assets/exp-coastal.jpg";
import expStreet from "@/assets/exp-street.jpg";
import editCoastal from "@/assets/edit-coastal-road.jpg";
import editWinery from "@/assets/edit-winery.jpg";
import editMarket from "@/assets/edit-market.jpg";
import editViewpoint from "@/assets/edit-viewpoint.jpg";
import { ArrowRight, Star, Compass, Sparkles, PenLine, Heart, Lock, Wand2, Zap, BookOpen, Gift } from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";
import { HeroMetaProbe } from "@/components/HeroMetaProbe";
import { HeroCopyDiff } from "@/components/HeroCopyDiff";
import { HeroVerifyOverlay } from "@/components/HeroVerifyOverlay";
import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";

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
      {
        name: "description",
        content: HERO_COPY.subheadline,
      },
      { property: "og:title", content: "Portugal is the stage. You write the story. — YES experiences" },
      {
        property: "og:description",
        content: HERO_COPY.subheadline,
      },
      { property: "twitter:title", content: "Portugal is the stage. You write the story. — YES experiences" },
      { property: "twitter:description", content: HERO_COPY.subheadline },
      { property: "og:image", content: heroImg },
      { property: "twitter:image", content: heroImg },
    ],
  }),
  component: HomePage,
});

const signatures = [
  {
    title: "A Day in Hidden Douro",
    img: expWine,
    line: "Family wineries, schist terraces, a long lunch above the river — far from the bus routes.",
    pace: ["Morning vineyard walk", "Long table lunch", "Sunset tasting"],
  },
  {
    title: "Wild Atlantic Coast",
    img: expCoastal,
    line: "Coastal roads only locals drive, a fishermen's lunch, a hidden cove with no one else in sight.",
    pace: ["Cliff walk", "Seafood by the harbor", "Hidden cove"],
  },
  {
    title: "Lisbon Through Locals",
    img: expStreet,
    line: "The Lisbon postcards never see — quiet neighborhoods, ateliers and family-run tascas.",
    pace: ["Morning market", "Artisan visit", "Family tavern lunch"],
  },
];

const editorial = [
  {
    title: "Hidden Coastal Roads",
    line: "The drive from Sintra to Cabo da Roca that no guidebook quite gets right.",
    img: editCoastal,
  },
  {
    title: "Family Wineries",
    line: "Three generations, one cellar door, a glass poured by the winemaker himself.",
    img: editWinery,
  },
  {
    title: "Local Markets at Dawn",
    line: "Where breakfast is a pastel de nata and the day's plan is written on a napkin.",
    img: editMarket,
  },
  {
    title: "Secret Viewpoints",
    line: "A bend in the road. A stone wall. The whole valley below — and nobody else.",
    img: editViewpoint,
  },
];

const howItWorks = [
  {
    step: "01",
    icon: BookOpen,
    title: "Start with an idea, a place or a plan",
    line: "A signature, a region, or a blank slate — wherever feels right.",
  },
  {
    step: "02",
    icon: PenLine,
    title: "Shape it your way, in real time",
    line: "Adjust the pace, the stops, the people you meet — as you go.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Confirm instantly — no waiting",
    line: "No forms. No requests. The moment it feels right, it's yours.",
  },
];

const pillars = [
  {
    icon: Heart,
    title: "Local",
    line: "Designed and hosted by Portuguese locals — the people, places and pace only insiders know.",
  },
  {
    icon: Lock,
    title: "Private",
    line: "Always just your group. No strangers, no shared buses — every experience entirely yours.",
  },
  {
    icon: Wand2,
    title: "Tailored",
    line: "Built around how you travel — your pace, your interests, the moments that matter to you.",
  },
  {
    icon: Zap,
    title: "Instant",
    line: "Real-time creation. Instant confirmation. No requests, no waiting — your experience is locked the moment you say yes.",
  },
];

const startPaths = [
  {
    icon: BookOpen,
    eyebrow: "Instant · Ready",
    title: "Explore Signature Experiences",
    line: "Start from a curated plan and confirm instantly.",
    cta: "Explore",
    to: "/experiences",
    destination: "Signatures",
    expectedTo: "/experiences",
    ariaLabel:
      "Explore Signature Experiences — opens the Signatures catalog page, every experience confirms instantly",
    accent: "ivory" as const,
  },
  {
    icon: Wand2,
    eyebrow: "Instant · Tailored",
    title: "Tailor a Signature",
    line: "Adjust a curated plan to match your style.",
    cta: "Tailor it",
    to: "/experiences",
    destination: "Tailoring",
    expectedTo: "/experiences",
    ariaLabel:
      "Tailor a Signature — open the Signatures catalog, reshape every detail and confirm instantly",
    accent: "sand" as const,
  },
  {
    icon: Sparkles,
    eyebrow: "Instant · From scratch",
    title: "Build Your Own (Studio)",
    line: "Create everything in real time and confirm instantly.",
    cta: "Open Studio",
    to: "/builder",
    destination: "Studio",
    expectedTo: "/builder",
    ariaLabel: "Open the Studio — design your experience from scratch in real time and confirm instantly",
    accent: "teal" as const,
  },
  {
    icon: Gift,
    eyebrow: "Instant · Occasions",
    title: "Celebrations & Groups",
    line: "Proposals, anniversaries, corporate and private groups.",
    cta: "Plan",
    to: "/proposals",
    destination: "Celebrations",
    expectedTo: "/proposals",
    ariaLabel:
      "Plan a Celebration or Group experience — opens the Proposals, Celebrations and Groups page, confirms instantly",
    accent: "charcoal" as const,
  },
];

const reviews = [
  {
    quote:
      "It felt like traveling Portugal with a local friend. Every stop was somewhere we'd never have found ourselves.",
    name: "Sarah T.",
    location: "San Francisco",
    platform: "Google",
  },
  {
    quote:
      "Quiet luxury done properly. No itineraries shoved at us — just thoughtful, beautifully timed moments.",
    name: "Pierre L.",
    location: "Paris",
    platform: "TripAdvisor",
  },
  {
    quote:
      "Our 12 guests, fully private, completely seamless. They handled everything with extraordinary grace.",
    name: "Akiko M.",
    location: "Tokyo",
    platform: "Trustpilot",
  },
];

/**
 * Decision-card route validator.
 *
 * Cross-checks every entry in `startPaths` against its `expectedTo` route
 * at mount, logs the result to the console (one grouped `console.info`
 * per page load), and exposes a small visible status strip directly under
 * the card grid.
 *
 * The strip is rendered:
 *   • always in development (`import.meta.env.DEV`)
 *   • on production preview when the URL contains `?debug-routes`
 * Otherwise it stays hidden so end-users never see QA chrome.
 */
function RouteValidationStrip() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const debugFlag = params.has("debug-routes");
    const visible = import.meta.env.DEV || debugFlag;
    setShow(visible);

    // Always log — useful in production console even when the strip is hidden.
    const results = startPaths.map((p) => ({
      destination: p.destination,
      label: p.cta,
      to: p.to,
      expectedTo: p.expectedTo,
      ok: p.to === p.expectedTo,
    }));
    const allOk = results.every((r) => r.ok);
    /* eslint-disable no-console */
    console.groupCollapsed(
      `%c[YES] Decision-card route check — ${allOk ? "PASS ✓" : "FAIL ✗"}`,
      `color:${allOk ? "#2e7d32" : "#c62828"};font-weight:600`,
    );
    results.forEach((r) => {
      console.info(
        `${r.ok ? "✓" : "✗"} ${r.destination.padEnd(13)} → ${r.to}` +
          (r.ok ? "" : `  (expected ${r.expectedTo})`) +
          `   [label: "${r.label}"]`,
      );
    });
    console.groupEnd();
    /* eslint-enable no-console */
  }, []);

  if (!show) return null;

  const checks = startPaths.map((p) => ({
    destination: p.destination,
    to: p.to,
    expectedTo: p.expectedTo,
    label: p.cta,
    ok: p.to === p.expectedTo,
  }));
  const allOk = checks.every((c) => c.ok);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Decision card route validation"
      className="mt-10 max-w-6xl mx-auto border border-dashed border-[color:var(--border)] bg-[color:var(--card)] px-5 py-4 text-[12px] text-[color:var(--charcoal-soft)] font-mono"
    >
      <p className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.24em]">
        <span
          aria-hidden="true"
          className={`inline-block w-2 h-2 rounded-full ${
            allOk ? "bg-emerald-600" : "bg-red-600"
          }`}
        />
        Route validation — {allOk ? "all 4 paths OK" : "MISMATCH detected"}
      </p>
      <ul className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-2 list-none p-0">
        {checks.map((c) => (
          <li
            key={c.destination}
            className={`flex items-center justify-between gap-3 px-3 py-2 border ${
              c.ok
                ? "border-emerald-600/30 text-[color:var(--charcoal)]"
                : "border-red-600/40 text-red-700"
            }`}
          >
            <span className="font-semibold">{c.destination}</span>
            <span className="opacity-80">
              {c.to}
              {c.ok ? " ✓" : ` ✗ (expected ${c.expectedTo})`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HomePage() {
  // Pointer-driven parallax — writes --hero-px / --hero-py (-1 → 1) to the
  // section. Image and vignette read those vars via inline calc() to shift
  // gently without triggering layout. No-op on touch & reduced-motion.
  const heroRef = useHeroParallax<HTMLElement>();
  // Hero CTA scroll-driven scale.
  // Defaults: 0.96 → 1.015 across the first 280px of scroll, smoothstep
  // easing, hard-clamped. Override at runtime WITHOUT editing the hook
  // by setting any of these on the magnet group's style or on a parent
  // CSS scope: --cta-scroll-from, --cta-scroll-to, --cta-scroll-distance.
  // The hook re-reads them every rAF tick, so devtools edits show up live.
  const ctaGroupRef = useCtaScrollScale<HTMLDivElement>({
    from: 0.96,
    to: 1.015,
    distance: 280,
  });
  // QA overlay — toggle with Shift+D, or load with ?debug-cta. Renders
  // nothing in production unless explicitly enabled.
  const ctaDebug = useCtaScrollDebugToggle();

  return (
    <SiteLayout>
      {ctaDebug && <CtaScrollDebugOverlay targetRef={ctaGroupRef} />}
      {/* 1 — HERO
          Cinematic image, slow zoom, layered overlays for AA-compliant
          contrast on the headline and microcopy. A subtle pointer parallax
          shifts the image (≤8px) and the vignette focal point (±4%) for
          depth behind the CTAs without altering layout or contrast. */}
      <section
        ref={heroRef}
        className="relative min-h-[80vh] md:min-h-[94vh] flex items-end overflow-hidden"
      >
        {/* Hero image — held perfectly still (scale 1.08) for the full text
            fade-in cascade (~2.7s) via animation-delay + fill-mode: both, so
            the overlay stack composites against a stationary image during
            the legibility-critical window. After the cascade completes, the
            slow 32s zoom resumes its cinematic drift. The parallax transform
            is composited via a wrapper so it stacks cleanly with the zoom
            animation on the <img> itself (two transform owners, no fight). */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform:
              "translate3d(calc(var(--hero-px, 0) * -8px), calc(var(--hero-py, 0) * -6px), 0)",
            transition: "transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1)",
          }}
        >
          <img
            src={heroImg}
            alt="Hidden coastal road in Portugal at golden hour"
            className="absolute inset-0 w-full h-full object-cover object-center animate-[heroZoom_32s_ease-out_2.7s_both]"
            width={1920}
            height={1080}
          />
        </div>
        {/* Layered editorial wash — premium warmth without losing legibility.
            Overlays carry NO transitions and NO animations (except the
            vignette focal shift, which is a pure radial-gradient stop change
            that does NOT affect overall darkness). Their opacity, blend
            modes and gradient stops are otherwise locked from first paint,
            so the composited contrast behind text is identical at t=0 and
            at t=fade-end. Order matters: the brand soft-light tint sits
            FIRST (closest to the image) so subsequent darkening overlays
            aren't blended away. Then a base vertical wash, a left-anchored
            column behind the headline, and a barely-there corner vignette. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--teal)_18%,transparent)_0%,transparent_50%,color-mix(in_oklab,var(--gold)_10%,transparent)_100%)] mix-blend-soft-light pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/85 via-[color:var(--charcoal-deep)]/45 to-[color:var(--charcoal-deep)]/40 md:from-[color:var(--charcoal-deep)]/80 md:via-[color:var(--charcoal-deep)]/35 md:to-[color:var(--charcoal-deep)]/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,15,15,0.65)_0%,rgba(15,15,15,0.4)_35%,transparent_70%)] md:bg-[linear-gradient(90deg,rgba(15,15,15,0.6)_0%,rgba(15,15,15,0.32)_40%,transparent_72%)] pointer-events-none" />
        {/* Vignette with parallax-shifted focal point — the ellipse anchor
            slides ±4% in X and ±3% in Y so the "spotlight" subtly follows
            the cursor. Darkness stops (transparent_55% → rgba_0.3 at 100%)
            are unchanged, so total luminance behind text is preserved. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at calc(30% + var(--hero-px, 0) * 4%) calc(72% + var(--hero-py, 0) * 3%), transparent 55%, rgba(0,0,0,0.3) 100%)",
          }}
        />

        <div className="container-x relative z-10 pb-14 md:pb-36 pt-32 md:pt-40">
          <div className="max-w-3xl text-[color:var(--ivory)]">
            {/* Eyebrow — left-aligned with the same edge as the headline,
                subheadline, CTAs and microcopy (single hero content grid).
                Locked to one line on mobile via whitespace-nowrap +
                a smaller base size + tighter tracking. */}
            <span
              className="inline-flex items-center gap-2.5 sm:gap-3.5 whitespace-nowrap text-[10px] sm:text-[12px] md:text-[13px] uppercase tracking-[0.16em] sm:tracking-[0.26em] md:tracking-[0.3em] text-[color:var(--gold-soft)] opacity-0 animate-[heroFade_1.1s_ease-out_0.3s_forwards]"
            >
              <span aria-hidden="true" className="text-[color:var(--gold)]">✦</span>
              <span data-hero-field="eyebrow" className="whitespace-nowrap">
                {HERO_COPY.eyebrow}
              </span>
              <span aria-hidden="true" className="text-[color:var(--gold)]">✦</span>
            </span>

            {/* Headline — sits on a calm 32px gap from the eyebrow on
                mobile so the top line breathes without floating. Both
                spans share the same left edge as every other element in
                the hero column. */}
            <h1
              data-hero-field="headlineLine1 headlineLine2"
              className="hero-h1 serif mt-8 md:mt-10 text-[2.05rem] sm:text-5xl md:text-7xl lg:text-[5.4rem] leading-[1.02] md:leading-[0.96] tracking-[-0.012em] text-[color:var(--ivory)] text-left opacity-0 animate-[heroFade_1.4s_ease-out_0.6s_forwards]"
            >
              <span data-hero-field="headlineLine1" className="block">
                {HERO_COPY.headlineLine1}
              </span>
              <span
                data-hero-field="headlineLine2"
                className="block italic font-medium text-[color:var(--gold-soft)] mt-1 md:mt-1 text-[2.2rem] sm:text-[3.4rem] md:text-[5rem] lg:text-[5.7rem] tracking-[-0.018em]"
              >
                {HERO_COPY.headlineLine2}
              </span>
            </h1>

            {/* Subheadline — same left edge as the rest of the column.
                Mobile vertical rhythm: 40px from headline. */}
            <p
              data-hero-field="subheadline"
              className="mt-10 md:mt-10 text-[18px] md:text-[22px] text-[color:var(--ivory)]/90 max-w-lg leading-[1.7] md:leading-[1.75] font-light text-left opacity-0 animate-[heroFade_1.4s_ease-out_0.95s_forwards]"
            >
              {HERO_COPY.subheadline}
            </p>

            {/* CTA group.
                Mobile: stacked, both buttons full-width inside a shared
                max-w-sm rail so they have IDENTICAL width and IDENTICAL
                left/right edges, which sit on the same left edge as the
                eyebrow / headline / subheadline / microcopy.
                Desktop: side-by-side, equal-width via flex-1 + basis-0.
                Both buttons share the same internal layout: text centered,
                arrow absolutely pinned at right-5 in BOTH, identical
                padding (pl-9 pr-12 py-6) for a tactile, premium target,
                identical height + border.
                Vertical rhythm: 48px from subheadline (mt-12),
                16px between primary and secondary CTAs (gap-4) so they
                feel like a deliberate pair, not stacked-tight. */}
            <div
              ref={ctaGroupRef}
              className="cta-magnet-group mt-12 md:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-4 w-full max-w-sm sm:max-w-xl opacity-0 animate-[heroFade_1.4s_ease-out_1.25s_forwards]"
            >
              <Link
                to="/builder"
                data-hero-field="primaryCta"
                className="hero-cta-button cta-primary cta-attention cta-breathe group relative inline-flex w-full sm:flex-1 sm:basis-0 items-center justify-start text-left"
              >
                <span className="block">{HERO_COPY.primaryCta}</span>
                <ArrowRight
                  size={14}
                  className="absolute right-5 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
              <Link
                to="/experiences"
                data-cta-stagger
                data-hero-field="secondaryCta"
                className="hero-cta-button cta-secondary-dark cta-attention cta-breathe group relative inline-flex w-full sm:flex-1 sm:basis-0 items-center justify-start text-left"
              >
                <span className="block">{HERO_COPY.secondaryCta}</span>
                <ArrowRight
                  size={14}
                  className="absolute right-5 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
            </div>

            {/* Microcopy — pulled tighter to the CTA pair (28px on mobile
                via locked --hero-rhythm-cta-to-microcopy token) so it
                reads as a caption attached to the buttons, not a
                separate paragraph. Weight raised from 300 → 400 and
                size 13 → 14px for slightly higher contrast/legibility
                on the mobile dark surface. */}
            <div className="hero-rhythm-cta-to-microcopy max-w-sm sm:max-w-xl mx-auto sm:mx-0 opacity-0 animate-[heroFade_1.4s_ease-out_1.5s_forwards]">
              <p
                data-hero-field="microcopy"
                className="text-[14px] md:text-[14.5px] text-[color:var(--ivory)] leading-[1.75] md:leading-[1.7] font-normal tracking-[0.005em] text-center sm:text-left"
              >
                {HERO_COPY.microcopy}
              </p>
              <p className="mt-3 text-[12.5px] md:text-[13px] text-[color:var(--ivory)]/75 italic font-light leading-[1.7] text-center sm:text-left">
                Prefer guidance? <Link to="/contact" className="underline decoration-[color:var(--gold)]/60 underline-offset-4 hover:text-[color:var(--gold-soft)] transition-colors">A local designer can shape it with you.</Link>
              </p>
            </div>

            {/* Brand line — final centered editorial signature.
                Both halves now sit at almost-touching line gap (3px on
                mobile via --hero-rhythm-signature-line-gap) so they
                read as ONE signature, not two phrases. Line 2 ("We say
                YES.") carries slightly more weight + brighter gold than
                line 1 to land as the closing verdict, exactly as the
                brand directive requires. mb-2 (was mb-4) trims the
                empty void beneath the signature on mobile so the hero
                feels visually anchored. */}
            <div className="hero-rhythm-microcopy-to-signature mb-2 md:mb-2 flex justify-center opacity-0 animate-[heroFade_1.4s_ease-out_1.75s_forwards]">
              <div
                data-hero-field="brandLine"
                className="inline-flex items-center gap-5 md:gap-6 text-[color:var(--gold-soft)]"
              >
                <span className="h-px w-10 md:w-14 bg-gradient-to-r from-transparent to-[color:var(--gold)] shrink-0 opacity-80" />
                {/* Hidden full string for SEO / regression parity */}
                <span className="sr-only">{HERO_COPY.brandLine}</span>
                <span
                  aria-hidden="true"
                  className="hero-rhythm-signature-line-gap flex flex-col items-center text-[10.5px] md:text-[11px] uppercase tracking-[0.32em] leading-[1.2] text-center"
                >
                  <span style={{ fontWeight: 450 }}>Whatever you have in mind,</span>
                  <span
                    className="text-[color:var(--gold)] tracking-[0.36em] text-[12px] md:text-[12.5px]"
                    style={{ fontWeight: 600 }}
                  >
                    We say YES.
                  </span>
                </span>
                <span className="h-px w-10 md:w-14 bg-gradient-to-l from-transparent to-[color:var(--gold)] shrink-0 opacity-80" />
              </div>
            </div>

            {/* Hidden hero-copy probe.
                Not visible to users, but discoverable in DevTools or via
                document.querySelector('[data-hero-copy-version]'). Mirrors
                the X-Hero-Copy-Version response header and the
                yes-hero-copy-version meta tag, and also exposes the live
                rendered headline + subheadline so you can confirm a copy
                change shipped without leaving the preview.

                Quick checks (paste in the browser console):
                  const el = document.querySelector('[data-hero-copy-version]');
                  el.dataset.heroCopyVersion;   // hash
                  el.dataset.heroHeadline;      // "Portugal is the stage. You write the story."
                  el.dataset.heroSubheadline;   // full subheadline
            */}
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
              <span data-probe-field="headline">{HERO_COPY.headlineLine1} {HERO_COPY.headlineLine2}</span>
              {" | "}
              <span data-probe-field="subheadline">{HERO_COPY.subheadline}</span>
            </div>

            {/* JSON snapshot probe.
                Serializes the full HERO_COPY object (plus the version hash)
                into a single data attribute so you can diff copy changes
                quickly in the browser console:

                  const j = document.querySelector('[data-hero-copy-json]');
                  JSON.parse(j.dataset.heroCopyJson);

                Pair with `copy(...)` to grab the snapshot, then compare
                against an earlier capture (e.g. JSON.diff in DevTools or
                any text differ). Stable key order = clean diffs. */}
            <div
              data-hero-copy-json={JSON.stringify({
                version: HERO_COPY_VERSION,
                copy: HERO_COPY,
              })}
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
                // Inline JSON is also rendered as a <script type="application/json">
                // so it survives a "View Source" capture without HTML-escaping
                // mangling the quotes.
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(
                    { version: HERO_COPY_VERSION, copy: HERO_COPY },
                    null,
                    2,
                  ),
                }}
              />
            </div>

            {/* Live <head> mirror — exposes the actual title + meta tags
                that TanStack Router injected for this route. Stays in
                sync via a MutationObserver on document.head. */}
            <HeroMetaProbe />

            {/* Hidden diff helper — on mount, compares HERO_COPY to a
                localStorage baseline and logs changed fields. Manual
                controls live on `window.__heroCopy`. Renders nothing. */}
            <HeroCopyDiff />

            {/* Visual verify overlay — only renders when the URL has
                `?verify=hero`. Highlights every [data-hero-field] node
                against HERO_COPY_SPEC with green/amber/red badges and a
                summary legend. No layout impact when disabled. */}
            <HeroVerifyOverlay />
          </div>
        </div>
      </section>

      {/* 2 — TRUST BAR
          Reveal cadence is locked with explicit transitionDelay values so
          all six pieces (eyebrow → stars → supporting line → 3 marks)
          cascade in as ONE continuous sequence at the project-wide 110ms
          rhythm — even though they sit under two different DOM parents.
          The SiteLayout IntersectionObserver respects inline delays and
          only adds the .is-visible class, so motion stays restrained,
          smooth, and perfectly in time with every other section.
          Gold is used sparingly: just the 5 hero stars, the hairline
          vertical dividers between marks, and the tiny check inside
          each "Official platform" caption.

          Accessibility:
          • Section is a labelled landmark via aria-labelledby pointing to
            a visually-hidden heading.
          • The hero star row is a single role="img" with an explicit
            "Rated 5.0 out of 5 stars" label; the visual "5.0" glyph is
            aria-hidden so it isn't announced twice.
          • Each platform is a <figure> with a <figcaption>; the platform
            name carries aria-describedby pointing to its caption's id,
            so a screen reader announces e.g.
            "Google, Google — official review platform".
          • Decorative glyphs and column dividers are aria-hidden. */}
      <section
        className="bg-[color:var(--ivory)] border-b border-[color:var(--border)] py-16 md:py-20"
        aria-labelledby="trust-bar-title"
      >
        <h2 id="trust-bar-title" className="sr-only">
          Trusted by international travelers — 5.0 average rating
        </h2>

        <div className="container-x">
          {/* Intro: eyebrow → 5 gold stars + 5.0 → supporting line. */}
          <div className="flex flex-col items-center text-center gap-4">
            <p
              className="reveal-stagger text-[11px] uppercase tracking-[0.34em] text-[color:var(--charcoal)]"
              style={{ transitionDelay: "0ms" }}
              id="trust-bar-eyebrow"
            >
              Trusted by international travelers
            </p>

            <p
              className="reveal-stagger flex items-center gap-1 text-[color:var(--gold)]"
              style={{ transitionDelay: "110ms" }}
              role="img"
              aria-label="Rated 5 out of 5 stars"
            >
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill="currentColor"
                  strokeWidth={0}
                  aria-hidden="true"
                  focusable="false"
                />
              ))}
            </p>

            <p
              className="reveal-stagger text-[15px] text-[color:var(--charcoal-soft)] leading-[1.7]"
              style={{ transitionDelay: "220ms" }}
              id="trust-bar-summary"
            >
              700+ 5-star reviews
            </p>
          </div>

          {/* Platform marks — true 3-column grid; the three cells continue
              the same 110ms cadence (330 → 440 → 550 ms) so the whole
              Trust Bar reads as one unbroken reveal.
              Per brief: under each platform name we show an "Official
              platform" caption — a small hairline tag with a tiny gold
              checkmark — instead of repeating the star/rating badge that
              already appears once at the top of the section. */}
          <ul
            className="mt-12 mx-auto grid grid-cols-5 items-center list-none p-0 gap-x-1 sm:gap-x-3 max-w-[480px] sm:max-w-2xl"
            aria-label="Official review platforms"
          >
            {[
              { key: "google" as const },
              { key: "tripadvisor" as const },
              { key: "viator" as const },
              { key: "getyourguide" as const },
              { key: "trustpilot" as const },
            ].map((p, i) => {
              return (
                <li
                  key={p.key}
                  className="reveal-stagger flex items-center justify-center px-1 sm:px-2 py-2"
                  style={{ transitionDelay: `${330 + i * 90}ms` }}
                >
                  <div className="flex items-center justify-center h-8 sm:h-9 md:h-10 w-full">
                    <PlatformBadge platform={p.key} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 3 — START PATHS
          Four explicit product paths, surfaced immediately after the trust
          signal so the user understands every way they can engage with the
          brand. Mobile: 2-up grid. Desktop: 4-up. The Studio card is the
          visually distinct teal card to anchor the "build from scratch"
          path as the most differentiated option. */}
      <section
        className="py-24 md:py-32 bg-[color:var(--ivory)] border-b border-[color:var(--border)]"
        aria-labelledby="start-paths-title"
      >
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="eyebrow">Four ways in</span>
            <h2
              id="start-paths-title"
              className="serif text-[2.25rem] md:text-5xl mt-5 leading-[1.08]"
            >
              Choose how <span className="italic">you want to start.</span>
            </h2>
            <p className="mt-5 text-[15.5px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.7] font-light">
              Every path confirms instantly. No forms, no waiting.
            </p>
            <p className="mt-3 text-[13.5px] italic font-light text-[color:var(--charcoal-soft)]">
              A local is always available to guide you, if you want it.{" "}
              <Link
                to="/contact"
                className="underline decoration-[color:var(--gold)]/60 underline-offset-4 hover:text-[color:var(--teal)] transition-colors"
              >
                Talk to a designer
              </Link>
              .
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 list-none p-0 max-w-6xl mx-auto">
            {startPaths.map((p) => {
              const Icon = p.icon;
              // Four distinct visual treatments — each card reads as a
              // different "product" at a glance, while keeping the same
              // grid layout and content structure.
              const styles = {
                // 1 · Signature (Ready) — calm ivory with a teal hairline
                // rail, square teal-stroked icon tile, teal CTA.
                ivory: {
                  card: "bg-[color:var(--card)] border border-[color:var(--border)] text-[color:var(--charcoal)] hover:border-[color:var(--teal)]/40 hover:shadow-[0_24px_50px_-24px_rgba(41,91,97,0.18)]",
                  iconWrap:
                    "rounded-none border border-[color:var(--teal)]/40 text-[color:var(--teal)] bg-[color:var(--ivory)]",
                  eyebrow: "text-[color:var(--teal)]",
                  title: "text-[color:var(--charcoal)]",
                  line: "text-[color:var(--charcoal-soft)]",
                  cta: "text-[color:var(--teal)]",
                  rail: "h-px bg-[color:var(--teal)]/55",
                  ribbon: null as string | null,
                },
                // 2 · Tailor — sand background, soft-gold gradient rail,
                // rounded gold-stroked icon tile, gold CTA.
                sand: {
                  card: "bg-[color:var(--sand)] border border-[color:var(--gold)]/25 text-[color:var(--charcoal)] hover:border-[color:var(--gold)]/60 hover:shadow-[0_24px_50px_-24px_rgba(178,140,71,0.22)]",
                  iconWrap:
                    "rounded-md border border-[color:var(--gold)]/70 text-[color:var(--gold)] bg-[color:var(--ivory)]",
                  eyebrow: "text-[color:var(--gold)]",
                  title: "text-[color:var(--charcoal)]",
                  line: "text-[color:var(--charcoal-soft)]",
                  cta: "text-[color:var(--gold)]",
                  rail:
                    "h-[2px] bg-gradient-to-r from-[color:var(--gold)]/0 via-[color:var(--gold)]/70 to-[color:var(--gold)]/0",
                  ribbon: null,
                },
                // 3 · Studio — teal flagship card, full bright-gold band
                // rail, double-bordered circular icon, gold-soft CTA.
                teal: {
                  card: "bg-[color:var(--teal)] text-[color:var(--ivory)] hover:bg-[color:var(--teal-2)] shadow-[0_18px_40px_-20px_rgba(41,91,97,0.55)]",
                  iconWrap:
                    "rounded-full border-2 border-[color:var(--gold)] text-[color:var(--gold)] bg-[color:var(--teal-2)]/60 ring-1 ring-[color:var(--gold)]/30 ring-offset-2 ring-offset-[color:var(--teal)]",
                  eyebrow: "text-[color:var(--gold)]",
                  title: "text-[color:var(--ivory)]",
                  line: "text-[color:var(--ivory)]/85",
                  cta: "text-[color:var(--gold-soft)]",
                  rail: "h-[3px] bg-[color:var(--gold)]",
                  ribbon: "Most flexible",
                },
                // 4 · Celebrations — deep charcoal, dotted gold rail,
                // rounded gold-soft icon tile, ivory CTA.
                charcoal: {
                  card: "bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)] hover:bg-[color:var(--charcoal)] border border-[color:var(--gold)]/20",
                  iconWrap:
                    "rounded-lg border border-dashed border-[color:var(--gold)]/70 text-[color:var(--gold-soft)] bg-[color:var(--charcoal)]/60",
                  eyebrow: "text-[color:var(--gold-soft)]",
                  title: "text-[color:var(--ivory)]",
                  line: "text-[color:var(--ivory)]/80",
                  cta: "text-[color:var(--ivory)]",
                  rail:
                    "h-px bg-[image:repeating-linear-gradient(90deg,var(--gold)_0_6px,transparent_6px_12px)]",
                  ribbon: null,
                },
              }[p.accent];

              return (
                <li key={p.title} className="reveal-stagger h-full">
                  <Link
                    to={p.to}
                    aria-label={p.ariaLabel}
                    data-destination={p.destination}
                    data-expected-to={p.expectedTo}
                    data-actual-to={p.to}
                    data-route-ok={p.to === p.expectedTo ? "true" : "false"}
                    className={`group relative flex flex-col h-full p-7 md:p-8 transition-all duration-500 overflow-hidden ${styles.card}`}
                  >
                    {/* Top rail — distinct accent pattern per card
                        (solid teal · soft-gold gradient · thick gold ·
                        dotted gold) so each path is identifiable at a
                        glance even before reading the title. */}
                    <span
                      aria-hidden="true"
                      className={`absolute top-0 left-0 right-0 ${styles.rail}`}
                    />
                    {styles.ribbon && (
                      <span
                        aria-hidden="true"
                        className="absolute top-4 right-4 text-[9.5px] uppercase tracking-[0.26em] px-2.5 py-1 bg-[color:var(--gold)] text-[color:var(--charcoal-deep)] font-semibold"
                      >
                        {styles.ribbon}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center justify-center w-11 h-11 mb-6 border ${styles.iconWrap}`}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                    </span>
                    <span
                      className={`text-[10.5px] uppercase tracking-[0.3em] ${styles.eyebrow}`}
                    >
                      {p.eyebrow}
                    </span>
                    <h3
                      className={`serif text-[1.4rem] md:text-[1.5rem] mt-3 leading-[1.15] ${styles.title}`}
                    >
                      {p.title}
                    </h3>
                    <p
                      className={`mt-3 text-[14.5px] leading-[1.65] font-light flex-1 ${styles.line}`}
                    >
                      {p.line}
                    </p>
                    <span
                      className={`mt-7 inline-flex items-center gap-2 text-[14px] tracking-[0.005em] font-medium group-hover:translate-x-1 transition-transform duration-300 ${styles.cta}`}
                    >
                      {p.cta} <ArrowRight size={14} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <RouteValidationStrip />

        </div>
      </section>

      {/* 4 — HOW IT WORKS
          Mobile-first 3-step editorial layout. Sets expectations + removes
          friction immediately after the trust signal. Generous vertical
          rhythm; numbers + icons + short copy, never paragraphs. */}
      <section className="py-24 md:py-36 bg-[color:var(--ivory)]" aria-labelledby="how-it-works-title">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <span className="eyebrow">How you create it</span>
            <h2 id="how-it-works-title" className="serif text-[2.25rem] md:text-5xl mt-5 leading-[1.08]">
              Designed by you. <span className="italic">Confirmed instantly.</span>
            </h2>
            <p className="mt-5 text-[15.5px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.7] font-light">
              A local is always available to guide you, if you want it.
            </p>
          </div>

          <ol className="grid md:grid-cols-3 gap-10 md:gap-8 list-none p-0 max-w-md md:max-w-none mx-auto">
            {howItWorks.map((s, idx) => {
              const Icon = s.icon;
              return (
                <li key={s.step} className="reveal-stagger relative">
                  <div className="flex md:flex-col items-start md:items-start gap-5 md:gap-6">
                    <div className="flex flex-col items-center md:items-start shrink-0">
                      <span className="text-[10.5px] uppercase tracking-[0.32em] text-[color:var(--gold)] font-medium">
                        {s.step}
                      </span>
                      <span className="mt-3 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 border border-[color:var(--gold)]/40 text-[color:var(--teal)]">
                        <Icon size={20} strokeWidth={1.5} />
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="serif text-[1.4rem] md:text-[1.55rem] text-[color:var(--charcoal)] leading-[1.2]">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-[15px] md:text-[15.5px] text-[color:var(--charcoal-soft)] leading-[1.7] font-light max-w-[38ch]">
                        {s.line}
                      </p>
                    </div>
                  </div>
                  {idx < howItWorks.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-[color:var(--gold)]/40 to-transparent -translate-x-6"
                    />
                  )}
                </li>
              );
            })}
          </ol>

          <div className="reveal mt-14 md:mt-16 text-center">
            <Link
              to="/builder"
              className="cta-primary inline-flex items-center gap-2 px-8 py-[16px] text-[12.5px] uppercase tracking-[0.2em] font-semibold"
            >
              Start creating yours
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5 — SIGNATURE EXPERIENCES (confirm or tailor)
          Three signature starting points. Each can be booked as-is OR
          tailored — that dual nature is communicated in the section
          intro and reinforced by the dual CTA on each card. */}
      <section className="py-24 md:py-40 bg-[color:var(--sand)]" aria-labelledby="signatures-title">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <span className="eyebrow">Signature Experiences</span>
            <h2
              id="signatures-title"
              className="serif text-[2.25rem] md:text-5xl mt-5 leading-[1.08]"
            >
              Confirm them as they are. <br />
              <span className="italic">Or shape them your way.</span>
            </h2>
            <p className="mt-5 text-[15.5px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.7] font-light">
              Three private plans crafted by our locals — confirm as they are, or reshape every detail. Either way, it's yours in seconds.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 max-w-5xl mx-auto">
            {signatures.map((s) => (
              <article key={s.title} className="reveal-stagger group flex flex-col">
                <div className="lift-layer-sm flex flex-col h-full">
                  <div className="relative overflow-hidden aspect-[4/5] mb-5 shadow-[0_10px_30px_-20px_rgba(46,46,46,0.28)] group-hover:shadow-[0_28px_55px_-22px_rgba(41,91,97,0.32)] transition-shadow duration-700">
                    <img
                      src={s.img}
                      alt={s.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/80 via-[color:var(--charcoal)]/15 to-transparent" />
                  </div>
                  <h3 className="serif text-[1.5rem] text-[color:var(--charcoal)]">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[15px] text-[color:var(--charcoal-soft)] leading-[1.7] font-light">
                    {s.line}
                  </p>
                  <div className="mt-5 pt-5 border-t border-[color:var(--border)] flex items-center gap-5">
                    <Link
                      to="/experiences"
                      className="inline-flex items-center gap-2 text-[14px] tracking-[0.005em] font-medium text-[color:var(--teal)] hover:text-[color:var(--teal-2)] transition-colors"
                    >
                      Confirm instantly <ArrowRight size={13} />
                    </Link>
                    <span className="h-3 w-px bg-[color:var(--border)]" aria-hidden="true" />
                    <Link
                      to="/builder"
                      className="inline-flex items-center gap-2 text-[14px] tracking-[0.005em] font-medium text-[color:var(--charcoal-soft)] hover:text-[color:var(--teal)] transition-colors"
                    >
                      Tailor &amp; confirm <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="reveal mt-14 md:mt-16 text-center">
            <Link
              to="/experiences"
              className="cta-secondary-light inline-flex items-center gap-2 px-8 py-[16px] text-[12.5px] uppercase tracking-[0.2em] font-semibold"
            >
              Explore all signatures <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6 — BUILD YOUR OWN (Studio)
          Dedicated, visually distinct block for the from-scratch path.
          Teal background anchors it as a separate product. */}
      <section
        className="bg-[color:var(--teal)] text-[color:var(--ivory)] py-24 md:py-36 relative overflow-hidden"
        aria-labelledby="studio-title"
      >
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full border border-[color:var(--gold)]/15 pointer-events-none" />
        <div className="absolute -bottom-40 -left-32 w-[24rem] h-[24rem] rounded-full border border-[color:var(--gold)]/10 pointer-events-none" />
        <div className="container-x relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="reveal lg:col-span-7">
              <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                <Sparkles size={13} /> The Studio
              </span>
              <h2
                id="studio-title"
                className="serif text-[2.4rem] md:text-5xl lg:text-[3.4rem] mt-5 leading-[1.05]"
              >
                Build it from scratch. <br />
                <span className="italic text-[color:var(--gold-soft)]">In real time.</span>
              </h2>
              <p className="mt-6 text-[16px] md:text-[17.5px] text-[color:var(--ivory)]/90 leading-[1.75] max-w-xl font-light">
                Open the Studio and design your private experience step by step — choose your places, your pace,
                your moments. Adjust as you go. Confirm the second it feels right.
              </p>
              <ul className="mt-8 space-y-3 text-[14.5px] text-[color:var(--ivory)]/85 max-w-md">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-px w-5 bg-[color:var(--gold)] shrink-0" aria-hidden="true" />
                  <span>Real-time creation — see it take shape as you build.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-px w-5 bg-[color:var(--gold)] shrink-0" aria-hidden="true" />
                  <span>Local knowledge guiding every choice you make.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-px w-5 bg-[color:var(--gold)] shrink-0" aria-hidden="true" />
                  <span>Instant confirmation — no forms, no waiting, no requests.</span>
                </li>
              </ul>
              <Link
                to="/builder"
                className="inline-flex items-center gap-2 mt-10 px-9 py-[16px] text-[15px] tracking-[0.005em] font-medium bg-[color:var(--gold)] text-[color:var(--charcoal-deep)] hover:bg-[color:var(--gold-soft)] transition-colors"
              >
                Open the Studio <ArrowRight size={15} />
              </Link>
              <p className="mt-5 text-[13px] italic font-light text-[color:var(--ivory)]/75 max-w-md">
                Prefer guidance?{" "}
                <Link
                  to="/contact"
                  className="underline decoration-[color:var(--gold)]/60 underline-offset-4 hover:text-[color:var(--gold-soft)] transition-colors"
                >
                  A local designer can shape it with you.
                </Link>
              </p>
            </div>

            <div className="reveal lg:col-span-5">
              <div className="relative">
                <div className="border border-[color:var(--gold)]/30 p-8 md:p-10 bg-[color:var(--teal-2)]/40 backdrop-blur-sm">
                  <p className="text-[10.5px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
                    A studio session, in 4 moves
                  </p>
                  <ol className="mt-6 space-y-5 list-none p-0 text-[15px] text-[color:var(--ivory)] font-light">
                    {[
                      "Choose a region or theme",
                      "Add experiences, stops, pace",
                      "Refine timing and moments",
                      "Confirm — instantly",
                    ].map((step, i) => (
                      <li key={step} className="flex items-baseline gap-4">
                        <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)] font-medium w-6 shrink-0">
                          0{i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="absolute -top-4 -right-4 hidden md:block w-20 h-20 border border-[color:var(--gold)]/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — DIFFERENTIATION
          Four pillars. Minimal mobile-first grid: 2-up on mobile, 4-up on
          desktop. Icon + one-word title + one short line. */}
      <section className="py-24 md:py-36 bg-[color:var(--ivory)]" aria-labelledby="pillars-title">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-16">
            <span className="eyebrow">Why YES</span>
            <h2 id="pillars-title" className="serif text-[2.25rem] md:text-5xl mt-5 leading-[1.08]">
              The difference, <span className="italic">in four words.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-y-10 max-w-5xl mx-auto">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="reveal-stagger flex flex-col items-start text-left">
                  <span className="inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 text-[color:var(--teal)] border border-[color:var(--gold)]/40 mb-5">
                    <Icon size={18} strokeWidth={1.5} />
                  </span>
                  <h3 className="serif text-[1.35rem] md:text-[1.45rem] text-[color:var(--charcoal)] leading-[1.15]">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] text-[color:var(--charcoal-soft)] leading-[1.65] font-light max-w-[28ch]">
                    {p.line}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6 — MULTI-DAY JOURNEYS */}
      <section className="bg-[color:var(--sand)] py-24 md:py-40">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="reveal lg:order-2">
              <span className="eyebrow">Multi-Day Journeys</span>
              <h2 className="serif text-[2.25rem] md:text-5xl mt-5 leading-[1.08]">
                A few days, <br />
                <span className="italic">one continuous story.</span>
              </h2>
              <p className="mt-6 text-[16px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.75] max-w-lg font-light">
                Linger longer. Travel slower. Wake in a vineyard, lunch in a fishing village,
                fall asleep above the Douro — connected by quiet roads and people who know them
                by name.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {["Coast & Vineyards", "Lisbon to Douro", "Alentejo Slow"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11.5px] uppercase tracking-[0.2em] px-4 py-2 border border-[color:var(--charcoal)]/20 text-[color:var(--charcoal)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                to="/multi-day"
                className="cta-primary mt-9 inline-flex items-center gap-2 px-8 py-[16px] text-[12.5px] uppercase tracking-[0.2em] font-semibold"
              >
                Discover Multi-Day Journeys
                <ArrowRight size={15} />
              </Link>
            </div>
            <div className="reveal lg:order-1 relative group">
              <div className="overflow-hidden">
                <img
                  src={multiDayImg}
                  alt="Aerial view of Douro Valley vineyards"
                  loading="lazy"
                  className="w-full aspect-[5/4] object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 hidden md:block w-28 h-28 border border-[color:var(--gold)]/60" />
            </div>
          </div>
        </div>
      </section>

      {/* 7 — CELEBRATIONS & CORPORATE
          Surfaces the "moments that matter" path: proposals, celebrations
          and corporate. Three soft entry points that all lead to dedicated
          routes, with the same "start from idea, tailor a signature, or
          design from scratch" framing as the rest of the site. */}
      <section
        className="py-24 md:py-36 bg-[color:var(--ivory)] border-y border-[color:var(--border)]"
        aria-labelledby="occasions-title"
      >
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-16">
            <span className="eyebrow">Celebrations &amp; Groups</span>
            <h2
              id="occasions-title"
              className="serif text-[2.25rem] md:text-5xl mt-5 leading-[1.08]"
            >
              For moments <span className="italic">that matter.</span>
            </h2>
            <p className="mt-5 text-[12.5px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
              Proposals · Celebrations · Corporate · Groups
            </p>
            <p className="mt-5 text-[15.5px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.7] font-light">
              From intimate plans to larger groups — all designed your way and confirmed instantly.
            </p>
          </div>

          <ul className="grid sm:grid-cols-3 gap-5 md:gap-6 list-none p-0 max-w-5xl mx-auto">
            {[
              {
                eyebrow: "Proposals",
                title: "A moment they'll never forget",
                line: "A hidden viewpoint, a private dinner, a perfectly timed pause — quietly extraordinary.",
                to: "/proposals" as const,
              },
              {
                eyebrow: "Celebrations",
                title: "Birthdays, anniversaries, milestones",
                line: "Gather the people who matter, in places that feel made for the occasion.",
                to: "/proposals" as const,
              },
              {
                eyebrow: "Corporate",
                title: "Teams, incentives, retreats",
                line: "Refined private programs that feel nothing like a hotel ballroom.",
                to: "/corporate" as const,
              },
            ].map((o) => (
              <li key={o.eyebrow} className="reveal-stagger h-full">
                <Link
                  to={o.to}
                  className="group flex flex-col h-full p-7 md:p-8 bg-[color:var(--card)] border border-[color:var(--border)] hover:border-[color:var(--teal)]/30 hover:shadow-[0_24px_50px_-24px_rgba(41,91,97,0.18)] transition-all duration-500"
                >
                  <span className="text-[10.5px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                    {o.eyebrow}
                  </span>
                  <h3 className="serif text-[1.4rem] md:text-[1.5rem] mt-3 text-[color:var(--charcoal)] leading-[1.2]">
                    {o.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] text-[color:var(--charcoal-soft)] leading-[1.7] font-light flex-1">
                    {o.line}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 text-[14px] tracking-[0.005em] font-medium text-[color:var(--teal)] group-hover:translate-x-1 transition-transform">
                    Design &amp; confirm instantly <ArrowRight size={13} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8 — LOCAL STORIES / HIDDEN GEMS
          The editorial / emotional beat — "the Portugal we travel ourselves".
          Sits between Multi-Day and Social Proof to warm the reader before
          the review block. */}
      <section className="py-24 md:py-40 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <span className="eyebrow">Local Stories &amp; Hidden Gems</span>
            <h2 className="serif text-[2.25rem] md:text-5xl lg:text-[3.4rem] mt-5 leading-[1.08]">
              The Portugal <span className="italic">we travel ourselves</span>
            </h2>
            <p className="mt-5 text-[15.5px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.7] max-w-xl mx-auto font-light">
              Notes from the road — the places we keep returning to, away from the crowds.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
            {editorial.map((e) => (
              <article key={e.title} className="group reveal-stagger">
                <div className="relative overflow-hidden aspect-[4/5] mb-4 md:mb-5 shadow-[0_10px_30px_-22px_rgba(46,46,46,0.35)] group-hover:shadow-[0_24px_50px_-22px_rgba(41,91,97,0.28)] transition-shadow duration-700">
                  <img
                    src={e.img}
                    alt={e.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/88 via-[color:var(--charcoal)]/25 to-transparent" />
                  <div className="absolute left-4 right-4 bottom-4 md:left-5 md:right-5 md:bottom-5">
                    <span className="block h-px w-7 md:w-8 bg-[color:var(--gold)] mb-2.5 md:mb-3 opacity-90" />
                    <h3 className="serif text-[1.1rem] md:text-[1.5rem] leading-[1.15] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                      {e.title}
                    </h3>
                  </div>
                </div>
                <p className="text-[14px] md:text-[15.5px] text-[color:var(--charcoal)] leading-[1.65] font-light max-w-[34ch]">
                  {e.line}
                </p>
              </article>
            ))}
          </div>
          <div className="reveal mt-12 md:mt-16 text-center">
            <Link
              to="/local-stories"
              className="inline-flex items-center gap-2 text-[14px] tracking-[0.005em] text-[color:var(--teal)] hover:text-[color:var(--teal-2)] transition-colors font-medium"
            >
              Read all local stories <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 8 — SOCIAL PROOF
          Headline anchors the volume of reviews. Three handcrafted quote
          cards stand in for the Trustpilot widget until a business profile
          is connected — each carries the platform name in the figcaption to
          read as a real platform review. */}
      <section className="py-24 md:py-36 bg-[color:var(--sand)]" aria-labelledby="reviews-title">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-16">
            <span className="eyebrow">Voices</span>
            <h2 id="reviews-title" className="serif text-[2.25rem] md:text-5xl mt-5 leading-[1.08]">
              700+ <span className="italic">5-star reviews</span>
            </h2>
            <p
              className="mt-5 flex items-center justify-center gap-1.5 text-[color:var(--gold)]"
              role="img"
              aria-label="Average rating 5 out of 5 stars"
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              ))}
              <span className="ml-2 text-[13px] tracking-[0.18em] uppercase text-[color:var(--charcoal-soft)]">
                Across Google · TripAdvisor · Trustpilot
              </span>
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-7">
            {reviews.map((r, i) => (
              <figure key={i} className="group reveal-stagger h-full">
                <div className="lift-layer-sm bg-[color:var(--card)] border border-[color:var(--border)] group-hover:border-[color:var(--teal)]/25 group-hover:shadow-[0_24px_50px_-24px_rgba(41,91,97,0.2)] p-7 md:p-9 h-full flex flex-col">
                  <div className="flex gap-0.5 text-[color:var(--gold)] mb-5">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={13} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote className="serif italic text-[17px] md:text-[20px] leading-[1.6] text-[color:var(--charcoal)] flex-1">
                    "{r.quote}"
                  </blockquote>
                  <figcaption className="mt-6 pt-5 border-t border-[color:var(--border)] flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-medium text-[color:var(--charcoal)]">{r.name}</p>
                      <p className="text-[12.5px] text-[color:var(--charcoal-soft)] mt-0.5">
                        {r.location}
                      </p>
                    </div>
                    <span className="text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] shrink-0">
                      via {r.platform}
                    </span>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 9 — FAQ (placed right before the final CTA) */}
      <FAQ />

      {/* 10 — FINAL CTA */}
      <section className="pb-28 md:pb-36 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal relative bg-[color:var(--sand)] p-12 md:p-20 overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border border-[color:var(--gold)]/15" />
            <div className="absolute -top-12 right-1/4 w-40 h-40 rounded-full border border-[color:var(--gold)]/10" />
            <div className="relative max-w-2xl">
              <span className="eyebrow">Begin</span>
              <h2 className="serif text-4xl md:text-5xl mt-6">
                Write your story. <br />
                <span className="italic text-[color:var(--teal)]">Confirm it instantly.</span>
              </h2>
              <p className="mt-7 text-[17px] text-[color:var(--charcoal-soft)] leading-[1.75] max-w-lg">
                Choose a signature, tailor one, or design from scratch — every path confirms instantly.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/builder"
                  className="cta-primary inline-flex items-center gap-2 px-9 py-[18px] text-[12.5px] uppercase tracking-[0.22em] font-semibold"
                >
                  Create Your Story
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/experiences"
                  className="cta-secondary-light inline-flex items-center gap-2 px-9 py-[18px] text-[12.5px] uppercase tracking-[0.22em] font-semibold"
                >
                  Explore Signature Experiences
                </Link>
              </div>
              <p className="mt-6 text-[13.5px] italic font-light text-[color:var(--charcoal-soft)]">
                Prefer guidance?{" "}
                <Link
                  to="/contact"
                  className="underline decoration-[color:var(--gold)]/60 underline-offset-4 hover:text-[color:var(--teal)] transition-colors"
                >
                  A local designer can shape it with you.
                </Link>
              </p>

              <div className="mt-11 flex flex-wrap gap-x-8 gap-y-3 text-[12px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
                <span className="inline-flex items-center gap-2">
                  <Zap size={13} className="text-[color:var(--gold)]" /> Instant confirmation
                </span>
                <span className="inline-flex items-center gap-2">
                  <Lock size={13} className="text-[color:var(--gold)]" /> Always private
                </span>
                <span className="inline-flex items-center gap-2">
                  <Compass size={13} className="text-[color:var(--gold)]" /> Local knowledge
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
