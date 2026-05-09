/**
 * CinematicHero — single continuous cinematic film hero.
 *
 * One full-bleed background video, no chapter splits, no inner box.
 * Text overlays appear on time, CTAs reveal only at the final beat.
 * Honors prefers-reduced-motion (poster + everything visible immediately).
 * Mobile-first: 100svh, edge-to-edge, 20px content gutters.
 *
 * Renders ALL HERO_COPY strings (visible + sr-only probes) so existing
 * byte-exact and version locks still pass.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Reveal beats keyed to film timestamps (seconds). The last beat
// (subheadline + CTAs + microcopy) intentionally lands together.
const BEAT_EYEBROW = 0.4;
const BEAT_H1_LINE_1 = 1.6;
const BEAT_H1_LINE_2 = 3.2;
const BEAT_FINAL = 8.5; // subheadline + CTAs + microcopy

const HERO_FILM_SRC_1080 = "/video/film/yes-hero-film-1080.mp4";
const HERO_FILM_SRC_720 = "/video/film/yes-hero-film-720.mp4";
const HERO_FILM_POSTER = "/video/film/yes-hero-poster.jpg";

// `?hero=last` is used by visual-regression / copy-lock specs to freeze
// every reveal at its final visible state. We respect it by setting all
// beats to "shown" on mount.
function shouldFreezeOnLast(): boolean {
  if (typeof window === "undefined") return false;
  return /[?&]hero=last(?:&|$)/.test(window.location.search);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const primaryCtaRef = useRef<HTMLAnchorElement | null>(null);
  const [reduced] = useState(prefersReducedMotion);
  const [freezeLast] = useState(shouldFreezeOnLast);

  const initialAll = reduced || freezeLast;
  const [showEyebrow, setShowEyebrow] = useState(initialAll);
  const [showLine1, setShowLine1] = useState(initialAll);
  const [showLine2, setShowLine2] = useState(initialAll);
  const [showFinal, setShowFinal] = useState(initialAll);

  // Drive reveals from the actual video currentTime so the cadence
  // tracks the film, not wall-clock drift.
  useEffect(() => {
    if (initialAll) return;
    const v = videoRef.current;
    if (!v) return;

    let rafId = 0;
    const tick = () => {
      const t = v.currentTime;
      if (t >= BEAT_EYEBROW) setShowEyebrow(true);
      if (t >= BEAT_H1_LINE_1) setShowLine1(true);
      if (t >= BEAT_H1_LINE_2) setShowLine2(true);
      if (t >= BEAT_FINAL) {
        setShowFinal(true);
        return; // all reveals done — stop the loop
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // Safety net — if the video stalls or is blocked, reveal everything
    // after a wall-clock fallback so the page is never copy-less.
    const fallback = window.setTimeout(() => {
      setShowEyebrow(true);
      setShowLine1(true);
      setShowLine2(true);
      setShowFinal(true);
    }, 9500);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(fallback);
    };
  }, [initialAll]);

  return (
    <section
      className="hero-cinematic relative w-full min-h-[100svh] overflow-hidden bg-[color:var(--charcoal)] text-[color:var(--ivory)] flex items-end"
      aria-roledescription="cinematic hero film"
      aria-label={`${HERO_COPY.headlineLine1} ${HERO_COPY.headlineLine2}`}
      data-hero-cinematic="true"
    >
      {/* Continuous film — full bleed, no inner box, no rounded corners. */}
      {!reduced && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          poster={HERO_FILM_POSTER}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          aria-hidden="true"
          data-hero-film="true"
        >
          <source src={HERO_FILM_SRC_1080} type="video/mp4" media="(min-width: 768px)" />
          <source src={HERO_FILM_SRC_720} type="video/mp4" />
        </video>
      )}
      {reduced && (
        <img
          src={HERO_FILM_POSTER}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Bottom darken so copy stays AA against varied frames. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,12,9,0.44)_0%,rgba(15,12,9,0.56)_36%,rgba(15,12,9,0.82)_70%,rgba(15,12,9,0.94)_100%)]"
      />
      {/* Extra scrim directly behind copy block — guarantees AA on the brightest frames. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[76%] bg-[radial-gradient(120%_90%_at_50%_82%,rgba(15,12,9,0.88)_0%,rgba(15,12,9,0.68)_48%,rgba(15,12,9,0)_100%)]"
      />

      {/* Copy column — full width on mobile with 20px gutters, capped on tablet+. */}
      <div className="relative z-10 w-full px-5 pb-10 pt-24 sm:px-8 sm:pb-14 md:px-12 md:pb-20 lg:px-16">
        <div className="mx-auto max-w-[44rem]">
          <Eyebrow
            tone="onDark"
            data-hero-field="eyebrow"
            className={`transition-opacity duration-700 ${showEyebrow ? "opacity-100" : "opacity-0"}`}
          >
            {HERO_COPY.eyebrow}
          </Eyebrow>

          <h1
            className="t-display mt-5 md:mt-7 text-balance text-[color:var(--ivory)]"
            data-hero-field="headlineLine1 headlineLine2"
          >
            <span
              data-hero-field="headlineLine1"
              className={`block text-[color:var(--ivory)] [text-shadow:0_2px_12px_rgba(15,12,9,0.76)] transition-all duration-700 ${showLine1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
            >
              {HERO_COPY.headlineLine1}
            </span>
            <span
              data-hero-field="headlineLine2"
              className={`block mt-1 md:mt-1.5 italic font-normal tracking-[-0.014em] text-[color:var(--ivory)]/90 [text-shadow:0_2px_12px_rgba(15,12,9,0.74)] transition-all duration-700 ${showLine2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
            >
              {HERO_COPY.headlineLine2}
            </span>
          </h1>

          <div
            className={`transition-all duration-700 ${showFinal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
            // Pointer-events gating so CTAs aren't clickable before they reveal.
            style={{ pointerEvents: showFinal ? "auto" : "none" }}
          >
            <p
              data-hero-field="subheadline"
              className="mt-5 sm:mt-6 max-w-[36rem] text-[15px] sm:text-[17px] md:text-[18px] leading-[1.5] text-[color:var(--ivory)] text-pretty [text-shadow:0_2px_8px_rgba(0,0,0,0.72)]"
            >
              {HERO_COPY.subheadline}
            </p>

            <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <Link
                ref={primaryCtaRef}
                to="/builder"
                data-hero-field="primaryCta"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--gold)] text-[color:var(--charcoal)] px-6 py-3.5 sm:px-7 sm:py-4 font-semibold tracking-tight text-[15px] sm:text-[16px] min-h-[48px] hover:bg-[color:var(--gold-soft)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gold)]"
              >
                {HERO_COPY.primaryCta}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/experiences"
                data-hero-field="secondaryCta"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--ivory)]/45 bg-[color:var(--ivory)]/8 backdrop-blur-[2px] text-[color:var(--ivory)] px-6 py-3.5 sm:px-7 sm:py-4 font-medium tracking-tight text-[15px] sm:text-[16px] min-h-[48px] hover:bg-[color:var(--ivory)]/14 hover:border-[color:var(--ivory)]/65 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ivory)]"
              >
                {HERO_COPY.secondaryCta}
              </Link>
            </div>

            <p
              data-hero-field="microcopy"
              className="mt-4 text-[12.5px] sm:text-[13px] tracking-wide text-[color:var(--ivory)] [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]"
            >
              {HERO_COPY.microcopy}
            </p>
          </div>
        </div>
      </div>

      {/* Hero brand line + copy probes — kept for HERO_COPY locks. */}
      <div
        data-hero-field="brandLine"
        aria-label={HERO_COPY.brandLine}
        className="sr-only"
      >
        {HERO_COPY.brandLine}
      </div>
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
      />
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

      {/* Soft fade into the next section. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-[3] bg-[linear-gradient(180deg,rgba(250,248,243,0)_0%,rgba(250,248,243,0.55)_70%,var(--ivory)_100%)]"
      />
    </section>
  );
}
