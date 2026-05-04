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
 * Story spine — "YOU design the trip":
 *   1. IMAGINE   — open landscape, the canvas is yours
 *   2. CHOOSE    — paths split, you pick the direction
 *   3. TASTE     — what locals pour, picked by you
 *   4. CELEBRATE — the moment your design becomes a memory
 *   5. CONFIRM   — built live, confirmed instantly
 *
 * Every clip is real Portugal footage hosted locally under
 * `public/video/real/`. No images-only scenes — uniform motion across
 * the whole reel. No transport / arrival imagery in the opener — the
 * story starts with the guest's imagination, not logistics.
 */

// Posters and videos live in `public/video/real/` so they're served
// at stable URLs (same-origin, cacheable, no Vite hashing). Reference
// them as plain absolute paths — no import indirection.
const imgVineyard = "/video/real/posters/vineyard-walk.jpg";
const imgPier = "/video/real/posters/carrasqueira-pier.jpg";
const imgTasting = "/video/real/posters/vineyard-tasting.jpg";
const imgToast = "/video/real/posters/friends-toast.jpg";
const imgCellar = "/video/real/posters/wine-cellar.jpg";

const vineyardVideo = "/video/real/vineyard-walk.mp4";
const pierVideo = "/video/real/carrasqueira-pier.mp4";
const tastingVideo = "/video/real/vineyard-tasting.mp4";
const toastVideo = "/video/real/friends-toast.mp4";
const cellarVideo = "/video/real/wine-cellar.mp4";

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
    image: imgVineyard,
    video: vineyardVideo,
    position: "50% 55%",
    pan: "push-in",
    main: ["You picture", "the day."],
    support: "We hold the canvas.",
    credits: [
      {
        kind: "video",
        location: "Vineyard at first light — Azeitão, Setúbal",
        source: "yes-experiences",
        license: "Captured on a real YES Experiences route",
      },
    ],
  },
  {
    id: "choose",
    image: imgPier,
    video: pierVideo,
    position: "50% 50%",
    pan: "drift-left",
    main: ["You choose", "the path."],
    support: "Coast, vine, ruins, river.",
    credits: [
      {
        kind: "video",
        location: "Carrasqueira stilt pier — Comporta, Alentejo",
        source: "yes-experiences",
        license: "Captured on a real YES Experiences route",
      },
    ],
  },
  {
    id: "taste",
    image: imgTasting,
    video: tastingVideo,
    position: "50% 50%",
    pan: "drift-right",
    main: ["You taste", "what locals pour."],
    support: "Estates, kitchens, families.",
    credits: [
      {
        kind: "video",
        location: "Tasting at a partner estate — Azeitão, Setúbal",
        source: "yes-experiences",
        license: "Captured at a partner estate",
      },
    ],
  },
  {
    id: "celebrate",
    image: imgToast,
    video: toastVideo,
    position: "50% 50%",
    pan: "push-in",
    main: ["You raise", "the glass."],
    support: "The moment your trip turns into a memory.",
    credits: [
      {
        kind: "video",
        location: "Long-table lunch — Setúbal, Portugal",
        source: "yes-experiences",
        license: "Captured with consenting guests",
      },
    ],
  },
  {
    id: "confirm",
    image: imgCellar,
    video: cellarVideo,
    position: "50% 50%",
    pan: "pull-back",
    main: ["You design it.", "We confirm it."],
    support: "Built live. No forms. No waiting.",
    credits: [
      {
        kind: "video",
        location: "Cellar close — Setúbal, Portugal",
        source: "yes-experiences",
        license: "Captured at a partner estate",
      },
    ],
  },
] as const;

/** Convenience flat list of every credit across all scenes. */
export const HERO_ALL_CREDITS = HERO_SCENES.flatMap((scene) =>
  scene.credits.map((credit) => ({ sceneId: scene.id, ...credit })),
);
