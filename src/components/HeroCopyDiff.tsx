import { useCallback, useEffect, useState } from "react";
import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";

/**
 * Hidden hero-copy diff helper.
 *
 * On mount, compares the current `HERO_COPY` JSON against a baseline
 * stored in `localStorage` under `hero-copy:baseline`. If anything
 * changed, it logs a tidy table of `{ field, before, after }` rows to
 * the console — perfect for spotting accidental copy drift in preview.
 *
 * Manual controls (exposed on `window.__heroCopy`):
 *   __heroCopy.diff()        // re-run the diff and return the rows
 *   __heroCopy.snapshot()    // current { version, copy } object
 *   __heroCopy.baseline()    // stored baseline (or null)
 *   __heroCopy.setBaseline() // overwrite the baseline with current copy
 *   __heroCopy.clear()       // remove the baseline entirely
 *
 * Renders nothing visible. Skips gracefully on the server.
 */

const STORAGE_KEY = "hero-copy:baseline";

type Snapshot = {
  version: string;
  copy: Record<string, string>;
};

type DiffRow = {
  field: string;
  before: string | undefined;
  after: string | undefined;
  change: "added" | "removed" | "changed";
};

function currentSnapshot(): Snapshot {
  return {
    version: HERO_COPY_VERSION,
    copy: { ...HERO_COPY },
  };
}

function readBaseline(): Snapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.version === "string" &&
      parsed.copy &&
      typeof parsed.copy === "object"
    ) {
      return parsed as Snapshot;
    }
    return null;
  } catch {
    return null;
  }
}

function writeBaseline(snapshot: Snapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* quota / privacy mode — ignore */
  }
}

function diffSnapshots(before: Snapshot, after: Snapshot): DiffRow[] {
  const rows: DiffRow[] = [];
  const keys = new Set<string>([
    ...Object.keys(before.copy),
    ...Object.keys(after.copy),
  ]);
  for (const field of keys) {
    const b = before.copy[field];
    const a = after.copy[field];
    if (b === a) continue;
    let change: DiffRow["change"];
    if (b === undefined) change = "added";
    else if (a === undefined) change = "removed";
    else change = "changed";
    rows.push({ field, before: b, after: a, change });
  }
  return rows.sort((x, y) => x.field.localeCompare(y.field));
}

function runDiff(): DiffRow[] {
  const after = currentSnapshot();
  const before = readBaseline();

  if (!before) {
    writeBaseline(after);
    console.info(
      "%c[hero-copy] baseline stored (first run)",
      "color:#9ca3af",
      `version=${after.version}`,
    );
    return [];
  }

  if (before.version === after.version) {
    console.debug(
      "%c[hero-copy] no changes",
      "color:#9ca3af",
      `version=${after.version}`,
    );
    return [];
  }

  const rows = diffSnapshots(before, after);
  console.groupCollapsed(
    `%c[hero-copy] ${rows.length} field${rows.length === 1 ? "" : "s"} changed`,
    "color:#f59e0b;font-weight:bold",
    `${before.version} → ${after.version}`,
  );
  // Use console.table so before/after are easy to scan and copy.
  console.table(rows);
  console.info(
    "Call __heroCopy.setBaseline() to accept these changes as the new baseline.",
  );
  console.groupEnd();

  return rows;
}

declare global {
  interface Window {
    __heroCopy?: {
      diff: () => DiffRow[];
      snapshot: () => Snapshot;
      baseline: () => Snapshot | null;
      setBaseline: () => Snapshot;
      clear: () => void;
    };
  }
}

type DiffState = {
  baselineVersion: string | null;
  currentVersion: string;
  rows: DiffRow[];
  status: "no-baseline" | "no-changes" | "changed";
  ranAt: string;
};

function buildDiffState(): DiffState {
  const after = currentSnapshot();
  const before = readBaseline();
  const ranAt = new Date().toISOString();

  if (!before) {
    return {
      baselineVersion: null,
      currentVersion: after.version,
      rows: [],
      status: "no-baseline",
      ranAt,
    };
  }
  if (before.version === after.version) {
    return {
      baselineVersion: before.version,
      currentVersion: after.version,
      rows: [],
      status: "no-changes",
      ranAt,
    };
  }
  return {
    baselineVersion: before.version,
    currentVersion: after.version,
    rows: diffSnapshots(before, after),
    status: "changed",
    ranAt,
  };
}

const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

/**
 * Should the hidden control panel be shown? It is invisible by default;
 * reveal it with EITHER:
 *   • `?hero-debug` (or `?hero-debug=1`) on the URL, OR
 *   • `Shift + H + R` pressed together (toggles)
 *
 * The "shown" preference is remembered in sessionStorage so it survives
 * client-side navigation within the tab. Never on by default.
 */
const PANEL_VISIBILITY_KEY = "hero-copy:panel-visible";

function readInitialPanelVisibility(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("hero-debug")) return true;
    return sessionStorage.getItem(PANEL_VISIBILITY_KEY) === "1";
  } catch {
    return false;
  }
}

function persistPanelVisibility(next: boolean) {
  try {
    if (next) sessionStorage.setItem(PANEL_VISIBILITY_KEY, "1");
    else sessionStorage.removeItem(PANEL_VISIBILITY_KEY);
  } catch {
    /* ignore */
  }
}

export function HeroCopyDiff() {
  const [state, setState] = useState<DiffState | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);

  const refresh = useCallback(() => {
    const next = buildDiffState();
    setState(next);
    return next;
  }, []);

  const resetBaseline = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    console.info(
      "%c[hero-copy] baseline cleared via UI",
      "color:#9ca3af",
    );
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setPanelVisible(readInitialPanelVisibility());

    window.__heroCopy = {
      diff: () => {
        const next = refresh();
        runDiff();
        return next.rows;
      },
      snapshot: currentSnapshot,
      baseline: readBaseline,
      setBaseline: () => {
        const snap = currentSnapshot();
        writeBaseline(snap);
        console.info(
          "%c[hero-copy] baseline updated",
          "color:#10b981",
          `version=${snap.version}`,
        );
        refresh();
        return snap;
      },
      clear: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        console.info("%c[hero-copy] baseline cleared", "color:#9ca3af");
        refresh();
      },
    };

    runDiff();
    refresh();

    // Shift+H+R toggles the panel. Three keys at once = no accidental triggers.
    const pressed = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      pressed.add(e.key.toLowerCase());
      if (
        (e.shiftKey || pressed.has("shift")) &&
        pressed.has("h") &&
        pressed.has("r")
      ) {
        setPanelVisible((v) => {
          const next = !v;
          persistPanelVisibility(next);
          return next;
        });
        pressed.clear();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      pressed.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [refresh]);

  // ---- Temporary outline on changed UI elements --------------------------
  // When the diff reports changes, find every rendered hero element tagged
  // with `data-hero-field="<field>"` (space-separated lists supported, e.g.
  // the <h1> tagged "headlineLine1 headlineLine2") and apply a temporary
  // highlight class. Auto-removed after 6s, or earlier if the diff is
  // re-run with no changes. Pure presentation, zero impact on layout.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!state || state.rows.length === 0) return;

    const STYLE_ID = "hero-copy-diff-highlight-style";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        [data-hero-diff-highlight] {
          outline: 2px dashed #f59e0b !important;
          outline-offset: 4px !important;
          border-radius: 4px;
          transition: outline-color 0.2s ease;
          animation: hero-diff-pulse 1.4s ease-in-out infinite;
        }
        [data-hero-diff-highlight="added"]   { outline-color: #10b981 !important; }
        [data-hero-diff-highlight="removed"] { outline-color: #ef4444 !important; }
        [data-hero-diff-highlight="changed"] { outline-color: #f59e0b !important; }
        @keyframes hero-diff-pulse {
          0%, 100% { outline-offset: 4px; }
          50%      { outline-offset: 7px; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-hero-diff-highlight] { animation: none !important; }
        }
      `;
      document.head.appendChild(style);
    }

    const changedByField = new Map<string, DiffRow["change"]>();
    for (const row of state.rows) changedByField.set(row.field, row.change);

    const tagged = document.querySelectorAll<HTMLElement>("[data-hero-field]");
    const touched: HTMLElement[] = [];
    tagged.forEach((el) => {
      const fields = (el.dataset.heroField ?? "").split(/\s+/).filter(Boolean);
      // Pick the "strongest" change for elements that map to multiple fields:
      // changed > added > removed (any of them is enough to highlight).
      let hit: DiffRow["change"] | undefined;
      for (const f of fields) {
        const c = changedByField.get(f);
        if (c) {
          if (c === "changed" || !hit) hit = c;
        }
      }
      if (hit) {
        el.setAttribute("data-hero-diff-highlight", hit);
        touched.push(el);
      }
    });

    if (touched.length === 0) return;

    console.info(
      "%c[hero-copy] outlining changed UI elements",
      "color:#f59e0b",
      touched.map((el) => el.dataset.heroField),
    );

    const timer = window.setTimeout(() => {
      touched.forEach((el) => el.removeAttribute("data-hero-diff-highlight"));
    }, 6000);

    return () => {
      window.clearTimeout(timer);
      touched.forEach((el) => el.removeAttribute("data-hero-diff-highlight"));
    };
  }, [state]);

  if (!state) return null;

  const changedFields = state.rows.map((r) => r.field).join(",");

  // ---- Per-field flags ---------------------------------------------------
  // Two layers, both rendered on the container so DevTools "find by
  // attribute" can pinpoint a single field without walking children:
  //
  //   1. data-changed-<field>="added|removed|changed"  (one per HERO_COPY key)
  //      e.g. data-changed-headline-line1="changed"
  //   2. data-changed-<category>="<comma-list of fields>"
  //      Categories group semantically related fields:
  //        title       → eyebrow, headlineLine1, headlineLine2
  //        description → subheadline, microcopy, brandLine
  //        cta         → primaryCta, secondaryCta
  //
  // Unchanged fields/categories simply omit the attribute so a CSS
  // selector like `[data-hero-copy-diff][data-changed-primary-cta]`
  // matches only when that exact thing changed.
  const FIELD_CATEGORIES: Record<string, "title" | "description" | "cta"> = {
    eyebrow: "title",
    headlineLine1: "title",
    headlineLine2: "title",
    subheadline: "description",
    microcopy: "description",
    brandLine: "description",
    primaryCta: "cta",
    secondaryCta: "cta",
  };

  const fieldFlags: Record<string, string> = {};
  const categoryHits: Record<"title" | "description" | "cta", string[]> = {
    title: [],
    description: [],
    cta: [],
  };

  // camelCase → kebab-case for clean data-* attribute names.
  const toKebab = (s: string) =>
    s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

  for (const row of state.rows) {
    fieldFlags[`data-changed-${toKebab(row.field)}`] = row.change;
    const category = FIELD_CATEGORIES[row.field];
    if (category) categoryHits[category].push(row.field);
  }

  const categoryFlags: Record<string, string> = {};
  (Object.keys(categoryHits) as Array<keyof typeof categoryHits>).forEach(
    (cat) => {
      if (categoryHits[cat].length > 0) {
        categoryFlags[`data-changed-${cat}`] = categoryHits[cat].join(",");
      }
    },
  );

  return (
    <>
      <div
        data-hero-copy-diff=""
        data-testid="hero-copy-diff"
        data-diff-status={state.status}
        data-diff-baseline-version={state.baselineVersion ?? ""}
        data-diff-current-version={state.currentVersion}
        data-diff-changed-count={String(state.rows.length)}
        data-diff-changed-fields={changedFields}
        data-diff-changed-categories={Object.keys(categoryFlags)
          .map((k) => k.replace(/^data-changed-/, ""))
          .join(",")}
        data-diff-ran-at={state.ranAt}
        data-diff-json={JSON.stringify(state)}
        {...fieldFlags}
        {...categoryFlags}
        aria-hidden="true"
        style={SR_ONLY}
      >
        <span data-diff-summary>
          [hero-copy diff] status={state.status} changed={state.rows.length}{" "}
          {state.baselineVersion ?? "—"} → {state.currentVersion}
        </span>
        {state.rows.map((row) => (
          <span
            key={row.field}
            data-diff-row={row.field}
            data-diff-field={toKebab(row.field)}
            data-diff-category={FIELD_CATEGORIES[row.field] ?? "other"}
            data-diff-change={row.change}
            data-diff-before={row.before ?? ""}
            data-diff-after={row.after ?? ""}
          >
            {" | "}
            {row.field} ({row.change}): {JSON.stringify(row.before)} →{" "}
            {JSON.stringify(row.after)}
          </span>
        ))}
      </div>

      {/* Hidden control panel.
          Invisible by default. Reveal with `?hero-debug` in the URL or
          Shift+H+R. Use it to clear the baseline (and rerun the diff)
          without opening DevTools. */}
      {panelVisible ? (
        <div
          data-hero-copy-panel=""
          role="region"
          aria-label="Hero copy debug panel"
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 2147483647,
            background: "rgba(15,15,15,0.92)",
            color: "#fafafa",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 8,
            padding: "10px 12px",
            font: "12px/1.4 ui-sans-serif, system-ui, -apple-system, sans-serif",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            minWidth: 220,
            maxWidth: 320,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
              gap: 8,
            }}
          >
            <strong style={{ letterSpacing: "0.04em" }}>hero-copy debug</strong>
            <button
              type="button"
              onClick={() => {
                setPanelVisible(false);
                persistPanelVisibility(false);
              }}
              aria-label="Hide debug panel"
              style={{
                background: "transparent",
                color: "#fafafa",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 4,
                padding: "1px 6px",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ opacity: 0.75, marginBottom: 8 }}>
            status: <code>{state.status}</code>
            <br />
            baseline: <code>{state.baselineVersion ?? "—"}</code>
            <br />
            current: <code>{state.currentVersion}</code>
            <br />
            changed: <code>{state.rows.length}</code>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={resetBaseline}
              data-action="reset-baseline"
              style={{
                background: "#dc2626",
                color: "#fff",
                border: 0,
                borderRadius: 4,
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Reset baseline
            </button>
            <button
              type="button"
              onClick={() => {
                refresh();
                runDiff();
              }}
              data-action="rerun-diff"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 4,
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              Re-run diff
            </button>
            <button
              type="button"
              onClick={() => {
                const snap = currentSnapshot();
                writeBaseline(snap);
                refresh();
              }}
              data-action="accept-current"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 4,
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              Accept as baseline
            </button>
          </div>
          <div style={{ marginTop: 8, opacity: 0.55, fontSize: 10 }}>
            Toggle: Shift+H+R · or ?hero-debug
          </div>
        </div>
      ) : null}
    </>
  );
}
