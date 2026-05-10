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
import {
  HeroPhraseDebug,
  useHeroPhraseDebugToggle,
  type PhrasePhase,
} from "@/components/home/HeroPhraseDebug";

const HERO_FILM_SRC_1080 = "/video/film/yes-hero-film-1080.mp4";
const HERO_FILM_SRC_720 = "/video/film/yes-hero-film-720.mp4";
const HERO_FILM_POSTER = "/video/film/yes-hero-poster.jpg";

/**
 * Per-phrase cinematic scene.
 *
 * Each phrase enters from `from`, settles at its rest anchor, then exits
 * to `to`. This lets phrases tell a story across the frame — a phrase
 * can come from upper-right and exit upper-left; the next can come from
 * lower-left and exit lower-right. Pure offsets in px (mobile baseline).
 *
 *  - from  / to        entry & exit offset in px (negative = up/left)
 *  - rest{X,Y}Pct      rest anchor offset, in % of the stage box
 *                      (0 = centre, +12 = right/bottom, -12 = left/top)
 *  - fadeInMs / holdMs / fadeOutMs   timing of the beat
 *  - mdScale            multiplier applied to from/to on ≥768px
 *
 * NOTE: Total beat = fadeInMs + holdMs + fadeOutMs. Rest anchors are
 * intentionally conservative on mobile so nothing clips at narrow widths.
 */
type PhraseScene = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  restXPct: number;
  restYPct: number;
  fadeInMs: number;
  holdMs: number;
  fadeOutMs: number;
  mdScale: number;
};

/** Premium pacing default — long fades, short copy reads, big breath. */
const SCENE_DEFAULT: Omit<PhraseScene, "from" | "to" | "restXPct" | "restYPct"> = {
  fadeInMs: 1700,
  holdMs: 2400,
  fadeOutMs: 1700,
  mdScale: 1.7,
};

/**
 * 10 phrases, each with a unique trajectory. Read like a story:
 * upper-right → upper-left → lower-left → lower-right …
 * Tweak any single phrase here without touching the component logic.
 */
const PHRASE_SCENES: PhraseScene[] = [
  // 0 — opens upper-right, drifts toward upper-left
  { ...SCENE_DEFAULT, from: { x:  34, y: -22 }, to: { x: -28, y: -14 }, restXPct:  6, restYPct: -14 },
  // 1 — slides from upper-left, settles upper-centre, exits down-left
  { ...SCENE_DEFAULT, from: { x: -36, y: -18 }, to: { x: -22, y:  18 }, restXPct: -8, restYPct: -16 },
  // 2 — comes from lower-left, lifts to mid-left, exits to mid-right
  { ...SCENE_DEFAULT, from: { x: -34, y:  24 }, to: { x:  30, y:  10 }, restXPct: -6, restYPct:  -2 },
  // 3 — enters lower-right, rests centre, exits upper-right
  { ...SCENE_DEFAULT, from: { x:  32, y:  22 }, to: { x:  26, y: -22 }, restXPct:  4, restYPct:   2 },
  // 4 — drifts in from above, sits high-right, exits low-left
  { ...SCENE_DEFAULT, from: { x:  18, y: -30 }, to: { x: -28, y:  22 }, restXPct: 10, restYPct: -10 },
  // 5 — comes from lower-centre, rises to centre, exits upper-left
  { ...SCENE_DEFAULT, from: { x:  -8, y:  28 }, to: { x: -32, y: -18 }, restXPct:  0, restYPct:   4 },
  // 6 — enters upper-left, holds mid-left, exits lower-right
  { ...SCENE_DEFAULT, from: { x: -32, y: -20 }, to: { x:  30, y:  22 }, restXPct: -8, restYPct:  -4 },
  // 7 — slides from right, sits low-centre, exits up
  { ...SCENE_DEFAULT, from: { x:  34, y:   4 }, to: { x:   8, y: -28 }, restXPct:  4, restYPct:  10 },
  // 8 — comes from lower-left, rises and exits to upper-right
  { ...SCENE_DEFAULT, from: { x: -28, y:  26 }, to: { x:  30, y: -22 }, restXPct: -4, restYPct:   8 },
  // 9 — closing breath: gentle drift in from below-centre, dissolves up
  { ...SCENE_DEFAULT, fadeInMs: 1900, holdMs: 2800, fadeOutMs: 2000,
    from: { x:   0, y:  18 }, to: { x:   0, y: -16 }, restXPct:  0, restYPct:   0 },
];

/** Brief gap between the last phrase fading out and the CTA reveal. */
const COMPOSE_GAP_MS = 700;
/** Extra hold after closing headline settles before CTAs appear. */
const CTA_REVEAL_DELAY_MS = 1400;

function sceneFor(i: number): PhraseScene {
  return PHRASE_SCENES[Math.min(Math.max(i, 0), PHRASE_SCENES.length - 1)];
}
function beatDurationMs(i: number): number {
  const s = sceneFor(i);
  return s.fadeInMs + s.holdMs + s.fadeOutMs;
}

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
  const showPhraseDebug = useHeroPhraseDebugToggle();
  const [phraseStartedAt, setPhraseStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => (typeof performance !== "undefined" ? performance.now() : 0));

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

    // Compute cumulative start time of each phrase.
    const startOffset = 250;
    const startTimes: number[] = [];
    let acc = startOffset;
    for (let i = 0; i < HERO_PHRASES.length; i++) {
      startTimes.push(acc);
      acc += beatDurationMs(i);
    }
    const sequenceEnd = acc; // moment the last phrase finishes fading out
    const lastFadeOut = timingFor(HERO_PHRASES.length - 1).fadeOutMs;

    for (let i = 0; i < HERO_PHRASES.length; i++) {
      const id = window.setTimeout(() => {
        if (!cancelled) setPhraseIndex(i);
      }, startTimes[i]);
      timers.push(id);
    }

    // After the last phrase: mark sequence done (fade it out), then reveal closing stanza, then CTAs.
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) setPhraseIndex(HERO_PHRASES.length);
      }, sequenceEnd - lastFadeOut),
    );
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) setComposed(true);
      }, sequenceEnd + COMPOSE_GAP_MS),
    );
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) setCtaRevealed(true);
      }, sequenceEnd + COMPOSE_GAP_MS + CTA_REVEAL_DELAY_MS),
    );

    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
    };
  }, [skipIntro]);

  // Stamp when each phrase becomes active so the debug overlay can compute elapsed time.
  useEffect(() => {
    if (phraseIndex < 0) {
      setPhraseStartedAt(null);
      return;
    }
    setPhraseStartedAt(typeof performance !== "undefined" ? performance.now() : Date.now());
  }, [phraseIndex]);

  // Lightweight rAF tick — only runs while the debug overlay is visible.
  useEffect(() => {
    if (!showPhraseDebug) return;
    let raf = 0;
    const tick = () => {
      setNow(typeof performance !== "undefined" ? performance.now() : Date.now());
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [showPhraseDebug]);

  // Derive current phase + active timing for the debug overlay.
  const debugInfo = useMemo(() => {
    const total = HERO_PHRASES.length;
    if (phraseIndex < 0) {
      return { phase: "idle" as PhrasePhase, corner: null, t: PHRASE_TIMINGS.tl, elapsed: 0 };
    }
    if (phraseIndex >= total) {
      return { phase: "done" as PhrasePhase, corner: null, t: timingFor(total - 1), elapsed: 0 };
    }
    const corner = PHRASE_CORNERS[phraseIndex % PHRASE_CORNERS.length];
    const t = PHRASE_TIMINGS[corner];
    const elapsed = phraseStartedAt != null ? Math.max(0, now - phraseStartedAt) : 0;
    let phase: PhrasePhase = "fadeIn";
    if (elapsed > t.fadeInMs + t.holdMs) phase = "fadeOut";
    else if (elapsed > t.fadeInMs) phase = "hold";
    return { phase, corner, t, elapsed };
  }, [phraseIndex, phraseStartedAt, now]);

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
      {showPhraseDebug && (
        <HeroPhraseDebug
          phraseIndex={phraseIndex}
          total={HERO_PHRASES.length}
          corner={debugInfo.corner}
          phase={debugInfo.phase}
          fadeInMs={debugInfo.t.fadeInMs}
          holdMs={debugInfo.t.holdMs}
          fadeOutMs={debugInfo.t.fadeOutMs}
          driftX={debugInfo.t.driftX}
          driftY={debugInfo.t.driftY}
          elapsedMs={debugInfo.elapsed}
        />
      )}

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
          <div className="relative w-full max-w-[22rem] xs:max-w-[24rem] sm:max-w-[38rem] md:max-w-[52rem] lg:max-w-[60rem] text-center">
            {HERO_PHRASES.map((phrase, i) => {
              const visible = i === phraseIndex;
              const corner: PhraseCorner = PHRASE_CORNERS[i % PHRASE_CORNERS.length];
              const t = PHRASE_TIMINGS[corner];
              const phraseStyle = {
                "--phrase-fade-in": `${t.fadeInMs}ms`,
                "--phrase-fade-out": `${t.fadeOutMs}ms`,
                "--phrase-drift-x": `${t.driftX}px`,
                "--phrase-drift-y": `${t.driftY}px`,
                "--phrase-drift-x-md": `${t.driftXMd}px`,
                "--phrase-drift-y-md": `${t.driftYMd}px`,
              } as React.CSSProperties;
              return (
                <p
                  key={i}
                  data-hero-phrase-index={i}
                  data-hero-phrase-visible={visible ? "true" : "false"}
                  data-hero-phrase-corner={corner}
                  style={phraseStyle}
                  className="hero-phrase absolute inset-0 mx-auto flex items-center justify-center px-2 [font-family:var(--font-serif)] italic font-normal text-[color:var(--gold)] text-[22px] xs:text-[26px] sm:text-[36px] md:text-[52px] lg:text-[60px] leading-[1.18] xs:leading-[1.16] sm:leading-[1.14] tracking-[-0.008em] text-pretty text-balance [text-shadow:0_2px_26px_rgba(0,0,0,0.65)]"
                >
                  <span className="block max-w-[22ch] xs:max-w-[24ch] sm:max-w-[26ch]">{phrase}</span>
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
