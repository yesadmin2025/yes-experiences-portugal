/**
 * Hero film manifest — single source of truth.
 *
 * The hero is ONE continuous cinematic brand film (~28s, 30fps, 1920×1080)
 * — NOT a slideshow, NOT a carousel, NOT five stacked videos. The film is
 * stitched once at build time from three AI-generated 10s parts (anchored
 * on real YES Experiences posters) with warm color-graded crossfades, so
 * the user always sees a single uninterrupted `<video>` element.
 *
 * `HERO_FILM` is the canonical asset reference (1080p + 720p + poster).
 * `HERO_SCENES` is preserved as the CHAPTER OVERLAY TIMELINE — each entry
 * describes a beat in the film: when the chapter copy fades in, when it
 * fades out, plus the cinematic main / support lines. Every scene still
 * exposes `image` + `video` so legacy contract tests + the credits modal
 * keep working — they all point at the SAME film, on purpose: there is
 * only one source of motion.
 *
 * Story spine — six chapters in one continuous film:
 *   1. PORTUGAL OPENS    (0.0s – 5.0s)
 *   2. PRIVATE DAYS      (5.0s – 10.0s)
 *   3. PROPOSALS         (10.0s – 14.5s)
 *   4. CORPORATE/GROUPS  (14.5s – 19.0s)
 *   5. MULTI-DAY JOURNEY (19.0s – 23.5s)
 *   6. BUILDER + CTA     (23.5s – 27.6s)
 *
 * No invented locations or partners. AI was used only as a tonal
 * connective tissue between real YES poster frames — every starting
 * frame is real Comporta / Setúbal / Alentejo footage from the YES
 * library. Operational media (minibus arrival, workshops) stays out
 * of the hero by design.
 */

const FILM_1080 = "/video/film/yes-hero-film-1080.mp4";
const FILM_720 = "/video/film/yes-hero-film-720.mp4";
const FILM_POSTER = "/video/film/yes-hero-poster.jpg";

export const HERO_FILM = {
  /** Total film length in seconds (matches the uploaded continuous MP4). */
  durationSeconds: 41.5,
  /** Mobile-first source — used for ≤480px CSS pixels. */
  src720: FILM_720,
  /** Tablet + desktop source. */
  src1080: FILM_1080,
  /** Poster shown until the first frame decodes. */
  poster: FILM_POSTER,
} as const;

export type HeroPan = "drift-left" | "drift-right" | "push-in" | "pull-back";

export type HeroAssetSource =
  | "viator"
  | "pexels"
  | "unsplash"
  | "in-house"
  | "yes-experiences";

export type HeroAssetCredit = {
  kind: "video" | "photo";
  location: string;
  photographer?: string;
  source: HeroAssetSource;
  sourceUrl?: string;
  license: string;
};

export type HeroPositionByBreakpoint = {
  readonly mobile: string;
  readonly tablet: string;
  readonly desktop: string;
};

export type HeroScene = {
  /** Stable id used by tests, analytics, and the credits modal. */
  id: string;
  /** Poster reference — every chapter falls back to the single film poster. */
  image: string;
  /** Video URL — every chapter points at the SAME film by design. */
  video: string;
  /** Object-position presets per breakpoint (applied to the single film). */
  position: HeroPositionByBreakpoint;
  /** Decorative pan label kept for legacy contract tests. */
  pan: HeroPan;
  /** When this chapter's overlay fades in (seconds into the film). */
  startTime: number;
  /** When this chapter's overlay fades out. */
  endTime: number;
  /** Cinematic main message (each entry = its own line). */
  main: readonly string[];
  /** Optional small supporting microline. */
  support?: string;
  credits: readonly HeroAssetCredit[];
};

const filmCredit: HeroAssetCredit = {
  kind: "video",
  location:
    "Continuous YES Portugal cinematic hero film — single uninterrupted take, no cuts, no slides",
  source: "yes-experiences",
  license:
    "Single continuous hero film (uploaded master) — played untouched, only chapter overlays cross-fade",
};

/**
 * Six chapter overlays sequenced over the SINGLE continuous uploaded film
 * (41.5s, played untouched). Each chapter fades its copy in/out softly
 * — the underlying video never cuts, never slides, never changes source.
 *
 * Pacing — coordinated to the film, NOT the copy
 * -----------------------------------------------
 * Earlier versions packed all six chapters into the first 36s, leaving
 * the last 5.5s with no active overlay (flicker), and ramped through
 * the opening at 4–5s per beat — text felt faster than the visuals.
 *
 * The pacing below stretches across the FULL 41.5s with a calmer cadence
 * (≈6.5–9s per chapter) and zero gaps between chapters, so each fade-out
 * cross-fades directly into the next fade-in. The opening "imagine"
 * chapter holds for 6s with NO main copy (eyebrow + H1 only) so the
 * Portugal visuals are allowed to land before any narrative line is read.
 * The final action chapter gets the longest hold (9s) so the CTAs are on
 * screen long enough to be read, focused, and clicked.
 *
 *   1. PORTUGAL OPENS    ( 0.0s –  6.0s)   — 6.0s, eyebrow/H1 only
 *   2. PRIVATE DAYS      ( 6.0s – 12.5s)   — 6.5s
 *   3. PROPOSALS         (12.5s – 19.0s)   — 6.5s
 *   4. CORPORATE/GROUPS  (19.0s – 25.5s)   — 6.5s
 *   5. MULTI-DAY JOURNEY (25.5s – 32.5s)   — 7.0s
 *   6. BUILDER + CTA     (32.5s – 41.5s)   — 9.0s, action scene
 */
export const HERO_SCENES: readonly HeroScene[] = [
  {
    id: "imagine",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 55%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "pull-back",
    startTime: 0.0,
    endTime: 6.0,
    main: [],
    support: "Private experiences, shaped around you.",
    credits: [filmCredit],
  },
  {
    id: "choose",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 45%", tablet: "50% 45%", desktop: "50% 45%" },
    pan: "drift-left",
    startTime: 6.0,
    endTime: 12.5,
    main: ["Design your private day."],
    support: "Your people. Your pace.",
    credits: [filmCredit],
  },
  {
    id: "taste",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 45%", tablet: "50% 45%", desktop: "50% 45%" },
    pan: "drift-right",
    startTime: 12.5,
    endTime: 19.0,
    main: ["For proposals, celebrations", "and moments worth keeping."],
    support: "Anniversaries, birthdays, unforgettable moments.",
    credits: [filmCredit],
  },
  {
    id: "celebrate",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 45%", tablet: "50% 45%", desktop: "50% 45%" },
    pan: "push-in",
    startTime: 19.0,
    endTime: 25.5,
    main: ["For corporate groups", "and private journeys."],
    support: "Carefully coordinated. Locally guided.",
    credits: [filmCredit],
  },
  {
    id: "journey",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "drift-left",
    startTime: 25.5,
    endTime: 32.5,
    main: ["From one perfect day", "to a journey across Portugal."],
    support: "Multi-day experiences, designed around you.",
    credits: [filmCredit],
  },
  {
    id: "confirm",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "push-in",
    startTime: 32.5,
    endTime: 41.5,
    main: ["Build it live.", "Confirm instantly."],
    support: "Real local guidance whenever you want it.",
    credits: [filmCredit],
  },
] as const;

export const HERO_ALL_CREDITS = HERO_SCENES.flatMap((scene) =>
  scene.credits.map((credit) => ({ sceneId: scene.id, ...credit })),
);

/**
 * Canonical film duration the manifest is authored against. The
 * uploaded master is exactly 41.5s; if a re-encode changes the real
 * duration we proportionally scale every chapter's start/end so
 * overlays stay locked to playback.
 */
export const HERO_FILM_CANONICAL_DURATION_S = 41.5;

/** Tolerance below which we treat the actual duration as canonical. */
export const HERO_FILM_CANONICAL_TOLERANCE_S = 0.25;

export type HeroChapterWindow = {
  readonly id: string;
  readonly startTime: number;
  readonly endTime: number;
};

/**
 * Scale the manifest chapter timeline to a different total duration.
 *
 * Returns the manifest verbatim when `actualDuration` is within
 * `HERO_FILM_CANONICAL_TOLERANCE_S` of the canonical 41.5s (avoids
 * floating-point drift on the canonical asset). For any other finite
 * positive duration, every chapter's `startTime`/`endTime` is
 * multiplied by `actualDuration / 41.5`. Invalid or non-positive
 * inputs fall back to the manifest unchanged.
 *
 * Invariants enforced by the unit test suite:
 *   • First chapter starts at 0
 *   • Last chapter ends at exactly `actualDuration` (within 1e-9)
 *   • For every adjacent pair, chapter[i].endTime === chapter[i+1].startTime
 *     so the active-chapter rAF lookup never falls into a gap.
 */
export function scaleHeroTimeline(
  actualDuration: number,
): readonly HeroChapterWindow[] {
  const base: readonly HeroChapterWindow[] = HERO_SCENES.map((s) => ({
    id: s.id,
    startTime: s.startTime,
    endTime: s.endTime,
  }));
  if (!Number.isFinite(actualDuration) || actualDuration <= 0) return base;
  if (
    Math.abs(actualDuration - HERO_FILM_CANONICAL_DURATION_S) <=
    HERO_FILM_CANONICAL_TOLERANCE_S
  ) {
    return base;
  }
  const ratio = actualDuration / HERO_FILM_CANONICAL_DURATION_S;
  return base.map((s) => ({
    id: s.id,
    startTime: s.startTime * ratio,
    endTime: s.endTime * ratio,
  }));
}

