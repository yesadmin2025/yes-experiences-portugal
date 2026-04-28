/**
 * Typography regression test
 * ─────────────────────────────────────────────────────────────────
 * Locks the typography contract for every hero/headline on the
 * site — across mobile (393px), tablet (768px) and desktop (1280px+).
 *
 * What it snapshots:
 *   1. The class string of every headline / hero text element
 *      pulled directly from the source files. If anyone edits a
 *      headline's font-size, weight, leading, tracking or color in
 *      JSX, the snapshot fails.
 *   2. The CSS rule body for every typography TOKEN
 *      (.hero-h1, .t-display, .t-h1, .t-h2, .t-h3, .t-eyebrow, .t-lead)
 *      including all media-query overrides. If anyone edits the
 *      token at a breakpoint, the snapshot fails.
 *
 * Why this works without a real browser:
 *   - The Tailwind utility classes encode size + leading + tracking
 *     at every breakpoint (text-[2.05rem] sm:text-5xl md:text-7xl ...),
 *     so capturing the class string captures all 3 breakpoints at
 *     once.
 *   - Tokens like .hero-h1 carry their own @media rules, captured
 *     verbatim from styles.css.
 *
 * Update flow when an intentional change is made:
 *   bun run test -- -u
 */

import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

/* ── 1. Headline class strings, pulled from source ──────────────── */

type HeadlineSpec = {
  page: string;
  role: string; // e.g. "hero h1", "section h2", "final CTA h2"
  file: string;
  // RegExp that captures the className contents of the target element
  pattern: RegExp;
};

const HEADLINES: HeadlineSpec[] = [
  // Homepage hero — frozen contract, must not drift
  {
    page: "home",
    role: "hero eyebrow",
    file: "src/routes/index.tsx",
    pattern:
      /<span className="(inline-flex items-center gap-2\.5[^"]*?animate-\[heroFade_1\.1s[^"]*?)"/,
  },
  {
    page: "home",
    role: "hero h1",
    file: "src/routes/index.tsx",
    pattern: /<h1\s+data-hero-field="headlineLine1 headlineLine2"\s+className="([^"]+)"/,
  },
  {
    page: "home",
    role: "hero h1 line 2 (italic gold)",
    file: "src/routes/index.tsx",
    pattern: /data-hero-field="headlineLine2"\s+className="([^"]+)"/,
  },
  {
    page: "home",
    role: "hero subheadline",
    file: "src/routes/index.tsx",
    pattern: /<p\s+data-hero-field="subheadline"\s+className="([^"]+)"/,
  },
  {
    page: "home",
    role: "hero microcopy",
    file: "src/routes/index.tsx",
    pattern: /<p\s+data-hero-field="microcopy"\s+className="([^"]+)"/,
  },

  // Multi-day page hero + section H2s
  {
    page: "multi-day",
    role: "hero h1",
    file: "src/routes/multi-day.tsx",
    pattern: /<h1 className="(serif text-\[34px\] md:text-6xl[^"]+)"/,
  },
  {
    page: "multi-day",
    role: "hero subhead",
    file: "src/routes/multi-day.tsx",
    pattern:
      /<p className="(mt-5 max-w-md md:max-w-xl mx-auto text-\[15px\][^"]+)">\s*Shape each day/,
  },

  // Proposals page hero + section H2s
  {
    page: "proposals",
    role: "hero h1",
    file: "src/routes/proposals.tsx",
    pattern: /<h1 className="(serif text-\[34px\] md:text-6xl[^"]+)"/,
  },
  {
    page: "proposals",
    role: "hero subhead",
    file: "src/routes/proposals.tsx",
    pattern:
      /<p className="(mt-5 max-w-md md:max-w-xl mx-auto text-\[15px\][^"]+)">\s*Proposals, anniversaries/,
  },
];

/* ── 2. Typography token rules from styles.css ──────────────────── */

const TOKENS = [
  ".hero-h1",
  ".t-display",
  ".t-h1",
  ".t-h2",
  ".t-h3",
  ".t-eyebrow",
  ".t-lead",
];

/**
 * Extract every CSS rule (and its media-query overrides) for a
 * given selector from styles.css. Returns a normalized string we
 * can snapshot.
 */
function extractTokenRules(css: string, selector: string): string {
  // Collect base rule(s)
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const lines: string[] = [];

  // Match `selector { ... }` not inside @media (i.e. with no preceding @)
  const baseRe = new RegExp(
    `(^|\\n)\\s*${escaped}\\s*\\{([^}]+)\\}`,
    "g",
  );
  let m: RegExpExecArray | null;
  while ((m = baseRe.exec(css))) {
    const body = m[2].trim().replace(/\s+/g, " ");
    lines.push(`base: ${body}`);
  }

  // Match `@media (...) { ... selector { ... } ... }`
  const mediaRe = /@media\s*\(([^)]+)\)\s*\{([\s\S]*?)\n\s*\}/g;
  let mm: RegExpExecArray | null;
  while ((mm = mediaRe.exec(css))) {
    const cond = mm[1].trim();
    const inner = mm[2];
    const innerRe = new RegExp(
      `${escaped}\\s*\\{([^}]+)\\}`,
      "g",
    );
    let im: RegExpExecArray | null;
    while ((im = innerRe.exec(inner))) {
      const body = im[1].trim().replace(/\s+/g, " ");
      lines.push(`@media (${cond}): ${body}`);
    }
  }

  return lines.join("\n");
}

/* ── 3. Tests ───────────────────────────────────────────────────── */

describe("Typography regression — headline class strings", () => {
  for (const h of HEADLINES) {
    it(`[${h.page}] ${h.role}`, () => {
      const src = read(h.file);
      const match = src.match(h.pattern);
      expect(match, `Could not locate ${h.role} in ${h.file}`).toBeTruthy();
      // Normalize whitespace so a re-format doesn't trip the snapshot
      const cls = match![1].split(/\s+/).filter(Boolean).join(" ");
      expect(cls).toMatchSnapshot();
    });
  }
});

describe("Typography regression — token rules from styles.css", () => {
  const css = read("src/styles.css");
  for (const sel of TOKENS) {
    it(`token ${sel}`, () => {
      const rules = extractTokenRules(css, sel);
      expect(rules, `No rules found for ${sel}`).not.toBe("");
      expect(rules).toMatchSnapshot();
    });
  }
});
