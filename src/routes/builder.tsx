import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
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
  Pencil,
  MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Experience Studio — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Shape a private Portugal journey in real time — see route, stops, duration and price update instantly. Confirm whenever you're ready.",
      },
      { property: "og:title", content: "The Experience Studio" },
      {
        property: "og:description",
        content:
          "A live experience builder. Real-time route, stops and price. Instant confirmation. A local guide one tap away.",
      },
    ],
  }),
  component: BuilderPage,
});

/* ============================================================
   Data — kept from the previous builder; lightly extended
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

const styleOpts = [
  { id: "wine", name: "Wine & Vineyards", icon: Wine },
  { id: "gastronomy", name: "Gastronomy", icon: UtensilsCrossed },
  { id: "nature", name: "Nature & Outdoors", icon: Mountain },
  { id: "heritage", name: "Heritage & Culture", icon: Landmark },
  { id: "coastal", name: "Coastal & Sea", icon: Waves },
];

/* Highlights are real ingredients of YES experiences tours — used as
   "Signature moments" chips. Each one maps to an actual on-tour activity. */
const highlightOpts = [
  { id: "livramento", name: "Livramento Market tasting", short: "Livramento" },
  { id: "boat", name: "Arrábida boat tour", short: "Boat tour" },
  { id: "jeep", name: "4×4 Jeep off-the-beaten-path", short: "4×4 Jeep" },
  { id: "tiles", name: "Hand-painted tiles workshop", short: "Tiles workshop" },
  { id: "cheese", name: "Azeitão cheese workshop", short: "Cheese workshop" },
  { id: "tasting", name: "Private winery tasting", short: "Wine tasting" },
  { id: "portinho", name: "Lunch at Portinho da Arrábida", short: "Portinho lunch" },
  { id: "sesimbra", name: "Sesimbra fishing village", short: "Sesimbra" },
  { id: "viewpoint", name: "Arrábida secret viewpoint", short: "Viewpoint" },
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

/* Region map points use the same coordinate system as the SVG silhouette
   below (viewBox 0 0 100 130). Keep these in sync if the silhouette changes. */
const regionMap: Record<string, { x: number; y: number; name: string }> = {
  lisbon: { x: 28, y: 78, name: "Lisbon & Coast" },
  porto: { x: 34, y: 26, name: "Porto & Douro" },
  alentejo: { x: 48, y: 88, name: "Alentejo" },
  algarve: { x: 46, y: 110, name: "Algarve" },
};
const regionOpts = [
  { id: "lisbon", name: "Lisbon & Coast" },
  { id: "porto", name: "Porto & Douro" },
  { id: "alentejo", name: "Alentejo" },
  { id: "algarve", name: "Algarve" },
];

/* Curated nearby stops per region — gives the live route real character
   instead of evenly-spaced dots around the centre. Coordinates again
   live in the silhouette's viewBox. */
const regionStops: Record<string, { x: number; y: number; label: string; tag: string }[]> = {
  // From Lisbon — the real YES experiences playground: south of the Tagus
  // through Azeitão, Setúbal, Arrábida and Sesimbra, plus Sintra & Cascais.
  lisbon: [
    { x: 28, y: 76, label: "Cristo Rei", tag: "Viewpoint" },
    { x: 30, y: 80, label: "Azeitão", tag: "Cheese & wine" },
    { x: 33, y: 82, label: "Setúbal · Livramento", tag: "Market" },
    { x: 36, y: 82, label: "Arrábida Natural Park", tag: "Nature" },
    { x: 35, y: 84, label: "Portinho da Arrábida", tag: "Coast" },
    { x: 32, y: 86, label: "Sesimbra", tag: "Fishing village" },
    { x: 29, y: 86, label: "Cabo Espichel", tag: "Dinosaur prints" },
    { x: 22, y: 76, label: "Sintra", tag: "Heritage" },
    { x: 20, y: 78, label: "Cascais", tag: "Coast" },
  ],
  porto: [
    { x: 38, y: 22, label: "Porto", tag: "City" },
    { x: 46, y: 24, label: "Douro Valley", tag: "Wine" },
    { x: 52, y: 28, label: "Pinhão", tag: "River" },
    { x: 36, y: 18, label: "Braga", tag: "Heritage" },
    { x: 40, y: 20, label: "Guimarães", tag: "Heritage" },
  ],
  alentejo: [
    { x: 42, y: 96, label: "Comporta", tag: "Coast" },
    { x: 54, y: 84, label: "Évora", tag: "Heritage" },
    { x: 56, y: 82, label: "Alentejo wineries", tag: "Wine" },
    { x: 60, y: 92, label: "Monsaraz", tag: "Quiet" },
    { x: 50, y: 70, label: "Tomar", tag: "Templar" },
    { x: 46, y: 64, label: "Coimbra", tag: "University" },
    { x: 38, y: 60, label: "Fátima", tag: "Sanctuary" },
    { x: 32, y: 58, label: "Nazaré", tag: "Coast" },
    { x: 28, y: 64, label: "Óbidos", tag: "Ginjinha" },
  ],
  algarve: [
    { x: 38, y: 112, label: "Lagos", tag: "Coast" },
    { x: 40, y: 114, label: "Benagil Caves", tag: "Boat ride" },
    { x: 36, y: 116, label: "Vicentine Coast", tag: "Wild coast" },
    { x: 42, y: 108, label: "Monchique", tag: "Mountain" },
    { x: 50, y: 116, label: "Ria Formosa", tag: "Nature" },
    { x: 54, y: 110, label: "Tavira", tag: "Quiet" },
  ],
};

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

/* Suggested entry points — modeled on the actual YES experiences best-sellers
   so the builder pre-fills duration, styles, pace and tier in a way that
   matches each tour's real timing and the type of client it suits. */
const seeds: { id: string; kind: string; label: string; sub: string; patch: Partial<BuilderState> }[] = [
  // PLACES — broad regional intents
  { id: "arrabida", kind: "Place", label: "Arrábida & Sesimbra", sub: "Coast, boat, hidden coves · 8–9h",
    patch: { region: "lisbon", duration: "fullday", styles: ["coastal", "nature"],
      highlights: ["boat", "portinho", "sesimbra", "viewpoint"], pace: "balanced", tier: "signature" } },
  { id: "azeitao", kind: "Place", label: "Azeitão & Setúbal", sub: "Cheese, wine, Sesimbra · 8–9h",
    patch: { region: "lisbon", duration: "fullday", styles: ["wine", "gastronomy"],
      highlights: ["cheese", "tasting", "livramento", "sesimbra"], pace: "slow", tier: "signature" } },
  { id: "sintra", kind: "Place", label: "Sintra & Cascais", sub: "Hidden gems + tasting · 8–9h",
    patch: { region: "lisbon", duration: "fullday", styles: ["heritage", "coastal"],
      highlights: ["tasting", "viewpoint"], pace: "balanced", tier: "signature" } },
  { id: "douro", kind: "Place", label: "Douro Valley", sub: "Vineyards, river, slow · full day",
    patch: { region: "porto", duration: "fullday", styles: ["wine", "gastronomy"],
      highlights: ["tasting"], pace: "slow", tier: "signature" } },
  { id: "evora", kind: "Place", label: "Évora & Alentejo", sub: "History & wines · 9–11h",
    patch: { region: "alentejo", duration: "fullday", styles: ["heritage", "wine"],
      highlights: ["tasting"], pace: "balanced", tier: "signature" } },
  { id: "algarve", kind: "Place", label: "Algarve · Benagil", sub: "Caves & wild coast · 2 days",
    patch: { region: "algarve", duration: "twoday", styles: ["coastal", "nature"],
      highlights: ["boat", "viewpoint"], pace: "balanced", tier: "atelier" } },

  // MOMENTS — client-type led
  { id: "anniversary", kind: "Moment", label: "An anniversary", sub: "Couple · slow, intimate, viewpoint",
    patch: { region: "lisbon", groupType: "couple", guests: "1-2", duration: "fullday",
      styles: ["gastronomy", "wine"], highlights: ["tasting", "portinho", "viewpoint"],
      pace: "slow", tier: "atelier" } },
  { id: "celebration", kind: "Moment", label: "A celebration", sub: "Friends · long lunch + tastings",
    patch: { region: "lisbon", groupType: "friends", guests: "7-15", duration: "fullday",
      styles: ["gastronomy", "wine"], highlights: ["livramento", "tasting", "portinho"],
      pace: "balanced", tier: "atelier" } },
  { id: "family-jeep", kind: "Moment", label: "A family adventure", sub: "Family · 4×4, beach picnic · 7–8h",
    patch: { region: "lisbon", groupType: "family", guests: "3-6", duration: "fullday",
      styles: ["nature", "coastal"], highlights: ["jeep", "dinosaur", "viewpoint"],
      pace: "balanced", tier: "signature" } },

  // IDEAS — themed days
  { id: "wine-day", kind: "Idea", label: "A wine day", sub: "Cellars, market, long lunch · 8–9h",
    patch: { region: "lisbon", duration: "fullday", styles: ["wine", "gastronomy"],
      highlights: ["tasting", "livramento", "portinho"], pace: "balanced", tier: "signature" } },
  { id: "tiles-day", kind: "Idea", label: "Tiles & wine workshop", sub: "Hands-on · 7–8h",
    patch: { region: "lisbon", duration: "fullday", styles: ["heritage", "wine"],
      highlights: ["tiles", "tasting", "sesimbra"], pace: "slow", tier: "signature" } },
  { id: "off-beaten", kind: "Idea", label: "Off the beaten path", sub: "4×4 + dinosaur prints · 6–7h",
    patch: { region: "lisbon", duration: "fullday", styles: ["nature"],
      highlights: ["jeep", "dinosaur", "viewpoint"], pace: "balanced", tier: "signature" } },
  { id: "faith-route", kind: "Idea", label: "Fátima · Nazaré · Óbidos", sub: "With Ginjinha tasting · 8–9h",
    patch: { region: "alentejo", duration: "fullday", styles: ["heritage"],
      highlights: ["ginjinha", "viewpoint"], pace: "balanced", tier: "signature" } },
  { id: "weekend", kind: "Idea", label: "A weekend away", sub: "Three days, no rush",
    patch: { duration: "threeday", styles: ["nature", "gastronomy"], pace: "slow", tier: "atelier" } },
];

/* ============================================================
   Page
   ============================================================ */

function BuilderPage() {
  const [s, setS] = useState<BuilderState>(emptyState);
  const [mobileView, setMobileView] = useState<"build" | "map">("build");
  // Hovered/long-pressed highlight chip — drives a temporary route extension
  // and pin pulse on the map. Cleared on leave / release.
  const [previewHighlight, setPreviewHighlight] = useState<string | null>(null);

  // Has the user begun? Drives the intro/active split.
  const started =
    s.region !== null ||
    s.groupType !== null ||
    s.duration !== null ||
    s.styles.length > 0 ||
    s.highlights.length > 0 ||
    s.pace !== null ||
    s.tier !== null ||
    s.name.length > 0;

  const update = <K extends keyof BuilderState>(k: K, v: BuilderState[K]) =>
    setS((p) => ({ ...p, [k]: v }));
  const toggle = (k: "styles" | "highlights" | "enhancements", id: string) =>
    setS((p) => ({ ...p, [k]: p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id] }));
  const seed = (patch: Partial<BuilderState>) => setS((p) => ({ ...p, ...patch }));

  const days = durationOpts.find((d) => d.id === s.duration)?.days ?? 1;
  const isMultiDay = days >= 2;

  /* Live price — same formula, surfaced live the moment a tier exists. */
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

  // Minimum to confirm: a region + something more (style or pace).
  const canConfirm = !!s.region && (s.styles.length > 0 || !!s.pace);

  return (
    <SiteLayout>
      {/* Intro header — tone-setting, never goes away on desktop. */}
      <section className="pt-32 pb-8 bg-[color:var(--sand)]">
        <div className="container-x text-center">
          <span className="eyebrow">The Experience Studio</span>
          <h1 className="serif text-4xl md:text-6xl mt-5 leading-tight">
            Start <span className="italic text-[color:var(--teal)]">your way</span>
          </h1>
          <p className="mt-5 text-[color:var(--charcoal-soft)] max-w-xl mx-auto">
            Begin with a place, a moment or an idea — shape it in real time.
          </p>
          <p className="mt-3 text-[13px] text-[color:var(--charcoal-soft)] max-w-xl mx-auto italic">
            A local guide is available anytime if you want help.
          </p>
        </div>
      </section>

      {/* Mobile toggle — thumb-friendly, sticky just under the header. */}
      <div className="lg:hidden sticky top-[72px] z-30 bg-[color:var(--ivory)]/95 backdrop-blur border-b border-[color:var(--border)]">
        <div className="container-x py-3 flex justify-center">
          <div
            role="tablist"
            aria-label="Switch view"
            className="inline-flex p-1 bg-[color:var(--sand)] border border-[color:var(--border)] rounded-full"
          >
            <button
              role="tab"
              aria-selected={mobileView === "build"}
              onClick={() => setMobileView("build")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] transition-all ${
                mobileView === "build"
                  ? "bg-[color:var(--teal)] text-[color:var(--ivory)]"
                  : "text-[color:var(--charcoal-soft)]"
              }`}
            >
              <Pencil size={13} /> Build
            </button>
            <button
              role="tab"
              aria-selected={mobileView === "map"}
              onClick={() => setMobileView("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] transition-all ${
                mobileView === "map"
                  ? "bg-[color:var(--teal)] text-[color:var(--ivory)]"
                  : "text-[color:var(--charcoal-soft)]"
              }`}
            >
              <MapIcon size={13} /> Map
            </button>
          </div>
        </div>
      </div>

      <section className="py-8 md:py-14">
        <div className="container-x">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
            {/* LEFT — builder */}
            <div className={`lg:col-span-7 xl:col-span-7 ${mobileView === "build" ? "" : "hidden lg:block"}`}>
              {!started ? (
                <IntroSeeds onPick={seed} />
              ) : (
                <ActiveBuilder
                  s={s}
                  update={update}
                  toggle={toggle}
                  reset={() => setS(emptyState)}
                  previewHighlight={previewHighlight}
                  onPreviewHighlight={setPreviewHighlight}
                />
              )}
            </div>

            {/* RIGHT — live map + summary */}
            <aside className={`lg:col-span-5 xl:col-span-5 ${mobileView === "map" ? "" : "hidden lg:block"}`}>
              <div className="lg:sticky lg:top-[120px] space-y-5">
                <SwipeToClearPreview
                  active={!!previewHighlight}
                  onClear={() => setPreviewHighlight(null)}
                >
                  <PremiumMap region={s.region} highlights={s.highlights} days={days} isMultiDay={isMultiDay} previewHighlight={previewHighlight} />
                </SwipeToClearPreview>
                <LiveSummary
                  s={s}
                  days={days}
                  investment={investment}
                  canConfirm={canConfirm}
                />
                <ChatNudge />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Mobile sticky confirm — always reachable with one thumb. */}
      {canConfirm && (
        <div
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--ivory)]/95 backdrop-blur px-4 py-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">Ready to confirm anytime</p>
              <p className="text-sm text-[color:var(--charcoal)] truncate">
                {investment ? `from €${investment.toLocaleString()}` : "Choose a tier to see price"}
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[color:var(--teal)] text-[color:var(--ivory)] px-5 py-3 text-[11px] uppercase tracking-[0.18em] whitespace-nowrap"
            >
              Confirm <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

/* ============================================================
   Intro — "Start your way"
   ============================================================ */

function IntroSeeds({ onPick }: { onPick: (patch: Partial<BuilderState>) => void }) {
  const groups = ["Place", "Moment", "Idea"] as const;
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
        Pick anything to begin
      </span>
      <h2 className="serif text-3xl md:text-4xl mt-3 leading-tight text-[color:var(--charcoal)]">
        What feels right today?
      </h2>
      <p className="mt-3 text-[color:var(--charcoal-soft)] max-w-lg">
        Tap a place, a moment or an idea — your journey appears instantly on the map. Adjust everything as you go.
      </p>

      <div className="mt-8 space-y-6">
        {groups.map((g) => (
          <div key={g}>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 bg-[color:var(--sand)] border border-[color:var(--border)] rounded-full text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
              <span className="h-1 w-1 rounded-full bg-[color:var(--gold)]" />
              {g}
            </span>
            <div className="flex flex-wrap gap-2">
              {seeds.filter((x) => x.kind === g).map((seed) => (
                <button
                  key={seed.id}
                  onClick={() => onPick(seed.patch)}
                  className="group inline-flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] text-left transition-all active:scale-[0.97] hover:border-[color:var(--teal)] hover:bg-[color:var(--teal)]/5 hover:-translate-y-0.5"
                >
                  <span className="serif text-[15px] leading-tight text-[color:var(--charcoal)] group-hover:text-[color:var(--teal)] transition-colors">
                    {seed.label}
                  </span>
                  <span className="text-[11px] leading-tight text-[color:var(--charcoal-soft)]">
                    {seed.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-[12px] text-[color:var(--charcoal-soft)] italic">
        Or start from a blank canvas — open the blocks below and shape your journey from scratch.
      </p>
      <button
        onClick={() => onPick({ region: "lisbon" })}
        className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[color:var(--teal)] hover:text-[color:var(--gold)] transition-colors"
      >
        Open the builder <ArrowRight size={13} />
      </button>
    </div>
  );
}

/* ============================================================
   Active builder — all blocks visible & editable, no steps
   ============================================================ */

function ActiveBuilder({
  s,
  update,
  toggle,
  reset,
  previewHighlight,
  onPreviewHighlight,
}: {
  s: BuilderState;
  update: <K extends keyof BuilderState>(k: K, v: BuilderState[K]) => void;
  toggle: (k: "styles" | "highlights" | "enhancements", id: string) => void;
  reset: () => void;
  previewHighlight: string | null;
  onPreviewHighlight: (id: string | null) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Shape your journey
        </span>
        <button
          onClick={reset}
          className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] hover:text-[color:var(--charcoal)] transition-colors"
        >
          Start over
        </button>
      </div>

      <Block title="Where in Portugal" hint="Tap to switch — the map flies there.">
        <Pills
          options={regionOpts.map((r) => ({ id: r.id, label: r.name }))}
          selected={s.region ? [s.region] : []}
          onSelect={(id) => update("region", id)}
        />
      </Block>

      <Block title="Who's traveling" hint="Sets the energy of the day.">
        <Pills
          options={groupTypes.map((g) => ({ id: g.id, label: g.name }))}
          selected={s.groupType ? [s.groupType] : []}
          onSelect={(id) => update("groupType", id)}
        />
      </Block>

      <Block title="How many of you" hint="Always entirely private.">
        <Pills
          options={guestSizes.map((g) => ({ id: g.id, label: g.label, sub: g.sub }))}
          selected={s.guests ? [s.guests] : []}
          onSelect={(id) => update("guests", id)}
        />
      </Block>

      <Block title="How long do you have">
        <Pills
          options={durationOpts.map((d) => ({ id: d.id, label: d.label, sub: d.sub }))}
          selected={s.duration ? [s.duration] : []}
          onSelect={(id) => update("duration", id)}
        />
      </Block>

      <Block title="What inspires you" hint="Pick one or several — add what feels right.">
        <IconCards
          options={styleOpts}
          selected={s.styles}
          onSelect={(id) => toggle("styles", id)}
        />
      </Block>

      <Block
        title="Signature moments"
        hint="Hover or hold to preview on the map."
      >
        <PreviewablePills
          options={highlightOpts.map((h) => ({ id: h.id, label: h.name }))}
          selected={s.highlights}
          onSelect={(id) => toggle("highlights", id)}
          previewId={previewHighlight}
          onPreview={onPreviewHighlight}
        />
      </Block>

      <Block title="Pace">
        <IconCards
          options={paceOpts}
          selected={s.pace ? [s.pace] : []}
          onSelect={(id) => update("pace", id)}
          subline
        />
      </Block>

      <Block title="A refined touch" hint="Optional — for moments worth elevating.">
        <IconCards
          options={enhancementOpts}
          selected={s.enhancements}
          onSelect={(id) => toggle("enhancements", id)}
        />
      </Block>

      <Block title="Level of refinement" hint="Each tier is fully private.">
        <div className="space-y-3">
          {tierOpts.map((t) => {
            const active = s.tier === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => update("tier", t.id)}
                className={`w-full text-left p-5 border transition-all flex gap-4 items-start ${
                  active
                    ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5"
                    : "border-[color:var(--border)] hover:border-[color:var(--gold)]"
                }`}
              >
                <Icon size={22} className={active ? "text-[color:var(--teal)]" : "text-[color:var(--gold)]"} />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="serif text-xl text-[color:var(--charcoal)]">{t.name}</h3>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
                      from €{t.priceFrom.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-[color:var(--charcoal-soft)] leading-relaxed">{t.line}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Block>

      <Block title="Name your story" hint="Optional — helps us remember it.">
        <input
          type="text"
          value={s.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="The Anniversary Trip · A Quiet Douro Weekend"
          className="w-full bg-transparent border-b border-[color:var(--charcoal)]/25 focus:border-[color:var(--teal)] outline-none py-3 serif text-xl placeholder:text-[color:var(--charcoal-soft)]/60 transition-colors"
        />
      </Block>

      <p className="pt-2 text-[12px] text-[color:var(--charcoal-soft)] italic leading-relaxed">
        Make it yours — every change updates the map and price instantly. Confirm whenever you're ready.
      </p>
    </div>
  );
}

/* ---------- Reusable building blocks ---------- */

function Block({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[color:var(--border)] pt-6">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h3 className="serif text-lg md:text-xl text-[color:var(--charcoal)]">{title}</h3>
        {hint && (
          <p className="text-[11px] text-[color:var(--charcoal-soft)] italic hidden sm:block">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Pills({
  options,
  selected,
  onSelect,
  multi = false,
}: {
  options: { id: string; label: string; sub?: string }[];
  selected: string[];
  onSelect: (id: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o.id);
        return (
          <button
            key={o.id}
            onClick={() => onSelect(o.id)}
            className={`group inline-flex items-center gap-2 px-4 py-2.5 border text-sm transition-all ${
              active
                ? "border-[color:var(--teal)] bg-[color:var(--teal)] text-[color:var(--ivory)]"
                : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--charcoal)] hover:border-[color:var(--gold)]"
            }`}
            aria-pressed={active}
          >
            {active && <Check size={13} strokeWidth={3} />}
            <span>{o.label}</span>
            {o.sub && (
              <span
                className={`text-[10px] uppercase tracking-[0.18em] ${
                  active ? "text-[color:var(--ivory)]/75" : "text-[color:var(--charcoal-soft)]"
                }`}
              >
                · {o.sub}
              </span>
            )}
          </button>
        );
      })}
      {multi && selected.length > 0 && (
        <span className="self-center text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] ml-1">
          {selected.length} chosen
        </span>
      )}
    </div>
  );
}

/** Wraps the live map and clears the active preview when the user
 *  swipes horizontally on touch. Mouse/pen interactions are ignored
 *  so desktop hover preview behavior is unchanged. */
function SwipeToClearPreview({
  active,
  onClear,
  children,
}: {
  active: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_MIN_X = 48;
  const SWIPE_MAX_Y = 40;

  return (
    <div
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        start.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        if (e.pointerType === "mouse" || !start.current) return;
        const dx = e.clientX - start.current.x;
        const dy = Math.abs(e.clientY - start.current.y);
        start.current = null;
        if (active && Math.abs(dx) >= SWIPE_MIN_X && dy <= SWIPE_MAX_Y) {
          onClear();
        }
      }}
      onPointerCancel={() => { start.current = null; }}
      className="touch-pan-y"
    >
      {children}
    </div>
  );
}

/** Pill list with hover/long-press preview.
 *  - Desktop: pointerenter / pointerleave preview.
 *  - Touch: holding for 300 ms previews without selecting; lift cancels.
 *  - Tap (short) selects/toggles as normal. */
function PreviewablePills({
  options,
  selected,
  onSelect,
  previewId,
  onPreview,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onSelect: (id: string) => void;
  previewId: string | null;
  onPreview: (id: string | null) => void;
}) {
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const startLongPress = (id: string) => {
    longPressed.current = false;
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      onPreview(id);
    }, 300);
  };
  const cancelLongPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o.id);
        const previewing = previewId === o.id;
        return (
          <button
            key={o.id}
            // Pointer events cover mouse + touch + pen.
            onPointerEnter={(e) => { if (e.pointerType === "mouse") onPreview(o.id); }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") onPreview(null);
              cancelLongPress();
            }}
            onPointerDown={(e) => { if (e.pointerType !== "mouse") startLongPress(o.id); }}
            onPointerUp={() => {
              cancelLongPress();
              onPreview(null);
            }}
            onPointerCancel={() => { cancelLongPress(); onPreview(null); }}
            onFocus={(e) => {
              // Only treat as keyboard focus, not focus from a pointer click.
              if (e.currentTarget.matches(":focus-visible")) onPreview(o.id);
            }}
            onBlur={() => { if (previewing) onPreview(null); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                // Preserve native click selection: prevent the synthesized click
                // (which would also fire onSelect) and call onSelect once here.
                e.preventDefault();
                onSelect(o.id);
              } else if (e.key === "Escape" && previewing) {
                onPreview(null);
                e.currentTarget.blur();
              }
            }}
            onClick={() => {
              // Suppress click if we long-pressed (would feel like a misfire).
              if (longPressed.current) { longPressed.current = false; return; }
              onSelect(o.id);
            }}
            className={`group relative inline-flex items-center gap-2 px-4 py-2.5 border text-sm transition-all touch-manipulation select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] ${
              active
                ? "border-[color:var(--teal)] bg-[color:var(--teal)] text-[color:var(--ivory)]"
                : previewing
                  ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--charcoal)] -translate-y-0.5 shadow-[0_10px_24px_-14px_rgba(201,169,106,0.6)]"
                  : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--charcoal)] hover:border-[color:var(--gold)]"
            }`}
            aria-pressed={active}
          >
            {active && <Check size={13} strokeWidth={3} />}
            <span>{o.label}</span>
            {previewing && !active && (
              <span className="ml-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold)]">
                preview
              </span>
            )}
          </button>
        );
      })}
      {selected.length > 0 && (
        <span className="self-center text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] ml-1">
          {selected.length} chosen
        </span>
      )}
    </div>
  );
}

function IconCards({
  options,
  selected,
  onSelect,
  subline = false,
}: {
  options: {
    id: string;
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    line?: string;
  }[];
  selected: string[];
  onSelect: (id: string) => void;
  subline?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((o) => {
        const active = selected.includes(o.id);
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            onClick={() => onSelect(o.id)}
            className={`relative text-left p-4 border transition-all ${
              active
                ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5"
                : "border-[color:var(--border)] hover:border-[color:var(--gold)] bg-[color:var(--card)]"
            }`}
            aria-pressed={active}
          >
            <Icon size={20} className={active ? "text-[color:var(--teal)]" : "text-[color:var(--gold)]"} />
            <p className="mt-2 text-sm text-[color:var(--charcoal)] leading-tight">{o.name}</p>
            {subline && o.line && (
              <p className="mt-1 text-[11px] text-[color:var(--charcoal-soft)] leading-snug">{o.line}</p>
            )}
            {active && (
              <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[color:var(--teal)] flex items-center justify-center">
                <Check size={9} className="text-[color:var(--ivory)]" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   Premium map — animated, brand-styled, smoothly zooms to region
   ============================================================ */

const FULL_VIEW: ViewBox = { x: 0, y: 0, w: 100, h: 130 };

interface ViewBox { x: number; y: number; w: number; h: number }

function regionViewBox(region: string | null): ViewBox {
  if (!region) return FULL_VIEW;
  const c = regionMap[region];
  // Zoom: 60×80 window centered on region (≈40% area), clamped to silhouette.
  const w = 60, h = 78;
  let x = c.x - w / 2;
  let y = c.y - h / 2;
  x = Math.max(-5, Math.min(x, FULL_VIEW.w - w + 5));
  y = Math.max(-5, Math.min(y, FULL_VIEW.h - h + 5));
  return { x, y, w, h };
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Smoothly tween the SVG viewBox attribute over `duration` ms.
 *  CSS `transition` does NOT animate SVG presentation attributes like
 *  viewBox, so we drive it manually with requestAnimationFrame. */
function useAnimatedViewBox(target: ViewBox, duration = 750): string {
  const [vb, setVb] = useState<ViewBox>(target);
  const fromRef = useRef<ViewBox>(target);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip if no change
    const cur = fromRef.current;
    if (cur.x === target.x && cur.y === target.y && cur.w === target.w && cur.h === target.h) return;

    const from = { ...vb };
    fromRef.current = target;
    startRef.current = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      const e = easeInOutCubic(t);
      setVb({
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e,
        h: from.h + (target.h - from.h) * e,
      });
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.x, target.y, target.w, target.h, duration]);

  return `${vb.x.toFixed(3)} ${vb.y.toFixed(3)} ${vb.w.toFixed(3)} ${vb.h.toFixed(3)}`;
}

/** Animated route stroke that re-draws on every change.
 *  Measures the actual path length with getTotalLength() so the dash
 *  always matches — no clipping, no gap at the end. */
function AnimatedRoute({ d, duration = 850 }: { d: string; duration?: number }) {
  const ref = useRef<SVGPathElement | null>(null);
  const [length, setLength] = useState(0);
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!ref.current || !d) return;
    // Measure the new path
    const len = ref.current.getTotalLength();
    setLength(len);
    setOffset(len);

    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = easeInOutCubic(t);
      setOffset(len * (1 - e));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [d, duration]);

  if (!d) return null;
  return (
    <g>
      {/* Soft glow underlay — full stroke, doesn't animate the dash */}
      <path d={d} fill="none" stroke="var(--teal)" strokeWidth="1.4" opacity="0.18" />
      {/* Main stroke — animates from length → 0 */}
      <path
        ref={ref}
        d={d}
        fill="none"
        stroke="var(--teal)"
        strokeWidth="0.55"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length || 1}
        strokeDashoffset={offset}
      />
    </g>
  );
}

function PremiumMap({
  region,
  highlights,
  days,
  isMultiDay,
  previewHighlight,
}: {
  region: string | null;
  highlights: string[];
  days: number;
  isMultiDay: boolean;
  previewHighlight?: string | null;
}) {
  // Curated stops for the chosen region, scaled by day count.
  const stops = useMemo(() => {
    if (!region) return [];
    const base = regionStops[region] ?? [];
    const desired = Math.max(2, Math.min(isMultiDay ? days * 2 : Math.max(2, highlights.length || 2), base.length));
    return base.slice(0, desired).map((p, i) => ({ ...p, day: isMultiDay ? Math.floor(i / 2) + 1 : 1 }));
  }, [region, highlights.length, days, isMultiDay]);

  // Ghost stop driven by hover/long-press preview. Uses the next available
  // curated point for the region — only shown if not already a real stop.
  const ghostStop = useMemo(() => {
    if (!region || !previewHighlight) return null;
    if (highlights.includes(previewHighlight)) return null;
    const base = regionStops[region] ?? [];
    const next = base[stops.length] ?? base[base.length - 1];
    if (!next) return null;
    return { ...next, day: isMultiDay ? Math.floor(stops.length / 2) + 1 : 1 };
  }, [region, previewHighlight, highlights, stops.length, isMultiDay]);

  const center = region ? regionMap[region] : null;
  const allPoints = center
    ? [center, ...stops, ...(ghostStop ? [ghostStop] : [])]
    : [];

  const pathD = useMemo(() => {
    if (allPoints.length < 2) return "";
    return allPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");
  }, [allPoints]);

  // Smoothly tween the viewBox whenever the region changes.
  const targetVb = useMemo(() => regionViewBox(region), [region]);
  const animatedViewBox = useAnimatedViewBox(targetVb, 750);

  const dayColor = (d: number) =>
    d === 1 ? "var(--teal)" : d === 2 ? "var(--teal-2)" : d === 3 ? "var(--gold)" : "var(--charcoal-soft)";

  return (
    <div className="bg-[color:var(--card)] border border-[color:var(--border)] overflow-hidden">
      <div className="flex items-baseline justify-between px-5 pt-5">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)] inline-flex items-center gap-2">
          <MapIcon size={12} /> Live Map
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
          {region ? regionMap[region].name : "Pick a region to begin"}
        </span>
      </div>

      <div className="relative aspect-[4/5] mt-3 mx-5 mb-5 bg-gradient-to-b from-[color:var(--sand)] to-[color:var(--ivory)] overflow-hidden">
        <svg
          viewBox={animatedViewBox}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Journey map"
        >
          <defs>
            <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ivory)" />
              <stop offset="100%" stopColor="var(--sand)" />
            </linearGradient>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
            </radialGradient>
            <filter id="markerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0.3" stdDeviation="0.4" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Sea wash — subtle parallel lines for texture */}
          <g opacity="0.18" stroke="var(--teal)" strokeWidth="0.15">
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={i} x1="0" y1={8 + i * 9} x2="100" y2={8 + i * 9} />
            ))}
          </g>

          {/* Refined Portugal silhouette — denser coastline, more detail */}
          <path
            d="M 28 4 Q 24 8 25 14 Q 22 18 24 22 Q 20 26 23 30 Q 19 34 22 38 Q 18 42 21 46 Q 17 50 20 54 Q 16 58 19 62 Q 17 66 20 70 Q 18 74 22 78 Q 19 82 23 86 Q 21 90 25 94 Q 23 98 28 102 Q 30 106 35 110 Q 38 114 44 116 Q 50 118 56 116 Q 60 114 60 110 L 62 108 Q 64 104 60 100 Q 62 96 60 92 Q 64 88 60 84 Q 62 80 60 76 Q 64 72 62 68 Q 64 62 60 56 Q 62 50 60 44 Q 64 38 60 32 Q 62 26 58 20 Q 60 14 54 10 Q 48 5 40 4 Q 34 3 28 4 Z"
            fill="url(#land)"
            stroke="var(--gold)"
            strokeWidth="0.35"
            opacity="0.95"
          />

          {/* Region glow */}
          {center && (
            <circle cx={center.x} cy={center.y} r="14" fill="url(#centerGlow)"
              style={{ transition: "cx 600ms cubic-bezier(0.65,0,0.35,1), cy 600ms cubic-bezier(0.65,0,0.35,1)" }}
            />
          )}

          {/* Animated route — re-draws on every change */}
          <AnimatedRoute d={pathD} />

          {/* Centre marker (region) */}
          {center && (
            <g style={{ transition: "all 600ms cubic-bezier(0.65,0,0.35,1)" }}>
              <circle cx={center.x} cy={center.y} r="2.6" fill="var(--gold)" stroke="var(--ivory)" strokeWidth="0.5" filter="url(#markerShadow)" />
              <circle cx={center.x} cy={center.y} r="2.6" fill="none" stroke="var(--gold)" strokeWidth="0.4" opacity="0.5">
                <animate attributeName="r" values="2.6;5.5;2.6" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.6s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Stops — branded teardrop markers + labels */}
          {stops.map((p, i) => {
            const c = dayColor(p.day);
            return (
              <g key={`${p.label}-${i}`} style={{ transition: "all 500ms cubic-bezier(0.65,0,0.35,1)" }}>
                {/* Teardrop pin */}
                <path
                  d={`M ${p.x} ${p.y - 3.2} C ${p.x + 2} ${p.y - 3.2} ${p.x + 2} ${p.y - 0.4} ${p.x} ${p.y + 1.2} C ${p.x - 2} ${p.y - 0.4} ${p.x - 2} ${p.y - 3.2} ${p.x} ${p.y - 3.2} Z`}
                  fill={c}
                  stroke="var(--ivory)"
                  strokeWidth="0.35"
                  filter="url(#markerShadow)"
                  style={{
                    transformOrigin: `${p.x}px ${p.y}px`,
                    animation: `ys-pop 400ms cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms backwards`,
                  }}
                />
                <circle cx={p.x} cy={p.y - 1.8} r="0.55" fill="var(--ivory)" />
                {/* Label */}
                <g
                  style={{ animation: `ys-fade 500ms ease-out ${i * 80 + 200}ms backwards` }}
                >
                  <rect
                    x={p.x + 2.2}
                    y={p.y - 3.4}
                    width={p.label.length * 1.35 + 2}
                    height="3"
                    rx="0.5"
                    fill="var(--ivory)"
                    stroke={c}
                    strokeWidth="0.18"
                    opacity="0.95"
                  />
                  <text
                    x={p.x + 3.2}
                    y={p.y - 1.3}
                    fontSize="2"
                    fill="var(--charcoal)"
                    fontFamily="ui-sans-serif, system-ui"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    {p.label}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Ghost stop — appears while a moment chip is hovered/long-pressed.
              Animates in with a pulsing halo so users see exactly where the
              route would extend. */}
          {ghostStop && (
            <g style={{ animation: "ys-pop 320ms cubic-bezier(0.34,1.56,0.64,1) backwards" }}>
              {/* Pulsing halo on the upcoming stop */}
              <circle cx={ghostStop.x} cy={ghostStop.y - 1.4} r="3" fill="var(--gold)" opacity="0.18">
                <animate attributeName="r" values="3;5;3" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.32;0;0.32" dur="1.4s" repeatCount="indefinite" />
              </circle>
              {/* Outline-only teardrop — visually marked as preview */}
              <path
                d={`M ${ghostStop.x} ${ghostStop.y - 3.2} C ${ghostStop.x + 2} ${ghostStop.y - 3.2} ${ghostStop.x + 2} ${ghostStop.y - 0.4} ${ghostStop.x} ${ghostStop.y + 1.2} C ${ghostStop.x - 2} ${ghostStop.y - 0.4} ${ghostStop.x - 2} ${ghostStop.y - 3.2} ${ghostStop.x} ${ghostStop.y - 3.2} Z`}
                fill="var(--ivory)"
                stroke="var(--gold)"
                strokeWidth="0.45"
                strokeDasharray="0.8 0.6"
                filter="url(#markerShadow)"
              />
              <circle cx={ghostStop.x} cy={ghostStop.y - 1.8} r="0.55" fill="var(--gold)" />
              {/* Preview label */}
              <g style={{ animation: "ys-fade 280ms ease-out 120ms backwards" }}>
                <rect
                  x={ghostStop.x + 2.2}
                  y={ghostStop.y - 3.4}
                  width={ghostStop.label.length * 1.35 + 4.5}
                  height="3"
                  rx="0.5"
                  fill="var(--gold)"
                  opacity="0.95"
                />
                <text
                  x={ghostStop.x + 3.2}
                  y={ghostStop.y - 1.3}
                  fontSize="2"
                  fill="var(--charcoal-deep)"
                  fontFamily="ui-sans-serif, system-ui"
                  style={{ letterSpacing: "0.05em" }}
                >
                  {ghostStop.label} ·
                </text>
                <text
                  x={ghostStop.x + 3.2 + ghostStop.label.length * 1.35 + 0.4}
                  y={ghostStop.y - 1.3}
                  fontSize="1.4"
                  fill="var(--ivory)"
                  fontFamily="ui-sans-serif, system-ui"
                  style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
                >
                  preview
                </text>
              </g>
            </g>
          )}
        </svg>

        {!region && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)] bg-[color:var(--ivory)]/80 px-3 py-1.5">
              Choose a region — the map flies there
            </p>
          </div>
        )}

        {/* Local CSS animations — scoped via unique keyframe names */}
        <style>{`
          @keyframes ys-draw { to { stroke-dashoffset: 0; } }
          @keyframes ys-pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes ys-fade { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>

      {/* Day legend */}
      {isMultiDay && stops.length > 0 && (
        <div className="px-5 pb-5 -mt-2 flex flex-wrap gap-3">
          {Array.from({ length: days }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
              <span className="h-2 w-2 rounded-full" style={{ background: dayColor(i + 1) }} />
              Day {i + 1}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Live summary panel
   ============================================================ */

function LiveSummary({
  s,
  days,
  investment,
  canConfirm,
}: {
  s: BuilderState;
  days: number;
  investment: number | null;
  canConfirm: boolean;
}) {
  const region = s.region ? regionMap[s.region].name : null;
  const stops = s.region ? (regionStops[s.region] ?? []).slice(0, Math.max(2, s.highlights.length || 2)) : [];
  const dur = durationOpts.find((d) => d.id === s.duration);
  const tier = tierOpts.find((t) => t.id === s.tier);
  const [pulse, setPulse] = useState(false);

  // Tiny price pulse whenever the investment changes — instant feedback.
  useEffect(() => {
    if (investment === null) return;
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 450);
    return () => window.clearTimeout(t);
  }, [investment]);

  return (
    <div className="bg-[color:var(--card)] border border-[color:var(--border)] p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Your journey</span>
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-[color:var(--teal)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--teal)] animate-pulse" />
          Updating live
        </span>
      </div>

      {s.name && (
        <p className="serif italic text-xl text-[color:var(--teal)] mt-3 leading-tight">"{s.name}"</p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <SummaryRow label="Route" value={region ?? "—"} />
        <SummaryRow label="Stops" value={stops.length ? `${stops.length} curated` : "—"} />
        <SummaryRow label="Duration" value={dur ? dur.label : "—"} />
        <SummaryRow label="Pace" value={s.pace ? (paceOpts.find((p) => p.id === s.pace)?.name ?? "—") : "—"} />
        <SummaryRow label="Group" value={s.guests ? guestSizes.find((g) => g.id === s.guests)?.label + " guests" : "—"} />
        <SummaryRow label="Tier" value={tier?.name ?? "—"} />
      </dl>

      {stops.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {stops.map((p) => (
            <span key={p.label} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-[color:var(--sand)] border border-[color:var(--border)] text-[color:var(--charcoal)]">
              <MapPin size={10} className="text-[color:var(--teal)]" />
              {p.label}
            </span>
          ))}
        </div>
      )}

      {/* Price */}
      <div className="mt-5 pt-4 border-t border-[color:var(--border)] flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">Investment</p>
          <p
            className={`serif text-3xl text-[color:var(--charcoal)] mt-1 transition-transform duration-300 ${pulse ? "scale-[1.04]" : "scale-100"}`}
          >
            {investment ? `from €${investment.toLocaleString()}` : "—"}
          </p>
          <p className="text-[11px] text-[color:var(--charcoal-soft)] mt-1">
            {tier ? `${tier.name} · ${days || 1} day${days > 1 ? "s" : ""} · fully private` : "Choose a tier to estimate"}
          </p>
        </div>
      </div>

      {/* Confirm */}
      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)] mb-2">
          {canConfirm ? "Ready to confirm anytime" : "Add a region to begin"}
        </p>
        <Link
          to="/contact"
          aria-disabled={!canConfirm}
          tabIndex={canConfirm ? 0 : -1}
          onClick={(e) => { if (!canConfirm) e.preventDefault(); }}
          className={`group w-full inline-flex items-center justify-between gap-2 px-5 py-4 text-[12px] uppercase tracking-[0.18em] border transition-all ${
            canConfirm
              ? "bg-[color:var(--teal)] text-[color:var(--ivory)] border-[color:var(--gold)]/70 hover:bg-[color:var(--teal-2)] hover:border-[color:var(--gold)] hover:shadow-[0_18px_38px_-14px_rgba(201,169,106,0.55)]"
              : "bg-[color:var(--sand)] text-[color:var(--charcoal-soft)] border-[color:var(--border)] cursor-not-allowed"
          }`}
        >
          <span>{canConfirm ? "Your journey is ready · Confirm instantly" : "Choose a region first"}</span>
          {canConfirm && <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />}
        </Link>
        <p className="mt-3 text-[11px] text-[color:var(--charcoal-soft)] italic leading-relaxed">
          Instant confirmation. No waiting. No back-and-forth emails.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">{label}</dt>
      <dd className="text-[color:var(--charcoal)] mt-0.5 truncate">{value}</dd>
    </div>
  );
}

/* ============================================================
   Inline chat nudge — sits next to the summary, complements the FAB
   ============================================================ */

function ChatNudge() {
  return (
    <div className="border border-dashed border-[color:var(--gold)]/50 bg-[color:var(--ivory)] p-4 flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--teal)] text-[color:var(--ivory)]">
        <MessageCircle size={14} />
      </span>
      <div className="flex-1">
        <p className="text-sm text-[color:var(--charcoal)] leading-snug">
          Need help? <span className="text-[color:var(--teal)]">Chat with a local guide in real time.</span>
        </p>
        <p className="text-[11px] text-[color:var(--charcoal-soft)] mt-0.5">Opens instantly — no forms, no wait.</p>
      </div>
    </div>
  );
}
