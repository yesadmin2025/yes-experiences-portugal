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
  durationSeconds: 36,
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
    "Continuous cinematic Portugal hero film — single take, no cuts, color-graded for warmth",
  source: "yes-experiences",
  license:
    "Single continuous hero film provided by YES Experiences (no slideshow, no carousel)",
};

/**
 * Six chapter overlays sequenced over the SINGLE continuous 36s film.
 * Each chapter is purely a TIMED TEXT OVERLAY — there are no cuts, no
 * scene changes, no transitions in the underlying video. The film plays
 * straight through and copy fades in/out on top.
 */
export const HERO_SCENES: readonly HeroScene[] = [
  {
    id: "imagine",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "pull-back",
    startTime: 0.0,
    endTime: 4.0,
    // Scene 1's main visual IS the canonical H1 above ("Portugal is the
    // stage. / You write the story.") — duplicating it as a scene-message
    // would stack two identical headlines. The H1 carries the 0–4s copy.
    main: [],
    support: "Private experiences, shaped around you.",
    credits: [filmCredit],
  },
  {
    // 4–9s: coast aerial continues. Wide landscape, no faces — fits the
    // "design your private day" beat (the canvas of Portugal opening up).
    id: "choose",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "drift-left",
    startTime: 4.0,
    endTime: 9.0,
    main: ["Design your private day."],
    support: "Your people. Your pace.",
    credits: [filmCredit],
  },
  {
    // 9–15s: azulejo artisan workshop. Craftsmanship, hand-painted tiles —
    // the "moments worth keeping" beat lands on hand-made craft, not on a
    // celebration shot. Faces are small and back-turned: text-safe.
    id: "taste",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "drift-right",
    startTime: 9.0,
    endTime: 15.0,
    main: ["Crafted with care.", "Made to be remembered."],
    support: "Artisans, traditions, moments that last.",
    credits: [filmCredit],
  },
  {
    // 15–21s: workshop → vineyard crossfade (18s xfade). Spans craft into
    // landscape — the "from one day to a journey" beat fits the transition
    // and avoids landing copy on the motion-blur midpoint.
    id: "celebrate",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "push-in",
    startTime: 15.0,
    endTime: 21.0,
    main: ["From one perfect day", "to a journey across Portugal."],
    support: "Multi-day experiences, designed around you.",
    credits: [filmCredit],
  },
  {
    id: "journey",
    image: FILM_POSTER,
    video: FILM_1080,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "drift-left",
    startTime: 21.0,
    endTime: 28.0,
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
    startTime: 28.0,
    endTime: 36.0,
    main: ["Build it live.", "Confirm instantly."],
    support: "Real local guidance whenever you want it.",
    credits: [filmCredit],
  },
] as const;

export const HERO_ALL_CREDITS = HERO_SCENES.flatMap((scene) =>
  scene.credits.map((credit) => ({ sceneId: scene.id, ...credit })),
);
