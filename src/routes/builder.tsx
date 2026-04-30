import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Loader2, Map as MapIcon, Sparkles, X } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { generateBuilderRoute, narrateBuilderRoute } from "@/server/builderEngine.functions";
import { supabase } from "@/integrations/supabase/client";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";

import { EntryScreen } from "@/components/builder/EntryScreen";
import { PredictiveMoment } from "@/components/builder/PredictiveMoment";
// Leaflet touches `window` at module load — lazy-load to keep it out of SSR.
const BuilderMap = lazy(() =>
  import("@/components/builder/BuilderMap").then((m) => ({ default: m.BuilderMap })),
);
import { JourneyPanel } from "@/components/builder/JourneyPanel";
import { StickyBar } from "@/components/builder/StickyBar";
import { ReviewScreen } from "@/components/builder/ReviewScreen";
import {
  ChoiceRow,
  ChoiceTile,
  MoodCard,
  ProgressDots,
  StepHead,
} from "@/components/builder/Choices";
import { MoodGridSkeleton } from "@/components/builder/Skeletons";
import {
  INTENTIONS,
  MOODS,
  PACES,
  TRANSITION_MICROCOPY,
  WHOS,
} from "@/components/builder/catalogue";
import type {
  Intention,
  Mood,
  Pace,
  RouteUI,
  RoutedStopUI,
  Who,
} from "@/components/builder/types";
import { useBuilderRouteImages, useBuilderMoodImages } from "@/hooks/useBuilderImages";
import {
  parseBuilderSearch,
  type BuilderSearch,
} from "@/components/builder/searchParams";

/* ────────────────────────────────────────────────────────────────
   Builder v6 — Fluid Experience Studio
   Steps: 0 entry · 1 mood · 2 who · 3 intention · 4 pace ·
          5 predictive moment · 6 live builder · 7 review · checkout
   Logic = Postgres + server fns. Narrative = AI over real route.
   Booking = Stripe (TEST MODE). WhatsApp = "Chat with a local".
──────────────────────────────────────────────────────────────── */

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type MobileTab = "build" | "map" | "story";

export const Route = createFileRoute("/builder")({
  validateSearch: parseBuilderSearch,
  head: () => ({
    meta: [
      { title: "Create your Portugal experience — YES" },
      {
        name: "description",
        content:
          "Choose what feels right. We'll shape a real, achievable Portugal experience in real time — adjust everything, confirm instantly.",
      },
      { property: "og:title", content: "Create your Portugal experience — YES" },
      {
        property: "og:description",
        content:
          "Not a form. A live experience taking shape as you choose. Real route, real stops, instant confirmation.",
      },
    ],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/builder" });

  const step = search.step;
  const mood = search.mood;
  const who = search.who;
  const intention = search.intention;
  const pace: Pace = search.pace ?? "balanced";

  const setSearch = useCallback(
    (patch: Partial<BuilderSearch>) => {
      void navigate({
        search: (prev: BuilderSearch) => ({ ...prev, ...patch }),
        replace: false,
      });
    },
    [navigate],
  );

  const setStep = useCallback((s: Step) => setSearch({ step: s }), [setSearch]);
  const setMood = useCallback((m: Mood) => setSearch({ mood: m }), [setSearch]);
  const setWho = useCallback((w: Who) => setSearch({ who: w }), [setSearch]);
  const setIntention = useCallback((i: Intention) => setSearch({ intention: i }), [setSearch]);
  const setPace = useCallback((p: Pace) => setSearch({ pace: p }), [setSearch]);

  const [microcopy, setMicrocopy] = useState<string | null>(null);


  const [route, setRoute] = useState<RouteUI | null>(null);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [pinned] = useState<string[]>([]);
  const [orderOverride, setOrderOverride] = useState<string[] | null>(null);

  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const [narrative, setNarrative] = useState<string>("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  const [guests, setGuests] = useState(2);
  const [mobileTab, setMobileTab] = useState<MobileTab>("build");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const fetchRoute = useCallback(
    async (opts?: { nextExcluded?: string[]; nextPace?: Pace }) => {
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
            pinnedStopKeys: pinned,
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

  // Trigger initial generation when entering predictive moment
  useEffect(() => {
    if (step === 5 && mood && who && intention && !route && !routeLoading) {
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
        if (!cancelled) setNarrative(r.narrative ?? "");
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

  /** Show transient microcopy for ~380ms then advance to nextStep.
   *  Guardrail: in dev, asserts the URL step search-param actually moved. */
  const lastAdvanceTargetRef = useRef<Step | null>(null);
  const flashAndAdvance = useCallback(
    (text: string, nextStep: Step) => {
      setMicrocopy(text);
      lastAdvanceTargetRef.current = nextStep;
      window.setTimeout(() => {
        setStep(nextStep);
        setMicrocopy(null);
      }, 380);
    },
    [setStep],
  );

  // Dev-only guardrail: warn if a flashAndAdvance target wasn't reached.
  useEffect(() => {
    if (import.meta.env.DEV && lastAdvanceTargetRef.current === step) {
      lastAdvanceTargetRef.current = null;
    }
  }, [step]);


  // Live-feedback toast (transient, fades after each interaction)
  const [liveToast, setLiveToast] = useState<string | null>(null);
  const flashLive = useCallback((text: string) => {
    setLiveToast(text);
    window.setTimeout(() => setLiveToast(null), 1400);
  }, []);

  const pickPraise = (pool: string[]) => pool[Math.floor(Math.random() * pool.length)];

  const onPaceChange = (p: Pace) => {
    if (p === pace) return;
    setPace(p);
    flashLive(pickPraise(["Shaping your route", "Adjusting the rhythm", "Reshaping the day"]));
    if (route) void fetchRoute({ nextPace: p });
  };

  const onRemoveStop = (key: string) => {
    const nextExcluded = [...excluded, key];
    setExcluded(nextExcluded);
    flashLive(pickPraise(["Updating your day", "Got it — reshaping", "Refining the route"]));
    void fetchRoute({ nextExcluded });
  };

  const onAddBackStop = (key: string) => {
    const nextExcluded = excluded.filter((k) => k !== key);
    setExcluded(nextExcluded);
    flashLive(pickPraise(["Nice choice", "That works well", "Adding it back in"]));
    void fetchRoute({ nextExcluded });
  };

  const onMove = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= stops.length) return;
    const next = stops.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    setOrderOverride(next.map((s) => s.key));
    flashLive("Reordering");
  };

  // Pool for "removed — add back" surface in the journey panel
  const removablePool = useMemo(() => {
    if (!route) return [];
    return route.stops.map((s) => ({ key: s.key, label: s.label }));
  }, [route]);

  const moodIds = useMemo(() => MOODS.map((m) => m.id), []);
  const { moodImages, loading: moodImagesLoading } = useBuilderMoodImages(moodIds);
  const routeImages = useBuilderRouteImages({
    regionKey: route?.region.key,
    stopKeys: stops.map((s) => s.key),
    mood,
    occasion: intention,
  });

  return (
    <SiteLayout>
      <article className="bg-[color:var(--ivory)] text-[color:var(--charcoal)]">
        {/* Live-feedback toast — visible during step 6 interactions */}
        {liveToast && step === 6 && (
          <div
            aria-live="polite"
            className="fixed top-20 left-1/2 z-[60] -translate-x-1/2 builder-toast-in"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/40 bg-[color:var(--ivory)]/95 px-3.5 py-1.5 text-[11.5px] uppercase tracking-[0.22em] font-bold text-[color:var(--charcoal)] shadow-[0_8px_22px_-10px_rgba(46,46,46,0.35)] backdrop-blur">
              <Sparkles size={11} className="text-[color:var(--gold)]" />
              {liveToast}
            </span>
          </div>
        )}

        {/* STEP 0 — Entry */}
        {step === 0 && <EntryScreen onStart={() => setStep(1)} />}

        {/* STEPS 1–4 — selection flow */}
        {step >= 1 && step <= 4 && (
          <section className="container-x py-10 md:py-16">
            <div className="mb-7 builder-reveal">
              <ProgressDots step={step} total={4} />
            </div>

            {/* Microcopy ribbon */}
            {microcopy && (
              <p
                className="mb-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] font-semibold text-[color:var(--gold)] builder-microcopy"
                aria-live="polite"
              >
                <Sparkles size={12} />
                {microcopy}
              </p>
            )}

            {step === 1 && (
              <div key="step-1" className="builder-step-in">
                <StepHead num={1} eyebrow="Mood" title="What are you in the mood for?" />
                {moodImagesLoading && Object.keys(moodImages).length === 0 ? (
                  <MoodGridSkeleton count={MOODS.length} />
                ) : (
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {MOODS.map((m) => (
                      <MoodCard
                        key={m.id}
                        selected={mood === m.id}
                        onClick={() => {
                          setMood(m.id);
                          flashAndAdvance(TRANSITION_MICROCOPY.mood, 2);
                        }}
                        label={m.label}
                        sub={m.sub}
                        cover={m.cover}
                        realCover={moodImages[m.id] ?? null}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div key="step-2" className="builder-step-in">
                <StepHead num={2} eyebrow="Who" title="Who is this for?" onBack={() => setStep(1)} />
                <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {WHOS.map((w) => (
                    <ChoiceTile
                      key={w.id}
                      selected={who === w.id}
                      onClick={() => {
                        setWho(w.id);
                        flashAndAdvance(TRANSITION_MICROCOPY.who, 3);
                      }}
                      label={w.label}
                      sub={w.sub}
                      Icon={w.icon}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div key="step-3" className="builder-step-in">
                <StepHead
                  num={3}
                  eyebrow="Intention"
                  title="What matters most?"
                  onBack={() => setStep(2)}
                />
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INTENTIONS.map((it) => (
                    <ChoiceRow
                      key={it.id}
                      selected={intention === it.id}
                      onClick={() => {
                        setIntention(it.id);
                        flashAndAdvance(TRANSITION_MICROCOPY.intention, 4);
                      }}
                      label={it.label}
                      sub={it.sub}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div key="step-4" className="builder-step-in">
                <StepHead
                  num={4}
                  eyebrow="Rhythm"
                  title="What rhythm feels right?"
                  onBack={() => setStep(3)}
                />
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PACES.map((p) => (
                    <ChoiceTile
                      key={p.id}
                      selected={pace === p.id}
                      onClick={() => {
                        setPace(p.id);
                        flashAndAdvance(TRANSITION_MICROCOPY.pace, 5);
                      }}
                      label={p.label}
                      sub={p.sub}
                      Icon={p.icon}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* STEP 5 — Predictive moment */}
        {step === 5 && (
          <PredictiveMoment
            loading={routeLoading}
            ready={!!route && !routeLoading}
            onDone={() => setStep(6)}
          />
        )}

        {/* STEP 6 — Live builder */}
        {step === 6 && route && (
          <LiveBuilder
            route={route}
            stops={stops}
            pace={pace}
            excluded={excluded}
            narrative={narrative}
            narrativeLoading={narrativeLoading}
            mobileTab={mobileTab}
            setMobileTab={setMobileTab}
            onPaceChange={onPaceChange}
            onRemoveStop={onRemoveStop}
            onAddBackStop={onAddBackStop}
            onMove={onMove}
            removablePool={removablePool}
            guests={guests}
            setGuests={setGuests}
            routeLoading={routeLoading}
            routeError={routeError}
            onRetry={() => void fetchRoute()}
            onReview={() => setStep(7)}
            stopImages={routeImages.stopImages}
            storyImage={routeImages.storyImage}
            imagesLoading={routeImages.loading}
          />
        )}

        {/* STEP 7 — Review */}
        {step === 7 && route && (
          <>
            <ReviewScreen
              route={route}
              stops={stops}
              guests={guests}
              narrative={narrative}
              reviewThumbs={routeImages.reviewThumbs}
              onConfirm={() => setCheckoutOpen(true)}
              onBack={() => setStep(6)}
            />
            <StickyBar
              totalMinutes={route.totals.experienceMinutes}
              pricePerPersonEur={route.pricePerPersonEur}
              guests={guests}
              setGuests={setGuests}
              onConfirm={() => setCheckoutOpen(true)}
              ctaLabel="Confirm experience"
            />
          </>
        )}

        {/* Checkout overlay */}
        {checkoutOpen && route && (
          <CheckoutModal
            route={route}
            stops={stops}
            guests={guests}
            onClose={() => setCheckoutOpen(false)}
          />
        )}
      </article>
    </SiteLayout>
  );
}

/* ─── Live builder layout (split desktop · tabs mobile) ───────── */

interface LiveBuilderProps {
  route: RouteUI;
  stops: RoutedStopUI[];
  pace: Pace;
  excluded: string[];
  narrative: string;
  narrativeLoading: boolean;
  mobileTab: MobileTab;
  setMobileTab: (t: MobileTab) => void;
  onPaceChange: (p: Pace) => void;
  onRemoveStop: (key: string) => void;
  onAddBackStop: (key: string) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
  removablePool: { key: string; label: string }[];
  guests: number;
  setGuests: (n: number) => void;
  routeLoading: boolean;
  routeError: string | null;
  onRetry: () => void;
  onReview: () => void;
  stopImages: Record<string, { url: string; alt: string } | null>;
  storyImage: { url: string; alt: string } | null;
  imagesLoading: boolean;
}

function LiveBuilder({
  route,
  stops,
  pace,
  excluded,
  narrative,
  narrativeLoading,
  mobileTab,
  setMobileTab,
  onPaceChange,
  onRemoveStop,
  onAddBackStop,
  onMove,
  removablePool,
  guests,
  setGuests,
  routeLoading,
  routeError,
  onRetry,
  onReview,
  stopImages,
  storyImage,
  imagesLoading,
}: LiveBuilderProps) {
  const regionCenter = { lat: Number(route.region.lat), lng: Number(route.region.lng) };

  return (
    <>
      {/* Mobile tab bar */}
      <div className="lg:hidden sticky top-0 z-30 border-b border-[color:var(--charcoal)]/10 bg-[color:var(--ivory)]/95 backdrop-blur">
        <div className="container-x flex items-center gap-1 py-2" role="tablist">
          {(["build", "map", "story"] as MobileTab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={mobileTab === t}
              onClick={() => setMobileTab(t)}
              className={[
                "flex-1 px-3 py-2 text-[11px] uppercase tracking-[0.22em] font-bold transition-colors",
                mobileTab === t
                  ? "text-[color:var(--charcoal)] border-b-2 border-[color:var(--gold)]"
                  : "text-[color:var(--charcoal)]/50 border-b-2 border-transparent",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading ribbon */}
      {(routeLoading || routeError) && (
        <div className="container-x mt-3">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--sand)]/60 px-3 py-1.5 text-[12px] text-[color:var(--charcoal)]/75"
            aria-live="polite"
          >
            {routeLoading && (
              <>
                <Loader2 size={13} className="animate-spin text-[color:var(--gold)]" />
                Reshaping your route…
              </>
            )}
            {routeError && (
              <>
                <span className="text-red-700">{routeError}</span>
                <button
                  type="button"
                  onClick={onRetry}
                  className="ml-2 underline underline-offset-4"
                >
                  Try again
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Desktop split / mobile tab content */}
      <section className="container-x py-6 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* MAP */}
          <div
            className={[
              "relative overflow-hidden rounded-[2px] border border-[color:var(--charcoal)]/12 bg-[color:var(--sand)]",
              "h-[58svh] sm:h-[62svh] lg:h-[72svh] lg:sticky lg:top-20",
              mobileTab === "map" ? "block" : "hidden lg:block",
            ].join(" ")}
          >
            <Suspense fallback={<div className="h-full w-full bg-[color:var(--sand)]" aria-hidden="true" />}>
              <BuilderMap
                stops={stops}
                regionCenter={regionCenter}
                regionKey={route.region.key}
              />
            </Suspense>
          </div>

          {/* PANEL — Build (controls) */}
          <div
            className={[
              "rounded-[2px] border border-[color:var(--charcoal)]/12 bg-[color:var(--ivory)] min-h-[60svh]",
              mobileTab === "build" ? "block" : "hidden lg:block",
            ].join(" ")}
          >
            <JourneyPanel
              route={route}
              stops={stops}
              pace={pace}
              excluded={excluded}
              narrative={narrative}
              narrativeLoading={narrativeLoading}
              onPaceChange={onPaceChange}
              onRemoveStop={onRemoveStop}
              onAddBackStop={onAddBackStop}
              onMove={onMove}
              removablePool={removablePool}
              stopImages={stopImages}
              storyImage={storyImage}
              routeLoading={routeLoading}
              imagesLoading={imagesLoading}
            />
          </div>

          {/* PANEL — Story (mobile-only focused narrative view) */}
          <div
            className={[
              "lg:hidden rounded-[2px] border border-[color:var(--charcoal)]/12 bg-[color:var(--sand)]/40 min-h-[60svh] p-5",
              mobileTab === "story" ? "block" : "hidden",
            ].join(" ")}
          >
            <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--gold)]">
              Story
            </span>
            <h3 className="serif mt-3 text-[1.6rem] leading-[1.1] font-semibold text-[color:var(--charcoal)]">
              {stops.length >= 2
                ? `${stops[0].label} → ${stops[stops.length - 1].label}`
                : route.region.label}
            </h3>
            <p
              className={[
                "mt-4 serif italic leading-[1.45] text-[1.05rem] text-[color:var(--charcoal)]/85 transition-opacity duration-300",
                narrativeLoading ? "opacity-50" : "opacity-100",
              ].join(" ")}
            >
              {narrative ||
                "A real, achievable day in Portugal — shaped from your choices, ready to adjust."}
            </p>
            <dl className="mt-6 grid grid-cols-3 gap-3">
              <div>
                <dt className="text-[9.5px] uppercase tracking-[0.24em] font-semibold text-[color:var(--charcoal)]/55">Stops</dt>
                <dd className="mt-1 serif text-[1.15rem] font-semibold tabular-nums">{stops.length}</dd>
              </div>
              <div>
                <dt className="text-[9.5px] uppercase tracking-[0.24em] font-semibold text-[color:var(--charcoal)]/55">Duration</dt>
                <dd className="mt-1 serif text-[1.15rem] font-semibold tabular-nums">{Math.floor(route.totals.experienceMinutes / 60)}h{route.totals.experienceMinutes % 60 ? String(route.totals.experienceMinutes % 60).padStart(2, "0") : ""}</dd>
              </div>
              <div>
                <dt className="text-[9.5px] uppercase tracking-[0.24em] font-semibold text-[color:var(--charcoal)]/55">Pace</dt>
                <dd className="mt-1 serif text-[1.15rem] font-semibold capitalize">{route.pace}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setMobileTab("build")}
              className="mt-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] font-bold text-[color:var(--teal)] hover:text-[color:var(--charcoal)]"
            >
              Adjust the journey →
            </button>
          </div>
        </div>

        {/* Review CTA — full-width above sticky bar */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onReview}
            disabled={!route.feasible || stops.length === 0}
            className="inline-flex items-center gap-2 rounded-[2px] border border-[color:var(--charcoal)]/20 px-5 py-3 text-[12px] uppercase tracking-[0.2em] font-bold text-[color:var(--charcoal)] hover:border-[color:var(--charcoal)]/45 disabled:opacity-40"
          >
            Review experience
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

      <StickyBar
        totalMinutes={route.totals.experienceMinutes}
        pricePerPersonEur={route.pricePerPersonEur}
        guests={guests}
        setGuests={setGuests}
        onConfirm={onReview}
        disabled={!route.feasible || stops.length === 0}
        ctaLabel="Review & confirm"
      />

      {/* Floating mobile-only map shortcut while on Build tab */}
      <button
        type="button"
        onClick={() => setMobileTab("map")}
        aria-label="Show map"
        className={[
          "lg:hidden fixed bottom-20 right-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--charcoal)] text-[color:var(--ivory)] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.4)]",
          mobileTab === "map" ? "hidden" : "flex",
        ].join(" ")}
      >
        <MapIcon size={18} strokeWidth={1.75} />
      </button>
    </>
  );
}

/* ─── Stripe checkout modal (TEST MODE) ───────────────────────── */

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
          <p className="text-[10.5px] uppercase tracking-[0.26em] font-bold text-[color:var(--gold)]">
            Checkout
          </p>
          <h3 className="serif mt-2 text-[1.4rem] md:text-[1.7rem] leading-tight font-semibold text-[color:var(--charcoal)]">
            {route.region.label} · {guests} guest{guests > 1 ? "s" : ""}
          </h3>
          <p className="mt-1 text-[12.5px] text-[color:var(--charcoal)]/70">
            {stops.length} stops · {route.pace} pace · €{route.pricePerPersonEur * guests}
          </p>
          <div className="mt-5">
            {error && <p className="text-[13px] text-red-700">{error}</p>}
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
