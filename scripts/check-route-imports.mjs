#!/usr/bin/env node
/**
 * Component resolution check.
 *
 * Scans every route file in `src/routes/` for local imports (paths starting
 * with `@/` or `./`/`../`) and verifies the target file exists on disk with
 * a recognized extension. Fails fast with a clear error if any import cannot
 * be resolved — e.g. `index.tsx` references `HeroYesConfirmation.tsx` but
 * that file no longer exists.
 *
 * Runs as part of `predev` and `prebuild`.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ROUTES_DIR = join(ROOT, "src", "routes");
const SRC_DIR = join(ROOT, "src");
const EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".json", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|jsx?)$/.test(entry)) out.push(full);
  }
  return out;
}

function resolveImport(spec, fromFile) {
  let basePath;
  if (spec.startsWith("@/")) basePath = join(SRC_DIR, spec.slice(2));
  else if (spec.startsWith("./") || spec.startsWith("../")) basePath = resolve(dirname(fromFile), spec);
  else return { skipped: true };

  // Strip query/hash (e.g. `?url`, `?raw`)
  basePath = basePath.replace(/[?#].*$/, "");

  if (extname(basePath) && existsSync(basePath)) return { ok: true, resolved: basePath };
  for (const ext of EXTS) {
    if (existsSync(basePath + ext)) return { ok: true, resolved: basePath + ext };
  }
  for (const ext of EXTS) {
    const idx = join(basePath, "index" + ext);
    if (existsSync(idx)) return { ok: true, resolved: idx };
  }
  return { ok: false };
}

const IMPORT_RE = /(?:^|\n)\s*import\s+(?:[^"';]+?\s+from\s+)?["']([^"']+)["']/g;

const errors = [];
const files = walk(ROUTES_DIR);
for (const file of files) {
  const src = readFileSync(file, "utf8");
  let m;
  while ((m = IMPORT_RE.exec(src)) !== null) {
    const spec = m[1];
    const res = resolveImport(spec, file);
    if (res.skipped || res.ok) continue;
    errors.push({ file: file.replace(ROOT + "/", ""), spec });
  }
}

if (errors.length) {
  console.error("\n✘ Component resolution check failed — unresolved local imports in routes:\n");
  for (const e of errors) console.error(`  • ${e.file} → "${e.spec}"  (file does not exist)`);
  console.error("\nFix: remove the import or create the missing file.\n");
  process.exit(1);
}

console.log(`✓ Route imports OK (${files.length} route file${files.length === 1 ? "" : "s"} scanned)`);
