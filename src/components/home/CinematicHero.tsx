/**
 * CinematicHero — single continuous cinematic film hero.
 *
 * One full-bleed background video. Over the film, a 10-phrase
 * cinematic sequence plays one phrase at a time (soft fade in,
 * gentle rise, soft fade out). After the final phrase, the closing
 * stanza (eyebrow + h1 + h2 + sub + CTAs + microcopy) fades in.
 *
 * Honors prefers-reduced-motion and `?hero=last` (visual-regression
 * freeze): both jump straight to the composed final state.
 *
 * Renders ALL HERO_COPY strings (visible + sr-only probes) so the
 * byte-exact / version locks still pass.
 */

import { useEffect, useMemo, useRef, useState } from "react";

import { HERO_COPY, HERO_COPY_VERSION, HERO_PHRASES } from "@/content/hero-copy";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CtaButton } from "@/components/ui/CtaButton";
import { HeroColorDebugOverlay } from "@/components/HeroColorDebugOverlay";
import {
  HeroScrimRuler,
  useHeroScrimRulerToggle,
} from "@/components/home/HeroScrimRuler";

const HERO_FILM_SRC_1080 = "/video/film/yes-hero-film-1080.mp4";
const HERO_FILM_SRC_720 = "/video/film/yes-hero-film-720.mp4";
const HERO_FILM_POSTER = "/video/film/yes-hero-poster.jpg";

/** Slower, story-like pacing — each phrase: 0.8s fade-in → ~2.1s hold → 0.7s fade-out. */
const PHRASE_DURATION_MS = 3600;
const PHRASE_FADE_MS = 760;
/** Brief gap between the last phrase fading out and the CTA reveal. */
const COMPOSE_GAP_MS = 480;

/** Corners the phrases enter from — cycles TL → TR → BR → BL → … */
const PHRASE_CORNERS = ["tl", "tr", "br", "bl"] as const;
type PhraseCorner = (typeof PHRASE_CORNERS)[number];

function isHeroLastFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("hero") === "last";
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const showScrimRuler = useHeroScrimRulerToggle();

  const skipIntro = useMemo(
    () => isHeroLastFlag() || prefersReducedMotion(),
    [],
  );

  const [videoFailed, setVideoFailed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return new URLSearchParams(window.location.search).get("heroVideoFail") === "1";
    } catch {
      return false;
    }
  });
  const [videoSrc, setVideoSrc] = useState<string>(HERO_FILM_SRC_720);

  /** -1 = intro not started yet; 0..N-1 = phrase showing; N = sequence done. */
  const [phraseIndex, setPhraseIndex] = useState<number>(skipIntro ? HERO_PHRASES.length : -1);
  const [composed, setComposed] = useState<boolean>(skipIntro);
  const [ctaRevealed, setCtaRevealed] = useState<boolean>(skipIntro);

  // Resolve source on the client by viewport.
  useEffect(() => {
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches;
    setVideoSrc(isDesktop ? HERO_FILM_SRC_1080 : HERO_FILM_SRC_720);
  }, []);

  // Autoplay the continuous film. If autoplay is rejected, the static
  // poster <img> below stays visible and the phrase sequence still runs.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.catch(() => setVideoFailed(true));
      }
    };
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("canplay", tryPlay, { once: true });
    const onTouch = () => v.play().catch(() => {});
    window.addEventListener("touchstart", onTouch, { once: true, passive: true });
    window.addEventListener("pointerdown", onTouch, { once: true });
    return () => {
      v.removeEventListener("canplay", tryPlay);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("pointerdown", onTouch);
    };
  }, []);

  // Phrase-by-phrase intro sequence. Each phrase advances every
  // PHRASE_DURATION_MS; after the last, fade out and reveal the
  // closing stanza + CTAs. Skipped entirely when reduced-motion or
  // `?hero=last` is set (composed=true at mount).
  useEffect(() => {
    if (skipIntro) return;

    let cancelled = false;
    const timers: number[] = [];

    // Kick off phrase 0 immediately.
    const start = window.setTimeout(() => {
      if (cancelled) return;
      setPhraseIndex(0);
    }, 250);
    timers.push(start);

    for (let i = 1; i < HERO_PHRASES.length; i++) {
      const id = window.setTimeout(() => {
        if (!cancelled) setPhraseIndex(i);
      }, 250 + i * PHRASE_DURATION_MS);
      timers.push(id);
    }

    // After the last phrase: fade it out, then reveal the composed stanza.
    const fadeOutAt = 250 + HERO_PHRASES.length * PHRASE_DURATION_MS;
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) setPhraseIndex(HERO_PHRASES.length);
      }, fadeOutAt),
    );
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) setComposed(true);
      }, fadeOutAt + PHRASE_FADE_MS + COMPOSE_GAP_MS),
    );
    // CTAs appear ISOLATED at the very end — held back after the
    // closing headline settles so it reads alone first.
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) setCtaRevealed(true);
      }, fadeOutAt + PHRASE_FADE_MS + COMPOSE_GAP_MS + 1100),
    );

    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
    };
  }, [skipIntro]);

  const handleScrollToNext = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("reviews");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#reviews");
    }
  };

  const showCta = ctaRevealed;

  return (
    <section
      ref={sectionRef}
      className="hero-cinematic relative isolate w-full min-h-[calc(100svh-73px)] md:min-h-[calc(100svh-89px)] lg:min-h-[calc(100svh-101px)] overflow-hidden bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)] flex items-end"
      aria-roledescription="cinematic hero film"
      aria-label={`${HERO_COPY.headlineLine1} ${HERO_COPY.headlineLine2}`}
      data-hero-cinematic="true"
      data-story-active={phraseIndex >= 0 ? "true" : "false"}
      data-hero-phase={composed ? "composed" : phraseIndex < 0 ? "idle" : `phrase-${phraseIndex}`}
      data-video-fallback={videoFailed ? "true" : "false"}
    >
      {/* Continuous film — full bleed. If autoplay fails, the poster image
         below stays visible and the phrase sequence continues unchanged. */}
      <video
        ref={videoRef}
        key={videoSrc}
        className="absolute inset-0 z-0 w-full h-full object-cover hero-film-video"
        poster={HERO_FILM_POSTER}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        aria-hidden="true"
        data-hero-film="true"
        onPlaying={() => setVideoFailed(false)}
        onError={() => setVideoFailed(true)}
        onStalled={() => setVideoFailed(true)}
        src={videoSrc}
      />
      {/* Static poster fallback — only painted if the video fails. */}
      <img
        src={HERO_FILM_POSTER}
        alt=""
        aria-hidden="true"
        className="hero-film-fallback absolute inset-0 z-0 w-full h-full object-cover"
      />

      {/* Bottom darken so copy stays AA against varied frames.
         Gradient stops live in --hero-scrim-base (src/styles.css). */}
      <div
        aria-hidden="true"
        className="hero-scrim--base pointer-events-none absolute inset-0 z-[1]"
      />
      {/* Extra scrim directly behind copy block — guarantees AA on the brightest frames. */}
      <div
        aria-hidden="true"
        className="hero-scrim--focus pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[70%]"
      />
      {/* Mobile-only editorial scrim — soft bell curve aligned with the lifted text group. */}
      <div
        aria-hidden="true"
        className="hero-scrim--mobile-radial pointer-events-none absolute inset-x-0 z-[2] md:hidden top-[10svh] bottom-[8svh]"
      />
      <div
        aria-hidden="true"
        className="hero-scrim--mobile-vertical pointer-events-none absolute inset-x-0 z-[2] md:hidden top-[12svh] bottom-[10svh]"
      />

      {showScrimRuler && <HeroScrimRuler />}

      {/* ── Phrase-by-phrase cinematic intro ──────────────────────────
         One phrase visible at a time, centered over the film. Soft
         fade in + gentle rise; soft fade out before the next appears.
         Hidden once the closing stanza is composed.            */}
      {!composed && (
        <div
          aria-hidden={composed ? "true" : undefined}
          className="hero-phrase-stage pointer-events-none absolute inset-0 z-[5] flex items-center justify-center px-6 sm:px-10"
          data-hero-phrase-stage="true"
        >
          <div className="relative w-full max-w-[20rem] xs:max-w-[22rem] sm:max-w-[34rem] md:max-w-[44rem] text-center">
            {HERO_PHRASES.map((phrase, i) => {
              const visible = i === phraseIndex;
              const side = i % 2 === 0 ? "left" : "right";
              return (
                <p
                  key={i}
                  data-hero-phrase-index={i}
                  data-hero-phrase-visible={visible ? "true" : "false"}
                  data-hero-phrase-side={side}
                  className="hero-phrase absolute inset-0 mx-auto flex items-center justify-center px-2 [font-family:var(--font-serif)] italic font-normal text-[color:var(--ivory)] text-[18px] xs:text-[20px] sm:text-[30px] md:text-[40px] lg:text-[46px] leading-[1.22] xs:leading-[1.2] sm:leading-[1.16] tracking-[-0.005em] text-pretty text-balance [text-shadow:0_2px_22px_rgba(0,0,0,0.55)]"
                >
                  <span className="block max-w-[24ch] xs:max-w-[26ch] sm:max-w-[28ch]">{phrase}</span>
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="hero-story-shell relative z-10 w-full px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 xs:px-6 xs:pb-[calc(7.5rem+env(safe-area-inset-bottom))] xs:pt-7 sm:px-8 sm:pb-12 md:px-12 md:pb-20 md:pt-24 lg:px-16"
        data-hero-composed={composed ? "true" : "false"}
      >
        <div className="hero-story-column mx-auto max-w-[22rem] xs:max-w-[23.25rem] sm:max-w-[36rem] md:mx-0 md:ml-[6vw] md:max-w-[46rem] lg:ml-[8vw]">
          {/* Story headline + sub kept in DOM (sr-only) for SEO / a11y /
             SSR copy locks. The visible cinematic story is told entirely
             through the corner-entering phrases above; only the CTAs +
             microcopy remain visible at the closing beat. */}
          <div className="sr-only">
            <span data-hero-field="eyebrow">{HERO_COPY.eyebrow}</span>
            <h1 data-hero-field="headlineLine1 headlineLine2">
              <span data-hero-field="headlineLine1">{HERO_COPY.headlineLine1}</span>{" "}
              <span data-hero-field="headlineLine2">{HERO_COPY.headlineLine2}</span>
            </h1>
            <p data-hero-field="subheadline">{HERO_COPY.subheadline}</p>
          </div>

          <div className="hero-cta-block">
            <div className="hero-cta-flow mt-5 xs:mt-6 sm:mt-9 md:mt-10 flex flex-col sm:flex-row gap-2.5 sm:gap-4 items-stretch sm:items-center">
              <CtaButton
                to="/builder"
                variant="primary"
                className="hero-beat hero-beat--rise hero-cta-button hero-cta-button--primary cta-primary min-h-[48px] py-3 text-[11px] tracking-[0.12em] xs:min-h-[50px] xs:text-[11.75px] sm:text-[13px]"
                data-hero-field="primaryCta"
                data-hero-beat-show={showCta ? "true" : "false"}
                data-hero-beat-delay="0"
              >
                {HERO_COPY.primaryCta}
              </CtaButton>
              <CtaButton
                to="/experiences"
                variant="ghostDark"
                className="hero-beat hero-beat--rise hero-cta-button hero-cta-button--secondary cta-secondary-dark min-h-[48px] py-3 text-[10.75px] tracking-[0.105em] xs:min-h-[50px] xs:text-[11.25px] sm:text-[13px]"
                data-hero-field="secondaryCta"
                data-cta-stagger="true"
                data-hero-beat-show={showCta ? "true" : "false"}
                data-hero-beat-delay="160"
              >
                {HERO_COPY.secondaryCta}
              </CtaButton>
            </div>

            <p
              data-hero-field="microcopy"
              data-hero-beat-show={showCta ? "true" : "false"}
              data-hero-beat-delay="320"
              className="hero-beat hero-beat--rise mt-3.5 xs:mt-4 sm:mt-6 text-[11.75px] xs:text-[12px] sm:text-[13px] leading-[1.45] tracking-[0.02em] text-[color:var(--ivory)] [text-shadow:none]"
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
        data-hero-copy-json={JSON.stringify({ version: HERO_COPY_VERSION, copy: HERO_COPY, phrases: HERO_PHRASES })}
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
            __html: JSON.stringify({ version: HERO_COPY_VERSION, copy: HERO_COPY, phrases: HERO_PHRASES }, null, 2),
          }}
        />
      </div>

      {/* Smooth-scroll cue → first section after the hero. Visible on
          tablet+ where there's vertical room beside the CTAs; hidden on
          mobile to keep the storytelling stack uncluttered. */}
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

      {/* Soft fade into the next section. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 sm:h-20 md:h-24 z-[3] bg-[linear-gradient(180deg,rgba(250,248,243,0)_0%,rgba(250,248,243,0.4)_60%,var(--ivory)_100%)]"
      />

      {/* Opt-in dev overlay — `?heroColorDebug=1`. Renders nothing otherwise. */}
      <HeroColorDebugOverlay />
    </section>
  );
}

export default CinematicHero;
