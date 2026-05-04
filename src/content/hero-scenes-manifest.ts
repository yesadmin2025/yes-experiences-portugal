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
  /** Total film length in seconds (matches the stitched MP4). */
  durationSeconds: 27.6,
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
    "Continuous cinematic film — Comporta beach, Setúbal vineyards, Alentejo estate, coastal road across Portugal",
  source: "yes-experiences",
  license:
    "AI-extended cinematic film, anchored on real YES Experiences poster frames",
};

/**
 * Six chapter overlays sequenced over the SINGLE continuous film.
 * Timestamps are in seconds and chosen so each beat lands in the
 * matching cinematic moment of the stitched MP4 (10s per source clip,
 * with 1.2s crossfades between them).
 */
export const HERO_SCENES: readonly HeroScene[] = [
  {
    id: "imagine",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 55%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "pull-back",
    startTime: 0.4,
    endTime: 5.0,
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
    startTime: 5.4,
    endTime: 10.0,
    main: ["Design your private day."],
    support: "Your people. Your pace. Your Portugal.",
    credits: [filmCredit],
  },
  {
    id: "taste",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 45%", tablet: "50% 45%", desktop: "50% 45%" },
    pan: "drift-right",
    startTime: 10.4,
    endTime: 14.5,
    main: ["For proposals,", "celebrations,", "moments worth keeping."],
    support: "Birthdays, anniversaries, yes-moments.",
    credits: [filmCredit],
  },
  {
    id: "celebrate",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 45%", tablet: "50% 45%", desktop: "50% 45%" },
    pan: "push-in",
    startTime: 14.9,
    endTime: 19.0,
    main: ["For corporate groups,", "teams and private journeys."],
    support: "Carefully coordinated. Locally guided.",
    credits: [filmCredit],
  },
  {
    id: "journey",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "drift-left",
    startTime: 19.4,
    endTime: 23.4,
    main: ["From one perfect day", "to a journey across Portugal."],
    support: "Every route shaped around your rhythm.",
    credits: [filmCredit],
  },
  {
    id: "confirm",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "push-in",
    startTime: 23.8,
    endTime: 27.6,
    main: ["Build it live.", "Confirm instantly."],
    support: "Real local guidance, every step of the way.",
    credits: [filmCredit],
  },
] as const;

export const HERO_ALL_CREDITS = HERO_SCENES.flatMap((scene) =>
  scene.credits.map((credit) => ({ sceneId: scene.id, ...credit })),
);
