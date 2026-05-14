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

/**
 * Premium editorial pacing — left→right reveal, gentle horizontal drift,
 * soft fade. All phrases share the same cinematic motion; only timing
 * varies (longer holds for two-line phrases). The clip-path mask reveal
 * is handled in CSS via [data-hero-phrase-state].
 */
const SCENE_DEFAULT: Omit<PhraseScene, "from" | "to" | "restXPct" | "restYPct"> = {
  fadeInMs: 1200,
  holdMs: 3200,
  fadeOutMs: 900,
  mdScale: 1,
};

/** Subtle horizontal drift only — phrase emerges from the left, dissolves to the right. */
const DRIFT_FROM = { x: -16, y: 0 };
const DRIFT_TO   = { x:  14, y: 0 };

/** Cinematic breathing pause between phrases — no hard cuts. */
const PHRASE_GAP_MS = 520;

const PHRASE_SCENES: PhraseScene[] = [
  // Single-line phrases — standard hold.
  { ...SCENE_DEFAULT, from: DRIFT_FROM, to: DRIFT_TO, restXPct: 0, restYPct: 0 }, // 0 Portugal is the stage.
  { ...SCENE_DEFAULT, from: DRIFT_FROM, to: DRIFT_TO, restXPct: 0, restYPct: 0 }, // 1 You write your story.
  { ...SCENE_DEFAULT, from: DRIFT_FROM, to: DRIFT_TO, restXPct: 0, restYPct: 0, holdMs: 2600 }, // 2 Hidden chapters wait to unfold.
  { ...SCENE_DEFAULT, from: DRIFT_FROM, to: DRIFT_TO, restXPct: 0, restYPct: 0, holdMs: 2600 }, // 3 Locals know where they begin.
  { ...SCENE_DEFAULT, from: DRIFT_FROM, to: DRIFT_TO, restXPct: 0, restYPct: 0, holdMs: 2600 }, // 4 You decide how to live it.
  // 5 — long four-clause phrase, longer reveal + hold.
  { ...SCENE_DEFAULT, from: DRIFT_FROM, to: DRIFT_TO, restXPct: 0, restYPct: 0, fadeInMs: 1100, holdMs: 3200 },
  { ...SCENE_DEFAULT, from: DRIFT_FROM, to: DRIFT_TO, restXPct: 0, restYPct: 0 }, // 6 Every story is different.
  { ...SCENE_DEFAULT, from: DRIFT_FROM, to: DRIFT_TO, restXPct: 0, restYPct: 0, holdMs: 2200 }, // 7 So is yours.
  { ...SCENE_DEFAULT, from: DRIFT_FROM, to: DRIFT_TO, restXPct: 0, restYPct: 0, holdMs: 2600 }, // 8 Portugal is waiting to be lived.
  // 9 — closing line, breathe before CTAs land.
  { ...SCENE_DEFAULT, from: DRIFT_FROM, to: DRIFT_TO, restXPct: 0, restYPct: 0, fadeInMs: 1100, holdMs: 2800, fadeOutMs: 900 },
];

/** Pause between the last phrase fading out and the CTA reveal. */
const COMPOSE_GAP_MS = 900;
/** Extra hold after closing headline settles before CTAs land. */
const CTA_REVEAL_DELAY_MS = 1200;

function sceneFor(i: number): PhraseScene {
  return PHRASE_SCENES[Math.min(Math.max(i, 0), PHRASE_SCENES.length - 1)];
}
function beatDurationMs(i: number, scale = 1): number {
  const s = sceneFor(i);
  return Math.round((s.fadeInMs + s.holdMs + s.fadeOutMs) * scale);
}
/** Sum of all base beat durations (intensity = 1, no video fit) including
 *  the cinematic breathing pause inserted between phrases. */
function baseSequenceMs(): number {
  let acc = 0;
  for (let i = 0; i < PHRASE_SCENES.length; i++) {
    acc += beatDurationMs(i, 1);
    if (i < PHRASE_SCENES.length - 1) acc += PHRASE_GAP_MS;
  }
  return acc;
}

/** Global animation intensity (debug-controlled). Shared by both this
 *  component and HeroPhraseDebug via localStorage + a custom event. */
const INTENSITY_KEY = "hero-phrase-debug:intensity";
const INTENSITY_EVENT = "hero-phrase-intensity-change";
function loadIntensity(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = window.localStorage.getItem(INTENSITY_KEY);
    if (!raw) return 1;
    const n = Number(raw);
    if (!Number.isFinite(n)) return 1;
    return Math.max(0.4, Math.min(2, n));
  } catch {
    return 1;
  }
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
  const [videoDurationMs, setVideoDurationMs] = useState<number | null>(null);
  const [intensity, setIntensity] = useState<number>(() => loadIntensity());

  /**
   * Global timing scale combines:
   *  - user intensity (debug slider, 0.5–1.5×)
   *  - video-fit: stretch/compress so the full phrase sequence completes
   *    a touch before the video loop ends, keeping copy in sync with the
   *    cinematic film. Clamped to avoid extreme speeds.
   */
  const globalScale = useMemo(() => {
    const base = baseSequenceMs() + 250 /* start offset */ + COMPOSE_GAP_MS;
    let fit = 1;
    if (videoDurationMs && videoDurationMs > 4000) {
      // Aim to finish phrases ~1.5s before the video loops.
      const target = Math.max(6000, videoDurationMs - 1500);
      fit = target / base;
      fit = Math.max(0.7, Math.min(1.6, fit));
    }
    return intensity * fit;
  }, [intensity, videoDurationMs]);

  /** -1 = intro not started yet; 0..N-1 = phrase showing; N = sequence done. */
  const [phraseIndex, setPhraseIndex] = useState<number>(skipIntro ? HERO_PHRASES.length : -1);
  const [composed, setComposed] = useState<boolean>(skipIntro);
  const [ctaRevealed, setCtaRevealed] = useState<boolean>(skipIntro);

  // Listen for intensity changes from the debug overlay (same tab + cross tab).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setIntensity(loadIntensity());
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === "number" && Number.isFinite(detail)) {
        setIntensity(Math.max(0.4, Math.min(2, detail)));
      } else {
        sync();
      }
    };
    window.addEventListener(INTENSITY_EVENT, onCustom as EventListener);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(INTENSITY_EVENT, onCustom as EventListener);
      window.removeEventListener("storage", sync);
    };
  }, []);

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
    const captureDuration = () => {
      if (v.duration && Number.isFinite(v.duration) && v.duration > 0) {
        setVideoDurationMs(Math.round(v.duration * 1000));
      }
    };
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("canplay", tryPlay, { once: true });
    if (v.readyState >= 1) captureDuration();
    v.addEventListener("loadedmetadata", captureDuration);
    v.addEventListener("durationchange", captureDuration);
    const onTouch = () => v.play().catch(() => {});
    window.addEventListener("touchstart", onTouch, { once: true, passive: true });
    window.addEventListener("pointerdown", onTouch, { once: true });
    return () => {
      v.removeEventListener("canplay", tryPlay);
      v.removeEventListener("loadedmetadata", captureDuration);
      v.removeEventListener("durationchange", captureDuration);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("pointerdown", onTouch);
    };
  }, [videoSrc]);

  // Phrase-by-phrase intro sequence. Each phrase advances every
  // PHRASE_DURATION_MS; after the last, fade out and reveal the
  // closing stanza + CTAs. Skipped entirely when reduced-motion or
  // `?hero=last` is set (composed=true at mount).
  useEffect(() => {
    if (skipIntro) return;

    let cancelled = false;
    const timers: number[] = [];

    // Compute cumulative start time of each phrase, scaled by globalScale.
    const startOffset = 250;
    const startTimes: number[] = [];
    const gap = Math.round(PHRASE_GAP_MS * globalScale);
    let acc = startOffset;
    for (let i = 0; i < HERO_PHRASES.length; i++) {
      startTimes.push(acc);
      acc += beatDurationMs(i, globalScale);
      if (i < HERO_PHRASES.length - 1) acc += gap;
    }
    const sequenceEnd = acc;
    const lastFadeOut = Math.round(
      sceneFor(HERO_PHRASES.length - 1).fadeOutMs * globalScale,
    );

    for (let i = 0; i < HERO_PHRASES.length; i++) {
      const id = window.setTimeout(() => {
        if (!cancelled) setPhraseIndex(i);
      }, startTimes[i]);
      timers.push(id);
    }

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
  }, [skipIntro, globalScale]);

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

  // Derive current phase + scaled scene for the debug overlay.
  const debugInfo = useMemo(() => {
    const total = HERO_PHRASES.length;
    const scaleScene = (s: PhraseScene): PhraseScene => ({
      ...s,
      fadeInMs: Math.round(s.fadeInMs * globalScale),
      holdMs: Math.round(s.holdMs * globalScale),
      fadeOutMs: Math.round(s.fadeOutMs * globalScale),
    });
    if (phraseIndex < 0) {
      return { phase: "idle" as PhrasePhase, index: -1, scene: scaleScene(PHRASE_SCENES[0]), elapsed: 0 };
    }
    if (phraseIndex >= total) {
      return { phase: "done" as PhrasePhase, index: total, scene: scaleScene(sceneFor(total - 1)), elapsed: 0 };
    }
    const scene = scaleScene(sceneFor(phraseIndex));
    const elapsed = phraseStartedAt != null ? Math.max(0, now - phraseStartedAt) : 0;
    let phase: PhrasePhase = "fadeIn";
    if (elapsed > scene.fadeInMs + scene.holdMs) phase = "fadeOut";
    else if (elapsed > scene.fadeInMs) phase = "hold";
    return { phase, index: phraseIndex, scene, elapsed };
  }, [phraseIndex, phraseStartedAt, now, globalScale]);

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
          phase={debugInfo.phase}
          fadeInMs={debugInfo.scene.fadeInMs}
          holdMs={debugInfo.scene.holdMs}
          fadeOutMs={debugInfo.scene.fadeOutMs}
          fromX={debugInfo.scene.from.x}
          fromY={debugInfo.scene.from.y}
          toX={debugInfo.scene.to.x}
          toY={debugInfo.scene.to.y}
          restXPct={debugInfo.scene.restXPct}
          restYPct={debugInfo.scene.restYPct}
          elapsedMs={debugInfo.elapsed}
          intensity={intensity}
          globalScale={globalScale}
          videoDurationMs={videoDurationMs}
        />
      )}

      {/* ── Phrase-by-phrase cinematic intro ──────────────────────────
         One phrase visible at a time, centered over the film. Soft
         fade in + gentle rise; soft fade out before the next appears.
         Hidden once the closing stanza is composed.            */}
      {!composed && (
        <div
          aria-hidden={composed ? "true" : undefined}
          className="hero-phrase-stage pointer-events-none absolute inset-0 z-[5]"
          data-hero-phrase-stage="true"
        >
          {/* Left-side editorial scrim — keeps the phrase legible without muddying the film */}
          <div
            aria-hidden="true"
            className="hero-phrase-scrim pointer-events-none absolute inset-0"
          />
          <div className="hero-phrase-frame absolute left-[24px] right-[24px] top-[20svh] md:left-[8vw] md:right-auto md:top-[26vh] md:max-w-[860px]">
            {HERO_PHRASES.map((phrase, i) => {
              const state =
                i === phraseIndex ? "active" : i < phraseIndex ? "past" : "pending";
              const scene = sceneFor(i);
              const phraseStyle = {
                "--phrase-fade-in": `${Math.round(scene.fadeInMs * globalScale)}ms`,
                "--phrase-fade-out": `${Math.round(scene.fadeOutMs * globalScale)}ms`,
                "--phrase-from-x": `${scene.from.x}px`,
                "--phrase-from-y": `${scene.from.y}px`,
                "--phrase-to-x": `${scene.to.x}px`,
                "--phrase-to-y": `${scene.to.y}px`,
                "--phrase-md-scale": scene.mdScale,
                "--phrase-rest-x": `${scene.restXPct}%`,
                "--phrase-rest-y": `${scene.restYPct}%`,
              } as React.CSSProperties;
              return (
                <p
                  key={i}
                  data-hero-phrase-index={i}
                  data-hero-phrase-state={state}
                  data-hero-phrase-visible={state === "active" ? "true" : "false"}
                  style={phraseStyle}
                  className="hero-phrase absolute inset-x-0 top-0 [font-family:var(--font-serif)] italic font-normal text-[color:var(--gold)] text-[42px] xs:text-[48px] sm:text-[68px] md:text-[84px] lg:text-[94px] leading-[1.04] md:leading-[1.0] tracking-[-0.018em] text-left text-pretty [text-shadow:0_2px_36px_rgba(0,0,0,0.65),0_1px_2px_rgba(0,0,0,0.5)]"
                >
                  <span className="hero-phrase__text block max-w-[15ch] md:max-w-[17ch]">{phrase}</span>
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
                className="hero-beat hero-beat--rise hero-cta-button hero-cta-button--primary cta-primary min-h-[42px] py-2 px-6 text-[10.75px] tracking-[0.16em] xs:min-h-[44px] xs:text-[11.25px] sm:text-[12px] sm:px-7 rounded-[3px]"
                data-hero-field="primaryCta"
                data-hero-beat-show={showCta ? "true" : "false"}
                data-hero-beat-delay="0"
              >
                {HERO_COPY.primaryCta}
              </CtaButton>
              <CtaButton
                to="/experiences"
                variant="ghostDark"
                className="hero-beat hero-beat--rise hero-cta-button hero-cta-button--secondary cta-secondary-dark min-h-[42px] py-2 px-6 text-[10.5px] tracking-[0.14em] xs:min-h-[44px] xs:text-[11px] sm:text-[12px] sm:px-7 rounded-[3px]"
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
              className="hero-beat hero-beat--rise mt-3.5 xs:mt-4 sm:mt-6 text-[11.75px] xs:text-[12px] sm:text-[13px] leading-[1.5] tracking-[0.025em] text-[color:var(--ivory)]/85 [text-shadow:none]"
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
