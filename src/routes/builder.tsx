import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Check,
  MessageCircle,
  Sparkles,
  Clock,
  Leaf,
  Zap,
  Users,
  Heart,
  Wine,
  UtensilsCrossed,
  Mountain,
  Landmark,
  Plus,
  X,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { STOP_LATLNG } from "@/data/stopGeo";

import expCoastal from "@/assets/exp-coastal.jpg";
import expWine from "@/assets/exp-wine.jpg";
import expGastro from "@/assets/exp-gastronomy.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expStreet from "@/assets/exp-street.jpg";
import expRomantic from "@/assets/exp-romantic.jpg";

/* ────────────────────────────────────────────────────────────────
   Builder v4 — Experience Studio
   A predictive, guided experience builder. Three quick emotional
   choices generate a real, achievable day in Portugal — drawn live
   on the map, narrated as a story, fully editable.

   Design intent:
     • Never empty. Never "everything at once". Always a starting point.
     • Each step is a micro-commitment, not a question.
     • Map + story panel react instantly to every change.
     • Real coordinates only. Single-day-feasible by construction.
   ──────────────────────────────────────────────────────────────── */

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Create your experience in Portugal — YES" },
      {
        name: "description",
        content:
          "Shape your own day in Portugal — in real time, your way. Three choices generate a starting point on the map. Adjust everything. Confirm instantly.",
      },
      { property: "og:title", content: "Create your experience — YES" },
      {
        property: "og:description",
        content:
          "A starting point will be created for you — you can adjust everything. Real route, real stops, live story, instant confirmation.",
      },
    ],
  }),
  component: BuilderPage,
});

/* ─── Domain ──────────────────────────────────────────────────── */

type Mood = "scenic" | "food" | "culture" | "moment" | "mix";
type Who = "couple" | "friends" | "family" | "corporate" | "solo";
type Intent = "discover" | "enjoy" | "celebrate" | "learn" | "slow";
type Pace = "relaxed" | "balanced" | "full";

const MOODS: { id: Mood; label: string; sub: string; cover: string; icon: typeof Wine }[] = [
  { id: "scenic", label: "Relaxed & scenic", sub: "Coast, light, quiet roads", cover: expCoastal, icon: Mountain },
  { id: "food", label: "Food & wine", sub: "Markets, cellars, long lunch", cover: expWine, icon: Wine },
  { id: "culture", label: "Culture & history", sub: "Stones that still talk", cover: expStreet, icon: Landmark },
  { id: "moment", label: "A special moment", sub: "Proposal, anniversary, milestone", cover: expRomantic, icon: Heart },
  { id: "mix", label: "A bit of everything", sub: "We'll braid it for you", cover: expGastro, icon: Sparkles },
];

const WHOS: { id: Who; label: string; sub: string; icon: typeof Users }[] = [
  { id: "couple", label: "Couple", sub: "Two of us", icon: Heart },
  { id: "friends", label: "Friends", sub: "Small group", icon: Users },
  { id: "family", label: "Family", sub: "Kids welcome", icon: Users },
  { id: "corporate", label: "Corporate", sub: "Team day", icon: Users },
  { id: "solo", label: "Solo", sub: "Just me", icon: Users },
];

const INTENTS: { id: Intent; label: string; sub: string }[] = [
  { id: "discover", label: "Discovering places", sub: "Off the postcard" },
  { id: "enjoy", label: "Enjoying the moment", sub: "No checklist" },
  { id: "celebrate", label: "Celebrating something", sub: "Make it a memory" },
  { id: "learn", label: "Learning & exploring", sub: "Stories, context" },
  { id: "slow", label: "Taking it slow", sub: "Breath room" },
];

const PACES: { id: Pace; label: string; sub: string; stops: number; icon: typeof Leaf }[] = [
  { id: "relaxed", label: "Relaxed", sub: "2–3 stops", stops: 3, icon: Leaf },
  { id: "balanced", label: "Balanced", sub: "4 stops", stops: 4, icon: Clock },
  { id: "full", label: "Full", sub: "5+ stops", stops: 5, icon: Zap },
];

/* ─── Stop catalogue ──────────────────────────────────────────────
   Curated, real, single-day-achievable. Every stop has lat/lng from
   stopGeo.ts. Tags drive the predictive engine. Times are honest. */

type StopKind = "scenic" | "food" | "wine" | "culture" | "view" | "hidden" | "moment";

type Stop = {
  id: string;
  geoKey: keyof typeof STOP_LATLNG;
  label: string;
  region: "lisbon" | "alentejo" | "porto" | "algarve";
  kinds: StopKind[];
  duration: number; // hours at the stop itself
  blurb: string; // one-line, human, sensory
};

const STOPS: Stop[] = [
  // Lisbon hub
  { id: "lisbon-belem", geoKey: "lisbon", label: "Lisbon — Belém riverside", region: "lisbon", kinds: ["culture", "scenic"], duration: 1.5, blurb: "Tower, river light, a pastry still warm" },
  { id: "azeitao-winery", geoKey: "azeitão", label: "Azeitão cellar", region: "lisbon", kinds: ["wine", "food"], duration: 1.5, blurb: "Cellar tasting with the winemaker" },
  { id: "livramento-market", geoKey: "livramento market", label: "Livramento Market, Setúbal", region: "lisbon", kinds: ["food", "culture"], duration: 1, blurb: "Fish on ice, espresso, real lunch table" },
  { id: "arrabida", geoKey: "arrábida", label: "Arrábida viewpoint", region: "lisbon", kinds: ["scenic", "view", "hidden"], duration: 1, blurb: "Cliffs falling into a green-blue sea" },
  { id: "portinho", geoKey: "portinho da arrábida", label: "Portinho da Arrábida cove", region: "lisbon", kinds: ["scenic", "hidden", "view"], duration: 1.25, blurb: "Quiet cove, slow swim, no rush" },
  { id: "sesimbra", geoKey: "sesimbra", label: "Sesimbra harbor", region: "lisbon", kinds: ["food", "scenic"], duration: 1.25, blurb: "Coastal lunch, boats coming in" },
  { id: "espichel", geoKey: "cabo espichel", label: "Cabo Espichel", region: "lisbon", kinds: ["scenic", "view", "moment"], duration: 0.75, blurb: "Cliff edge of the world, sunset table" },
  { id: "sintra", geoKey: "sintra", label: "Sintra hills", region: "lisbon", kinds: ["culture", "scenic"], duration: 1.75, blurb: "Mossy palaces, mist between trees" },
  { id: "cabo-roca", geoKey: "cabo da roca", label: "Cabo da Roca", region: "lisbon", kinds: ["scenic", "view"], duration: 0.5, blurb: "Westernmost point of Europe, salt wind" },
  // Alentejo
  { id: "evora", geoKey: "évora", label: "Évora old town", region: "alentejo", kinds: ["culture", "food"], duration: 1.75, blurb: "Roman temple, marble streets, slow tasca" },
  { id: "monsaraz", geoKey: "monsaraz", label: "Monsaraz hilltop", region: "alentejo", kinds: ["culture", "view", "moment"], duration: 1.25, blurb: "White village above the lake, golden hour" },
  { id: "alentejo-winery", geoKey: "alentejo", label: "Alentejo winery lunch", region: "alentejo", kinds: ["wine", "food"], duration: 2, blurb: "Long table, talha wine, olives from the tree" },
  { id: "comporta", geoKey: "comporta", label: "Comporta dunes", region: "alentejo", kinds: ["scenic", "hidden"], duration: 1.25, blurb: "Wooden walkways, rice fields, soft sand" },
  // Porto / Douro
  { id: "porto-ribeira", geoKey: "ribeira", label: "Porto — Ribeira", region: "porto", kinds: ["culture", "scenic"], duration: 1.25, blurb: "Granite, river, the bridge above your head" },
  { id: "gaia-cellar", geoKey: "gaia", label: "Gaia port cellar", region: "porto", kinds: ["wine", "culture"], duration: 1.25, blurb: "Vintage barrels, tawny in the glass" },
  { id: "pinhao", geoKey: "pinhão", label: "Pinhão terraces", region: "porto", kinds: ["scenic", "wine", "view"], duration: 1.5, blurb: "Tiled station, vines stitched on the slope" },
  { id: "douro-lunch", geoKey: "douro valley", label: "Douro winery lunch", region: "porto", kinds: ["wine", "food", "view"], duration: 2, blurb: "Lunch over the river bend" },
  // Algarve
  { id: "lagos", geoKey: "lagos", label: "Lagos cliffs", region: "algarve", kinds: ["scenic", "view"], duration: 1, blurb: "Ochre cliffs, hidden steps to the sand" },
  { id: "benagil", geoKey: "benagil", label: "Benagil cave", region: "algarve", kinds: ["scenic", "hidden", "moment"], duration: 1.25, blurb: "Sea cathedral, light through the roof" },
  { id: "tavira", geoKey: "tavira", label: "Tavira old town", region: "algarve", kinds: ["culture", "food"], duration: 1.5, blurb: "Roman bridge, tile, salt-cured tuna" },
  { id: "ria-formosa", geoKey: "ria formosa", label: "Ria Formosa lagoon", region: "algarve", kinds: ["scenic", "hidden"], duration: 1, blurb: "Flamingos at dusk, oyster boats" },
];

/* ─── Predictive engine ───────────────────────────────────────── */

const REGION_BY_MOOD: Record<Mood, Stop["region"]> = {
  scenic: "lisbon", // Arrábida coast
  food: "lisbon", // Setúbal/Azeitão
  culture: "lisbon", // Sintra + Belém
  moment: "lisbon", // Espichel + Arrábida (sunset)
  mix: "lisbon",
};

function rankKinds(mood: Mood, intent: Intent): StopKind[] {
  const m: Record<Mood, StopKind[]> = {
    scenic: ["scenic", "view", "hidden"],
    food: ["wine", "food", "culture"],
    culture: ["culture", "view", "scenic"],
    moment: ["moment", "view", "scenic"],
    mix: ["scenic", "food", "culture"],
  };
  const i: Record<Intent, StopKind[]> = {
    discover: ["hidden", "view"],
    enjoy: ["scenic", "food"],
    celebrate: ["moment", "view"],
    learn: ["culture"],
    slow: ["scenic", "hidden"],
  };
  const merged = [...m[mood], ...i[intent]];
  return Array.from(new Set(merged));
}

function predict(mood: Mood, _who: Who, intent: Intent, pace: Pace): Stop[] {
  const region = REGION_BY_MOOD[mood];
  const kinds = rankKinds(mood, intent);
  const inRegion = STOPS.filter((s) => s.region === region);

  // score each stop by how many of its kinds appear in the ranked list
  const scored = inRegion
    .map((s) => {
      let score = 0;
      for (let i = 0; i < kinds.length; i++) {
        if (s.kinds.includes(kinds[i])) score += kinds.length - i;
      }
      return { s, score };
    })
    .sort((a, b) => b.score - a.score);

  const target = PACES.find((p) => p.id === pace)!.stops;
  const picked: Stop[] = [];
  for (const { s } of scored) {
    if (picked.length >= target) break;
    if (picked.find((p) => p.geoKey === s.geoKey)) continue;
    picked.push(s);
  }
  // Order by latitude (north → south) so the route reads as a real drive
  return picked.sort((a, b) => STOP_LATLNG[b.geoKey].lat - STOP_LATLNG[a.geoKey].lat);
}

function alternativesFor(current: Stop[]): Stop[] {
  if (!current.length) return [];
  const region = current[0].region;
  const usedKeys = new Set(current.map((s) => s.geoKey));
  return STOPS.filter((s) => s.region === region && !usedKeys.has(s.geoKey)).slice(0, 6);
}

/* ─── Story builder ───────────────────────────────────────────── */

function buildStory(stops: Stop[], mood: Mood, pace: Pace): string {
  if (!stops.length) return "";
  const places = stops.map((s) => s.label.split(" — ")[0].split(",")[0]).slice(0, 3);
  const placeLine =
    places.length === 1
      ? places[0]
      : places.length === 2
        ? `${places[0]} and ${places[1]}`
        : `${places.slice(0, -1).join(", ")} and ${places[places.length - 1]}`;
  const tone =
    pace === "relaxed" ? "A slow day" : pace === "full" ? "A rich, full day" : "A well-paced day";
  const flavor: Record<Mood, string> = {
    scenic: "with cliffs, viewpoints and a quiet table by the sea",
    food: "with wine, a long lunch and one market that still feeds the town",
    culture: "with old stones, real neighborhoods and stories worth retelling",
    moment: "with one moment built only for you — and a sunset to seal it",
    mix: "with a bit of everything: light, taste, a viewpoint, a real table",
  };
  return `${tone} through ${placeLine}, ${flavor[mood]}.`;
}

function totalHours(stops: Stop[]): number {
  // stop time + ~30 min driving between each stop, capped
  const stopTime = stops.reduce((s, x) => s + x.duration, 0);
  const driving = Math.max(0, stops.length - 1) * 0.6;
  return Math.min(11, stopTime + driving);
}

function fmtHours(h: number): string {
  const whole = Math.floor(h);
  const min = Math.round((h - whole) * 60);
  return min ? `${whole}h${String(min).padStart(2, "0")}` : `${whole}h`;
}

/* ─── Page ────────────────────────────────────────────────────── */

function BuilderPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mood, setMood] = useState<Mood | undefined>();
  const [who, setWho] = useState<Who | undefined>();
  const [intent, setIntent] = useState<Intent | undefined>();
  const [pace, setPace] = useState<Pace>("balanced");
  const [stops, setStops] = useState<Stop[]>([]);
  const [extras, setExtras] = useState<{ lunch: boolean; tasting: boolean; viewpoint: boolean; hidden: boolean; private_: boolean }>({
    lunch: true,
    tasting: false,
    viewpoint: false,
    hidden: false,
    private_: false,
  });

  // Generate initial route once steps 1–3 are done
  useEffect(() => {
    if (step === 4 && mood && who && intent && stops.length === 0) {
      setStops(predict(mood, who, intent, pace));
    }
  }, [step, mood, who, intent, pace, stops.length]);

  // When pace changes after generation, regenerate (preserves user-removed? simpler: regenerate fresh)
  const regenerate = () => {
    if (mood && who && intent) setStops(predict(mood, who, intent, pace));
  };

  const story = useMemo(
    () => (mood && stops.length ? buildStory(stops, mood, pace) : ""),
    [stops, mood, pace],
  );
  const hours = useMemo(() => totalHours(stops), [stops]);

  const advance = () => {
    if (step === 1 && mood) setStep(2);
    else if (step === 2 && who) setStep(3);
    else if (step === 3 && intent) setStep(4);
  };

  /* ─── Render ─────────────────────────────────────────────── */

  return (
    <SiteLayout>
      <article className="bg-[color:var(--ivory)] text-[color:var(--charcoal)]">
        {/* Entry hero — visible only before generation */}
        {step < 4 && (
          <header className="border-b border-[color:var(--border)] bg-[color:var(--sand)]">
            <div className="container-x py-10 md:py-16">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--gold)]">
                  <Sparkles size={12} aria-hidden="true" />
                  Experience studio
                </span>
                <h1 className="serif mt-4 text-[2.4rem] md:text-[3.8rem] leading-[1.02] tracking-[-0.02em] font-semibold text-[color:var(--charcoal)]">
                  Create your experience <span className="italic">in Portugal</span>.
                </h1>
                <p className="mt-4 serif italic text-[1.2rem] md:text-[1.5rem] leading-[1.25] text-[color:var(--charcoal)]/85">
                  In real time. Your way.
                </p>
                <p className="mt-5 max-w-xl text-[14.5px] md:text-[16px] leading-[1.65] text-[color:var(--charcoal)]/80">
                  A starting point will be created for you — you can adjust everything.
                </p>

                {/* Step rail */}
                <ol className="mt-8 grid grid-cols-3 gap-2 max-w-md" aria-label="Progress">
                  {(["Mood", "Who", "Intention"] as const).map((label, i) => {
                    const n = i + 1;
                    const active = step === n;
                    const done = step > n;
                    return (
                      <li key={label} className="flex flex-col gap-1.5">
                        <span
                          aria-hidden="true"
                          className={[
                            "block h-[3px] transition-colors duration-300",
                            done || active ? "bg-[color:var(--gold)]" : "bg-[color:var(--charcoal)]/15",
                          ].join(" ")}
                        />
                        <span
                          className={[
                            "text-[10px] uppercase tracking-[0.2em] font-semibold tabular-nums",
                            active || done
                              ? "text-[color:var(--charcoal)]"
                              : "text-[color:var(--charcoal)]/45",
                          ].join(" ")}
                        >
                          0{n} · {label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </header>
        )}

        {/* STEP 1 — MOOD */}
        {step === 1 && (
          <section className="container-x py-10 md:py-16 reveal">
            <StepHead num={1} eyebrow="Mood" title="What are you in the mood for?" />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {MOODS.map((m) => (
                <MoodCard
                  key={m.id}
                  selected={mood === m.id}
                  onClick={() => {
                    setMood(m.id);
                    // micro-commitment: auto-advance after a beat
                    window.setTimeout(() => setStep(2), 220);
                  }}
                  label={m.label}
                  sub={m.sub}
                  cover={m.cover}
                />
              ))}
            </div>
          </section>
        )}

        {/* STEP 2 — WHO */}
        {step === 2 && (
          <section className="container-x py-10 md:py-16 reveal">
            <StepHead num={2} eyebrow="Who" title="Who is this for?" onBack={() => setStep(1)} />
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {WHOS.map((w) => (
                <ChoiceTile
                  key={w.id}
                  selected={who === w.id}
                  onClick={() => {
                    setWho(w.id);
                    window.setTimeout(() => setStep(3), 220);
                  }}
                  label={w.label}
                  sub={w.sub}
                  Icon={w.icon}
                />
              ))}
            </div>
          </section>
        )}

        {/* STEP 3 — INTENTION */}
        {step === 3 && (
          <section className="container-x py-10 md:py-16 reveal">
            <StepHead
              num={3}
              eyebrow="Intention"
              title="What matters most to you?"
              onBack={() => setStep(2)}
            />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTENTS.map((it) => (
                <ChoiceRow
                  key={it.id}
                  selected={intent === it.id}
                  onClick={() => {
                    setIntent(it.id);
                    window.setTimeout(() => setStep(4), 240);
                  }}
                  label={it.label}
                  sub={it.sub}
                />
              ))}
            </div>
          </section>
        )}

        {/* STEP 4 — LIVE EXPERIENCE */}
        {step === 4 && mood && who && intent && (
          <LiveExperience
            mood={mood}
            who={who}
            intent={intent}
            pace={pace}
            setPace={(p) => {
              setPace(p);
              if (mood && who && intent) setStops(predict(mood, who, intent, p));
            }}
            stops={stops}
            setStops={setStops}
            extras={extras}
            setExtras={setExtras}
            story={story}
            hours={hours}
            regenerate={regenerate}
            onEdit={() => setStep(1)}
          />
        )}

        {/* Persistent next button when nothing auto-advances (fallback) */}
        {step < 4 && (
          <div className="container-x pb-12 md:pb-16">
            <button
              type="button"
              onClick={advance}
              disabled={
                (step === 1 && !mood) ||
                (step === 2 && !who) ||
                (step === 3 && !intent)
              }
              className={[
                "inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] text-[12.5px] uppercase tracking-[0.2em] font-bold transition-all duration-200",
                (step === 1 && mood) || (step === 2 && who) || (step === 3 && intent)
                  ? "bg-[color:var(--teal)] text-[color:var(--ivory)] hover:bg-[color:var(--teal-2)] shadow-[0_10px_24px_-12px_rgba(41,91,97,0.7)] hover:-translate-y-[2px]"
                  : "bg-[color:var(--charcoal)]/10 text-[color:var(--charcoal)]/40 cursor-not-allowed",
              ].join(" ")}
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </article>
    </SiteLayout>
  );
}

/* ─── Step header ─────────────────────────────────────────────── */

function StepHead({
  num,
  eyebrow,
  title,
  onBack,
}: {
  num: number;
  eyebrow: string;
  title: string;
  onBack?: () => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span
            aria-hidden="true"
            className="serif text-[color:var(--gold)] text-[1.5rem] md:text-[1.75rem] leading-none font-semibold tabular-nums"
          >
            {String(num).padStart(2, "0")}
          </span>
          <span className="text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal)]/60">
            {eyebrow}
          </span>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[color:var(--charcoal)]/60 hover:text-[color:var(--charcoal)] transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
      <h2 className="serif mt-2 text-[1.85rem] md:text-[2.6rem] leading-[1.05] tracking-[-0.01em] font-semibold text-[color:var(--charcoal)] [text-wrap:balance]">
        {title}
      </h2>
    </div>
  );
}

/* ─── Mood card (image-led) ───────────────────────────────────── */

function MoodCard({
  selected,
  onClick,
  label,
  sub,
  cover,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub: string;
  cover: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "group relative aspect-[4/5] overflow-hidden rounded-[2px] text-left transition-all duration-300",
        selected
          ? "ring-2 ring-[color:var(--gold)] ring-offset-2 ring-offset-[color:var(--ivory)] shadow-[0_18px_40px_-22px_rgba(46,46,46,0.4)]"
          : "ring-1 ring-[color:var(--border)] hover:-translate-y-[3px] hover:shadow-[0_14px_28px_-18px_rgba(46,46,46,0.35)]",
      ].join(" ")}
    >
      <img
        src={cover}
        alt=""
        loading="lazy"
        className={[
          "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out",
          selected ? "scale-[1.06]" : "group-hover:scale-[1.04]",
        ].join(" ")}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
      />
      <span className="absolute left-4 right-4 bottom-4 flex flex-col gap-1 text-[color:var(--ivory)]">
        <span className="serif text-[1.1rem] md:text-[1.25rem] leading-tight font-semibold [text-wrap:balance]">
          {label}
        </span>
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[color:var(--ivory)]/80">
          {sub}
        </span>
      </span>
      {selected && (
        <span
          aria-hidden="true"
          className="absolute top-3 right-3 inline-flex items-center justify-center h-7 w-7 rounded-full bg-[color:var(--gold)] text-[color:var(--charcoal)]"
        >
          <Check size={14} />
        </span>
      )}
    </button>
  );
}

/* ─── Tile (icon + label) ─────────────────────────────────────── */

function ChoiceTile({
  selected,
  onClick,
  label,
  sub,
  Icon,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub: string;
  Icon: typeof Users;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "group relative flex flex-col items-start text-left rounded-[2px] border min-h-[88px] px-4 py-4 transition-all duration-200",
        selected
          ? "border-[color:var(--charcoal)] bg-[color:var(--charcoal)] text-[color:var(--ivory)] shadow-[0_10px_22px_-14px_rgba(46,46,46,0.5)]"
          : "border-[color:var(--border)] bg-[color:var(--ivory)] text-[color:var(--charcoal)] hover:border-[color:var(--charcoal)] hover:-translate-y-[2px]",
      ].join(" ")}
    >
      <Icon
        size={16}
        aria-hidden="true"
        className={selected ? "text-[color:var(--gold)]" : "text-[color:var(--charcoal)]/55"}
      />
      <span className="mt-2 text-[15px] font-semibold leading-tight">{label}</span>
      <span
        className={[
          "mt-0.5 text-[11px] uppercase tracking-[0.16em]",
          selected ? "text-[color:var(--ivory)]/70" : "text-[color:var(--charcoal)]/55",
        ].join(" ")}
      >
        {sub}
      </span>
    </button>
  );
}

/* ─── Row option (intention) ──────────────────────────────────── */

function ChoiceRow({
  selected,
  onClick,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "group flex items-center justify-between gap-4 rounded-[2px] border px-5 py-4 min-h-[64px] text-left transition-all duration-200",
        selected
          ? "border-[color:var(--charcoal)] bg-[color:var(--charcoal)] text-[color:var(--ivory)] shadow-[0_10px_22px_-14px_rgba(46,46,46,0.5)]"
          : "border-[color:var(--border)] bg-[color:var(--ivory)] text-[color:var(--charcoal)] hover:border-[color:var(--charcoal)] hover:-translate-y-[2px]",
      ].join(" ")}
    >
      <span className="flex flex-col gap-0.5">
        <span className="serif text-[16px] md:text-[17px] font-semibold leading-tight">{label}</span>
        <span
          className={[
            "text-[11px] uppercase tracking-[0.18em]",
            selected ? "text-[color:var(--ivory)]/70" : "text-[color:var(--charcoal)]/55",
          ].join(" ")}
        >
          {sub}
        </span>
      </span>
      <ArrowRight
        size={16}
        className={[
          "transition-transform duration-200",
          selected ? "text-[color:var(--gold)]" : "text-[color:var(--charcoal)]/40 group-hover:translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

/* ─── Live experience (step 4) ────────────────────────────────── */

function LiveExperience({
  mood,
  pace,
  setPace,
  stops,
  setStops,
  extras,
  setExtras,
  story,
  hours,
  regenerate,
  onEdit,
}: {
  mood: Mood;
  who: Who;
  intent: Intent;
  pace: Pace;
  setPace: (p: Pace) => void;
  stops: Stop[];
  setStops: (s: Stop[]) => void;
  extras: { lunch: boolean; tasting: boolean; viewpoint: boolean; hidden: boolean; private_: boolean };
  setExtras: (e: { lunch: boolean; tasting: boolean; viewpoint: boolean; hidden: boolean; private_: boolean }) => void;
  story: string;
  hours: number;
  regenerate: () => void;
  onEdit: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const alts = useMemo(() => alternativesFor(stops), [stops]);

  const removeStop = (id: string) => setStops(stops.filter((s) => s.id !== id));
  const addStop = (s: Stop) => {
    const next = [...stops, s].sort(
      (a, b) => STOP_LATLNG[b.geoKey].lat - STOP_LATLNG[a.geoKey].lat,
    );
    setStops(next);
    setAdding(false);
  };
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= stops.length) return;
    const next = stops.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    setStops(next);
  };

  return (
    <section className="bg-[color:var(--ivory)]">
      {/* Banner — generated state */}
      <div className="border-b border-[color:var(--border)] bg-[color:var(--sand)]">
        <div className="container-x py-7 md:py-9">
          <div className="flex flex-wrap items-start justify-between gap-4 max-w-6xl mx-auto">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--gold)]">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[color:var(--gold)] opacity-60" />
                  <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" />
                </span>
                Your starting point
              </span>
              <h2 className="serif mt-3 text-[1.7rem] md:text-[2.4rem] leading-[1.1] tracking-[-0.01em] font-semibold text-[color:var(--charcoal)] [text-wrap:balance]">
                We've shaped a day for you. <span className="italic">Adjust everything.</span>
              </h2>
              <p className="mt-2 text-[13.5px] md:text-[15px] leading-[1.55] text-[color:var(--charcoal)]/75">
                Based on your mood, your group and what matters to you. Remove stops, reorder, change the pace — the map and story update live.
              </p>
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[color:var(--charcoal)] border-b border-[color:var(--charcoal)]/30 hover:border-[color:var(--charcoal)] pb-1"
            >
              Restart
            </button>
          </div>
        </div>
      </div>

      <div className="container-x py-10 md:py-14">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 max-w-6xl mx-auto">
          {/* MAP + ROUTE — wow column */}
          <div className="lg:col-span-7">
            <RouteMap stops={stops} />

            {/* Pace control */}
            <div className="mt-6">
              <span className="text-[10.5px] uppercase tracking-[0.24em] font-semibold text-[color:var(--charcoal)]/60">
                Pace
              </span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {PACES.map((p) => {
                  const sel = pace === p.id;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPace(p.id)}
                      aria-pressed={sel}
                      className={[
                        "flex flex-col items-start gap-0.5 px-4 py-3 min-h-[60px] rounded-[2px] border text-left transition-all duration-200",
                        sel
                          ? "border-[color:var(--charcoal)] bg-[color:var(--charcoal)] text-[color:var(--ivory)]"
                          : "border-[color:var(--border)] hover:border-[color:var(--charcoal)] hover:-translate-y-[1px]",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={13} className={sel ? "text-[color:var(--gold)]" : "text-[color:var(--charcoal)]/55"} aria-hidden="true" />
                        <span className="text-[13.5px] font-semibold leading-tight">{p.label}</span>
                      </span>
                      <span className={["text-[10.5px] uppercase tracking-[0.16em]", sel ? "text-[color:var(--ivory)]/70" : "text-[color:var(--charcoal)]/55"].join(" ")}>{p.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extras */}
            <div className="mt-6">
              <span className="text-[10.5px] uppercase tracking-[0.24em] font-semibold text-[color:var(--charcoal)]/60">
                Add to your day
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                <Toggle on={extras.lunch} onClick={() => setExtras({ ...extras, lunch: !extras.lunch })}>
                  Local lunch
                </Toggle>
                <Toggle on={extras.tasting} onClick={() => setExtras({ ...extras, tasting: !extras.tasting })}>
                  Wine tasting
                </Toggle>
                <Toggle on={extras.viewpoint} onClick={() => setExtras({ ...extras, viewpoint: !extras.viewpoint })}>
                  Hidden viewpoint
                </Toggle>
                <Toggle on={extras.hidden} onClick={() => setExtras({ ...extras, hidden: !extras.hidden })}>
                  Hidden gem
                </Toggle>
                <Toggle on={extras.private_} onClick={() => setExtras({ ...extras, private_: !extras.private_ })}>
                  Private moment
                </Toggle>
              </div>
              {(mood === "moment" || extras.private_) && (
                <p className="mt-3 text-[12px] leading-[1.5] text-[color:var(--charcoal)]/70 italic">
                  We'll arrange a private moment — proposal, anniversary, surprise — discreetly with the local team.
                </p>
              )}
            </div>
          </div>

          {/* STORY PANEL */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 flex flex-col gap-5">
              {/* Story card */}
              <div className="overflow-hidden rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ivory)] shadow-[0_18px_40px_-22px_rgba(46,46,46,0.32)]">
                <div className="px-5 md:px-6 pt-5 pb-4 border-b border-[color:var(--border)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] font-bold text-[color:var(--gold)]">
                      <span className="relative inline-flex h-1.5 w-1.5">
                        <span className="absolute inset-0 animate-ping rounded-full bg-[color:var(--gold)] opacity-60" />
                        <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" />
                      </span>
                      Your day
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[color:var(--charcoal)]/65 tabular-nums">
                      {fmtHours(hours)} · {stops.length} stop{stops.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {/* Path line */}
                  <p className="serif mt-3 text-[1.15rem] md:text-[1.3rem] leading-[1.25] font-semibold text-[color:var(--charcoal)] [text-wrap:balance]">
                    {stops.length
                      ? stops.map((s) => s.label.split(" — ")[0].split(",")[0]).join(" → ")
                      : "Add a stop to start your day"}
                  </p>
                </div>

                {/* Stops list */}
                <ul className="divide-y divide-[color:var(--border)]">
                  {stops.map((s, i) => (
                    <li key={s.id} className="flex items-start gap-3 px-5 md:px-6 py-3.5">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--gold)]/15 text-[10.5px] font-bold tabular-nums text-[color:var(--gold)]"
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold leading-tight text-[color:var(--charcoal)]">
                          {s.label}
                        </p>
                        <p className="mt-1 text-[12.5px] leading-[1.5] text-[color:var(--charcoal)]/70">
                          {s.blurb}
                        </p>
                        <p className="mt-1 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--charcoal)]/50 tabular-nums">
                          ≈ {fmtHours(s.duration)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                          aria-label="Move up"
                          className="h-7 w-7 inline-flex items-center justify-center rounded-full text-[color:var(--charcoal)]/50 hover:text-[color:var(--charcoal)] hover:bg-[color:var(--charcoal)]/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={i === stops.length - 1}
                          aria-label="Move down"
                          className="h-7 w-7 inline-flex items-center justify-center rounded-full text-[color:var(--charcoal)]/50 hover:text-[color:var(--charcoal)] hover:bg-[color:var(--charcoal)]/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStop(s.id)}
                          aria-label={`Remove ${s.label}`}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-full text-[color:var(--charcoal)]/50 hover:text-red-700 hover:bg-red-50 transition"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Add stop */}
                <div className="px-5 md:px-6 py-4 border-t border-[color:var(--border)] bg-[color:var(--sand)]/40">
                  {!adding ? (
                    <button
                      type="button"
                      onClick={() => setAdding(true)}
                      disabled={alts.length === 0}
                      className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] font-semibold text-[color:var(--charcoal)] hover:text-[color:var(--teal)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={13} />
                      Add a stop
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[color:var(--charcoal)]/60">
                          Suggested for this day
                        </span>
                        <button
                          type="button"
                          onClick={() => setAdding(false)}
                          className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--charcoal)]/55 hover:text-[color:var(--charcoal)]"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {alts.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => addStop(a)}
                            className="group flex items-start gap-2 text-left p-2.5 rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ivory)] hover:border-[color:var(--charcoal)] hover:-translate-y-[1px] transition-all"
                          >
                            <Plus size={12} className="mt-1 text-[color:var(--gold)]" aria-hidden="true" />
                            <span className="flex-1 min-w-0">
                              <span className="block text-[13px] font-semibold leading-tight text-[color:var(--charcoal)]">
                                {a.label}
                              </span>
                              <span className="block mt-0.5 text-[11.5px] leading-tight text-[color:var(--charcoal)]/65">
                                {a.blurb}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Narrative */}
                {story && (
                  <div className="px-5 md:px-6 py-5 border-t border-[color:var(--border)]">
                    <span className="text-[10px] uppercase tracking-[0.26em] font-bold text-[color:var(--gold)]">
                      The feel of it
                    </span>
                    <p className="serif italic mt-2 text-[15px] md:text-[16px] leading-[1.55] text-[color:var(--charcoal)] [text-wrap:balance]">
                      {story}
                    </p>
                  </div>
                )}

                {/* Trust + CTA */}
                <div className="px-5 md:px-6 py-5 border-t border-[color:var(--border)] bg-[color:var(--sand)]/50">
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px] leading-tight text-[color:var(--charcoal)] mb-4">
                    {[
                      "Private experience",
                      "Local guide included",
                      "Instant confirmation",
                      "Flexible adjustments",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-1.5">
                        <Check size={12} className="text-[color:var(--gold)] shrink-0" aria-hidden="true" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={stops.length === 0}
                    className={[
                      "group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[52px] text-[12.5px] uppercase tracking-[0.2em] font-bold transition-all duration-200",
                      stops.length > 0
                        ? "bg-[color:var(--teal)] text-[color:var(--ivory)] hover:bg-[color:var(--teal-2)] shadow-[0_12px_28px_-12px_rgba(41,91,97,0.7)] hover:-translate-y-[2px]"
                        : "bg-[color:var(--charcoal)]/10 text-[color:var(--charcoal)]/40 cursor-not-allowed",
                    ].join(" ")}
                  >
                    Confirm your experience
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                  <Link
                    to="/contact"
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 min-h-[44px] text-[12px] uppercase tracking-[0.2em] font-semibold text-[color:var(--charcoal)] border-b border-[color:var(--charcoal)]/30 hover:border-[color:var(--charcoal)] pb-1"
                  >
                    <MessageCircle size={13} aria-hidden="true" />
                    Talk to a local
                  </Link>
                  <p className="mt-3 text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--gold)] font-semibold flex items-center justify-center gap-2">
                    <ShieldCheck size={11} aria-hidden="true" />
                    A local is one message away
                  </p>
                </div>
              </div>

              {/* Regenerate hint */}
              <button
                type="button"
                onClick={regenerate}
                className="self-start text-[11px] uppercase tracking-[0.2em] font-semibold text-[color:var(--charcoal)]/65 hover:text-[color:var(--charcoal)] inline-flex items-center gap-2"
              >
                <Sparkles size={11} aria-hidden="true" />
                Regenerate from my choices
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ─── Toggle (extras) ─────────────────────────────────────────── */

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-full border text-[12px] font-semibold transition-all duration-200",
        on
          ? "border-[color:var(--charcoal)] bg-[color:var(--charcoal)] text-[color:var(--ivory)]"
          : "border-[color:var(--border)] text-[color:var(--charcoal)] hover:border-[color:var(--charcoal)] hover:-translate-y-[1px]",
      ].join(" ")}
    >
      {on ? <Check size={12} className="text-[color:var(--gold)]" /> : <Plus size={12} />}
      {children}
    </button>
  );
}

/* ─── Route map (Leaflet) ─────────────────────────────────────── */

function RouteMap({ stops }: { stops: Stop[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Init map once
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    // Fix default icon
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
    const map = L.map(ref.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      center: [38.72, -9.14],
      zoom: 9,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Draw stops + animated route
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (!stops.length) return;

    const points = stops.map((s) => {
      const g = STOP_LATLNG[s.geoKey];
      return L.latLng(g.lat, g.lng);
    });

    // Numbered pin builder
    const pin = (n: number) =>
      L.divIcon({
        className: "yes-route-pin",
        html: `<div style="
          width:30px;height:30px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:#295B61;border:2px solid #FAF8F3;
          box-shadow:0 4px 10px rgba(0,0,0,0.28);
          display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);color:#FAF8F3;font-weight:700;font-size:12px;font-family:ui-sans-serif,system-ui;">${n}</span>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

    points.forEach((p, i) => {
      const m = L.marker(p, { icon: pin(i + 1) });
      m.bindTooltip(stops[i].label, { direction: "top", offset: [0, -28] });
      layer.addLayer(m);
    });

    // Route line — animated draw via dasharray
    const line = L.polyline(points, {
      color: "#C9A96A",
      weight: 3.5,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
      dashArray: "8 1000",
    });
    layer.addLayer(line);

    // Animate the dasharray to "draw" the line
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      const path = (line as unknown as { _path?: SVGPathElement })._path;
      if (path) {
        const len = (path as SVGGeometryElement).getTotalLength?.() ?? 1000;
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;
        path.style.transition = "stroke-dashoffset 1400ms cubic-bezier(0.22,0.61,0.36,1)";
        // Force reflow then animate
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        path.getBoundingClientRect();
        requestAnimationFrame(() => {
          path.style.strokeDashoffset = "0";
        });
      }
    }

    // Fit
    const bounds = L.latLngBounds(points).pad(0.35);
    map.flyToBounds(bounds, { duration: 0.7 });
  }, [stops]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border border-b-0 border-[color:var(--border)] bg-[color:var(--sand)]/40 rounded-t-[2px]">
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] font-bold text-[color:var(--gold)]">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[color:var(--gold)] opacity-60" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" />
          </span>
          Live route
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[color:var(--charcoal)]/70">
          <MapPin size={11} aria-hidden="true" />
          {stops.length} stop{stops.length === 1 ? "" : "s"}
        </span>
      </div>
      <div
        ref={ref}
        className="relative aspect-[4/5] sm:aspect-[5/4] md:aspect-[16/11] border border-[color:var(--border)] rounded-b-[2px] overflow-hidden bg-[color:var(--sand)]"
        aria-label="Live route map"
      />
    </div>
  );
}
