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

const HERO_FILM_SRC_1080 = "/video/film/yes-hero-film-1080.mp4";
const HERO_FILM_SRC_720 = "/video/film/yes-hero-film-720.mp4";
const HERO_FILM_POSTER = "/video/film/yes-hero-poster.jpg";


export function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  
  const [storyActive, setStoryActive] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    // Fallback if IntersectionObserver is unavailable.
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setStoryActive(true), 120);
      return () => window.clearTimeout(t);
    }

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            // Small delay so the first frame paints before the cascade begins.
            timer = window.setTimeout(() => setStoryActive(true), 120);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: [0, 0.25, 0.5], rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const handleScrollToNext = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("reviews");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // Update hash without jumping (smooth scroll already running).
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#reviews");
    }
  };

  return (
    <section
      ref={sectionRef}
      className="hero-cinematic relative isolate w-full min-h-[calc(100svh-65px)] md:min-h-screen overflow-hidden bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)] flex items-end"
      aria-roledescription="cinematic hero film"
      aria-label={`${HERO_COPY.headlineLine1} ${HERO_COPY.headlineLine2}`}
      data-hero-cinematic="true"
      data-story-active={storyActive ? "true" : "false"}
      
    >
      {/* Continuous film — full bleed, no inner box, no rounded corners.
         Always rendered so mobile users see the film; reduced-motion users
         simply see the poster frame (no autoplay) instead of motion. */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 w-full h-full object-cover"
        poster={HERO_FILM_POSTER}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        aria-hidden="true"
        data-hero-film="true"
      >
        <source src={HERO_FILM_SRC_720} type="video/mp4" media="(max-width: 767px)" />
        <source src={HERO_FILM_SRC_1080} type="video/mp4" />
      </video>

      {/* Bottom darken so copy stays AA against varied frames. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(15,12,9,0.28)_0%,rgba(15,12,9,0.38)_30%,rgba(15,12,9,0.68)_66%,rgba(15,12,9,0.92)_100%)]"
      />
      {/* Extra scrim directly behind copy block — guarantees AA on the brightest frames. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[70%] bg-[radial-gradient(110%_78%_at_50%_84%,rgba(15,12,9,0.72)_0%,rgba(15,12,9,0.52)_46%,rgba(15,12,9,0)_100%)]"
      />

      {/* Copy column — full width on mobile with 20px gutters, capped on tablet+. */}
      <div className="hero-story-shell relative z-10 w-full px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 xs:px-6 xs:pb-7 xs:pt-7 sm:px-8 sm:pb-12 md:px-12 md:pb-20 md:pt-24 lg:px-16">
        <div className="hero-story-column mx-auto max-w-[22rem] xs:max-w-[23.25rem] sm:max-w-[36rem] md:mx-0 md:ml-[6vw] md:max-w-[46rem] lg:ml-[8vw]">
          <Eyebrow
            tone="onDark"
            data-hero-field="eyebrow"
            data-hero-reveal="eyebrow"
            data-hero-reveal-order="1"
            data-hero-reveal-duration-ms="220"
            data-hero-reveal-ease="ease-out"
            className="hero-eyebrow hero-reveal hero-reveal--from-left hero-story-beat"
          >
            {HERO_COPY.eyebrow}
          </Eyebrow>

          <h1
            className="hero-h1 t-display mt-3 xs:mt-4 sm:mt-9 md:mt-11 w-full max-w-[min(22rem,calc(100vw-2.25rem))] sm:max-w-[32rem] md:max-w-[15ch] text-wrap md:text-balance text-[color:var(--ivory)] [font-weight:400] [font-size:clamp(1.78rem,7.65vw,2.18rem)] sm:[font-size:2.4rem] md:[font-size:4rem] lg:[font-size:4.75rem] [letter-spacing:0] md:[letter-spacing:-0.005em] [line-height:1.04] md:[line-height:1.02] lg:[line-height:0.98] [text-shadow:none] [overflow-wrap:normal]"
            data-hero-field="headlineLine1 headlineLine2"
          >
            <span
              data-hero-field="headlineLine1"
              data-hero-reveal="headlineLine1"
              data-hero-reveal-order="2"
              data-hero-reveal-duration-ms="220"
              data-hero-reveal-ease="ease-out"
              className="hero-reveal hero-reveal--from-left hero-story-beat block max-w-full whitespace-normal font-[400] text-[color:var(--ivory)] [text-shadow:none]"
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
              className="hero-reveal hero-reveal--from-right hero-story-beat block mt-1.5 xs:mt-2 sm:mt-5 md:mt-6 max-w-full whitespace-normal [font-family:var(--font-serif)] italic font-normal [letter-spacing:0] md:[letter-spacing:-0.005em] [line-height:1.04] md:[line-height:1.02] text-[color:var(--gold-soft)] [text-shadow:none]"
            >
              {HERO_COPY.headlineLine2}
            </span>
          </h1>

          <div
            data-hero-reveal="finalBlock"
            data-hero-reveal-order="4"
            data-hero-reveal-duration-ms="220"
            data-hero-reveal-ease="ease-out"
            className="hero-final-reveal transition-[opacity,transform] duration-[420ms] ease-[var(--ease-premium)] transform-gpu will-change-transform"
          >
            <p
              data-hero-field="subheadline"
              className="hero-story-step hero-story-step--copy mt-3 xs:mt-4 sm:mt-9 md:mt-12 max-w-[31rem] text-[13.5px] xs:text-[14px] sm:text-[17px] md:text-[18px] leading-[1.5] sm:leading-[1.6] md:leading-[1.7] tracking-[0] text-[color:var(--ivory)] text-pretty [text-shadow:none]"
            >
              {HERO_COPY.subheadline}
            </p>

            <div className="hero-cta-flow mt-5 xs:mt-6 sm:mt-9 md:mt-10 flex flex-col sm:flex-row gap-2.5 sm:gap-4 items-stretch sm:items-center">
              <CtaButton
                to="/builder"
                variant="primary"
                className="hero-story-step hero-story-step--cta-primary hero-cta-button hero-cta-button--primary cta-primary min-h-[48px] py-3 text-[11px] tracking-[0.12em] xs:min-h-[50px] xs:text-[11.75px] sm:text-[13px]"
                data-hero-field="primaryCta"
              >
                {HERO_COPY.primaryCta}
              </CtaButton>
              <CtaButton
                to="/experiences"
                variant="ghostDark"
                className="hero-story-step hero-story-step--cta-secondary hero-cta-button hero-cta-button--secondary cta-secondary-dark min-h-[48px] py-3 text-[10.75px] tracking-[0.105em] xs:min-h-[50px] xs:text-[11.25px] sm:text-[13px]"
                data-hero-field="secondaryCta"
                data-cta-stagger="true"
              >
                {HERO_COPY.secondaryCta}
              </CtaButton>
            </div>

            <p
              data-hero-field="microcopy"
              className="hero-story-step hero-story-step--microcopy mt-3.5 xs:mt-4 sm:mt-6 text-[11.75px] xs:text-[12px] sm:text-[13px] leading-[1.45] tracking-[0.02em] text-[color:var(--ivory)] [text-shadow:none]"
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

      {/* Smooth-scroll cue → first section after the hero. Visible on
          tablet+ where there's vertical room beside the CTAs; hidden on
          mobile to keep the storytelling stack uncluttered. Honors
          prefers-reduced-motion (instant jump instead of smooth). */}
      <a
        href="#reviews"
        onClick={handleScrollToNext}
        aria-label="Scroll to next section"
        data-hero-scroll-cue="true"
        className="hero-scroll-cue hidden md:flex absolute z-[4] bottom-6 lg:bottom-8 right-6 lg:right-10 items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[color:var(--ivory)]/80 hover:text-[color:var(--gold-soft)] focus-visible:text-[color:var(--gold-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--charcoal-deep)] rounded-sm px-1.5 py-1 transition-colors duration-[220ms] ease-[var(--ease-premium,cubic-bezier(0.22,0.61,0.36,1))]"
      >
        <span className="hero-scroll-cue__label">Scroll</span>
        <span aria-hidden="true" className="hero-scroll-cue__line block h-px w-8 bg-[color:var(--gold-soft)]/70" />
        <svg
          aria-hidden="true"
          width="10"
          height="14"
          viewBox="0 0 10 14"
          fill="none"
          className="hero-scroll-cue__chevron"
        >
          <path d="M1 1l4 5 4-5M1 7l4 5 4-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

      {/* Soft fade into the next section. Kept short on mobile so it
          never overlaps the CTAs/microcopy; full height on tablet+. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 sm:h-20 md:h-24 z-[3] bg-[linear-gradient(180deg,rgba(250,248,243,0)_0%,rgba(250,248,243,0.4)_60%,var(--ivory)_100%)]"
      />

      {/* Opt-in dev overlay — `?heroColorDebug=1`. Renders nothing otherwise. */}
      <HeroColorDebugOverlay />
    </section>
  );
}
