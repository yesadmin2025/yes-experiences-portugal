import { useEffect, useState } from "react";

/**
 * Dev-only floating button to re-trigger reveal animations on the current
 * page. Calls `window.replayReveals()` (installed by SiteLayout). Only
 * mounts on preview / localhost hosts — never on the published site.
 */
export function ReplayRevealsButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname;
    const isPreview =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".lovableproject.com") ||
      host.includes("id-preview--") ||
      host.includes("-dev.lovable.app");
    setShow(isPreview);
  }, []);

  if (!show) return null;

  const handleClick = () => {
    const w = window as unknown as { replayReveals?: () => void };
    if (typeof w.replayReveals === "function") {
      w.replayReveals();
    } else {
      // eslint-disable-next-line no-console
      console.warn("[replay-reveals] replayReveals() not available yet");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Replay reveal animations"
      title="Replay reveal animations (dev only)"
      style={{
        position: "fixed",
        left: 8,
        bottom: 72,
        zIndex: 99998,
        padding: "8px 12px",
        minHeight: 36,
        background: "rgba(41,91,97,0.92)",
        color: "var(--ivory)",
        font: "600 11px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace",
        border: "1px solid rgba(201,169,106,0.55)",
        borderRadius: 6,
        boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
        cursor: "pointer",
        letterSpacing: "0.02em",
      }}
    >
      ↻ replay reveals
    </button>
  );
}
