import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Calendar,
  Users,
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
} from "lucide-react";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Experience Studio — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Design your own private Portugal experience — region, group, pace, highlights and tier. A live story, timeline and map evolve as you go.",
      },
      { property: "og:title", content: "The Experience Studio" },
      {
        property: "og:description",
        content: "Build your own private Portugal experience, step by step.",
      },
    ],
  }),
  component: BuilderPage,
});

/* ---------- Data ---------- */

const groupTypes = [
  { id: "couple", name: "Couple", icon: Heart },
  { id: "family", name: "Family", icon: Users },
  { id: "friends", name: "Friends", icon: Users },
  { id: "solo", name: "Solo", icon: Sun },
  { id: "private-group", name: "Large private group", icon: Users },
];

const guestSizes = [
  { id: "1-2", label: "1–2", sub: "Intimate" },
  { id: "3-6", label: "3–6", sub: "Small group" },
  { id: "7-15", label: "7–15", sub: "Private group" },
  { id: "16-40", label: "16–40", sub: "Large private" },
  { id: "40+", label: "40+", sub: "Programs" },
];

const durationOpts = [
  { id: "halfday", label: "Half Day", sub: "4 hours", days: 0 },
  { id: "fullday", label: "Full Day", sub: "8–10 hours", days: 1 },
  { id: "twoday", label: "2 Days", sub: "Long weekend", days: 2 },
  { id: "threeday", label: "3 Days", sub: "Slow journey", days: 3 },
  { id: "week", label: "5–7 Days", sub: "Full story", days: 5 },
];

const styleOpts = [
  { id: "wine", name: "Wine & Vineyards", icon: Wine, story: "Your local guide introduces you to a family-run winery far from tourist routes — the winemaker pours from the cellar himself." },
  { id: "gastronomy", name: "Gastronomy", icon: UtensilsCrossed, story: "A long table is set in the chef's kitchen — tonight's menu was decided this morning at the market." },
  { id: "nature", name: "Nature & Outdoors", icon: Mountain, story: "You walk a quiet ridge known mostly to local shepherds — the valley unfolds below, all yours." },
  { id: "heritage", name: "Heritage & Culture", icon: Landmark, story: "An artisan opens his atelier doors — three generations of craft, told over coffee." },
  { id: "coastal", name: "Coastal & Sea", icon: Waves, story: "You follow hidden coastal roads known mostly to locals — the kind that end at a fishermen's lunch." },
];

const highlightOpts = [
  { id: "market", name: "Local market at dawn", story: "Your day begins in a vibrant local market where real life unfolds — pastries, fresh fish, the day's first conversations." },
  { id: "viewpoint", name: "Secret viewpoint", story: "A bend in the road most travelers miss — the whole valley opens up, and nobody else is there." },
  { id: "tasting", name: "Private tasting", story: "Just for you, in a cellar most never see — five wines, five stories, told by the maker." },
  { id: "longlunch", name: "Long lunch with locals", story: "Three hours, four courses, a family table you'd swear you'd known for years." },
  { id: "atelier", name: "Artisan atelier visit", story: "Hands at work — tiles, leather, ceramics — the Portugal that still makes things by hand." },
];

const paceOpts = [
  { id: "slow", name: "Slow & lingering", icon: Moon, line: "Two stops a day. Long meals. Time to breathe." },
  { id: "balanced", name: "Balanced", icon: Sun, line: "Three to four moments. Room for the unplanned." },
  { id: "rich", name: "Rich & full", icon: Music, line: "A fuller day — for travelers who want to see and taste it all." },
];

const enhancementOpts = [
  { id: "photographer", name: "Private photographer", icon: Camera },
  { id: "chef", name: "Private chef at home", icon: UtensilsCrossed },
  { id: "music", name: "Live local music", icon: Music },
  { id: "florals", name: "Bespoke florals", icon: Sparkles },
  { id: "transfer", name: "Premium transfer", icon: MapPin },
];

const tierOpts = [
  { id: "signature", name: "Signature", priceFrom: 1850, line: "Our refined standard — private, curated, beautifully timed.", icon: Sparkles },
  { id: "atelier", name: "Atelier", priceFrom: 3400, line: "Higher-touch — premium properties, deeper access, finer details.", icon: Gem },
  { id: "couture", name: "Couture", priceFrom: 6200, line: "Fully bespoke — anything is possible, nothing is fixed.", icon: Heart },
];

/* ---------- Map regions ---------- */

const regionMap: Record<string, { x: number; y: number }> = {
  lisbon: { x: 30, y: 65 },
  porto: { x: 32, y: 22 },
  douro: { x: 55, y: 22 },
  alentejo: { x: 50, y: 78 },
  algarve: { x: 45, y: 92 },
  sintra: { x: 22, y: 62 },
};

const regionOpts = [
  { id: "lisbon", name: "Lisbon & Coast" },
  { id: "porto", name: "Porto & Douro" },
  { id: "alentejo", name: "Alentejo" },
  { id: "algarve", name: "Algarve" },
];

/* ---------- Component ---------- */

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

function BuilderPage() {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<BuilderState>({
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
  });

  const steps = [
    "Name",
    "Group",
    "Guests",
    "Region",
    "Duration",
    "Style",
    "Highlights",
    "Pace",
    "Enhancements",
    "Tier",
    "Your Story",
  ];

  const update = <K extends keyof BuilderState>(k: K, v: BuilderState[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  const toggle = (k: "styles" | "highlights" | "enhancements", id: string) =>
    setS((p) => ({
      ...p,
      [k]: p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id],
    }));

  const canNext =
    (step === 0) ||
    (step === 1 && s.groupType) ||
    (step === 2 && s.guests) ||
    (step === 3 && s.region) ||
    (step === 4 && s.duration) ||
    (step === 5 && s.styles.length > 0) ||
    (step === 6 && s.highlights.length > 0) ||
    (step === 7 && s.pace) ||
    (step === 8) ||
    (step === 9 && s.tier) ||
    step === 10;

  /* Live story compiles from selections */
  const liveStory = useMemo(() => {
    const lines: string[] = [];
    if (s.region) lines.push(`Your story unfolds in ${regionOpts.find((r) => r.id === s.region)?.name}.`);
    if (s.duration) {
      const d = durationOpts.find((d) => d.id === s.duration);
      if (d) lines.push(`Across ${d.label.toLowerCase()}, at a pace that feels right.`);
    }
    s.styles.slice(0, 2).forEach((id) => {
      const st = styleOpts.find((x) => x.id === id);
      if (st) lines.push(st.story);
    });
    s.highlights.slice(0, 2).forEach((id) => {
      const h = highlightOpts.find((x) => x.id === id);
      if (h) lines.push(h.story);
    });
    if (s.pace) {
      const p = paceOpts.find((x) => x.id === s.pace);
      if (p) lines.push(p.line);
    }
    return lines;
  }, [s]);

  const days = durationOpts.find((d) => d.id === s.duration)?.days ?? 1;
  const isMultiDay = days >= 2;

  /* Investment estimate */
  const investment = useMemo(() => {
    const tier = tierOpts.find((t) => t.id === s.tier);
    if (!tier) return null;
    const guestMult =
      s.guests === "1-2" ? 1 :
      s.guests === "3-6" ? 1.6 :
      s.guests === "7-15" ? 2.8 :
      s.guests === "16-40" ? 5 :
      s.guests === "40+" ? 9 : 1;
    const dayMult = Math.max(1, days);
    const enhanceMult = 1 + s.enhancements.length * 0.08;
    return Math.round((tier.priceFrom * guestMult * dayMult * enhanceMult) / 50) * 50;
  }, [s, days]);

  return (
    <SiteLayout>
      {/* Header */}
      <section className="pt-32 pb-10 bg-[color:var(--sand)]">
        <div className="container-x text-center">
          <span className="eyebrow">The Experience Studio</span>
          <h1 className="serif text-4xl md:text-6xl mt-5 leading-tight">
            Design your <span className="italic text-[color:var(--teal)]">Portugal story</span>
          </h1>
          <p className="mt-5 text-[color:var(--charcoal-soft)] max-w-xl mx-auto">
            One decision at a time. Your story, timeline and map evolve as you go.
          </p>
        </div>
      </section>

      {/* Progress */}
      <section className="border-b border-[color:var(--border)] bg-[color:var(--ivory)] sticky top-[80px] z-30 backdrop-blur">
        <div className="container-x py-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {steps.map((label, i) => (
              <button
                key={label}
                onClick={() => i <= step && setStep(i)}
                className="flex items-center gap-2 flex-shrink-0 group"
              >
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-all ${
                    i < step
                      ? "bg-[color:var(--teal)] text-[color:var(--ivory)]"
                      : i === step
                        ? "bg-[color:var(--gold)] text-[color:var(--charcoal)]"
                        : "bg-[color:var(--sand)] text-[color:var(--charcoal-soft)] border border-[color:var(--border)]"
                  }`}
                >
                  {i < step ? <Check size={11} /> : i + 1}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] hidden md:inline ${
                    i === step ? "text-[color:var(--teal)]" : "text-[color:var(--charcoal-soft)]"
                  }`}
                >
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div className="hidden md:block w-6 h-px bg-[color:var(--border)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Body — split: form left, live story+map right */}
      <section className="py-12 md:py-16">
        <div className="container-x">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* LEFT: form */}
            <div className="lg:col-span-7 xl:col-span-8">
              {step === 0 && (
                <Step
                  eyebrow="A small touch — optional"
                  title="What shall we call your story?"
                  sub="A name helps us shape it. You can skip if you'd rather."
                >
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. The Anniversary Trip · A Quiet Douro Weekend"
                    className="w-full max-w-xl bg-transparent border-b border-[color:var(--charcoal)]/25 focus:border-[color:var(--teal)] outline-none py-4 serif text-2xl placeholder:text-[color:var(--charcoal-soft)]/60 transition-colors"
                  />
                </Step>
              )}

              {step === 1 && (
                <Step eyebrow="Step 2 · Group" title="Who's traveling?" sub="The energy of your group shapes everything that follows.">
                  <Cards
                    options={groupTypes}
                    selected={s.groupType ? [s.groupType] : []}
                    onSelect={(id) => update("groupType", id)}
                  />
                </Step>
              )}

              {step === 2 && (
                <Step eyebrow="Step 3 · Guests" title="How many of you?" sub="From a single guest to large private groups — always entirely private.">
                  <PillCards
                    options={guestSizes}
                    selected={s.guests ? [s.guests] : []}
                    onSelect={(id) => update("guests", id)}
                  />
                </Step>
              )}

              {step === 3 && (
                <Step eyebrow="Step 4 · Region" title="Where in Portugal?" sub="Pick a starting region. We'll weave in nearby gems most travelers never reach.">
                  <PillCards
                    options={regionOpts.map((r) => ({ id: r.id, label: r.name, sub: "Private access" }))}
                    selected={s.region ? [s.region] : []}
                    onSelect={(id) => update("region", id)}
                  />
                </Step>
              )}

              {step === 4 && (
                <Step eyebrow="Step 5 · Duration" title="How long do you have?" sub="From a single afternoon to a full week-long story.">
                  <PillCards
                    options={durationOpts}
                    selected={s.duration ? [s.duration] : []}
                    onSelect={(id) => update("duration", id)}
                  />
                </Step>
              )}

              {step === 5 && (
                <Step eyebrow="Step 6 · Style" title="What inspires you?" sub="Pick what speaks to you — choose one or several.">
                  <Cards
                    options={styleOpts}
                    selected={s.styles}
                    onSelect={(id) => toggle("styles", id)}
                    multi
                  />
                </Step>
              )}

              {step === 6 && (
                <Step eyebrow="Step 7 · Highlights" title="A few signature moments" sub="Quiet, unforgettable details — the kind only locals know to suggest.">
                  <PillCards
                    options={highlightOpts.map((h) => ({ id: h.id, label: h.name, sub: "Insider moment" }))}
                    selected={s.highlights}
                    onSelect={(id) => toggle("highlights", id)}
                    multi
                  />
                </Step>
              )}

              {step === 7 && (
                <Step eyebrow="Step 8 · Pace" title="How fast does your day move?" sub="The most important decision most travelers never make.">
                  <Cards
                    options={paceOpts}
                    selected={s.pace ? [s.pace] : []}
                    onSelect={(id) => update("pace", id)}
                  />
                </Step>
              )}

              {step === 8 && (
                <Step eyebrow="Step 9 · Enhancements" title="Add a refined touch" sub="Optional — for moments worth elevating.">
                  <Cards
                    options={enhancementOpts}
                    selected={s.enhancements}
                    onSelect={(id) => toggle("enhancements", id)}
                    multi
                  />
                </Step>
              )}

              {step === 9 && (
                <Step eyebrow="Step 10 · Experience tier" title="Choose the level of refinement" sub="Each tier is fully private. Each is bespoke. The difference is depth.">
                  <div className="space-y-4">
                    {tierOpts.map((t) => {
                      const active = s.tier === t.id;
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => update("tier", t.id)}
                          className={`w-full text-left p-6 border transition-all flex gap-5 items-start ${
                            active
                              ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5"
                              : "border-[color:var(--border)] hover:border-[color:var(--gold)]"
                          }`}
                        >
                          <Icon
                            size={28}
                            className={active ? "text-[color:var(--teal)]" : "text-[color:var(--gold)]"}
                          />
                          <div className="flex-1">
                            <div className="flex items-baseline justify-between gap-3">
                              <h3 className="serif text-2xl text-[color:var(--charcoal)]">{t.name}</h3>
                              <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
                                from €{t.priceFrom.toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-[color:var(--charcoal-soft)] leading-relaxed">
                              {t.line}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Step>
              )}

              {step === 10 && <SummaryView s={s} days={days} investment={investment} liveStory={liveStory} isMultiDay={isMultiDay} />}

              {/* Nav */}
              {step < 10 && (
                <div className="mt-14 flex justify-between items-center">
                  <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 text-sm text-[color:var(--charcoal)] disabled:opacity-30 hover:text-[color:var(--teal)] transition-colors"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    onClick={() => canNext && setStep(step + 1)}
                    disabled={!canNext}
                    className="inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm uppercase tracking-[0.1em] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {step === 9 ? "Reveal my story" : "Continue"}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: live preview */}
            <aside className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-[160px] space-y-6">
                <LiveStory lines={liveStory} name={s.name} />
                <DynamicMap region={s.region} highlights={s.highlights} days={days} isMultiDay={isMultiDay} />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

/* ---------- Subcomponents ---------- */

function Step({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{eyebrow}</span>
      <h2 className="serif text-3xl md:text-4xl mt-3 leading-tight text-[color:var(--charcoal)]">{title}</h2>
      <p className="mt-3 text-[color:var(--charcoal-soft)] max-w-lg">{sub}</p>
      <div className="mt-10">{children}</div>
    </div>
  );
}

interface CardOpt {
  id: string;
  name?: string;
  label?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  line?: string;
}

function Cards({ options, selected, onSelect, multi = false }: { options: CardOpt[]; selected: string[]; onSelect: (id: string) => void; multi?: boolean }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {options.slice(0, 5).map((o) => {
        const active = selected.includes(o.id);
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            onClick={() => onSelect(o.id)}
            className={`text-left p-6 border transition-all relative ${
              active
                ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5"
                : "border-[color:var(--border)] hover:border-[color:var(--gold)] bg-[color:var(--card)]"
            }`}
          >
            {Icon && (
              <Icon size={26} className={active ? "text-[color:var(--teal)]" : "text-[color:var(--gold)]"} />
            )}
            <h3 className="serif text-lg mt-4 text-[color:var(--charcoal)]">{o.name ?? o.label}</h3>
            {o.line && (
              <p className="mt-2 text-xs text-[color:var(--charcoal-soft)] leading-relaxed">{o.line}</p>
            )}
            {active && (
              <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[color:var(--teal)] flex items-center justify-center">
                <Check size={11} className="text-[color:var(--ivory)]" strokeWidth={3} />
              </span>
            )}
            {multi && !active && (
              <span className="absolute top-3 right-3 h-5 w-5 rounded-full border border-[color:var(--charcoal)]/20" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function PillCards({ options, selected, onSelect, multi = false }: { options: { id: string; label: string; sub?: string }[]; selected: string[]; onSelect: (id: string) => void; multi?: boolean }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {options.slice(0, 5).map((o) => {
        const active = selected.includes(o.id);
        return (
          <button
            key={o.id}
            onClick={() => onSelect(o.id)}
            className={`p-6 border text-left transition-all relative ${
              active
                ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5"
                : "border-[color:var(--border)] hover:border-[color:var(--gold)] bg-[color:var(--card)]"
            }`}
          >
            <h3 className="serif text-xl text-[color:var(--charcoal)]">{o.label}</h3>
            {o.sub && (
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
                {o.sub}
              </p>
            )}
            {active && (
              <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[color:var(--teal)] flex items-center justify-center">
                <Check size={11} className="text-[color:var(--ivory)]" strokeWidth={3} />
              </span>
            )}
            {multi && !active && (
              <span className="absolute top-3 right-3 h-5 w-5 rounded-full border border-[color:var(--charcoal)]/20" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function LiveStory({ lines, name }: { lines: string[]; name: string }) {
  return (
    <div className="bg-[color:var(--card)] border border-[color:var(--border)] p-7">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Your Story · Live
        </span>
        <Sparkles size={13} className="text-[color:var(--gold)]" />
      </div>
      {name && (
        <p className="serif italic text-2xl text-[color:var(--teal)] mb-4 leading-tight">"{name}"</p>
      )}
      {lines.length === 0 ? (
        <p className="text-sm text-[color:var(--charcoal-soft)] leading-relaxed italic">
          Your story will begin to write itself as you choose…
        </p>
      ) : (
        <div className="space-y-3">
          {lines.map((l, i) => (
            <p
              key={i}
              className="serif italic text-[15px] leading-relaxed text-[color:var(--charcoal)] animate-in fade-in slide-in-from-bottom-1 duration-500"
            >
              {l}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function DynamicMap({ region, highlights, days, isMultiDay }: { region: string | null; highlights: string[]; days: number; isMultiDay: boolean }) {
  const center = region ? regionMap[region] : null;
  // Generate stops: start from region center, fan out based on highlight count
  const stops = useMemo(() => {
    if (!center) return [];
    const count = Math.max(1, Math.min(highlights.length || 1, isMultiDay ? days * 2 : 3));
    const radius = 14;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 1.6 - 0.8;
      return {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
        day: isMultiDay ? Math.floor(i / 2) + 1 : 1,
      };
    });
  }, [center, highlights.length, days, isMultiDay]);

  const dayColors = ["var(--teal)", "var(--teal-2)", "var(--gold)", "var(--charcoal-soft)"];

  return (
    <div className="bg-[color:var(--card)] border border-[color:var(--border)] p-7">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Live Map
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
          {region ? regionOpts.find((r) => r.id === region)?.name : "Select a region"}
        </span>
      </div>
      <div className="relative aspect-[4/5] bg-[color:var(--sand)] overflow-hidden">
        <svg viewBox="0 0 100 130" className="w-full h-full" preserveAspectRatio="none">
          {/* Stylized Portugal silhouette */}
          <path
            d="M 25 8 Q 18 14, 22 28 Q 14 38, 20 50 Q 16 62, 22 72 Q 18 84, 26 96 Q 32 108, 40 116 Q 48 122, 54 118 Q 60 110, 56 100 Q 62 92, 58 82 Q 64 70, 60 58 Q 66 46, 60 34 Q 64 22, 56 14 Q 46 6, 35 5 Z"
            fill="var(--ivory)"
            stroke="var(--gold)"
            strokeWidth="0.4"
            opacity="0.9"
          />

          {/* Route path connecting stops */}
          {stops.length > 1 && (
            <path
              d={stops.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
              fill="none"
              stroke="var(--teal)"
              strokeWidth="0.7"
              strokeDasharray="1.5 1.5"
              opacity="0.6"
            />
          )}

          {/* Center pin */}
          {center && (
            <g>
              <circle cx={center.x} cy={center.y} r="2.4" fill="var(--teal)" />
              <circle cx={center.x} cy={center.y} r="4.5" fill="none" stroke="var(--teal)" strokeWidth="0.4" opacity="0.4" />
            </g>
          )}

          {/* Stops */}
          {stops.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="1.6"
                fill={dayColors[(p.day - 1) % dayColors.length]}
                stroke="var(--ivory)"
                strokeWidth="0.4"
              />
            </g>
          ))}
        </svg>

        {!region && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--charcoal-soft)]">
              Choose a region to begin
            </p>
          </div>
        )}
      </div>

      {/* Day legend */}
      {isMultiDay && stops.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {Array.from({ length: days }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: `var(--${i === 0 ? "teal" : i === 1 ? "teal-2" : i === 2 ? "gold" : "charcoal-soft"})` }}
              />
              Day {i + 1}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Summary view ---------- */

function SummaryView({ s, days, investment, liveStory, isMultiDay }: { s: BuilderState; days: number; investment: number | null; liveStory: string[]; isMultiDay: boolean }) {
  const tier = tierOpts.find((t) => t.id === s.tier);
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Your Portugal Story</span>
      <h2 className="serif text-4xl md:text-5xl mt-3 leading-tight text-[color:var(--charcoal)]">
        {s.name || "Your bespoke experience"}
      </h2>
      <p className="mt-3 text-[color:var(--charcoal-soft)]">
        Here is the foundation of your private journey. Send it to our team for the full proposal.
      </p>

      {/* Emotional story */}
      <div className="mt-10 bg-[color:var(--sand)] p-8 md:p-10 border-l-2 border-[color:var(--gold)]">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--teal)] mb-4">The Story</p>
        <div className="space-y-4">
          {liveStory.length > 0 ? (
            liveStory.map((l, i) => (
              <p key={i} className="serif italic text-xl leading-relaxed text-[color:var(--charcoal)]">
                {l}
              </p>
            ))
          ) : (
            <p className="serif italic text-xl text-[color:var(--charcoal-soft)]">
              Your story is still finding its shape — return to add more details.
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--teal)] mb-5">Timeline preview</p>
        <div className="space-y-3">
          {Array.from({ length: Math.max(1, days) }).map((_, di) => (
            <div key={di} className="border-l-2 border-[color:var(--gold)] pl-5">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)] mb-2">
                Day {di + 1}
              </div>
              <ul className="space-y-2">
                {[
                  { t: "Morning", l: s.highlights.includes("market") ? "A local market at dawn" : "Slow start, then on the road to your first stop" },
                  { t: "Midday", l: s.styles.includes("gastronomy") ? "Long lunch at a local table" : "A signature private experience" },
                  { t: "Afternoon", l: s.styles.includes("wine") ? "Family winery & cellar tasting" : s.styles.includes("coastal") ? "A hidden coastal road, ending at the sea" : "An insider stop" },
                  { t: "Evening", l: s.highlights.includes("viewpoint") ? "Sunset at a secret viewpoint" : "Quiet return — a glass somewhere beautiful" },
                ].map((m) => (
                  <li key={m.t} className="flex gap-4 text-sm">
                    <span className="text-[color:var(--charcoal-soft)] uppercase tracking-[0.2em] text-[10px] w-20 pt-1">{m.t}</span>
                    <span className="text-[color:var(--charcoal)] flex-1">{m.l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Investment */}
      <div className="mt-10 bg-[color:var(--teal)] text-[color:var(--ivory)] p-8 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold-soft)]">
              Experience Investment · Estimate
            </p>
            <p className="serif text-4xl md:text-5xl mt-3">
              {investment ? `from €${investment.toLocaleString()}` : "Choose a tier to estimate"}
            </p>
            <p className="mt-2 text-sm text-[color:var(--ivory)]/75">
              {tier ? `${tier.name} tier · ${days || 1} day${days > 1 ? "s" : ""} · fully private` : "Tier not selected"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold-soft)]">All inclusive</p>
            <p className="text-sm text-[color:var(--ivory)]/85 mt-2">
              Private guide · transport · access · curation
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-8 py-4 text-sm uppercase tracking-[0.1em] transition-all"
        >
          Send to our designers
          <ArrowRight size={15} />
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 border border-[color:var(--charcoal)]/30 hover:border-[color:var(--charcoal)] text-[color:var(--charcoal)] px-8 py-4 text-sm uppercase tracking-[0.1em] transition-all"
        >
          Start over
        </button>
      </div>

      <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[color:var(--charcoal-soft)] flex items-center gap-2">
        <Sparkles size={12} className="text-[color:var(--gold)]" />
        {isMultiDay ? "Multi-day private journey" : "Private day experience"} · scalable from 1 guest to large private groups
      </p>
    </div>
  );
}
