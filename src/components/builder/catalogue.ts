import { Clock, Heart, Landmark, Leaf, Mountain, Sparkles, Users, Wine, Zap } from "lucide-react";
import expCoastal from "@/assets/exp-coastal.jpg";
import expGastro from "@/assets/exp-gastronomy.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expRomantic from "@/assets/exp-romantic.jpg";
import expStreet from "@/assets/exp-street.jpg";
import type { Intention, Mood, Pace, Who } from "./types";

export const MOODS: { id: Mood; label: string; sub: string; cover: string; icon: typeof Wine }[] = [
  { id: "slow", label: "Slow & sensory", sub: "Coast, light, quiet roads", cover: expCoastal, icon: Mountain },
  { id: "curious", label: "Curious & exploring", sub: "Stones, stories, hidden corners", cover: expStreet, icon: Landmark },
  { id: "romantic", label: "Romantic", sub: "A moment built for two", cover: expRomantic, icon: Heart },
  { id: "open", label: "Open to anything", sub: "We'll braid it for you", cover: expGastro, icon: Sparkles },
  { id: "energetic", label: "Energetic", sub: "More places, more pulse", cover: expNature, icon: Zap },
];

export const WHOS: { id: Who; label: string; sub: string; icon: typeof Users }[] = [
  { id: "couple", label: "Couple", sub: "Two of us", icon: Heart },
  { id: "friends", label: "Friends", sub: "Small group", icon: Users },
  { id: "family", label: "Family", sub: "Kids welcome", icon: Users },
  { id: "solo", label: "Solo", sub: "Just me", icon: Users },
];

export const INTENTIONS: { id: Intention; label: string; sub: string }[] = [
  { id: "wine", label: "Wine", sub: "Cellars, talha, long table" },
  { id: "gastronomy", label: "Gastronomy", sub: "Markets, real lunch, slow tasca" },
  { id: "nature", label: "Nature", sub: "Cliffs, dunes, lagoons" },
  { id: "heritage", label: "Heritage", sub: "Old stones that still talk" },
  { id: "coast", label: "Coast", sub: "Cove, salt wind, sea light" },
  { id: "hidden", label: "Hidden corners", sub: "Off the postcard" },
  { id: "wonder", label: "Wonder", sub: "Places that make you stop" },
  { id: "wellness", label: "Quiet & wellness", sub: "Breath room, slow rhythm" },
];

export const PACES: { id: Pace; label: string; sub: string; icon: typeof Leaf }[] = [
  { id: "relaxed", label: "Relaxed", sub: "Fewer stops, more breath", icon: Leaf },
  { id: "balanced", label: "Balanced", sub: "Just right", icon: Clock },
  { id: "full", label: "Full", sub: "More to see, more pulse", icon: Zap },
];

/** Microcopy shown briefly during step transitions. Keep short and warm. */
export const TRANSITION_MICROCOPY: Record<"mood" | "who" | "intention" | "pace", string> = {
  mood: "Got it. Finding what fits.",
  who: "Shaping it for you.",
  intention: "Tracing the rhythm.",
  pace: "Almost there.",
};
