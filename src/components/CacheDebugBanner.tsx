import { useEffect, useState } from "react";
import { HERO_COPY_VERSION } from "@/content/hero-copy";

/**
 * Temporary mobile-first debug banner.
 *
 * Sits above the hero, shows the current build/copy version, and offers a
 * one-tap hard refresh that bypasses the Service Worker / HTTP cache. Each
 * Hard refresh tap is recorded to localStorage (timestamp + build id) so
 * the user can see what they have already tried across reloads. Users can
 * dismiss the banner for the session via the × button.
 *
 * Remove this component (and its <CacheDebugBanner /> mount in
 * `src/routes/index.tsx`) once the cache-staleness investigation is closed.
 */

const HISTORY_KEY = "yes-cache-debug-history";
const HISTORY_MAX = 20;

type RefreshEntry = {
  /** ISO timestamp of the tap. */
  ts: string;
  /** Build / hero-copy version that was active when the tap fired. */
  build: string;
};

function readHistory(): RefreshEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is RefreshEntry =>
        !!e && typeof e === "object" && typeof e.ts === "string" && typeof e.build === "string",
    );
  } catch {
    return [];
  }
}

function appendHistory(entry: RefreshEntry) {
  if (typeof window === "undefined") return;
  try {
    const next = [entry, ...readHistory()].slice(0, HISTORY_MAX);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode, quota) — ignore so the
    // refresh itself still proceeds.
  }
}

function clearHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  // Locale-aware short time + day, e.g. "27 Apr, 16:42:08".
  const date = d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${date}, ${time}`;
}

export function CacheDebugBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<RefreshEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Respect a per-session dismissal so the banner doesn't re-appear on every
  // client-side navigation back to /. Also hydrate the refresh history.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("yes-cache-debug-dismissed") === "1") {
      setDismissed(true);
    }
    setHistory(readHistory());
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

    // Record the tap BEFORE we navigate, so the entry survives the reload
    // even if cache/SW cleanup throws partway through.
    appendHistory({ ts: new Date().toISOString(), build: buildId });

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

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  const lastEntry = history[0];

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
          {lastEntry && (
            <p className="mt-1.5 text-[11px] text-[color:var(--ivory)]/65">
              Last refresh: {formatTimestamp(lastEntry.ts)} · build{" "}
              <span className="text-[color:var(--gold-soft)]">{lastEntry.build}</span>
              {history.length > 1 && (
                <span className="text-[color:var(--ivory)]/45"> · {history.length} total</span>
              )}
            </p>
          )}
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
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              aria-expanded={showHistory}
              aria-controls="cache-debug-history"
              className="inline-flex items-center justify-center rounded-sm border border-[color:var(--ivory)]/30 hover:border-[color:var(--gold)]/60 px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--ivory)]/85 transition-colors"
            >
              {showHistory ? "Hide history" : `History (${history.length})`}
            </button>
          </div>
          {showHistory && (
            <div
              id="cache-debug-history"
              className="mt-3 rounded-sm border border-[color:var(--ivory)]/15 bg-black/30 p-2.5"
            >
              {history.length === 0 ? (
                <p className="text-[11.5px] text-[color:var(--ivory)]/60">
                  No hard refreshes recorded yet.
                </p>
              ) : (
                <>
                  <ol className="m-0 p-0 list-none max-h-44 overflow-auto text-[11.5px] font-mono text-[color:var(--ivory)]/85 space-y-1">
                    {history.map((entry, i) => (
                      <li
                        key={`${entry.ts}-${i}`}
                        className="flex items-baseline justify-between gap-3 border-b border-[color:var(--ivory)]/10 last:border-b-0 pb-1 last:pb-0"
                      >
                        <span className="tabular-nums text-[color:var(--ivory)]/70">
                          {formatTimestamp(entry.ts)}
                        </span>
                        <span className="text-[color:var(--gold-soft)]">{entry.build}</span>
                      </li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="mt-2 inline-flex items-center justify-center rounded-sm border border-[color:var(--ivory)]/20 hover:border-red-400/60 px-2.5 py-1 text-[10.5px] uppercase tracking-[0.2em] text-[color:var(--ivory)]/70 hover:text-red-300 transition-colors"
                  >
                    Clear history
                  </button>
                </>
              )}
            </div>
          )}
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
