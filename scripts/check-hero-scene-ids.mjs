#!/usr/bin/env node
/**
 * Hero scene-id sync check.
 *
 * Guarantees that the cinematic hero is internally consistent across the
 * three files that depend on shared scene ids:
 *
 *   1. src/content/hero-scenes-manifest.ts   — source of truth for ids,
 *      visuals, copy, credits.
 *   2. src/content/hero-scene-variants.ts    — per-variant copy overrides
 *      keyed by scene id (control + experimental challengers).
 *   3. (optional) src/routes/index.tsx       — does not key by id but the
 *      CTA gate is index-based, so just exercising the import is enough.
 *
 * Failure modes prevented:
 *   • A manifest scene gets renamed (e.g. "action" → "confirm") but a
 *     variant block still references the old id, silently dropping the
 *     override and shipping control copy on a slide where the experiment
 *     was supposed to run.
 *   • A variant adds a scene id that doesn't exist in the manifest, so
 *     the override never renders but logs a phantom A/B exposure under
 *     a non-existent slide.
 *   • Two manifest entries collide on the same id, breaking the analytics
 *     join key in `hero_ab_events`.
 *
 * Hard-fails with exit code 1 if any drift is detected. Wired into
 * `prebuild` (and run in CI) so a mismatched commit can't reach prod.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MANIFEST_PATH = resolve(ROOT, "src/content/hero-scenes-manifest.ts");
const VARIANTS_PATH = resolve(ROOT, "src/content/hero-scene-variants.ts");

function fail(msg) {
  console.error(`\n✖ hero-scene-id check failed:\n  ${msg}\n`);
  process.exit(1);
}

function ok(msg) {
  console.log(`✓ hero-scene-id check: ${msg}`);
}

/**
 * Extract the array of scene ids from the manifest by parsing the
 * `id: "..."` lines inside the HERO_SCENES literal. We avoid importing
 * the TS module at build time because this script must run before Vite
 * is invoked (and therefore before any TS transform is set up).
 */
function readManifestIds() {
  const src = readFileSync(MANIFEST_PATH, "utf8");
  const blockMatch = src.match(/HERO_SCENES[^=]*=\s*\[([\s\S]*?)\]\s*as const/);
  if (!blockMatch) {
    fail(`Could not locate the HERO_SCENES array literal in ${MANIFEST_PATH}.`);
  }
  const ids = [...blockMatch[1].matchAll(/^\s*id:\s*"([^"]+)"/gm)].map((m) => m[1]);
  if (ids.length === 0) {
    fail(`No scene ids found inside HERO_SCENES in ${MANIFEST_PATH}.`);
  }
  return ids;
}

/**
 * Extract the per-variant scene-id keys from the variants file. We read
 * every challenger variant block (anything other than the "control"
 * variant, whose scenes are derived programmatically from the manifest
 * via `controlScenes` and therefore can never drift).
 *
 * Each variant looks like:
 *   {
 *     id: "benefit",
 *     hypothesis: "...",
 *     scenes: {
 *       arrival: { ... },
 *       discovery: { ... },
 *       ...
 *     },
 *   }
 *
 * We collect the keys of every `scenes: { ... }` block whose surrounding
 * variant id is NOT "control".
 */
function readVariantSceneKeys() {
  const src = readFileSync(VARIANTS_PATH, "utf8");
  // Match every variant object: id followed eventually by a `scenes: { ... }`.
  // We use a depth-counting parse to find the matching brace of each scenes
  // block because regex alone can't reliably handle nested braces.
  const variants = [];
  const idRe = /id:\s*"([^"]+)"\s*,[\s\S]*?scenes:\s*\{/g;
  let m;
  while ((m = idRe.exec(src)) !== null) {
    const variantId = m[1];
    const scenesStart = idRe.lastIndex; // position just after the opening `{`
    let depth = 1;
    let i = scenesStart;
    while (i < src.length && depth > 0) {
      const ch = src[i];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      i++;
    }
    if (depth !== 0) {
      fail(`Unbalanced braces while parsing variant "${variantId}" scenes in ${VARIANTS_PATH}.`);
    }
    const scenesBody = src.slice(scenesStart, i - 1);
    // Top-level keys inside the scenes block: identifiers OR quoted strings,
    // followed by `:`. We only want top-level (depth 1 inside scenesBody).
    const keys = [];
    let d = 0;
    let buf = "";
    for (let j = 0; j < scenesBody.length; j++) {
      const ch = scenesBody[j];
      if (ch === "{") d++;
      else if (ch === "}") d--;
      if (d === 0) buf += ch;
    }
    // Match either `foo:` or `"foo":` at the start of a line (after ws/comma).
    const keyRe = /(?:^|[,{\s])\s*(?:"([a-zA-Z0-9_-]+)"|([a-zA-Z_][a-zA-Z0-9_-]*))\s*:\s*\{/g;
    let km;
    while ((km = keyRe.exec(buf)) !== null) {
      keys.push(km[1] ?? km[2]);
    }
    variants.push({ variantId, keys });
  }
  // Drop the implicit `control` variant — it never declares per-scene
  // overrides inline, it's derived from the manifest. If it shows up here
  // it's still fine to validate, but we don't want it to cause noise.
  return variants;
}

function checkDuplicates(ids) {
  const seen = new Set();
  const dupes = new Set();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  if (dupes.size > 0) {
    fail(
      `Duplicate scene ids in HERO_SCENES: ${[...dupes].join(", ")}. ` +
        `Each scene id is used as the analytics join key — must be unique.`,
    );
  }
}

function checkVariantsAgainstManifest(manifestIds, variants) {
  const manifestSet = new Set(manifestIds);
  for (const { variantId, keys } of variants) {
    if (variantId === "control") continue;
    if (keys.length === 0) {
      // Variant declares no per-scene overrides — that's allowed (falls
      // back entirely to control), so skip.
      continue;
    }
    const orphaned = keys.filter((k) => !manifestSet.has(k));
    if (orphaned.length > 0) {
      fail(
        `Variant "${variantId}" references scene ids not found in the manifest: ` +
          `${orphaned.join(", ")}. ` +
          `Either rename the override key to match HERO_SCENES, or remove the block.`,
      );
    }
    const missing = manifestIds.filter((id) => !keys.includes(id));
    if (missing.length > 0) {
      fail(
        `Variant "${variantId}" is missing overrides for scene ids: ` +
          `${missing.join(", ")}. ` +
          `Every challenger variant must declare copy for every manifest scene so ` +
          `users in that variant don't see a mix of control + challenger lines.`,
      );
    }
  }
}

const manifestIds = readManifestIds();
checkDuplicates(manifestIds);
const variants = readVariantSceneKeys();
checkVariantsAgainstManifest(manifestIds, variants);

ok(
  `manifest=[${manifestIds.join(", ")}] · variants=${variants
    .map((v) => `${v.variantId}(${v.keys.length})`)
    .join(", ")}`,
);
