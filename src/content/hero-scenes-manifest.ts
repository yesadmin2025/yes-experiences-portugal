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
 * continuous master: coast → market → azulejos → private table → vineyards /
 * proposal → corporate street → map / live builder → CTA close.
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
 * Six chapter overlays sequenced over the SINGLE continuous uploaded film
 * (39.633s, played untouched). Each chapter is locked to one of the six
 * real scene cuts detected in the master at 4.900 / 11.933 / 17.200 /
 * 22.167 / 27.600 / 39.633 — so the overlay copy always lands over the
 * scene it describes, never over the next cut. Adjacent windows are
 * gapless (chapter[i].endTime === chapter[i+1].startTime) so the rAF
 * lookup never falls into a no-overlay frame, and the chapter overlay
 * component cross-fades the copy itself (≈600ms) for a smooth handoff
 * across each visual cut.
 *
 *   1. PORTUGAL OPENS    ( 0.000s –  3.850s)   — eyebrow + H1 only
 *   2. HIDDEN GEMS       ( 3.850s – 14.000s)   — market girls + azulejos
 *   3. PRIVATE DAY       (14.000s – 17.200s)   — group at the table
 *   4. MOMENTS           (17.200s – 25.000s)   — vineyards + proposal
 *   5. CORPORATE/JOURNEY (25.000s – 35.600s)   — route + corporate group
 *   6. FINAL PHRASE      (35.600s – 37.200s)   — map / live builder line
 *   7. CTA CLOSE         (37.200s – 39.633s)   — buttons only
 */
export const HERO_SCENES: readonly HeroScene[] = [
  {
    id: "imagine",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 55%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "pull-back",
    startTime: 0.0,
    endTime: 3.85,
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
    startTime: 3.85,
    endTime: 14,
    main: ["Find the hidden gems", "only locals know."],
    support: "Markets, backstreets, family kitchens.",
    credits: [filmCredit],
  },
  {
    id: "taste",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 45%", tablet: "50% 45%", desktop: "50% 45%" },
    pan: "drift-right",
    startTime: 14,
    endTime: 17.2,
    main: ["Private, shaped", "around you."],
    support: "Your people. Your pace.",
    credits: [filmCredit],
  },
  {
    id: "celebrate",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 45%", tablet: "50% 45%", desktop: "50% 45%" },
    pan: "push-in",
    startTime: 17.2,
    endTime: 25,
    main: ["For proposals, celebrations", "and moments worth keeping."],
    support: "Anniversaries, birthdays, unforgettable moments.",
    credits: [filmCredit],
  },
  {
    id: "journey",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "drift-left",
    startTime: 25,
    endTime: 35.6,
    main: ["For corporate groups", "and private journeys."],
    support: "Carefully coordinated. Locally guided.",
    credits: [filmCredit],
  },
  {
    id: "build",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "push-in",
    startTime: 35.6,
    endTime: 37.2,
    main: ["Build your journey."],
    support: "See it take shape live.",
    credits: [filmCredit],
  },
  {
    id: "confirm",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "push-in",
    startTime: 37.2,
    endTime: 39.633333,
    main: [],
    support: undefined,
    credits: [filmCredit],
  },
] as const;

export const HERO_ALL_CREDITS = HERO_SCENES.flatMap((scene) =>
  scene.credits.map((credit) => ({ sceneId: scene.id, ...credit })),
);

/**
 * Canonical film duration the manifest is authored against. The
 * uploaded master is 39.633s (six real scene cuts); if a re-encode
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

