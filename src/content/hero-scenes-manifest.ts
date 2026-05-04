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
 * Adding/replacing a scene clip: update the entry here ONLY. Imagery
 * is local-hosted (project assets or `/video/*` mp4 served via the
 * .asset.json indirection) so the runtime never hot-links external
 * CDNs and credits stay verifiable.
 *
 * Attribution rules:
 *   • photographer / source / sourceUrl are REQUIRED for any non-Viator
 *     stock asset (Pexels, Unsplash, etc.).
 *   • license is REQUIRED — use the canonical short string published
 *     by the source ("Pexels License", "Unsplash License", etc.).
 *   • For Viator-sourced operation imagery, set `source: "viator"` and
 *     leave photographer empty — the modal renders a generic
 *     "Operation imagery — Viator-sourced" line.
 */

import heroImg from "@/assets/hero-coast.jpg";
import imgSesimbraVillage from "@/assets/tours/arrabida-wine-allinclusive/sesimbra.jpg";
import imgAzeitaoWinery from "@/assets/tours/azeitao-cheese/winery.jpg";
import imgArrabidaViewpoint from "@/assets/tours/arrabida-wine-allinclusive/viewpoint.jpg";
import imgSintraCaboDaRoca from "@/assets/tours/sintra-cascais/cabo-da-roca.jpg";

// Real Portugal motion clips — each generated from a real Viator-sourced
// Portugal still (Arrábida coast, Sesimbra street, Azeitão winery,
// Arrábida viewpoint, Cabo da Roca). Right-to-left drift matches the
// film-strip direction so the whole hero reads as one continuous reel.
import sceneCoastArrabida from "../../public/video/scene-coast-arrabida.mp4.asset.json";
import sceneSesimbraStreet from "../../public/video/scene-sesimbra-street.mp4.asset.json";
import sceneAzeitaoTable from "../../public/video/scene-azeitao-table.mp4.asset.json";
import sceneArrabidaViewpoint from "../../public/video/scene-arrabida-viewpoint.mp4.asset.json";
import sceneCaboDaRoca from "../../public/video/scene-cabo-da-roca.mp4.asset.json";

export type HeroPan = "drift-left" | "drift-right" | "push-in" | "pull-back";

export type HeroAssetSource = "viator" | "pexels" | "unsplash" | "in-house";

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
 * Cinematic 5-scene story. CTAs reveal ONLY on scene 5 (handled in
 * the route). Imagery is real Portugal — Viator operation photography
 * for the stills, real-Portugal stock video clips for the motion.
 */
export const HERO_SCENES: readonly HeroScene[] = [
  {
    id: "opening",
    image: heroImg,
    video: sceneCoastArrabida.url,
    position: "50% 52%",
    pan: "drift-left",
    main: [],
    support: "Private. Local. Yours.",
    credits: [
      {
        kind: "photo",
        location: "Atlantic coast — Arrábida, Portugal",
        source: "viator",
        license: "Operation imagery — used with permission",
      },
      {
        kind: "video",
        location: "Atlantic coast — Arrábida, Portugal",
        source: "in-house",
        license: "Animated from Viator-sourced still",
      },
    ],
  },
  {
    id: "hidden",
    image: imgSesimbraVillage,
    video: sceneSesimbraStreet.url,
    position: "52% 50%",
    pan: "drift-left",
    main: ["Hidden corners,", "found by locals."],
    support: "Beyond the obvious.",
    credits: [
      {
        kind: "photo",
        location: "Sesimbra fishing village — Setúbal, Portugal",
        source: "viator",
        license: "Operation imagery — used with permission",
      },
      {
        kind: "video",
        location: "Sesimbra street — Setúbal, Portugal",
        source: "in-house",
        license: "Animated from Viator-sourced still",
      },
    ],
  },
  {
    id: "local-moments",
    image: imgAzeitaoWinery,
    video: sceneAzeitaoTable.url,
    position: "50% 56%",
    pan: "drift-left",
    main: ["A table,", "a story,", "a place."],
    support: "Wine, food, rhythm.",
    credits: [
      {
        kind: "photo",
        location: "Azeitão winery — Setúbal, Portugal",
        source: "viator",
        license: "Operation imagery — used with permission",
      },
      {
        kind: "video",
        location: "Azeitão winery — Setúbal, Portugal",
        source: "in-house",
        license: "Animated from Viator-sourced still",
      },
    ],
  },
  {
    id: "occasions",
    image: imgArrabidaViewpoint,
    video: sceneArrabidaViewpoint.url,
    position: "50% 50%",
    pan: "drift-left",
    main: ["A day. A toast.", "Something unforgettable."],
    support: "The occasion shapes the day.",
    credits: [
      {
        kind: "photo",
        location: "Arrábida viewpoint — Setúbal, Portugal",
        source: "viator",
        license: "Operation imagery — used with permission",
      },
      {
        kind: "video",
        location: "Arrábida viewpoint — Setúbal, Portugal",
        source: "in-house",
        license: "Animated from Viator-sourced still",
      },
    ],
  },
  {
    id: "action",
    image: imgSintraCaboDaRoca,
    video: sceneCaboDaRoca.url,
    position: "50% 50%",
    pan: "drift-left",
    main: ["Build it live.", "Confirm instantly."],
    support: "No forms. No waiting.",
    credits: [
      {
        kind: "photo",
        location: "Cabo da Roca — Sintra-Cascais, Portugal",
        source: "viator",
        license: "Operation imagery — used with permission",
      },
      {
        kind: "video",
        location: "Cabo da Roca — Sintra-Cascais, Portugal",
        source: "in-house",
        license: "Animated from Viator-sourced still",
      },
    ],
  },
] as const;

/** Convenience flat list of every credit across all scenes. */
export const HERO_ALL_CREDITS = HERO_SCENES.flatMap((scene) =>
  scene.credits.map((credit) => ({ sceneId: scene.id, ...credit })),
);
