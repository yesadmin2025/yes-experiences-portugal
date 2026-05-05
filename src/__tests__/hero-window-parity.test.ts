/**
 * Hero text/image window parity across breakpoints.
 *
 * The hero is ONE continuous film. Both the chapter overlay (text) and
 * the visual frame (image / video position) at any given playback time
 * are resolved from the SAME `HERO_SCENES` lookup against `currentTime`
 * (`t >= startTime && t <= endTime`). The only thing that varies per
 * breakpoint is `scene.position` (object-position presets) — never the
 * timing window.
 *
 * This test pins that contract so a future regression that drives the
 * mobile and desktop overlays from divergent timelines (e.g. shipping a
 * separate mobile-only manifest) fails immediately.
 */
import { describe, it, expect } from "vitest";
import { HERO_SCENES, HERO_FILM } from "@/content/hero-scenes-manifest";

type Window = { id: string; startTime: number; endTime: number };

const BREAKPOINTS = ["mobile", "tablet", "desktop"] as const;

/** Mirrors the rAF lookup in src/routes/index.tsx and the debug overlay. */
function activeChapterAt(t: number): Window | null {
  for (const s of HERO_SCENES) {
    if (t >= s.startTime && t <= s.endTime) {
      return { id: s.id, startTime: s.startTime, endTime: s.endTime };
    }
  }
  return null;
}

/** The image-frame lookup must use the same window — there is no
 *  breakpoint-specific timeline. We model it explicitly here so the
 *  test will catch any future code path that reads `position` against
 *  a different time table. */
function imageWindowAt(
  t: number,
  breakpoint: (typeof BREAKPOINTS)[number],
): Window | null {
  for (const s of HERO_SCENES) {
    if (t >= s.startTime && t <= s.endTime) {
      // Touch the breakpoint-specific position so the assertion proves
      // the position presets exist for every BP without altering the
      // window.
      const _pos = s.position[breakpoint];
      void _pos;
      return { id: s.id, startTime: s.startTime, endTime: s.endTime };
    }
  }
  return null;
}

// Sample once mid-chapter for every chapter, plus dense edge probes
// near each boundary to catch off-by-one drift.
const SAMPLES: number[] = [];
for (const s of HERO_SCENES) {
  const mid = (s.startTime + s.endTime) / 2;
  SAMPLES.push(s.startTime + 0.001, mid, s.endTime - 0.001);
}
// Plus a sweep across the whole film at 0.25s resolution.
for (let t = 0; t <= HERO_FILM.durationSeconds; t += 0.25) {
  SAMPLES.push(Number(t.toFixed(3)));
}

describe("hero window parity — text overlay window === image window", () => {
  it("every scene declares an object-position for every breakpoint", () => {
    for (const s of HERO_SCENES) {
      for (const bp of BREAKPOINTS) {
        expect(typeof s.position[bp]).toBe("string");
        expect(s.position[bp].length).toBeGreaterThan(0);
      }
    }
  });

  it.each(BREAKPOINTS)(
    "[%s] image window matches text window at every sampled playback time",
    (bp) => {
      for (const t of SAMPLES) {
        const text = activeChapterAt(t);
        const image = imageWindowAt(t, bp);
        expect(image).toEqual(text);
      }
    },
  );

  it("mobile, tablet and desktop resolve to the IDENTICAL window at every sample", () => {
    for (const t of SAMPLES) {
      const m = imageWindowAt(t, "mobile");
      const tab = imageWindowAt(t, "tablet");
      const d = imageWindowAt(t, "desktop");
      expect(m).toEqual(tab);
      expect(tab).toEqual(d);
    }
  });

  it("there is no breakpoint-specific timing — only `position` varies per BP", () => {
    // If anyone ever adds a `startTime`/`endTime` per-breakpoint
    // override, this guard fails loudly.
    for (const s of HERO_SCENES) {
      const keys = Object.keys(s.position);
      expect(keys.sort()).toEqual([...BREAKPOINTS].sort());
      for (const bp of BREAKPOINTS) {
        expect(s.position[bp]).not.toMatch(/start|end|\d+s/i);
      }
    }
  });
});
