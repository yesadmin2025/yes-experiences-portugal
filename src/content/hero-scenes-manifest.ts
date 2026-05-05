/**
 * Hero film manifest — single source of truth.
 *
 * The hero is ONE continuous cinematic brand film (~39.6s, 30fps, 1080×1920)
 * — NOT a slideshow, NOT a carousel, NOT five stacked videos. The film is
 * finished from YES Experiences source material with warm color-graded dissolves, so
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
 * Story spine — chapter overlays locked to the real visual beats in the
 * continuous master: Portugal opens → market / azulejos → private table →
 * celebrations → corporate table → couple / boat → Portugal journey → map CTA.
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
  /** Total film length in seconds (matches the continuous MP4 master). */
  durationSeconds: 39.633333,
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
 * Chapter overlays sequenced over the SINGLE continuous premium remaster
 * (39.633s). The restored master keeps the original map / computer-map frames,
 * aligns corporate with the real corporate table beat, and keeps the Portugal
 * map as the final CTA frame.
 * Adjacent windows are gapless (chapter[i].endTime === chapter[i+1].startTime)
 * so the rAF lookup never falls into a no-overlay frame.
 *
 *   1. PORTUGAL OPENS    ( 0.000s –  3.700s)   — eyebrow + H1 only
 *   2. HIDDEN GEMS       ( 3.700s – 13.200s)   — market → azulejos
 *   3. PRIVATE DAY       (13.200s – 17.200s)   — private table
 *   4. CELEBRATIONS      (17.200s – 21.200s)   — vineyards / celebration
 *   5. CORPORATE         (21.200s – 24.000s)   — corporate table
 *   6. PERFECT DAY       (24.000s – 28.000s)   — couple → boat
 *   7. PORTUGAL JOURNEY  (28.000s – 36.000s)   — monument / city / live map
 *   8. CTA CLOSE         (36.000s – 39.633s)   — buttons on map frames
 */
export const HERO_SCENES: readonly HeroScene[] = [
  {
    id: "imagine",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 55%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "pull-back",
    startTime: 0.0,
    endTime: 3.7,
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
    startTime: 3.7,
    endTime: 13.2,
    main: ["Hidden gems,", "quietly revealed."],
    support: "Markets, azulejos, local rhythm.",
    credits: [filmCredit],
  },
  {
    id: "corporate",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "drift-left",
    startTime: 21.2,
    endTime: 24.0,
    main: ["For teams", "with purpose."],
    support: "Corporate tables, privately orchestrated.",
    credits: [filmCredit],
  },
  {
    id: "taste",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 45%", tablet: "50% 45%", desktop: "50% 45%" },
    pan: "drift-right",
    startTime: 13.2,
    endTime: 17.2,
    main: ["Your private day,", "crafted around you."],
    support: "Your people. Your pace. Your Portugal.",
    credits: [filmCredit],
  },
  {
    id: "celebrate",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 45%", tablet: "50% 45%", desktop: "50% 45%" },
    pan: "push-in",
    startTime: 17.2,
    endTime: 21.2,
    main: ["Celebrations", "made effortless."],
    support: "Milestones shaped with care.",
    credits: [filmCredit],
  },
  {
    id: "journey",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "push-in",
    startTime: 24.0,
    endTime: 28.0,
    main: ["One perfect day", "to remember."],
    support: "A couple, a coast, a story in motion.",
    credits: [filmCredit],
  },
  {
    id: "build",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "push-in",
    startTime: 28.0,
    endTime: 36.0,
    main: ["A journey", "across Portugal."],
    support: "From landmark to route, designed as one flow.",
    credits: [filmCredit],
  },
  {
    id: "confirm",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "push-in",
    startTime: 36.0,
    endTime: 39.633333,
    main: [],
    credits: [filmCredit],
  },
] as const;

export const HERO_ALL_CREDITS = HERO_SCENES.flatMap((scene) =>
  scene.credits.map((credit) => ({ sceneId: scene.id, ...credit })),
);

/**
 * Canonical film duration the manifest is authored against. The
 * uploaded master is 27.133s (premium remaster); if a re-encode
 * changes the real duration we proportionally scale every chapter's
 * start/end so overlays stay locked to playback.
 */
export const HERO_FILM_CANONICAL_DURATION_S = 39.633333;

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
 *   • Last chapter ends at exactly `actualDuration` (within 1e-6)
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

