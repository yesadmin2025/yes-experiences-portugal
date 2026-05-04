/**
 * Hero scenes manifest — single source of truth.
 *
 * Maps each cinematic hero scene to:
 *   • its local poster image + (optional) local video URL
 *   • the cinematic copy beats shown over the frame
 *   • the pan direction + object-position used by the stage
 *   • full attribution metadata for the credits modal
 *
 * The route file (`src/routes/index.tsx`) and the credits modal
 * (`src/components/home/HeroCredits.tsx`) BOTH read from this file —
 * so attribution can never drift from what's actually on screen.
 *
 * Visual story (conversion-tuned, 5 beats):
 *   1. ARRIVAL    — private vehicle, real hosts greeting real guests
 *   2. DISCOVERY  — places only locals know (Roman ruins on the Sado)
 *   3. LOCAL      — wine, food, real Portuguese hands at work
 *   4. CELEBRATE  — the toast that turns a trip into a memory
 *   5. ACTION     — vineyard walk, ready to build it live
 *
 * All five clips are real Portugal footage, real guests, real
 * operations — no AI-generated visuals. Hosted locally under
 * `public/video/real/` for control over compression + attribution.
 */

import imgArrival from "/video/real/posters/arrival-minibus.jpg?url";
import imgRuins from "/video/real/posters/troia-ruins.jpg?url";
import imgWine from "/video/real/posters/vineyard-tasting.jpg?url";
import imgToast from "/video/real/posters/friends-toast.jpg?url";
import imgVineyard from "/video/real/posters/vineyard-walk.jpg?url";

const arrivalVideo = "/video/real/arrival-minibus.mp4";
const ruinsVideo = "/video/real/troia-ruins.mp4";
const wineVideo = "/video/real/vineyard-tasting.mp4";
const toastVideo = "/video/real/friends-toast.mp4";
const vineyardVideo = "/video/real/vineyard-walk.mp4";

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
  /** Optional looped clip URL. Falls back to `image` when omitted. */
  video?: string;
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
 * Cinematic 5-scene story, conversion-tuned.
 *
 * Copy rules applied:
 *  • No repeated phrases across slides.
 *  • Sentence case, short. Every line readable in 1.2s.
 *  • Each slide answers ONE buyer question:
 *      1. Who picks me up?       → "We come to you."
 *      2. What will I see?       → "Places locals keep."
 *      3. Who's behind it?       → "Made by real hands."
 *      4. How will it feel?      → "The moment you'll retell."
 *      5. How do I start?        → "Build it live. Confirm now."
 *  • CTAs reveal ONLY on scene 5 (handled in the route).
 */
export const HERO_SCENES: readonly HeroScene[] = [
  {
    id: "arrival",
    image: imgArrival,
    video: arrivalVideo,
    position: "50% 55%",
    pan: "drift-left",
    main: ["We come", "to you."],
    support: "Private. Door to door.",
    credits: [
      {
        kind: "video",
        location: "Private arrival — Setúbal, Portugal",
        source: "yes-experiences",
        license: "Captured on a real YES Experiences departure",
      },
    ],
  },
  {
    id: "discovery",
    image: imgRuins,
    video: ruinsVideo,
    position: "50% 50%",
    pan: "drift-left",
    main: ["Places", "locals keep."],
    support: "Off the postcard.",
    credits: [
      {
        kind: "video",
        location: "Roman ruins of Tróia — Setúbal, Portugal",
        source: "yes-experiences",
        license: "Captured on a real YES Experiences route",
      },
    ],
  },
  {
    id: "local-hands",
    image: imgWine,
    video: wineVideo,
    position: "50% 50%",
    pan: "drift-left",
    main: ["Made by", "real hands."],
    support: "Wine, food, families.",
    credits: [
      {
        kind: "video",
        location: "Vineyard tasting — Azeitão, Setúbal",
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
    pan: "drift-left",
    main: ["The moment", "you'll retell."],
    support: "Toast. Laugh. Stay longer.",
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
    id: "action",
    image: imgVineyard,
    video: vineyardVideo,
    position: "50% 50%",
    pan: "drift-left",
    main: ["Build it live.", "Confirm now."],
    support: "No forms. No waiting.",
    credits: [
      {
        kind: "video",
        location: "Vineyard walk — Azeitão, Setúbal",
        source: "yes-experiences",
        license: "Captured on a real YES Experiences day",
      },
    ],
  },
] as const;

/** Convenience flat list of every credit across all scenes. */
export const HERO_ALL_CREDITS = HERO_SCENES.flatMap((scene) =>
  scene.credits.map((credit) => ({ sceneId: scene.id, ...credit })),
);
