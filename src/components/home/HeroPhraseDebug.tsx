import { useEffect, useState } from "react";

/**
 * HeroPhraseDebug — preview-only overlay showing the active corner,
 * current phase (fadeIn / hold / fadeOut / done), and the timings used
 * for the active phrase. Helps validate the cinematic intro timing on
 * mobile without instrumenting the page.
 *
 * Activate with any of:
 *   • URL flag `?debug-phrase` (or `?debug-phrase=1`)
 *   • Shift+P toggle (persisted in sessionStorage)
 */

const STORAGE_KEY = "hero-phrase-debug";

export function useHeroPhraseDebugToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromUrl = new URLSearchParams(window.location.search).has("debug-phrase");
    const fromStorage = window.sessionStorage.getItem(STORAGE_KEY) === "1";
    if (fromUrl || fromStorage) setEnabled(true);

    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.key.toLowerCase() !== "p") return;
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

export type PhrasePhase = "idle" | "fadeIn" | "hold" | "fadeOut" | "done";

export type HeroPhraseDebugProps = {
  phraseIndex: number;
  total: number;
  corner: string | null;
  phase: PhrasePhase;
  fadeInMs: number;
  holdMs: number;
  fadeOutMs: number;
  driftX: number;
  driftY: number;
  elapsedMs: number;
};

const phaseColors: Record<PhrasePhase, string> = {
  idle: "#888",
  fadeIn: "#7BD389",
  hold: "var(--gold)",
  fadeOut: "#E58A6B",
  done: "#7AA7C7",
};

export function HeroPhraseDebug({
  phraseIndex,
  total,
  corner,
  phase,
  fadeInMs,
  holdMs,
  fadeOutMs,
  driftX,
  driftY,
  elapsedMs,
}: HeroPhraseDebugProps) {
  const beat = fadeInMs + holdMs + fadeOutMs;
  const cornerLabel: Record<string, string> = {
    tl: "Top-left  ↖",
    tr: "Top-right ↗",
    br: "Bot-right ↘",
    bl: "Bot-left  ↙",
  };

  return (
    <div
      data-hero-phrase-debug="true"
      style={{
        position: "absolute",
        top: 8,
        left: 8,
        zIndex: 50,
        pointerEvents: "none",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 10.5,
        lineHeight: 1.45,
        color: "var(--ivory)",
        background: "rgba(20,20,22,0.78)",
        border: "1px solid rgba(201,169,106,0.45)",
        borderRadius: 6,
        padding: "6px 8px",
        minWidth: 178,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div style={{ fontWeight: 700, letterSpacing: "0.06em", color: "var(--gold)" }}>
        HERO · PHRASE DEBUG
      </div>
      <div>
        phrase: <strong>{phraseIndex < 0 ? "—" : `${Math.min(phraseIndex, total - 1) + 1}/${total}`}</strong>
        {phraseIndex >= total ? "  (done)" : ""}
      </div>
      <div>corner: <strong>{corner ? cornerLabel[corner] ?? corner : "—"}</strong></div>
      <div>
        phase:{" "}
        <strong style={{ color: phaseColors[phase] }}>
          {phase}
        </strong>{" "}
        <span style={{ opacity: 0.7 }}>
          {elapsedMs.toFixed(0)}/{beat}ms
        </span>
      </div>
      <div style={{ opacity: 0.85 }}>
        in {fadeInMs} · hold {holdMs} · out {fadeOutMs}
      </div>
      <div style={{ opacity: 0.85 }}>
        drift x:{driftX} y:{driftY}
      </div>
      {/* phase progress bar */}
      <div
        style={{
          marginTop: 4,
          height: 4,
          width: "100%",
          background: "rgba(255,255,255,0.12)",
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
        }}
      >
        <div
          style={{
            width: `${(fadeInMs / beat) * 100}%`,
            background: phase === "fadeIn" ? phaseColors.fadeIn : "rgba(123,211,137,0.35)",
          }}
        />
        <div
          style={{
            width: `${(holdMs / beat) * 100}%`,
            background: phase === "hold" ? phaseColors.hold : "rgba(201,169,106,0.35)",
          }}
        />
        <div
          style={{
            width: `${(fadeOutMs / beat) * 100}%`,
            background: phase === "fadeOut" ? phaseColors.fadeOut : "rgba(229,138,107,0.35)",
          }}
        />
      </div>
      <div style={{ marginTop: 3, opacity: 0.6, fontSize: 9.5 }}>
        Shift+P to toggle · ?debug-phrase
      </div>
    </div>
  );
}
