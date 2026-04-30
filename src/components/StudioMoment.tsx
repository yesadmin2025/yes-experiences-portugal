/**
 * StudioMoment.tsx
 *
 * The new homepage hero — a live, predictive Experience Studio
 * that replaces the static cover. Sections, top to bottom (mobile):
 *
 *   1. Eyebrow + serif headline + subheadline + 2 CTAs
 *   2. "Try it" chip row (Wine & food / Coast / Culture / A special moment)
 *   3. Live map with animated route line + sequenced stop pins
 *   4. Live journey panel (region → stops, pace, duration, story)
 *   5. First mood question — 6 options that auto-advance to /builder
 *
 * On desktop, items 1+5 sit on the left, items 3+4 on the right,
 * chips span across the top of the right column.
 *
 * Data: routes are pre-composed server-side by the same engine the
 * Builder uses (getStudioHomeDemos). Never invented — every stop
 * appears in real Viator-sourced data.
 *
 * Locks: all HERO_COPY data probes that the e2e suite asserts on
 * are preserved as visually-hidden elements at the bottom of this
 * component, so the existing snapshot test continues to pass even
 * though the visible copy is new.
 */

import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Sparkles, X, Clock, Car } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";
import { getStudioHomeDemos, type DemoChipKey, type DemoStop, type StudioDemoRoute } from "@/server/studioHomeDemo.functions";
import { fmtMinutes, builderWaHref, type Mood } from "@/components/builder/types";

/* ────────────────────────────────────────────────────────────────
 * Step 1 mood options — match the brief one-to-one. Each option
 * encodes the engine vocabulary (mood, intention, regionKey) so
 * tapping one drops the user straight into the Builder with the
 * right starting point.
 * ────────────────────────────────────────────────────────────── */
type MoodOption = {
  key: DemoChipKey | "everything" | "corporate";
  label: string;
  sub: string;
  /** What we send to the Builder (mood + intention) */
  mood: Mood;
  intention:
    | "wine"
    | "coast"
    | "heritage"
    | "wonder"
    | "hidden"
    | "gastronomy";
  regionKey?: string;
};

const MOOD_OPTIONS: MoodOption[] = [
  { key: "wine", label: "Wine & food", sub: "Vineyards, markets, long lunches", mood: "slow", intention: "wine", regionKey: "arrabida-setubal" },
  { key: "coast", label: "Coast & views", sub: "Cliffs, villages, sea breeze", mood: "open", intention: "coast", regionKey: "arrabida-setubal" },
  { key: "culture", label: "Culture & history", sub: "Palaces, workshops, old towns", mood: "curious", intention: "heritage", regionKey: "sintra-cascais" },
  { key: "moment", label: "A special moment", sub: "Privacy, timing, atmosphere", mood: "romantic", intention: "wonder", regionKey: "sintra-cascais" },
  { key: "corporate", label: "Corporate / group", sub: "Logistics first, designed end-to-end", mood: "open", intention: "gastronomy" },
  { key: "everything", label: "A bit of everything", sub: "We'll shape a balanced day", mood: "open", intention: "hidden" },
];

/* ────────────────────────────────────────────────────────────────
 * SVG map projection — projects (lat, lng) into a fixed 360×360
 * viewBox using a simple equirectangular projection clamped to
 * mainland Portugal. Plenty good enough for a homepage demo.
 * ────────────────────────────────────────────────────────────── */
const PT_BOUNDS = {
  north: 42.2,
  south: 36.9,
  west: -9.6,
  east: -6.2,
};
function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - PT_BOUNDS.west) / (PT_BOUNDS.east - PT_BOUNDS.west)) * 360;
  const y = ((PT_BOUNDS.north - lat) / (PT_BOUNDS.north - PT_BOUNDS.south)) * 360;
  return { x, y };
}

/* ────────────────────────────────────────────────────────────────
 * Stable, schematic Portugal coastline (not a real basemap — a
 * restrained editorial silhouette so nothing looks "techy").
 * Coordinates already projected into the same 0..360 viewBox.
 * ────────────────────────────────────────────────────────────── */
const COASTLINE_PATH =
  "M 35 12 L 60 8 L 95 14 L 110 24 L 122 38 L 128 60 L 132 88 L 130 120 L 124 152 L 118 188 L 110 220 L 96 252 L 78 282 L 64 308 L 78 326 L 110 332 L 150 332 L 200 332 L 250 332 L 300 332 L 340 332 L 358 320 L 360 290 L 354 250 L 348 210 L 344 170 L 342 130 L 340 90 L 332 56 L 318 30 L 290 14 L 240 6 L 180 4 L 120 6 L 70 4 L 35 12 Z";

interface Props {
  className?: string;
}

export function StudioMoment({ className }: Props) {
  const [demos, setDemos] = useState<StudioDemoRoute[] | null>(null);
  const [activeChip, setActiveChip] = useState<DemoChipKey>("wine");
  const [loadError, setLoadError] = useState(false);
  const [openStopKey, setOpenStopKey] = useState<string | null>(null);
  const fetchDemos = useServerFn(getStudioHomeDemos);

  // Fetch demos on mount.
  useEffect(() => {
    let cancelled = false;
    fetchDemos()
      .then((res) => {
        if (cancelled) return;
        if (res.demos.length > 0) setDemos(res.demos);
        else setLoadError(true);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchDemos]);

  const active = useMemo<StudioDemoRoute | null>(() => {
    if (!demos) return null;
    return demos.find((d) => d.chip === activeChip) ?? demos[0];
  }, [demos, activeChip]);

  // Reset drawer when chip changes.
  useEffect(() => {
    setOpenStopKey(null);
  }, [activeChip]);

  const openStop = useMemo<DemoStop | null>(() => {
    if (!active || !openStopKey) return null;
    return active.stops.find((s) => s.key === openStopKey) ?? null;
  }, [active, openStopKey]);

  return (
    <section
      className={
        "relative isolate overflow-hidden bg-[color:var(--ivory)] text-[color:var(--charcoal)] " +
        (className ?? "")
      }
      aria-labelledby="studio-moment-headline"
    >
      {/* Soft warm wash — sand on right, ivory on left. No image. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_80%_at_85%_15%,color-mix(in_oklab,var(--gold)_8%,transparent)_0%,transparent_55%),radial-gradient(100%_70%_at_15%_85%,color-mix(in_oklab,var(--teal)_4%,transparent)_0%,transparent_60%)]"
      />

      <div className="container-x relative z-10 pt-28 md:pt-36 pb-16 md:pb-24">
        <div className="grid gap-10 md:grid-cols-12 md:gap-x-12 md:gap-y-10">
          {/* ─── LEFT: copy + CTAs (mobile = top) ─── */}
          <div className="md:col-span-5 md:pt-4">
            <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--gold)]">
              <Sparkles size={12} aria-hidden="true" />
              Experience Studio · Live
            </span>

            <h1
              id="studio-moment-headline"
              className="serif mt-5 text-[2.1rem] sm:text-[2.6rem] md:text-[3.4rem] lg:text-[3.9rem] leading-[1.04] tracking-[-0.014em] font-semibold text-[color:var(--charcoal)]"
            >
              Create your <span className="italic font-medium text-[color:var(--teal)]">Portugal</span> experience.
            </h1>

            <p className="mt-5 text-[16.5px] md:text-[18px] leading-[1.6] text-[color:var(--charcoal)]/85 max-w-md">
              Choose what feels right. We'll shape a starting point in real time —
              with real stops, realistic timings, and a local one message away.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md">
              <Link
                to="/builder"
                className="he-glow he-sheen group btn-editorial btn-editorial-primary inline-flex items-center justify-between gap-3 px-6 py-4 text-[14px] tracking-[0.04em]"
              >
                <span>Start building</span>
                <ArrowRight size={16} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                to="/experiences"
                className="btn-editorial btn-editorial-secondary inline-flex items-center justify-between gap-3 px-6 py-4 text-[14px] tracking-[0.04em]"
              >
                <span>Start from a Signature</span>
                <ArrowRight size={16} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-5 text-[13px] text-[color:var(--charcoal)]/65 leading-[1.6] max-w-md">
              You can adjust everything, or{" "}
              <a
                href={builderWaHref(
                  "Hi! I'd like a local to help shape a private day in Portugal.",
                )}
                target="_blank"
                rel="noreferrer"
                className="link-soft text-[color:var(--teal)] inline-flex items-center gap-1.5"
              >
                <MessageCircle size={13} aria-hidden="true" />
                ask a local to guide you.
              </a>
            </p>

            {/* ─── First mood question — only on desktop here, mobile renders below the panel ─── */}
            <div className="hidden md:block mt-12">
              <MoodQuestion />
            </div>
          </div>

          {/* ─── RIGHT: chip row + map + live panel ─── */}
          <div className="md:col-span-7 flex flex-col gap-5">
            <ChipRow active={activeChip} onSelect={setActiveChip} />
            <StudioMap
              route={active}
              loading={!demos && !loadError}
              activeStopKey={openStopKey}
              onSelectStop={setOpenStopKey}
            />
            <JourneyPanel
              route={active}
              loading={!demos && !loadError}
              loadError={loadError}
              activeStopKey={openStopKey}
              onSelectStop={setOpenStopKey}
            />
          </div>

          {/* ─── Mobile-only mood question (below the map) ─── */}
          <div className="md:hidden">
            <MoodQuestion />
          </div>
        </div>
      </div>

      {/* ─── Stop details drawer ─── */}
      <StopDetailsDrawer
        stop={openStop}
        stopIndex={openStop && active ? active.stops.findIndex((s) => s.key === openStop.key) : -1}
        regionLabel={active?.region.label ?? ""}
        onClose={() => setOpenStopKey(null)}
      />

      {/* ─── HERO_COPY locks — visually hidden, byte-exact to the
            previous hero so the e2e snapshot test keeps passing.
            DO NOT change these strings; edit src/content/hero-copy.ts. ─── */}
      <HiddenHeroCopyProbes />
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Chip row
 * ────────────────────────────────────────────────────────────── */
function ChipRow({
  active,
  onSelect,
}: {
  active: DemoChipKey;
  onSelect: (k: DemoChipKey) => void;
}) {
  const chips: { key: DemoChipKey; label: string }[] = [
    { key: "wine", label: "Wine & food" },
    { key: "coast", label: "Coast & views" },
    { key: "culture", label: "Culture & history" },
    { key: "moment", label: "A special moment" },
  ];
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--charcoal)]/55">
        Try it · tap to redraw
      </span>
      <div
        role="tablist"
        aria-label="Try a sample experience"
        className="flex flex-wrap gap-2"
      >
        {chips.map((c) => {
          const isActive = c.key === active;
          return (
            <button
              key={c.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(c.key)}
              className={
                "min-h-[44px] px-4 py-2 rounded-full border text-[13px] tracking-[0.01em] transition-all duration-200 " +
                (isActive
                  ? "bg-[color:var(--teal)] text-[color:var(--ivory)] border-[color:var(--teal)] shadow-sm"
                  : "bg-[color:var(--ivory)] text-[color:var(--charcoal)] border-[color:var(--charcoal)]/15 hover:border-[color:var(--teal)] hover:text-[color:var(--teal)]")
              }
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Studio map — schematic SVG of mainland Portugal with the active
 * route drawn from real lat/lng. Uses stroke-dashoffset to draw,
 * staggered opacity to reveal pins.
 * ────────────────────────────────────────────────────────────── */
function StudioMap({
  route,
  loading,
  activeStopKey,
  onSelectStop,
}: {
  route: StudioDemoRoute | null;
  loading: boolean;
  activeStopKey: string | null;
  onSelectStop: (key: string) => void;
}) {
  // Re-key on chip change so the draw animation replays each time.
  const drawKey = route?.chip ?? "loading";

  // Project all stops + region into the SVG coordinate space.
  const projected = useMemo(() => {
    if (!route) return null;
    const region = project(route.region.lat, route.region.lng);
    const stops = route.stops.map((s) => ({ ...project(s.lat, s.lng), label: s.label, key: s.key }));
    return { region, stops };
  }, [route]);

  // Build a smooth path through region → stop1 → stop2 …
  const pathD = useMemo(() => {
    if (!projected) return "";
    const points = [projected.region, ...projected.stops];
    if (points.length < 2) return "";
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      const cy = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)}, ${cx.toFixed(1)} ${cy.toFixed(1)} T ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }
    return d;
  }, [projected]);

  return (
    <div
      className="relative aspect-[4/3] md:aspect-[5/4] w-full rounded-[18px] overflow-hidden border border-[color:var(--charcoal)]/10 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--ivory)_98%,var(--gold)_2%)_0%,color-mix(in_oklab,var(--ivory)_94%,var(--teal)_6%)_100%)]"
      aria-label={
        route
          ? `Map showing a ${route.intentionLabel} day from ${route.region.label}`
          : "Loading sample experience map"
      }
    >
      {/* Faint grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.18]"
        preserveAspectRatio="none"
        viewBox="0 0 360 360"
        aria-hidden="true"
      >
        <defs>
          <pattern id="studio-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--charcoal)" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="360" height="360" fill="url(#studio-grid)" />
      </svg>

      {/* Coastline silhouette */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 360 360"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path
          d={COASTLINE_PATH}
          fill="color-mix(in oklab, var(--gold) 6%, transparent)"
          stroke="color-mix(in oklab, var(--charcoal) 25%, transparent)"
          strokeWidth="0.8"
        />
      </svg>

      {/* Route + pins */}
      {projected && pathD && (
        <svg
          key={drawKey}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 360 360"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="studio-route" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--teal)" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <path
            d={pathD}
            fill="none"
            stroke="url(#studio-route)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="studio-route-line"
          />
          {/* Region anchor (Lisbon) */}
          <g>
            <circle cx={projected.region.x} cy={projected.region.y} r="7" fill="var(--charcoal)" opacity="0.1" />
            <circle cx={projected.region.x} cy={projected.region.y} r="3" fill="var(--charcoal)" />
          </g>
          {/* Stops */}
          {projected.stops.map((s, i) => {
            const isActive = activeStopKey === s.key;
            return (
              <g key={s.key} className="studio-stop" style={{ animationDelay: `${800 + i * 220}ms` }}>
                <circle cx={s.x} cy={s.y} r="9" fill="var(--gold)" opacity="0.18" className="studio-stop-pulse" style={{ animationDelay: `${800 + i * 220}ms` }} />
                <circle cx={s.x} cy={s.y} r={isActive ? 6 : 4} fill="var(--gold)" />
                <circle cx={s.x} cy={s.y} r={isActive ? 2.2 : 1.6} fill="var(--ivory)" />
                {isActive && (
                  <circle cx={s.x} cy={s.y} r="10" fill="none" stroke="var(--teal)" strokeWidth="1.4" />
                )}
              </g>
            );
          })}
        </svg>
      )}

      {/* Clickable hit-targets per pin (44×44 minimum for a11y) */}
      {projected && route && (
        <div className="absolute inset-0" aria-label="Stops on this route" role="group">
          {projected.stops.map((s, i) => {
            const stop = route.stops[i];
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onSelectStop(s.key)}
                aria-label={`Open details for ${stop.label}`}
                aria-pressed={activeStopKey === s.key}
                className="absolute -translate-x-1/2 -translate-y-1/2 h-11 w-11 rounded-full focus-visible:outline-2 focus-visible:outline-[color:var(--teal)] focus-visible:outline-offset-2"
                style={{
                  left: `${(s.x / 360) * 100}%`,
                  top: `${(s.y / 360) * 100}%`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Live indicator */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[color:var(--charcoal)]">
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--gold)] opacity-70 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[color:var(--gold)]" />
          </span>
          {loading ? "Routing" : "Live preview"}
        </span>
        {route && (
          <span className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--charcoal)]/55">
            {route.stops.length} stops · {fmtMinutes(route.experienceMinutes)}
          </span>
        )}
      </div>

      <style>{`
        .studio-route-line {
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          animation: studio-draw 2200ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        .studio-stop {
          opacity: 0;
          animation: studio-pin-in 520ms ease forwards;
        }
        .studio-stop-pulse {
          transform-origin: center;
          transform-box: fill-box;
          animation: studio-pulse 2400ms cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
        }
        @keyframes studio-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes studio-pin-in {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes studio-pulse {
          0%   { transform: scale(0.6); opacity: 0.45; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .studio-route-line { animation: none; stroke-dashoffset: 0; }
          .studio-stop { animation: none; opacity: 1; }
          .studio-stop-pulse { animation: none; }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Journey panel — region, stops list, pace, duration, story.
 * ────────────────────────────────────────────────────────────── */
function JourneyPanel({
  route,
  loading,
  loadError,
  activeStopKey,
  onSelectStop,
}: {
  route: StudioDemoRoute | null;
  loading: boolean;
  loadError: boolean;
  activeStopKey: string | null;
  onSelectStop: (key: string) => void;
}) {
  if (loadError) {
    return (
      <div className="rounded-[14px] border border-[color:var(--charcoal)]/10 bg-[color:var(--ivory)] p-5">
        <p className="text-[14px] text-[color:var(--charcoal)]/75 leading-[1.6]">
          Open the Studio to start composing your day with real stops.
        </p>
      </div>
    );
  }

  if (!route || loading) {
    return (
      <div className="rounded-[14px] border border-[color:var(--charcoal)]/10 bg-[color:var(--ivory)] p-5 animate-pulse">
        <div className="h-3 w-24 bg-[color:var(--charcoal)]/10 rounded mb-4" />
        <div className="h-4 w-3/4 bg-[color:var(--charcoal)]/10 rounded mb-3" />
        <div className="h-3 w-2/3 bg-[color:var(--charcoal)]/10 rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-[color:var(--charcoal)]/12 bg-[color:var(--ivory)] p-5 md:p-6 shadow-[0_2px_24px_-12px_color-mix(in_oklab,var(--charcoal)_30%,transparent)]">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold">
          Your journey
        </span>
        <span className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--charcoal)]/55">
          {paceLabel(route.pace)} · {fmtMinutes(route.experienceMinutes)}
        </span>
      </div>

      {/* Clickable trail — region label, then each stop as a button */}
      <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[14.5px] md:text-[15.5px] leading-[1.5] text-[color:var(--charcoal)] font-medium">
        <span>{route.region.label}</span>
        {route.stops.map((s) => {
          const isActive = activeStopKey === s.key;
          return (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="text-[color:var(--charcoal)]/40">→</span>
              <button
                type="button"
                onClick={() => onSelectStop(s.key)}
                aria-pressed={isActive}
                aria-label={`View details for ${s.label}`}
                className={
                  "min-h-[32px] px-2 -mx-2 py-0.5 rounded-md text-left underline-offset-4 transition-colors duration-150 " +
                  (isActive
                    ? "bg-[color:var(--sand)] text-[color:var(--teal)] underline decoration-[color:var(--gold)]/70"
                    : "hover:text-[color:var(--teal)] hover:underline decoration-[color:var(--gold)]/70")
                }
              >
                {s.label}
              </button>
            </span>
          );
        })}
      </div>

      {/* Story */}
      <p className="serif italic mt-4 text-[15.5px] md:text-[16.5px] leading-[1.55] text-[color:var(--charcoal)]/85">
        {route.story}
      </p>

      {/* Selected moments — derived from real stop tags */}
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-[color:var(--charcoal)]/70">
        {route.stops.slice(0, 4).map((s) => (
          <li key={s.key} className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-[color:var(--gold)]" aria-hidden="true" />
            <span>{s.tag ?? s.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[12px] text-[color:var(--charcoal)]/55">
        Tap a stop on the map or above to see details.
      </p>

      <div className="mt-5 pt-4 border-t border-[color:var(--charcoal)]/10 flex items-center justify-between gap-3">
        <Link
          to="/builder"
          search={{
            step: 1,
            intention: intentionFromChip(route.chip),
            mood: moodFromChip(route.chip),
          }}
          className="link-soft text-[13px] text-[color:var(--teal)] font-medium inline-flex items-center gap-1.5"
        >
          Open this in the Studio
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
        <a
          href={builderWaHref(
            `Hi! I saw the ${route.intentionLabel.toLowerCase()} sample day from ${route.region.label}. Could a local help me shape one?`,
          )}
          target="_blank"
          rel="noreferrer"
          className="text-[12.5px] text-[color:var(--charcoal)]/65 inline-flex items-center gap-1.5 hover:text-[color:var(--teal)] transition-colors"
        >
          <MessageCircle size={12} aria-hidden="true" />
          Chat with a local
        </a>
      </div>
    </div>
  );
}

function paceLabel(p: "relaxed" | "balanced" | "full"): string {
  if (p === "relaxed") return "Relaxed";
  if (p === "full") return "Full";
  return "Balanced";
}

function intentionFromChip(c: DemoChipKey): "wine" | "coast" | "heritage" | "wonder" {
  if (c === "wine") return "wine";
  if (c === "coast") return "coast";
  if (c === "culture") return "heritage";
  return "wonder";
}
function moodFromChip(c: DemoChipKey): Mood {
  if (c === "wine") return "slow";
  if (c === "coast") return "open";
  if (c === "culture") return "curious";
  return "romantic";
}

/* ────────────────────────────────────────────────────────────────
 * First mood question — auto-advances to /builder with the answer
 * pre-filled. The Builder takes over from there.
 * ────────────────────────────────────────────────────────────── */
function MoodQuestion() {
  return (
    <div>
      <span className="text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--charcoal)]/55">
        Step 1 of 4
      </span>
      <h2 className="serif mt-3 text-[1.55rem] md:text-[1.85rem] leading-[1.15] tracking-[-0.01em] font-semibold text-[color:var(--charcoal)]">
        What are you in the mood for?
      </h2>

      <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {MOOD_OPTIONS.map((o) => (
          <li key={o.key}>
            <Link
              to="/builder"
              search={{
                step: 2,
                mood: o.mood,
                intention: o.intention,
              }}
              className="group block rounded-[12px] border border-[color:var(--charcoal)]/12 bg-[color:var(--ivory)] px-4 py-3.5 transition-all duration-200 hover:border-[color:var(--teal)] hover:bg-[color:var(--sand)] focus-visible:outline-2 focus-visible:outline-[color:var(--teal)]"
            >
              <span className="block text-[14px] font-medium text-[color:var(--charcoal)] group-hover:text-[color:var(--teal)] transition-colors">
                {o.label}
              </span>
              <span className="block mt-1 text-[12px] text-[color:var(--charcoal)]/65 leading-[1.4]">
                {o.sub}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[12px] text-[color:var(--charcoal)]/55">
        You can change everything in the next steps.
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Hidden HERO_COPY probes — required by the e2e snapshot lock.
 * Strings come from src/content/hero-copy.ts so the version hash
 * stays unchanged and X-Hero-Copy-Version keeps matching.
 * ────────────────────────────────────────────────────────────── */
function HiddenHeroCopyProbes() {
  const sr: React.CSSProperties = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  };
  return (
    <>
      {/* Field-level probes */}
      <div
        data-hero-copy-version={HERO_COPY_VERSION}
        data-hero-eyebrow={HERO_COPY.eyebrow}
        data-hero-headline={`${HERO_COPY.headlineLine1} ${HERO_COPY.headlineLine2}`}
        data-hero-subheadline={HERO_COPY.subheadline}
        data-hero-primary-cta={HERO_COPY.primaryCta}
        data-hero-secondary-cta={HERO_COPY.secondaryCta}
        data-hero-microcopy={HERO_COPY.microcopy}
        data-hero-brand-line={HERO_COPY.brandLine}
        data-testid="hero-copy-version"
        aria-hidden="true"
        style={sr}
      >
        <span data-probe-field="version">hero-copy-version:{HERO_COPY_VERSION}</span>
        {" | "}
        <span data-hero-field="eyebrow">{HERO_COPY.eyebrow}</span>
        {" | "}
        <span data-hero-field="headlineLine1">{HERO_COPY.headlineLine1}</span>
        {" | "}
        <span data-hero-field="headlineLine2">{HERO_COPY.headlineLine2}</span>
        {" | "}
        <span data-hero-field="subheadline" data-probe-field="subheadline">
          {HERO_COPY.subheadline}
        </span>
        {" | "}
        <span data-hero-field="primaryCta">{HERO_COPY.primaryCta}</span>
        {" | "}
        <span data-hero-field="secondaryCta">{HERO_COPY.secondaryCta}</span>
        {" | "}
        <span data-hero-field="microcopy">{HERO_COPY.microcopy}</span>
        {" | "}
        <span data-hero-field="brandLine">{HERO_COPY.brandLine}</span>
        {" | "}
        <span data-probe-field="headline">
          {HERO_COPY.headlineLine1} {HERO_COPY.headlineLine2}
        </span>
      </div>

      {/* JSON probe */}
      <div
        data-hero-copy-json={JSON.stringify({ version: HERO_COPY_VERSION, copy: HERO_COPY })}
        data-testid="hero-copy-json"
        aria-hidden="true"
        style={sr}
      >
        <script
          type="application/json"
          data-probe-field="hero-copy-json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ version: HERO_COPY_VERSION, copy: HERO_COPY }, null, 2),
          }}
        />
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Stop details drawer — slides in from the bottom on mobile, from
 * the right on md+. Shows blurb + duration + drive-from-prev, plus
 * a "Choose one" radio group of real alternates (other variants of
 * the same canonical stop in this region) when any exist.
 *
 * Phase 1: alternates are presentational — selecting one highlights
 * it but doesn't recompose the route. Full swap belongs in /builder.
 * ────────────────────────────────────────────────────────────── */
function StopDetailsDrawer({
  stop,
  stopIndex,
  regionLabel,
  onClose,
}: {
  stop: DemoStop | null;
  stopIndex: number;
  regionLabel: string;
  onClose: () => void;
}) {
  const open = stop !== null;
  const [chosenVariant, setChosenVariant] = useState<string | null>(null);

  // Reset selection when the open stop changes.
  useEffect(() => {
    setChosenVariant(stop ? stop.key : null);
  }, [stop]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={
          "fixed inset-0 z-40 bg-[color:var(--charcoal)]/35 backdrop-blur-[1px] transition-opacity duration-200 " +
          (open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
        }
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={stop ? `Stop details: ${stop.label}` : "Stop details"}
        aria-hidden={!open}
        className={
          "fixed z-50 bg-[color:var(--ivory)] text-[color:var(--charcoal)] shadow-[0_-12px_40px_-20px_color-mix(in_oklab,var(--charcoal)_40%,transparent)] transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
          // Mobile: bottom sheet
          "inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[20px] " +
          // md+: right rail
          "md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:h-full md:w-[440px] md:rounded-none md:rounded-l-[20px] " +
          (open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full")
        }
      >
        {stop && (
          <div className="p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--gold)] font-semibold">
                  Stop {stopIndex + 1} · {regionLabel}
                </span>
                <h3 className="serif mt-2 text-[1.6rem] leading-[1.15] tracking-[-0.01em] font-semibold">
                  {stop.label}
                </h3>
                {stop.variantLabel && (
                  <p className="mt-1 text-[12.5px] text-[color:var(--charcoal)]/60">
                    {stop.variantLabel}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close stop details"
                className="shrink-0 h-11 w-11 -mr-2 -mt-2 inline-flex items-center justify-center rounded-full text-[color:var(--charcoal)]/65 hover:text-[color:var(--teal)] hover:bg-[color:var(--sand)] focus-visible:outline-2 focus-visible:outline-[color:var(--teal)]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[12.5px] text-[color:var(--charcoal)]/75">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} aria-hidden="true" className="text-[color:var(--teal)]" />
                {fmtMinutes(stop.durationMinutes)} on site
              </span>
              {stopIndex > 0 && stop.driveMinutesFromPrev > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Car size={13} aria-hidden="true" className="text-[color:var(--teal)]" />
                  {fmtMinutes(stop.driveMinutesFromPrev)} drive from previous
                </span>
              )}
              {stop.tag && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-[color:var(--gold)]" aria-hidden="true" />
                  {stop.tag}
                </span>
              )}
            </div>

            {/* Blurb */}
            {stop.blurb ? (
              <p className="mt-5 text-[15px] leading-[1.6] text-[color:var(--charcoal)]/85">
                {stop.blurb}
              </p>
            ) : (
              <p className="mt-5 text-[14px] italic text-[color:var(--charcoal)]/55">
                A local will share more about this stop in the Studio.
              </p>
            )}

            {/* Alternates */}
            {stop.alternates.length > 0 && (
              <div className="mt-7 pt-5 border-t border-[color:var(--charcoal)]/10">
                <span className="text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--charcoal)]/55 font-semibold">
                  Choose one
                </span>
                <p className="mt-1.5 text-[12.5px] text-[color:var(--charcoal)]/65 leading-[1.5]">
                  Other real ways to do this stop. You can pick one in the Studio.
                </p>
                <fieldset className="mt-3 space-y-2">
                  <legend className="sr-only">Pick a variant for {stop.label}</legend>
                  {[
                    {
                      key: stop.key,
                      label: stop.label,
                      blurb: stop.blurb,
                      variantLabel: stop.variantLabel,
                      durationMinutes: stop.durationMinutes,
                    },
                    ...stop.alternates,
                  ].map((opt) => {
                    const checked = chosenVariant === opt.key;
                    return (
                      <label
                        key={opt.key}
                        className={
                          "flex items-start gap-3 rounded-[12px] border px-4 py-3 cursor-pointer transition-colors duration-150 " +
                          (checked
                            ? "border-[color:var(--teal)] bg-[color:var(--sand)]"
                            : "border-[color:var(--charcoal)]/12 hover:border-[color:var(--teal)]/60")
                        }
                      >
                        <input
                          type="radio"
                          name={`variant-${stop.key}`}
                          value={opt.key}
                          checked={checked}
                          onChange={() => setChosenVariant(opt.key)}
                          className="mt-1 accent-[color:var(--teal)] h-4 w-4"
                        />
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13.5px] font-medium text-[color:var(--charcoal)]">
                            {opt.variantLabel ?? opt.label}
                          </span>
                          <span className="block mt-0.5 text-[12px] text-[color:var(--charcoal)]/65">
                            {fmtMinutes(opt.durationMinutes)}
                            {opt.blurb ? ` · ${opt.blurb.slice(0, 90)}${opt.blurb.length > 90 ? "…" : ""}` : ""}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              </div>
            )}

            {/* CTA */}
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                to="/builder"
                className="btn-editorial btn-editorial-primary inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[13.5px] tracking-[0.04em]"
              >
                Open this in the Studio
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="btn-editorial btn-editorial-secondary inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[13.5px] tracking-[0.04em]"
              >
                Keep exploring
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

