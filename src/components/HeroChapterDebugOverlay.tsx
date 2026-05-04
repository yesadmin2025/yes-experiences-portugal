import { useEffect, useState } from "react";
import { HERO_SCENES } from "@/content/hero-scenes-manifest";

const STORAGE_KEY = "yes:hero-chapter-debug";

/**
 * useHeroChapterDebugToggle — hidden QA toggle.
 *   - URL: `?heroDebug` (or `&heroDebug`) enables for the session
 *   - Keyboard: Shift+H toggles + persists in sessionStorage
 *
 * SSR-safe: starts false, hydrates after mount.
 */
export function useHeroChapterDebugToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromUrl = new URLSearchParams(window.location.search).has("heroDebug");
    const fromStorage = window.sessionStorage.getItem(STORAGE_KEY) === "1";
    if (fromUrl || fromStorage) setEnabled(true);

    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.key.toLowerCase() !== "h") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
      setEnabled((prev) => {
        const next = !prev;
        try {
          window.sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0");
        } catch {
          /* ignore */
        }
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return enabled;
}

type Snap = {
  chapterId: string;
  chapterIndex: number;
  startTime: number;
  endTime: number;
  currentTime: number;
  effectiveTime: number;
  playbackRate: number;
  remainingInChapter: number;
  prevOpacity: number | null;
  currentOpacity: number;
  fadeElapsedMs: number | null;
  fadeTotalMs: number;
};

const HERO_OVERLAP_MS = 1450;

/**
 * HeroChapterDebugOverlay — fixed-corner readout that proves the
 * credits/copy never advance faster than authored. Polls the live
 * `<video>` via rAF.
 *
 * `effectiveTime` = `currentTime / playbackRate` — wall-clock seconds
 * the viewer has actually spent inside the chapter. This is the
 * number to watch when QAing pacing across viewports.
 */
export function HeroChapterDebugOverlay() {
  const [snap, setSnap] = useState<Snap | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    let mounted = true;

    const tick = () => {
      if (!mounted) return;
      const video = document.querySelector<HTMLVideoElement>(
        ".hero-story-stage video[data-hero-film='true']",
      );
      if (video) {
        const t = video.currentTime;
        let idx = -1;
        for (let i = 0; i < HERO_SCENES.length; i += 1) {
          const s = HERO_SCENES[i];
          if (t >= s.startTime && t <= s.endTime) {
            idx = i;
            break;
          }
        }
        if (idx === -1) idx = HERO_SCENES.length - 1;
        const c = HERO_SCENES[idx];
        const rate = video.playbackRate || 1;

        // Live read of the rendered overlay opacities — proves the
        // dissolve curve and timing on real frames.
        const prevEl = document.querySelector<HTMLElement>(
          '[data-hero-overlay="prev"]',
        );
        const currentEl = document.querySelector<HTMLElement>(
          '[data-hero-overlay="current"]',
        );
        const prevOpacity = prevEl
          ? parseFloat(getComputedStyle(prevEl).opacity || "1")
          : null;
        const currentOpacity = currentEl
          ? parseFloat(getComputedStyle(currentEl).opacity || "1")
          : 1;
        // While prev is mounted we're inside the cross-fade window.
        // Approximate elapsed via 1 - currentOpacity^(1/curve) is
        // unreliable; expose the raw opacities + total instead.
        const fadeElapsedMs = prevEl && prevOpacity !== null
          ? Math.round((1 - prevOpacity) * HERO_OVERLAP_MS)
          : null;

        setSnap({
          chapterId: c.id,
          chapterIndex: idx,
          startTime: c.startTime,
          endTime: c.endTime,
          currentTime: t,
          effectiveTime: (t - c.startTime) / rate,
          playbackRate: rate,
          remainingInChapter: (c.endTime - t) / rate,
          prevOpacity,
          currentOpacity,
          fadeElapsedMs,
          fadeTotalMs: HERO_OVERLAP_MS,
        });
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!snap) return null;

  const chapterDuration = snap.endTime - snap.startTime;
  const effectiveDuration = chapterDuration / snap.playbackRate;
  const progressPct = Math.min(
    100,
    Math.max(0, ((snap.currentTime - snap.startTime) / chapterDuration) * 100),
  );

  return (
    <div
      className="fixed bottom-4 left-4 z-[9999] pointer-events-none select-none font-mono text-[11px] leading-tight text-white"
      role="status"
      aria-label="Hero chapter debug overlay"
    >
      <div className="rounded-md bg-black/85 backdrop-blur-md px-3 py-2.5 shadow-2xl ring-1 ring-white/10 min-w-[260px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 uppercase tracking-[0.18em] text-[9.5px]">
            hero-chapter
          </span>
          <span className="text-white/40 text-[9.5px]">Shift+H</span>
        </div>

        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-[15px] font-medium text-[color:var(--gold-soft)]">
            #{snap.chapterIndex + 1} {snap.chapterId}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mb-2 text-[10px] tabular-nums text-white/80">
          <span className="text-white/50">start</span>
          <span className="text-right">{snap.startTime.toFixed(3)}s</span>
          <span className="text-white/50">end</span>
          <span className="text-right">{snap.endTime.toFixed(3)}s</span>
          <span className="text-white/50">currentTime</span>
          <span className="text-right">{snap.currentTime.toFixed(3)}s</span>
          <span className="text-white/50">effective in-chapter</span>
          <span className="text-right">{snap.effectiveTime.toFixed(2)}s</span>
          <span className="text-white/50">remaining</span>
          <span className="text-right">{snap.remainingInChapter.toFixed(2)}s</span>
          <span className="text-white/50">playbackRate</span>
          <span className="text-right">{snap.playbackRate.toFixed(2)}×</span>
          <span className="text-white/50">chapter duration</span>
          <span className="text-right">
            {chapterDuration.toFixed(2)}s · eff {effectiveDuration.toFixed(2)}s
          </span>
        </div>

        <div className="relative h-1.5 rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[color:var(--gold)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
