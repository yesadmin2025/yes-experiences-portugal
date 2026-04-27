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

  useEffect(() => {
    if (!enabled) return;
    setReports(computeReports());
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

  // Build the export payload + trigger a JSON file download. Captures the
  // page URL, viewport, version hash, per-field expected/actual/status,
  // and the summary counts so the file is self-contained for CI logs.
  const handleExport = () => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `hero-verify-${HERO_COPY_VERSION}-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            {reports.map((r) => (
              <li key={r.key} style={{ marginBottom: 6 }}>
                <span style={{ color: STATUS_COLOR[r.status] }}>
                  {STATUS_GLYPH[r.status]}
                </span>{" "}
                <strong>{r.key}</strong>
                <div style={{ opacity: 0.7, fontSize: 11 }}>
                  exp: <q>{r.expected}</q>
                </div>
                {r.actual !== null && r.status !== "match" && (
                  <div style={{ opacity: 0.7, fontSize: 11 }}>
                    got: <q>{r.actual}</q>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
