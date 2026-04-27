import { useEffect, useState } from "react";
import { HERO_COPY_VERSION } from "@/content/hero-copy";

/**
 * Temporary mobile-first debug banner.
 *
 * Sits above the hero, shows the current build/copy version, and offers a
 * one-tap hard refresh that bypasses the Service Worker / HTTP cache. Users
 * can dismiss it for the session via the × button.
 *
 * Remove this component (and its <CacheDebugBanner /> mount in
 * `src/routes/index.tsx`) once the cache-staleness investigation is closed.
 */
export function CacheDebugBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  // Respect a per-session dismissal so the banner doesn't re-appear on every
  // client-side navigation back to /.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("yes-cache-debug-dismissed") === "1") {
      setDismissed(true);
    }
  }, []);

  if (dismissed) return null;

  const buildId =
    typeof document !== "undefined"
      ? (document.querySelector('meta[name="yes-hero-copy-version"]') as HTMLMetaElement | null)
          ?.content || HERO_COPY_VERSION
      : HERO_COPY_VERSION;

  async function hardRefresh() {
    if (typeof window === "undefined") return;
    setBusy(true);
    try {
      // 1. Unregister any service workers so the next fetch hits the network.
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      // 2. Wipe Cache Storage (covers PWA / Workbox-style caches).
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      // Non-fatal — proceed to a cache-busted reload regardless.
    }
    // 3. Force a network-fresh GET by appending a cache-busting query param.
    const url = new URL(window.location.href);
    url.searchParams.set("_cb", Date.now().toString(36));
    window.location.replace(url.toString());
  }

  function dismiss() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("yes-cache-debug-dismissed", "1");
    }
    setDismissed(true);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cache debug banner"
      className="fixed top-[80px] inset-x-0 z-[60] mx-3 md:mx-auto md:max-w-2xl rounded-md border border-[color:var(--gold)]/40 bg-[color:var(--charcoal-deep)]/95 backdrop-blur-md shadow-[0_12px_32px_-16px_rgba(0,0,0,0.55)] text-[color:var(--ivory)]"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <span
          aria-hidden="true"
          className="mt-0.5 inline-block w-2 h-2 rounded-full bg-[color:var(--gold)] shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--gold-soft)]">
            Build {buildId}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-[color:var(--ivory)]/90">
            Seeing old content? Tap{" "}
            <span className="font-semibold text-[color:var(--gold-soft)]">Hard refresh</span> to
            clear the cache and reload from the network.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={hardRefresh}
              disabled={busy}
              className="inline-flex items-center justify-center rounded-sm border border-[color:var(--gold)]/70 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] disabled:opacity-60 px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--ivory)] transition-colors"
            >
              {busy ? "Refreshing…" : "Hard refresh"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(buildId).catch(() => {});
                }
              }}
              className="inline-flex items-center justify-center rounded-sm border border-[color:var(--ivory)]/30 hover:border-[color:var(--gold)]/60 px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--ivory)]/85 transition-colors"
            >
              Copy build
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss cache debug banner"
          className="shrink-0 -mt-0.5 -mr-1 inline-flex items-center justify-center w-8 h-8 rounded-sm text-[color:var(--ivory)]/70 hover:text-[color:var(--ivory)] hover:bg-white/5 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}
