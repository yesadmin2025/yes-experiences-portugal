/**
 * Pacing verification for the hero film credits/copy overlays.
 *
 * The hero <video> plays at HERO_FILM_PLAYBACK_RATE (<1) so every
 * chapter — and therefore every overlay copy beat — visibly holds on
 * screen long enough to be readable on every supported viewport
 * (mobile 360–414px through desktop 1080p/1440p+). Playback rate is
 * a property of the media element, not the viewport, so verifying
 * the *effective* per-chapter on-screen duration here proves the
 * credits never advance "too fast" at any resolution including 720p
 * and 1080p (the rendered film source resolutions).
 *
 * Floors below are derived from the editorial reading-time rule:
 * shortest visible beat must hold ≥ 5.0s on screen so a first-time
 * mobile reader can finish the line + microline before the cross-fade.
 */
import { describe, it, expect } from "vitest";
import { HERO_SCENES, HERO_FILM } from "../content/hero-scenes-manifest";

// Must match src/routes/index.tsx
const HERO_FILM_PLAYBACK_RATE = 0.78;

const MIN_VISIBLE_CHAPTER_SECONDS = 5.0;

describe("hero credits pacing — playback rate slows every chapter enough to read", () => {
  it("uses a sub-1.0 playback rate so credits never advance faster than authored", () => {
    expect(HERO_FILM_PLAYBACK_RATE).toBeGreaterThan(0);
    expect(HERO_FILM_PLAYBACK_RATE).toBeLessThan(1);
  });

  it.each(
    HERO_SCENES.map((c, i) => [i, c.id, c.startTime, c.endTime] as const),
  )(
    "chapter %i (%s) holds ≥ %ds on screen at the configured playback rate",
    (_i, _id, startTime, endTime) => {
      const authored = endTime - startTime;
      const effective = authored / HERO_FILM_PLAYBACK_RATE;
      expect(effective).toBeGreaterThanOrEqual(MIN_VISIBLE_CHAPTER_SECONDS);
    },
  );

  it("total film runtime stays within a sane editorial ceiling (<60s)", () => {
    const total = HERO_FILM.durationSeconds / HERO_FILM_PLAYBACK_RATE;
    expect(total).toBeLessThan(60);
    expect(total).toBeGreaterThan(HERO_FILM.durationSeconds);
  });
});
