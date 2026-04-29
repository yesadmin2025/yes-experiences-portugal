import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteLayout } from "@/components/SiteLayout";
import { FAQ } from "@/components/FAQ";

import heroImg from "@/assets/hero-coast.jpg";

// Real Viator-sourced tour photography — every card maps to an actual
// Signature tour. No stock or invented imagery.
import imgArrabidaWineHero from "@/assets/tours/arrabida-wine-allinclusive/hero.jpg";
import imgArrabidaWineLunch from "@/assets/tours/arrabida-wine-allinclusive/lunch.jpg";
import imgArrabidaBoatCoves from "@/assets/tours/arrabida-boat/coves.jpg";
import imgAzeitaoWorkshop from "@/assets/tours/azeitao-cheese/workshop.jpg";
import imgSintraEstates from "@/assets/tours/sintra-cascais/estates.jpg";
import imgTroiaBeach from "@/assets/tours/troia-comporta/beach.jpg";
import imgFatimaNazare from "@/assets/tours/fatima-nazare-obidos/nazare.jpg";

import {
  ArrowRight,
  Star,
  Sparkles,
  Wand2,
  BookOpen,
  Gift,
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
  }));

/* ──────────────────────────────────────────────────────────────────
 * "Start here" decision block — 4 paths with explicit hierarchy:
 *   tier "primary"   → Signature Experiences, Experience Studio
 *   tier "secondary" → Tailor a Signature, Proposals / Groups
 * Brief: "Each card must feel like a clear choice, not a decorative teaser."
 * ────────────────────────────────────────────────────────────── */
type StartTier = "primary" | "secondary";

interface StartPath {
  tier: StartTier;
  icon: typeof BookOpen;
  eyebrow: string;
  title: string;
  line: string;
  cta: string;
  to: string;
  ariaLabel: string;
  bg: string;
}

const startPaths: StartPath[] = [
  {
    tier: "primary",
    icon: BookOpen,
    eyebrow: "Signature",
    title: "Explore Signature Experiences",
    line: "Complete private days, already designed and ready to confirm.",
    cta: "Browse signatures",
    to: "/experiences",
    ariaLabel: "Explore Signature Experiences — complete private days, ready to confirm",
    bg: imgArrabidaWineHero,
  },
  {
    tier: "primary",
    icon: Sparkles,
    eyebrow: "Studio",
    title: "Build your private journey",
    line: "Compose your own day with real stops, realistic timings and human support.",
    cta: "Open the studio",
    to: "/builder",
    ariaLabel: "Build your private journey in the Experience Studio",
    bg: imgSintraEstates,
  },
  {
    tier: "secondary",
    icon: Wand2,
    eyebrow: "Tailored",
    title: "Tailor a signature",
    line: "Keep the day, adjust pace, pickup or a single stop.",
    cta: "See how",
    to: "/experiences",
    ariaLabel: "Tailor a Signature — adjust pace, pickup or a single stop",
    bg: imgAzeitaoWorkshop,
  },
  {
    tier: "secondary",
    icon: Gift,
    eyebrow: "Groups & moments",
    title: "Proposals, groups, celebrations",
    line: "For larger parties and dates worth marking. Designed with you, in conversation.",
    cta: "Speak to a local",
    to: "/proposals",
    ariaLabel: "Proposals, groups and celebrations — speak to a local",
    bg: imgArrabidaWineLunch,
  },
];

/* ──────────────────────────────────────────────────────────────────
 * Moments / Groups preview — Multi-day, Celebrations, Corporate
 * collapsed into a single 3-card band.
 * ────────────────────────────────────────────────────────────── */
const multiDay = [
  {
    eyebrow: "Multi-day",
    title: "Routes across Portugal",
    line: "Two to seven days, real driving times, real overnight stops — designed in conversation with a local team.",
    cta: "Browse multi-day routes",
    to: "/multi-day",
    img: imgTroiaBeach,
  },
];

const groupsAndCelebrations = [
  {
    eyebrow: "Proposals",
    title: "Proposals & private days",
    line: "Quiet planning by a local team — every detail confirmed before the day.",
    cta: "Plan a moment",
    to: "/proposals",
    img: imgArrabidaWineLunch,
  },
  {
    eyebrow: "Celebrations",
    title: "Celebrations & private groups",
    line: "Birthdays, anniversaries and small gatherings, hosted with care.",
    cta: "Plan a celebration",
    to: "/proposals",
    img: imgFatimaNazare,
  },
  {
    eyebrow: "Corporate",
    title: "Teams & incentive trips",
    line: "Small-group experiences for incentive trips and team retreats.",
    cta: "Speak to corporate",
    to: "/corporate",
    img: imgFatimaNazare,
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
  return (
    <SiteLayout>
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
          className="absolute inset-0 w-full h-full object-cover object-center"
          width={1920}
          height={1080}
        />
        {/* Soft dark gradient — required by brief for any text-over-image. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/85 via-[color:var(--charcoal-deep)]/45 to-[color:var(--charcoal-deep)]/40 md:from-[color:var(--charcoal-deep)]/80 md:via-[color:var(--charcoal-deep)]/35 md:to-[color:var(--charcoal-deep)]/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,15,15,0.65)_0%,rgba(15,15,15,0.4)_35%,transparent_70%)] md:bg-[linear-gradient(90deg,rgba(15,15,15,0.6)_0%,rgba(15,15,15,0.32)_40%,transparent_72%)] pointer-events-none" />

        <div className="container-x relative z-10 pb-14 md:pb-36 pt-32 md:pt-40">
          <div className="max-w-3xl text-[color:var(--ivory)]">
            <span className="inline-flex items-center gap-2.5 sm:gap-3.5 whitespace-nowrap text-[10.5px] sm:text-[12px] md:text-[13px] uppercase tracking-[0.18em] sm:tracking-[0.26em] md:tracking-[0.3em] text-[color:var(--gold)] opacity-0 animate-[heroFade_1.1s_ease-out_0.3s_forwards]">
              <span aria-hidden="true">✦</span>
              <span data-hero-field="eyebrow" className="whitespace-nowrap">
                {HERO_COPY.eyebrow}
              </span>
              <span aria-hidden="true">✦</span>
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
                className="hero-cta-button cta-primary group relative inline-flex w-full sm:flex-1 sm:basis-0 items-center justify-start text-left"
              >
                <span className="block">Explore Signature Experiences</span>
                <ArrowRight
                  size={14}
                  className="absolute right-5 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
              <Link
                to="/builder"
                data-hero-field="secondaryCta"
                className="hero-cta-button cta-secondary-dark group relative inline-flex w-full sm:flex-1 sm:basis-0 items-center justify-start text-left"
              >
                <span className="block">Build your private journey</span>
                <ArrowRight
                  size={14}
                  className="absolute right-5 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform duration-300"
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
              <p className="mt-3 text-[13px] md:text-[13px] text-[color:var(--ivory)]/85 italic font-light leading-[1.65] text-center sm:text-left">
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
        className="bg-[color:var(--ivory)] border-b border-[color:var(--border)] section-y-sm"
        aria-labelledby="trust-bar-title"
      >
        <h2 id="trust-bar-title" className="sr-only">
          700+ five-star reviews across major platforms
        </h2>
        <div className="container-x">
          <div className="flex flex-col items-center text-center gap-5">
            <p
              className="flex items-center gap-1 text-[color:var(--gold)]"
              role="img"
              aria-label="Rated 5 out of 5 stars"
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" focusable="false" />
              ))}
            </p>
            <p className="serif text-[1.5rem] md:text-[1.9rem] text-[color:var(--charcoal)] leading-[1.2]">
              700+ <span className="italic">five-star reviews</span>
            </p>
            <p className="max-w-md text-[14px] md:text-[15px] text-[color:var(--charcoal-soft)] leading-[1.6] font-light">
              Private local guides who actually live here — every day designed and confirmed by a small team in Portugal.
            </p>
            <ul
              className="mt-2 flex flex-wrap items-center justify-center gap-x-9 gap-y-4 md:gap-x-12 list-none p-0 h-7 md:h-8"
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
        className="section-y bg-[color:var(--ivory)] border-b border-[color:var(--border)]"
        aria-labelledby="why-yes-title"
      >
        <div className="container-x">
          <div className="max-w-3xl mx-auto text-center mb-14 md:mb-20">
            <span className="eyebrow">Why YES</span>
            <h2
              id="why-yes-title"
              className="t-h2 mt-5 text-balance"
            >
              Portugal isn't experienced the{" "}
              <span className="italic">same way</span> by everyone.
            </h2>
            <p className="mt-7 md:mt-8 text-[15px] md:text-[16.5px] text-[color:var(--charcoal-soft)] font-light leading-[1.75] max-w-2xl mx-auto">
              For some, it's wine. For others, the coast, history, food, or a
              moment that matters.
              <br className="hidden md:block" />
              <span className="md:inline"> </span>
              Because no two people experience Portugal the same way, we chose
              to do things differently — not just in how we guide you, but in
              how you choose and create your experience from the very
              beginning.
            </p>
          </div>

          {/* Editorial blocks — asymmetric, not a rigid grid.
              Block 1 spans full width; 2 + 3 share a row; 4 spans full
              width with image-left; 5 is a quiet closing band. */}
          <div className="max-w-6xl mx-auto flex flex-col gap-14 md:gap-20">
            {/* Block 1 — You shape the story (full-width, image-right) */}
            <article className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
              <div className="md:col-span-5 md:order-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[color:var(--card)]">
                  <img
                    src={imgSintraEstates}
                    alt="A guest walking through a private estate in Sintra at golden hour"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:col-span-7 md:order-1">
                <span className="text-[10.5px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
                  01 — Personal
                </span>
                <h3 className="serif mt-4 text-[1.7rem] md:text-[2.2rem] leading-[1.15] text-[color:var(--charcoal)]">
                  You shape the <span className="italic">story.</span>
                </h3>
                <p className="mt-5 text-[15px] md:text-[16px] text-[color:var(--charcoal-soft)] font-light leading-[1.75]">
                  Portugal becomes what you want it to be — a private day, a
                  proposal, a celebration, a corporate experience or a full
                  journey. You choose what you want to feel, how you move, and
                  who you share it with.
                </p>
              </div>
            </article>

            {/* Blocks 2 + 3 — paired editorial cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-14">
              <article>
                <div className="relative aspect-[3/2] overflow-hidden rounded-[2px] bg-[color:var(--card)] mb-6">
                  <img
                    src={imgArrabidaBoatCoves}
                    alt="A hidden cove on the Arrábida coast — quiet, blue, unmarked on most maps"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10.5px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
                  02 — Place
                </span>
                <h3 className="serif mt-4 text-[1.45rem] md:text-[1.7rem] leading-[1.2] text-[color:var(--charcoal)]">
                  Portugal is the <span className="italic">stage.</span>
                </h3>
                <p className="mt-4 text-[14.5px] md:text-[15.5px] text-[color:var(--charcoal-soft)] font-light leading-[1.7]">
                  From iconic places to hidden gems, every moment is set in the
                  right place, at the right time — whether it's something
                  simple or something you'll never forget.
                </p>
              </article>

              <article>
                <div className="relative aspect-[3/2] overflow-hidden rounded-[2px] bg-[color:var(--card)] mb-6">
                  <img
                    src={imgArrabidaWineLunch}
                    alt="A shared lunch with a local host in Arrábida"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10.5px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
                  03 — Local
                </span>
                <h3 className="serif mt-4 text-[1.45rem] md:text-[1.7rem] leading-[1.2] text-[color:var(--charcoal)]">
                  Local, from the <span className="italic">very beginning.</span>
                </h3>
                <p className="mt-4 text-[14.5px] md:text-[15.5px] text-[color:var(--charcoal-soft)] font-light leading-[1.7]">
                  Everything is guided by real local knowledge — with
                  proximity, care and the kind of insight that only comes from
                  living it.
                </p>
              </article>
            </div>

            {/* Block 4 — A different way to choose and book (full-width, image-left) */}
            <article className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
              <div className="md:col-span-5">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[color:var(--card)]">
                  <img
                    src={imgArrabidaWineHero}
                    alt="A private day in Arrábida — designed by a local team and confirmed before it begins"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:col-span-7">
                <span className="text-[10.5px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
                  04 — How you choose
                </span>
                <h3 className="serif mt-4 text-[1.7rem] md:text-[2.2rem] leading-[1.15] text-[color:var(--charcoal)]">
                  A different way to choose{" "}
                  <span className="italic">and book.</span>
                </h3>
                <p className="mt-5 text-[15px] md:text-[16px] text-[color:var(--charcoal-soft)] font-light leading-[1.75]">
                  Start from a Signature, tailor selected details, or build
                  your experience from scratch in the Studio — shaping it step
                  by step, in real time.
                </p>
                <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-[12px] uppercase tracking-[0.24em] text-[color:var(--charcoal-soft)]">
                  <span className="inline-flex items-center gap-2">
                    <BookOpen size={12} aria-hidden="true" /> Signature
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Wand2 size={12} aria-hidden="true" /> Tailored
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Sparkles size={12} aria-hidden="true" /> Studio
                  </span>
                </div>
              </div>
            </article>

            {/* Block 5 — Simple, clear, supported (closing band, no image) */}
            <article className="border-t border-[color:var(--border)] pt-12 md:pt-16 max-w-3xl mx-auto text-center">
              <span className="text-[10.5px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
                05 — Simple & supported
              </span>
              <h3 className="serif mt-4 text-[1.7rem] md:text-[2.1rem] leading-[1.15] text-[color:var(--charcoal)]">
                Simple, clear, <span className="italic">supported.</span>
              </h3>
              <p className="mt-5 text-[15px] md:text-[16px] text-[color:var(--charcoal-soft)] font-light leading-[1.75]">
                Even if this feels new, it's designed to be easy. You decide at
                your own pace, with instant confirmation and local guidance
                whenever you want it.
              </p>
              <p className="mt-8 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.24em] text-[color:var(--teal)]">
                <MessageCircle size={13} aria-hidden="true" />
                A local is one message away
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 4 — START HERE
          Four paths with explicit hierarchy: 2 primary (Signature,
          Studio), 2 secondary (Tailor, Proposals/Groups). Mobile: stacked.
          Tablet+: 2-column. Cards are calm, ivory, with a small image
          and a real choice CTA — no full-bleed photo cards, no doorway
          motion, no decorative scrim layers. */}
      <section
        className="section-y bg-[color:var(--sand)] border-b border-[color:var(--border)]"
        aria-labelledby="start-paths-title"
      >
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="eyebrow">Where to begin</span>
            <h2 id="start-paths-title" className="t-h2 mt-5">
              Four ways to <span className="italic">start.</span>
            </h2>
            <p className="mt-5 text-[14.5px] md:text-[15.5px] text-[color:var(--charcoal-soft)] font-light leading-[1.6] max-w-md mx-auto">
              Pick the path that matches how you like to plan.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 list-none p-0 max-w-5xl mx-auto">
            {startPaths.map((p) => {
              const Icon = p.icon;
              const primary = p.tier === "primary";
              return (
                <li key={p.title}>
                  <Link
                    to={p.to}
                    aria-label={p.ariaLabel}
                    className={
                      "group relative flex flex-col h-full overflow-hidden rounded-[2px] border transition-all duration-200 ease-out hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sand)] " +
                      (primary
                        ? "bg-[color:var(--ivory)] border-[color:var(--charcoal)]/15 shadow-[0_4px_12px_-6px_rgba(46,46,46,0.18)] hover:shadow-[0_10px_24px_-10px_rgba(46,46,46,0.28)]"
                        : "bg-[color:var(--ivory)]/70 border-[color:var(--border)] hover:border-[color:var(--charcoal)]/25")
                    }
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--card)]">
                      <img
                        src={p.bg}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/35 to-transparent" />
                    </div>
                    <div className="p-6 md:p-7 flex flex-col gap-3">
                      <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)]">
                        <Icon size={12} aria-hidden="true" />
                        {p.eyebrow}
                        {primary && (
                          <span className="ml-auto inline-flex items-center text-[9.5px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
                            Recommended
                          </span>
                        )}
                      </span>
                      <h3 className="serif text-[1.45rem] md:text-[1.6rem] leading-[1.15] text-[color:var(--charcoal)]">
                        {p.title}
                      </h3>
                      <p className="text-[14px] md:text-[14.5px] leading-[1.6] text-[color:var(--charcoal-soft)] font-light">
                        {p.line}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-2 pt-3 text-[12px] uppercase tracking-[0.22em] font-medium text-[color:var(--teal)]">
                        {p.cta}
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
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
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="eyebrow">Signature experiences</span>
            <h2 id="signatures-title" className="t-h2 mt-5">
              Days <span className="italic">already designed.</span>
            </h2>
            <p className="mt-5 text-[14.5px] md:text-[15.5px] text-[color:var(--charcoal-soft)] font-light leading-[1.6] max-w-md mx-auto">
              Confirm a Signature as it ships, or tailor a few details inside.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 list-none p-0">
            {signatures.map((t) => (
              <li key={t.id}>
                <Link
                  to="/tours/$tourId"
                  params={{ tourId: t.id }}
                  className="group relative flex flex-col h-full overflow-hidden rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ivory)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[color:var(--charcoal)]/25 hover:shadow-[0_10px_24px_-12px_rgba(46,46,46,0.2)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--card)]">
                    <img
                      src={t.img}
                      alt={t.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/40 via-transparent to-transparent" />
                  </div>
                  <div className="p-5 md:p-6 flex flex-col gap-2.5">
                    <span className="text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)]">
                      {t.pace}
                    </span>
                    <h3 className="serif text-[1.25rem] md:text-[1.4rem] leading-[1.2] text-[color:var(--charcoal)]">
                      {t.title}
                    </h3>
                    <p className="text-[13.5px] leading-[1.55] text-[color:var(--charcoal-soft)] font-light line-clamp-3">
                      {t.line}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.22em] font-medium text-[color:var(--teal)]">
                      View signature
                      <ArrowRight
                        size={12}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 md:mt-14 text-center">
            <Link
              to="/experiences"
              className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.24em] font-medium text-[color:var(--charcoal)] border-b border-[color:var(--charcoal)]/30 pb-1 hover:border-[color:var(--charcoal)] transition-colors"
            >
              See every Signature
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6 — EXPERIENCE STUDIO PREVIEW
          One clean band: map + route + summary. No "live" claim, no
          decorative blobs, no glow. Emphasizes route realism, timing,
          and human support. */}
      <section
        className="section-y-lg bg-[color:var(--sand)] border-b border-[color:var(--border)]"
        aria-labelledby="studio-title"
      >
        <div className="container-x">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
            <div className="lg:col-span-5">
              <span className="eyebrow inline-flex items-center gap-2">
                <MapPin size={12} aria-hidden="true" />
                Experience Studio
              </span>
              <h2 id="studio-title" className="t-h2 mt-5">
                Build a day that <span className="italic">actually fits.</span>
              </h2>
              <p className="mt-5 text-[14.5px] md:text-[15.5px] text-[color:var(--charcoal-soft)] font-light leading-[1.7] max-w-md">
                Pick stops on a real map. The Studio shows route feasibility, estimated duration, and an estimate breakdown — so you see what works before you commit.
              </p>
              <ul className="mt-6 space-y-2.5 text-[13.5px] text-[color:var(--charcoal)] font-light leading-[1.6]">
                <li className="flex gap-2">
                  <span aria-hidden="true" className="text-[color:var(--gold)]">·</span>
                  Real stops only — no invented venues
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true" className="text-[color:var(--gold)]">·</span>
                  Honest driving times and pace
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true" className="text-[color:var(--gold)]">·</span>
                  A local designer reviews every build
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/builder"
                  className="inline-flex items-center gap-2 bg-[color:var(--teal)] text-[color:var(--ivory)] px-6 py-3 text-[12px] uppercase tracking-[0.22em] hover:bg-[color:var(--teal-2)] transition-colors"
                >
                  Open the studio
                  <ArrowRight size={14} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-[color:var(--charcoal)] border-b border-[color:var(--charcoal)]/30 pb-1 hover:border-[color:var(--charcoal)] transition-colors"
                >
                  Talk to a designer
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] md:aspect-[16/11] overflow-hidden rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ivory)] shadow-[0_8px_24px_-12px_rgba(46,46,46,0.18)]">
                <LiveMapPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 — MULTI-DAY TOURS
          Multi-day routes get their own breathing room: one wide,
          editorial card per route family. Same card system as the rest
          of the page so the homepage doesn't feel like a stack of
          unrelated blocks. */}
      <section
        className="section-y bg-[color:var(--ivory)] border-b border-[color:var(--border)]"
        aria-labelledby="multiday-title"
      >
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="eyebrow">Multi-day</span>
            <h2 id="multiday-title" className="t-h2 mt-5">
              Routes <span className="italic">across</span> Portugal.
            </h2>
            <p className="mt-5 text-[14.5px] md:text-[15.5px] text-[color:var(--charcoal-soft)] font-light leading-[1.6] max-w-md mx-auto">
              Two to seven days, real driving times, real overnight stops — designed in conversation with a local team.
            </p>
          </div>

          <ul className="grid grid-cols-1 list-none p-0 max-w-3xl mx-auto">
            {multiDay.map((m) => (
              <li key={m.title}>
                <Link
                  to={m.to}
                  className="group relative flex flex-col md:flex-row h-full overflow-hidden rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ivory)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[color:var(--charcoal)]/25 hover:shadow-[0_10px_24px_-12px_rgba(46,46,46,0.2)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[4/3] md:aspect-auto md:w-1/2 overflow-hidden bg-[color:var(--card)]">
                    <img
                      src={m.img}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/40 to-transparent" />
                  </div>
                  <div className="p-5 md:p-8 flex flex-col gap-2.5 md:w-1/2 md:justify-center">
                    <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)]">
                      <CalendarDays size={12} aria-hidden="true" />
                      {m.eyebrow}
                    </span>
                    <h3 className="serif text-[1.25rem] md:text-[1.55rem] leading-[1.2] text-[color:var(--charcoal)]">
                      {m.title}
                    </h3>
                    <p className="text-[13.5px] leading-[1.55] text-[color:var(--charcoal-soft)] font-light">
                      {m.line}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.22em] font-medium text-[color:var(--teal)]">
                      {m.cta}
                      <ArrowRight
                        size={12}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
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
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="eyebrow">Groups & celebrations</span>
            <h2 id="groups-title" className="t-h2 mt-5">
              When the <span className="italic">occasion</span> is bigger.
            </h2>
            <p className="mt-5 text-[14.5px] md:text-[15.5px] text-[color:var(--charcoal-soft)] font-light leading-[1.6] max-w-md mx-auto">
              Proposals, private celebrations and corporate groups — quietly planned by a local team.
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 list-none p-0 max-w-5xl mx-auto">
            {groupsAndCelebrations.map((m) => (
              <li key={m.title}>
                <Link
                  to={m.to}
                  className="group relative flex flex-col h-full overflow-hidden rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ivory)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[color:var(--charcoal)]/25 hover:shadow-[0_10px_24px_-12px_rgba(46,46,46,0.2)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--card)]">
                    <img
                      src={m.img}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/40 to-transparent" />
                  </div>
                  <div className="p-5 md:p-6 flex flex-col gap-2.5">
                    <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)]">
                      <CalendarDays size={12} aria-hidden="true" />
                      {m.eyebrow}
                    </span>
                    <h3 className="serif text-[1.25rem] md:text-[1.4rem] leading-[1.2] text-[color:var(--charcoal)]">
                      {m.title}
                    </h3>
                    <p className="text-[13.5px] leading-[1.55] text-[color:var(--charcoal-soft)] font-light">
                      {m.line}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.22em] font-medium text-[color:var(--teal)]">
                      {m.cta}
                      <ArrowRight
                        size={12}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9 — FAQ
          Reuses the shared FAQ component, which renders its own
          labelled landmark with visible expandable answers. The wrapper
          section below carries the spacing class the lock checks; the
          inner FAQ component carries aria-labelledby="faq-title". */}
      <section className="py-20 md:py-24" aria-labelledby="faq-title">
        <FAQ />
      </section>

      {/* 10 — FINAL CTA — Talk to a local
          Distinct from the hero CTAs (Explore Signatures / Build) — this
          is the human escape hatch. No duplicate CTA band; one purpose,
          one button. */}
      <section
        className="section-y bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)] pb-20 md:pb-24"
        aria-labelledby="final-cta-title"
      >
        {/* FINAL CTA */}
        <div className="container-x">
          <div className="max-w-xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
              <MessageCircle size={12} aria-hidden="true" />
              Prefer a conversation?
            </span>
            <h2 id="final-cta-title" className="serif mt-5 text-[1.9rem] md:text-[2.6rem] leading-[1.1] tracking-[-0.012em]">
              Talk to a <span className="italic text-[color:var(--gold-soft)]">local.</span>
            </h2>
            <p className="mt-5 text-[14.5px] md:text-[15.5px] leading-[1.7] font-light text-[color:var(--ivory)]/85">
              Tell us roughly what you have in mind — dates, party, a feeling. A designer in Portugal will reply within a working day.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[color:var(--gold)] text-[color:var(--charcoal)] px-7 py-3.5 text-[12px] uppercase tracking-[0.22em] font-medium hover:bg-[color:var(--gold-soft)] transition-colors"
              >
                Speak to a local designer
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
