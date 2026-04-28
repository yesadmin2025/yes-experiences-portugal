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
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

/* ── Stability guards ────────────────────────────────────────────
 * This suite is deterministic by design: it parses source files and
 * styles.css as text — it does NOT mount components, does NOT call
 * getComputedStyle, and does NOT depend on the DOM, fonts or layout.
 * That means there is nothing to "wait for" before reading values,
 * and the suite cannot flake across breakpoints.
 *
 * The guards below exist to KEEP it that way as the suite grows:
 *
 *   1. settleLayout() — ready-to-use helper that awaits
 *      document.fonts.ready (when a DOM is present) plus two rAFs
 *      so style recalc + layout has flushed. Call it in any future
 *      test that mounts JSX and reads getComputedStyle.
 *
 *   2. A static guard test that fails if anyone introduces a
 *      getComputedStyle / offsetWidth / getBoundingClientRect call
 *      in this file without also using settleLayout() first.
 * ──────────────────────────────────────────────────────────────── */

export async function settleLayout(): Promise<void> {
  if (typeof document === "undefined") return;

  // Wait for web fonts so font-size/line-height reflect real metrics.
  const fontsReady = (
    document as unknown as { fonts?: { ready?: Promise<unknown> } }
  ).fonts?.ready;
  if (fontsReady) await fontsReady;

  // Two rAFs to let style recalc + layout flush.
  const raf = (cb: () => void) =>
    typeof requestAnimationFrame === "function"
      ? requestAnimationFrame(cb)
      : (setTimeout(cb, 16) as unknown as number);

  await new Promise<void>((r) => raf(() => raf(() => r())));
}

beforeAll(async () => {
  // No-op for this static suite, but locks in the contract: any
  // future test that reads computed styles MUST run after settle.
  await settleLayout();
});

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

/* ── 3b. Section-headline sweep across premium pages ─────────────
 * For every page below, find every element whose className uses one
 * of the typography tokens (t-h1/t-h2/t-h3/t-eyebrow/t-lead) and
 * snapshot the full ordered list of (tag, class string) pairs.
 *
 * This catches:
 *   - a section H2 losing the t-h2 token
 *   - a token being swapped for an ad-hoc class string
 *   - a new section being added without going through the token system
 *   - mt-* / max-w-* spacing drift on any tokenized section heading
 *
 * Update with `bunx vitest run -u` when the change is intentional.
 * ───────────────────────────────────────────────────────────────── */

const SECTION_PAGES = [
  { page: "home", file: "src/routes/index.tsx" },
  { page: "multi-day", file: "src/routes/multi-day.tsx" },
  { page: "proposals", file: "src/routes/proposals.tsx" },
];

const TOKEN_CLASS_RE =
  /<(h1|h2|h3|h4|p|span|div)\b[^>]*\sclassName="([^"]*\b(?:t-h1|t-h2|t-h3|t-eyebrow|t-lead)\b[^"]*)"/g;

describe("Typography regression — section headlines (token sweep)", () => {
  for (const { page, file } of SECTION_PAGES) {
    it(`[${page}] all tokenized section headlines`, () => {
      const src = read(file);
      const hits: Array<{ tag: string; cls: string }> = [];
      let m: RegExpExecArray | null;
      TOKEN_CLASS_RE.lastIndex = 0;
      while ((m = TOKEN_CLASS_RE.exec(src))) {
        const tag = m[1];
        const cls = m[2].split(/\s+/).filter(Boolean).join(" ");
        hits.push({ tag, cls });
      }
      expect(
        hits.length,
        `No tokenized section headlines found in ${file}`,
      ).toBeGreaterThan(0);
      expect(hits).toMatchSnapshot();
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

/* ── 4. Stability guard ─────────────────────────────────────────
 * If anyone extends this file with live DOM measurements, force
 * them to also use settleLayout() so the new tests can't flake on
 * font load or layout timing across breakpoints.
 * ──────────────────────────────────────────────────────────────── */

describe("Typography regression — stability guard", () => {
  it("any live DOM measurement is paired with settleLayout()", () => {
    const self = read("src/__tests__/typography-regression.test.ts");
    const usesLiveMeasurement =
      /\bgetComputedStyle\s*\(|\.offsetWidth\b|\.offsetHeight\b|getBoundingClientRect\s*\(/.test(
        self,
      );
    if (!usesLiveMeasurement) {
      // Nothing to guard — suite is fully static.
      expect(true).toBe(true);
      return;
    }
    const usesSettle = /\bsettleLayout\s*\(\s*\)/.test(self);
    expect(
      usesSettle,
      "Live DOM measurement detected (getComputedStyle / offset* / getBoundingClientRect) " +
        "without a settleLayout() call. Await settleLayout() before reading layout-dependent " +
        "values to prevent breakpoint/font flakiness.",
    ).toBe(true);
  });
});
