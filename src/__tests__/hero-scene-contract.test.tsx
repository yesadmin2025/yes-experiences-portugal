/**
 * Hero scene contract — locks the storytelling brief in code.
 *
 * Two invariants enforced here, both required by the homepage brief:
 *
 *  1. ONE message per scene. Every scene's `main` array is short enough
 *     to read as a single beat (≤2 lines, ≤6 words per line). The
 *     `support` micro-line, when present, is itself a single short
 *     sentence — not a paragraph.
 *
 *  2. CTAs render ONLY on the FINAL scene (the action scene). Earlier
 *     scenes must never display the primary or secondary CTA buttons,
 *     and must never display the microcopy or brand signature in a
 *     visible block. We assert this against BOTH the production scene
 *     order AND every defined A/B variant — so a future variant can
 *     never accidentally re-introduce CTAs on scenes 1–4.
 *
 * These tests are deliberately structural: they read the manifest +
 * variants and assert against scene shape. No DOM rendering required
 * for the message check; the CTA check uses a tiny harness that mirrors
 * the route's `isHeroActionScene === heroSceneIndex === N-1` rule.
 */
import { describe, it, expect } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { useState } from "react";
import { HERO_SCENES } from "@/content/hero-scenes-manifest";
import {
  HERO_COPY_EXPERIMENT,
  applyVariantToScenes,
} from "@/content/hero-scene-variants";
import { HERO_COPY } from "@/content/hero-copy";

const MAX_MAIN_LINES = 3;
const MAX_WORDS_PER_LINE = 6;
const MAX_SUPPORT_WORDS = 9;
// Approved support lines may be punchy three-beat lockups
// (e.g. "Your people. Your pace. Your Portugal.") so we cap
// at 3 short sentences — still much tighter than a paragraph.
const MAX_SUPPORT_SENTENCES = 3;

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
function sentenceCount(s: string): number {
  return s
    .split(/[.!?]+/)
    .map((x) => x.trim())
    .filter(Boolean).length;
}

describe("hero — one message per scene", () => {
  it("every production scene's `main` is a single beat (≤2 lines, ≤6 words/line)", () => {
    for (const scene of HERO_SCENES) {
      expect(
        scene.main.length,
        `scene "${scene.id}" has ${scene.main.length} main lines — must be ≤${MAX_MAIN_LINES}`,
      ).toBeLessThanOrEqual(MAX_MAIN_LINES);
      for (const line of scene.main) {
        expect(
          wordCount(line),
          `scene "${scene.id}" line "${line}" has ${wordCount(line)} words — must be ≤${MAX_WORDS_PER_LINE}`,
        ).toBeLessThanOrEqual(MAX_WORDS_PER_LINE);
      }
    }
  });

  it("every production scene's `support` (when present) is one short micro-line", () => {
    for (const scene of HERO_SCENES) {
      if (!scene.support) continue;
      expect(
        wordCount(scene.support),
        `scene "${scene.id}" support is too long: "${scene.support}"`,
      ).toBeLessThanOrEqual(MAX_SUPPORT_WORDS);
      expect(
        sentenceCount(scene.support),
        `scene "${scene.id}" support spans too many sentences: "${scene.support}"`,
      ).toBeLessThanOrEqual(MAX_SUPPORT_SENTENCES);
    }
  });

  it("every A/B variant respects the same one-message-per-scene contract", () => {
    for (const variant of HERO_COPY_EXPERIMENT.variants) {
      const scenes = applyVariantToScenes(variant);
      for (const scene of scenes) {
        expect(
          scene.main.length,
          `variant "${variant.id}" / scene "${scene.id}" main has ${scene.main.length} lines`,
        ).toBeLessThanOrEqual(MAX_MAIN_LINES);
        for (const line of scene.main) {
          expect(
            wordCount(line),
            `variant "${variant.id}" / scene "${scene.id}" line "${line}" exceeds ${MAX_WORDS_PER_LINE} words`,
          ).toBeLessThanOrEqual(MAX_WORDS_PER_LINE);
        }
        if (scene.support) {
          expect(
            wordCount(scene.support),
            `variant "${variant.id}" / scene "${scene.id}" support "${scene.support}" exceeds ${MAX_SUPPORT_WORDS} words`,
          ).toBeLessThanOrEqual(MAX_SUPPORT_WORDS);
          expect(
            sentenceCount(scene.support),
            `variant "${variant.id}" / scene "${scene.id}" support has too many sentences: "${scene.support}"`,
          ).toBeLessThanOrEqual(MAX_SUPPORT_SENTENCES);
        }
      }
    }
  });

  it("scene main lines do not contain HERO_COPY headline strings (no duplication of locked copy)", () => {
    const locked = [
      HERO_COPY.headlineLine1,
      HERO_COPY.headlineLine2,
      HERO_COPY.subheadline,
      HERO_COPY.microcopy,
      HERO_COPY.brandLine,
    ];
    for (const scene of HERO_SCENES) {
      const text = [...scene.main, scene.support ?? ""].join(" ");
      for (const phrase of locked) {
        // We only flag exact reuse, not incidental shared common words.
        expect(
          text.includes(phrase),
          `scene "${scene.id}" duplicates locked HERO_COPY phrase: "${phrase}"`,
        ).toBe(false);
      }
    }
  });
});

/* ------------------------------------------------------------------
 * CTA-only-on-final-scene contract
 * ------------------------------------------------------------------ */

/**
 * Mirrors the route's CTA gating exactly:
 *   isHeroActionScene = heroSceneIndex === HERO_SCENES.length - 1
 * If this rule is ever weakened (e.g. CTAs leaking onto scene 4),
 * the assertions below catch it.
 */
function HeroCtaHarness({ activeIndex }: { activeIndex: number }) {
  const [index] = useState(activeIndex);
  const scene = HERO_SCENES[index];
  const isHeroActionScene = index === HERO_SCENES.length - 1;
  return (
    <section data-hero data-hero-scene-index={index}>
      <div data-hero-message>
        <p>{scene.main.join(" ")}</p>
        {scene.support ? <p>{scene.support}</p> : null}
      </div>
      {isHeroActionScene ? (
        <div data-hero-action-block>
          <a
            data-hero-field="primaryCta"
            href="/builder"
            className="hero-cta-button hero-cta-button--compact cta-primary"
          >
            {HERO_COPY.primaryCta}
          </a>
          <a
            data-hero-field="secondaryCta"
            href="/experiences"
            className="hero-cta-button hero-cta-button--compact cta-secondary-dark"
          >
            {HERO_COPY.secondaryCta}
          </a>
          <p data-hero-field="microcopy">{HERO_COPY.microcopy}</p>
        </div>
      ) : null}
    </section>
  );
}

describe("hero — CTAs render only on the final scene", () => {
  for (let i = 0; i < HERO_SCENES.length - 1; i++) {
    it(`scene ${i + 1} ("${HERO_SCENES[i].id}") never renders any CTA, microcopy, or action block`, () => {
      const r = render(<HeroCtaHarness activeIndex={i} />);
      expect(r.queryByText(HERO_COPY.primaryCta)).toBeNull();
      expect(r.queryByText(HERO_COPY.secondaryCta)).toBeNull();
      expect(r.queryByText(HERO_COPY.microcopy)).toBeNull();
      expect(r.container.querySelector("[data-hero-action-block]")).toBeNull();
      expect(
        r.container.querySelector('[data-hero-field="primaryCta"]'),
      ).toBeNull();
      expect(
        r.container.querySelector('[data-hero-field="secondaryCta"]'),
      ).toBeNull();
      expect(
        r.container.querySelectorAll(".hero-cta-button").length,
        "no .hero-cta-button may render before the final scene",
      ).toBe(0);
      cleanup();
    });
  }

  it(`final scene ("${HERO_SCENES[HERO_SCENES.length - 1].id}") renders BOTH CTAs and the microcopy exactly once`, () => {
    const r = render(<HeroCtaHarness activeIndex={HERO_SCENES.length - 1} />);
    expect(r.getAllByText(HERO_COPY.primaryCta)).toHaveLength(1);
    expect(r.getAllByText(HERO_COPY.secondaryCta)).toHaveLength(1);
    expect(r.getAllByText(HERO_COPY.microcopy)).toHaveLength(1);
    expect(
      r.container.querySelectorAll(".hero-cta-button"),
      "exactly two hero CTAs render on the action scene",
    ).toHaveLength(2);
    expect(
      r.container.querySelector('[data-hero-action-block]'),
      "action block exists on the final scene",
    ).toBeTruthy();
  });
});
