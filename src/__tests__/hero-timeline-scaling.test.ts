/**
 * Hero timeline scaling — unit tests.
 *
 * Locks the contract of `scaleHeroTimeline(actualDuration)`:
 *
 *   1. When `actualDuration` is within ±0.25s of the canonical 39.633s
 *      master, the manifest is returned VERBATIM (no float drift).
 *   2. For any other finite, positive duration, every chapter's
 *      startTime/endTime is proportionally scaled.
 *   3. The returned timeline is GAP-FREE — for every adjacent pair,
 *      chapter[i].endTime === chapter[i+1].startTime, so the rAF
 *      lookup `t ∈ [start, end]` always resolves to exactly one
 *      chapter and the active overlay never flickers.
 *   4. The first chapter starts at 0; the last chapter ends at
 *      exactly the requested duration (within 1e-9 tolerance).
 *   5. Invalid inputs (NaN, Infinity, ≤0) fall back to the manifest.
 *
 * Why this matters: the auto-sync behaviour was added precisely so
 * overlays NEVER desync from playback when a re-encode changes the
 * video duration. A regression here would cause silent gaps where no
 * chapter is active, which is exactly what the user reported before.
 */
import { describe, it, expect } from "vitest";
import {
  HERO_SCENES,
  HERO_FILM_CANONICAL_DURATION_S,
  scaleHeroTimeline,
} from "@/content/hero-scenes-manifest";

const EPS = 1e-9;

function assertNoGapsAndOrdered(
  timeline: readonly { id: string; startTime: number; endTime: number }[],
) {
  expect(timeline.length).toBe(HERO_SCENES.length);
  expect(timeline[0].startTime).toBeCloseTo(0, 9);
  for (let i = 0; i < timeline.length; i += 1) {
    const c = timeline[i];
    expect(
      c.endTime,
      `chapter "${c.id}" must have endTime > startTime`,
    ).toBeGreaterThan(c.startTime);
    if (i < timeline.length - 1) {
      const next = timeline[i + 1];
      expect(
        Math.abs(next.startTime - c.endTime),
        `gap between "${c.id}" (${c.endTime}) and "${next.id}" (${next.startTime})`,
      ).toBeLessThan(EPS);
    }
  }
}

describe("scaleHeroTimeline — canonical pass-through", () => {
  it("returns the manifest verbatim when duration === canonical master", () => {
    const out = scaleHeroTimeline(HERO_FILM_CANONICAL_DURATION_S);
    expect(out).toEqual(
      HERO_SCENES.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    );
  });

  it.each([
    HERO_FILM_CANONICAL_DURATION_S - 0.2,
    HERO_FILM_CANONICAL_DURATION_S,
    HERO_FILM_CANONICAL_DURATION_S + 0.2,
  ])(
    "treats %ss as canonical (within ±0.25s tolerance) and returns manifest verbatim",
    (duration) => {
      const out = scaleHeroTimeline(duration);
      out.forEach((c, i) => {
        expect(c.startTime).toBe(HERO_SCENES[i].startTime);
        expect(c.endTime).toBe(HERO_SCENES[i].endTime);
      });
    },
  );
});

describe("scaleHeroTimeline — non-canonical durations", () => {
  it.each([20, 30, 41, 42, 50, 60, 90.5, 120])(
    "scales every chapter proportionally for duration=%ss",
    (duration) => {
      const out = scaleHeroTimeline(duration);
      const ratio = duration / HERO_FILM_CANONICAL_DURATION_S;

      out.forEach((c, i) => {
        const original = HERO_SCENES[i];
        expect(c.id).toBe(original.id);
        expect(c.startTime).toBeCloseTo(original.startTime * ratio, 9);
        expect(c.endTime).toBeCloseTo(original.endTime * ratio, 9);
      });

      // First chapter still anchored at 0.
      expect(out[0].startTime).toBeCloseTo(0, 9);
      // Last chapter ends exactly at the requested duration.
      expect(out[out.length - 1].endTime).toBeCloseTo(duration, 9);
    },
  );

  it.each([20, 30, 41, 42, 50, 60, 90.5, 120])(
    "produces a GAP-FREE timeline for duration=%ss (no flicker windows)",
    (duration) => {
      assertNoGapsAndOrdered(scaleHeroTimeline(duration));
    },
  );

  it("never produces a t ∈ [0, duration] that matches zero chapters", () => {
    // Sweep across the scaled timeline at 0.05s steps and assert that
    // every sampled t lands inside exactly one chapter window. This is
    // the same lookup the rAF tick performs — if it ever returns -1
    // we get the desync bug back.
    const duration = 73.2; // intentionally non-canonical, non-integer
    const timeline = scaleHeroTimeline(duration);
    for (let t = 0; t <= duration; t += 0.05) {
      const matches = timeline.filter(
        (c) => t >= c.startTime - EPS && t <= c.endTime + EPS,
      );
      expect(
        matches.length,
        `t=${t.toFixed(3)}s matched ${matches.length} chapters (want exactly 1)`,
      ).toBeGreaterThanOrEqual(1);
      // At chapter boundaries the previous and next chapter both touch
      // the same instant — that's expected and correct (no gap). What
      // we forbid is ZERO matches.
    }
  });
});

describe("scaleHeroTimeline — invalid inputs fall back to manifest", () => {
  it.each([
    ["NaN", Number.NaN],
    ["+Infinity", Number.POSITIVE_INFINITY],
    ["-Infinity", Number.NEGATIVE_INFINITY],
    ["0", 0],
    ["negative", -10],
  ])("returns manifest verbatim for %s", (_label, input) => {
    const out = scaleHeroTimeline(input);
    expect(out).toEqual(
      HERO_SCENES.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    );
  });
});

describe("hero manifest — baseline gap-free invariant", () => {
  it("authored manifest itself has no gaps and starts at 0", () => {
    assertNoGapsAndOrdered(
      HERO_SCENES.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    );
  });

  it("authored manifest ends exactly at the canonical duration", () => {
    expect(HERO_SCENES[HERO_SCENES.length - 1].endTime).toBeCloseTo(
      HERO_FILM_CANONICAL_DURATION_S,
      9,
    );
  });
});
