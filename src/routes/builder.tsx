import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Mountain,
  Landmark,
  Plus,
  X,
  ShieldCheck,
  MapPin,
  Loader2,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { generateBuilderRoute, narrateBuilderRoute } from "@/server/builderEngine.functions";
import { supabase } from "@/integrations/supabase/client";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";

import expCoastal from "@/assets/exp-coastal.jpg";
import expWine from "@/assets/exp-wine.jpg";
import expGastro from "@/assets/exp-gastronomy.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expStreet from "@/assets/exp-street.jpg";
import expRomantic from "@/assets/exp-romantic.jpg";

/* ────────────────────────────────────────────────────────────────
   Builder v5 — Experience Studio
   Hybrid architecture:
     • UI = Lovable / TanStack
     • Route logic = Postgres (builder_regions/stops/rules) + server fn engine
     • Narrative = Lovable AI Gateway (gemini-2.5-flash) over real route data
     • Booking = Stripe embedded checkout
   ──────────────────────────────────────────────────────────────── */

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Create your experience in Portugal — YES" },
      {
        name: "description",
        content:
          "Shape your own day in Portugal — in real time, your way. Three choices generate a real, achievable route. Adjust everything. Confirm instantly.",
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

/* ─── Engine vocabulary (must match builderEngine.server.ts) ──── */

type Mood = "slow" | "curious" | "romantic" | "open" | "energetic";
type Who = "couple" | "family" | "friends" | "solo";
type Intention =
  | "wine"
  | "gastronomy"
  | "nature"
  | "heritage"
  | "coast"
  | "hidden"
  | "wonder"
  | "wellness";
type Pace = "relaxed" | "balanced" | "full";

interface RoutedStopUI {
  key: string;
  region_key: string;
  label: string;
  blurb: string | null;
  tag: string | null;
  lat: number;
  lng: number;
  duration_minutes: number;
  driveMinutesFromPrev: number;
}
interface RouteUI {
  region: { key: string; label: string; blurb: string | null; lat: number; lng: number };
  pace: Pace;
  stops: RoutedStopUI[];
  totals: { experienceMinutes: number; drivingMinutes: number; stopMinutes: number };
  pricePerPersonEur: number;
  feasible: boolean;
  warnings: string[];
}

/* ─── UI catalogue (image-led) ────────────────────────────────── */

const MOODS: { id: Mood; label: string; sub: string; cover: string; icon: typeof Wine }[] = [
  { id: "slow", label: "Slow & sensory", sub: "Coast, light, quiet roads", cover: expCoastal, icon: Mountain },
  { id: "curious", label: "Curious & exploring", sub: "Stones, stories, hidden corners", cover: expStreet, icon: Landmark },
  { id: "romantic", label: "Romantic", sub: "A moment built for two", cover: expRomantic, icon: Heart },
  { id: "open", label: "Open to anything", sub: "We'll braid it for you", cover: expGastro, icon: Sparkles },
  { id: "energetic", label: "Energetic", sub: "More places, more pulse", cover: expNature, icon: Zap },
];

const WHOS: { id: Who; label: string; sub: string; icon: typeof Users }[] = [
  { id: "couple", label: "Couple", sub: "Two of us", icon: Heart },
  { id: "friends", label: "Friends", sub: "Small group", icon: Users },
  { id: "family", label: "Family", sub: "Kids welcome", icon: Users },
  { id: "solo", label: "Solo", sub: "Just me", icon: Users },
];

const INTENTIONS: { id: Intention; label: string; sub: string }[] = [
  { id: "wine", label: "Wine", sub: "Cellars, talha, long table" },
  { id: "gastronomy", label: "Gastronomy", sub: "Markets, real lunch, slow tasca" },
  { id: "nature", label: "Nature", sub: "Cliffs, dunes, lagoons" },
  { id: "heritage", label: "Heritage", sub: "Old stones that still talk" },
  { id: "coast", label: "Coast", sub: "Cove, salt wind, sea light" },
  { id: "hidden", label: "Hidden corners", sub: "Off the postcard" },
  { id: "wonder", label: "Wonder", sub: "Places that make you stop" },
  { id: "wellness", label: "Quiet & wellness", sub: "Breath room, slow rhythm" },
];

const PACES: { id: Pace; label: string; sub: string; icon: typeof Leaf }[] = [
  { id: "relaxed", label: "Relaxed", sub: "Fewer stops", icon: Leaf },
  { id: "balanced", label: "Balanced", sub: "Just right", icon: Clock },
  { id: "full", label: "Full", sub: "More to see", icon: Zap },
];

/* ─── Helpers ─────────────────────────────────────────────────── */

function fmtMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

/* ─── Page ────────────────────────────────────────────────────── */

function BuilderPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mood, setMood] = useState<Mood | undefined>();
  const [who, setWho] = useState<Who | undefined>();
  const [intention, setIntention] = useState<Intention | undefined>();
  const [pace, setPace] = useState<Pace>("balanced");

  const [route, setRoute] = useState<RouteUI | null>(null);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [pinned, setPinned] = useState<string[]>([]); // user reordering preserved as pins
  const [orderOverride, setOrderOverride] = useState<string[] | null>(null);

  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const [narrative, setNarrative] = useState<string>("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  const [guests, setGuests] = useState(2);

  // Compute route on the server whenever inputs change
  const fetchRoute = useCallback(
    async (opts?: { nextExcluded?: string[]; nextPinned?: string[]; nextPace?: Pace }) => {
      if (!mood || !who || !intention) return;
      setRouteLoading(true);
      setRouteError(null);
      try {
        const result = await generateBuilderRoute({
          data: {
            mood,
            who,
            intention,
            pace: opts?.nextPace ?? pace,
            excludedStopKeys: opts?.nextExcluded ?? excluded,
            pinnedStopKeys: opts?.nextPinned ?? pinned,
          },
        });
        setRoute(result.route as RouteUI);
        setOrderOverride(null);
      } catch (e) {
        console.error("[builder] generateRoute failed", e);
        setRouteError("Couldn't shape your day right now. Try again.");
      } finally {
        setRouteLoading(false);
      }
    },
    [mood, who, intention, pace, excluded, pinned],
  );

  // Trigger initial generation when entering step 4
  useEffect(() => {
    if (step === 4 && mood && who && intention && !route && !routeLoading) {
      void fetchRoute();
    }
  }, [step, mood, who, intention, route, routeLoading, fetchRoute]);

  // Apply user-driven reordering on top of engine stops
  const stops: RoutedStopUI[] = useMemo(() => {
    if (!route) return [];
    if (!orderOverride) return route.stops;
    const map = new Map(route.stops.map((s) => [s.key, s]));
    const reordered: RoutedStopUI[] = [];
    for (const k of orderOverride) {
      const s = map.get(k);
      if (s) reordered.push(s);
    }
    // Append any stops not in the override (safety)
    for (const s of route.stops) if (!orderOverride.includes(s.key)) reordered.push(s);
    return reordered;
  }, [route, orderOverride]);

  // Narrative — fetched from AI based on the real route
  useEffect(() => {
    if (!route || !mood || !who || !intention || stops.length === 0) {
      setNarrative("");
      return;
    }
    let cancelled = false;
    setNarrativeLoading(true);
    const keys = stops.map((s) => s.key);
    narrateBuilderRoute({
      data: {
        routeStopKeys: keys,
        mood,
        who,
        intention,
        pace: route.pace,
        regionKey: route.region.key,
      },
    })
      .then((r) => {
        if (cancelled) return;
        setNarrative(r.narrative ?? "");
      })
      .catch((e) => {
        console.error("[builder] narrate failed", e);
        if (!cancelled) setNarrative("");
      })
      .finally(() => {
        if (!cancelled) setNarrativeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [route, mood, who, intention, stops]);

  const advance = () => {
    if (step === 1 && mood) setStep(2);
    else if (step === 2 && who) setStep(3);
    else if (step === 3 && intention) setStep(4);
  };

  const onPaceChange = (p: Pace) => {
    setPace(p);
    void fetchRoute({ nextPace: p });
  };

  const onRemoveStop = (key: string) => {
    const nextExcluded = [...excluded, key];
    setExcluded(nextExcluded);
    void fetchRoute({ nextExcluded });
  };

  const onAddBackStop = (key: string) => {
    const nextExcluded = excluded.filter((k) => k !== key);
    setExcluded(nextExcluded);
    void fetchRoute({ nextExcluded });
  };

  const onMove = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= stops.length) return;
    const next = stops.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    setOrderOverride(next.map((s) => s.key));
  };

  const restart = () => {
    setStep(1);
    setMood(undefined);
    setWho(undefined);
    setIntention(undefined);
    setRoute(null);
    setExcluded([]);
    setPinned([]);
    setOrderOverride(null);
    setNarrative("");
  };

  return (
    <SiteLayout>
      <article className="bg-[color:var(--ivory)] text-[color:var(--charcoal)]">
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
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              {INTENTIONS.map((it) => (
                <ChoiceRow
                  key={it.id}
                  selected={intention === it.id}
                  onClick={() => {
                    setIntention(it.id);
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
        {step === 4 && mood && who && intention && (
          <LiveExperience
            mood={mood}
            route={route}
            stops={stops}
            pace={pace}
            onPaceChange={onPaceChange}
            onRemoveStop={onRemoveStop}
            onAddBackStop={onAddBackStop}
            onMove={onMove}
            onRestart={restart}
            onRetry={() => void fetchRoute()}
            routeLoading={routeLoading}
            routeError={routeError}
            narrative={narrative}
            narrativeLoading={narrativeLoading}
            excluded={excluded}
            guests={guests}
            setGuests={setGuests}
          />
        )}

        {/* Persistent next button (fallback when auto-advance suppressed) */}
        {step < 4 && (
          <div className="container-x pb-12 md:pb-16">
            <button
              type="button"
              onClick={advance}
              disabled={
                (step === 1 && !mood) ||
                (step === 2 && !who) ||
                (step === 3 && !intention)
              }
              className={[
                "inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] text-[12.5px] uppercase tracking-[0.2em] font-bold transition-all duration-200",
                (step === 1 && mood) || (step === 2 && who) || (step === 3 && intention)
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
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <span className="absolute left-4 right-4 bottom-4 flex flex-col gap-1 text-[color:var(--ivory)]">
        <span className="serif text-[1.1rem] md:text-[1.25rem] leading-tight font-semibold [text-wrap:balance]">{label}</span>
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[color:var(--ivory)]/80">{sub}</span>
      </span>
      {selected && (
        <span aria-hidden="true" className="absolute top-3 right-3 inline-flex items-center justify-center h-7 w-7 rounded-full bg-[color:var(--gold)] text-[color:var(--charcoal)]">
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
      <Icon size={16} aria-hidden="true" className={selected ? "text-[color:var(--gold)]" : "text-[color:var(--charcoal)]/55"} />
      <span className="mt-2 text-[15px] font-semibold leading-tight">{label}</span>
      <span className={["mt-0.5 text-[11px] uppercase tracking-[0.16em]", selected ? "text-[color:var(--ivory)]/70" : "text-[color:var(--charcoal)]/55"].join(" ")}>
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
        <span className={["text-[11px] uppercase tracking-[0.18em]", selected ? "text-[color:var(--ivory)]/70" : "text-[color:var(--charcoal)]/55"].join(" ")}>
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
  route,
  stops,
  pace,
  onPaceChange,
  onRemoveStop,
  onAddBackStop,
  onMove,
  onRestart,
  onRetry,
  routeLoading,
  routeError,
  narrative,
  narrativeLoading,
  excluded,
  guests,
  setGuests,
}: {
  mood: Mood;
  route: RouteUI | null;
  stops: RoutedStopUI[];
  pace: Pace;
  onPaceChange: (p: Pace) => void;
  onRemoveStop: (key: string) => void;
  onAddBackStop: (key: string) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
  onRestart: () => void;
  onRetry: () => void;
  routeLoading: boolean;
  routeError: string | null;
  narrative: string;
  narrativeLoading: boolean;
  excluded: string[];
  guests: number;
  setGuests: (n: number) => void;
}) {
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <section className="bg-[color:var(--ivory)]">
      {/* Banner */}
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
                {route ? (
                  <>
                    A day across {route.region.label}.{" "}
                    <span className="italic">Adjust everything.</span>
                  </>
                ) : (
                  <>Shaping your day…</>
                )}
              </h2>
              <p className="mt-2 text-[13.5px] md:text-[15px] leading-[1.55] text-[color:var(--charcoal)]/75">
                Real route, real stops. Remove, reorder or change the pace — the map and story update live.
              </p>
            </div>
            <button
              type="button"
              onClick={onRestart}
              className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[color:var(--charcoal)] border-b border-[color:var(--charcoal)]/30 hover:border-[color:var(--charcoal)] pb-1"
            >
              Restart
            </button>
          </div>
        </div>
      </div>

      <div className="container-x py-10 md:py-14">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 max-w-6xl mx-auto">
          {/* MAP + ROUTE */}
          <div className="lg:col-span-7">
            <RouteMap stops={stops} regionCenter={route ? { lat: route.region.lat, lng: route.region.lng } : null} />

            {/* Route loading / error overlay information */}
            {routeError && (
              <div className="mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-[2px] border border-[color:var(--border)] bg-[color:var(--sand)]">
                <p className="text-[12.5px] text-[color:var(--charcoal)]/80">{routeError}</p>
                <button type="button" onClick={onRetry} className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[color:var(--charcoal)] hover:text-[color:var(--teal)]">
                  Retry
                </button>
              </div>
            )}

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
                      onClick={() => onPaceChange(p.id)}
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
                      <span className={["text-[10.5px] uppercase tracking-[0.16em]", sel ? "text-[color:var(--ivory)]/70" : "text-[color:var(--charcoal)]/55"].join(" ")}>
                        {p.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guests */}
            <div className="mt-6">
              <span className="text-[10.5px] uppercase tracking-[0.24em] font-semibold text-[color:var(--charcoal)]/60">
                Guests
              </span>
              <div className="mt-2 inline-flex items-center gap-2 rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ivory)] p-1.5">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-[2px] text-[color:var(--charcoal)] hover:bg-[color:var(--charcoal)]/5"
                  aria-label="Decrease guests"
                >
                  −
                </button>
                <span className="min-w-10 text-center text-[15px] font-semibold tabular-nums">{guests}</span>
                <button
                  type="button"
                  onClick={() => setGuests(Math.min(12, guests + 1))}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-[2px] text-[color:var(--charcoal)] hover:bg-[color:var(--charcoal)]/5"
                  aria-label="Increase guests"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add-back excluded stops */}
            {excluded.length > 0 && route && (
              <div className="mt-6">
                <span className="text-[10.5px] uppercase tracking-[0.24em] font-semibold text-[color:var(--charcoal)]/60">
                  Removed earlier
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {excluded.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => onAddBackStop(k)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-full border border-[color:var(--border)] bg-[color:var(--ivory)] text-[12px] font-semibold text-[color:var(--charcoal)] hover:border-[color:var(--charcoal)] transition"
                    >
                      <Plus size={12} className="text-[color:var(--gold)]" />
                      {k.replace(/-/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STORY PANEL */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 flex flex-col gap-5">
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
                      {route ? fmtMinutes(route.totals.experienceMinutes) : "—"} · {stops.length} stop{stops.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="serif mt-3 text-[1.15rem] md:text-[1.3rem] leading-[1.25] font-semibold text-[color:var(--charcoal)] [text-wrap:balance]">
                    {stops.length
                      ? stops.map((s) => s.label.split(" — ")[0].split(",")[0]).join(" → ")
                      : routeLoading
                        ? "Drawing your day…"
                        : "No route yet"}
                  </p>
                  {route && (
                    <p className="mt-2 text-[11.5px] uppercase tracking-[0.18em] text-[color:var(--charcoal)]/55 tabular-nums">
                      Driving · {fmtMinutes(route.totals.drivingMinutes)} · €{route.pricePerPersonEur}/person
                    </p>
                  )}
                </div>

                {/* Stops list */}
                {routeLoading && stops.length === 0 ? (
                  <div className="px-5 md:px-6 py-8 flex items-center justify-center text-[color:var(--charcoal)]/60">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="ml-2 text-[12.5px] uppercase tracking-[0.2em]">Shaping your day…</span>
                  </div>
                ) : (
                  <ul className="divide-y divide-[color:var(--border)]">
                    {stops.map((s, i) => (
                      <li key={s.key} className="flex items-start gap-3 px-5 md:px-6 py-3.5">
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
                          {s.blurb && (
                            <p className="mt-1 text-[12.5px] leading-[1.5] text-[color:var(--charcoal)]/70">{s.blurb}</p>
                          )}
                          <p className="mt-1 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--charcoal)]/50 tabular-nums">
                            ≈ {fmtMinutes(s.duration_minutes)}
                            {i > 0 && s.driveMinutesFromPrev > 0 ? ` · ${fmtMinutes(s.driveMinutesFromPrev)} drive` : ""}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button type="button" onClick={() => onMove(i, -1)} disabled={i === 0} aria-label="Move up"
                            className="h-7 w-7 inline-flex items-center justify-center rounded-full text-[color:var(--charcoal)]/50 hover:text-[color:var(--charcoal)] hover:bg-[color:var(--charcoal)]/5 disabled:opacity-30 disabled:cursor-not-allowed transition">
                            <ArrowUp size={13} />
                          </button>
                          <button type="button" onClick={() => onMove(i, 1)} disabled={i === stops.length - 1} aria-label="Move down"
                            className="h-7 w-7 inline-flex items-center justify-center rounded-full text-[color:var(--charcoal)]/50 hover:text-[color:var(--charcoal)] hover:bg-[color:var(--charcoal)]/5 disabled:opacity-30 disabled:cursor-not-allowed transition">
                            <ArrowDown size={13} />
                          </button>
                          <button type="button" onClick={() => onRemoveStop(s.key)} aria-label={`Remove ${s.label}`}
                            className="h-7 w-7 inline-flex items-center justify-center rounded-full text-[color:var(--charcoal)]/50 hover:text-red-700 hover:bg-red-50 transition">
                            <X size={13} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Narrative */}
                <div className="px-5 md:px-6 py-5 border-t border-[color:var(--border)]">
                  <span className="text-[10px] uppercase tracking-[0.26em] font-bold text-[color:var(--gold)]">
                    The feel of it
                  </span>
                  {narrativeLoading && !narrative ? (
                    <p className="mt-2 text-[13px] text-[color:var(--charcoal)]/55 inline-flex items-center gap-2">
                      <Loader2 size={13} className="animate-spin" /> Writing it for you…
                    </p>
                  ) : narrative ? (
                    <p className="serif italic mt-2 text-[15px] md:text-[16px] leading-[1.55] text-[color:var(--charcoal)] [text-wrap:balance]">
                      {narrative}
                    </p>
                  ) : (
                    <p className="mt-2 text-[12.5px] text-[color:var(--charcoal)]/55">
                      Your story will appear here as soon as the route is ready.
                    </p>
                  )}
                </div>

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
                    disabled={!route || stops.length === 0 || routeLoading}
                    onClick={() => setShowCheckout(true)}
                    className={[
                      "group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[52px] text-[12.5px] uppercase tracking-[0.2em] font-bold transition-all duration-200",
                      route && stops.length > 0 && !routeLoading
                        ? "bg-[color:var(--teal)] text-[color:var(--ivory)] hover:bg-[color:var(--teal-2)] shadow-[0_12px_28px_-12px_rgba(41,91,97,0.7)] hover:-translate-y-[2px]"
                        : "bg-[color:var(--charcoal)]/10 text-[color:var(--charcoal)]/40 cursor-not-allowed",
                    ].join(" ")}
                  >
                    {route ? `Reserve · €${route.pricePerPersonEur * guests}` : "Reserve"}
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
            </div>
          </aside>
        </div>
      </div>

      {/* Embedded Stripe checkout */}
      {showCheckout && route && (
        <CheckoutModal
          route={route}
          stops={stops}
          guests={guests}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </section>
  );
}

/* ─── Stripe checkout modal ───────────────────────────────────── */

const stripePromise = getStripe();

function CheckoutModal({
  route,
  stops,
  guests,
  onClose,
}: {
  route: RouteUI;
  stops: RoutedStopUI[];
  guests: number;
  onClose: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const totalCents = route.pricePerPersonEur * guests * 100;
    supabase.functions
      .invoke("create-builder-checkout", {
        body: {
          amountInCents: totalCents,
          guests,
          regionLabel: route.region.label,
          stopLabels: stops.map((s) => s.label),
          pace: route.pace,
          returnUrl: `${window.location.origin}/builder?status=success`,
          environment: getStripeEnvironment(),
        },
      })
      .then(({ data, error: fnError }) => {
        if (cancelled) return;
        if (fnError) {
          setError(fnError.message);
          return;
        }
        const cs = (data as { clientSecret?: string } | null)?.clientSecret;
        if (cs) setClientSecret(cs);
        else setError("Could not start checkout.");
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Checkout failed");
      });
    return () => {
      cancelled = true;
    };
  }, [route, stops, guests]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-auto rounded-[2px] bg-[color:var(--ivory)] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 h-9 w-9 inline-flex items-center justify-center rounded-full bg-[color:var(--charcoal)]/5 hover:bg-[color:var(--charcoal)]/10"
        >
          <X size={16} />
        </button>
        <div className="p-5 md:p-7">
          <p className="text-[10.5px] uppercase tracking-[0.26em] font-bold text-[color:var(--gold)]">Checkout</p>
          <h3 className="serif mt-2 text-[1.4rem] md:text-[1.7rem] leading-tight font-semibold text-[color:var(--charcoal)]">
            {route.region.label} · {guests} guest{guests > 1 ? "s" : ""}
          </h3>
          <p className="mt-1 text-[12.5px] text-[color:var(--charcoal)]/70">
            {stops.length} stops · {route.pace} pace · €{route.pricePerPersonEur * guests}
          </p>
          <div className="mt-5">
            {error && (
              <p className="text-[13px] text-red-700">{error}</p>
            )}
            {!error && !clientSecret && (
              <p className="inline-flex items-center gap-2 text-[13px] text-[color:var(--charcoal)]/70">
                <Loader2 size={14} className="animate-spin" /> Preparing secure checkout…
              </p>
            )}
            {clientSecret && (
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Route map (Leaflet) ─────────────────────────────────────── */

function RouteMap({
  stops,
  regionCenter,
}: {
  stops: RoutedStopUI[];
  regionCenter: { lat: number; lng: number } | null;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
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

  // Draw real engine stops + animated route
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (!stops.length) {
      if (regionCenter) map.flyTo([regionCenter.lat, regionCenter.lng], 9, { duration: 0.6 });
      return;
    }

    const points = stops.map((s) => L.latLng(s.lat, s.lng));

    const cs = getComputedStyle(document.documentElement);
    const teal = cs.getPropertyValue("--teal").trim() || "#" + "295B61";
    const ivory = cs.getPropertyValue("--ivory").trim() || "#" + "FAF8F3";
    const gold = cs.getPropertyValue("--gold").trim() || "#" + "C9A96A";

    const pin = (n: number) =>
      L.divIcon({
        className: "yes-route-pin",
        html: `<div style="
          width:30px;height:30px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:${teal};border:2px solid ${ivory};
          box-shadow:0 4px 10px rgba(0,0,0,0.28);
          display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);color:${ivory};font-weight:700;font-size:12px;font-family:ui-sans-serif,system-ui;">${n}</span>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

    points.forEach((p, i) => {
      const m = L.marker(p, { icon: pin(i + 1) });
      m.bindTooltip(stops[i].label, { direction: "top", offset: [0, -28] });
      layer.addLayer(m);
    });

    const line = L.polyline(points, {
      color: gold,
      weight: 3.5,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
      dashArray: "8 1000",
    });
    layer.addLayer(line);

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
        path.getBoundingClientRect();
        requestAnimationFrame(() => {
          path.style.strokeDashoffset = "0";
        });
      }
    }

    const bounds = L.latLngBounds(points).pad(0.35);
    map.flyToBounds(bounds, { duration: 0.7 });
  }, [stops, regionCenter]);

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
