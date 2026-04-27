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

console.log(`${BOLD}Home hero copy localization QA${RESET}`);
console.log(`${DIM}Source of truth: src/content/hero-copy.ts${RESET}\n`);

for (const target of TARGETS) {
  console.log(`${BOLD}${target.name}${RESET} ${DIM}${target.url}${RESET}`);
  let html;
  try {
    html = await fetchHtml(target.url);
  } catch (err) {
    console.log(`  ${RED}✗ Fetch failed: ${err.message}${RESET}\n`);
    totalFailures++;
    continue;
  }

  const results = runChecks(html);
  for (const r of results) {
    const icon = r.pass ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
    const status = r.pass ? "" : `  ${RED}MISSING${RESET}`;
    console.log(`  ${icon} ${r.label.padEnd(20)} ${DIM}"${r.value}"${RESET}${status}`);
    if (!r.pass) totalFailures++;
  }
  console.log("");
}

if (totalFailures > 0) {
  console.log(`${RED}${BOLD}✗ ${totalFailures} check(s) failed — do not release.${RESET}`);
  process.exit(1);
} else {
  console.log(`${GREEN}${BOLD}✓ All hero copy verified across preview and production.${RESET}`);
  process.exit(0);
}
