/**
 * Hero typography lock — H1 + Hero CTAs (Nov 2026 v3 baseline).
 *
 * Reads className strings via stable selectors (data-hero-field=*) and
 * the .hero-cta-button CSS contract from styles.css, tokenizes them
 * into Sets / parses CSS values, and asserts on individual values.
 *
 * Order-independent: reshuffling Tailwind utilities does NOT cause a
 * failure, but any *value* drift (size, line-height, tracking, padding,
 * font-weight) on hero copy or hero CTA geometry fails loudly.
 *
 * Locked values:
 *
 *   <h1 data-hero-field="headlineLine1 headlineLine2">
 *     · text-[2.05rem]  sm:text-[2.7rem]  md:text-[4rem]  lg:text-[4.6rem]
 *     · leading-[1.1]   sm:leading-[1.04]  md:leading-[1.0]
 *     · tracking-[-0.02em]
 *     · text-[color:var(--ivory)]
 *
 *   <span data-hero-field="headlineLine2">     (italic gold-soft line)
 *     · text-[2.05rem]  sm:text-[2.7rem]  md:text-[4rem]  lg:text-[4.6rem]
 *     · leading-[1.1]   sm:leading-[1.04]  md:leading-[1.0]
 *     · tracking-[-0.024em]
 *     · text-[color:var(--gold-soft)]
 *
 *   <p data-hero-field="subheadline">
 *     · text-[15.5px]   md:text-[19px]
 *     · leading-[1.6]   md:leading-[1.65]
 *
 *   .hero-cta-button (styles.css contract — geometry + type)
 *     · mobile: height 72px, font-size 11px, line-height 1.25,
 *       font-weight 680, letter-spacing 0.085em
 *     · md (>=768px): height 70px, font-size 11.5px, line-height 1.25,
 *       font-weight 680, letter-spacing 0.09em
 *
 * If you intentionally change hero typography, update this test in the
 * SAME commit and document the new values in the header above.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const indexPath = resolve(__dirname, "../routes/index.tsx");
const stylesPath = resolve(__dirname, "../styles.css");
const indexSrc = readFileSync(indexPath, "utf8");
const stylesSrc = readFileSync(stylesPath, "utf8");

/**
 * Tokenize a className string for a stable selector into a Set so
 * assertions are order-independent.
 */
function classSet(src: string, regex: RegExp, label: string): Set<string> {
  const m = src.match(regex);
  if (!m) {
    throw new Error(
      `[hero-typography-lock] Stable selector not found: ${label}. ` +
      `Check that the data-hero-field/element still exists.`,
    );
  }
  return new Set(m[1].split(/\s+/).filter(Boolean));
}

function expectAllTokens(
  actual: Set<string>,
  expected: string[],
  context: string,
) {
  const missing = expected.filter((t) => !actual.has(t));
  expect(
    missing,
    `[${context}] missing locked Tailwind tokens: ${missing.join(", ")}`,
  ).toEqual([]);
}

/**
 * Parse a single CSS declaration value out of a rule body.
 * Returns the trimmed value (e.g. "72px", "0.085em", "680").
 */
function readDecl(
  cssBlock: string,
  prop: string,
  context: string,
): string {
  const re = new RegExp(`(?:^|[\\s;])${prop}\\s*:\\s*([^;]+);`, "m");
  const m = cssBlock.match(re);
  if (!m) {
    throw new Error(
      `[${context}] CSS declaration not found: ${prop}`,
    );
  }
  return m[1].trim();
}

/**
 * Extract a CSS rule body for `.hero-cta-button` (only the bare
 * selector, not the `.hero-cta-button.cta-*` compound rules). If
 * `inMediaMin` is given, restricts the search to inside an
 * `@media (min-width: <px>px)` block.
 */
function extractHeroCtaRule(inMediaMin?: number): string {
  // The bare selector: `.hero-cta-button {` with NO `.` following the
  // class name. This excludes `.hero-cta-button.cta-secondary-dark`.
  const ruleRe = /\.hero-cta-button\s*\{([^}]+)\}/g;

  let scope = stylesSrc;
  if (inMediaMin != null) {
    const mediaRe = new RegExp(
      `@media\\s*\\(\\s*min-width:\\s*${inMediaMin}px\\s*\\)\\s*\\{([\\s\\S]*?)\\n\\s*\\}\\s*(?=\\n|$)`,
    );
    const mediaBlock = stylesSrc.match(mediaRe);
    if (!mediaBlock) {
      throw new Error(`@media (min-width: ${inMediaMin}px) block not found`);
    }
    scope = mediaBlock[1];
  }

  // Walk all `.hero-cta-button { ... }` matches and pick the first one
  // where the character right before the `{` is whitespace (not `.`),
  // which means the bare class — not a compound selector.
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(scope)) !== null) {
    const before = scope.slice(Math.max(0, m.index - 1), m.index);
    // m.index points at the `.` — the char before that should be whitespace
    // or start-of-block, never `.` (that would be a compound selector).
    if (before === "" || /\s/.test(before)) {
      // Also ensure the char IMMEDIATELY after `.hero-cta-button` is `{`
      // or whitespace — not `.` (compound) or `>` etc.
      const after = m[0].slice(".hero-cta-button".length, ".hero-cta-button".length + 1);
      if (/\s|\{/.test(after)) {
        return m[1];
      }
    }
  }
  throw new Error(
    `Bare .hero-cta-button rule not found${inMediaMin != null ? ` inside @media min-width:${inMediaMin}px` : ""}`,
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Tailwind class-set assertions on hero copy elements
 * ───────────────────────────────────────────────────────────────── */
const HERO_H1 = classSet(
  indexSrc,
  /data-hero-field="headlineLine1 headlineLine2"\s+className="([^"]+)"/,
  'h1[data-hero-field="headlineLine1 headlineLine2"]',
);
const HERO_LINE2 = classSet(
  indexSrc,
  /data-hero-field="headlineLine2"\s+className="([^"]+)"/,
  'span[data-hero-field="headlineLine2"]',
);
const HERO_SUB = classSet(
  indexSrc,
  /data-hero-field="subheadline"\s+className="([^"]+)"/,
  'p[data-hero-field="subheadline"]',
);

describe("Hero <h1> — locked Tailwind tokens (order-independent)", () => {
  it("locks size ramp across mobile / sm / md / lg", () => {
    expectAllTokens(
      HERO_H1,
      [
        "text-[2.05rem]",
        "sm:text-[2.7rem]",
        "md:text-[4rem]",
        "lg:text-[4.6rem]",
      ],
      "hero h1 size ramp",
    );
  });

  it("locks line-height ramp across mobile / sm / md", () => {
    expectAllTokens(
      HERO_H1,
      ["leading-[1.1]", "sm:leading-[1.04]", "md:leading-[1.0]"],
      "hero h1 line-height ramp",
    );
  });

  it("locks tracking + ivory color token", () => {
    expectAllTokens(
      HERO_H1,
      ["tracking-[-0.02em]", "text-[color:var(--ivory)]"],
      "hero h1 tracking + color",
    );
  });

  it("keeps the .hero-h1 marker class for CSS hooks", () => {
    expect(HERO_H1.has("hero-h1")).toBe(true);
  });
});

describe("Hero <h1> italic line (headlineLine2) — locked Tailwind tokens", () => {
  it("locks size ramp across mobile / sm / md / lg", () => {
    expectAllTokens(
      HERO_LINE2,
      [
        "text-[2.05rem]",
        "sm:text-[2.7rem]",
        "md:text-[4rem]",
        "lg:text-[4.6rem]",
      ],
      "hero line2 size ramp",
    );
  });

  it("locks line-height ramp across mobile / sm / md", () => {
    expectAllTokens(
      HERO_LINE2,
      ["leading-[1.1]", "sm:leading-[1.04]", "md:leading-[1.0]"],
      "hero line2 line-height ramp",
    );
  });

  it("locks italic emphasis tracking + gold-soft color", () => {
    expectAllTokens(
      HERO_LINE2,
      [
        "italic",
        "tracking-[-0.024em]",
        "text-[color:var(--gold-soft)]",
      ],
      "hero line2 emphasis",
    );
  });
});

describe("Hero subheadline — locked Tailwind tokens", () => {
  it("locks size ramp mobile → md", () => {
    expectAllTokens(
      HERO_SUB,
      ["text-[15.5px]", "md:text-[19px]"],
      "hero subheadline size",
    );
  });

  it("locks line-height ramp mobile → md", () => {
    expectAllTokens(
      HERO_SUB,
      ["leading-[1.6]", "md:leading-[1.65]"],
      "hero subheadline line-height",
    );
  });
});

/* ─────────────────────────────────────────────────────────────────
 * .hero-cta-button CSS contract — geometry + type at mobile / md
 * ───────────────────────────────────────────────────────────────── */
const CTA_BASE = extractHeroCtaRule();
const CTA_MD = extractHeroCtaRule(768);

describe(".hero-cta-button mobile contract — locked", () => {
  it("locks geometry (height + padding)", () => {
    expect(readDecl(CTA_BASE, "height", "cta mobile")).toBe("72px");
    expect(readDecl(CTA_BASE, "padding", "cta mobile")).toBe(
      "18px 26px 18px 24px",
    );
  });

  it("locks type (size, line-height, weight, tracking, transform)", () => {
    expect(readDecl(CTA_BASE, "font-size", "cta mobile")).toBe("11px");
    expect(readDecl(CTA_BASE, "line-height", "cta mobile")).toBe("1.25");
    expect(readDecl(CTA_BASE, "font-weight", "cta mobile")).toBe("680");
    expect(readDecl(CTA_BASE, "letter-spacing", "cta mobile")).toBe(
      "0.085em",
    );
    expect(readDecl(CTA_BASE, "text-transform", "cta mobile")).toBe(
      "uppercase",
    );
  });

  it("locks the Inter font family token", () => {
    expect(readDecl(CTA_BASE, "font-family", "cta mobile")).toBe(
      "var(--font-sans)",
    );
  });
});

describe(".hero-cta-button md contract (≥768px) — locked", () => {
  it("locks geometry (height + padding)", () => {
    expect(readDecl(CTA_MD, "height", "cta md")).toBe("70px");
    expect(readDecl(CTA_MD, "padding", "cta md")).toBe(
      "18px 28px 18px 26px",
    );
  });

  it("locks type (size, line-height, weight, tracking)", () => {
    expect(readDecl(CTA_MD, "font-size", "cta md")).toBe("11.5px");
    expect(readDecl(CTA_MD, "line-height", "cta md")).toBe("1.25");
    expect(readDecl(CTA_MD, "font-weight", "cta md")).toBe("680");
    expect(readDecl(CTA_MD, "letter-spacing", "cta md")).toBe("0.09em");
  });
});

describe("Hero typography — anti-regression guards", () => {
  it("hero h1 does NOT regress to Tailwind preset sizes (text-5xl etc)", () => {
    for (const t of ["text-5xl", "text-6xl", "md:text-5xl", "md:text-6xl"]) {
      expect(HERO_H1.has(t)).toBe(false);
    }
  });

  it("hero h1 does NOT regress to a non-locked color (white, foreground)", () => {
    expect(HERO_H1.has("text-white")).toBe(false);
    expect(HERO_H1.has("text-[color:var(--foreground)]")).toBe(false);
  });

  it("italic line stays gold-soft (never raw --gold)", () => {
    expect(HERO_LINE2.has("text-[color:var(--gold)]")).toBe(false);
  });
});
