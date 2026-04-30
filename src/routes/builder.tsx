import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  MapPin,
  Wine,
  UtensilsCrossed,
  Mountain,
  Landmark,
  Waves,
  Heart,
  Users,
  MessageCircle,
  Sparkles,
  Clock,
  Zap,
  Leaf,
  Coins,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import expWine from "@/assets/exp-wine.jpg";
import expGastro from "@/assets/exp-gastronomy.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expCoastal from "@/assets/exp-coastal.jpg";
import expStreet from "@/assets/exp-street.jpg";
import expRomantic from "@/assets/exp-romantic.jpg";

/* ────────────────────────────────────────────────────────────────
   Builder v3 — Experience Studio
   A focused, mobile-first builder with a live editorial preview.

   Five axes (the user keeps it light, the preview keeps it alive):
   1. Region        — anchors map / image / driving times
   2. Duration      — half day → week
   3. Pace          — slow / balanced / packed
   4. Style         — wine, gastronomy, nature, heritage, coastal, romantic
   5. Group + tier  — guests bucket × budget tier (drives estimate)

   The right-hand <PreviewCard/> reacts in real time:
     • headline rewrites itself ("A slow wine day in Alentejo")
     • cover image switches to the dominant style/region
     • highlights list re-orders by selected style
     • estimate range updates by duration × tier × guests
     • "Reserve instantly" CTA appears once the build is viable
   ──────────────────────────────────────────────────────────────── */

const builderSearchSchema = z.object({
  r: fallback(z.string().optional(), undefined),
  d: fallback(z.string().optional(), undefined),
  p: fallback(z.string().optional(), undefined),
  s: fallback(z.string().optional(), undefined),
  g: fallback(z.string().optional(), undefined),
  t: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/builder")({
  validateSearch: zodValidator(builderSearchSchema),
  head: () => ({
    meta: [
      { title: "Experience Studio — Build your Portugal day | YES" },
      {
        name: "description",
        content:
          "Pick a region, a duration, a pace and a style. Watch your day take shape in real time, with honest timing and a local designer one message away.",
      },
      { property: "og:title", content: "Experience Studio — YES" },
      {
        property: "og:description",
        content:
          "Five choices. One real day in Portugal. Live preview with honest timing and local guidance while you build.",
      },
    ],
  }),
  component: BuilderPage,
});

/* ─── Options ─────────────────────────────────────────────────── */

type Region = "lisbon" | "porto" | "alentejo" | "algarve";
type Duration = "halfday" | "fullday" | "twoday" | "week";
type Pace = "slow" | "balanced" | "packed";
type Style = "wine" | "gastro" | "nature" | "heritage" | "coastal" | "romantic";
type Guests = "1-2" | "3-6" | "7-15";
type Tier = "essential" | "signature" | "private";

const regions: { id: Region; name: string; tagline: string }[] = [
  { id: "lisbon", name: "Lisbon & Coast", tagline: "Tile, light, salt air" },
  { id: "porto", name: "Porto & Douro", tagline: "Granite, port, river" },
  { id: "alentejo", name: "Alentejo", tagline: "Wide plains, slow time" },
  { id: "algarve", name: "Algarve", tagline: "Cliffs, coves, sunsets" },
];

const durations: { id: Duration; name: string; sub: string; hours: number }[] = [
  { id: "halfday", name: "Half day", sub: "≈ 4 h", hours: 4 },
  { id: "fullday", name: "Full day", sub: "≈ 8–10 h", hours: 9 },
  { id: "twoday", name: "Two days", sub: "Long weekend", hours: 18 },
  { id: "week", name: "Five — seven days", sub: "Full story", hours: 45 },
];

const paces: { id: Pace; name: string; sub: string; icon: typeof Leaf }[] = [
  { id: "slow", name: "Slow", sub: "2 stops, breath room", icon: Leaf },
  { id: "balanced", name: "Balanced", sub: "3–4 stops, steady", icon: Clock },
  { id: "packed", name: "Packed", sub: "5+ stops, full plate", icon: Zap },
];

const styles: {
  id: Style;
  name: string;
  icon: typeof Wine;
  cover: string;
  highlight: string;
}[] = [
  { id: "wine", name: "Wine", icon: Wine, cover: expWine, highlight: "Cellar tasting with the winemaker" },
  { id: "gastro", name: "Gastronomy", icon: UtensilsCrossed, cover: expGastro, highlight: "Market walk + tasting menu" },
  { id: "nature", name: "Nature", icon: Mountain, cover: expNature, highlight: "Quiet trail, real viewpoint" },
  { id: "heritage", name: "Heritage", icon: Landmark, cover: expStreet, highlight: "Walk through living history" },
  { id: "coastal", name: "Coastal", icon: Waves, cover: expCoastal, highlight: "Boat hour at Arrábida coves" },
  { id: "romantic", name: "Romantic", icon: Heart, cover: expRomantic, highlight: "Sunset table, no rush" },
];

const guestsOpts: { id: Guests; name: string; sub: string }[] = [
  { id: "1-2", name: "1–2", sub: "Intimate" },
  { id: "3-6", name: "3–6", sub: "Small group" },
  { id: "7-15", name: "7–15", sub: "Private group" },
];

const tiers: { id: Tier; name: string; sub: string; mult: number }[] = [
  { id: "essential", name: "Essential", sub: "Local pace, real value", mult: 1 },
  { id: "signature", name: "Signature", sub: "Curated, designed", mult: 1.55 },
  { id: "private", name: "Private", sub: "Bespoke, unhurried", mult: 2.4 },
];

/* base price per person per hour, EUR — rough, conservative bracket */
const BASE_PER_HOUR = 22;

/* ─── Page ────────────────────────────────────────────────────── */

function BuilderPage() {
  const search = Route.useSearch();
  const [region, setRegion] = useState<Region | undefined>(search.r as Region | undefined);
  const [duration, setDuration] = useState<Duration | undefined>(search.d as Duration | undefined);
  const [pace, setPace] = useState<Pace | undefined>(search.p as Pace | undefined);
  const [style, setStyle] = useState<Style | undefined>(search.s as Style | undefined);
  const [guests, setGuests] = useState<Guests | undefined>(search.g as Guests | undefined);
  const [tier, setTier] = useState<Tier | undefined>(search.t as Tier | undefined);

  const completion = useMemo(() => {
    const total = 6;
    let done = 0;
    if (region) done++;
    if (duration) done++;
    if (pace) done++;
    if (style) done++;
    if (guests) done++;
    if (tier) done++;
    return { done, total, pct: Math.round((done / total) * 100) };
  }, [region, duration, pace, style, guests, tier]);

  const ready = completion.done >= 5;

  return (
    <SiteLayout>
      <article className="bg-[color:var(--ivory)] text-[color:var(--charcoal)]">
        {/* HERO STRIP — sets the tone */}
        <header className="border-b border-[color:var(--border)] bg-[color:var(--sand)]">
          <div className="container-x py-10 md:py-16">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--gold)]">
                <Sparkles size={12} aria-hidden="true" />
                Experience studio
              </span>
              <h1 className="serif mt-4 text-[2.4rem] md:text-[3.8rem] leading-[1.02] tracking-[-0.02em] font-semibold text-[color:var(--charcoal)]">
                Five choices. <span className="italic">One real day</span> in Portugal.
              </h1>
              <p className="mt-5 max-w-xl text-[15.5px] md:text-[17px] leading-[1.65] text-[color:var(--charcoal)]">
                Pick a region, a duration, a pace, a style. Your day takes shape on the right —
                with honest timing, a fair estimate and a local designer one message away.
              </p>
              <div
                className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-semibold text-[color:var(--charcoal)]"
                aria-live="polite"
              >
                <span aria-hidden="true" className="relative h-[3px] w-32 overflow-hidden bg-[color:var(--charcoal)]/10 rounded-full">
                  <span
                    className="absolute inset-y-0 left-0 bg-[color:var(--gold)] transition-[width] duration-300 ease-out"
                    style={{ width: `${completion.pct}%` }}
                  />
                </span>
                {completion.done}/{completion.total} chosen
              </div>
            </div>
          </div>
        </header>

        {/* MAIN — form (left) + live preview (right, sticky on desktop) */}
        <div className="container-x py-10 md:py-16">
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-12 max-w-7xl mx-auto">
            {/* ── FORM COLUMN ────────────────────────────────────── */}
            <form
              className="lg:col-span-7 flex flex-col gap-12 md:gap-14"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Design your experience"
            >
              <Step
                num={1}
                eyebrow="Where"
                title="Choose a region"
                sub="Each region anchors the rhythm, light and what's on the table."
              >
                <div className="grid grid-cols-2 gap-3">
                  {regions.map((r) => (
                    <Pill
                      key={r.id}
                      selected={region === r.id}
                      onClick={() => setRegion(r.id)}
                      title={r.name}
                      sub={r.tagline}
                      icon={MapPin}
                    />
                  ))}
                </div>
              </Step>

              <Step
                num={2}
                eyebrow="How long"
                title="Choose a duration"
                sub="We'll size stops, pace and driving honestly."
              >
                <div className="grid grid-cols-2 gap-3">
                  {durations.map((d) => (
                    <Pill
                      key={d.id}
                      selected={duration === d.id}
                      onClick={() => setDuration(d.id)}
                      title={d.name}
                      sub={d.sub}
                      icon={Clock}
                    />
                  ))}
                </div>
              </Step>

              <Step
                num={3}
                eyebrow="Pace"
                title="How does the day breathe"
                sub="Slow leaves room. Packed earns more — but you'll feel it."
              >
                <div className="grid grid-cols-3 gap-3">
                  {paces.map((p) => (
                    <Pill
                      key={p.id}
                      selected={pace === p.id}
                      onClick={() => setPace(p.id)}
                      title={p.name}
                      sub={p.sub}
                      icon={p.icon}
                      compact
                    />
                  ))}
                </div>
              </Step>

              <Step
                num={4}
                eyebrow="Style"
                title="Pick your thread"
                sub="One thread keeps the day coherent. We'll braid micro-details around it."
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {styles.map((s) => (
                    <StyleTile
                      key={s.id}
                      selected={style === s.id}
                      onClick={() => setStyle(s.id)}
                      name={s.name}
                      cover={s.cover}
                      Icon={s.icon}
                    />
                  ))}
                </div>
              </Step>

              <Step
                num={5}
                eyebrow="Who"
                title="Group size"
                sub="Bigger groups change pacing, vehicles and venue access."
              >
                <div className="grid grid-cols-3 gap-3">
                  {guestsOpts.map((g) => (
                    <Pill
                      key={g.id}
                      selected={guests === g.id}
                      onClick={() => setGuests(g.id)}
                      title={g.name}
                      sub={g.sub}
                      icon={Users}
                      compact
                    />
                  ))}
                </div>
              </Step>

              <Step
                num={6}
                eyebrow="Feel"
                title="How private"
                sub="Same craft on every tier. The difference is breathing room."
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tiers.map((t) => (
                    <Pill
                      key={t.id}
                      selected={tier === t.id}
                      onClick={() => setTier(t.id)}
                      title={t.name}
                      sub={t.sub}
                      icon={Coins}
                    />
                  ))}
                </div>
              </Step>
            </form>

            {/* ── LIVE PREVIEW COLUMN ────────────────────────────── */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <PreviewCard
                  region={region}
                  duration={duration}
                  pace={pace}
                  style={style}
                  guests={guests}
                  tier={tier}
                  ready={ready}
                />
              </div>
            </aside>
          </div>
        </div>
      </article>
    </SiteLayout>
  );
}

/* ─── Step shell ──────────────────────────────────────────────── */

function Step({
  num,
  eyebrow,
  title,
  sub,
  children,
}: {
  num: number;
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="reveal">
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
      <h2 className="serif mt-2 text-[1.6rem] md:text-[2rem] leading-[1.1] tracking-[-0.01em] font-semibold text-[color:var(--charcoal)]">
        {title}
      </h2>
      <p className="mt-2 text-[14px] md:text-[15px] leading-[1.6] text-[color:var(--charcoal)]/80 max-w-md">
        {sub}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/* ─── Pill option ─────────────────────────────────────────────── */

function Pill({
  selected,
  onClick,
  title,
  sub,
  icon: Icon,
  compact = false,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  sub?: string;
  icon: typeof MapPin;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "group relative flex flex-col items-start text-left rounded-[2px] border min-h-[64px] px-4 transition-all duration-200",
        compact ? "py-3" : "py-3.5",
        selected
          ? "border-[color:var(--charcoal)] bg-[color:var(--charcoal)] text-[color:var(--ivory)] shadow-[0_8px_18px_-12px_rgba(46,46,46,0.45)]"
          : "border-[color:var(--border)] bg-[color:var(--ivory)] text-[color:var(--charcoal)] hover:border-[color:var(--charcoal)] hover:-translate-y-[2px]",
      ].join(" ")}
    >
      <span className="flex items-center gap-2">
        <Icon
          size={14}
          aria-hidden="true"
          className={selected ? "text-[color:var(--gold)]" : "text-[color:var(--charcoal)]/60"}
        />
        <span className="text-[14.5px] md:text-[15px] font-semibold leading-tight">{title}</span>
      </span>
      {sub && (
        <span
          className={[
            "mt-1 text-[11.5px] uppercase tracking-[0.16em]",
            selected ? "text-[color:var(--ivory)]/70" : "text-[color:var(--charcoal)]/55",
          ].join(" ")}
        >
          {sub}
        </span>
      )}
      {selected && (
        <Check
          size={14}
          aria-hidden="true"
          className="absolute top-3 right-3 text-[color:var(--gold)]"
        />
      )}
    </button>
  );
}

/* ─── Style tile (image-led) ──────────────────────────────────── */

function StyleTile({
  selected,
  onClick,
  name,
  cover,
  Icon,
}: {
  selected: boolean;
  onClick: () => void;
  name: string;
  cover: string;
  Icon: typeof Wine;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "group relative aspect-[4/5] overflow-hidden rounded-[2px] text-left transition-all duration-300",
        selected
          ? "ring-2 ring-[color:var(--gold)] ring-offset-2 ring-offset-[color:var(--ivory)]"
          : "ring-1 ring-[color:var(--border)] hover:-translate-y-[2px]",
      ].join(" ")}
    >
      <img
        src={cover}
        alt=""
        loading="lazy"
        className={[
          "absolute inset-0 h-full w-full object-cover transition-transform duration-500",
          selected ? "scale-[1.04]" : "group-hover:scale-[1.03]",
        ].join(" ")}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"
      />
      <span className="absolute left-3 right-3 bottom-3 flex items-center gap-2 text-[color:var(--ivory)]">
        <Icon size={14} aria-hidden="true" className="text-[color:var(--gold)]" />
        <span className="serif text-[15px] md:text-[16px] leading-tight font-semibold">
          {name}
        </span>
      </span>
      {selected && (
        <span
          aria-hidden="true"
          className="absolute top-3 right-3 inline-flex items-center justify-center h-6 w-6 rounded-full bg-[color:var(--gold)] text-[color:var(--charcoal)]"
        >
          <Check size={12} />
        </span>
      )}
    </button>
  );
}

/* ─── Live preview card ───────────────────────────────────────── */

function PreviewCard({
  region,
  duration,
  pace,
  style,
  guests,
  tier,
  ready,
}: {
  region?: Region;
  duration?: Duration;
  pace?: Pace;
  style?: Style;
  guests?: Guests;
  tier?: Tier;
  ready: boolean;
}) {
  const styleObj = styles.find((s) => s.id === style);
  const regionObj = regions.find((r) => r.id === region);
  const durationObj = durations.find((d) => d.id === duration);
  const paceObj = paces.find((p) => p.id === pace);
  const tierObj = tiers.find((t) => t.id === tier);
  const guestsObj = guestsOpts.find((g) => g.id === guests);

  // Headline composes itself from chosen pieces
  const headline = useMemo(() => {
    const adj = paceObj?.id === "slow" ? "slow" : paceObj?.id === "packed" ? "rich" : "well-paced";
    const noun = styleObj?.name.toLowerCase() ?? "Portugal";
    const place = regionObj?.name ?? "Portugal";
    if (!style && !region) return "Your day in Portugal, taking shape";
    return `A ${adj} ${noun} day in ${place}`;
  }, [paceObj, styleObj, regionObj, style, region]);

  // Estimate range — conservative bracket
  const estimate = useMemo(() => {
    if (!durationObj || !tierObj) return null;
    const guestCount = guestsObj?.id === "1-2" ? 2 : guestsObj?.id === "3-6" ? 5 : guestsObj?.id === "7-15" ? 11 : 2;
    const base = BASE_PER_HOUR * durationObj.hours * tierObj.mult;
    const total = base * guestCount;
    const low = Math.round(total * 0.85 / 10) * 10;
    const high = Math.round(total * 1.2 / 10) * 10;
    return { low, high, perPerson: Math.round(base) };
  }, [durationObj, tierObj, guestsObj]);

  // Highlights — the chosen style takes the lead, then complementary moments
  const highlights = useMemo(() => {
    const list: string[] = [];
    if (styleObj) list.push(styleObj.highlight);
    if (regionObj?.id === "alentejo") list.push("Olive grove lunch, 1 hour, no rush");
    else if (regionObj?.id === "porto") list.push("Douro viewpoint, golden hour");
    else if (regionObj?.id === "algarve") list.push("Quiet cove between cliffs");
    else if (regionObj?.id === "lisbon") list.push("Tile-and-tram detour, real neighborhood");
    if (paceObj?.id === "slow") list.push("Two stops only — time to actually be there");
    else if (paceObj?.id === "packed") list.push("Five stops, planned to flow without rushing");
    return list.slice(0, 3);
  }, [styleObj, regionObj, paceObj]);

  const cover = styleObj?.cover ?? expWine;

  return (
    <div className="group/preview relative overflow-hidden rounded-[2px] border border-[color:var(--border)] bg-[color:var(--ivory)] shadow-[0_18px_40px_-22px_rgba(46,46,46,0.32)]">
      {/* Cover */}
      <div className="relative aspect-[4/5] sm:aspect-[5/6] overflow-hidden">
        <img
          key={cover}
          src={cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out animate-[fade-in_400ms_ease-out]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />
        {/* Live badge */}
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--ivory)]/95 backdrop-blur-sm text-[10px] uppercase tracking-[0.24em] font-bold text-[color:var(--gold)]">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[color:var(--gold)] opacity-60" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" />
          </span>
          Live preview
        </span>
        {/* Headline overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <h3 className="serif text-[1.35rem] md:text-[1.55rem] leading-[1.15] tracking-[-0.01em] font-semibold text-[color:var(--ivory)] [text-wrap:balance]">
            {headline}.
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 md:p-6 flex flex-col gap-5">
        {/* Chosen pieces — chips */}
        <div className="flex flex-wrap gap-1.5">
          <Chip label={regionObj?.name ?? "Region"} on={!!region} />
          <Chip label={durationObj?.name ?? "Duration"} on={!!duration} />
          <Chip label={paceObj?.name ?? "Pace"} on={!!pace} />
          <Chip label={styleObj?.name ?? "Style"} on={!!style} />
          <Chip label={guestsObj?.name ?? "Guests"} on={!!guests} />
          <Chip label={tierObj?.name ?? "Tier"} on={!!tier} />
        </div>

        {/* Highlights */}
        {highlights.length > 0 ? (
          <ul className="space-y-2 text-[14px] leading-[1.55] text-[color:var(--charcoal)]">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5">
                <span aria-hidden="true" className="mt-[7px] inline-block h-1 w-3 bg-[color:var(--gold)] flex-none" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] leading-[1.55] text-[color:var(--charcoal)]/60 italic">
            Pick a region and a style to see real moments here.
          </p>
        )}

        {/* Estimate */}
        <div className="border-t border-[color:var(--border)] pt-4">
          {estimate ? (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[color:var(--charcoal)]/60">
                  Estimate
                </span>
                <span className="serif text-[1.4rem] md:text-[1.6rem] leading-none font-semibold text-[color:var(--charcoal)] tabular-nums">
                  €{estimate.low.toLocaleString()}–€{estimate.high.toLocaleString()}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] text-[color:var(--charcoal)]/65">
                Group total · refined with your designer · no fees added
              </p>
            </>
          ) : (
            <p className="text-[12.5px] uppercase tracking-[0.18em] text-[color:var(--charcoal)]/50">
              Estimate appears with duration + tier
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={!ready}
            className={[
              "group inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] text-[12.5px] uppercase tracking-[0.2em] font-bold transition-all duration-200",
              ready
                ? "bg-[color:var(--teal)] text-[color:var(--ivory)] hover:bg-[color:var(--teal-2)] shadow-[0_10px_24px_-12px_rgba(41,91,97,0.7)] hover:-translate-y-[2px]"
                : "bg-[color:var(--charcoal)]/10 text-[color:var(--charcoal)]/40 cursor-not-allowed",
            ].join(" ")}
          >
            {ready ? "Reserve instantly" : "Keep choosing"}
            {ready && (
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
            )}
          </button>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] text-[12px] uppercase tracking-[0.2em] font-semibold text-[color:var(--charcoal)] border-b border-[color:var(--charcoal)]/30 hover:border-[color:var(--charcoal)] pb-1 self-start"
          >
            <MessageCircle size={13} aria-hidden="true" />
            Talk to a designer first
          </Link>
        </div>

        <p className="text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--gold)] font-semibold flex items-center gap-2">
          <Sparkles size={11} aria-hidden="true" />
          Reviewed by a local before confirmation
        </p>
      </div>
    </div>
  );
}

function Chip({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold rounded-full border transition-colors duration-200",
        on
          ? "border-[color:var(--charcoal)] bg-[color:var(--charcoal)] text-[color:var(--ivory)]"
          : "border-[color:var(--border)] text-[color:var(--charcoal)]/45",
      ].join(" ")}
    >
      {label}
    </span>
  );
}
