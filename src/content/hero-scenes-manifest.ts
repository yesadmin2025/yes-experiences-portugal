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
const imgInvitation = "/video/real/posters/comporta-beach.jpg";
const imgPrivateDay = "/video/real/posters/vineyard-walk.jpg";
// Scene 3 (proposals / celebrations / moments) uses the wine-cellar clip:
// candlelit, atmospheric, no tight face close-ups — reads premium and
// emotional on every breakpoint instead of a literal toast crop.
const imgCelebration = "/video/real/posters/wine-cellar.jpg";
const imgGroups = "/video/real/posters/vineyard-tasting.jpg";
const imgRoute = "/video/posters/scene-route-portugal.jpg";

const invitationVideo = "/video/real/comporta-beach.mp4";
const privateDayVideo = "/video/real/vineyard-walk.mp4";
const celebrationVideo = "/video/real/wine-cellar.mp4";
const groupsVideo = "/video/real/vineyard-tasting.mp4";
const routeVideo =
  "/__l5e/assets-v1/501885a8-7399-4591-99fc-1c410b24c428/scene-route-portugal.mp4";

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

export type HeroScene = {
  id: string;
  /** Poster / fallback still — always required. */
  image: string;
  /** Looped clip URL — required for uniform motion across the reel. */
  video: string;
  /** CSS object-position for the still + video. */
  position: string;
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
    position: "50% 55%",
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
    position: "50% 50%",
    pan: "drift-left",
    main: ["For one private day,", "or a small group escape."],
    support: "Couples, families, friends — at your rhythm.",
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
    position: "50% 45%",
    pan: "drift-right",
    main: ["For proposals,", "celebrations,", "and moments worth keeping."],
    support: "Anniversaries, birthdays, moments that stay.",
    credits: [
      {
        kind: "video",
        location: "Friends toasting on a private day — Portugal",
        source: "yes-experiences",
        license: "Captured with consenting guests",
      },
    ],
  },
  {
    id: "celebrate",
    image: imgGroups,
    video: groupsVideo,
    position: "50% 50%",
    pan: "push-in",
    main: ["For teams, groups,", "and shared journeys."],
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
    position: "50% 50%",
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
