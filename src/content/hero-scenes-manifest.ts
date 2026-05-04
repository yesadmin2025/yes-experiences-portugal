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
import imgSesimbraVillage from "@/assets/tours/arrabida-boat/sesimbra.jpg";
import imgAzeitaoWinery from "@/assets/tours/azeitao-cheese/winery.jpg";
import imgArrabidaViewpoint from "@/assets/tours/arrabida-wine-allinclusive/viewpoint.jpg";
import imgSintraCaboDaRoca from "@/assets/tours/sintra-cascais/cabo-da-roca.jpg";

import sceneHiddenStreet from "../../public/video/scene-hidden-street.mp4.asset.json";
import sceneLocalTable from "../../public/video/scene-local-table.mp4.asset.json";
import sceneCelebration from "../../public/video/scene-celebration.mp4.asset.json";
import sceneRoutePortugal from "../../public/video/scene-route-portugal.mp4.asset.json";

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
    video: "/video/hero-coast.mp4",
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
        location: "Atlantic coast — Portugal",
        source: "in-house",
        license: "Project-owned footage",
      },
    ],
  },
  {
    id: "hidden",
    image: imgSesimbraVillage,
    video: sceneHiddenStreet.url,
    position: "52% 50%",
    pan: "drift-left",
    main: ["Hidden places,", "chosen your way."],
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
        location: "Hidden street — Portugal",
        source: "pexels",
        license: "Pexels License (free to use)",
        sourceUrl: "https://www.pexels.com/",
      },
    ],
  },
  {
    id: "local-moments",
    image: imgAzeitaoWinery,
    video: sceneLocalTable.url,
    position: "50% 56%",
    pan: "push-in",
    main: ["Local moments,", "shaped around you."],
    support: "Food, wine, people, rhythm.",
    credits: [
      {
        kind: "photo",
        location: "Azeitão winery — Setúbal, Portugal",
        source: "viator",
        license: "Operation imagery — used with permission",
      },
      {
        kind: "video",
        location: "Local table — wine & cheese",
        source: "pexels",
        license: "Pexels License (free to use)",
        sourceUrl: "https://www.pexels.com/",
      },
    ],
  },
  {
    id: "occasions",
    image: imgArrabidaViewpoint,
    video: sceneCelebration.url,
    position: "50% 50%",
    pan: "push-in",
    main: ["For a day,", "a celebration,", "or something unforgettable."],
    support: "Your occasion sets the rhythm.",
    credits: [
      {
        kind: "photo",
        location: "Arrábida viewpoint — Setúbal, Portugal",
        source: "viator",
        license: "Operation imagery — used with permission",
      },
      {
        kind: "video",
        location: "Sunset celebration — Atlantic coast",
        source: "pexels",
        license: "Pexels License (free to use)",
        sourceUrl: "https://www.pexels.com/",
      },
    ],
  },
  {
    id: "action",
    image: imgSintraCaboDaRoca,
    video: sceneRoutePortugal.url,
    position: "50% 50%",
    pan: "pull-back",
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
        location: "Vineyard road — Alentejo, Portugal",
        source: "pexels",
        license: "Pexels License (free to use)",
        sourceUrl: "https://www.pexels.com/",
      },
    ],
  },
] as const;

/** Convenience flat list of every credit across all scenes. */
export const HERO_ALL_CREDITS = HERO_SCENES.flatMap((scene) =>
  scene.credits.map((credit) => ({ sceneId: scene.id, ...credit })),
);
