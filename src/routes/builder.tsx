import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { signatureTours } from "@/data/signatureTours";
import { useEffect, useMemo, useRef, useState } from "react";
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
  
  Save,
  Award,
  Share2,
  Check as CheckIcon,
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
          "Start your way. We'll guide you as you build — shaping your private Portugal experience within what works best on the ground. Reserve instantly when ready.",
      },
      { property: "og:title", content: "YES Experience Studio" },
      {
        property: "og:description",
        content:
          "Start with a place, a region or a feeling. Intelligent suggestions, realistic routes — designed with your local guide.",
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
  // (view toggle removed — story, map and timeline are fused in <LiveCanvas/>)
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
              Start with <span className="italic text-[color:var(--teal)]">anything</span>
            </h1>
            <p className="mt-3 text-[13px] md:text-sm text-[color:var(--charcoal-soft)] italic max-w-xl mx-auto">
              A place, a moment, a region, or an idea — shape it into a real Portugal journey, in real time.
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
              Instant confirmation when your journey is ready
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

      {/* Mobile tabs: Builder / Journey */}
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
                {t === "build" ? "Builder" : "Map · Story"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="section-y-app">
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
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                    Live preview
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] italic">
                    Story · map · timeline — together
                  </span>
                </div>

                <LiveCanvas s={s} title={experienceTitle} />

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

function StepHeader({ title, sub }: { title: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="animate-fade-in">
      <h2 className="serif text-[26px] md:text-[34px] leading-[1.15] text-[color:var(--charcoal)]">
        {title}
      </h2>
      {sub && (
        <p className="mt-2.5 text-[13px] md:text-[14px] text-[color:var(--charcoal-soft)] italic leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  );
}

/* Image-led moment card — replaces form tiles across the builder */
function MomentCard({
  image,
  name,
  line,
  selected,
  onClick,
  aspect = "aspect-[4/5]",
}: {
  image: string;
  name: string;
  line?: string;
  selected: boolean;
  onClick: () => void;
  aspect?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative ${aspect} overflow-hidden rounded-sm text-left transition-all duration-300 ${
        selected
          ? "ring-2 ring-[color:var(--teal)] ring-offset-2 ring-offset-[color:var(--ivory)]"
          : "ring-1 ring-[color:var(--border)] hover:ring-[color:var(--teal)]/50"
      }`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      {selected && (
        <div className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-[color:var(--teal)] grid place-items-center shadow-lg animate-scale-in">
          <Check size={14} className="text-[color:var(--ivory)]" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="serif text-[15px] md:text-[16px] text-white leading-tight">{name}</p>
        {line && (
          <p className="mt-1 text-[11px] text-white/80 italic leading-snug line-clamp-2">{line}</p>
        )}
      </div>
    </button>
  );
}

/* ============================================================
   Step content — emotional, image-led
   ============================================================ */

const WELCOME_IMG =
  "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1400&q=80&auto=format&fit=crop";

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="-mx-5 md:-mx-7 -mt-4 animate-fade-in">
      <div
        className="relative aspect-[4/5] md:aspect-[16/10] bg-cover bg-center"
        style={{ backgroundImage: `url(${WELCOME_IMG})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-black/85" />
        <div className="relative h-full flex flex-col justify-end p-6 md:p-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold-soft)]">
            Real-time journey builder
          </p>
          <h2 className="serif text-3xl md:text-5xl mt-3 leading-[1.1] text-white">
            Start with <span className="italic">anything</span>
          </h2>
          <p className="mt-4 text-[14px] md:text-[15px] text-white/85 italic max-w-md mx-auto leading-relaxed">
            A place, a moment, a region, or an idea — shape it into a real Portugal journey.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-stretch sm:items-center max-w-sm mx-auto w-full">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 bg-[color:var(--ivory)] text-[color:var(--charcoal)] px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-white transition-colors"
            >
              Start Building <ArrowRight size={14} />
            </button>
            <a
              href="https://wa.me/351000000000?text=Hi%21%20I%27d%20love%20a%20local%27s%20help%20shaping%20my%20journey%20in%20Portugal."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-white/10 transition-colors"
            >
              <MessageCircle size={13} /> Chat with a local
            </a>
          </div>
          <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-white/70">
            Instant confirmation when your journey is ready
          </p>
        </div>
      </div>
    </div>
  );
}

function NameStep({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div>
      <StepHeader
        title={<>Every great story <span className="italic text-[color:var(--teal)]">has a name</span>.</>}
        sub="Yours, a friend's, the person you're surprising. Skip if you'd rather stay anonymous."
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onNext()}
        placeholder="Maria, John, Carlos…"
        autoFocus
        className="mt-6 w-full bg-transparent border-b-2 border-[color:var(--border)] focus:border-[color:var(--teal)] outline-none py-3 serif text-2xl md:text-3xl text-[color:var(--charcoal)] placeholder:text-[color:var(--charcoal-soft)]/40 transition-colors"
      />
      {value && (
        <p className="mt-4 text-[13px] text-[color:var(--charcoal-soft)] italic animate-fade-in">
          Beautiful. We'll call it <span className="not-italic serif text-[color:var(--teal)]">{value}'s Portugal Experience</span>.
        </p>
      )}
    </div>
  );
}

/* Image + evocative line per region */
const REGION_META: Record<string, { image: string; line: string }> = {
  lisbon: {
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&q=80&auto=format&fit=crop",
    line: "Light on tiles, the river at sunset, hidden hills.",
  },
  porto: {
    image: "https://images.unsplash.com/photo-1555990538-32d6d63a8aae?w=900&q=80&auto=format&fit=crop",
    line: "Granite, port wine, the slow turn of the Douro.",
  },
  alentejo: {
    image: "https://images.unsplash.com/photo-1502780402662-acc01917cf6f?w=900&q=80&auto=format&fit=crop",
    line: "Endless plains, cork oaks, long quiet meals.",
  },
  algarve: {
    image: "https://images.unsplash.com/photo-1518509562904-e7ef99cddc85?w=900&q=80&auto=format&fit=crop",
    line: "Golden cliffs, hidden coves, the sound of the sea.",
  },
};

function RegionStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader
        title={<>Where does your story <span className="italic text-[color:var(--teal)]">begin?</span></>}
        sub="Choose the place that already lives in your imagination."
      />
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {regionOpts.map((r) => {
          const meta = REGION_META[r.id];
          return (
            <MomentCard
              key={r.id}
              image={meta.image}
              name={r.name}
              line={meta.line}
              selected={value === r.id}
              onClick={() => onPick(r.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

const GROUP_META: Record<string, { image: string; line: string }> = {
  couple: {
    image: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800&q=80&auto=format&fit=crop",
    line: "Slow mornings, long looks, a bottle to share.",
  },
  family: {
    image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80&auto=format&fit=crop",
    line: "Stories the children will keep for life.",
  },
  friends: {
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&auto=format&fit=crop",
    line: "The trip everyone keeps talking about.",
  },
  solo: {
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80&auto=format&fit=crop",
    line: "Just you, a guide who listens, a country to discover.",
  },
  "private-group": {
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80&auto=format&fit=crop",
    line: "A private celebration — your people, your pace.",
  },
};

function GroupStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader
        title={<>Who's <span className="italic text-[color:var(--teal)]">with you?</span></>}
        sub="Every story is shaped by the people in it."
      />
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {groupTypes.map((g) => {
          const meta = GROUP_META[g.id];
          return (
            <MomentCard
              key={g.id}
              image={meta.image}
              name={g.name}
              line={meta.line}
              selected={value === g.id}
              onClick={() => onPick(g.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function GuestsStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader
        title={<>How <span className="italic text-[color:var(--teal)]">intimate</span> should it feel?</>}
        sub="A whispered table for two, or a long banquet under the stars."
      />
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {guestSizes.map((g) => {
          const sel = value === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onPick(g.id)}
              aria-pressed={sel}
              className={`p-5 rounded-sm border text-left transition-all ${
                sel
                  ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5"
                  : "border-[color:var(--border)] hover:border-[color:var(--teal)]/40"
              }`}
            >
              <span className="serif text-3xl text-[color:var(--charcoal)] block leading-none">{g.label}</span>
              <span className="mt-2 block text-[11px] uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
                {g.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const DURATION_LINE: Record<string, string> = {
  halfday: "An afternoon that feels like a small holiday.",
  fullday: "Sunrise hopes, sunset memories — one perfect day.",
  twoday: "Long enough to slow down, short enough to crave more.",
  threeday: "A real journey — chapters, not snapshots.",
  week: "Time to belong here. Time to be changed by it.",
};

function DurationStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader
        title={<>How long is <span className="italic text-[color:var(--teal)]">your chapter?</span></>}
        sub="Time is the most beautiful ingredient. Choose generously."
      />
      <div className="mt-5 space-y-2.5">
        {durationOpts.map((d) => {
          const sel = value === d.id;
          return (
            <button
              key={d.id}
              onClick={() => onPick(d.id)}
              aria-pressed={sel}
              className={`w-full p-4 rounded-sm border text-left transition-all ${
                sel
                  ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5"
                  : "border-[color:var(--border)] hover:border-[color:var(--teal)]/40"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="serif text-[18px] text-[color:var(--charcoal)]">{d.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
                      {d.sub}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[color:var(--charcoal-soft)] italic">{DURATION_LINE[d.id]}</p>
                </div>
                {sel && <Check size={16} className="text-[color:var(--teal)] shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const STYLE_META: Record<string, { image: string; line: string }> = {
  wine: {
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80&auto=format&fit=crop",
    line: "Family wineries, cool cellars, a glass that tells a story.",
  },
  gastronomy: {
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop",
    line: "Markets at dawn, long lunches, the chef who knows your name.",
  },
  nature: {
    image: "https://images.unsplash.com/photo-1502780402662-acc01917cf6f?w=800&q=80&auto=format&fit=crop",
    line: "Quiet trails, wild viewpoints, the smell of pine and salt.",
  },
  heritage: {
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80&auto=format&fit=crop",
    line: "Hand-painted tiles, old chapels, palaces that whisper.",
  },
  coastal: {
    image: "https://images.unsplash.com/photo-1518509562904-e7ef99cddc85?w=800&q=80&auto=format&fit=crop",
    line: "Hidden coves, fishing boats, the sea writing your day.",
  },
};

function StyleStep({ values, onToggle }: { values: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <StepHeader
        title={<>What makes you <span className="italic text-[color:var(--teal)]">come alive?</span></>}
        sub="Pick as many as you like — your story softly adapts to each."
      />
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {styleOpts.map((s) => {
          const meta = STYLE_META[s.id];
          return (
            <MomentCard
              key={s.id}
              image={meta.image}
              name={s.name}
              line={meta.line}
              selected={values.includes(s.id)}
              onClick={() => onToggle(s.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

const HIGHLIGHT_IMG: Record<string, string> = {
  livramento: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80&auto=format&fit=crop",
  boat: "https://images.unsplash.com/photo-1518509562904-e7ef99cddc85?w=600&q=80&auto=format&fit=crop",
  jeep: "https://images.unsplash.com/photo-1533873984035-25970ab07461?w=600&q=80&auto=format&fit=crop",
  tiles: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80&auto=format&fit=crop",
  cheese: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80&auto=format&fit=crop",
  tasting: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=80&auto=format&fit=crop",
  portinho: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80&auto=format&fit=crop",
  sesimbra: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=600&q=80&auto=format&fit=crop",
  viewpoint: "https://images.unsplash.com/photo-1502780402662-acc01917cf6f?w=600&q=80&auto=format&fit=crop",
  dinosaur: "https://images.unsplash.com/photo-1519834022362-8b3e996d2c3a?w=600&q=80&auto=format&fit=crop",
  ginjinha: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80&auto=format&fit=crop",
};

function HighlightsStep({ values, onToggle }: { values: string[]; onToggle: (id: string) => void }) {
  const tooMany = values.length >= 5;
  return (
    <div>
      <StepHeader
        title={<>Add the <span className="italic text-[color:var(--teal)]">small magic</span>.</>}
        sub="The little moments — a tasting, a viewpoint, a workshop — that make a day truly yours."
      />
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {highlightOpts.map((h) => (
          <MomentCard
            key={h.id}
            image={HIGHLIGHT_IMG[h.id] ?? STYLE_META.heritage.image}
            name={h.short}
            selected={values.includes(h.id)}
            onClick={() => onToggle(h.id)}
            aspect="aspect-square"
          />
        ))}
      </div>
      {tooMany && (
        <div className="mt-4 p-3.5 border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/8 rounded-sm flex items-start gap-2.5 animate-fade-in">
          <Sun size={14} className="text-[color:var(--gold)] mt-0.5 shrink-0" />
          <p className="text-[12.5px] text-[color:var(--charcoal)] leading-relaxed">
            This may feel rushed. Want to slow the rhythm? <span className="italic text-[color:var(--charcoal-soft)]">Locals suggest 3–4 highlights per day so each moment can breathe.</span>
          </p>
        </div>
      )}
    </div>
  );
}

const PACE_IMG: Record<string, string> = {
  slow: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop",
  balanced: "https://images.unsplash.com/photo-1502780402662-acc01917cf6f?w=900&q=80&auto=format&fit=crop",
  rich: "https://images.unsplash.com/photo-1518509562904-e7ef99cddc85?w=900&q=80&auto=format&fit=crop",
};

function PaceStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader
        title={<>What <span className="italic text-[color:var(--teal)]">rhythm</span> do you want?</>}
        sub="There are no wrong answers — only the pace that feels like you."
      />
      <div className="mt-5 space-y-2.5">
        {paceOpts.map((p) => (
          <MomentCard
            key={p.id}
            image={PACE_IMG[p.id]}
            name={p.name}
            line={p.line}
            selected={value === p.id}
            onClick={() => onPick(p.id)}
            aspect="aspect-[16/7]"
          />
        ))}
      </div>
    </div>
  );
}

const ENH_META: Record<string, { image: string; line: string }> = {
  photographer: {
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=700&q=80&auto=format&fit=crop",
    line: "Quiet, beautiful, never posed — memories that stay.",
  },
  chef: {
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80&auto=format&fit=crop",
    line: "A private table, the chef cooking just for you.",
  },
  music: {
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&q=80&auto=format&fit=crop",
    line: "Fado at sunset. Guitar over dinner. Goosebumps.",
  },
  florals: {
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=700&q=80&auto=format&fit=crop",
    line: "Hand-tied florals to mark the moment.",
  },
  transfer: {
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&q=80&auto=format&fit=crop",
    line: "A premium car, a discreet driver, doors that just open.",
  },
};

function EnhancementsStep({ values, onToggle }: { values: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <StepHeader
        title={<>Add a little <span className="italic text-[color:var(--teal)]">magic.</span></>}
        sub="Optional touches that turn a beautiful day into an unforgettable one."
      />
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {enhancementOpts.map((e) => {
          const meta = ENH_META[e.id];
          return (
            <MomentCard
              key={e.id}
              image={meta.image}
              name={e.name}
              line={meta.line}
              selected={values.includes(e.id)}
              onClick={() => onToggle(e.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

const TIER_IMG: Record<string, string> = {
  signature: "https://images.unsplash.com/photo-1502780402662-acc01917cf6f?w=1000&q=80&auto=format&fit=crop",
  atelier: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1000&q=80&auto=format&fit=crop",
  couture: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=80&auto=format&fit=crop",
};

function TierStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <div>
      <StepHeader
        title={<>Choose the <span className="italic text-[color:var(--teal)]">level of care.</span></>}
        sub="From signature beauty to fully bespoke — your story, dressed your way."
      />
      <div className="mt-5 space-y-3">
        {tierOpts.map((t) => {
          const sel = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              aria-pressed={sel}
              className={`group relative w-full overflow-hidden rounded-sm text-left transition-all ${
                sel
                  ? "ring-2 ring-[color:var(--teal)] ring-offset-2 ring-offset-[color:var(--ivory)]"
                  : "ring-1 ring-[color:var(--border)] hover:ring-[color:var(--teal)]/50"
              }`}
            >
              <div className="relative aspect-[16/7]">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url(${TIER_IMG[t.id]})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20" />
                <div className="relative h-full flex flex-col justify-between p-4 md:p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <t.icon size={14} className="text-[color:var(--gold-soft)]" />
                      <span className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-soft)]">
                        {t.name}
                      </span>
                    </div>
                    {sel && (
                      <div className="h-7 w-7 rounded-full bg-[color:var(--teal)] grid place-items-center animate-scale-in">
                        <Check size={14} className="text-[color:var(--ivory)]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="serif text-[18px] md:text-[20px] text-white leading-tight italic">{t.line}</p>
                    <p className="mt-1.5 text-[11px] uppercase tracking-[0.22em] text-white/80">
                      from €{t.priceFrom.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
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
        YES — your journey is ready
      </p>
      <h2 className="serif text-2xl md:text-3xl mt-3 leading-tight text-[color:var(--charcoal)]">
        Your <span className="italic text-[color:var(--teal)]">Portugal journey</span> is ready.
      </h2>
      <p className="mt-3 text-[13px] text-[color:var(--charcoal-soft)] italic">
        Real route. Real timing. Designed with your local guide.
      </p>

      {/* Branded experience card */}
      <div className="mt-6 p-6 bg-gradient-to-br from-[color:var(--sand)] to-[color:var(--card)] border border-[color:var(--gold)]/40 rounded-sm relative overflow-hidden">
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 bg-[color:var(--teal)] text-[color:var(--ivory)] text-[9px] uppercase tracking-[0.22em]">
          <Award size={10} /> YES Approved
        </div>

        <span className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
          Your Portugal Journey
        </span>
        <h3 className="serif text-2xl mt-2 text-[color:var(--charcoal)] leading-tight">{title}</h3>

        <div className="mt-4 space-y-1.5 text-[12px] text-[color:var(--charcoal-soft)]">
          {s.region && <p>· Route — {regionOpts.find((r) => r.id === s.region)?.name}</p>}
          {s.duration && <p>· Timing — {durationOpts.find((d) => d.id === s.duration)?.label}</p>}
          {s.guests && <p>· Group — {guestSizes.find((g) => g.id === s.guests)?.label} guests</p>}
          {s.styles.length > 0 && <p>· Style — {s.styles.map((id) => styleOpts.find((x) => x.id === id)?.name).join(" · ")}</p>}
          {s.highlights.length > 0 && (
            <p>· {s.highlights.length} stop{s.highlights.length > 1 ? "s" : ""} included · private guide · transfers</p>
          )}
        </div>

        <div className="mt-5 pt-5 border-t border-[color:var(--gold)]/30 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">Total</p>
            <p className="serif text-2xl text-[color:var(--charcoal)]">
              {investment ? `from €${investment.toLocaleString()}` : "—"}
            </p>
          </div>
          <p className="serif italic text-[12px] text-[color:var(--charcoal-soft)] text-right">
            {s.name || "Your Portugal Journey"}
          </p>
        </div>
      </div>

      {/* CTA trio */}
      <div className="mt-6 space-y-2.5">
        <Link
          to="/contact"
          className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--teal)] text-[color:var(--ivory)] px-6 py-4 text-[11px] uppercase tracking-[0.22em] hover:bg-[color:var(--teal-2)] transition-colors"
        >
          Confirm Instantly <ArrowRight size={13} />
        </Link>
        <p className="text-center text-[11px] text-[color:var(--charcoal-soft)] italic -mt-0.5">
          Secure booking directly on our website through our integrated booking system.
        </p>
        <button
          onClick={() => {
            if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--card)] border border-[color:var(--border)] text-[color:var(--charcoal)] px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:border-[color:var(--teal)]/40 transition-colors"
        >
          Adjust Journey
        </button>
        <ShareLinkButton />
        <a
          href="https://wa.me/351000000000?text=Hi%21%20I%27d%20love%20a%20local%27s%20help%20shaping%20my%20journey%20in%20Portugal."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 text-[color:var(--charcoal-soft)] px-6 py-2 text-[11px] uppercase tracking-[0.22em] hover:text-[color:var(--teal)] transition-colors"
        >
          <MessageCircle size={13} /> Chat with a local
        </a>
      </div>
    </div>
  );
}

/* ============================================================
   Right panel — fused LiveCanvas + DNA + Investment
   ============================================================ */

/* ============================================================
   LiveCanvas — fused Story + Map + Timeline.
   One scrolling, image-led narrative where every chapter is also
   a pin on a stylized regional canvas. Hovering a chapter glows
   its pin; tapping a pin scrolls to its chapter.
   ============================================================ */

const REGION_CANVAS: Record<string, { bg: string; label: string; sub: string }> = {
  lisbon: {
    bg: "https://images.unsplash.com/photo-1513735492246-483525079686?w=1400&q=80&auto=format&fit=crop",
    label: "Lisbon & Coast",
    sub: "Tagus light, Atlantic edge",
  },
  porto: {
    bg: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1400&q=80&auto=format&fit=crop",
    label: "Porto & Douro",
    sub: "River, granite, terraced vines",
  },
  alentejo: {
    bg: "https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=1400&q=80&auto=format&fit=crop",
    label: "Alentejo",
    sub: "Cork oaks, slow horizons",
  },
  algarve: {
    bg: "https://images.unsplash.com/photo-1518509562904-e7ef99cddc85?w=1400&q=80&auto=format&fit=crop",
    label: "Algarve",
    sub: "Cliff coves and warm sea",
  },
};

function LiveCanvas({ s, title }: { s: BuilderState; title: string }) {
  const chapters = useMemo(() => buildTimeline(s), [s]);
  const intro = useMemo(() => buildTimelineIntro(s), [s]);
  const heroImg = useMemo(() => pickHeroImage(s), [s]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mapScrollRef = useRef<HTMLDivElement | null>(null);

  const region = s.region ? REGION_CANVAS[s.region] : null;
  const placedChapters = chapters
    .map((c, i) => ({ c, i }))
    .filter((x) => !!x.c.coord);

  // Pre-compute interlude prose between consecutive chapters.
  const interludes = useMemo(() => buildInterludes(chapters, s), [chapters, s]);

  // When activeIdx changes, scroll the corresponding pin into view inside the
  // swipeable map container (mobile-only behavior, harmless on desktop).
  useEffect(() => {
    if (activeIdx == null) return;
    const pinIdx = placedChapters.findIndex((p) => p.i === activeIdx);
    if (pinIdx < 0) return;
    const pinEl = pinRefs.current[pinIdx];
    const container = mapScrollRef.current;
    if (!pinEl || !container) return;
    const pinLeft = pinEl.offsetLeft;
    const targetLeft = Math.max(0, pinLeft - container.clientWidth / 2 + pinEl.clientWidth / 2);
    container.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [activeIdx, placedChapters]);

  const scrollToChapter = (i: number) => {
    const el = itemRefs.current[i];
    if (el && typeof window !== "undefined") {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setActiveIdx(i);
  };

  return (
    <div className="bg-[color:var(--card)] border border-[color:var(--border)] overflow-hidden rounded-sm">
      {/* HERO — story title over evolving image */}
      <div
        className="relative aspect-[16/10] bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(31,31,31,0.05) 0%, rgba(31,31,31,0.8) 100%), url(${heroImg})`,
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-7">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-soft)]">
            Your story so far
          </span>
          <h3 className="serif text-2xl md:text-3xl text-white mt-1.5 leading-tight">{title}</h3>
          {region && (
            <p className="text-[12px] md:text-[13px] text-white/80 italic mt-1.5">
              {region.label} · <span className="not-italic uppercase tracking-[0.2em] text-[10px]">{region.sub}</span>
            </p>
          )}
        </div>
      </div>

      {/* INLINE REGIONAL CANVAS — only when a region is chosen.
          On mobile the inner canvas is wider than the viewport so the user can
          swipe across Portugal; pins stay synced to chapter cards. */}
      {region ? (
        <div className="relative border-t border-[color:var(--border)]">
          <div
            ref={mapScrollRef}
            className="overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div
              className="relative aspect-[16/9] bg-cover bg-center w-[160%] sm:w-[130%] md:w-full snap-start"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(245,239,223,0.0) 0%, rgba(245,239,223,0.55) 100%), url(${region.bg})`,
              }}
            >
              <div className="absolute inset-0 bg-[color:var(--ivory)]/15 mix-blend-overlay pointer-events-none" />

              {placedChapters.map(({ c, i }, pinIdx) => {
                const active = activeIdx === i;
                return (
                  <button
                    key={i}
                    ref={(el) => {
                      pinRefs.current[pinIdx] = el;
                    }}
                    type="button"
                    onClick={() => scrollToChapter(i)}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseLeave={() => setActiveIdx((cur) => (cur === i ? null : cur))}
                    aria-label={`Chapter ${pinIdx + 1}: ${c.label}`}
                    className="absolute -translate-x-1/2 -translate-y-full focus:outline-none group"
                    style={{ left: `${c.coord!.x}%`, top: `${c.coord!.y}%` }}
                  >
                    <div
                      className={`relative h-9 w-9 rounded-full grid place-items-center transition-all duration-300 ${
                        active
                          ? "bg-[color:var(--teal)] scale-110 shadow-[0_6px_20px_rgba(12,91,102,0.5)]"
                          : "bg-[color:var(--ivory)] border border-[color:var(--teal)]/50 group-hover:bg-[color:var(--teal)]/15"
                      }`}
                    >
                      <span
                        className={`serif text-[12px] font-semibold ${
                          active ? "text-[color:var(--ivory)]" : "text-[color:var(--teal)]"
                        }`}
                      >
                        {pinIdx + 1}
                      </span>
                    </div>
                    {active && (
                      <span className="absolute inset-0 rounded-full bg-[color:var(--teal)]/30 animate-ping" />
                    )}
                    {active && (
                      <div className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap px-2.5 py-1 bg-[color:var(--charcoal)] text-[color:var(--ivory)] text-[10px] uppercase tracking-[0.18em] rounded-sm pointer-events-none">
                        {c.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region badge — fixed on top of the swipe container */}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-[color:var(--ivory)]/90 backdrop-blur text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal)] rounded-sm flex items-center gap-1.5 pointer-events-none">
            <MapIcon size={11} className="text-[color:var(--teal)]" />
            {region.label}
          </div>
          {placedChapters.length > 0 && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-[color:var(--charcoal)]/85 text-[color:var(--ivory)] text-[10px] uppercase tracking-[0.22em] rounded-sm pointer-events-none">
              {placedChapters.length} stop{placedChapters.length === 1 ? "" : "s"} · swipe to explore
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 py-4 border-t border-[color:var(--border)] bg-[color:var(--sand)]/40 flex items-center gap-2">
          <MapIcon size={13} className="text-[color:var(--charcoal-soft)]" />
          <p className="text-[12px] text-[color:var(--charcoal-soft)] italic">
            Choose a region and your map will appear here — chapters and stops will pin themselves as you build.
          </p>
        </div>
      )}

      {/* INTRO */}
      <div className="p-5 md:p-7 pb-3">
        {intro ? (
          <p className="text-[14px] md:text-[15px] text-[color:var(--charcoal)] italic leading-relaxed border-l-2 border-[color:var(--teal)]/40 pl-3.5">
            {intro}
          </p>
        ) : (
          <p className="text-[14px] text-[color:var(--charcoal-soft)] italic leading-relaxed">
            Your local guide is waiting. Make a choice and watch your Portugal story unfold — chapter by chapter, pin by pin.
          </p>
        )}
      </div>

      {/* CHAPTERS — interactive list synced to map pins */}
      {chapters.length > 0 && (
        <ol className="px-5 md:px-7 pb-6 space-y-1.5">
          {chapters.map((c, i) => {
            const prev = chapters[i - 1];
            const showSlotHeader = !prev || prev.slot !== c.slot;
            const isLast = i === chapters.length - 1;
            const isPlaced = !!c.coord;
            const pinNumber = isPlaced
              ? placedChapters.findIndex((p) => p.i === i) + 1
              : null;
            const active = activeIdx === i;
            return (
              <li
                key={i}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="animate-fade-in"
                onMouseEnter={() => isPlaced && setActiveIdx(i)}
                onMouseLeave={() => isPlaced && setActiveIdx((cur) => (cur === i ? null : cur))}
              >
                {showSlotHeader && (
                  <div className="flex items-center gap-2 mt-5 mb-2 first:mt-0">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
                      {c.when}
                    </span>
                    <span className="flex-1 h-px bg-[color:var(--border)]" />
                  </div>
                )}
                <div
                  className={`flex gap-4 rounded-sm transition-all ${
                    active ? "bg-[color:var(--teal)]/5 -mx-2 px-2 py-1" : ""
                  }`}
                >
                  {/* Rail with pin badge */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative h-10 w-10 shrink-0 rounded-full grid place-items-center transition-all ${
                        active
                          ? "bg-[color:var(--teal)] border border-[color:var(--teal)]"
                          : "bg-[color:var(--teal)]/10 border border-[color:var(--teal)]/30"
                      }`}
                    >
                      {isPlaced ? (
                        <span
                          className={`serif text-[12px] font-semibold ${
                            active ? "text-[color:var(--ivory)]" : "text-[color:var(--teal)]"
                          }`}
                        >
                          {pinNumber}
                        </span>
                      ) : (
                        <c.icon size={14} className={active ? "text-[color:var(--ivory)]" : "text-[color:var(--teal)]"} />
                      )}
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 bg-gradient-to-b from-[color:var(--teal)]/30 to-[color:var(--border)] mt-1 min-h-[24px]" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 pb-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <c.icon size={12} className="text-[color:var(--gold)]" />
                      <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--charcoal-soft)]">
                        {isPlaced ? `Stop ${String(pinNumber).padStart(2, "0")}` : "Throughout"}
                      </span>
                    </div>
                    <p className="serif text-[17px] md:text-[18px] text-[color:var(--charcoal)] mt-1 leading-snug">
                      {c.label}
                    </p>
                    <p className="text-[13px] text-[color:var(--charcoal-soft)] leading-relaxed mt-1.5">
                      {c.line}
                    </p>
                    {c.tags && c.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] bg-[color:var(--sand)] text-[color:var(--charcoal-soft)] rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Interlude — short poetic bridge to the next chapter */}
                {!isLast && interludes[i] && (
                  <div className="flex gap-4 mt-1.5">
                    <div className="flex flex-col items-center w-10 shrink-0">
                      <div className="w-px flex-1 bg-[color:var(--border)] min-h-[8px]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]/60 my-1" />
                      <div className="w-px flex-1 bg-[color:var(--border)] min-h-[8px]" />
                    </div>
                    <p className="flex-1 text-[12.5px] md:text-[13px] text-[color:var(--charcoal-soft)] italic leading-relaxed pb-3 pt-1">
                      {interludes[i]}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {chapters.length > 0 && (
        <p className="px-5 md:px-7 pb-5 -mt-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] text-center">
          Every chapter is private · designed with your local guide
        </p>
      )}
    </div>
  );
}

/* ============================================================
   Interludes — short poetic bridges between chapters.
   Result is an array indexed by chapter position; entry i is the
   text shown after chapter i (so the last index is unused).
   The voice and choice of bridge adapt to region, highlights,
   enhancements, tier and the current chapter's slot transition.
   ============================================================ */
function buildInterludes(chapters: Chapter[], s: BuilderState): (string | null)[] {
  if (chapters.length < 2) return chapters.map(() => null);
  const v = groupVoice(s);
  const region = regionOpts.find((r) => r.id === s.region)?.name;
  const tier = tierOpts.find((t) => t.id === s.tier)?.id;

  const out: (string | null)[] = [];
  for (let i = 0; i < chapters.length; i++) {
    if (i === chapters.length - 1) {
      out.push(null);
      continue;
    }
    const cur = chapters[i];
    const next = chapters[i + 1];

    // Skip a bridge when both sides are ambient (no place change).
    if (
      (cur.slot === "PRELUDE" || cur.slot === "EPILOGUE") &&
      (next.slot === "PRELUDE" || next.slot === "EPILOGUE")
    ) {
      out.push(null);
      continue;
    }

    out.push(pickInterlude(cur, next, s, v, region, tier));
  }
  return out;
}

function pickInterlude(
  cur: Chapter,
  next: Chapter,
  s: BuilderState,
  v: ReturnType<typeof groupVoice>,
  region: string | undefined,
  tier: string | undefined,
): string {
  const movingToWater =
    next.tags?.some((t) => /boat|coast|water|cove/i.test(t)) ||
    /boat|coast|sea|cove|ocean/i.test(next.label);
  const movingToTable =
    next.tags?.some((t) => /lunch|table|chef|dinner|tasting/i.test(t)) ||
    /lunch|dinner|table|chef|tasting/i.test(next.label);
  const movingToVines =
    next.tags?.some((t) => /wine|vine|cellar|tasting/i.test(t)) ||
    /wine|vines|cellar|winery/i.test(next.label);
  const movingToMarket = /market|stall|tasca/i.test(next.label);
  const movingToHeritage =
    /tile|chapel|palace|castle|monastery|cathedral|museum|village|town/i.test(next.label);
  const slowDown = s.pace === "slow";

  if (cur.slot === "PRELUDE") {
    return "And then, quietly, the day actually begins.";
  }
  if (next.slot === "EPILOGUE") {
    return "And then, just as it should, the day starts to soften.";
  }

  if (movingToWater) {
    return s.enhancements.includes("transfer")
      ? `The car slips down toward the coast. Doors open and ${v.you} can already smell the salt.`
      : `The road bends, the air changes, and suddenly there is water on both sides of ${v.your} window.`;
  }
  if (movingToVines) {
    return region
      ? `${region} unfolds in long, slow rows of vines as ${v.you} ${v.verbBe} pulled gently into wine country.`
      : `The road climbs into the vines, and the world goes quiet in that particular Portuguese way.`;
  }
  if (movingToTable) {
    return slowDown
      ? `There is no rush to the next table. ${capitalize(v.you)} drift toward it the way ${v.you} would drift toward an old friend.`
      : `Hunger arrives on cue. Somewhere ahead, a table has been waiting since this morning — and your guide is already known there.`;
  }
  if (movingToMarket) {
    return `The streets get narrower, the smells get louder, and ${v.your} guide leads ${v.you} into the part of town only locals really know.`;
  }
  if (movingToHeritage) {
    return tier === "couture"
      ? `A door that is normally closed has been quietly opened for ${v.you}. No queue. No crowd. Just stone, and time.`
      : `${capitalize(v.you)} step out of the modern hour and into something much older.`;
  }

  if (cur.slot === "MORNING" || cur.slot === "DAWN" || cur.slot === "LATE_MORNING") {
    if (next.slot === "MIDDAY" || next.slot === "EARLY_AFTERNOON") {
      return `The morning has done its work. The light shifts, ${v.you} ${v.verbBe} a little hungrier, a little more here.`;
    }
  }
  if (cur.slot === "EARLY_AFTERNOON" || cur.slot === "MIDDAY") {
    if (next.slot === "AFTERNOON" || next.slot === "GOLDEN_HOUR") {
      return `Lunch lingers, then loosens its grip. ${capitalize(v.you)} step back into the afternoon, looser, slower, lighter.`;
    }
  }
  if (next.slot === "GOLDEN_HOUR") {
    return `The light starts to lean. Everything Portuguese — stone, water, wine — turns honey-coloured for the next hour.`;
  }
  if (next.slot === "EVENING" || next.slot === "SUNSET") {
    return tier === "couture"
      ? `Day folds quietly into evening. The next chapter has been hand-set, lit, and waiting for ${v.you}.`
      : `The day folds itself into evening, and a different kind of Portugal begins.`;
  }

  return region
    ? `Between one moment and the next, ${region} keeps unfolding around ${v.you}.`
    : `Between one moment and the next, the day keeps quietly arranging itself around ${v.you}.`;
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

/* ============================================================
   Chapter-by-chapter timeline — adapts to every selection.

   Ordering model
   --------------
   Every chapter belongs to a single SLOT. Slots are sorted by their
   numeric weight, lowest first. Within the same slot, chapters keep
   their insertion order (stable sort). The slot also drives the
   "when" label rendered on the rail, so what the user sees in the
   UI always matches the underlying ordering.

   Slot weights are spaced by 10 so individual enhancements can sit
   slightly before/after a slot (e.g. PRELUDE + 1) without colliding.
   ============================================================ */

const SLOT = {
  PRELUDE:         { weight: 0,   label: "Throughout the day" },  // ambient enhancements that frame everything
  DAWN:            { weight: 10,  label: "Morning" },             // arrival / market opening
  MORNING:         { weight: 20,  label: "Morning" },
  LATE_MORNING:    { weight: 30,  label: "Late morning" },        // workshops, cellar visits
  MIDDAY:          { weight: 40,  label: "Midday" },              // wine, signature tasting
  EARLY_AFTERNOON: { weight: 50,  label: "Early afternoon" },     // lunch
  AFTERNOON:       { weight: 60,  label: "Afternoon" },           // adventure, coast, nature
  LATE_AFTERNOON:  { weight: 70,  label: "Late afternoon" },      // viewpoints, heritage stops
  GOLDEN_HOUR:     { weight: 80,  label: "Golden hour" },         // music, florals
  SUNSET:          { weight: 90,  label: "Sunset" },              // pace=slow closing
  EVENING:         { weight: 100, label: "Evening" },             // chef, pace=rich bonus
  EPILOGUE:        { weight: 110, label: "Epilogue" },            // tier-driven follow-up
} as const;

type SlotKey = keyof typeof SLOT;

type Chapter = {
  slot: SlotKey;
  weight: number;        // resolved from slot, plus optional offset
  when: string;          // display label, derived from slot
  label: string;
  line: string;
  icon: typeof Sun;
  tags?: string[];
  /** Normalized 0–100 coordinates inside the inline canvas map. Undefined = ambient (no pin). */
  coord?: { x: number; y: number };
};

function chapter(
  slot: SlotKey,
  data: { label: string; line: string; icon: typeof Sun; tags?: string[]; offset?: number; coord?: { x: number; y: number } },
): Chapter {
  return {
    slot,
    weight: SLOT[slot].weight + (data.offset ?? 0),
    when: SLOT[slot].label,
    label: data.label,
    line: data.line,
    icon: data.icon,
    tags: data.tags,
    coord: data.coord,
  };
}

/** Deterministic pseudo-coord for chapters that don't ship a hand-tuned position. */
function autoCoord(seed: string): { x: number; y: number } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const x = 18 + (Math.abs(h) % 64);          // 18–82
  const y = 22 + (Math.abs(h >> 5) % 56);     // 22–78
  return { x, y };
}

function groupVoice(s: BuilderState) {
  switch (s.groupType) {
    case "couple":
      return { you: "the two of you", your: "your", verbBe: "are", possessive: "your", soft: "for two" };
    case "family":
      return { you: "the whole family", your: "the family's", verbBe: "are", possessive: "your", soft: "for the family" };
    case "friends":
      return { you: "you and your friends", your: "your", verbBe: "are", possessive: "your", soft: "with friends" };
    case "solo":
      return { you: "you", your: "your", verbBe: "are", possessive: "your", soft: "for you alone" };
    case "private-group":
      return { you: "your group", your: "the group's", verbBe: "is", possessive: "your", soft: "for your private group" };
    default:
      return { you: "you", your: "your", verbBe: "are", possessive: "your", soft: "" };
  }
}

function buildTimelineIntro(s: BuilderState): string | null {
  if (!s.region && !s.styles.length) return null;
  const v = groupVoice(s);
  const region = regionOpts.find((r) => r.id === s.region)?.name;
  const tier = tierOpts.find((t) => t.id === s.tier)?.name;
  const opening = region
    ? `${region}. The morning light is just starting to soften, and ${v.you} ${v.verbBe} about to step into a day designed entirely around ${v.your} story.`
    : `A day designed entirely around ${v.your} story is about to begin.`;
  const closing =
    tier === "Couture"
      ? " Every detail — every door, every glass, every quiet pause — has been shaped by hand."
      : tier === "Atelier"
        ? " The pace is slower, the access deeper, the touch lighter than you'd expect."
        : "";
  return opening + closing;
}

function buildTimeline(s: BuilderState): Chapter[] {
  const v = groupVoice(s);
  const region = regionOpts.find((r) => r.id === s.region)?.name;
  const chapters: Chapter[] = [];

  /* ---- PRELUDE — ambient enhancements that frame the entire day ---- */
  if (s.enhancements.includes("transfer")) {
    chapters.push(
      chapter("PRELUDE", {
        label: "A car that just appears",
        line: `A premium vehicle and a discreet driver. Doors open before ${v.you} reach for them. Bags vanish. The day moves without a single small friction.`,
        icon: MapPin,
        tags: ["Premium transfer"],
      }),
    );
  }
  if (s.enhancements.includes("photographer")) {
    chapters.push(
      chapter("PRELUDE", {
        label: "A quiet camera in the background",
        line: `Your private photographer is barely visible — and that's the point. No posing, no smiles on cue. Just ${v.you}, exactly as you are, in the most beautiful corners of the day.`,
        icon: Camera,
        tags: ["Private photographer"],
        offset: 1, // sits just after transfer when both present
      }),
    );
  }

  /* ---- DAWN / MORNING — opening chapter ---- */
  if (s.highlights.includes("livramento") || s.styles.includes("gastronomy")) {
    chapters.push(
      chapter("DAWN", {
        label: "First light at the local market",
        line: `Livramento wakes up in color — fishmongers calling, fruit stacked like a painting, the smell of fresh bread. Your local guide hands ${v.you} a small tasting basket and the day begins with your senses, not your itinerary.`,
        icon: UtensilsCrossed,
        tags: ["Tasting basket", "Local farmers"],
      }),
    );
  } else if (s.region) {
    chapters.push(
      chapter("MORNING", {
        label: `A gentle arrival in ${region}`,
        line: `Your local guide meets ${v.you} where the day feels right — coffee in hand, the route already softly mapped. No rush. Introductions feel more like a conversation between friends than the start of a tour.`,
        icon: Sun,
        tags: ["Private pickup", "Local guide"],
      }),
    );
  }

  /* ---- LATE MORNING — workshops, cellars ---- */
  if (s.highlights.includes("tiles")) {
    chapters.push(
      chapter("LATE_MORNING", {
        label: "Hands in the clay, paint on the tile",
        line: `A small atelier opens its doors just for ${v.you}. The artisan shows ${v.you} the centuries-old gestures, then steps back. ${capitalize(v.your)} hands move slower than expected — and the tile ${v.you === "you" ? "you" : "you all"} paint today will travel home with you.`,
        icon: Landmark,
        tags: ["Private workshop", "Take home a piece"],
      }),
    );
  }
  if (s.highlights.includes("cheese")) {
    chapters.push(
      chapter("LATE_MORNING", {
        label: "The Azeitão cheese cellar",
        line: `Down stone steps into a cool cellar where wheels of sheep's cheese rest in silence. The cheesemaker pours a glass of moscatel, hands ${v.you} a knife, and explains why the texture changes with the season.`,
        icon: UtensilsCrossed,
        tags: ["Family producer", "Tasting"],
        offset: 1, // sits after tiles if both present
      }),
    );
  }

  /* ---- MIDDAY — wine / signature tasting ---- */
  if (s.styles.includes("wine") || s.highlights.includes("tasting")) {
    chapters.push(
      chapter("MIDDAY", {
        label: "A boutique winery, just for you",
        line: `The vines stretch out below as the winemaker — usually impossible to meet — walks ${v.you} between the rows. Inside, a quiet table is set with three wines, a few small plates, and the feeling that this place opened today only because ${v.you} ${v.verbBe} here.`,
        icon: Wine,
        tags: ["Family producer", "Private tasting"],
      }),
    );
  }

  /* ---- EARLY AFTERNOON — lunch ---- */
  if (s.highlights.includes("portinho")) {
    chapters.push(
      chapter("EARLY_AFTERNOON", {
        label: "Lunch with your feet in the sand",
        line: `Portinho da Arrábida — a small white village folded into the cliffs. The chef has chosen the catch this morning. Lunch is long, the wine is cold, and time stops being something you measure.`,
        icon: UtensilsCrossed,
        tags: ["Fresh catch", "Slow lunch"],
      }),
    );
  } else if (s.styles.includes("gastronomy")) {
    chapters.push(
      chapter("EARLY_AFTERNOON", {
        label: "A long table, a chef's hand",
        line: `A quiet local restaurant where the chef knows ${v.your} guide by name. Plates arrive without ceremony — and each one tells a small story of the region.`,
        icon: UtensilsCrossed,
        tags: ["Local chef", "Tasting menu"],
      }),
    );
  }

  /* ---- AFTERNOON — adventure, coast, nature ---- */
  if (s.highlights.includes("boat")) {
    chapters.push(
      chapter("AFTERNOON", {
        label: "On the water in Arrábida",
        line: `A private boat slips out of harbor. Sea-green coves appear one after another, and the captain anchors in the quietest one. ${capitalize(v.you)} swim, or just float, while the cliffs glow gold above.`,
        icon: Waves,
        tags: ["Private boat", "Hidden coves", "Swim stop"],
      }),
    );
  } else if (s.highlights.includes("jeep")) {
    chapters.push(
      chapter("AFTERNOON", {
        label: "Off the map, into the hills",
        line: `The 4×4 leaves the road and climbs into a Portugal most travelers never see — pine forests, ancient stone walls, a single shepherd waving from far away.`,
        icon: Mountain,
        tags: ["Off-road", "Hidden viewpoints"],
      }),
    );
  } else if (s.highlights.includes("sesimbra")) {
    chapters.push(
      chapter("AFTERNOON", {
        label: "A wander through Sesimbra",
        line: `A fishing village that still smells of the sea and the morning's catch. ${capitalize(v.you)} walk slowly along the harbor, stop for an espresso, and let the rhythm of the village set ${v.your} pace.`,
        icon: Waves,
        tags: ["Old village", "Harbor walk"],
      }),
    );
  } else if (s.styles.includes("nature") || s.styles.includes("coastal")) {
    chapters.push(
      chapter("AFTERNOON", {
        label: "Slow roads, wild views",
        line: `Your guide takes the long way — the one that's longer on the map and shorter in the heart. ${capitalize(v.you)} stop wherever ${v.you === "you" ? "you" : "you all"} want, as often as ${v.you === "you" ? "you" : "you all"} want.`,
        icon: Mountain,
        tags: ["Scenic drive", "Photo stops"],
      }),
    );
  }

  /* ---- LATE AFTERNOON — heritage / viewpoints ---- */
  if (s.highlights.includes("viewpoint") || s.styles.includes("heritage")) {
    chapters.push(
      chapter("LATE_AFTERNOON", {
        label: "A viewpoint only locals know",
        line: `A small dirt road, a short walk, and then — the view. Nobody else here. Just the wind, the cliffs, and the kind of silence that makes ${v.you} reach for ${v.your} camera, then put it away again.`,
        icon: Camera,
        tags: ["Hidden viewpoint"],
      }),
    );
  }
  if (s.highlights.includes("dinosaur")) {
    chapters.push(
      chapter("LATE_AFTERNOON", {
        label: "Footprints from before time",
        line: `At Cabo Espichel, fossilized dinosaur tracks climb a vertical cliff above the ocean. Your guide tells ${v.you} the story of how they got there — and the day suddenly feels much, much bigger.`,
        icon: Mountain,
        tags: ["Geology", "Wow moment"],
        offset: 1,
      }),
    );
  }
  if (s.highlights.includes("ginjinha")) {
    chapters.push(
      chapter("LATE_AFTERNOON", {
        label: "A ginjinha in a chocolate cup",
        line: `A tiny doorway in Óbidos. A glass of ruby cherry liqueur, served in a dark chocolate cup. ${capitalize(v.you)} eat the cup. ${capitalize(v.you)} laugh. ${capitalize(v.you)} order another.`,
        icon: Wine,
        tags: ["Local ritual"],
        offset: 2,
      }),
    );
  }

  /* ---- GOLDEN HOUR — atmosphere enhancements ---- */
  if (s.enhancements.includes("music")) {
    chapters.push(
      chapter("GOLDEN_HOUR", {
        label: "Live fado, the sun on its way down",
        line: `A guitarist arrives. Then the singer. The first note of fado moves through the room and ${v.you === "you" ? "you" : "everyone"} stops talking — without anyone deciding to.`,
        icon: Music,
        tags: ["Live music", "Fado"],
      }),
    );
  }
  if (s.enhancements.includes("florals")) {
    chapters.push(
      chapter("GOLDEN_HOUR", {
        label: "Florals on the table, set just for you",
        line: `A florist has been by. The table waiting for ${v.you} is wild and beautiful — branches, herbs, a few quiet candles. Nothing about it feels like a hotel.`,
        icon: Sparkles,
        tags: ["Bespoke florals"],
        offset: 1,
      }),
    );
  }

  /* ---- SUNSET / EVENING — pace-driven closing ---- */
  if (s.pace === "slow") {
    chapters.push(
      chapter("SUNSET", {
        label: "The day closes the way it should",
        line: `Somewhere quiet, somewhere high. ${capitalize(v.you)} watch the light go gold, then pink, then dark blue. Nobody speaks much. Nobody needs to.`,
        icon: Moon,
        tags: ["Sunset moment"],
      }),
    );
  } else if (s.pace === "balanced" && (s.region || s.styles.length)) {
    chapters.push(
      chapter("SUNSET", {
        label: "Drop-off, slow goodbyes",
        line: `Your guide drops ${v.you} off where the day began — but nothing about ${v.you} feels the same. Plans for tomorrow can wait until tomorrow.`,
        icon: Moon,
        tags: ["Private return"],
      }),
    );
  }

  /* ---- EVENING — chef + rich-pace bonus ---- */
  if (s.enhancements.includes("chef")) {
    chapters.push(
      chapter("EVENING", {
        label: "A private chef, a private kitchen",
        line: `Back at the villa, a Portuguese chef is already cooking. ${capitalize(v.you)} pour a glass and watch — or step into the kitchen. Dinner is exactly as long, and exactly as quiet, as ${v.you} want it to be.`,
        icon: UtensilsCrossed,
        tags: ["Private chef", "At home"],
      }),
    );
  }
  if (s.pace === "rich") {
    chapters.push(
      chapter("EVENING", {
        label: "One more taste before the day ends",
        line: `A last stop ${v.you} weren't expecting — a little bar, a tiny tasting room, a chef ${v.your} guide insists ${v.you} meet. The day refuses to end politely.`,
        icon: Music,
        tags: ["Bonus stop"],
        offset: 1, // after chef if both
      }),
    );
  }

  /* ---- EPILOGUE — tier-driven follow-up ---- */
  if (s.tier === "couture") {
    chapters.push(
      chapter("EPILOGUE", {
        label: "A small surprise, signed by your designer",
        line: `Back in ${v.your} room, something is waiting — a handwritten note, a small gift chosen for ${v.you} alone. This is what Couture means: somebody, somewhere, has been thinking about ${v.you} all day.`,
        icon: Heart,
        tags: ["Couture touch"],
      }),
    );
  } else if (s.tier === "atelier") {
    chapters.push(
      chapter("EPILOGUE", {
        label: "A quiet word from your designer",
        line: `An evening message from the designer who built this day. A photograph, a thought for tomorrow, an open invitation to change anything that didn't feel right.`,
        icon: MessageCircle,
        tags: ["Atelier follow-up"],
      }),
    );
  }

  // Stable sort: equal weights keep insertion order
  const sorted = chapters
    .map((c, i) => ({ c, i }))
    .sort((a, b) => a.c.weight - b.c.weight || a.i - b.i)
    .map(({ c }) => c);

  // Assign auto coords to chapters that have a real "place" but no hand-tuned coord.
  // PRELUDE / EPILOGUE chapters stay ambient (no pin on the map).
  return sorted.map((c) => {
    if (c.coord) return c;
    if (c.slot === "PRELUDE" || c.slot === "EPILOGUE") return c;
    return { ...c, coord: autoCoord(c.label) };
  });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
        Private guide, real route, curated stops included. Confirm instantly through our integrated booking system — no forms, no waiting.
      </p>
    </div>
  );
}

function DesignerNudge() {
  return (
    <a
      href="https://wa.me/351000000000?text=Hi%21%20I%27d%20love%20a%20local%27s%20help%20shaping%20my%20journey%20in%20Portugal."
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[color:var(--sand)] border border-[color:var(--border)] p-4 rounded-sm hover:border-[color:var(--teal)]/40 transition-colors"
    >
      <div className="flex items-start gap-3">
        <MessageCircle size={16} className="text-[color:var(--teal)] mt-0.5" />
        <div>
          <p className="serif text-[14px] text-[color:var(--charcoal)]">Need help shaping it?</p>
          <p className="text-[12px] text-[color:var(--charcoal-soft)] italic mt-0.5">
            A local is here in real time — ask anything, anytime.
          </p>
        </div>
      </div>
    </a>
  );
}

function ShareLinkButton() {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: "My Portugal Experience" });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // user cancelled share — no-op
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--card)] border border-[color:var(--border)] text-[color:var(--charcoal)] px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:border-[color:var(--teal)]/40 transition-colors"
    >
      {copied ? <><CheckIcon size={13} /> Link Copied</> : <><Share2 size={13} /> Copy Share Link</>}
    </button>
  );
}
