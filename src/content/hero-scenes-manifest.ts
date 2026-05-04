/**
 * Hero scenes manifest — single source of truth.
 *
 * Maps each cinematic hero scene to:
 *   • its local poster image + local video URL (uniform — every scene is video)
 *   • the cinematic copy beats shown over the frame
 *   • the pan direction + object-position used by the stage
 *   • full attribution metadata for the credits modal
 *
 * The route file (`src/routes/index.tsx`) and the credits modal
 * (`src/components/home/HeroCredits.tsx`) BOTH read from this file —
 * so attribution can never drift from what's actually on screen.
 *
 * Story spine — "WHO this is for + HOW it works":
 *   1. INVITATION    — Portugal, shaped around you (the canvas)
 *   2. PRIVATE DAYS  — couples, families, small groups
 *   3. CELEBRATIONS  — proposals, anniversaries, milestones
 *   4. GROUPS        — teams, corporate, big groups, multi-day
 *   5. BUILDER       — design live, confirm instantly (CTA scene)
 *
 * Every clip is real YES Experiences footage — captured on actual
 * routes, at partner estates, and with consenting guests. Files live
 * locally under `public/video/real/` (with matching first-frame
 * posters in `public/video/real/posters/`). The route flyover used
 * for scene 5 is a YES-commissioned itinerary preview hosted on the
 * Lovable asset CDN. No stock or generic visuals.
 */

// Real YES Experiences media — clips and posters captured on actual
// YES routes. We curate the most cinematic moments for the hero
// (coastal arrival, vineyard walk with guests, friends toasting,
// vineyard tasting / wine cellar for groups & corporate). Operational
// media (minibus arrival, indoor snapshots, workshops) is reserved
// for logistics / proof sections lower on the page — never the hero.
// The route flyover used for scene 5 is a YES-commissioned itinerary
// preview hosted on the Lovable asset CDN.
// Hero clips are cinematic 1080p reels generated from real YES
// Experiences source footage (the original `comporta-beach.mp4`,
// `vineyard-walk.mp4`, `friends-toast.mp4`, `vineyard-tasting.mp4`
// and the YES-commissioned route flyover). Each scene is a fresh
// motion piece — no static images in the hero — with framing and
// pacing curated so:
//   • every scene is a true video (drift, push, pull-back) — no stills
//   • no faces are in tight close-up or chin-cropped on any breakpoint
//   • the message on the slide is supported visually (a couple/family
//     for private days, a sunset toast for proposals/celebrations,
//     a long-table group for teams, a route flyover for the close)
//   • the look stays warm, slightly desaturated, premium editorial
//     — never operational/stock/behind-the-scenes
// Original raw YES clips remain in the repo for use later in
// galleries / proof / logistics sections (never the hero).
const imgInvitation = "/video/real/posters/scene-imagine.jpg";
const imgPrivateDay = "/video/real/posters/scene-choose.jpg";
const imgCelebration = "/video/real/posters/scene-taste.jpg";
const imgGroups = "/video/real/posters/scene-celebrate.jpg";
const imgRoute = "/video/real/posters/scene-confirm.jpg";

const invitationVideo =
  "/__l5e/assets-v1/7b5ce8f2-65f9-485f-9184-64a4a45e0148/scene-imagine.mp4";
const privateDayVideo =
  "/__l5e/assets-v1/0a645ca2-c1fb-40c9-95ff-43b28dc47822/scene-choose.mp4";
const celebrationVideo =
  "/__l5e/assets-v1/ad733e27-d2ec-4ba1-8bff-a7f313d366f3/scene-taste.mp4";
const groupsVideo =
  "/__l5e/assets-v1/edc0e2bc-5efa-4e6a-9188-3aac141c1785/scene-celebrate.mp4";
const routeVideo =
  "/__l5e/assets-v1/c8358905-b88c-497d-81e8-d48c912bea25/scene-confirm.mp4";

export type HeroPan = "drift-left" | "drift-right" | "push-in" | "pull-back";

export type HeroAssetSource = "viator" | "pexels" | "unsplash" | "in-house" | "yes-experiences";

export type HeroAssetCredit = {
  /** Short kind label rendered in the modal — e.g. "Video", "Photo". */
  kind: "video" | "photo";
  /** Human-readable scene label (where in Portugal). */
  location: string;
  /** Photographer / videographer attribution, when applicable. */
  photographer?: string;
  /** Origin platform. */
  source: HeroAssetSource;
  /** Canonical link back to the asset page (REQUIRED for stock). */
  sourceUrl?: string;
  /** Short license string published by the source. */
  license: string;
};

/**
 * Per-breakpoint object-position presets. `mobile` covers ≤767px (tall
 * portrait — heads/horizons must stay clear of the bottom scrim and CTA
 * stack), `tablet` covers 768–1199px (landscape, more horizontal room),
 * `desktop` covers ≥1200px (cinemascope-style framing). All three are
 * required so the breakpoint swap is deterministic — no fallbacks at
 * runtime, no resize observers, just CSS @media transitions.
 */
export type HeroPositionByBreakpoint = {
  readonly mobile: string;
  readonly tablet: string;
  readonly desktop: string;
};

export type HeroScene = {
  id: string;
  /** Poster / fallback still — always required. */
  image: string;
  /** Looped clip URL — required for uniform motion across the reel. */
  video: string;
  /**
   * CSS object-position for the still + video, per breakpoint. The
   * route emits a `<style>` block driven by these tokens so framing
   * adjusts at the CSS layer (no JS resize listeners). The desktop
   * value also acts as the inline `style.objectPosition` so SSR + the
   * first paint already use the correct framing for ≥1200px viewports.
   */
  position: HeroPositionByBreakpoint;
  /** Ken-Burns pan applied to the active slide. */
  pan: HeroPan;
  /** Cinematic main message (each entry = its own line). */
  main: readonly string[];
  /** Optional small supporting microline. */
  support?: string;
  /**
   * Credits for everything the user sees in this scene. Both image and
   * video are listed when both exist, so the modal can attribute each.
   */
  credits: readonly HeroAssetCredit[];
};

/**
 * Cinematic 5-scene story — anchored on the core promise:
 * "You design the trip. Real Portugal answers."
 *
 * Copy rules applied:
 *  • The verb on every slide is the GUEST's verb, not ours.
 *  • Each main line is two short beats; reads in ~1.2s.
 *  • Supports add a concrete proof, never a slogan.
 *  • CTAs reveal ONLY on scene 5 (handled in the route).
 *  • Pans alternate to keep the reel premium and avoid drift fatigue.
 */
export const HERO_SCENES: readonly HeroScene[] = [
  {
    id: "imagine",
    image: imgInvitation,
    video: invitationVideo,
    // Beach + horizon: on mobile we sit low so sand fills under the
    // headline; tablet/desktop centre the horizon classically.
    position: { mobile: "50% 68%", tablet: "50% 58%", desktop: "50% 55%" },
    pan: "pull-back",
    main: ["Portugal,", "shaped your way."],
    support: "Private experiences, made for you.",
    credits: [
      {
        kind: "video",
        location: "Comporta beach at golden hour — Alentejo coast, Portugal",
        source: "yes-experiences",
        license: "Captured on a real YES Experiences route",
      },
    ],
  },
  {
    id: "choose",
    image: imgPrivateDay,
    video: privateDayVideo,
    // Walking guests — anchor to upper third so heads stay safely framed
    // on tall mobile (393×587) and don't crop on landscape tablet.
    position: { mobile: "50% 32%", tablet: "50% 38%", desktop: "50% 42%" },
    pan: "drift-left",
    main: ["For couples, families", "and private groups."],
    support: "Your people. Your pace. Your Portugal.",
    credits: [
      {
        kind: "video",
        location: "Vineyard walk with guests — Setúbal wine region, Portugal",
        source: "yes-experiences",
        license: "Captured on a real YES Experiences route",
      },
    ],
  },
  {
    id: "taste",
    image: imgCelebration,
    video: celebrationVideo,
    // Friends toasting at a Setúbal estate — keep glasses + faces in
    // the upper-mid third on mobile (no chin-crop) and ease them down
    // toward classical centre on wider viewports.
    position: { mobile: "50% 38%", tablet: "50% 44%", desktop: "50% 48%" },
    pan: "drift-right",
    main: ["For proposals,", "celebrations,", "and moments worth keeping."],
    support: "Anniversaries, birthdays, sunset toasts.",
    credits: [
      {
        kind: "video",
        location: "Friends toasting at a Setúbal estate — Portugal",
        source: "yes-experiences",
        license: "Captured on a real YES Experiences route",
      },
    ],
  },
  {
    id: "celebrate",
    image: imgGroups,
    video: groupsVideo,
    // Group tasting at a long table — keep heads above mid-line so
    // they never get clipped by the bottom gradient on mobile.
    position: { mobile: "50% 36%", tablet: "50% 42%", desktop: "50% 48%" },
    pan: "push-in",
    main: ["For teams, groups", "and shared journeys."],
    support: "Private, local and carefully coordinated.",
    credits: [
      {
        kind: "video",
        location: "Private group tasting at a Setúbal estate — Portugal",
        source: "yes-experiences",
        license: "Captured on a real YES Experiences route",
      },
    ],
  },
  {
    id: "confirm",
    image: imgRoute,
    video: routeVideo,
    position: { mobile: "50% 50%", tablet: "50% 50%", desktop: "50% 50%" },
    pan: "push-in",
    main: ["Design it live.", "Confirm instantly."],
    support: "Real local guidance whenever you want it.",
    credits: [
      {
        kind: "video",
        location: "Route drawn across Portugal — itinerary preview",
        source: "yes-experiences",
        license: "Captured for YES Experiences",
      },
    ],
  },
] as const;

/** Convenience flat list of every credit across all scenes. */
export const HERO_ALL_CREDITS = HERO_SCENES.flatMap((scene) =>
  scene.credits.map((credit) => ({ sceneId: scene.id, ...credit })),
);
