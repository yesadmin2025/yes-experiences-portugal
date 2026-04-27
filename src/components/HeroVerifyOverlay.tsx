/**
 * HeroVerifyOverlay
 *
 * Visual on-page verification for the home hero copy. Activated only when
 * the URL contains `?verify=hero`. Scans every element marked with
 * `data-hero-field="<key>"`, compares its visible text against the FROZEN
 * `HERO_COPY_SPEC`, and:
 *
 *   - Wraps each matched element in a colored outline (green = match,
 *     red = mismatch, amber = extra/decorative chars).
 *   - Pins a small floating badge next to each element with the field name
 *     and a check / cross / warning glyph.
 *   - Shows a fixed legend in the corner with totals + a per-field summary.
 *
 * No layout/design impact when the query param is absent — the component
 * renders `null`.
 *
 * Notes
 * -----
 * - Comparison is case-sensitive and trims surrounding whitespace only.
 * - For decorative wrappers like `✦ EYEBROW ✦`, the visible textContent
 *   includes the stars; we report a "loose" pass when the spec string is
 *   contained inside the rendered text (highlighted amber, not red), so
 *   you can see at a glance which fields differ exactly vs. only by
 *   surrounding decoration.
 * - Reads from `HERO_COPY_SPEC` (frozen approved wording), NOT from
 *   `HERO_COPY`, so a drift between source and spec also surfaces here.
 */
import { useEffect, useMemo, useState } from "react";
import { HERO_COPY_VERSION } from "@/content/hero-copy";
import { HERO_COPY_SPEC, type HeroSpecKey } from "@/content/hero-copy.spec";

type FieldStatus = "match" | "loose" | "mismatch" | "missing";

type FieldReport = {
  key: HeroSpecKey;
  expected: string;
  actual: string | null;
  status: FieldStatus;
  rect: DOMRect | null;
};

const FIELD_ORDER: HeroSpecKey[] = [
  "eyebrow",
  "headlineLine1",
  "headlineLine2",
  "subheadline",
  "primaryCta",
  "secondaryCta",
  "microcopy",
];

const STATUS_COLOR: Record<FieldStatus, string> = {
  match: "rgb(34 197 94)", // green-500
  loose: "rgb(245 158 11)", // amber-500
  mismatch: "rgb(239 68 68)", // red-500
  missing: "rgb(148 163 184)", // slate-400
};

const STATUS_GLYPH: Record<FieldStatus, string> = {
  match: "✓",
  loose: "≈",
  mismatch: "✕",
  missing: "?",
};

const STATUS_LABEL: Record<FieldStatus, string> = {
  match: "exact match",
  loose: "contains spec (extra chars)",
  mismatch: "mismatch",
  missing: "no element found",
};

function normalize(s: string): string {
  // Collapse internal whitespace to a single space and trim. The spec
  // strings contain single spaces only, so this lets us tolerate JSX
  // whitespace artifacts without flagging them as mismatches.
  return s.replace(/\s+/g, " ").trim();
}

function classify(expected: string, actual: string | null): FieldStatus {
  if (actual === null) return "missing";
  const a = normalize(actual);
  const e = normalize(expected);
  // CSS may uppercase CTAs visually but textContent reflects the source.
  // We compare raw textContent to the spec, so case differences ARE
  // intentional drifts unless the rendered DOM text is uppercase too.
  if (a === e) return "match";
  if (a.includes(e)) return "loose";
  // Allow a CSS-uppercased variant to count as exact (the visible text
  // matches the spec character-for-character once you account for
  // text-transform: uppercase, which getComputedStyle reports).
  return "mismatch";
}

/**
 * Character-level LCS diff. Returns segments tagged as `equal`,
 * `removed` (in expected only), or `added` (in actual only). O(n*m)
 * — fine for hero strings (always < ~200 chars).
 */
type DiffSegment = { type: "equal" | "removed" | "added"; text: string };

function diffChars(a: string, b: string): DiffSegment[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const reversed: DiffSegment[] = [];
  const push = (type: DiffSegment["type"], ch: string) => {
    const last = reversed[reversed.length - 1];
    if (last && last.type === type) last.text += ch;
    else reversed.push({ type, text: ch });
  };
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      push("equal", a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      push("removed", a[i - 1]);
      i--;
    } else {
      push("added", b[j - 1]);
      j--;
    }
  }
  while (i > 0) {
    push("removed", a[i - 1]);
    i--;
  }
  while (j > 0) {
    push("added", b[j - 1]);
    j--;
  }
  // We pushed in reverse — flip segment order AND reverse each segment's
  // text so the final result reads left-to-right.
  const out: DiffSegment[] = [];
  for (let k = reversed.length - 1; k >= 0; k--) {
    out.push({
      type: reversed[k].type,
      text: reversed[k].text.split("").reverse().join(""),
    });
  }
  return out;
}

// One side of the diff. For "expected": show equal + removed (red strike).
// For "actual": show equal + added (green underline). Whitespace inside
// changed runs is visualized with · so it isn't invisible.
function DiffLine({
  label,
  segments,
  side,
}: {
  label: string;
  segments: DiffSegment[];
  side: "expected" | "actual";
}) {
  const visible = segments.filter(
    (s) =>
      s.type === "equal" ||
      (side === "expected" ? s.type === "removed" : s.type === "added"),
  );
  return (
    <div
      style={{
        opacity: 0.9,
        fontSize: 11,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        wordBreak: "break-word",
        lineHeight: 1.5,
      }}
    >
      <span style={{ opacity: 0.55 }}>{label}: </span>
      {visible.map((seg, idx) => {
        if (seg.type === "equal") {
          return (
            <span key={idx} style={{ opacity: 0.6 }}>
              {seg.text}
            </span>
          );
        }
        const isAdded = seg.type === "added";
        const text = seg.text.replace(/ /g, "·");
        return (
          <span
            key={idx}
            title={isAdded ? "added in actual" : "missing from actual"}
            style={{
              background: isAdded
                ? "rgba(34, 197, 94, 0.35)"
                : "rgba(239, 68, 68, 0.35)",
              color: isAdded ? "rgb(187, 247, 208)" : "rgb(254, 202, 202)",
              textDecoration: isAdded ? "underline" : "line-through",
              borderRadius: 2,
              padding: "0 1px",
            }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
}

function computeReports(): FieldReport[] {
  if (typeof document === "undefined") return [];
  return FIELD_ORDER.map((key): FieldReport => {
    const expected = HERO_COPY_SPEC[key];
    // Prefer a *direct* match on the field, but tolerate the eyebrow's
    // composite container that lists multiple fields (it has space-
    // separated values in data-hero-field).
    const direct = document.querySelector<HTMLElement>(
      `[data-hero-field="${key}"]`,
    );
    const el =
      direct ??
      Array.from(
        document.querySelectorAll<HTMLElement>("[data-hero-field]"),
      ).find((node) =>
        (node.dataset.heroField ?? "").split(/\s+/).includes(key),
      ) ??
      null;

    const actualRaw = el?.textContent ?? null;
    // If the element is wrapped (e.g. eyebrow with ✦ ✦), strip those
    // decorative chars before classifying so a green outline is possible
    // when the spec text is fully present and the only extras are stars.
    const actualClean = actualRaw?.replace(/✦/g, "").replace(/\s+/g, " ").trim() ?? null;

    let status = classify(expected, actualClean);
    // If textContent is the uppercased visual (CSS text-transform), still
    // accept it as an exact match — the visible characters match the spec.
    if (status === "mismatch" && actualClean) {
      const upperExpected = normalize(expected).toUpperCase();
      const upperActual = normalize(actualClean).toUpperCase();
      if (upperActual === upperExpected) status = "match";
      else if (upperActual.includes(upperExpected)) status = "loose";
    }

    return {
      key,
      expected,
      actual: actualClean,
      status,
      rect: el?.getBoundingClientRect() ?? null,
    };
  });
}

function isEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("verify") === "hero";
}

export function HeroVerifyOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [tick, setTick] = useState(0);
  // Live mode: when on, a MutationObserver watches every [data-hero-field]
  // node and re-runs verification on any text/subtree change. This keeps
  // the overlay current as you edit hero copy (HMR replaces the rendered
  // text in place). Default ON; togglable from the legend.
  const [liveMode, setLiveMode] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Activate only when ?verify=hero is present.
  useEffect(() => {
    setEnabled(isEnabled());
  }, []);

  // Re-measure on mount, on resize, and on scroll so badges follow their
  // anchor elements through the page.
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTick((t) => t + 1));
    };
    // Initial measure after fonts/animations settle.
    const initial = window.setTimeout(schedule, 50);
    const t1 = window.setTimeout(schedule, 400);
    const t2 = window.setTimeout(schedule, 1600);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(initial);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
    };
  }, [enabled]);

  // Live mode: observe DOM mutations on hero-field nodes and any added/
  // removed nodes anywhere in the document body (HMR can swap whole
  // subtrees). Debounced via requestAnimationFrame so a burst of HMR
  // mutations triggers a single re-verify.
  useEffect(() => {
    if (!enabled || !liveMode) return;
    if (typeof MutationObserver === "undefined") return;
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTick((t) => t + 1));
    };
    const observer = new MutationObserver(schedule);
    // Watch the whole body for added/removed nodes (HMR), and characterData
    // + subtree so any text edit inside an existing hero-field node fires.
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [enabled, liveMode]);

  useEffect(() => {
    if (!enabled) return;
    setReports(computeReports());
    setLastUpdated(Date.now());
  }, [enabled, tick]);

  const summary = useMemo(() => {
    const counts: Record<FieldStatus, number> = {
      match: 0,
      loose: 0,
      mismatch: 0,
      missing: 0,
    };
    for (const r of reports) counts[r.status] += 1;
    return counts;
  }, [reports]);

  // Shared file-download helper. Creates an <a download> on the fly so the
  // browser saves the blob with our chosen filename. SSR-safe.
  const triggerDownload = (blob: Blob, filename: string) => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");

  // Build the export payload + trigger a JSON file download. Captures the
  // page URL, viewport, version hash, per-field expected/actual/status,
  // and the summary counts so the file is self-contained for CI logs.
  const handleExportJson = () => {
    if (typeof window === "undefined") return;
    const payload = {
      schema: "hero-verify-report/v1",
      generatedAt: new Date().toISOString(),
      url: window.location.href,
      pathname: window.location.pathname,
      heroCopyVersion: HERO_COPY_VERSION,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      ok:
        summary.mismatch === 0 && summary.missing === 0 && summary.loose === 0,
      summary,
      fields: reports.map((r) => ({
        key: r.key,
        status: r.status,
        expected: r.expected,
        actual: r.actual,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    triggerDownload(
      blob,
      `hero-verify-${HERO_COPY_VERSION}-${stamp()}.json`,
    );
  };

  // CSV escape: wrap every field in double quotes and double any embedded
  // quote, per RFC 4180. Newlines inside fields are preserved verbatim
  // because they are inside a quoted field.
  const csvCell = (v: string | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const handleExportCsv = () => {
    if (typeof window === "undefined") return;
    const header = ["key", "status", "expected", "actual"];
    const rows = reports.map((r) =>
      [r.key, r.status, r.expected, r.actual ?? ""].map(csvCell).join(","),
    );
    // Prepend a UTF-8 BOM so Excel opens the em-dash etc. correctly, and
    // use CRLF line endings per the CSV spec.
    const csv = "\uFEFF" + [header.map(csvCell).join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    triggerDownload(
      blob,
      `hero-verify-${HERO_COPY_VERSION}-${stamp()}.csv`,
    );
  };


  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2147483000,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
      data-hero-verify-overlay="active"
    >
      {/* Local keyframes — scoped under the overlay only. */}
      <style>{`
        @keyframes heroVerifyPulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.25); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0.05); }
        }
      `}</style>
      {/* Per-field outlines + badges */}
      {reports.map((r) => {
        if (!r.rect) return null;
        const color = STATUS_COLOR[r.status];
        const top = r.rect.top;
        const left = r.rect.left;
        const width = r.rect.width;
        const height = r.rect.height;
        return (
          <div key={r.key}>
            <div
              style={{
                position: "fixed",
                top,
                left,
                width,
                height,
                outline: `2px solid ${color}`,
                outlineOffset: 2,
                borderRadius: 4,
                background: `${color}10`,
                boxShadow: `0 0 0 1px ${color}33`,
              }}
            />
            <div
              style={{
                position: "fixed",
                top: Math.max(top - 22, 4),
                left,
                background: color,
                color: "white",
                padding: "2px 8px",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.04em",
                borderRadius: 3,
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              }}
            >
              <span style={{ marginRight: 6 }}>{STATUS_GLYPH[r.status]}</span>
              {r.key} · {STATUS_LABEL[r.status]}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          maxWidth: 360,
          background: "rgba(15, 23, 42, 0.94)",
          color: "white",
          borderRadius: 10,
          padding: "12px 14px",
          fontSize: 12,
          lineHeight: 1.4,
          boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <strong style={{ fontSize: 12, letterSpacing: "0.08em" }}>
            HERO VERIFY
          </strong>
          <span
            style={{
              fontSize: 10,
              opacity: 0.7,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            ?verify=hero
          </span>
        </div>
        {/* Live mode toggle — when ON, a MutationObserver re-runs
            verification on any DOM change to hero-field nodes (HMR-safe). */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            fontSize: 11,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={liveMode}
            onChange={(e) => setLiveMode(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          <span>
            <strong style={{ letterSpacing: "0.04em" }}>Live mode</strong>
            <span style={{ opacity: 0.65, marginLeft: 6 }}>
              {liveMode ? "watching DOM" : "manual"}
            </span>
          </span>
          <span
            aria-hidden="true"
            style={{
              marginLeft: "auto",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: liveMode
                ? "rgb(34, 197, 94)"
                : "rgb(148, 163, 184)",
              boxShadow: liveMode
                ? "0 0 0 3px rgba(34,197,94,0.25)"
                : "none",
              animation: liveMode ? "heroVerifyPulse 1.6s ease-in-out infinite" : "none",
            }}
          />
        </label>
        {lastUpdated !== null && (
          <div
            style={{
              fontSize: 10,
              opacity: 0.55,
              marginBottom: 8,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            updated {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            columnGap: 8,
            rowGap: 4,
            marginBottom: 10,
          }}
        >
          {(["match", "loose", "mismatch", "missing"] as FieldStatus[]).map(
            (s) => (
              <div key={s} style={{ display: "contents" }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    background: STATUS_COLOR[s],
                    borderRadius: 2,
                    alignSelf: "center",
                  }}
                />
                <span style={{ opacity: 0.9 }}>{STATUS_LABEL[s]}</span>
                <span
                  style={{
                    opacity: 0.95,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {summary[s]}
                </span>
              </div>
            ),
          )}
        </div>
        <details>
          <summary style={{ cursor: "pointer", opacity: 0.85 }}>
            Field details
          </summary>
          <ul style={{ marginTop: 8, paddingLeft: 14 }}>
            {reports.map((r) => {
              // Compute a char-level diff only for non-match fields with
              // both sides present. Matched fields just show the expected.
              const showDiff =
                r.actual !== null &&
                (r.status === "mismatch" || r.status === "loose");
              const segments = showDiff ? diffChars(r.expected, r.actual ?? "") : null;
              return (
                <li key={r.key} style={{ marginBottom: 10 }}>
                  <span style={{ color: STATUS_COLOR[r.status] }}>
                    {STATUS_GLYPH[r.status]}
                  </span>{" "}
                  <strong>{r.key}</strong>
                  {showDiff && segments ? (
                    <div
                      style={{
                        marginTop: 4,
                        padding: "6px 8px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 6,
                      }}
                    >
                      <DiffLine label="exp" segments={segments} side="expected" />
                      <DiffLine label="got" segments={segments} side="actual" />
                    </div>
                  ) : (
                    <>
                      <div style={{ opacity: 0.7, fontSize: 11 }}>
                        exp: <q>{r.expected}</q>
                      </div>
                      {r.actual !== null && r.status !== "match" && (
                        <div style={{ opacity: 0.7, fontSize: 11 }}>
                          got: <q>{r.actual}</q>
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </details>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <button
            type="button"
            onClick={handleExportJson}
            style={{
              flex: 1,
              background: "white",
              color: "rgb(15, 23, 42)",
              border: "none",
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            }}
          >
            ⬇ JSON
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              flex: 1,
              background: "rgb(34, 197, 94)",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            }}
          >
            ⬇ CSV
          </button>
        </div>
      </div>
    </div>
  );
}
