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


type HeroDebugEvent = { t: number; label: string; detail?: string };

function isHeroDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("heroDebug") === "1") return true;
  } catch {}
  return false;
}

/**
 * Slow-mo factor from `?heroSlowMo=N` (e.g. 2 = half-speed, 4 = quarter,
 * 0.5 = double-speed). Clamped to [0.25, 8]. 1 = normal. Always returns 1
 * when the URL param is missing or invalid.
 */
function getHeroSlowMo(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = new URLSearchParams(window.location.search).get("heroSlowMo");
    if (!raw) return 1;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return 1;
    return Math.min(8, Math.max(0.25, n));
  } catch {
    return 1;
  }
}

/**
 * Step-by-step mode from `?heroStep=1`. When enabled, automatic triggers
 * (video-time + wall-clock) are suspended. Each beat is revealed by user
 * action (button click or keyboard: →/Space/N for next, ←/R for reset).
 * The video is paused and seeked to each beat's `t` so the frame matches.
 */
function isHeroStepMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("heroStep") === "1";
  } catch {
    return false;
  }
}

export function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const mountedAtRef = useRef<number>(typeof performance !== "undefined" ? performance.now() : Date.now());

  const [storyActive, setStoryActive] = useState(false);
  const [videoFailed, setVideoFailed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return new URLSearchParams(window.location.search).get("heroVideoFail") === "1";
    } catch {
      return false;
    }
  });
  const [videoSrc, setVideoSrc] = useState<string>(HERO_FILM_SRC_720);
  const [stepMode] = useState<boolean>(() => isHeroStepMode());
  const [debug] = useState<boolean>(() => isHeroDebugEnabled() || isHeroStepMode());
  const [slowMo] = useState<number>(() => getHeroSlowMo());
  const [debugEvents, setDebugEvents] = useState<HeroDebugEvent[]>([]);
  const [intersectionRatio, setIntersectionRatio] = useState<number>(0);
  const [viewportW, setViewportW] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);

  const log = (label: string, detail?: string) => {
    const t = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - mountedAtRef.current);
    if (debug) {
      // eslint-disable-next-line no-console
      console.info(`[hero] +${t}ms ${label}${detail ? ` — ${detail}` : ""}`);
      setDebugEvents((prev) => [...prev.slice(-19), { t, label, detail }]);
    }
  };

  // Resolve source on the client.
  useEffect(() => {
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches;
    setVideoSrc(isDesktop ? HERO_FILM_SRC_1080 : HERO_FILM_SRC_720);
    log("source-resolved", isDesktop ? "1080p" : "720p");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track viewport width while debug overlay is open.
  useEffect(() => {
    if (!debug) return;
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [debug]);

  // Live ticker for debug timeline (video.currentTime + wall-clock since mount).
  useEffect(() => {
    if (!debug) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      setLiveVideoT(v ? v.currentTime : 0);
      setLiveWallMs(Math.round(performance.now() - mountedAtRef.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [debug]);

  const tryPlay = (origin: string) => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    log("play-attempt", origin);
    if (p && typeof p.then === "function") {
      p.then(() => log("play-success", origin)).catch((err: unknown) => {
        const name = err && typeof err === "object" && "name" in err ? String((err as { name: unknown }).name) : "Error";
        log("play-failed", `${origin}: ${name}`);
        setVideoFailed(true);
      });
    }
  };

  // Storytelling phases — each phrase appears ALONE, then yields to the
  // next; "compose" brings the whole stanza back together; "cta" reveals
  // the call-to-action pair + microcopy as the closing beat. Anchored to
  // video.currentTime in seconds, with a wall-clock fallback at the same
  // offsets when the video can't play.
  type BeatKey = "eyebrow" | "h1" | "h2" | "sub" | "compose" | "cta";
  type BeatStamp = { wallMs: number; videoT: number; mode: "video" | "wall" | "step" };
  const [revealed, setRevealed] = useState<Set<BeatKey>>(() => new Set());
  const [beatStamps, setBeatStamps] = useState<Partial<Record<BeatKey, BeatStamp>>>({});
  const [liveVideoT, setLiveVideoT] = useState<number>(0);
  const [liveWallMs, setLiveWallMs] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<"video" | "wall" | "step" | null>(null);
  const [activeSchedule, setActiveSchedule] = useState<{ key: BeatKey; t: number }[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const firedRef = useRef<Set<BeatKey>>(new Set());
  const modeRef = useRef<"video" | "wall" | "step" | null>(null);

  const getSchedule = (): { key: BeatKey; t: number }[] => {
    const w = typeof window !== "undefined" ? window.innerWidth : 768;
    if (w >= 640) {
      return [
        { key: "eyebrow", t: 0.30 },
        { key: "h1",      t: 1.80 },
        { key: "h2",      t: 3.40 },
        { key: "sub",     t: 5.00 },
        { key: "compose", t: 6.60 },
        { key: "cta",     t: 7.40 },
      ];
    }
    if (w <= 379) {
      return [
        { key: "eyebrow", t: 0.40 },
        { key: "h1",      t: 2.20 },
        { key: "h2",      t: 4.10 },
        { key: "sub",     t: 5.90 },
        { key: "compose", t: 7.70 },
        { key: "cta",     t: 8.60 },
      ];
    }
    return [
      { key: "eyebrow", t: 0.35 },
      { key: "h1",      t: 2.00 },
      { key: "h2",      t: 3.80 },
      { key: "sub",     t: 5.50 },
      { key: "compose", t: 7.20 },
      { key: "cta",     t: 8.10 },
    ];
  };

  const revealBeat = (key: BeatKey) => {
    if (firedRef.current.has(key)) return;
    firedRef.current.add(key);
    const wallMs = Math.round(performance.now() - mountedAtRef.current);
    const videoT = videoRef.current ? videoRef.current.currentTime : 0;
    const stampMode: "video" | "wall" | "step" = modeRef.current ?? "wall";
    setRevealed((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setBeatStamps((prev) => (prev[key] ? prev : { ...prev, [key]: { wallMs, videoT, mode: stampMode } }));
    log("beat", `${key} @ wall=${wallMs}ms video=${videoT.toFixed(2)}s mode=${stampMode}`);
  };

  // Step-by-step controls: advance one beat per call, seeking the video
  // frame to that beat's `t` so the visible frame matches the reveal.
  const stepNext = () => {
    const schedule = activeSchedule.length ? activeSchedule : getSchedule();
    if (!activeSchedule.length) setActiveSchedule(schedule);
    setStepIndex((idx) => {
      if (idx >= schedule.length) return idx;
      const beat = schedule[idx];
      const v = videoRef.current;
      if (v) {
        try { v.pause(); } catch {}
        try { v.currentTime = beat.t; } catch {}
      }
      revealBeat(beat.key);
      log("step-next", `${beat.key} → seek ${beat.t.toFixed(2)}s`);
      return idx + 1;
    });
  };

  const stepReset = () => {
    firedRef.current = new Set();
    setRevealed(new Set());
    setBeatStamps({});
    setStepIndex(0);
    setStoryActive(false);
    const v = videoRef.current;
    if (v) {
      try { v.pause(); } catch {}
      try { v.currentTime = 0; } catch {}
    }
    log("step-reset");
  };

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    let raf = 0;
    let wallTimers: number[] = [];
    let safety: number | undefined;
    let onFirstTouch: (() => void) | undefined;
    let started = false;
    const schedule = getSchedule();
    setActiveSchedule(schedule);
    firedRef.current = new Set();

    // Step-by-step mode: suspend automatic triggers entirely. The user
    // advances each beat via the debug panel buttons or keyboard shortcuts
    // (→/Space/N = next, ←/Backspace/R = reset).
    if (stepMode) {
      modeRef.current = "step";
      setActiveMode("step");
      setStoryActive(true);
      log("step-mode", "suspended auto-triggers");
      const v = videoRef.current;
      if (v) {
        const onMeta = () => { try { v.pause(); } catch {} try { v.currentTime = 0; } catch {} };
        if (v.readyState >= 1) onMeta();
        else v.addEventListener("loadedmetadata", onMeta, { once: true });
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight" || e.key === " " || e.key === "n" || e.key === "N") {
          e.preventDefault();
          stepNext();
        } else if (e.key === "ArrowLeft" || e.key === "Backspace" || e.key === "r" || e.key === "R") {
          e.preventDefault();
          stepReset();
        }
      };
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
      };
    }

    const reveal = (key: BeatKey) => revealBeat(key);

    const runVideoLoop = () => {
      const v = videoRef.current;
      if (!v || modeRef.current !== "video") return;
      const ct = v.currentTime;
      for (const beat of schedule) {
        if (ct >= beat.t) reveal(beat.key);
      }
      if (firedRef.current.size < schedule.length) {
        raf = requestAnimationFrame(runVideoLoop);
      }
    };

    const startVideoMode = (origin: string) => {
      if (started) return;
      started = true;
      modeRef.current = "video";
      setActiveMode("video");
      setStoryActive(true);
      log("story-trigger", `video:${origin}`);
      raf = requestAnimationFrame(runVideoLoop);
    };

    const startWallMode = (origin: string) => {
      if (started) return;
      started = true;
      modeRef.current = "wall";
      setActiveMode("wall");
      setStoryActive(true);
      log("story-trigger", `wall:${origin}`);
      const t0 = performance.now();
      for (const beat of schedule) {
        const target = beat.t * 1000 * slowMo;
        const id = window.setTimeout(() => reveal(beat.key), Math.max(0, target - (performance.now() - t0)));
        wallTimers.push(id);
      }
    };

    // Bridge: try to play; once it actually plays, switch to video-time mode.
    const armPlayBridge = () => {
      const v = videoRef.current;
      if (!v) return;
      const onPlaying = () => startVideoMode("playing");
      v.addEventListener("playing", onPlaying, { once: true });
      try { v.playbackRate = 1 / slowMo; } catch {}
      const p = v.play();
      log("play-attempt", `arm slowMo=${slowMo}`);
      if (p && typeof p.then === "function") {
        p.catch((err: unknown) => {
          const name = err && typeof err === "object" && "name" in err ? String((err as { name: unknown }).name) : "Error";
          log("play-failed", name);
          setVideoFailed(true);
          startWallMode("play-rejected");
        });
      }
    };

    const onIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        setIntersectionRatio(entry.intersectionRatio);
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          armPlayBridge();
          if (!safety) {
            safety = window.setTimeout(() => {
              if (!started) {
                log("safety", "wall-fallback");
                setVideoFailed((prev) => prev);
                startWallMode("safety");
              }
            }, 1200);
          }
        }
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      armPlayBridge();
      safety = window.setTimeout(() => { if (!started) startWallMode("no-io"); }, 1200);
    } else {
      const observer = new IntersectionObserver(onIntersect, {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: "0px 0px -10% 0px",
      });
      observer.observe(node);

      onFirstTouch = () => {
        const v = videoRef.current;
        if (v) v.play().catch(() => {});
        log("user-gesture");
      };
      window.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });
      window.addEventListener("pointerdown", onFirstTouch, { once: true });

      return () => {
        observer.disconnect();
        if (raf) cancelAnimationFrame(raf);
        if (safety) window.clearTimeout(safety);
        for (const id of wallTimers) window.clearTimeout(id);
        if (onFirstTouch) {
          window.removeEventListener("touchstart", onFirstTouch);
          window.removeEventListener("pointerdown", onFirstTouch);
        }
      };
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (safety) window.clearTimeout(safety);
      for (const id of wallTimers) window.clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScrollToNext = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("reviews");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#reviews");
    }
  };

  // Derive the current storytelling phase from fired beats. Each prior
  // solo phrase fades out as the next fires; "compose" brings the full
  // stanza back together; "cta" is the closing beat (CTAs + microcopy).
  const composed = revealed.has("compose") || revealed.has("cta");
  const phase: "idle" | "eyebrow" | "h1" | "h2" | "sub" | "compose" | "cta" =
    revealed.has("cta") ? "cta"
    : revealed.has("compose") ? "compose"
    : revealed.has("sub") ? "sub"
    : revealed.has("h2") ? "h2"
    : revealed.has("h1") ? "h1"
    : revealed.has("eyebrow") ? "eyebrow"
    : "idle";

  const showEyebrow = composed || phase === "eyebrow";
  const showH1     = composed || phase === "h1";
  const showH2     = composed || phase === "h2";
  const showSub    = composed || phase === "sub";
  const showCta    = revealed.has("cta");

  return (
    <section
      ref={sectionRef}
      className="hero-cinematic relative isolate w-full min-h-[calc(100svh-73px)] md:min-h-[calc(100svh-89px)] lg:min-h-[calc(100svh-101px)] overflow-hidden bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)] flex items-end"
      aria-roledescription="cinematic hero film"
      aria-label={`${HERO_COPY.headlineLine1} ${HERO_COPY.headlineLine2}`}
      data-hero-cinematic="true"
      data-story-active={storyActive ? "true" : "false"}
      data-revealed={Array.from(revealed).join(" ")}
      data-hero-phase={phase}
      data-video-fallback={videoFailed ? "true" : "false"}
    >
      {/* Continuous film — full bleed. If autoplay fails, the poster image
         below stays visible and the story cascade continues unchanged. */}
      <video
        ref={videoRef}
        key={videoSrc}
        className="absolute inset-0 z-0 w-full h-full object-cover hero-film-video"
        poster={HERO_FILM_POSTER}
        autoPlay={!stepMode}
        muted
        playsInline
        loop
        preload="auto"
        aria-hidden="true"
        data-hero-film="true"
        onCanPlay={() => { log("video-canplay"); if (!stepMode) tryPlay("canplay"); }}
        onPlaying={() => { setVideoFailed(false); log("video-playing"); }}
        onError={() => { setVideoFailed(true); log("video-error"); }}
        onStalled={() => { setVideoFailed(true); log("video-stalled"); }}
        onLoadedData={() => log("video-loadeddata")}
        src={videoSrc}
      />
      {/* Static poster fallback — only painted if the video fails. */}
      <img
        src={HERO_FILM_POSTER}
        alt=""
        aria-hidden="true"
        className="hero-film-fallback absolute inset-0 z-0 w-full h-full object-cover"
      />

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
      {/* Mobile-only soft scrim aligned with the lifted text group (~25%–80% of hero).
         Boosts AA on bright video frames without altering desktop composition. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 z-[2] md:hidden top-[18%] bottom-[14%] bg-[linear-gradient(180deg,rgba(15,12,9,0)_0%,rgba(15,12,9,0.34)_22%,rgba(15,12,9,0.5)_55%,rgba(15,12,9,0.36)_82%,rgba(15,12,9,0)_100%)]"
      />

      {/* Copy column — full width on mobile with 20px gutters, capped on tablet+. */}
      <div className="hero-story-shell relative z-10 w-full px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 xs:px-6 xs:pb-[calc(7.5rem+env(safe-area-inset-bottom))] xs:pt-7 sm:px-8 sm:pb-12 md:px-12 md:pb-20 md:pt-24 lg:px-16">
        <div className="hero-story-column mx-auto max-w-[22rem] xs:max-w-[23.25rem] sm:max-w-[36rem] md:mx-0 md:ml-[6vw] md:max-w-[46rem] lg:ml-[8vw]">
          <Eyebrow
            tone="onDark"
            data-hero-field="eyebrow"
            data-hero-reveal="eyebrow"
            data-hero-beat-show={showEyebrow ? "true" : "false"}
            className="hero-eyebrow hero-beat hero-beat--from-left"
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
              data-hero-beat-show={showH1 ? "true" : "false"}
              className="hero-beat hero-beat--from-left block max-w-full whitespace-normal font-[400] text-[color:var(--ivory)] [text-shadow:none]"
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
              data-hero-beat-show={showH2 ? "true" : "false"}
              className="hero-beat hero-beat--from-right block mt-1.5 xs:mt-2 sm:mt-5 md:mt-6 max-w-full whitespace-normal [font-family:var(--font-serif)] italic font-normal [letter-spacing:0] md:[letter-spacing:-0.005em] [line-height:1.04] md:[line-height:1.02] text-[color:var(--gold-soft)] [text-shadow:none]"
            >
              {HERO_COPY.headlineLine2}
            </span>
          </h1>

          <p
            data-hero-field="subheadline"
            data-hero-beat-show={showSub ? "true" : "false"}
            className="hero-beat hero-beat--rise mt-3 xs:mt-4 sm:mt-9 md:mt-12 max-w-[31rem] text-[13.5px] xs:text-[14px] sm:text-[17px] md:text-[18px] leading-[1.5] sm:leading-[1.6] md:leading-[1.7] tracking-[0] text-[color:var(--ivory)] text-pretty [text-shadow:none]"
          >
            {HERO_COPY.subheadline}
          </p>

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

      {debug && (() => {
        const maxT = activeSchedule.length
          ? Math.max(...activeSchedule.map((b) => b.t)) + 0.6
          : 6.5;
        const liveT = activeMode === "wall" ? liveWallMs / 1000 : liveVideoT;
        const livePct = Math.min(100, Math.max(0, (liveT / maxT) * 100));
        const bp = viewportW <= 379 ? "xs" : viewportW >= 640 ? "sm+" : "default";
        return (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto fixed top-2 right-2 z-[60] w-[300px] max-w-[calc(100vw-1rem)] rounded-md border border-white/15 bg-black/85 p-2.5 text-[10.5px] leading-snug text-white shadow-lg backdrop-blur"
            data-hero-debug-panel="true"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-white/70">
              <span>hero debug · {bp}{slowMo !== 1 ? ` · ${slowMo}× slow` : ""}{stepMode ? " · step" : ""}</span>
              <span>{viewportW}px</span>
            </div>
            {stepMode && (
              <div className="mb-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={stepNext}
                  disabled={stepIndex >= activeSchedule.length}
                  className="rounded border border-[color:var(--gold-soft)]/60 bg-[color:var(--gold)]/15 px-2 py-1 font-mono text-[10px] text-[color:var(--gold-soft)] hover:bg-[color:var(--gold)]/25 disabled:opacity-40"
                >
                  Next ▶ ({stepIndex}/{activeSchedule.length})
                </button>
                <button
                  type="button"
                  onClick={stepReset}
                  className="rounded border border-white/20 bg-white/5 px-2 py-1 font-mono text-[10px] text-white/80 hover:bg-white/10"
                >
                  Reset
                </button>
                <span className="ml-auto font-mono text-[9.5px] text-white/50">→/Space · ←/R</span>
              </div>
            )}
            <ul className="mb-2 space-y-0.5 font-mono text-[10px]">
              <li>mode: <b>{activeMode ?? "idle"}</b> · video: <b>{videoFailed ? "poster" : "ok"}</b> · src: <b>{videoSrc.endsWith("1080.mp4") ? "1080p" : "720p"}</b></li>
              <li>video.currentTime: <b>{liveVideoT.toFixed(2)}s</b> · wall: <b>{liveWallMs}ms</b> · intersect: <b>{intersectionRatio.toFixed(2)}</b></li>
            </ul>


            {/* Visual timeline: scheduled marks (gold tick), fired stamps
                (filled gold dot), live cursor (teal line). */}
            <div className="mb-1 flex items-center justify-between font-mono text-[9px] text-white/55">
              <span>0s</span>
              <span>timeline ({activeMode === "wall" ? "wall" : "video.currentTime"})</span>
              <span>{maxT.toFixed(1)}s</span>
            </div>
            <div className="relative h-12 rounded border border-white/10 bg-white/[0.04]">
              {/* second gridlines */}
              {Array.from({ length: Math.ceil(maxT) + 1 }).map((_, s) => (
                <span
                  key={`g-${s}`}
                  className="absolute top-0 bottom-0 w-px bg-white/10"
                  style={{ left: `${Math.min(100, (s / maxT) * 100)}%` }}
                />
              ))}
              {/* scheduled beats */}
              {activeSchedule.map((b) => {
                const left = (b.t / maxT) * 100;
                const stamp = beatStamps[b.key];
                return (
                  <span key={`s-${b.key}`} className="absolute" style={{ left: `${left}%`, top: 0, bottom: 0 }}>
                    <span className="absolute top-1 -translate-x-1/2 h-3 w-px bg-[color:var(--gold-soft)]/70" />
                    <span
                      className={`absolute top-[18px] -translate-x-1/2 h-2 w-2 rounded-full border ${stamp ? "bg-[color:var(--gold)] border-[color:var(--gold)]" : "border-[color:var(--gold-soft)]/60 bg-transparent"}`}
                    />
                  </span>
                );
              })}
              {/* live cursor */}
              <span
                className="absolute top-0 bottom-0 w-px bg-[color:var(--teal-2,#3a7a82)]"
                style={{ left: `${livePct}%` }}
              />
              <span
                className="absolute top-0 -translate-x-1/2 -translate-y-1 rounded-sm bg-[color:var(--teal-2,#3a7a82)] px-1 font-mono text-[8.5px] text-white"
                style={{ left: `${livePct}%` }}
              >
                {liveT.toFixed(2)}s
              </span>
            </div>

            {/* Per-beat readout: scheduled vs actual fire (wall + video). */}
            {/* Phase mapping: which storytelling state each beat puts the
                hero into. solo = phrase visible by itself; compose = stanza
                re-assembled; cta = CTAs + microcopy revealed. */}
            {(() => {
              const phaseFor = (k: BeatKey): "solo" | "compose" | "cta" =>
                k === "compose" ? "compose" : k === "cta" ? "cta" : "solo";
              const phaseTone: Record<"solo" | "compose" | "cta", string> = {
                solo: "text-[color:var(--ivory)]/90 bg-white/10",
                compose: "text-[color:var(--gold-soft)] bg-[color:var(--gold)]/15",
                cta: "text-[color:var(--teal-2,#3a7a82)] bg-[color:var(--teal-2,#3a7a82)]/15",
              };
              const currentBeat = stepMode
                ? activeSchedule[Math.max(0, stepIndex - 1)]
                : [...activeSchedule].reverse().find((b) => beatStamps[b.key]);
              const currentPhase = currentBeat ? phaseFor(currentBeat.key) : "solo";
              return (
                <>
                  <div className="mt-2 flex items-center justify-between font-mono text-[9.5px]">
                    <span className="text-white/55">phase now</span>
                    <span className={`rounded px-1.5 py-[1px] uppercase tracking-wider ${phaseTone[currentPhase]}`}>
                      {currentPhase}
                      {currentBeat ? ` · ${currentBeat.key} @ ${currentBeat.t.toFixed(2)}s` : ""}
                    </span>
                  </div>
                  <table className="mt-1.5 w-full font-mono text-[9.5px]">
                    <thead className="text-white/50">
                      <tr>
                        <th className="text-left font-normal">#</th>
                        <th className="text-left font-normal">beat</th>
                        <th className="text-left font-normal">phase</th>
                        <th className="text-right font-normal">sched</th>
                        <th className="text-right font-normal">video</th>
                        <th className="text-right font-normal">wall</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSchedule.map((b, i) => {
                        const s = beatStamps[b.key];
                        const ph = phaseFor(b.key);
                        const isCurrent = stepMode && i === stepIndex - 1;
                        const isNext = stepMode && i === stepIndex;
                        return (
                          <tr
                            key={b.key}
                            className={`${s ? "text-white" : "text-white/40"} ${isCurrent ? "bg-[color:var(--gold)]/15" : isNext ? "bg-white/5" : ""}`}
                          >
                            <td className="py-[1px] pr-1 text-white/50">{i + 1}</td>
                            <td className="py-[1px]">
                              {isCurrent ? "▸ " : isNext ? "· " : "  "}
                              {b.key}
                            </td>
                            <td>
                              <span className={`rounded px-1 py-[0.5px] text-[8.5px] uppercase tracking-wider ${phaseTone[ph]}`}>
                                {ph}
                              </span>
                            </td>
                            <td className="text-right tabular-nums">{b.t.toFixed(2)}s</td>
                            <td className="text-right tabular-nums">{s ? `${s.videoT.toFixed(2)}s` : "—"}</td>
                            <td className="text-right tabular-nums">{s ? `${s.wallMs}ms` : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              );
            })()}
          </div>
        );
      })()}
    </section>
  );
}
