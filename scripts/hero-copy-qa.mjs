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

const TARGETS = [
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

let totalFailures = 0;
let manualChecks = 0;

console.log(`${BOLD}Home hero copy localization QA${RESET}`);
console.log(`${DIM}Source of truth: src/content/hero-copy.ts${RESET}\n`);

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
      continue;
    }
    console.log(`  ${RED}✗ Fetch failed: ${err.message}${RESET}\n`);
    totalFailures++;
    continue;
  }

  // Preflight: rendered runtime strings must equal source-of-truth.
  console.log(`  ${DIM}Preflight — runtime strings vs src/content/hero-copy.ts${RESET}`);
  const preflight = runPreflight(html);
  const probeFound = preflight.some((p) => !p.missing);
  if (!probeFound) {
    console.log(
      `    ${RED}✗ No data-hero-* probe attributes found in served HTML — cannot verify runtime parity.${RESET}`,
    );
    totalFailures++;
  } else {
    for (const p of preflight) {
      if (p.pass) {
        console.log(`    ${GREEN}✓${RESET} ${p.attr.padEnd(24)} matches source-of-truth`);
      } else if (p.missing) {
        console.log(
          `    ${RED}✗${RESET} ${p.attr.padEnd(24)} ${RED}attribute missing from rendered HTML${RESET}`,
        );
        totalFailures++;
      } else {
        console.log(`    ${RED}✗${RESET} ${p.attr.padEnd(24)} ${RED}DRIFT${RESET}`);
        console.log(`        expected: ${DIM}"${p.expected}"${RESET}`);
        console.log(`        runtime:  ${DIM}"${p.actual}"${RESET}`);
        totalFailures++;
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
}

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
