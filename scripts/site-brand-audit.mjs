#!/usr/bin/env node
/**
 * Site-wide brand contrast & hex consistency audit.
 *
 * Scans every text-bearing source file in src/components/ and src/routes/
 * (skipping the shadcn/ui primitives in src/components/ui/, generated files,
 * and tests) and:
 *
 *   1) Finds every literal hex code (#rgb / #rrggbb).
 *   2) Auto-rewrites any literal that exactly matches an approved brand
 *      color to the canonical CSS variable form. The rewriter is shape-
 *      aware so it only touches hex literals — never partial substrings of
 *      other tokens — and chooses the right wrapper for the surrounding
 *      syntax (Tailwind arbitrary values, plain CSS, JS string).
 *   3) Reports any remaining unknown hexes (potential brand drift).
 *   4) Runs WCAG contrast checks on the canonical chrome pairs (charcoal
 *      text on white, teal hover on white, ivory on teal, gold on teal,
 *      charcoal-soft frame on white). Fails the build if any AA pair
 *      drops below threshold.
 *
 * Wire into predev/prebuild alongside the existing brand-audit.mjs and
 * check-route-imports.mjs.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, resolve, dirname, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = join(ROOT, "src");

const APPROVED = {
  teal: "#295B61",
  "teal-2": "#2A7C82",
  gold: "#C9A96A",
  "gold-soft": "#E1CFA6",
  ivory: "#FAF8F3",
  sand: "#F4EFE7",
  charcoal: "#2E2E2E",
  "charcoal-soft": "#6B6B6B",
  "charcoal-deep": "#1F1F1F",
};
const HEX_TO_TOKEN = Object.fromEntries(
  Object.entries(APPROVED).map(([k, v]) => [v.toLowerCase(), k]),
);
// Pure neutrals + framework defaults that aren't brand drift.
const NEUTRAL_ALLOW = new Set([
  "#fff",
  "#ffffff",
  "#000",
  "#000000",
  "#1f1f1f", // matches --charcoal-deep, neutral-equivalent
  "#ccc",
]);

const SCAN_DIRS = [join(SRC, "components"), join(SRC, "routes")];
const SKIP_DIRS = new Set(["ui", "generated", "node_modules"]);
const SKIP_FILES = new Set(["routeTree.gen.ts"]);
const EXTS = new Set([".tsx", ".ts", ".css"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (
      EXTS.has(extname(p)) &&
      !SKIP_FILES.has(name) &&
      !name.endsWith(".test.ts") &&
      !name.endsWith(".test.tsx")
    ) {
      out.push(p);
    }
  }
  return out;
}

function normalize(hex) {
  let h = hex.toLowerCase();
  if (h.length === 4) h = "#" + h.slice(1).split("").map((c) => c + c).join("");
  return h;
}

// ── color math ──────────────────────────────────────────────────────────
function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function srgbToLin(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function relLum(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [L1, L2] = [relLum(a), relLum(b)].sort((x, y) => y - x);
  return (L1 + 0.05) / (L2 + 0.05);
}
function composite(fgHex, alpha, bgHex) {
  const [fr, fg, fb] = hexToRgb(fgHex);
  const [br, bg, bb] = hexToRgb(bgHex);
  const mix = (f, b) => Math.round(f * alpha + b * (1 - alpha));
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return "#" + toHex(mix(fr, br)) + toHex(mix(fg, bg)) + toHex(mix(fb, bb));
}

// ── rewriter ────────────────────────────────────────────────────────────
// A hex literal can appear in three shapes we care about:
//   (a) inside a Tailwind arbitrary value, e.g. text-[#295B61] or border-[#C9A96A]/40
//       → rewrite to text-[color:var(--teal)] (preserving the optional /alpha).
//   (b) inside a CSS file as a property value or color-mix() arg
//       → rewrite to var(--teal).
//   (c) inside a JS/TS string or object literal
//       → rewrite to "var(--teal)".
// We classify by looking at the immediate left context of the hex.
function rewriteFile(text, ext) {
  const fixes = [];
  // Files marked with `brand-audit-ignore-file` are reference docs (e.g. the
  // brand QA page) where literal hexes are the source of truth.
  if (text.includes("brand-audit-ignore-file")) return { text, fixes };

  const re = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    const norm = normalize(raw);
    out += text.slice(last, m.index);
    last = m.index + raw.length;

    const token = HEX_TO_TOKEN[norm];
    if (!token) {
      out += raw;
      continue;
    }

    // Look back ~120 chars to classify the surrounding context.
    const left = text.slice(Math.max(0, m.index - 120), m.index);

    // Skip hexes that already live inside a var(--token, #fallback) — those
    // are intentional fallbacks; rewriting them to a nested var() corrupts
    // the call. Detect by finding an unclosed `var(` to the left.
    const lastVar = left.lastIndexOf("var(");
    const lastVarClose = left.lastIndexOf(")");
    if (lastVar > lastVarClose) {
      out += raw;
      continue;
    }

    // Tailwind arbitrary value: an unclosed `[` to the left of the hex means
    // we're inside `text-[...]` / `bg-[...]` etc. Use `color:var(--token)`.
    const lastBracket = left.lastIndexOf("[");
    const lastClose = left.lastIndexOf("]");
    const inTwArbitrary = lastBracket > lastClose;

    out += inTwArbitrary ? `color:var(--${token})` : `var(--${token})`;
    fixes.push({ raw, token, index: m.index });
  }
  out += text.slice(last);
  return { text: out, fixes };
}

// ── scan + rewrite ──────────────────────────────────────────────────────
const files = SCAN_DIRS.flatMap((d) => walk(d));
const fileFixes = [];
const remainingUnknowns = [];
let totalRewrites = 0;

for (const file of files) {
  const original = readFileSync(file, "utf8");
  const { text, fixes } = rewriteFile(original, extname(file));
  if (fixes.length) {
    writeFileSync(file, text);
    fileFixes.push({ file: relative(ROOT, file), fixes });
    totalRewrites += fixes.length;
  }
  // Re-scan post-rewrite for any remaining hex that isn't allow-listed.
  // Skip ignore-marked reference files (e.g. brand-qa palette).
  const post = readFileSync(file, "utf8");
  if (post.includes("brand-audit-ignore-file")) continue;
  const re = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  let mm;
  while ((mm = re.exec(post)) !== null) {
    const norm = normalize(mm[0]);
    if (HEX_TO_TOKEN[norm] || NEUTRAL_ALLOW.has(norm)) continue;
    remainingUnknowns.push({ file: relative(ROOT, file), hex: mm[0] });
  }
}

// ── WCAG pairs (canonical chrome) ───────────────────────────────────────
const WHITE = "#FFFFFF";
const CHARCOAL_15_ON_WHITE = composite(APPROVED.charcoal, 0.15, WHITE);
const pairs = [
  { name: "Charcoal text on white", fg: APPROVED.charcoal, bg: WHITE, min: 4.5 },
  { name: "Charcoal-soft muted on white", fg: APPROVED["charcoal-soft"], bg: WHITE, min: 4.5 },
  { name: "Teal hover/active on white", fg: APPROVED.teal, bg: WHITE, min: 4.5 },
  { name: "Ivory text on teal surface", fg: APPROVED.ivory, bg: APPROVED.teal, min: 4.5 },
  { name: "Ivory text on charcoal-deep (footer)", fg: APPROVED.ivory, bg: APPROVED["charcoal-deep"], min: 4.5 },
  { name: "Charcoal text on ivory page bg", fg: APPROVED.charcoal, bg: APPROVED.ivory, min: 4.5 },
  { name: "Charcoal text on sand surface", fg: APPROVED.charcoal, bg: APPROVED.sand, min: 4.5 },
  // Non-text decorative frames — WCAG 1.4.11 needs ≥ 3:1 for actionable controls.
  { name: "Hamburger frame (charcoal-soft) on white", fg: APPROVED["charcoal-soft"], bg: WHITE, min: 3.0 },
  { name: "Gold frame on teal (CTA accent)", fg: APPROVED.gold, bg: APPROVED.teal, min: 3.0 },
  { name: "Header divider hairline (charcoal/15) on white", fg: CHARCOAL_15_ON_WHITE, bg: WHITE, min: 1.3 },
];
const results = pairs.map((p) => ({ ...p, ratio: contrast(p.fg, p.bg) }));

// ── report ──────────────────────────────────────────────────────────────
console.log("\n── Site-wide brand & contrast audit ────────────────────\n");
console.log(`Scanned ${files.length} component/route files.\n`);

if (fileFixes.length === 0) {
  console.log("Hex → token rewrites: ✓ none needed (all brand colors already use vars)\n");
} else {
  console.log(`Hex → token rewrites (${totalRewrites} total):`);
  for (const f of fileFixes) {
    console.log(`  ${f.file}`);
    for (const x of f.fixes) console.log(`    ✎ ${x.raw}  →  var(--${x.token})`);
  }
  console.log("");
}

if (remainingUnknowns.length) {
  console.log("Unknown literal hexes (review — not in palette, not allow-listed):");
  for (const u of remainingUnknowns) console.log(`  ⚠ ${u.file}  ${u.hex}`);
  console.log("");
}

console.log("WCAG contrast pairs:");
let failed = 0;
for (const r of results) {
  const ok = r.ratio >= r.min;
  if (!ok) failed++;
  console.log(
    `  ${ok ? "✓" : "✘"} ${r.name.padEnd(52)} ${r.ratio.toFixed(2)}:1  (min ${r.min})`,
  );
}
console.log("");

if (failed > 0) {
  console.error(`✘ ${failed} contrast pair(s) below AA threshold.\n`);
  process.exit(1);
}
console.log(
  `✓ Audit clean — ${totalRewrites} rewrite${totalRewrites === 1 ? "" : "s"} applied across ${fileFixes.length} file${fileFixes.length === 1 ? "" : "s"}, all contrast pairs pass.\n`,
);
