import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/typography-audit")({
  head: () => ({
    meta: [
      { title: "Typography Audit — YES experiences" },
      { name: "description", content: "Per-route audit of which webfonts each typography token resolves to in the live DOM." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TypographyAuditPage,
});

// ─── Routes to audit ──────────────────────────────────────────────
// Keep this aligned with the public sitemap; debug-only routes excluded.
const ROUTES = [
  "/",
  "/about",
  "/experiences",
  "/builder",
  "/proposals",
  "/contact",
  "/corporate",
  "/day-tours",
  "/multi-day",
  "/local-stories",
];

// ─── Tokens we sample on each route ───────────────────────────────
// `expected` = the family name that MUST appear first in the resolved
// font-family stack. Anything else means a fallback rendered.
type Token = {
  key: string;
  label: string;
  selector: string;
  expectedFamily: string;
  thresholds: { minPx?: number; minLh?: number; minContrast?: number };
};

const TOKENS: Token[] = [
  { key: "h1", label: "H1 — display", selector: "h1", expectedFamily: "Cormorant Garamond",
    thresholds: { minPx: 24, minLh: 1.0, minContrast: 3.0 /* large text */ } },
  { key: "h2", label: "H2 — section", selector: "h2", expectedFamily: "Cormorant Garamond",
    thresholds: { minPx: 20, minLh: 1.0, minContrast: 3.0 } },
  { key: "h3", label: "H3 — sub-section", selector: "h3", expectedFamily: "Cormorant Garamond",
    thresholds: { minPx: 18, minLh: 1.0, minContrast: 4.5 } },
  { key: "body", label: "Body — paragraph", selector: "p", expectedFamily: "Inter",
    thresholds: { minPx: 14, minLh: 1.5, minContrast: 4.5 } },
  { key: "button", label: "Button / CTA", selector: "button, .hero-cta-button, a[role='button']", expectedFamily: "Inter",
    thresholds: { minPx: 12, minLh: 1.2, minContrast: 4.5 } },
  { key: "eyebrow", label: "Eyebrow caps", selector: ".eyebrow", expectedFamily: "Inter",
    thresholds: { minPx: 11, minLh: 1.2, minContrast: 4.5 } },
  { key: "script", label: "Script accent", selector: ".script", expectedFamily: "Kaushan Script",
    thresholds: { minPx: 12, minLh: 1.0, minContrast: 4.5 } },
];

// ─── Color helpers (sRGB → relative luminance → WCAG ratio) ───────
const parseColor = (raw: string): [number, number, number] | null => {
  const m = raw.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(/[ ,/]+/).filter(Boolean).slice(0, 3).map(parseFloat);
  if (parts.length < 3 || parts.some(Number.isNaN)) return null;
  return [parts[0], parts[1], parts[2]];
};
const luminance = (rgb: [number, number, number]) => {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string): number | null => {
  const ra = parseColor(a), rb = parseColor(b);
  if (!ra || !rb) return null;
  const la = luminance(ra), lb = luminance(rb);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};
const rgbToHex = (raw: string) => {
  const rgb = parseColor(raw);
  if (!rgb) return raw;
  return "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
};

// ─── Per-token sample ─────────────────────────────────────────────
type Sample = {
  token: Token;
  found: boolean;
  count: number;
  fontFamily: string;
  resolvedFirst: string;
  expectedMatched: boolean;
  fontPx: number;
  lineHeight: number;
  fontWeight: string;
  fg: string;
  bg: string;
  contrast: number | null;
  issues: string[];
};

// Sample the FIRST visible element matching the selector inside doc.
// "Visible" = has non-zero box and is not display:none / visibility:hidden.
const sampleToken = (doc: Document, win: Window, t: Token): Sample => {
  const all = [...doc.querySelectorAll<HTMLElement>(t.selector)];
  const visible = all.filter((el) => {
    const cs = win.getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  const el = visible[0] ?? all[0];
  if (!el) {
    return {
      token: t, found: false, count: 0,
      fontFamily: "—", resolvedFirst: "—", expectedMatched: false,
      fontPx: 0, lineHeight: 0, fontWeight: "—",
      fg: "—", bg: "—", contrast: null, issues: ["element not present on this route"],
    };
  }
  const cs = win.getComputedStyle(el);
  const ff = cs.fontFamily;
  // First family in the stack — strip quotes
  const first = (ff.split(",")[0] || "").replace(/['"]/g, "").trim();
  const expectedMatched = first.toLowerCase() === t.expectedFamily.toLowerCase();

  const fontPx = parseFloat(cs.fontSize) || 0;
  const lhRaw = cs.lineHeight;
  const lh = lhRaw === "normal" ? 1.2 : lhRaw.endsWith("px") ? parseFloat(lhRaw) / fontPx : parseFloat(lhRaw);

  // Walk up to first non-transparent background
  let bgRaw = "rgba(0, 0, 0, 0)";
  let p: HTMLElement | null = el;
  while (p && p !== doc.documentElement) {
    const b = win.getComputedStyle(p).backgroundColor;
    if (b && !/rgba?\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(b) && b !== "transparent") { bgRaw = b; break; }
    p = p.parentElement;
  }
  if (/rgba?\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(bgRaw)) bgRaw = win.getComputedStyle(doc.body).backgroundColor || "rgb(255,255,255)";
  const fgRaw = cs.color;
  const ratio = contrast(fgRaw, bgRaw);

  const issues: string[] = [];
  if (!expectedMatched) issues.push(`font fallback — got "${first}", expected "${t.expectedFamily}"`);
  if (t.thresholds.minPx && fontPx < t.thresholds.minPx) issues.push(`font-size ${fontPx}px < ${t.thresholds.minPx}px`);
  if (t.thresholds.minLh && lh < t.thresholds.minLh) issues.push(`line-height ${lh.toFixed(2)} < ${t.thresholds.minLh}`);
  if (t.thresholds.minContrast && ratio != null && ratio < t.thresholds.minContrast) {
    issues.push(`contrast ${ratio.toFixed(2)}:1 < ${t.thresholds.minContrast}:1`);
  }
  return {
    token: t, found: true, count: visible.length || all.length,
    fontFamily: ff, resolvedFirst: first, expectedMatched,
    fontPx, lineHeight: lh, fontWeight: cs.fontWeight,
    fg: rgbToHex(fgRaw), bg: rgbToHex(bgRaw), contrast: ratio,
    issues,
  };
};

// ─── Per-route audit (loads route in hidden iframe with retry + SSR fallback) ──
type AuditVia = "iframe" | "ssr-fallback";
type RouteResult = {
  path: string;
  status: "pending" | "loading" | "done" | "error";
  samples: Sample[];
  error?: string;
  attempts?: number;          // total attempts taken (1–3)
  via?: AuditVia;             // which path produced the final samples
  attemptLog?: string[];      // per-attempt failure reasons (visible in UI)
};

// Sample a route once via the shared iframe with a hard timeout.
// Returns { ok: true, samples } or { ok: false, error }.
type AttemptResult = { ok: true; samples: Sample[] } | { ok: false; error: string };

const sampleViaIframe = (
  iframe: HTMLIFrameElement,
  path: string,
  timeoutMs: number,
  ssrFallback: boolean,
): Promise<AttemptResult> => new Promise((resolve) => {
  let settled = false;
  const settle = (r: AttemptResult) => {
    if (settled) return;
    settled = true;
    iframe.removeEventListener("load", onLoad);
    clearTimeout(timer);
    resolve(r);
  };
  const onLoad = async () => {
    try {
      const win = iframe.contentWindow;
      const doc = iframe.contentDocument;
      if (!win || !doc) return settle({ ok: false, error: "iframe blocked (cross-origin or sandbox)" });

      // Wait for webfonts so we sample the LOADED font, not fallback.
      // Race against a 3s soft cap so a stuck font.ready doesn't eat the budget.
      if (doc.fonts && (doc.fonts as FontFaceSet & { ready?: Promise<unknown> }).ready) {
        await Promise.race([
          doc.fonts.ready.catch(() => undefined),
          new Promise((r) => setTimeout(r, 3000)),
        ]);
      }
      // Let async hero hooks (parallax, scroll-scale, hydration) settle.
      await new Promise((r) => setTimeout(r, 250));
      const samples = TOKENS.map((t) => sampleToken(doc, win, t));

      // Sanity guard: if EVERY token is "not present", treat as a failed render
      // (likely a hydration crash or a stripped-down SSR shell that lost layout).
      const anyFound = samples.some((s) => s.found);
      if (!anyFound) return settle({ ok: false, error: "no tokens found in document — likely hydration failure" });
      settle({ ok: true, samples });
    } catch (e) {
      settle({ ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  };
  iframe.addEventListener("load", onLoad);

  if (ssrFallback) {
    // Load via srcdoc so the iframe contains the SSR HTML even if the runtime would crash.
    fetch(`${path}${path.includes("?") ? "&" : "?"}__audit=${Date.now()}`, { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`SSR fetch ${res.status}`);
        const html = await res.text();
        // Inject a <base> so relative asset URLs resolve and a no-script marker
        // so we can tell this was the fallback path.
        const withBase = html.replace(
          /<head([^>]*)>/i,
          `<head$1><base href="${location.origin}/"><meta name="x-audit-via" content="ssr-fallback">`,
        );
        iframe.srcdoc = withBase;
      })
      .catch((err) => settle({ ok: false, error: `SSR fetch failed: ${err instanceof Error ? err.message : String(err)}` }));
  } else {
    // Cache-bust so the iframe re-renders fresh on every attempt.
    iframe.removeAttribute("srcdoc");
    iframe.src = `${path}${path.includes("?") ? "&" : "?"}__audit=${Date.now()}`;
  }

  const timer = setTimeout(() => settle({ ok: false, error: `timeout after ${Math.round(timeoutMs / 1000)}s` }), timeoutMs);
});

function TypographyAuditPage() {
  const [results, setResults] = useState<RouteResult[]>(() => ROUTES.map((p) => ({ path: p, status: "pending", samples: [] })));
  const [running, setRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 3-stage pipeline per route: iframe → iframe (longer timeout) → SSR HTML fallback.
  // Each stage's failure reason is appended to attemptLog for visibility.
  const auditRoute = useCallback(async (path: string): Promise<RouteResult> => {
    const iframe = iframeRef.current;
    if (!iframe) return { path, status: "error", samples: [], error: "iframe missing" };

    const stages: Array<{ label: string; timeout: number; via: AuditVia; ssr: boolean; backoffBefore: number }> = [
      { label: "iframe attempt 1", timeout: 8000, via: "iframe", ssr: false, backoffBefore: 0 },
      { label: "iframe attempt 2", timeout: 12000, via: "iframe", ssr: false, backoffBefore: 600 },
      { label: "SSR HTML fallback", timeout: 8000, via: "ssr-fallback", ssr: true, backoffBefore: 400 },
    ];

    const log: string[] = [];
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      if (stage.backoffBefore) await new Promise((r) => setTimeout(r, stage.backoffBefore));
      const r = await sampleViaIframe(iframe, path, stage.timeout, stage.ssr);
      if (r.ok) {
        return { path, status: "done", samples: r.samples, attempts: i + 1, via: stage.via, attemptLog: log };
      }
      log.push(`${stage.label}: ${r.error}`);
    }
    return {
      path, status: "error", samples: [],
      error: "all 3 attempts failed", attempts: stages.length, attemptLog: log,
    };
  }, []);

  const runAudit = useCallback(async () => {
    setRunning(true);
    setResults(ROUTES.map((p) => ({ path: p, status: "pending", samples: [] })));
    for (const path of ROUTES) {
      setResults((prev) => prev.map((r) => (r.path === path ? { ...r, status: "loading" } : r)));
      const result = await auditRoute(path);
      setResults((prev) => prev.map((r) => (r.path === path ? result : r)));
    }
    setRunning(false);
  }, [auditRoute]);

  // Auto-run on mount
  useEffect(() => { runAudit(); }, [runAudit]);

  // ── Aggregate stats ──
  const stats = useMemo(() => {
    let total = 0, ok = 0, fontFallbacks = 0, sizeIssues = 0, lhIssues = 0, contrastIssues = 0;
    for (const r of results) {
      for (const s of r.samples) {
        if (!s.found) continue;
        total++;
        if (s.issues.length === 0) ok++;
        if (!s.expectedMatched) fontFallbacks++;
        if (s.issues.some((i) => i.startsWith("font-size"))) sizeIssues++;
        if (s.issues.some((i) => i.startsWith("line-height"))) lhIssues++;
        if (s.issues.some((i) => i.startsWith("contrast"))) contrastIssues++;
      }
    }
    return { total, ok, fontFallbacks, sizeIssues, lhIssues, contrastIssues };
  }, [results]);

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[color:var(--charcoal-deep)] font-[var(--font-sans)]">
      {/* Hidden iframe used to load each route in isolation */}
      <iframe ref={iframeRef} title="audit-target" className="fixed -left-[9999px] -top-[9999px] h-[900px] w-[1280px]" sandbox="allow-same-origin allow-scripts" />

      <header className="border-b border-[color:var(--border)] px-6 py-8 md:px-10">
        <div className="mx-auto max-w-[1240px]">
          <p className="eyebrow mb-3">Internal · Typography Audit</p>
          <h1 className="font-[var(--font-serif)] text-3xl md:text-5xl leading-[1.05]">Live typography audit</h1>
          <p className="mt-3 max-w-3xl text-sm md:text-base">
            For each route, the page below loads in a hidden iframe, waits for fonts to be ready, and samples
            <code className="mx-1 rounded bg-black/5 px-1 py-0.5 text-[12px]">getComputedStyle</code>
            on representative elements. A row is flagged if the resolved family doesn't match the expected token, or if size / line-height / contrast falls below the WCAG threshold.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runAudit}
              disabled={running}
              className="rounded-md bg-[color:var(--charcoal-deep)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition disabled:opacity-50"
            >
              {running ? "Auditing…" : "Re-run audit"}
            </button>
            <a
              href="/"
              className="rounded-md border border-[color:var(--border)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em]"
            >
              ← Back to site
            </a>
          </div>
        </div>
      </header>

      {/* Aggregate */}
      <section className="border-b border-[color:var(--border)] bg-white/60 px-6 py-6 md:px-10">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-3 md:grid-cols-6">
          <Stat label="Samples taken" value={stats.total} />
          <Stat label="Passing" value={stats.ok} tone={stats.total && stats.ok === stats.total ? "ok" : "neutral"} />
          <Stat label="Font fallbacks" value={stats.fontFallbacks} tone={stats.fontFallbacks ? "bad" : "ok"} />
          <Stat label="Size issues" value={stats.sizeIssues} tone={stats.sizeIssues ? "warn" : "ok"} />
          <Stat label="Line-height issues" value={stats.lhIssues} tone={stats.lhIssues ? "warn" : "ok"} />
          <Stat label="Contrast issues" value={stats.contrastIssues} tone={stats.contrastIssues ? "bad" : "ok"} />
        </div>
      </section>

      {/* Per-route tables */}
      <main className="px-6 py-8 md:px-10">
        <div className="mx-auto max-w-[1240px] space-y-10">
          {results.map((r) => (
            <RouteSection key={r.path} result={r} />
          ))}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "ok" | "warn" | "bad" | "neutral" }) {
  const ring =
    tone === "ok" ? "ring-emerald-500/40 bg-emerald-50" :
    tone === "warn" ? "ring-amber-500/40 bg-amber-50" :
    tone === "bad" ? "ring-rose-500/50 bg-rose-50" :
    "ring-black/10 bg-white";
  return (
    <div className={`rounded-lg px-4 py-3 ring-1 ${ring}`}>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-[11px] uppercase tracking-[0.14em] opacity-70">{label}</div>
    </div>
  );
}

function RouteSection({ result }: { result: RouteResult }) {
  const failing = result.samples.filter((s) => s.found && s.issues.length > 0).length;
  const passing = result.samples.filter((s) => s.found && s.issues.length === 0).length;
  const missing = result.samples.filter((s) => !s.found).length;

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
        <div className="flex items-baseline gap-3">
          <code className="rounded bg-black/5 px-2 py-1 text-sm font-semibold">{result.path}</code>
          <StatusBadge status={result.status} />
        </div>
        <div className="flex gap-2 text-[11px] uppercase tracking-[0.12em]">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">{passing} ok</span>
          {failing > 0 && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-800">{failing} flagged</span>}
          {missing > 0 && <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700">{missing} n/a</span>}
        </div>
      </header>
      {result.error && (
        <div className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-800">
          Error: {result.error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-left text-[11px] uppercase tracking-[0.1em] text-black/60">
            <tr>
              <th className="px-4 py-2.5">Token</th>
              <th className="px-4 py-2.5">Resolved family</th>
              <th className="px-4 py-2.5 text-right">Size</th>
              <th className="px-4 py-2.5 text-right">Line-h</th>
              <th className="px-4 py-2.5 text-right">Weight</th>
              <th className="px-4 py-2.5">Color / bg</th>
              <th className="px-4 py-2.5 text-right">Contrast</th>
              <th className="px-4 py-2.5">Issues</th>
            </tr>
          </thead>
          <tbody>
            {result.samples.map((s) => (
              <tr key={s.token.key} className={`border-b border-black/5 last:border-0 ${s.issues.length ? "bg-rose-50/40" : ""}`}>
                <td className="px-4 py-2.5">
                  <div className="font-medium">{s.token.label}</div>
                  <code className="text-[11px] opacity-60">{s.token.selector}</code>
                </td>
                <td className="px-4 py-2.5">
                  {s.found ? (
                    <span className="inline-flex items-center gap-2">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.expectedMatched ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span style={{ fontFamily: s.fontFamily }}>{s.resolvedFirst}</span>
                      <span className="text-[11px] opacity-50">expected {s.token.expectedFamily}</span>
                    </span>
                  ) : <span className="opacity-40">—</span>}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{s.found ? `${s.fontPx}px` : "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{s.found ? s.lineHeight.toFixed(2) : "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{s.found ? s.fontWeight : "—"}</td>
                <td className="px-4 py-2.5">
                  {s.found ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-3 w-3 rounded-sm ring-1 ring-black/10" style={{ background: s.fg }} />
                      <span className="text-[11px]">{s.fg}</span>
                      <span className="opacity-40">/</span>
                      <span className="inline-block h-3 w-3 rounded-sm ring-1 ring-black/10" style={{ background: s.bg }} />
                      <span className="text-[11px]">{s.bg}</span>
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{s.contrast != null ? `${s.contrast.toFixed(2)}:1` : "—"}</td>
                <td className="px-4 py-2.5">
                  {s.issues.length === 0 ? (
                    <span className="text-emerald-700">✓ ok</span>
                  ) : (
                    <ul className="space-y-0.5">
                      {s.issues.map((i, idx) => <li key={idx} className="text-[12px] text-rose-700">• {i}</li>)}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: RouteResult["status"] }) {
  const map = {
    pending: "bg-zinc-100 text-zinc-600",
    loading: "bg-amber-100 text-amber-800",
    done: "bg-emerald-100 text-emerald-800",
    error: "bg-rose-100 text-rose-800",
  } as const;
  return <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${map[status]}`}>{status}</span>;
}
