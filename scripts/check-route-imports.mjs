#!/usr/bin/env node
/**
 * Component resolution + dead import check.
 *
 * For every file in `src/routes/`:
 *   1. Resolves each local import (`@/...`, `./...`, `../...`) against the
 *      filesystem. Hard-fails if a target file does not exist (e.g. a stale
 *      `HeroYesConfirmation.tsx` reference).
 *   2. Parses the import clause to collect the local binding names (default,
 *      namespace, and named/aliased specifiers) and warns if any binding is
 *      never referenced in the file body. Side-effect-only imports
 *      (`import "./x.css"`) are ignored.
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
const EXTS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".json",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".gif",
];

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
  else if (spec.startsWith("./") || spec.startsWith("../"))
    basePath = resolve(dirname(fromFile), spec);
  else return { skipped: true };

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

// Capture full import statements (with optional clause) so we can extract bindings.
//   group 1 = import clause (everything between `import` and `from`), undefined for side-effect imports
//   group 2 = module specifier
const IMPORT_RE = /(?:^|\n)\s*import\s+(?:([^"';]+?)\s+from\s+)?["']([^"']+)["']/g;

function parseBindings(clause) {
  // Returns local binding names declared by the import clause.
  const names = [];
  let rest = clause.trim();

  // Named block: { a, b as c }
  const namedMatch = rest.match(/\{([^}]*)\}/);
  if (namedMatch) {
    for (const part of namedMatch[1].split(",")) {
      const p = part.trim();
      if (!p) continue;
      const asMatch = p.match(/\bas\s+([A-Za-z_$][\w$]*)/);
      names.push(asMatch ? asMatch[1] : p.replace(/^type\s+/, "").trim());
    }
    rest = rest.replace(namedMatch[0], "").trim().replace(/,$/, "").trim();
  }

  // Namespace: * as Foo
  const nsMatch = rest.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/);
  if (nsMatch) {
    names.push(nsMatch[1]);
    rest = rest.replace(nsMatch[0], "").trim().replace(/,$/, "").trim();
  }

  // Default: leading identifier
  const defMatch = rest.match(/^([A-Za-z_$][\w$]*)/);
  if (defMatch) names.push(defMatch[1]);

  return names;
}

const errors = [];
const warnings = [];
const files = walk(ROUTES_DIR);

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const rel = file.replace(ROOT + "/", "");

  // Build a "body" string excluding all import statements so we don't count
  // an identifier's appearance inside its own import line as usage.
  const bodyParts = [];
  let lastIdx = 0;
  let m;
  const importMatches = [];
  while ((m = IMPORT_RE.exec(src)) !== null) {
    importMatches.push({ clause: m[1], spec: m[2], start: m.index, end: m.index + m[0].length });
    bodyParts.push(src.slice(lastIdx, m.index));
    lastIdx = m.index + m[0].length;
  }
  bodyParts.push(src.slice(lastIdx));
  const body = bodyParts.join("\n");

  for (const imp of importMatches) {
    const res = resolveImport(imp.spec, file);
    if (!res.skipped && !res.ok) {
      errors.push({ file: rel, spec: imp.spec });
      continue;
    }
    if (!imp.clause) continue; // side-effect import

    const bindings = parseBindings(imp.clause);
    for (const name of bindings) {
      if (!name) continue;
      const re = new RegExp(`\\b${name.replace(/[$]/g, "\\$")}\\b`);
      if (!re.test(body)) warnings.push({ file: rel, name, spec: imp.spec });
    }
  }
}

if (warnings.length) {
  console.warn("\n⚠ Unused route imports detected:\n");
  for (const w of warnings) console.warn(`  • ${w.file} → "${w.name}" from "${w.spec}"`);
  console.warn("\nRemove unused imports to keep route bundles lean.\n");
}

if (errors.length) {
  console.error("\n✘ Component resolution check failed — unresolved local imports in routes:\n");
  for (const e of errors) console.error(`  • ${e.file} → "${e.spec}"  (file does not exist)`);
  console.error("\nFix: remove the import or create the missing file.\n");
  process.exit(1);
}

console.log(
  `✓ Route imports OK (${files.length} route file${files.length === 1 ? "" : "s"} scanned, ${warnings.length} warning${warnings.length === 1 ? "" : "s"})`,
);
