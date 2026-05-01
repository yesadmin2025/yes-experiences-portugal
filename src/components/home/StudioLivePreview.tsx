import { useEffect, useRef, useState } from "react";
import { Wine, Users, Clock3, Sparkles, MapPin } from "lucide-react";
import { useScrollDebugFlags } from "@/lib/scroll-debug";

/**
 * StudioLivePreview — homepage "Experience Studio" hero device.
 *
 * Mobile-first, map-led. Shows a predictive private day taking shape:
 *  · header chips: Mood · Who · Rhythm  (the three Studio inputs)
 *  · animated SVG map of the Setúbal peninsula with three real stops
 *      Lisbon → Azeitão → Sesimbra
 *    drawing on stroke-dashoffset, with pins revealing in sequence
 *  · live story panel: selected moments, estimated time, one-line story
 *
 * NO real data is invented beyond the brief's preview example
 * (Wine & food / Couple / Relaxed · Lisbon → Azeitão → Sesimbra ·
 *  Wine tasting / Local lunch / Coastal viewpoint · 7h30). All copy
 * comes directly from the approved spec.
 *
 * Motion is part of the homepage `.home-energy` scope and respects
 * prefers-reduced-motion (every keyframe stops, dashoffset jumps to
 * 0, pulsing pins go static).
 */

type Stop = {
  id: string;
  // Geographic-ish coordinates expressed in the SVG's local viewBox
  // (200×260). Tuned by eye against the Setúbal peninsula so the
  // route reads as Lisbon → Azeitão → Sesimbra without claiming to be
  // a tile-map. Mapbox shows up at the real /builder route.
  x: number;
  y: number;
  label: string;
  caption: string;
  delay: number;
};

const STOPS: Stop[] = [
  { id: "lis", x: 70, y: 60, label: "Lisbon", caption: "Pickup", delay: 0 },
  { id: "aze", x: 110, y: 138, label: "Azeitão", caption: "Wine tasting · Local lunch", delay: 700 },
  { id: "ses", x: 154, y: 206, label: "Sesimbra", caption: "Coastal viewpoint", delay: 1400 },
];

// Smooth bezier through the three stops. Drawn in viewBox space.
const ROUTE_D =
  "M 70 60 C 78 92, 90 116, 110 138 S 138 178, 154 206";

// Total length used for the dash trick. We measure it once on mount
// rather than hard-coding so the motion stays correct if the path
// is later tweaked.
const FALLBACK_LEN = 260;

export function StudioLivePreview() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [active, setActive] = useState(false);
  const [pathLen, setPathLen] = useState(FALLBACK_LEN);
  const scrollDebug = useScrollDebugFlags();
  const renderedActive = active || scrollDebug.disableMobileStudioMotion;

  // Measure path on mount — keeps animation accurate.
  useEffect(() => {
    if (pathRef.current && typeof pathRef.current.getTotalLength === "function") {
      try {
        const l = pathRef.current.getTotalLength();
        if (l > 0 && Number.isFinite(l)) setPathLen(l);
      } catch {
        // ignore — fall back to FALLBACK_LEN
      }
    }
  }, []);

  // Trigger animation once the device is in view. Reduced-motion users
  // get the final state immediately.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      data-active={renderedActive ? "true" : "false"}
      className="studio-live relative overflow-hidden rounded-[6px] border border-[color:var(--gold)]/25 bg-[color:var(--charcoal-deep)] shadow-[0_18px_40px_-20px_rgba(46,46,46,0.45)]"
      role="img"
      aria-label="Experience Studio live preview: Lisbon to Azeitão to Sesimbra, a relaxed day around wine and the coast, estimated seven and a half hours"
    >
      {/* ── Header strip — three Studio inputs as live chips ───────── */}
      <div className="relative z-20 flex items-center justify-between gap-3 border-b border-[color:var(--gold)]/15 bg-[color:var(--charcoal-deep)]/85 px-4 md:px-5 py-3 md:py-3.5 backdrop-blur-[2px]">
        <span className="inline-flex items-center gap-2 text-[9.5px] md:text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--gold)] opacity-70 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[color:var(--gold)]" />
          </span>
          Routing your day
        </span>
        <span className="text-[9.5px] md:text-[10px] uppercase tracking-[0.28em] text-[color:var(--ivory)]/55">
          Studio · Live
        </span>
      </div>

      <div
        className="relative z-10 flex flex-wrap items-center gap-1.5 md:gap-2 border-b border-[color:var(--gold)]/12 bg-[color:var(--charcoal-deep)]/70 px-4 md:px-5 py-3"
        role="group"
        aria-label="Studio inputs preview"
      >
        <Chip icon={<Wine size={11} aria-hidden="true" />} label="Mood" value="Wine & food" />
        <Chip icon={<Users size={11} aria-hidden="true" />} label="Who" value="Couple" />
        <Chip icon={<Clock3 size={11} aria-hidden="true" />} label="Rhythm" value="Relaxed" />
      </div>

      {/* ── Map stage ─────────────────────────────────────────────── */}
      <div className="relative aspect-[4/5] sm:aspect-[5/4] md:aspect-[16/11] w-full">
        {/* Atmospheric backdrop — soft teal/gold radial glows */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_28%_18%,rgba(201,169,106,0.10)_0%,transparent_55%),radial-gradient(110%_80%_at_72%_82%,rgba(41,91,97,0.50)_0%,transparent_60%)]"
        />

        {/* Topo grid */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-[0.16]"
          preserveAspectRatio="none"
          viewBox="0 0 200 260"
        >
          <defs>
            <pattern id="slv-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--gold)" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="200" height="260" fill="url(#slv-grid)" />
        </svg>

        {/* Coastline — purely decorative silhouette of the south coast */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 200 260"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M 0 70 C 30 78, 60 96, 90 120 S 130 168, 160 190 S 188 220, 200 232 L 200 260 L 0 260 Z"
            fill="rgba(41,91,97,0.22)"
            stroke="rgba(201,169,106,0.18)"
            strokeWidth="0.6"
          />
          <path
            d="M 0 60 C 28 70, 56 88, 86 112 S 126 158, 156 178 S 188 208, 200 220"
            fill="none"
            stroke="rgba(201,169,106,0.20)"
            strokeWidth="0.5"
            strokeDasharray="2 3"
          />
        </svg>

        {/* Route + pins */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 200 260"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="slv-route" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--teal-2)" stopOpacity="0.95" />
              <stop offset="60%" stopColor="var(--gold)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.7" />
            </linearGradient>
            <filter id="slv-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.6" />
            </filter>
          </defs>

          {/* Faint glow trail behind the route */}
          <path
            d={ROUTE_D}
            fill="none"
            stroke="url(#slv-route)"
            strokeOpacity="0.45"
            strokeWidth="3.8"
            strokeLinecap="round"
            filter="url(#slv-soft)"
            strokeDasharray={pathLen}
            strokeDashoffset={renderedActive ? 0 : pathLen}
            style={{ transition: "stroke-dashoffset 2520ms cubic-bezier(0.22, 0.61, 0.36, 1)" }}
          />
          {/* Sharp route line */}
          <path
            ref={pathRef}
            d={ROUTE_D}
            fill="none"
            stroke="url(#slv-route)"
            strokeOpacity="1"
            strokeWidth="1.95"
            strokeLinecap="round"
            strokeDasharray={pathLen}
            strokeDashoffset={renderedActive ? 0 : pathLen}
            style={{ transition: "stroke-dashoffset 2520ms cubic-bezier(0.22, 0.61, 0.36, 1)" }}
          />

          {/* Stops */}
          {STOPS.map((s, i) => (
            <g
              key={s.id}
              className="slv-pin"
              role="button"
              tabIndex={0}
              aria-label={`${s.label} — ${s.caption}`}
              style={{
                opacity: renderedActive ? 1 : 0,
                transform: renderedActive ? "translateY(0)" : "translateY(4px)",
                transition: `opacity 520ms ease ${s.delay}ms, transform 520ms ease ${s.delay}ms`,
                transformBox: "fill-box",
                transformOrigin: `${s.x}px ${s.y}px`,
              }}
            >
              {/* Focus ring — only visible on keyboard focus */}
              <circle
                className="slv-pin-focus"
                cx={s.x}
                cy={s.y}
                r="8"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="1.2"
              />
              {/* Outer pulse — first & last stops only, keeps it calm */}
              {(i === 0 || i === STOPS.length - 1) && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r="6"
                  fill="var(--gold)"
                  opacity="0.18"
                  className={renderedActive ? "slv-pulse" : ""}
                  style={{ animationDelay: `${s.delay + 600}ms` }}
                />
              )}
              <circle cx={s.x} cy={s.y} r="3.4" fill="var(--charcoal-deep)" />
              <circle cx={s.x} cy={s.y} r="2.6" fill={i === 0 ? "var(--teal-2)" : "var(--gold)"} />
              {i === STOPS.length - 1 && (
                <circle cx={s.x} cy={s.y} r="1.1" fill="var(--ivory)" opacity="0.95" />
              )}
            </g>
          ))}
        </svg>

        {/* Pin labels — DOM elements (not SVG text) so typography stays sharp */}
        <ul aria-hidden="true" className="pointer-events-none absolute inset-0 m-0 list-none p-0">
          {STOPS.map((s) => (
            <li
              key={s.id}
              className="absolute"
              style={{
                left: `${(s.x / 200) * 100}%`,
                top: `${(s.y / 260) * 100}%`,
                transform: "translate(10px, -50%)",
                opacity: renderedActive ? 1 : 0,
                transition: `opacity 600ms ease ${s.delay + 250}ms`,
              }}
            >
              <span className="block text-[10.5px] md:text-[11px] uppercase tracking-[0.26em] font-semibold text-[color:var(--ivory)] [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
                {s.label}
              </span>
              <span className="mt-0.5 block text-[9.5px] md:text-[10px] tracking-[0.06em] text-[color:var(--ivory)]/75 [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">
                {s.caption}
              </span>
            </li>
          ))}
        </ul>

        {/* Map floor caption — distance + day-feel */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 text-[color:var(--ivory)]/90">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
            Today's draft
          </p>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--ivory)]/60">
            3 stops · 1 day
          </p>
        </div>
      </div>

      {/* ── Live story panel ──────────────────────────────────────── */}
      <div className="relative z-10 border-t border-[color:var(--gold)]/15 bg-[color:var(--ivory)] px-4 md:px-5 py-4 md:py-5">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] font-semibold text-[color:var(--teal)]">
            <Sparkles size={11} aria-hidden="true" />
            Selected moments
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[color:var(--charcoal)]">
            <Clock3 size={11} aria-hidden="true" className="text-[color:var(--teal)]" />
            7h30
          </span>
        </div>

        <ul className="mt-3 flex flex-wrap gap-1.5 list-none p-0">
          {[
            "Wine tasting",
            "Local lunch",
            "Coastal viewpoint",
          ].map((moment, i) => (
            <li
              key={moment}
              tabIndex={0}
              role="button"
              aria-label={`Selected moment: ${moment}`}
              className="slv-moment slv-focusable inline-flex items-center gap-1.5 rounded-full border border-[color:var(--teal)]/25 bg-[color:var(--ivory)] px-3 py-1 text-[11.5px] tracking-[0.02em] text-[color:var(--charcoal)]"
              style={{
                opacity: renderedActive ? 1 : 0,
                transform: renderedActive ? "translateY(0)" : "translateY(4px)",
                transition: `opacity 520ms ease ${1500 + i * 220}ms, transform 520ms ease ${1500 + i * 220}ms`,
              }}
            >
              <MapPin size={10} aria-hidden="true" className="text-[color:var(--teal)]" />
              {moment}
            </li>
          ))}
        </ul>

        <p
          className="serif italic mt-4 text-[14.5px] md:text-[15.5px] leading-[1.55] text-[color:var(--charcoal)]"
          style={{
            opacity: renderedActive ? 1 : 0,
            transform: renderedActive ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 600ms ease 2100ms, transform 600ms ease 2100ms",
          }}
        >
          A slow day between vineyards and the coast, shaped around wine, food and time to enjoy the view.
        </p>
      </div>

      {/* Animations + focus styles for this device live in styles.css
          under the `.studio-live` scope so the CSS is parsed once and
          honours `prefers-reduced-motion` globally. */}
    </div>
  );
}

function Chip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span
      tabIndex={0}
      role="button"
      aria-label={`${label}: ${value}`}
      className="slv-focusable inline-flex items-center gap-1.5 rounded-full border border-[color:var(--gold)]/30 bg-[color:var(--charcoal-deep)]/60 px-2.5 py-1 text-[color:var(--ivory)]"
    >
      <span className="text-[color:var(--gold)]">{icon}</span>
      <span className="text-[9px] uppercase tracking-[0.26em] text-[color:var(--ivory)]/65">
        {label}
      </span>
      <span className="text-[11px] font-semibold tracking-[0.01em] text-[color:var(--ivory)]">
        {value}
      </span>
    </span>
  );
}

