#!/usr/bin/env node
/**
 * Home hero copy localization QA checklist.
 *
 * Verifies that the canonical hero strings (eyebrow, both headline lines,
 * subheadline, both CTAs, and microcopy) match EXACTLY in the served HTML
 * of both the preview and production deployments.
 *
 * Source of truth: src/content/hero-copy.ts (HERO_COPY).
 *
 * Usage:
 *   node scripts/hero-copy-qa.mjs
 *
 * Optional env overrides:
 *   PREVIEW_URL=https://...    (defaults to id-preview--<id>.lovable.app)
 *   PRODUCTION_URL=https://... (defaults to dreamscape-builder-co.lovable.app)
 *
 * Exit codes:
 *   0 — every required string found in every target
 *   1 — at least one mismatch (release should be blocked)
 */

import { HERO_COPY } from "../src/content/hero-copy.ts";
import { parse as parseHtml } from "node-html-parser";

const ALL_TARGETS = [
  {
    name: "Preview",
    url:
      process.env.PREVIEW_URL ||
      "https://id-preview--5351efc5-c55a-4e41-b282-a4a019690d38.lovable.app/",
  },
  {
    name: "Production",
    url: process.env.PRODUCTION_URL || "https://dreamscape-builder-co.lovable.app/",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CLI argument parsing.
//
// Supported flags (all optional; primarily affect --watch but --target also
// applies to one-shot mode so the same filter works for both invocations):
//
//   --watch                       enable watch mode
//   --target=<preview|production|all>   filter which deployments to check
//                                       (also: --preview-only, --production-only)
//   --debounce=<ms>               override watch-mode debounce (default 200ms,
//                                       clamped to [0, 10000])
//
// Unknown flags are ignored with a warning so future additions don't break
// older muscle-memory invocations.
// ─────────────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const opts = { watch: false, target: "all", debounceMs: 200 };
  for (const raw of argv) {
    if (raw === "--watch") opts.watch = true;
    else if (raw === "--preview-only") opts.target = "preview";
    else if (raw === "--production-only" || raw === "--prod-only") opts.target = "production";
    else if (raw.startsWith("--target=")) {
      const v = raw.slice("--target=".length).toLowerCase();
      if (["preview", "production", "all"].includes(v)) opts.target = v;
      else console.log(`\x1b[33m⚠ Ignoring --target=${v} (expected preview|production|all)\x1b[0m`);
    } else if (raw.startsWith("--debounce=")) {
      const n = Number(raw.slice("--debounce=".length));
      if (Number.isFinite(n) && n >= 0) opts.debounceMs = Math.min(10000, Math.floor(n));
      else console.log(`\x1b[33m⚠ Ignoring --debounce=${raw.slice(11)} (expected non-negative number)\x1b[0m`);
    } else if (raw.startsWith("--")) {
      console.log(`\x1b[33m⚠ Unknown flag ${raw} ignored\x1b[0m`);
    }
  }
  return opts;
}

const CLI = parseArgs(process.argv.slice(2));

const TARGETS = ALL_TARGETS.filter((t) => {
  if (CLI.target === "all") return true;
  return t.name.toLowerCase() === CLI.target;
});

if (TARGETS.length === 0) {
  console.log(`\x1b[31mNo targets matched filter --target=${CLI.target}\x1b[0m`);
  process.exit(2);
}

// The localization checklist — every string here must appear verbatim in the
// served HTML of every target. Order is intentional (top-to-bottom in the UI).
const CHECKS = [
  { key: "eyebrow", label: "Eyebrow", value: HERO_COPY.eyebrow },
  { key: "headlineLine1", label: "Headline (line 1)", value: HERO_COPY.headlineLine1 },
  { key: "headlineLine2", label: "Headline (line 2)", value: HERO_COPY.headlineLine2 },
  { key: "subheadline", label: "Subheadline", value: HERO_COPY.subheadline },
  { key: "primaryCta", label: "Primary CTA", value: HERO_COPY.primaryCta },
  { key: "secondaryCta", label: "Secondary CTA", value: HERO_COPY.secondaryCta },
  { key: "microcopy", label: "Microcopy", value: HERO_COPY.microcopy },
];

// Preflight: the rendered app exposes the live runtime strings via
// `data-hero-*` attributes on a hidden probe element (see src/routes/index.tsx
// around line 574). We parse those attributes from the served HTML and assert
// each one is byte-for-byte equal to the source-of-truth value. If this fails,
// the substring checks below would lie — passing because the OLD copy still
// matches, even though something else has drifted.
const PROBE_ATTRS = [
  { attr: "data-hero-eyebrow", key: "eyebrow", expected: HERO_COPY.eyebrow },
  {
    attr: "data-hero-headline",
    key: "headline",
    expected: `${HERO_COPY.headlineLine1} ${HERO_COPY.headlineLine2}`,
  },
  { attr: "data-hero-subheadline", key: "subheadline", expected: HERO_COPY.subheadline },
  { attr: "data-hero-primary-cta", key: "primaryCta", expected: HERO_COPY.primaryCta },
  { attr: "data-hero-secondary-cta", key: "secondaryCta", expected: HERO_COPY.secondaryCta },
  { attr: "data-hero-microcopy", key: "microcopy", expected: HERO_COPY.microcopy },
];

// Tolerant DOM-based attribute extraction.
//
// Parses the served HTML once with node-html-parser, then for each probe
// attribute selects the element carrying it and reads the value via the
// parser's getAttribute() — which handles:
//   - any attribute order on the element
//   - single, double, or unquoted attribute values
//   - arbitrary surrounding whitespace, line breaks, or formatting
//   - HTML entity decoding (&amp; &quot; &#39; numeric refs, etc.)
//   - mixed case (HTML attributes are case-insensitive)
//   - the attribute appearing on any element in the document
//
// If multiple elements carry the same data-hero-* attribute (the page also
// renders some of these on the visible probe + a hidden mirror), we read the
// FIRST occurrence — they are written from the same HERO_COPY source so they
// must agree, and disagreement is itself a drift signal worth surfacing.
function readProbeAttr(root, attr) {
  const el = root.querySelector(`[${attr}]`);
  if (!el) return null;
  const value = el.getAttribute(attr);
  return value ?? null;
}

function runPreflight(html) {
  const root = parseHtml(html, {
    lowerCaseTagName: false,
    comment: false,
    blockTextElements: { script: false, style: false },
  });
  return PROBE_ATTRS.map((p) => {
    const actual = readProbeAttr(root, p.attr);
    return {
      ...p,
      actual,
      pass: actual !== null && actual === p.expected,
      missing: actual === null,
    };
  });
}

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

async function fetchHtml(url) {
  const res = await fetch(url, {
    redirect: "manual",
    headers: { "Accept-Encoding": "gzip, deflate, br", "User-Agent": "hero-copy-qa/1.0" },
  });
  // Lovable preview hosts (id-preview--*.lovable.app) require auth — they
  // 302-redirect anonymous requests to /auth-bridge. We cannot verify from
  // a script; surface this so the operator does the check in the browser.
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location") || "";
    if (location.includes("/auth-bridge")) {
      const err = new Error("Login required (auth-bridge redirect)");
      err.requiresLogin = true;
      throw err;
    }
    throw new Error(`Unexpected redirect ${res.status} → ${location}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function runChecks(html) {
  return CHECKS.map((check) => ({
    ...check,
    pass: html.includes(check.value),
  }));
}

/**
 * Run preflight + substring checks against every target. Returns a
 * structured per-target summary so watch mode can diff results between runs.
 * Side-effect: prints a human-readable report to stdout.
 */
async function runOnce() {
  console.log(`${BOLD}Home hero copy localization QA${RESET}`);
  console.log(`${DIM}Source of truth: src/content/hero-copy.ts${RESET}\n`);

  const summary = [];
  let totalFailures = 0;
  let manualChecks = 0;

  for (const target of TARGETS) {
    console.log(`${BOLD}${target.name}${RESET} ${DIM}${target.url}${RESET}`);
    let html;
    try {
      html = await fetchHtml(target.url);
    } catch (err) {
      if (err.requiresLogin) {
        console.log(
          `  ${BOLD}⚠ MANUAL CHECK REQUIRED${RESET} — preview is auth-gated; open the URL in a logged-in browser and visually verify each line below:`,
        );
        for (const c of CHECKS) {
          console.log(`    ${DIM}• ${c.label.padEnd(20)} "${c.value}"${RESET}`);
        }
        console.log("");
        manualChecks++;
        summary.push({ target: target.name, status: "manual", driftKeys: [] });
        continue;
      }
      console.log(`  ${RED}✗ Fetch failed: ${err.message}${RESET}\n`);
      totalFailures++;
      summary.push({ target: target.name, status: "fetch_failed", driftKeys: [] });
      continue;
    }

    // Preflight: rendered runtime strings must equal source-of-truth.
    console.log(`  ${DIM}Preflight — runtime strings vs src/content/hero-copy.ts${RESET}`);
    const preflight = runPreflight(html);
    const probeFound = preflight.some((p) => !p.missing);
    const driftKeys = [];
    if (!probeFound) {
      console.log(
        `    ${RED}✗ No data-hero-* probe attributes found in served HTML — cannot verify runtime parity.${RESET}`,
      );
      totalFailures++;
      driftKeys.push("__no_probe__");
    } else {
      for (const p of preflight) {
        if (p.pass) {
          console.log(`    ${GREEN}✓${RESET} ${p.attr.padEnd(24)} matches source-of-truth`);
        } else if (p.missing) {
          console.log(
            `    ${RED}✗${RESET} ${p.attr.padEnd(24)} ${RED}attribute missing from rendered HTML${RESET}`,
          );
          totalFailures++;
          driftKeys.push(p.key);
        } else {
          console.log(`    ${RED}✗${RESET} ${p.attr.padEnd(24)} ${RED}DRIFT${RESET}`);
          console.log(`        expected: ${DIM}"${p.expected}"${RESET}`);
          console.log(`        runtime:  ${DIM}"${p.actual}"${RESET}`);
          totalFailures++;
          driftKeys.push(p.key);
        }
      }
    }

    console.log(`  ${DIM}Substring checks — exact strings present in served HTML${RESET}`);
    const results = runChecks(html);
    for (const r of results) {
      const icon = r.pass ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
      const status = r.pass ? "" : `  ${RED}MISSING${RESET}`;
      console.log(`    ${icon} ${r.label.padEnd(20)} ${DIM}"${r.value}"${RESET}${status}`);
      if (!r.pass) totalFailures++;
    }
    console.log("");

    summary.push({
      target: target.name,
      status: driftKeys.length > 0 ? "drift" : "ok",
      driftKeys,
    });
  }

  return { summary, totalFailures, manualChecks };
}

const WATCH = CLI.watch;

if (!WATCH) {
  const { totalFailures, manualChecks } = await runOnce();
  if (totalFailures > 0) {
    console.log(`${RED}${BOLD}✗ ${totalFailures} check(s) failed — do not release.${RESET}`);
    process.exit(1);
  } else if (manualChecks > 0) {
    console.log(
      `${GREEN}${BOLD}✓ Production verified.${RESET} ${BOLD}${manualChecks} target(s) need manual visual check before release.${RESET}`,
    );
    process.exit(0);
  } else {
    console.log(`${GREEN}${BOLD}✓ All hero copy verified across preview and production.${RESET}`);
    process.exit(0);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Watch mode: rerun preflight whenever any source file that affects rendered
// hero copy changes locally. Highlights drift transitions vs the previous run.
// ─────────────────────────────────────────────────────────────────────────────

import { watch as fsWatch } from "node:fs";
import { resolve as resolvePath, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolvePath(__dirname, "..");

// Files whose contents could change what gets rendered into the live hero.
// We watch the source-of-truth and the route that consumes it; together they
// cover every realistic local change that would introduce drift.
const WATCHED_FILES = [
  "src/content/hero-copy.ts",
  "src/routes/index.tsx",
].map((p) => resolvePath(projectRoot, p));

const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

function fmtTimestamp() {
  return new Date().toLocaleTimeString();
}

function diffSummaries(prev, curr) {
  // Returns transitions per target so we can call out NEW DRIFT vs RESOLVED.
  const transitions = [];
  for (const c of curr) {
    const p = prev?.find((x) => x.target === c.target);
    if (!p) continue;
    const prevKeys = new Set(p.driftKeys);
    const currKeys = new Set(c.driftKeys);
    const newDrift = [...currKeys].filter((k) => !prevKeys.has(k));
    const resolved = [...prevKeys].filter((k) => !currKeys.has(k));
    if (newDrift.length || resolved.length || p.status !== c.status) {
      transitions.push({ target: c.target, prev: p, curr: c, newDrift, resolved });
    }
  }
  return transitions;
}

function printTransitions(transitions) {
  if (transitions.length === 0) {
    console.log(`${DIM}No change vs previous run.${RESET}\n`);
    return;
  }
  console.log(`${BOLD}${CYAN}═══ Drift transitions since previous run ═══${RESET}`);
  for (const t of transitions) {
    const arrow = `${DIM}${t.prev.status} → ${t.curr.status}${RESET}`;
    if (t.curr.status === "drift" && t.prev.status !== "drift") {
      console.log(
        `  ${RED}${BOLD}● NEW DRIFT${RESET} on ${BOLD}${t.target}${RESET} (${arrow})`,
      );
    } else if (t.curr.status === "ok" && t.prev.status === "drift") {
      console.log(
        `  ${GREEN}${BOLD}● RESOLVED${RESET} on ${BOLD}${t.target}${RESET} (${arrow})`,
      );
    } else {
      console.log(`  ${YELLOW}● CHANGED${RESET} on ${BOLD}${t.target}${RESET} (${arrow})`);
    }
    if (t.newDrift.length) {
      console.log(`      ${RED}+ now drifting:${RESET} ${t.newDrift.join(", ")}`);
    }
    if (t.resolved.length) {
      console.log(`      ${GREEN}- now resolved:${RESET} ${t.resolved.join(", ")}`);
    }
  }
  console.log("");
}

let previousSummary = null;
let running = false;
let pending = false;

async function tick(reason) {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  console.clear();
  console.log(
    `${DIM}[${fmtTimestamp()}]${RESET} ${BOLD}qa:hero-copy --watch${RESET} ${DIM}(${reason})${RESET}\n`,
  );
  try {
    const { summary } = await runOnce();
    const transitions = diffSummaries(previousSummary, summary);
    printTransitions(transitions);
    previousSummary = summary;
  } catch (err) {
    console.log(`${RED}Run failed: ${err.message}${RESET}\n`);
  }
  console.log(`${DIM}Watching ${WATCHED_FILES.length} file(s). Press Ctrl-C to exit.${RESET}`);
  running = false;
  if (pending) {
    pending = false;
    setTimeout(() => tick("queued change"), 50);
  }
}

// Debounce bursty fs events (editors often emit several events per save).
// Interval is configurable via --debounce=<ms> (default 200).
let debounceTimer = null;
function scheduleTick(reason) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => tick(reason), CLI.debounceMs);
}

for (const file of WATCHED_FILES) {
  try {
    fsWatch(file, () => scheduleTick(`changed: ${file.replace(projectRoot + "/", "")}`));
  } catch (err) {
    console.log(`${YELLOW}⚠ Could not watch ${file}: ${err.message}${RESET}`);
  }
}

await tick("initial run");

