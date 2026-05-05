/**
 * Hero timeline + phrases contract.
 *
 * Pure-data test driven by `HERO_SCENES` + `HERO_FILM`. Validates the
 * exact contract the hero render path (mobile + desktop, identical
 * lookup) depends on so any re-timing or reordering of a beat fails
 * before shipping. The active-chapter rule mirrors the rAF loop in
 * `src/routes/index.tsx` (`t >= start && t <= end`), so passing here
 * proves each phrase appears at the same playback moment regardless
 * of viewport.
 */
import { describe, it, expect } from "vitest";
import {
  HERO_SCENES,
  HERO_FILM,
  scaleHeroTimeline,
} from "../content/hero-scenes-manifest";

const EPS = 1e-6;

const EXPECTED_PHRASES: ReadonlyArray<{
  id: string;
  main: readonly string[];
  supportIncludes?: string;
}> = [
  { id: "imagine", main: [], supportIncludes: "Private experiences" },
  { id: "choose", main: ["Hidden gems,", "known by locals."] },
  { id: "taste", main: ["Your private day,", "shaped around you."] },
  { id: "celebrate", main: ["Celebrations,", "made effortless."] },
  { id: "corporate", main: ["For teams", "with purpose."] },
  { id: "journey", main: ["One perfect day", "to remember."] },
  { id: "build", main: ["A journey", "across Portugal."] },
  { id: "confirm", main: [] },
];

function activeIdAt(
  t: number,
  windows: ReadonlyArray<{ id: string; startTime: number; endTime: number }>,
): string | null {
  for (const w of windows) {
    if (t >= w.startTime && t <= w.endTime) return w.id;
  }
  return null;
}

describe("hero timeline — coverage and gapless mapping", () => {
  it("first chapter starts at 0 and last chapter ends at film duration", () => {
    expect(HERO_SCENES[0].startTime).toBe(0);
    expect(
      Math.abs(
        HERO_SCENES[HERO_SCENES.length - 1].endTime - HERO_FILM.durationSeconds,
      ),
    ).toBeLessThan(EPS);
  });

  it("every adjacent pair is gapless and strictly monotonic", () => {
    for (let i = 0; i < HERO_SCENES.length; i += 1) {
      const c = HERO_SCENES[i];
      expect(c.endTime).toBeGreaterThan(c.startTime);
      if (i > 0) {
        expect(c.startTime).toBe(HERO_SCENES[i - 1].endTime);
      }
    }
  });
});

describe("hero phrases — locked to chapter ids in canonical order", () => {
  it("matches the expected ordering and id set", () => {
    expect(HERO_SCENES.map((s) => s.id)).toEqual(
      EXPECTED_PHRASES.map((p) => p.id),
    );
  });

  it.each(EXPECTED_PHRASES.map((p, i) => [i, p] as const))(
    "chapter %i (%o) carries the locked phrase",
    (i, expected) => {
      const scene = HERO_SCENES[i];
      expect(scene.id).toBe(expected.id);
      expect([...scene.main]).toEqual([...expected.main]);
      if (expected.supportIncludes) {
        expect(scene.support ?? "").toContain(expected.supportIncludes);
      }
    },
  );
});

describe("hero timeline — frame-accurate sampling (mobile + desktop identical)", () => {
  // Sample inside each chapter (avoiding shared boundaries where two
  // windows touch). Mirrors the runtime rAF lookup.
  const samples: ReadonlyArray<readonly [number, string]> = [
    [0.0, "imagine"],
    [1.5, "imagine"],
    [5.0, "choose"],
    [8.0, "taste"],
    [10.5, "celebrate"],
    [12.5, "corporate"],
    [15.0, "journey"],
    [20.0, "build"],
    [25.5, "confirm"],
    [27.6, "confirm"],
  ];
  it.each(samples)("at t=%ss the active chapter is %s", (t, expectedId) => {
    expect(activeIdAt(t, HERO_SCENES)).toBe(expectedId);
  });
});

describe("hero timeline — scaling preserves the contract", () => {
  it.each([20, 27.633333, 35])(
    "scaleHeroTimeline(%s) keeps gapless + first=0 + last=duration",
    (actual) => {
      const scaled = scaleHeroTimeline(actual);
      expect(scaled[0].startTime).toBe(0);
      expect(Math.abs(scaled[scaled.length - 1].endTime - actual)).toBeLessThan(
        1e-4,
      );
      for (let i = 1; i < scaled.length; i += 1) {
        expect(scaled[i].startTime).toBeCloseTo(scaled[i - 1].endTime, 9);
        expect(scaled[i].endTime).toBeGreaterThan(scaled[i].startTime);
      }
    },
  );
});
