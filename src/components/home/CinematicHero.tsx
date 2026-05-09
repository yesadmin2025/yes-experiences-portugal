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

import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CtaButton } from "@/components/ui/CtaButton";
import { HeroColorDebugOverlay } from "@/components/HeroColorDebugOverlay";

// Editorial reveal: each item transitions for 220ms ease-out, then the
// next beat starts. This keeps the hero premium and readable immediately.
const HERO_REVEAL_DELAYS_MS = {
  eyebrow: 0,
  line1: 220,
  line2: 440,
  final: 660,
} as const;

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
  const [reduced] = useState(prefersReducedMotion);
  const [freezeLast] = useState(shouldFreezeOnLast);

  const initialAll = reduced || freezeLast;
  const [showEyebrow, setShowEyebrow] = useState(initialAll);
  const [showLine1, setShowLine1] = useState(initialAll);
  const [showLine2, setShowLine2] = useState(initialAll);
  const [showFinal, setShowFinal] = useState(initialAll);

  // Drive reveals with a strict 220ms sequential cadence. The film stays
  // atmospheric; typography timing stays deterministic and testable.
  useEffect(() => {
    if (initialAll) return;
    const timers = [
      window.setTimeout(() => setShowEyebrow(true), HERO_REVEAL_DELAYS_MS.eyebrow),
      window.setTimeout(() => setShowLine1(true), HERO_REVEAL_DELAYS_MS.line1),
      window.setTimeout(() => setShowLine2(true), HERO_REVEAL_DELAYS_MS.line2),
      window.setTimeout(() => setShowFinal(true), HERO_REVEAL_DELAYS_MS.final),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [initialAll]);

  return (
    <section
      className="hero-cinematic relative w-full min-h-[calc(100svh-65px)] md:min-h-screen overflow-hidden bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)] flex items-center md:items-end"
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
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,12,9,0.28)_0%,rgba(15,12,9,0.38)_30%,rgba(15,12,9,0.68)_66%,rgba(15,12,9,0.92)_100%)]"
      />
      {/* Extra scrim directly behind copy block — guarantees AA on the brightest frames. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(110%_78%_at_50%_84%,rgba(15,12,9,0.72)_0%,rgba(15,12,9,0.52)_46%,rgba(15,12,9,0)_100%)]"
      />

      {/* Copy column — full width on mobile with 20px gutters, capped on tablet+. */}
      <div className="relative z-10 w-full px-6 pb-8 pt-10 sm:px-8 sm:pb-12 md:px-12 md:pb-20 md:pt-24 lg:px-16">
        <div className="mx-auto max-w-[46rem] md:mx-0 md:ml-[6vw] lg:ml-[8vw]">
          <Eyebrow
            tone="onDark"
            data-hero-field="eyebrow"
            data-hero-reveal="eyebrow"
            data-hero-reveal-order="1"
            data-hero-reveal-duration-ms="220"
            data-hero-reveal-ease="ease-out"
            className={`hero-eyebrow transition-all duration-[220ms] ease-out ${showEyebrow ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {HERO_COPY.eyebrow}
          </Eyebrow>

          <h1
            className="hero-h1 t-display mt-8 sm:mt-9 md:mt-11 max-w-[12ch] sm:max-w-[13ch] md:max-w-[14ch] text-balance text-[color:var(--ivory)] [font-weight:400] [font-size:2.125rem] sm:[font-size:2.4rem] md:[font-size:4rem] lg:[font-size:4.75rem] [letter-spacing:-0.005em] [line-height:1.06] md:[line-height:1.02] lg:[line-height:0.98] [text-shadow:none]"
            data-hero-field="headlineLine1 headlineLine2"
          >
            <span
              data-hero-field="headlineLine1"
              data-hero-reveal="headlineLine1"
              data-hero-reveal-order="2"
              data-hero-reveal-duration-ms="220"
              data-hero-reveal-ease="ease-out"
              className={`block font-[400] text-[color:var(--ivory)] [text-shadow:none] transition-all duration-[220ms] ease-out will-change-transform ${showLine1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
            >
              <span
                data-hero-field="headlineLine1Portugal"
                className="[font-family:var(--font-serif)] italic font-normal text-[color:var(--gold-soft)] [letter-spacing:-0.01em] pr-[0.06em]"
              >
                Portugal
              </span>
              {HERO_COPY.headlineLine1.replace(/^Portugal/, "")}
            </span>
            <span
              data-hero-field="headlineLine2"
              data-hero-reveal="headlineLine2"
              data-hero-reveal-order="3"
              data-hero-reveal-duration-ms="220"
              data-hero-reveal-ease="ease-out"
              className={`block mt-4 sm:mt-5 md:mt-6 [font-family:var(--font-serif)] italic font-normal [letter-spacing:-0.005em] [line-height:1.02] text-[color:var(--gold-soft)] [text-shadow:none] transition-all duration-[220ms] ease-out will-change-transform ${showLine2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
            >
              {HERO_COPY.headlineLine2}
            </span>
          </h1>

          <div
            data-hero-reveal="finalBlock"
            data-hero-reveal-order="4"
            data-hero-reveal-duration-ms="220"
            data-hero-reveal-ease="ease-out"
            className={`transition-all duration-[220ms] ease-out ${showFinal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            // Pointer-events gating so CTAs aren't clickable before they reveal.
            style={{ pointerEvents: showFinal ? "auto" : "none" }}
          >
            <p
              data-hero-field="subheadline"
              className="mt-8 sm:mt-9 md:mt-12 max-w-[34rem] text-[14.5px] sm:text-[17px] md:text-[18px] leading-[1.68] md:leading-[1.72] tracking-[0] text-[color:var(--ivory)] text-pretty [text-shadow:none]"
            >
              {HERO_COPY.subheadline}
            </p>

            <div className="mt-8 sm:mt-9 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <CtaButton
                to="/builder"
                variant="primary"
                className="hero-cta-button"
                data-hero-field="primaryCta"
              >
                {HERO_COPY.primaryCta}
              </CtaButton>
              <CtaButton
                to="/experiences"
                variant="ghostDark"
                className="hero-cta-button"
                data-hero-field="secondaryCta"
              >
                {HERO_COPY.secondaryCta}
              </CtaButton>
            </div>

            <p
              data-hero-field="microcopy"
              className="mt-5 sm:mt-6 text-[12.5px] sm:text-[13px] leading-[1.5] tracking-[0.04em] text-[color:var(--ivory)] [text-shadow:none]"
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

      {/* Opt-in dev overlay — `?heroColorDebug=1`. Renders nothing otherwise. */}
      <HeroColorDebugOverlay />
    </section>
  );
}
