import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteLayout } from "@/components/SiteLayout";
import { FAQ } from "@/components/FAQ";
import { useHeroParallax } from "@/hooks/use-hero-parallax";
import { useCtaScrollScale } from "@/hooks/use-cta-scroll-scale";
import { CtaScrollDebugOverlay, useCtaScrollDebugToggle } from "@/components/CtaScrollDebugOverlay";
import heroImg from "@/assets/hero-coast.jpg";
import multiDayImg from "@/assets/multi-day.jpg";

// Real Viator-sourced tour photography — used everywhere on the homepage so
// every card and editorial moment maps to an actual stop from one of the
// Signature tours. No stock or invented imagery is used below.
import imgArrabidaWineHero from "@/assets/tours/arrabida-wine-allinclusive/hero.jpg";
import imgArrabidaWineWinery from "@/assets/tours/arrabida-wine-allinclusive/winery.jpg";
import imgArrabidaWineLunch from "@/assets/tours/arrabida-wine-allinclusive/lunch.jpg";
import imgArrabidaWineViewpoint from "@/assets/tours/arrabida-wine-allinclusive/viewpoint.jpg";
import imgArrabidaBoatCoves from "@/assets/tours/arrabida-boat/coves.jpg";
import imgArrabidaBoatSesimbra from "@/assets/tours/arrabida-boat/sesimbra.jpg";
import imgAzeitaoWorkshop from "@/assets/tours/azeitao-cheese/workshop.jpg";
import imgSintraEstates from "@/assets/tours/sintra-cascais/estates.jpg";
import imgSintraCabo from "@/assets/tours/sintra-cascais/cabo-da-roca.jpg";
import imgTroiaFerry from "@/assets/tours/troia-comporta/ferry.jpg";
import imgTroiaBeach from "@/assets/tours/troia-comporta/beach.jpg";
import imgFatimaNazare from "@/assets/tours/fatima-nazare-obidos/nazare.jpg";
import {
  ArrowRight,
  Star,
  Compass,
  Sparkles,
  Lock,
  Wand2,
  Zap,
  BookOpen,
  Gift,
  CalendarDays,
} from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";
import { HeroMetaProbe } from "@/components/HeroMetaProbe";
import { HeroCopyDiff } from "@/components/HeroCopyDiff";
import { HeroVerifyOverlay } from "@/components/HeroVerifyOverlay";
import { DecisionStepper } from "@/components/DecisionStepper";
import { SignatureCarousel } from "@/components/SignatureCarousel";
import { LiveMapPreview } from "@/components/LiveMapPreview";
import { ContrastAudit } from "@/components/dev/ContrastAudit";

import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";
import { signatureTours, isValidTourId } from "@/data/signatureTours";

// Featured tour ids for the homepage signatures showcase.
// Must exist in the catalog (`signatureTours`) — validated below at render time.
const FEATURED_TOUR_IDS = [
  "arrabida-wine-allinclusive",
  "sintra-cascais",
  "troia-comporta",
  "arrabida-boat",
  "azeitao-cheese",
  "fatima-nazare-obidos",
] as const;

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
      {
        property: "og:title",
        content: "Portugal is the stage. You write the story. — YES experiences",
      },
      {
        property: "og:description",
        content: HERO_COPY.subheadline,
      },
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

const signatures = FEATURED_TOUR_IDS
  .filter((id) => isValidTourId(id))
  .map((id) => signatureTours.find((t) => t.id === id)!)
  .map((t) => ({
    id: t.id,
    title: t.title,
    img: t.img,
    line: t.blurb,
    pace: t.pace,
  }));

// Local Stories — every entry maps to a real moment from a real Signature
// tour, with the exact photo Viator shot at that stop. Lines are pulled
// from the tour's own narrative, not invented around the imagery.
const editorial = [
  {
    title: "Cellars in Azeitão",
    line: "Three small family wineries in Arrábida — guided tastings poured by the people who pressed the grapes.",
    img: imgArrabidaWineWinery,
    to: "/tours/$tourId" as const,
    tourId: "arrabida-wine-allinclusive",
  },
  {
    title: "Hidden Coves of Arrábida",
    line: "A boat slips into the natural park's turquoise coves — swim, snorkel, or simply drift with the boats.",
    img: imgArrabidaBoatCoves,
    to: "/tours/$tourId" as const,
    tourId: "arrabida-boat",
  },
  {
    title: "Sintra's Royal Estates",
    line: "Pena, Quinta da Regaleira, the misted gardens — the Sintra you read about, walked at a private pace.",
    img: imgSintraEstates,
    to: "/tours/$tourId" as const,
    tourId: "sintra-cascais",
  },
  {
    title: "Where the Land Ends",
    line: "Cabo da Roca — the western edge of continental Europe, then a long lunch by the water in Cascais.",
    img: imgSintraCabo,
    to: "/tours/$tourId" as const,
    tourId: "sintra-cascais",
  },
];


const startPaths = [
  {
    icon: BookOpen,
    eyebrow: "Signature",
    title: "Explore Signature Journeys",
    line: "Start with something already beautifully put together.",
    cta: "Step inside",
    to: "/experiences",
    destination: "Signatures",
    expectedTo: "/experiences",
    ariaLabel: "Explore Signature Journeys — start with something already beautifully put together",
    accent: "ivory" as const,
    slug: "signature",
    stepLabel: "Signature",
    bg: imgArrabidaWineWinery,
  },
  {
    icon: Wand2,
    eyebrow: "Tailored",
    title: "Tailor a Signature",
    line: "Keep the essence, adjust the rhythm.",
    cta: "Shape it",
    to: "/experiences",
    destination: "Tailoring",
    expectedTo: "/experiences",
    ariaLabel: "Tailor a Signature — keep the essence, adjust the rhythm",
    accent: "sand" as const,
    slug: "tailor",
    stepLabel: "Tailor",
    bg: imgAzeitaoWorkshop,
  },
  {
    icon: Sparkles,
    eyebrow: "Studio",
    title: "Build from Scratch",
    line: "Create your journey in real time.",
    cta: "Begin here",
    to: "/builder",
    destination: "Studio",
    expectedTo: "/builder",
    ariaLabel: "Build from Scratch — create your journey in real time",
    accent: "teal" as const,
    slug: "studio",
    stepLabel: "Studio",
    bg: imgTroiaFerry,
  },
  {
    icon: Gift,
    eyebrow: "Moments",
    title: "Plan a Moment",
    line: "For proposals, celebrations, groups and days worth remembering.",
    cta: "Discover",
    to: "/proposals",
    destination: "Celebrations",
    expectedTo: "/proposals",
    ariaLabel: "Plan a Moment — for proposals, celebrations and groups",
    accent: "charcoal" as const,
    slug: "moment",
    stepLabel: "Moment",
    bg: imgArrabidaWineLunch,
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
          className={`inline-block w-2 h-2 rounded-full ${allOk ? "bg-emerald-600" : "bg-red-600"}`}
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
            <span className="inline-flex items-center gap-2.5 sm:gap-3.5 whitespace-nowrap text-[10px] sm:text-[12px] md:text-[13px] uppercase tracking-[0.16em] sm:tracking-[0.26em] md:tracking-[0.3em] text-[color:var(--gold-soft)] opacity-0 animate-[heroFade_1.1s_ease-out_0.3s_forwards]">
              <span aria-hidden="true" className="text-[color:var(--gold)]">
                ✦
              </span>
              <span data-hero-field="eyebrow" className="whitespace-nowrap">
                {HERO_COPY.eyebrow}
              </span>
              <span aria-hidden="true" className="text-[color:var(--gold)]">
                ✦
              </span>
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
                Prefer guidance?{" "}
                <Link
                  to="/contact"
                  className="link-soft link-soft--persistent text-[color:var(--ivory)]"
                >
                  A local designer can shape it with you.
                </Link>
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
              <span data-probe-field="headline">
                {HERO_COPY.headlineLine1} {HERO_COPY.headlineLine2}
              </span>
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
                  __html: JSON.stringify({ version: HERO_COPY_VERSION, copy: HERO_COPY }, null, 2),
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
        className="bg-[color:var(--ivory)] border-b border-[color:var(--border)] section-y-sm"
        aria-labelledby="trust-bar-title"
      >
        <h2 id="trust-bar-title" className="sr-only">
          700+ 5-star reviews
        </h2>

        <div className="container-x">
          <div className="flex flex-col items-center text-center gap-4">
            <p
              className="reveal-stagger flex items-center gap-1 text-[color:var(--gold)]"
              style={{ transitionDelay: "0ms" }}
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
              className="reveal-stagger serif text-[1.6rem] md:text-[2rem] text-[color:var(--charcoal)] leading-[1.15]"
              style={{ transitionDelay: "110ms" }}
              id="trust-bar-summary"
            >
              700+ <span className="italic">5-star reviews</span>
            </p>

            {/* Real client moments — small overlapping photo strip to
                signal that real people are behind the rating. Uses real
                photography from the editorial set. */}
            <div
              className="reveal-stagger flex items-center gap-3 mt-1"
              style={{ transitionDelay: "180ms" }}
              aria-hidden="true"
            >
              <div className="flex -space-x-2.5">
                {[imgArrabidaWineLunch, imgArrabidaBoatCoves, imgSintraEstates, imgTroiaBeach, imgFatimaNazare].map((src, i) => (
                  <span
                    key={i}
                    className="inline-block w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[color:var(--ivory)] shadow-[0_2px_6px_-2px_rgba(46,46,46,0.25)] bg-[color:var(--card)]"
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </span>
                ))}
              </div>
              <span className="text-[12px] md:text-[12.5px] tracking-[0.04em] text-[color:var(--charcoal-soft)] font-light italic">
                from real moments, real travellers
              </span>
            </div>

            <div
              className="reveal-stagger mt-2 w-full max-w-3xl"
              style={{ transitionDelay: "260ms" }}
            >
              <ul
                className="flex flex-wrap items-center justify-center gap-x-9 gap-y-4 md:gap-x-12 list-none p-0 h-7 md:h-8"
                aria-label="Featured on Google, TripAdvisor, Viator, GetYourGuide and Trustpilot"
              >
                {(["google", "tripadvisor", "viator", "getyourguide", "trustpilot"] as const).map(
                  (p) => (
                    <li key={p} className="h-full flex items-center">
                      <PlatformBadge platform={p} />
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — START PATHS
          Four explicit product paths, surfaced immediately after the trust
          signal so the user understands every way they can engage with the
          brand. Mobile: 2-up grid. Desktop: 4-up. The Studio card is the
          visually distinct teal card to anchor the "build from scratch"
          path as the most differentiated option. */}
      <section
        id="decision-flow"
        className="section-y bg-[color:var(--ivory)] border-b border-[color:var(--border)]"
        aria-labelledby="start-paths-title"
      >
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <span className="eyebrow">Where to begin</span>
            <h2
              id="start-paths-title"
              className="t-h2 mt-5"
            >
              Choose how <span className="italic">you want to start.</span>
            </h2>
            <p className="mt-5 text-[14.5px] md:text-[15.5px] text-[color:var(--charcoal-soft)] font-light leading-[1.6] max-w-md mx-auto">
              Four ways in. Pick one — decide in seconds.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 list-none p-0 max-w-6xl mx-auto">
            {startPaths.map((p) => {
              // Tap-to-focus: on touch devices `:active` only lasts while the
              // finger is pressed, which feels like a "click" rather than
              // "entering" the scene. We hold the focused state for ~480ms
              // after pointerdown so the zoom + lift have time to read as
              // a deliberate doorway moment before navigation occurs.
              const handleTouchEnter = (e: React.PointerEvent<HTMLAnchorElement>) => {
                if (e.pointerType !== "touch") return;
                const el = e.currentTarget;
                el.dataset.tapped = "true";
                window.setTimeout(() => {
                  el.dataset.tapped = "false";
                }, 480);
              };
              return (
                <li
                  key={p.title}
                  id={`decision-card-${p.slug}`}
                  className="reveal-stagger h-full scroll-mt-24"
                >
                  <Link
                    to={p.to}
                    aria-label={p.ariaLabel}
                    data-destination={p.destination}
                    data-expected-to={p.expectedTo}
                    data-actual-to={p.to}
                    data-route-ok={p.to === p.expectedTo ? "true" : "false"}
                    onPointerDown={handleTouchEnter}
                    className="decision-scene group relative flex flex-col justify-end h-full min-h-[30rem] md:min-h-[34rem] p-8 md:p-10 overflow-hidden rounded-[2px] bg-[color:var(--charcoal-deep)] shadow-[0_18px_44px_-22px_rgba(0,0,0,0.55)] transition-all duration-[250ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:-translate-y-1 hover:shadow-[0_32px_64px_-22px_rgba(0,0,0,0.7)] focus-visible:-translate-y-1 focus-visible:shadow-[0_32px_64px_-22px_rgba(0,0,0,0.7)] active:-translate-y-0.5 data-[tapped=true]:-translate-y-1 data-[tapped=true]:shadow-[0_32px_64px_-22px_rgba(0,0,0,0.7)]"
                  >
                    {/* Full immersive scene — the image IS the card.
                        Zooms 1.03 on hover/focus/touch for a cinematic
                        "step-into-it" cue. */}
                    {p.bg && (
                      <img
                        src={p.bg}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        data-card-image
                        className="absolute inset-0 w-full h-full object-cover opacity-95 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.03] group-focus-visible:scale-[1.03] group-active:scale-[1.03] group-data-[tapped=true]:scale-[1.03]"
                      />
                    )}
                    {/* Per-image readability gradient. Each photo was sampled
                        for top/mid/bottom luminance and the stops tuned so the
                        text band (bottom 35%) hits the same legibility target
                        (~WCAG AA on white serif). Brighter scenes get stronger
                        bottom scrims; already-dark scenes get lighter overlays
                        so the imagery breathes. */}
                    <div
                      aria-hidden="true"
                      className={
                        "absolute inset-0 " +
                        (p.slug === "signature"
                          ? "bg-[linear-gradient(to_top,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.86)_22%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.30)_80%,rgba(0,0,0,0.40)_100%)]"
                          : p.slug === "tailor"
                          ? "bg-[linear-gradient(to_top,rgba(0,0,0,0.80)_0%,rgba(0,0,0,0.62)_28%,rgba(0,0,0,0.32)_60%,rgba(0,0,0,0.15)_100%)]"
                          : p.slug === "studio"
                          ? "bg-[linear-gradient(to_top,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.72)_25%,rgba(0,0,0,0.42)_58%,rgba(0,0,0,0.18)_85%,rgba(0,0,0,0.28)_100%)]"
                          : "bg-[linear-gradient(to_top,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.62)_22%,rgba(0,0,0,0.42)_55%,rgba(0,0,0,0.35)_80%,rgba(0,0,0,0.50)_100%)]")
                      }
                    />
                    {/* Cinematic radial vignette — slightly stronger so the
                        scene feels framed, not flat. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-55 mix-blend-multiply [background:radial-gradient(130%_85%_at_50%_-10%,transparent_45%,rgba(0,0,0,0.7)_100%)]"
                    />

                    {/* Content anchored to bottom — the scene speaks first.
                        No icon chip, no gold rail — just photography, a quiet
                        eyebrow, the title, the invitation. */}
                    <span className="relative z-[1] text-[10.5px] uppercase tracking-[0.34em] text-[color:var(--gold-soft)]">
                      {p.eyebrow}
                    </span>
                    <h3 className="relative z-[1] serif mt-4 text-[2rem] md:text-[2.2rem] leading-[1.05] tracking-[-0.012em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)]">
                      {p.title}
                    </h3>
                    <p className="relative z-[1] mt-5 text-[14.5px] md:text-[15px] leading-[1.7] font-light text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)] max-w-[34ch]">
                      {p.line}
                    </p>
                    {/* Doorway CTA — underline animates from a 28px gold tick
                        to the full label width on hover, focus, AND touch
                        hold (active). Label fades to gold on activation; arrow
                        steps forward. The whole <Link> remains the tap target
                        (full card), so accessibility is preserved. */}
                    <span className="cta-doorway relative z-[1] mt-8 inline-flex items-center gap-2.5 text-[12.5px] uppercase tracking-[0.26em] font-medium text-white transition-colors duration-300 group-hover:text-[color:var(--gold)] group-focus-visible:text-[color:var(--gold)] group-active:text-[color:var(--gold)]">
                      <span className="cta-doorway__label relative pb-1.5">
                        {p.cta}
                      </span>
                      <ArrowRight
                        size={14}
                        className="text-[color:var(--gold)] transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 group-active:translate-x-2"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <RouteValidationStrip />
        </div>
        <DecisionStepper
          sectionId="decision-flow"
          steps={startPaths.map((p) => ({
            id: `decision-card-${p.slug}`,
            label: p.stepLabel,
          }))}
        />
      </section>

      {/* 4 — BUILDER (CORE PRODUCT)
          The main innovation, given dedicated space immediately after the
          decision grid. Communicates: instant creation + instant
          confirmation + real-time local guidance. */}
      <section
        className="bg-[color:var(--teal)] text-[color:var(--ivory)] section-y-lg relative overflow-hidden py-24 md:py-36"
        aria-labelledby="studio-title"
      >
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full border border-[color:var(--gold)]/15 pointer-events-none" />
        <div className="absolute -bottom-40 -left-32 w-[24rem] h-[24rem] rounded-full border border-[color:var(--gold)]/10 pointer-events-none" />
        {/* Subtle live "pulse" dot — signals real-time, alive */}
        <div className="container-x relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="reveal lg:col-span-7">
              <span className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--gold)] opacity-60 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--gold)]" />
                </span>
                The Studio · Live now
              </span>
              <h2
                id="studio-title"
                className="serif mt-7 text-[2.6rem] sm:text-[3.4rem] md:text-[4.4rem] lg:text-[5rem] leading-[0.98] tracking-[-0.018em]"
              >
                Create it, <span className="italic text-[color:var(--gold-soft)]">live.</span>
              </h2>
              <p className="mt-8 text-[19px] md:text-[22px] lg:text-[24px] text-[color:var(--ivory)] leading-[1.5] max-w-xl font-light">
                Start with a place, a moment, or an idea. Shape it in real time and confirm instantly.
              </p>
              <p className="mt-5 text-[15px] md:text-[16px] italic font-light text-[color:var(--gold-soft)] leading-[1.7] max-w-xl">
                A local is available in real time if you want help.
              </p>
              <Link
                to="/builder"
                className="btn-solid btn-solid--gold mt-12"
              >
                Open Studio <ArrowRight size={16} />
              </Link>
            </div>

            <div className="reveal lg:col-span-5">
              <div className="relative">
                {/* Live, animated routing preview — replaces the static
                    panel. Communicates "alive, real-time, magic" without
                    loading a real map SDK on mobile. */}
                <LiveMapPreview />
                <div className="absolute -top-4 -right-4 hidden md:block w-20 h-20 border border-[color:var(--gold)]/40 pointer-events-none" />
              </div>
              <ol className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3 list-none p-0 text-[12.5px] text-[color:var(--ivory)]/85 font-light">
                {[
                  "Start your way",
                  "Shape it as you go",
                  "Adjust in real time",
                  "Confirm instantly",
                ].map((step, i) => (
                  <li key={step} className="flex items-baseline gap-2.5">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)] font-medium shrink-0">
                      0{i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — SIGNATURE EXPERIENCES (confirm or tailor)
          Three signature starting points. Each can be booked as-is OR
          tailored — that dual nature is communicated in the section
          intro and reinforced by the dual CTA on each card. */}
      <section className="section-y bg-[color:var(--sand)]" aria-labelledby="signatures-title">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <span className="eyebrow">Signature Journeys</span>
            <h2
              id="signatures-title"
              className="t-h2 mt-5"
            >
              Signature <span className="italic">Journeys.</span>
            </h2>
            <p className="t-lead mt-5">
              Curated routes designed to be enjoyed as they are.
            </p>
            <p className="mt-3 text-[13.5px] md:text-[14px] italic font-light text-[color:var(--charcoal-soft)]">
              You can adjust selected elements to match your rhythm.
            </p>
          </div>

          <div className="reveal max-w-6xl mx-auto">
            <SignatureCarousel items={signatures} />
          </div>

          <div className="reveal mt-14 md:mt-16 text-center">
            <Link
              to="/experiences"
              className="btn-solid btn-solid--outline"
            >
              Explore all signatures <ArrowRight size={14} />
          </div>
        </div>
      </section>

      {/* 5a — TAILOR A SIGNATURE (explanation)
          Clarifies what tailoring actually means: small adjustments
          INSIDE a chosen Signature, not full custom design (that's the
          Studio). Visual: a real workshop scene + editorial copy. */}
      <section
        className="bg-[color:var(--ivory)] section-y-sm border-t border-[color:var(--border)]"
        aria-labelledby="tailor-title"
      >
        <div className="container-x">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="reveal lg:col-span-7">
              <span className="eyebrow">Tailor a Signature</span>
              <h2
                id="tailor-title"
                className="t-h2 mt-5"
              >
                Love the route, <span className="italic">your own rhythm.</span>
              </h2>
              <p className="mt-6 text-[16px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.75] max-w-xl font-light">
                Love the route but want a different rhythm? Adjust selected details while keeping the journey intact.
              </p>
              <ul className="mt-7 space-y-2.5 list-none p-0 text-[14.5px] text-[color:var(--charcoal)] font-light">
                {[
                  "Swap a tasting for a long lunch",
                  "Add a sunset stop, slow down a morning",
                  "Same route, your pace",
                ].map((item) => (
                  <li key={item} className="flex items-baseline gap-3">
                    <span className="text-[color:var(--gold)] text-[10px] tracking-[0.3em] mt-0.5 shrink-0">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[13.5px] italic font-light text-[color:var(--charcoal-soft)] leading-[1.7] max-w-md">
                Tailoring stays inside the chosen tour. To design something entirely your own, open the Studio.
              </p>
              <Link
                to="/experiences"
                className="btn-solid btn-solid--outline mt-9"
              >
                Tailor a Signature <ArrowRight size={14} />
              </Link>
            </div>
            <div className="reveal lg:col-span-5">
              <div className="editorial-card relative overflow-hidden border border-[color:var(--border)] aspect-[4/5]">
                <img
                  src={imgAzeitaoWorkshop}
                  alt="A small Azeitão workshop — the kind of stop you'd shape to your rhythm"
                  loading="lazy"
                  data-card-image
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5b — BEYOND DAY TOURS
          A short, dedicated section that signals to the visitor that this is
          NOT just day tours: extended journeys + special-moment plans. Two
          equal-weight blocks, premium and minimal — each links to its
          dedicated section/route below. */}
      <section
        className="section-y-sm bg-[color:var(--ivory)] border-y border-[color:var(--border)]"
        aria-labelledby="beyond-title"
      >
        <div className="container-x">
          <div className="reveal text-center max-w-xl mx-auto mb-10 md:mb-14">
            <span className="eyebrow">Beyond a single day</span>
            <h2
              id="beyond-title"
              className="sr-only"
            >
              Beyond a single day
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-7 max-w-5xl mx-auto">
            {[
              {
                eyebrow: "Extended journeys",
                title: "Beyond a day",
                line: "From private days to full journeys across Portugal.",
                to: "/multi-day" as const,
                cta: "Discover multi-day",
                ariaLabel:
                  "Beyond a day — from private days to full journeys across Portugal",
                bg: multiDayImg,
              },
              {
                eyebrow: "Special occasions",
                title: "For moments that matter",
                line: "Proposals, celebrations, corporate and private groups.",
                to: "/proposals" as const,
                cta: "Plan a moment",
                ariaLabel:
                  "For moments that matter — proposals, celebrations, corporate and private groups",
                bg: imgSintraCabo,
              },
            ].map((b) => (
              <Link
                key={b.title}
                to={b.to}
                aria-label={b.ariaLabel}
                className="reveal-stagger editorial-card group relative flex flex-col p-8 md:p-10 min-h-[18rem] md:min-h-[22rem] bg-[color:var(--charcoal-deep)] border border-[color:var(--border)] hover:border-[color:var(--gold)]/45 overflow-hidden"
              >
                <img
                  src={b.bg}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  data-card-image
                  className="absolute inset-0 w-full h-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/95 via-[color:var(--charcoal-deep)]/65 to-[color:var(--charcoal-deep)]/30" />
                <span className="relative z-[1] text-[10.5px] uppercase tracking-[0.3em] text-[color:var(--gold-soft)]">
                  {b.eyebrow}
                </span>
                <h3 className="relative z-[1] serif mt-3 text-[1.7rem] md:text-[2rem] leading-[1.1] tracking-[-0.005em] text-[color:var(--ivory)] transition-colors duration-300 group-hover:text-[color:var(--gold-soft)]">
                  {b.title}
                </h3>
                <p className="relative z-[1] mt-4 text-[15px] md:text-[16px] text-[color:var(--ivory)]/85 leading-[1.7] font-light">
                  {b.line}
                </p>
                <span className="relative z-[1] mt-auto pt-7 inline-flex items-center gap-2 text-[13.5px] tracking-[0.005em] font-medium text-[color:var(--gold-soft)] group-hover:text-[color:var(--gold)] transition-colors">
                  {b.cta}
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — MULTI-DAY JOURNEYS */}
      <section className="bg-[color:var(--sand)] section-y">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="reveal lg:order-2">
              <span className="eyebrow">Multi-Day Journeys</span>
              <h2 className="t-h2 mt-5">
                A few days, <br />
                <span className="italic">one continuous story.</span>
              </h2>
              <p className="mt-6 text-[16px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.75] max-w-lg font-light">
                Linger longer. Travel slower. Wake in a vineyard, lunch in a fishing village, fall
                asleep above the Douro — connected by quiet roads and people who know them by name.
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
                className="btn-solid btn-solid--teal mt-9"
              >
                Discover Multi-Day Journeys
                <ArrowRight size={15} />
              </Link>
            </div>
            <div className="reveal lg:order-1 relative">
              <div className="editorial-card overflow-hidden border border-[color:var(--border)]">
                <img
                  src={multiDayImg}
                  alt="Aerial view of Douro Valley vineyards"
                  loading="lazy"
                  data-card-image
                  className="w-full aspect-[5/4] object-cover"
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
        className="section-y bg-[color:var(--ivory)] border-y border-[color:var(--border)]"
        aria-labelledby="occasions-title"
      >
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-16">
            <span className="eyebrow">Celebrations &amp; Groups</span>
            <h2
              id="occasions-title"
              className="t-h2 mt-5"
            >
              For moments <span className="italic">that matter.</span>
            </h2>
            <p className="mt-5 text-[12.5px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
              Proposals · Celebrations · Corporate · Groups
            </p>
            <p className="t-lead mt-5">
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
                bg: imgSintraCabo,
              },
              {
                eyebrow: "Celebrations",
                title: "Birthdays, anniversaries, milestones",
                line: "Gather the people who matter, in places that feel made for the occasion.",
                to: "/proposals" as const,
                bg: imgArrabidaWineLunch,
              },
              {
                eyebrow: "Corporate",
                title: "Teams, incentives, retreats",
                line: "Refined private programs that feel nothing like a hotel ballroom.",
                to: "/corporate" as const,
                bg: imgArrabidaBoatCoves,
              },
            ].map((o) => (
              <li key={o.eyebrow} className="reveal-stagger h-full">
                <Link
                  to={o.to}
                  className="editorial-card group relative flex flex-col h-full min-h-[20rem] p-7 md:p-8 bg-[color:var(--charcoal-deep)] border border-[color:var(--border)] hover:border-[color:var(--gold)]/45 overflow-hidden"
                >
                  <img
                    src={o.bg}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    data-card-image
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/95 via-[color:var(--charcoal-deep)]/65 to-[color:var(--charcoal-deep)]/35" />
                  <span className="relative z-[1] text-[10.5px] uppercase tracking-[0.3em] text-[color:var(--gold-soft)]">
                    {o.eyebrow}
                  </span>
                  <h3 className="relative z-[1] serif mt-3 text-[1.4rem] md:text-[1.55rem] leading-[1.15] tracking-[-0.005em] text-[color:var(--ivory)]">
                    {o.title}
                  </h3>
                  <p className="relative z-[1] mt-3 text-[14.5px] text-[color:var(--ivory)]/85 leading-[1.7] font-light flex-1">
                    {o.line}
                  </p>
                  <span className="relative z-[1] mt-7 inline-flex items-center gap-2 text-[14px] tracking-[0.005em] font-medium text-[color:var(--gold-soft)] group-hover:text-[color:var(--gold)] group-hover:translate-x-1 transition-all">
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
      <section className="section-y bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <span className="eyebrow">Local Stories &amp; Hidden Gems</span>
            <h2 className="t-h2 mt-5">
              The Portugal <span className="italic">we travel ourselves</span>
            </h2>
            <p className="t-lead mt-5 max-w-xl mx-auto">
              Notes from the road — the places we keep returning to, away from the crowds.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
            {editorial.map((e) => (
              <article key={e.title} className="group reveal-stagger">
                <Link
                  to={e.to}
                  params={{ tourId: e.tourId }}
                  aria-label={`${e.title} — open the tour`}
                  className="block"
                >
                  <div className="editorial-card relative overflow-hidden aspect-[4/5] mb-4 md:mb-5 border border-[color:var(--border)]">
                    <img
                      src={e.img}
                      alt={e.title}
                      loading="lazy"
                      data-card-image
                      className="w-full h-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/88 via-[color:var(--charcoal)]/25 to-transparent" />
                    <div className="absolute left-4 right-4 bottom-4 md:left-5 md:right-5 md:bottom-5">
                      <span className="block h-px w-7 md:w-8 bg-[color:var(--gold)] mb-2.5 md:mb-3 opacity-90" />
                      <h3 className="t-h3 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        {e.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-[14.5px] md:text-[15.5px] text-[color:var(--charcoal)] leading-[1.7] max-w-[34ch]">
                    {e.line}
                  </p>
                </Link>
              </article>
            ))}
          </div>
          <div className="reveal mt-12 md:mt-16 text-center">
            <Link
              to="/local-stories"
              className="link-soft inline-flex items-center gap-2 text-[14px] tracking-[0.005em] font-medium"
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
      <section className="section-y bg-[color:var(--sand)]" aria-labelledby="reviews-title">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-14 md:mb-16">
            <span className="eyebrow">Voices</span>
            <h2 id="reviews-title" className="t-h2 mt-5">
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
                <div className="editorial-card bg-[color:var(--card)] border border-[color:var(--border)] hover:border-[color:var(--gold)]/45 p-7 md:p-9 h-full flex flex-col">
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
                      <p className="text-[14px] font-medium text-[color:var(--charcoal)]">
                        {r.name}
                      </p>
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
      <section className="section-y bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal relative bg-[color:var(--sand)] p-12 md:p-20 overflow-hidden">
            {/* Soft photographic wash — adds atmospheric depth without
                losing the sand surface or harming text contrast. */}
            <img
              src={imgArrabidaWineHero}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-25 scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--sand)] via-[color:var(--sand)]/85 to-[color:var(--sand)]/55" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border border-[color:var(--gold)]/15" />
            <div className="absolute -top-12 right-1/4 w-40 h-40 rounded-full border border-[color:var(--gold)]/10" />
            <div className="relative max-w-2xl">
              <span className="eyebrow">Begin</span>
              <h2 className="t-h2 mt-6">
                Write your story. <br />
                <span className="italic text-[color:var(--teal)]">Confirm it instantly.</span>
              </h2>
              <p className="mt-7 text-[12.5px] md:text-[13px] uppercase tracking-[0.28em] text-[color:var(--charcoal)] font-medium">
                Instant confirmation. No forms. No waiting.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/builder"
                  className="btn-solid btn-solid--teal"
                >
                  Create Your Story
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/experiences"
                  className="btn-solid btn-solid--outline"
                >
                  Explore Signature Experiences
                </Link>
              </div>
              <p className="mt-6 text-[13.5px] italic font-light text-[color:var(--charcoal-soft)]">
                Prefer guidance?{" "}
                <Link
                  to="/contact"
                  className="link-soft link-soft--persistent"
                >
                  A local designer can shape it with you.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA — handled globally by <MobileStickyCTA /> in
          SiteLayout. The previous in-page duplicate has been removed so
          users no longer see two stacked sticky bars on mobile. */}
      <ContrastAudit />
    </SiteLayout>
  );
}
