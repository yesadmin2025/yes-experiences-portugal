import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { signatureTours } from "@/data/signatureTours";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
const RealLeafletMap = lazy(() =>
  import("@/components/RealLeafletMap").then((m) => ({ default: m.RealLeafletMap })),
);
import {
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Sparkles,
  Heart,
  Wine,
  UtensilsCrossed,
  Mountain,
  Landmark,
  Waves,
  Camera,
  Sun,
  Moon,
  Music,
  Gem,
  Users,
  Map as MapIcon,
  MessageCircle,
  BookOpen,
  Clock,
  Save,
  Award,
} from "lucide-react";

const builderSearchSchema = z.object({
  tour: fallback(z.string().optional(), undefined),
  // Persisted builder state (all optional so empty URL = empty builder)
  n: fallback(z.string().optional(), undefined),         // name
  r: fallback(z.string().optional(), undefined),         // region
  g: fallback(z.string().optional(), undefined),         // groupType
  gs: fallback(z.string().optional(), undefined),        // guests
  d: fallback(z.string().optional(), undefined),         // duration
  st: fallback(z.array(z.string()), []).default([]),     // styles
  hl: fallback(z.array(z.string()), []).default([]),     // highlights
  p: fallback(z.string().optional(), undefined),         // pace
  en: fallback(z.array(z.string()), []).default([]),     // enhancements
  t: fallback(z.string().optional(), undefined),         // tier
  step: fallback(z.number().int().min(0).max(11), 0).default(0),
});

export const Route = createFileRoute("/builder")({
  validateSearch: zodValidator(builderSearchSchema),
  head: () => ({
    meta: [
      { title: "YES Experience Studio — Design Your Portugal Experience" },
      {
        name: "description",
        content:
          "Design your private Portugal experience step by step. See your story, route, timeline and investment evolve in real time.",
      },
      { property: "og:title", content: "YES Experience Studio" },
      {
        property: "og:description",
        content:
          "A premium experience configurator. Build a one-day or multi-day private journey, designed with your local guide.",
      },
    ],
  }),
  component: BuilderPage,
});

/* ============================================================
   Step data — mapped to Bible §4.2 (welcome → reveal)
   ============================================================ */

const groupTypes = [
  { id: "couple", name: "Couple", icon: Heart },
  { id: "family", name: "Family", icon: Users },
  { id: "friends", name: "Friends", icon: Users },
  { id: "solo", name: "Solo", icon: Sun },
  { id: "private-group", name: "Private group", icon: Users },
];

const guestSizes = [
  { id: "1-2", label: "1–2", sub: "Intimate" },
  { id: "3-6", label: "3–6", sub: "Small group" },
  { id: "7-15", label: "7–15", sub: "Private group" },
  { id: "16-40", label: "16–40", sub: "Large private" },
  { id: "40+", label: "40+", sub: "Programs" },
];

const durationOpts = [
  { id: "halfday", label: "Half Day", sub: "4 hours", days: 0, hours: 4 },
  { id: "fullday", label: "Full Day", sub: "8–10 hours", days: 1, hours: 9 },
  { id: "twoday", label: "2 Days", sub: "Long weekend", days: 2, hours: 18 },
  { id: "threeday", label: "3 Days", sub: "Slow journey", days: 3, hours: 27 },
  { id: "week", label: "5–7 Days", sub: "Full story", days: 5, hours: 45 },
];

const regionOpts = [
  { id: "lisbon", name: "Lisbon & Coast" },
  { id: "porto", name: "Porto & Douro" },
  { id: "alentejo", name: "Alentejo" },
  { id: "algarve", name: "Algarve" },
];

const styleOpts = [
  { id: "wine", name: "Wine & Vineyards", icon: Wine },
  { id: "gastronomy", name: "Gastronomy", icon: UtensilsCrossed },
  { id: "nature", name: "Nature & Outdoors", icon: Mountain },
  { id: "heritage", name: "Heritage & Culture", icon: Landmark },
  { id: "coastal", name: "Coastal & Sea", icon: Waves },
];

const highlightOpts = [
  { id: "livramento", name: "Livramento Market tasting", short: "Livramento Market" },
  { id: "boat", name: "Arrábida boat tour", short: "Arrábida boat" },
  { id: "jeep", name: "4×4 Jeep off-the-beaten-path", short: "4×4 Jeep" },
  { id: "tiles", name: "Hand-painted tiles workshop", short: "Tiles workshop" },
  { id: "cheese", name: "Azeitão cheese workshop", short: "Cheese workshop" },
  { id: "tasting", name: "Private winery tasting", short: "Wine tasting" },
  { id: "portinho", name: "Lunch at Portinho da Arrábida", short: "Portinho lunch" },
  { id: "sesimbra", name: "Sesimbra fishing village", short: "Sesimbra" },
  { id: "viewpoint", name: "Arrábida secret viewpoint", short: "Secret viewpoint" },
  { id: "dinosaur", name: "Cabo Espichel dinosaur footprints", short: "Dinosaur prints" },
  { id: "ginjinha", name: "Óbidos Ginjinha tasting", short: "Ginjinha" },
];

const paceOpts = [
  { id: "slow", name: "Slow & lingering", icon: Moon, line: "Two stops a day. Long meals." },
  { id: "balanced", name: "Balanced", icon: Sun, line: "Three to four moments." },
  { id: "rich", name: "Rich & full", icon: Music, line: "A fuller day, see and taste it all." },
];

const enhancementOpts = [
  { id: "photographer", name: "Private photographer", icon: Camera },
  { id: "chef", name: "Private chef at home", icon: UtensilsCrossed },
  { id: "music", name: "Live local music", icon: Music },
  { id: "florals", name: "Bespoke florals", icon: Sparkles },
  { id: "transfer", name: "Premium transfer", icon: MapPin },
];

const tierOpts = [
  { id: "signature", name: "Signature", priceFrom: 1850, line: "Refined, private, beautifully timed.", icon: Sparkles },
  { id: "atelier", name: "Atelier", priceFrom: 3400, line: "Higher-touch — premium properties, deeper access.", icon: Gem },
  { id: "couture", name: "Couture", priceFrom: 6200, line: "Fully bespoke — anything is possible.", icon: Heart },
];

/* ============================================================
   State
   ============================================================ */

interface BuilderState {
  name: string;
  region: string | null;
  groupType: string | null;
  guests: string | null;
  duration: string | null;
  styles: string[];
  highlights: string[];
  pace: string | null;
  enhancements: string[];
  tier: string | null;
}

const emptyState: BuilderState = {
  name: "",
  region: null,
  groupType: null,
  guests: null,
  duration: null,
  styles: [],
  highlights: [],
  pace: null,
  enhancements: [],
  tier: null,
};

/* Step model — maps directly to Bible §4.2 */
type StepId =
  | "welcome" | "name" | "region" | "group" | "guests" | "duration"
  | "style" | "highlights" | "pace" | "enhancements" | "tier" | "reveal";

const STEPS: { id: StepId; label: string }[] = [
  { id: "welcome", label: "Welcome" },
  { id: "name", label: "Name" },
  { id: "region", label: "Region" },
  { id: "group", label: "Group" },
  { id: "guests", label: "Guests" },
  { id: "duration", label: "Duration" },
  { id: "style", label: "Style" },
  { id: "highlights", label: "Highlights" },
  { id: "pace", label: "Pace" },
  { id: "enhancements", label: "Enhancements" },
  { id: "tier", label: "Tier" },
  { id: "reveal", label: "Reveal" },
];

/* YES microcopy bank — Bible §8 */
const YES_LINES: Record<string, string[]> = {
  welcome: [
    "YES — let's design your Portugal story.",
    "YES — your journey starts here.",
    "YES — let's build something unforgettable.",
  ],
  early: [
    "YES — great choice.",
    "YES — your journey is taking shape.",
    "YES — this is becoming something special.",
  ],
  mid: [
    "YES — your Portugal story is coming together.",
    "YES — you're halfway to your perfect experience.",
    "YES — your journey is evolving beautifully.",
  ],
  late: [
    "YES — your signature experience is almost ready.",
    "YES — just a few final touches.",
    "YES — you're close to finishing your journey.",
  ],
  done: [
    "YES — you just created something unique.",
    "YES — your Portugal story is ready.",
    "YES — your signature experience is complete.",
  ],
};

function pickYes(stage: keyof typeof YES_LINES, seed: number) {
  const arr = YES_LINES[stage];
  return arr[seed % arr.length];
}

/* ============================================================
   Page
   ============================================================ */

type BuilderSearch = z.infer<typeof builderSearchSchema>;

function stateFromSearch(search: BuilderSearch): BuilderState {
  return {
    name: search.n ?? "",
    region: search.r ?? null,
    groupType: search.g ?? null,
    guests: search.gs ?? null,
    duration: search.d ?? null,
    styles: search.st ?? [],
    highlights: search.hl ?? [],
    pace: search.p ?? null,
    enhancements: search.en ?? [],
    tier: search.t ?? null,
  };
}

function searchFromState(s: BuilderState, stepIdx: number) {
  return {
    n: s.name || undefined,
    r: s.region ?? undefined,
    g: s.groupType ?? undefined,
    gs: s.guests ?? undefined,
    d: s.duration ?? undefined,
    st: s.styles.length ? s.styles : undefined,
    hl: s.highlights.length ? s.highlights : undefined,
    p: s.pace ?? undefined,
    en: s.enhancements.length ? s.enhancements : undefined,
    t: s.tier ?? undefined,
    step: stepIdx || undefined,
  };
}

function BuilderPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/builder" });
  // Initialize from URL so deep links restore state on first render
  const [s, setS] = useState<BuilderState>(() => stateFromSearch(search));
  const [stepIdx, setStepIdx] = useState<number>(() => search.step ?? 0);
  const [view, setView] = useState<"story" | "timeline" | "map">("story");
  const [mobileTab, setMobileTab] = useState<"build" | "preview">("build");
  const hydratedTourRef = useRef<string | null>(null);

  // Deep-link seed: /builder?tour=<id> — only when no persisted state present
  useEffect(() => {
    if (!search.tour || hydratedTourRef.current === search.tour) return;
    const tour = signatureTours.find((t) => t.id === search.tour);
    if (!tour) return;
    hydratedTourRef.current = search.tour;
    const hasPersisted = !!(search.r || search.st?.length || search.hl?.length || search.t);
    if (hasPersisted) return;
    setS((p) => ({ ...p, ...tour.seed, name: p.name || "" }));
    setStepIdx(2);
  }, [search.tour, search.r, search.st, search.hl, search.t]);

  // Sync state → URL (debounced via microtask, replace history)
  useEffect(() => {
    const next = searchFromState(s, stepIdx);
    navigate({
      search: (prev) => ({ ...prev, ...next, tour: prev.tour }),
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, stepIdx]);

  const update = <K extends keyof BuilderState>(k: K, v: BuilderState[K]) =>
    setS((p) => ({ ...p, [k]: v }));
  const toggle = (k: "styles" | "highlights" | "enhancements", id: string) =>
    setS((p) => ({ ...p, [k]: p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id] }));

  const days = durationOpts.find((d) => d.id === s.duration)?.days ?? 1;

  const investment = useMemo(() => {
    const tier = tierOpts.find((t) => t.id === s.tier);
    if (!tier) return null;
    const guestMult =
      s.guests === "1-2" ? 1
      : s.guests === "3-6" ? 1.6
      : s.guests === "7-15" ? 2.8
      : s.guests === "16-40" ? 5
      : s.guests === "40+" ? 9
      : 1;
    const dayMult = Math.max(1, days);
    const enhanceMult = 1 + s.enhancements.length * 0.08;
    return Math.round((tier.priceFrom * guestMult * dayMult * enhanceMult) / 50) * 50;
  }, [s, days]);

  // Progress = filled steps / total content steps (skip welcome + reveal)
  const progress = useMemo(() => {
    const filled = [
      !!s.region, !!s.groupType, !!s.guests, !!s.duration,
      s.styles.length > 0, s.highlights.length > 0,
      !!s.pace, !!s.tier,
    ].filter(Boolean).length;
    return Math.round((filled / 8) * 100);
  }, [s]);

  const stage: keyof typeof YES_LINES =
    progress === 0 ? "welcome"
    : progress < 35 ? "early"
    : progress < 70 ? "mid"
    : progress < 100 ? "late"
    : "done";

  const currentStep = STEPS[stepIdx];
  const goNext = () => {
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMobileTab("build");
    }
  };
  const goBack = () => setStepIdx((i) => Math.max(0, i - 1));
  const goTo = (i: number) => setStepIdx(i);

  const experienceTitle = s.name ? `${s.name}'s Portugal Experience` : "Your Portugal Experience";

  return (
    <SiteLayout>
      {/* Studio header */}
      <section className="pt-28 pb-6 bg-[color:var(--sand)]">
        <div className="container-x">
          <div className="text-center">
            <span className="eyebrow">YES Experience Studio</span>
            <h1 className="serif text-3xl md:text-5xl mt-4 leading-tight text-[color:var(--charcoal)]">
              Design <span className="italic text-[color:var(--teal)]">your way</span>
            </h1>
            <p className="mt-3 text-[13px] md:text-sm text-[color:var(--charcoal-soft)] italic">
              Designed with your local guide. Signed by you.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] mb-2">
              <span>Step {stepIdx + 1} · {currentStep.label}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-1 bg-[color:var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[color:var(--teal)] transition-all duration-500"
                style={{ width: `${Math.max(8, ((stepIdx) / (STEPS.length - 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile tabs: Build / Preview */}
      <div className="lg:hidden sticky top-[72px] z-30 bg-[color:var(--ivory)]/95 backdrop-blur border-b border-[color:var(--border)]">
        <div className="container-x py-3 flex justify-center">
          <div role="tablist" className="inline-flex p-1 bg-[color:var(--sand)] border border-[color:var(--border)] rounded-full">
            {(["build", "preview"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={mobileTab === t}
                onClick={() => setMobileTab(t)}
                className={`px-5 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] transition-all ${
                  mobileTab === t ? "bg-[color:var(--teal)] text-[color:var(--ivory)]" : "text-[color:var(--charcoal-soft)]"
                }`}
              >
                {t === "build" ? "Build" : "Preview"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="py-6 md:py-12">
        <div className="container-x">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
            {/* LEFT — controls */}
            <div className={`lg:col-span-6 xl:col-span-5 ${mobileTab === "build" ? "" : "hidden lg:block"}`}>
              <StepPanel
                step={currentStep.id}
                stepIdx={stepIdx}
                totalSteps={STEPS.length}
                yesLine={pickYes(stage, stepIdx)}
                s={s}
                update={update}
                toggle={toggle}
                onNext={goNext}
                onBack={goBack}
                onJump={goTo}
                investment={investment}
                experienceTitle={experienceTitle}
              />
            </div>

            {/* RIGHT — live preview */}
            <aside className={`lg:col-span-6 xl:col-span-7 ${mobileTab === "preview" ? "" : "hidden lg:block"}`}>
              <div className="lg:sticky lg:top-[120px] space-y-4">
                {/* View mode toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                    Live preview
                  </span>
                  <div className="inline-flex p-1 bg-[color:var(--sand)] border border-[color:var(--border)] rounded-full">
                    {([
                      { id: "story", label: "Story", icon: BookOpen },
                      { id: "timeline", label: "Timeline", icon: Clock },
                      { id: "map", label: "Map", icon: MapIcon },
                    ] as const).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setView(id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] transition-all ${
                          view === id ? "bg-[color:var(--teal)] text-[color:var(--ivory)]" : "text-[color:var(--charcoal-soft)]"
                        }`}
                      >
                        <Icon size={12} /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                {view === "story" && <StoryView s={s} title={experienceTitle} />}
                {view === "timeline" && <TimelineView s={s} />}
                {view === "map" && (
                  <Suspense fallback={<MapFallback />}>
                    <RealLeafletMap region={s.region} />
                  </Suspense>
                )}

                <DnaPanel s={s} setS={setS} />
                <InvestmentPanel s={s} days={days} investment={investment} />
                <DesignerNudge />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

/* ============================================================
   Step panel — switches between the 12 step screens
   ============================================================ */

function StepPanel(props: {
  step: StepId;
  stepIdx: number;
  totalSteps: number;
  yesLine: string;
  s: BuilderState;
  update: <K extends keyof BuilderState>(k: K, v: BuilderState[K]) => void;
  toggle: (k: "styles" | "highlights" | "enhancements", id: string) => void;
  onNext: () => void;
  onBack: () => void;
  onJump: (i: number) => void;
  investment: number | null;
  experienceTitle: string;
}) {
  const { step, stepIdx, totalSteps, yesLine, s, update, toggle, onNext, onBack, onJump, investment, experienceTitle } = props;

  return (
    <div className="bg-[color:var(--card)] border border-[color:var(--border)] p-5 md:p-7 rounded-sm">
      {/* YES line */}
      <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
        {yesLine}
      </p>

      <div className="mt-4 min-h-[280px]">
        {step === "welcome" && <WelcomeStep onStart={onNext} />}
        {step === "name" && <NameStep value={s.name} onChange={(v) => update("name", v)} onNext={onNext} />}
        {step === "region" && <RegionStep value={s.region} onPick={(v) => { update("region", v); }} />}
        {step === "group" && <GroupStep value={s.groupType} onPick={(v) => update("groupType", v)} />}
        {step === "guests" && <GuestsStep value={s.guests} onPick={(v) => update("guests", v)} />}
        {step === "duration" && <DurationStep value={s.duration} onPick={(v) => update("duration", v)} />}
        {step === "style" && <StyleStep values={s.styles} onToggle={(id) => toggle("styles", id)} />}
        {step === "highlights" && <HighlightsStep values={s.highlights} onToggle={(id) => toggle("highlights", id)} />}
        {step === "pace" && <PaceStep value={s.pace} onPick={(v) => update("pace", v)} />}
        {step === "enhancements" && <EnhancementsStep values={s.enhancements} onToggle={(id) => toggle("enhancements", id)} />}
        {step === "tier" && <TierStep value={s.tier} onPick={(v) => update("tier", v)} />}
        {step === "reveal" && <RevealStep s={s} title={experienceTitle} investment={investment} />}
      </div>

      {/* Footer nav */}
      {step !== "welcome" && step !== "reveal" && (
        <div className="mt-6 flex items-center justify-between gap-3 pt-5 border-t border-[color:var(--border)]">
          <button
            onClick={onBack}
            disabled={stepIdx === 0}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[color:var(--charcoal-soft)] disabled:opacity-30"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-[color:var(--teal)] text-[color:var(--ivory)] px-6 py-3 text-[11px] uppercase tracking-[0.18em] hover:bg-[color:var(--teal-2)] transition-colors"
          >
            Continue <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Step dots */}
      <div className="mt-5 flex items-center justify-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === stepIdx ? "w-6 bg-[color:var(--teal)]" : i < stepIdx ? "w-1.5 bg-[color:var(--gold)]" : "w-1.5 bg-[color:var(--border)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Individual steps
   ============================================================ */

function StepHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--charcoal-soft)]">{eyebrow}</span>
      <h2 className="serif text-2xl md:text-3xl mt-2 leading-tight text-[color:var(--charcoal)]">{title}</h2>
      {sub && <p className="mt-2 text-[13px] text-[color:var(--charcoal-soft)]">{sub}</p>}
    </div>
  );
}

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center py-4">
      <h2 className="serif text-3xl md:text-4xl leading-tight text-[color:var(--charcoal)]">
        Design your <span className="italic text-[color:var(--teal)]">Portugal experience</span>
      </h2>
      <p className="mt-4 text-[14px] text-[color:var(--charcoal-soft)] max-w-md mx-auto">
        A few simple choices. Watch your story take shape, live. Book directly when you're ready, or refine it with a local designer.
      </p>
      <button
        onClick={onStart}
        className="mt-7 inline-flex items-center gap-2 bg-[color:var(--teal)] text-[color:var(--ivory)] px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-[color:var(--teal-2)] transition-colors"
      >
        Begin <ArrowRight size={14} />
      </button>
      <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
        Private experiences only · Designed by local experts
      </p>
    </div>
  );
}

function NameStep({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 2 · Optional"
        title="What should we call your experience?"
        sub="Only used to personalize your story. Skip if you prefer."
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onNext()}
        placeholder="e.g. Maria, John, Carlos…"
        className="mt-5 w-full bg-transparent border-b border-[color:var(--border)] focus:border-[color:var(--teal)] outline-none py-3 serif text-2xl text-[color:var(--charcoal)] placeholder:text-[color:var(--charcoal-soft)]/50 transition-colors"
      />
      {value && (
        <p className="mt-3 text-[13px] text-[color:var(--charcoal-soft)] italic">
          Your story will be titled <span className="text-[color:var(--teal)]">{value}'s Portugal Experience</span>.
        </p>
      )}
    </div>
  );
}

function RegionStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 3" title="Where in Portugal?" sub="Pick the region your story begins in." />
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {regionOpts.map((r) => {
          const sel = value === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onPick(r.id)}
              className={`p-4 rounded-sm border text-left transition-all ${
                sel ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5" : "border-[color:var(--border)] hover:border-[color:var(--teal)]/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="serif text-[15px] text-[color:var(--charcoal)]">{r.name}</span>
                {sel && <Check size={14} className="text-[color:var(--teal)] mt-1" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChoiceGrid<T extends { id: string }>(props: {
  items: T[];
  isSelected: (it: T) => boolean;
  onClick: (it: T) => void;
  render: (it: T, sel: boolean) => React.ReactNode;
  cols?: string;
}) {
  const { items, isSelected, onClick, render, cols = "grid-cols-2" } = props;
  return (
    <div className={`mt-5 grid ${cols} gap-2.5`}>
      {items.map((it) => {
        const sel = isSelected(it);
        return (
          <button
            key={it.id}
            onClick={() => onClick(it)}
            className={`p-4 rounded-sm border text-left transition-all ${
              sel ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5" : "border-[color:var(--border)] hover:border-[color:var(--teal)]/40"
            }`}
          >
            {render(it, sel)}
          </button>
        );
      })}
    </div>
  );
}

function GroupStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 4" title="Who's coming?" />
      <ChoiceGrid
        items={groupTypes}
        isSelected={(g) => value === g.id}
        onClick={(g) => onPick(g.id)}
        render={(g, sel) => (
          <div className="flex items-center gap-3">
            <g.icon size={18} className={sel ? "text-[color:var(--teal)]" : "text-[color:var(--charcoal-soft)]"} />
            <span className="serif text-[15px] text-[color:var(--charcoal)]">{g.name}</span>
          </div>
        )}
      />
    </div>
  );
}

function GuestsStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 5" title="How many of you?" />
      <ChoiceGrid
        items={guestSizes}
        isSelected={(g) => value === g.id}
        onClick={(g) => onPick(g.id)}
        render={(g) => (
          <div>
            <span className="serif text-xl text-[color:var(--charcoal)] block">{g.label}</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--charcoal-soft)]">{g.sub}</span>
          </div>
        )}
      />
    </div>
  );
}

function DurationStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 6" title="How long is your story?" sub="One day, or several." />
      <ChoiceGrid
        items={durationOpts}
        cols="grid-cols-1"
        isSelected={(d) => value === d.id}
        onClick={(d) => onPick(d.id)}
        render={(d, sel) => (
          <div className="flex items-center justify-between">
            <div>
              <span className="serif text-[16px] text-[color:var(--charcoal)] block">{d.label}</span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--charcoal-soft)]">{d.sub}</span>
            </div>
            {sel && <Check size={16} className="text-[color:var(--teal)]" />}
          </div>
        )}
      />
    </div>
  );
}

function StyleStep({ values, onToggle }: { values: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 7" title="Choose your style" sub="Pick one or more — your story adapts." />
      <ChoiceGrid
        items={styleOpts}
        isSelected={(s) => values.includes(s.id)}
        onClick={(s) => onToggle(s.id)}
        render={(s, sel) => (
          <div className="flex items-center gap-3">
            <s.icon size={18} className={sel ? "text-[color:var(--teal)]" : "text-[color:var(--charcoal-soft)]"} />
            <span className="serif text-[14px] text-[color:var(--charcoal)]">{s.name}</span>
          </div>
        )}
      />
    </div>
  );
}

function HighlightsStep({ values, onToggle }: { values: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 8" title="Add signature moments" sub="The little touches that make it yours." />
      <div className="mt-5 flex flex-wrap gap-2">
        {highlightOpts.map((h) => {
          const sel = values.includes(h.id);
          return (
            <button
              key={h.id}
              onClick={() => onToggle(h.id)}
              className={`px-3.5 py-2 rounded-full border text-[12px] transition-all ${
                sel
                  ? "border-[color:var(--teal)] bg-[color:var(--teal)] text-[color:var(--ivory)]"
                  : "border-[color:var(--border)] text-[color:var(--charcoal)] hover:border-[color:var(--teal)]/40"
              }`}
            >
              {sel && <Check size={11} className="inline mr-1.5" />}
              {h.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PaceStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 9" title="What's your pace?" />
      <ChoiceGrid
        items={paceOpts}
        cols="grid-cols-1"
        isSelected={(p) => value === p.id}
        onClick={(p) => onPick(p.id)}
        render={(p, sel) => (
          <div className="flex items-start gap-3">
            <p.icon size={18} className={`mt-0.5 ${sel ? "text-[color:var(--teal)]" : "text-[color:var(--charcoal-soft)]"}`} />
            <div>
              <span className="serif text-[15px] text-[color:var(--charcoal)] block">{p.name}</span>
              <span className="text-[12px] text-[color:var(--charcoal-soft)] italic">{p.line}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}

function EnhancementsStep({ values, onToggle }: { values: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 10 · Optional" title="Special touches" sub="Add as many as you like — or none at all." />
      <ChoiceGrid
        items={enhancementOpts}
        isSelected={(e) => values.includes(e.id)}
        onClick={(e) => onToggle(e.id)}
        render={(e, sel) => (
          <div className="flex items-center gap-3">
            <e.icon size={18} className={sel ? "text-[color:var(--teal)]" : "text-[color:var(--charcoal-soft)]"} />
            <span className="serif text-[13px] text-[color:var(--charcoal)] leading-tight">{e.name}</span>
          </div>
        )}
      />
    </div>
  );
}

function TierStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 11" title="Choose your tier" />
      <ChoiceGrid
        items={tierOpts}
        cols="grid-cols-1"
        isSelected={(t) => value === t.id}
        onClick={(t) => onPick(t.id)}
        render={(t, sel) => (
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <t.icon size={16} className={sel ? "text-[color:var(--teal)]" : "text-[color:var(--gold)]"} />
                <span className="serif text-[16px] text-[color:var(--charcoal)]">{t.name}</span>
              </div>
              <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--charcoal-soft)]">
                from €{t.priceFrom.toLocaleString()}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] text-[color:var(--charcoal-soft)] italic">{t.line}</p>
          </div>
        )}
      />
    </div>
  );
}

/* ============================================================
   Reveal — Bible §10 final completion moment
   ============================================================ */

function RevealStep({ s, title, investment }: { s: BuilderState; title: string; investment: number | null }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
        YES — your Portugal story is ready.
      </p>
      <h2 className="serif text-2xl md:text-3xl mt-3 leading-tight text-[color:var(--charcoal)]">
        You just created your <span className="italic text-[color:var(--teal)]">Signature Portugal Experience</span>.
      </h2>
      <p className="mt-3 text-[13px] text-[color:var(--charcoal-soft)] italic">
        Designed with your local guide. Signed by you.
      </p>

      {/* Branded experience card */}
      <div className="mt-6 p-6 bg-gradient-to-br from-[color:var(--sand)] to-[color:var(--card)] border border-[color:var(--gold)]/40 rounded-sm relative overflow-hidden">
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 bg-[color:var(--teal)] text-[color:var(--ivory)] text-[9px] uppercase tracking-[0.22em]">
          <Award size={10} /> YES Approved
        </div>

        <span className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
          Your Signature Portugal Experience
        </span>
        <h3 className="serif text-2xl mt-2 text-[color:var(--charcoal)] leading-tight">{title}</h3>

        <div className="mt-4 space-y-1.5 text-[12px] text-[color:var(--charcoal-soft)]">
          {s.region && <p>· {regionOpts.find((r) => r.id === s.region)?.name}</p>}
          {s.duration && <p>· {durationOpts.find((d) => d.id === s.duration)?.label}</p>}
          {s.styles.length > 0 && <p>· {s.styles.map((id) => styleOpts.find((x) => x.id === id)?.name).join(" · ")}</p>}
          {s.highlights.length > 0 && (
            <p>· {s.highlights.length} signature moment{s.highlights.length > 1 ? "s" : ""}</p>
          )}
        </div>

        <div className="mt-5 pt-5 border-t border-[color:var(--gold)]/30 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">Experience Investment</p>
            <p className="serif text-2xl text-[color:var(--charcoal)]">
              {investment ? `from €${investment.toLocaleString()}` : "—"}
            </p>
          </div>
          <p className="serif italic text-[12px] text-[color:var(--charcoal-soft)] text-right">
            {s.name || "YES Signature Experience"}
          </p>
        </div>
      </div>

      <p className="mt-5 text-[13px] text-[color:var(--charcoal-soft)]">
        Your experience is ready. Your local guide is ready. You can reserve now, save for later, or refine it with your designer.
      </p>

      {/* CTA trio */}
      <div className="mt-6 space-y-2.5">
        <Link
          to="/contact"
          className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--teal)] text-[color:var(--ivory)] px-6 py-4 text-[11px] uppercase tracking-[0.22em] hover:bg-[color:var(--teal-2)] transition-colors"
        >
          Secure Your Experience <ArrowRight size={13} />
        </Link>
        <button className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--card)] border border-[color:var(--border)] text-[color:var(--charcoal)] px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:border-[color:var(--teal)]/40 transition-colors">
          <Save size={13} /> Save My Experience
        </button>
        <Link
          to="/contact"
          className="w-full inline-flex items-center justify-center gap-2 text-[color:var(--charcoal-soft)] px-6 py-2 text-[11px] uppercase tracking-[0.22em] hover:text-[color:var(--teal)] transition-colors"
        >
          <MessageCircle size={13} /> Refine with a Local Designer
        </Link>
      </div>
    </div>
  );
}

/* ============================================================
   Right panel — Story / Timeline / Map / DNA / Investment
   ============================================================ */

function MapFallback() {
  return (
    <div className="aspect-[4/5] bg-[color:var(--card)] border border-[color:var(--border)] grid place-items-center text-xs text-[color:var(--charcoal-soft)] uppercase tracking-[0.2em]">
      Loading map…
    </div>
  );
}

/* Live editorial story — Bible §6 */
function StoryView({ s, title }: { s: BuilderState; title: string }) {
  const fragments = useMemo(() => buildStoryFragments(s), [s]);
  const heroImg = useMemo(() => pickHeroImage(s), [s]);

  return (
    <div className="bg-[color:var(--card)] border border-[color:var(--border)] overflow-hidden rounded-sm">
      <div
        className="aspect-[16/10] bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `linear-gradient(180deg, transparent 40%, rgba(31,31,31,0.7) 100%), url(${heroImg})` }}
      >
        <div className="h-full flex flex-col justify-end p-5">
          <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold-soft)]">
            Your story so far
          </span>
          <h3 className="serif text-2xl text-white mt-1 leading-tight">{title}</h3>
        </div>
      </div>
      <div className="p-5 md:p-6 space-y-3">
        {fragments.length === 0 ? (
          <p className="text-[14px] text-[color:var(--charcoal-soft)] italic leading-relaxed">
            Your local guide is waiting. Make a choice and watch your Portugal story take shape.
          </p>
        ) : (
          fragments.map((f, i) => (
            <p key={i} className="text-[14px] text-[color:var(--charcoal)] leading-relaxed">
              {f}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

function buildStoryFragments(s: BuilderState): string[] {
  const out: string[] = [];
  const who = s.name ? s.name : "you";
  if (s.region) {
    const r = regionOpts.find((x) => x.id === s.region)?.name;
    out.push(`Your day begins in ${r}, where ${who === "you" ? "your" : who + "'s"} local guide is already shaping the rhythm of the experience.`);
  }
  if (s.styles.includes("wine")) {
    out.push("Your local guide introduces you to a family winery where tradition and landscape come together.");
  }
  if (s.highlights.includes("livramento")) {
    out.push("Your local friend begins your day in an authentic local market full of flavors, color, and energy.");
  }
  if (s.styles.includes("coastal") || s.highlights.includes("boat")) {
    out.push("Between stops, your route opens into breathtaking coastal landscapes and hidden roads only locals truly know.");
  }
  if (s.highlights.includes("portinho") || s.styles.includes("gastronomy")) {
    out.push("Midday slows down beautifully with a relaxed local lunch, chosen to fit the pace and mood of your experience.");
  }
  if (s.pace === "slow") {
    out.push("The day unfolds slowly — long meals, longer conversations, and time enough to feel like you belong here.");
  }
  if (s.tier === "couture") {
    out.push("Every detail is shaped around you — this is Portugal at its most personal, its most refined.");
  }
  return out;
}

function pickHeroImage(s: BuilderState): string {
  const base = "https://images.unsplash.com/";
  if (s.highlights.includes("boat") || s.styles.includes("coastal")) {
    return `${base}photo-1518509562904-e7ef99cddc85?w=1200&q=80&auto=format&fit=crop`;
  }
  if (s.styles.includes("wine") || s.highlights.includes("tasting")) {
    return `${base}photo-1506377247377-2a5b3b417ebb?w=1200&q=80&auto=format&fit=crop`;
  }
  if (s.styles.includes("gastronomy") || s.highlights.includes("portinho")) {
    return `${base}photo-1414235077428-338989a2e8c0?w=1200&q=80&auto=format&fit=crop`;
  }
  if (s.styles.includes("nature")) {
    return `${base}photo-1502780402662-acc01917cf6f?w=1200&q=80&auto=format&fit=crop`;
  }
  if (s.styles.includes("heritage")) {
    return `${base}photo-1555881400-74d7acaacd8b?w=1200&q=80&auto=format&fit=crop`;
  }
  return `${base}photo-1539635278303-d4002c07eae3?w=1200&q=80&auto=format&fit=crop`;
}

/* Timeline view — Bible §7.3 */
function TimelineView({ s }: { s: BuilderState }) {
  const blocks = useMemo(() => buildTimeline(s), [s]);
  return (
    <div className="bg-[color:var(--card)] border border-[color:var(--border)] p-5 md:p-6 rounded-sm">
      <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
        Your day, hour by hour
      </span>
      {blocks.length === 0 ? (
        <p className="mt-4 text-[14px] text-[color:var(--charcoal-soft)] italic">
          As you make choices, your timeline will appear here.
        </p>
      ) : (
        <ol className="mt-5 space-y-4">
          {blocks.map((b, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-[color:var(--teal)]/10 border border-[color:var(--teal)]/30 grid place-items-center">
                  <b.icon size={14} className="text-[color:var(--teal)]" />
                </div>
                {i < blocks.length - 1 && <div className="w-px flex-1 bg-[color:var(--border)] mt-1" />}
              </div>
              <div className="flex-1 pb-2">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">{b.when}</p>
                <p className="serif text-[15px] text-[color:var(--charcoal)] mt-0.5">{b.label}</p>
                <p className="text-[12px] text-[color:var(--charcoal-soft)] italic mt-1">{b.line}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function buildTimeline(s: BuilderState) {
  const blocks: { when: string; label: string; line: string; icon: typeof Sun }[] = [];
  if (s.highlights.includes("livramento") || s.styles.includes("gastronomy")) {
    blocks.push({ when: "Morning", label: "Local market discovery", line: "Flavors, color, and the morning energy of a real Portuguese market.", icon: UtensilsCrossed });
  } else if (s.region) {
    blocks.push({ when: "Morning", label: "Pickup with your local guide", line: "Your day starts gently — coffee, introductions, and the road ahead.", icon: Sun });
  }
  if (s.styles.includes("wine") || s.highlights.includes("tasting")) {
    blocks.push({ when: "Midday", label: "Boutique winery tasting", line: "A small family producer — landscape, tradition, and a quiet table.", icon: Wine });
  }
  if (s.highlights.includes("boat") || s.styles.includes("coastal")) {
    blocks.push({ when: "Afternoon", label: "Coastal boat or scenic drive", line: "Hidden coves and roads only locals know.", icon: Waves });
  } else if (s.highlights.includes("jeep")) {
    blocks.push({ when: "Afternoon", label: "Off-the-beaten-path", line: "4×4 across landscapes most travelers never see.", icon: Mountain });
  }
  if (s.highlights.includes("portinho") || s.styles.includes("gastronomy")) {
    blocks.push({ when: "Late afternoon", label: "Long, slow lunch", line: "A traditional table with the right view, the right wine.", icon: UtensilsCrossed });
  }
  if (s.pace === "slow") {
    blocks.push({ when: "Evening", label: "Sunset moment", line: "The day closes the way it should — quietly, beautifully.", icon: Moon });
  }
  return blocks;
}

/* DNA panel — Bible §14 (editable) */
function DnaPanel({ s, setS }: { s: BuilderState; setS: React.Dispatch<React.SetStateAction<BuilderState>> }) {
  const dna = useMemo(() => buildDna(s), [s]);

  const setBar = (label: string, value: number) => {
    setS((p) => applyDnaBar(p, label, Math.max(0, Math.min(5, value))));
  };

  return (
    <div className="bg-[color:var(--card)] border border-[color:var(--border)] p-5 rounded-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">Experience DNA</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--charcoal-soft)] italic">tap to tune</span>
      </div>
      <div className="mt-3 space-y-2.5">
        {dna.bars.map((b) => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="serif text-[12px] text-[color:var(--charcoal)] w-20">{b.label}</span>
            <div
              className="flex-1 flex gap-1"
              role="slider"
              aria-label={`${b.label} intensity`}
              aria-valuemin={0}
              aria-valuemax={5}
              aria-valuenow={b.value}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setBar(b.label, b.value + 1); }
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setBar(b.label, b.value - 1); }
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const segValue = i + 1;
                const active = i < b.value;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBar(b.label, b.value === segValue ? segValue - 1 : segValue)}
                    aria-label={`Set ${b.label} to ${segValue}`}
                    className={`h-3 flex-1 rounded-full transition-all hover:opacity-80 cursor-pointer ${
                      active ? "bg-[color:var(--teal)]" : "bg-[color:var(--border)] hover:bg-[color:var(--teal)]/30"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {dna.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {dna.tags.map((t) => (
            <span key={t} className="px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-[color:var(--sand)] text-[color:var(--charcoal)] rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function buildDna(s: BuilderState) {
  const bars = [
    { label: "Wine", value: (s.styles.includes("wine") ? 3 : 0) + (s.highlights.includes("tasting") ? 2 : 0) },
    { label: "Nature", value: (s.styles.includes("nature") ? 3 : 0) + (s.styles.includes("coastal") ? 2 : 0) },
    { label: "Culture", value: (s.styles.includes("heritage") ? 3 : 0) + (s.highlights.includes("tiles") ? 2 : 0) },
    { label: "Relax", value: s.pace === "slow" ? 5 : s.pace === "balanced" ? 3 : 1 },
  ].map((b) => ({ ...b, value: Math.min(5, b.value) }));

  const tags: string[] = [];
  if (s.styles.includes("wine")) tags.push("Wine Lover");
  if (s.styles.includes("coastal") || s.highlights.includes("boat")) tags.push("Scenic Explorer");
  if (s.highlights.includes("jeep") || s.highlights.includes("dinosaur")) tags.push("Hidden Gem Seeker");
  if (s.pace === "slow") tags.push("Relaxed Traveler");
  if (s.tier === "couture") tags.push("Bespoke");

  return { bars, tags };
}

/* Map a DNA bar value (0-5) back into the underlying state so the story/timeline update live. */
function applyDnaBar(p: BuilderState, label: string, value: number): BuilderState {
  const withStyle = (styles: string[], id: string, on: boolean) =>
    on ? (styles.includes(id) ? styles : [...styles, id]) : styles.filter((x) => x !== id);
  const withHl = (h: string[], id: string, on: boolean) =>
    on ? (h.includes(id) ? h : [...h, id]) : h.filter((x) => x !== id);

  if (label === "Wine") {
    return {
      ...p,
      styles: withStyle(p.styles, "wine", value >= 1),
      highlights: withHl(p.highlights, "tasting", value >= 3),
    };
  }
  if (label === "Nature") {
    return {
      ...p,
      styles: withStyle(withStyle(p.styles, "nature", value >= 1), "coastal", value >= 3),
    };
  }
  if (label === "Culture") {
    return {
      ...p,
      styles: withStyle(p.styles, "heritage", value >= 1),
      highlights: withHl(p.highlights, "tiles", value >= 3),
    };
  }
  if (label === "Relax") {
    const pace = value >= 4 ? "slow" : value >= 2 ? "balanced" : value >= 1 ? "rich" : null;
    return { ...p, pace };
  }
  return p;
}

/* Investment + booking — Bible §12 */
function InvestmentPanel({ s, days, investment }: { s: BuilderState; days: number; investment: number | null }) {
  return (
    <div className="bg-[color:var(--card)] border border-[color:var(--border)] p-5 rounded-sm">
      <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">Experience Investment</span>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <p className="serif text-3xl text-[color:var(--charcoal)]">
          {investment ? `from €${investment.toLocaleString()}` : "—"}
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--charcoal-soft)]">
          {days >= 1 ? `${Math.max(1, days)} day${days > 1 ? "s" : ""}` : "Half day"}
          {s.guests && ` · ${guestSizes.find((g) => g.id === s.guests)?.label}`}
        </p>
      </div>
      <p className="mt-2 text-[12px] text-[color:var(--charcoal-soft)] italic">
        Private experience, local guide and curated stops included. Final value confirmed at booking.
      </p>
    </div>
  );
}

function DesignerNudge() {
  return (
    <Link
      to="/contact"
      className="block bg-[color:var(--sand)] border border-[color:var(--border)] p-4 rounded-sm hover:border-[color:var(--teal)]/40 transition-colors"
    >
      <div className="flex items-start gap-3">
        <MessageCircle size={16} className="text-[color:var(--teal)] mt-0.5" />
        <div>
          <p className="serif text-[14px] text-[color:var(--charcoal)]">Want a hand?</p>
          <p className="text-[12px] text-[color:var(--charcoal-soft)] italic mt-0.5">
            A local designer can refine your story with you — anytime.
          </p>
        </div>
      </div>
    </Link>
  );
}
