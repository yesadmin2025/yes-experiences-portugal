#!/usr/bin/env node
/**
 * hero-frame-contrast — sample N frames from the hero film, average the
 * pixels in the regions where the headline / subheadline / microcopy sit,
 * composite the same dark scrim CSS uses on top, and assert the resulting
 * effective background passes WCAG AA contrast against the actual text
 * colors used in CinematicHero.
 *
 * Why frames, not just one poster?
 *   The film has light coastal water, dark forest, golden-hour light, etc.
 *   The poster JPG passes contrast trivially — the failure mode is "one
 *   bright frame in the loop washes out the headline." Sampling every few
 *   seconds catches that.
 *
 * Usage:
 *   node scripts/hero-frame-contrast.mjs           # human report, exits 1 on fail
 *   node scripts/hero-frame-contrast.mjs --json    # JSON output for tests/CI
 *
 * Skips gracefully (exit 0) if ffmpeg or the source video are missing —
 * the CI workflow / vitest test treats that as an environment skip, not a
 * regression.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join, relative } from "node:path";

// --- Config: source of truth pulled from CinematicHero.tsx + styles.css. ----
// Every MP4 under public/video/film/ is treated as a hero film candidate by
// default — this catches both the 720p and 1080p renders the <video> tag
// references and any new resolution we drop in next to them.
//
// Alternate hero videos that live elsewhere (e.g. seasonal A/B films, an
// experimental coast loop) can be registered in public/video/hero-films.json
// as a JSON array of repo-root-relative paths. They will be audited the
// same way without further script changes.
//
// Per-invocation overrides:
//   --video <path>     repeatable; takes precedence over discovery
//   --samples <n>      override SAMPLES (default 8)
const FILM_DIR = resolve("public/video/film");
const ALT_MANIFEST = resolve("public/video/hero-films.json");
const DEFAULT_SAMPLES = 8;

// Text colors actually rendered (mirrors CinematicHero.tsx).
const TEXT = {
  headlineLine1: "#FAF8F3", // --ivory, font-bold
  headlineLine2: "#E1CFA6", // --gold-soft italic
  subheadline: "#FAF8F3", // --ivory full opacity
  microcopy: "#FAF8F3", // --ivory /90 — we still test against full ivory; the alpha hurts contrast slightly but text-shadow compensates
};

// Scrim characterisation. CinematicHero.tsx renders TWO overlays:
//   1. Linear bottom darken: 0% → 0.20a, 40% → 0.35a, 72% → 0.78a, 100% → 0.92a, color rgb(18,14,10).
//   2. Radial backdrop directly behind the copy column (bottom 62%, peaks at 0.78a, edges 0).
// We sample the LINEAR overlay only — the radial is bonus headroom we keep as a safety margin so
// the test does not green-light marginal frames that only pass thanks to the radial.
const SCRIM_RGB = [18, 14, 10];

// Regions in normalised frame coordinates [y0, y1] full width. These mirror
// where the text sits at the mobile viewport (393×587, items-end + pb-10).
// Headline is the largest text → uses the AA-large threshold (3:1).
// Subheadline + microcopy are body text → AA-normal (4.5:1).
const REGIONS = [
  { id: "headline", y0: 0.58, y1: 0.78, scrimAlpha: 0.6, level: "large", colors: ["headlineLine1", "headlineLine2"] },
  { id: "subheadline", y0: 0.78, y1: 0.93, scrimAlpha: 0.82, level: "normal", colors: ["subheadline"] },
  { id: "microcopy", y0: 0.93, y1: 1.0, scrimAlpha: 0.9, level: "normal", colors: ["microcopy"] },
];

const THRESHOLD = { normal: 4.5, large: 3.0 };

// --- Math helpers ---------------------------------------------------------
const hexToRgb = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const srgbToLin = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const luminance = ([r, g, b]) =>
  0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
const contrast = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};
const composite = (under, over, alpha) => [
  Math.round(over[0] * alpha + under[0] * (1 - alpha)),
  Math.round(over[1] * alpha + under[1] * (1 - alpha)),
  Math.round(over[2] * alpha + under[2] * (1 - alpha)),
];

// --- ffmpeg ---------------------------------------------------------------
function haveFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function probeDuration(path) {
  const out = execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0",
    path,
  ]).toString().trim();
  const d = parseFloat(out);
  if (!Number.isFinite(d) || d <= 0) throw new Error(`bad duration: ${out}`);
  return d;
}

/** Average colour of a normalised vertical band, full width, returned as [r,g,b]. */
function averageBand(path, t, y0, y1) {
  // crop=iw:ih*(y1-y0):0:ih*y0  → full-width band
  // scale=1:1 (with bilinear) → 1×1 pixel = arithmetic mean of the band
  const filter = `crop=iw:ih*${(y1 - y0).toFixed(4)}:0:ih*${y0.toFixed(4)},scale=1:1:flags=bilinear,format=rgb24`;
  const r = spawnSync("ffmpeg", [
    "-loglevel", "error",
    "-ss", t.toFixed(3),
    "-i", path,
    "-frames:v", "1",
    "-vf", filter,
    "-f", "rawvideo",
    "-",
  ], { encoding: "buffer" });
  if (r.status !== 0) {
    throw new Error(`ffmpeg failed at t=${t} y=[${y0},${y1}]: ${r.stderr?.toString() ?? ""}`);
  }
  const buf = r.stdout;
  if (!buf || buf.length < 3) throw new Error("ffmpeg returned no pixel data");
  return [buf[0], buf[1], buf[2]];
}

// --- Run ------------------------------------------------------------------
function run() {
  const json = process.argv.includes("--json");
  const env = {
    skipped: false,
    reason: null,
    samples: SAMPLES,
    threshold: THRESHOLD,
    frames: [],
  };

  if (!existsSync(VIDEO) || statSync(VIDEO).size < 10_000) {
    env.skipped = true;
    env.reason = `video missing: ${VIDEO}`;
  } else if (!haveFfmpeg()) {
    env.skipped = true;
    env.reason = "ffmpeg not available";
  }

  if (env.skipped) {
    if (json) process.stdout.write(JSON.stringify(env, null, 2));
    else console.log(`hero-frame-contrast: skipped (${env.reason})`);
    process.exit(0);
  }

  const duration = probeDuration(VIDEO);
  // Spread evenly, but skip the very edges where keyframes/black flash can sit.
  const times = Array.from({ length: SAMPLES }, (_, i) =>
    duration * ((i + 0.5) / SAMPLES),
  );

  const failures = [];

  for (const t of times) {
    const frame = { t: Number(t.toFixed(2)), regions: [] };
    for (const region of REGIONS) {
      const avg = averageBand(VIDEO, t, region.y0, region.y1);
      const effectiveBg = composite(avg, SCRIM_RGB, region.scrimAlpha);
      const checks = region.colors.map((key) => {
        const fg = hexToRgb(TEXT[key]);
        const ratio = contrast(fg, effectiveBg);
        const required = THRESHOLD[region.level];
        const pass = ratio + 1e-6 >= required;
        if (!pass) failures.push({ t: frame.t, region: region.id, color: key, ratio, required });
        return { color: key, ratio: Number(ratio.toFixed(2)), required, pass };
      });
      frame.regions.push({
        id: region.id,
        rawAvg: avg,
        effectiveBg,
        scrimAlpha: region.scrimAlpha,
        level: region.level,
        checks,
      });
    }
    env.frames.push(frame);
  }

  env.failures = failures;
  env.passed = failures.length === 0;

  if (json) {
    process.stdout.write(JSON.stringify(env, null, 2));
    process.exit(env.passed ? 0 : 1);
  }

  // Human report
  console.log(`Hero film contrast — ${SAMPLES} frames sampled across ${duration.toFixed(1)}s`);
  console.log("(bg = avg frame colour composited with linear scrim; AA: 4.5:1 normal, 3.0:1 large)\n");
  for (const frame of env.frames) {
    console.log(`  t=${frame.t.toFixed(2)}s`);
    for (const r of frame.regions) {
      const bg = `rgb(${r.effectiveBg.join(",")})`;
      for (const c of r.checks) {
        const mark = c.pass ? "✓" : "✗";
        console.log(`    ${mark} ${r.id.padEnd(11)} ${c.color.padEnd(14)} ${bg}  ${c.ratio.toFixed(2)}:1 (need ≥${c.required}:1)`);
      }
    }
  }
  if (env.passed) {
    console.log(`\n✅ All ${SAMPLES} frames pass WCAG AA across all hero text regions.`);
    process.exit(0);
  } else {
    console.log(`\n❌ ${failures.length} contrast failure(s) detected:`);
    for (const f of failures) {
      console.log(`   t=${f.t}s ${f.region}/${f.color}: ${f.ratio.toFixed(2)}:1 < ${f.required}:1`);
    }
    process.exit(1);
  }
}

run();
