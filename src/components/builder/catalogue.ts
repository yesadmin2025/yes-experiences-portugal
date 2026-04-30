import {
  Briefcase,
  Clock,
  Heart,
  Landmark,
  Leaf,
  Mountain,
  Sparkles,
  Sprout,
  Users,
  Wine,
  Zap,
} from "lucide-react";
import expCoastal from "@/assets/exp-coastal.jpg";
import expGastro from "@/assets/exp-gastronomy.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expRomantic from "@/assets/exp-romantic.jpg";
import expStreet from "@/assets/exp-street.jpg";
import type { Intention, Mood, Pace, Who } from "./types";

// Mood — the feeling of the day. Labels lean toward the brief's vocabulary
// ("Wine & food", "Coast & views", etc.) while engine IDs stay stable.
export const MOODS: { id: Mood; label: string; sub: string; cover: string; icon: typeof Wine }[] = [
  { id: "slow", label: "Coast & slow light", sub: "Sea breath, quiet roads, long views", cover: expCoastal, icon: Mountain },
  { id: "curious", label: "Culture & history", sub: "Old stones, real stories, hidden corners", cover: expStreet, icon: Landmark },
  { id: "romantic", label: "A special moment", sub: "An intimate day shaped for two", cover: expRomantic, icon: Heart },
  { id: "open", label: "Wine & food", sub: "Cellars, markets, generous tables", cover: expGastro, icon: Wine },
  { id: "energetic", label: "A bit of everything", sub: "More places, more pulse, real variety", cover: expNature, icon: Zap },
];

export const WHOS: { id: Who; label: string; sub: string; icon: typeof Users }[] = [
  { id: "couple", label: "Couple", sub: "Two of us", icon: Heart },
  { id: "friends", label: "Friends", sub: "Small group", icon: Users },
  { id: "family", label: "Family", sub: "Kids welcome", icon: Users },
  { id: "solo", label: "Solo", sub: "Just me", icon: Users },
  { id: "group", label: "Private group", sub: "A larger party", icon: Users },
  { id: "corporate", label: "Corporate", sub: "Team, client, retreat", icon: Briefcase },
];

// Intention — what matters most. Engine IDs stay; labels and subtitles
// realigned to the brief's "what matters" vocabulary.
export const INTENTIONS: { id: Intention; label: string; sub: string }[] = [
  { id: "hidden", label: "Discovering places", sub: "Off the postcard, found in person" },
  { id: "gastronomy", label: "Enjoying the moment", sub: "Real lunch, slow tasca, long table" },
  { id: "wonder", label: "Celebrating something", sub: "A day that lifts the occasion" },
  { id: "heritage", label: "Learning and exploring", sub: "Old stones that still talk" },
  { id: "wellness", label: "Taking it slow", sub: "Breath room, quiet rhythm" },
  { id: "coast", label: "Coast & views", sub: "Cove, salt wind, sea light" },
  { id: "wine", label: "Wine country", sub: "Cellars, talha, long table" },
  { id: "nature", label: "Nature & wild edges", sub: "Cliffs, dunes, lagoons" },
];

export const PACES: { id: Pace; label: string; sub: string; icon: typeof Leaf }[] = [
  { id: "relaxed", label: "Relaxed", sub: "Fewer stops, more breath", icon: Sprout },
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
