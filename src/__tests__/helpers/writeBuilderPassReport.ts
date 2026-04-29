/**
 * Writes a per-pass artifact bundle for the builder canvas
 * back-and-forth test (and any future multi-pass builder flow).
 *
 * Output (under test-output/builder-canvas/<scenario>/):
 *   - passes.json — structured snapshot of every pass:
 *       { name, header[], firstCard[], gap, driftFromBaseline }
 *   - diff.html   — single-file visual report. Each pass is a card;
 *                   landmarks that drift vs. the baseline pass are
 *                   highlighted in red, identical landmarks in green.
 *                   Inline-style cells diff cell-by-cell so the exact
 *                   property that moved is obvious at a glance.
 *
 * The artifact is always written (pass or fail) so CI can upload it
 * unconditionally. The first pass is the baseline; every subsequent
 * pass is diffed against it, mirroring what the test asserts.
 */

import fs from "node:fs";
import path from "node:path";

export type LandmarkRow = {
  selector: string;
  className: string;
  inline: Record<string, string>;
};

export type BuilderPass = {
  name: string;
  description?: string;
  header: LandmarkRow[];
  firstCard: LandmarkRow[];
  gap: number;
};

const OUT_ROOT = path.resolve(process.cwd(), "test-output", "builder-canvas");

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function diffLandmark(base: LandmarkRow | undefined, cur: LandmarkRow) {
  if (!base) return { classDrift: true, inlineDrift: new Set<string>(["*"]) };
  const classDrift = base.className !== cur.className;
  const inlineDrift = new Set<string>();
  const keys = new Set([
    ...Object.keys(base.inline),
    ...Object.keys(cur.inline),
  ]);
  for (const k of keys) {
    if (base.inline[k] !== cur.inline[k]) inlineDrift.add(k);
  }
  return { classDrift, inlineDrift };
}

function landmarkBlock(
  title: string,
  baseRows: LandmarkRow[],
  rows: LandmarkRow[],
  isBaseline: boolean,
): string {
  if (rows.length === 0) {
    return `<h3>${escapeHtml(title)}</h3><p class="muted">no landmarks</p>`;
  }
  const inlineKeys = Array.from(
    rows.reduce<Set<string>>((acc, r) => {
      Object.keys(r.inline).forEach((k) => acc.add(k));
      return acc;
    }, new Set()),
  ).sort();

  const headCells = `<th>selector</th><th>className</th>${inlineKeys
    .map((k) => `<th>${escapeHtml(k)}</th>`)
    .join("")}`;

  const bodyRows = rows
    .map((r, i) => {
      const base = baseRows[i];
      const { classDrift, inlineDrift } = isBaseline
        ? { classDrift: false, inlineDrift: new Set<string>() }
        : diffLandmark(base, r);

      const inlineCells = inlineKeys
        .map((k) => {
          const v = r.inline[k] ?? "";
          const drift = inlineDrift.has(k) || inlineDrift.has("*");
          const baseV = base?.inline[k] ?? "";
          const title =
            !isBaseline && drift && baseV !== v
              ? ` title="baseline: ${escapeHtml(baseV)}"`
              : "";
          return `<td class="${drift ? "drift" : "ok"}"${title}>${escapeHtml(v)}</td>`;
        })
        .join("");

      const classTitle =
        !isBaseline && classDrift && base
          ? ` title="baseline: ${escapeHtml(base.className)}"`
          : "";

      return `<tr>
        <td class="sel">${escapeHtml(r.selector)}</td>
        <td class="${classDrift ? "drift" : "ok"} cls"${classTitle}>${escapeHtml(r.className)}</td>
        ${inlineCells}
      </tr>`;
    })
    .join("");

  return `<h3>${escapeHtml(title)}</h3>
    <div class="tbl-wrap">
      <table>
        <thead><tr>${headCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>`;
}

function passCard(p: BuilderPass, baseline: BuilderPass, isBaseline: boolean) {
  const gapDrift = !isBaseline && p.gap !== baseline.gap;
  return `<section class="pass ${isBaseline ? "baseline" : ""}">
    <header>
      <h2>${escapeHtml(p.name)}${isBaseline ? ' <span class="badge">baseline</span>' : ""}</h2>
      ${p.description ? `<p class="desc">${escapeHtml(p.description)}</p>` : ""}
      <p class="gap ${gapDrift ? "drift" : "ok"}">
        header → first-card gap: <strong>${p.gap}px</strong>
        ${gapDrift ? `<span class="delta">(baseline: ${baseline.gap}px)</span>` : ""}
      </p>
    </header>
    ${landmarkBlock("StepHeader landmarks", baseline.header, p.header, isBaseline)}
    ${landmarkBlock("First MomentCard landmarks", baseline.firstCard, p.firstCard, isBaseline)}
  </section>`;
}

function renderHtml(scenario: string, passes: BuilderPass[]): string {
  if (passes.length === 0) return "<html><body>No passes recorded.</body></html>";
  const baseline = passes[0];
  const cards = passes
    .map((p, i) => passCard(p, baseline, i === 0))
    .join("\n");

  const driftedPasses = passes
    .slice(1)
    .filter(
      (p) =>
        p.gap !== baseline.gap ||
        JSON.stringify(p.header) !== JSON.stringify(baseline.header) ||
        JSON.stringify(p.firstCard) !== JSON.stringify(baseline.firstCard),
    ).length;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Builder canvas — ${escapeHtml(scenario)}</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; margin: 0; padding: 24px; background: #0f172a; color: #e2e8f0; }
  h1 { margin: 0 0 4px; font-size: 20px; }
  .summary { color: #94a3b8; margin-bottom: 24px; }
  .summary strong.drift { color: #f87171; }
  .summary strong.ok { color: #4ade80; }
  .pass { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
  .pass.baseline { border-color: #475569; }
  .pass header h2 { margin: 0 0 4px; font-size: 16px; }
  .pass .badge { display: inline-block; font-size: 10px; padding: 2px 6px; background: #475569; color: #f1f5f9; border-radius: 4px; vertical-align: middle; margin-left: 6px; font-weight: normal; }
  .pass .desc { margin: 0 0 8px; color: #94a3b8; font-size: 12px; }
  .pass .gap { margin: 0 0 12px; }
  .pass .gap.ok { color: #4ade80; }
  .pass .gap.drift { color: #f87171; }
  .pass .gap .delta { color: #fbbf24; font-weight: normal; margin-left: 6px; }
  h3 { margin: 12px 0 6px; font-size: 12px; text-transform: uppercase; color: #cbd5e1; letter-spacing: 0.05em; }
  .tbl-wrap { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; font-size: 12px; }
  th, td { padding: 6px 8px; border-bottom: 1px solid #334155; text-align: left; vertical-align: top; }
  th { color: #94a3b8; font-weight: 600; background: #0f172a; position: sticky; top: 0; }
  td.sel { color: #38bdf8; font-family: ui-monospace, "SF Mono", Menlo, monospace; white-space: nowrap; }
  td.cls { font-family: ui-monospace, "SF Mono", Menlo, monospace; max-width: 480px; word-break: break-word; }
  td.ok { color: #cbd5e1; }
  td.drift { background: rgba(248, 113, 113, 0.18); color: #fecaca; font-weight: 600; }
  p.muted { color: #64748b; font-size: 12px; }
</style>
</head>
<body>
  <h1>Builder canvas — ${escapeHtml(scenario)}</h1>
  <p class="summary">
    ${passes.length} passes recorded.
    Drifted vs. baseline:
    <strong class="${driftedPasses > 0 ? "drift" : "ok"}">${driftedPasses}</strong>.
    Baseline pass: <strong>${escapeHtml(baseline.name)}</strong>.
  </p>
  ${cards}
</body>
</html>`;
}

export function writeBuilderPassReport(
  scenario: string,
  passes: BuilderPass[],
): { dir: string; htmlPath: string; jsonPath: string } {
  const dir = path.join(OUT_ROOT, scenario);
  fs.mkdirSync(dir, { recursive: true });

  const baseline = passes[0];
  const enriched = passes.map((p, i) => ({
    ...p,
    driftFromBaseline:
      i === 0
        ? null
        : {
            gap: p.gap !== baseline.gap ? { baseline: baseline.gap, current: p.gap } : null,
            header: JSON.stringify(p.header) !== JSON.stringify(baseline.header),
            firstCard:
              JSON.stringify(p.firstCard) !== JSON.stringify(baseline.firstCard),
          },
  }));

  const jsonPath = path.join(dir, "passes.json");
  const htmlPath = path.join(dir, "diff.html");
  fs.writeFileSync(jsonPath, JSON.stringify(enriched, null, 2));
  fs.writeFileSync(htmlPath, renderHtml(scenario, passes));

  return { dir, htmlPath, jsonPath };
}
