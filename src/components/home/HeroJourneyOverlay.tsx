/**
 * HeroJourneyOverlay
 *
 * Subtle animated layer that sits on top of the hero image and beneath the
 * dark gradient + headline. Communicates the product concept — "your
 * Portugal journey is being shaped in real time" — through:
 *
 *   1. A slowly-drawing dashed route line (gold → teal), the same visual
 *      vocabulary used by the Builder map and the Studio preview.
 *   2. Three location pings that fade in sequentially along the route.
 *   3. A faint moving "studio" highlight that glides along the path,
 *      suggesting an in-progress build.
 *
 * Pure SVG. No video, no images, no JS. ~0 perf cost.
 * Honours `prefers-reduced-motion`: line is shown statically, pings are
 * shown but do not pulse, highlight does not move.
 *
 * Layout-agnostic — fills its parent. Use inside the hero <section> as
 * an absolutely-positioned sibling of the background <img>, BEFORE the
 * dark gradient overlays so the overlay still tones it down for
 * readability.
 */
export function HeroJourneyOverlay() {
  return (
    <div
      aria-hidden="true"
      className="hero-journey-overlay pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          {/* Route gradient — gold start → teal end, matches Builder map */}
          <linearGradient id="heroRouteGrad" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0" />
            <stop offset="18%" stopColor="var(--gold)" stopOpacity="0.95" />
            <stop offset="62%" stopColor="var(--gold-soft)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--teal-2, var(--teal))" stopOpacity="0" />
          </linearGradient>

          {/* Soft glow for the moving studio highlight */}
          <radialGradient id="heroRouteHighlight" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.55" />
            <stop offset="60%" stopColor="var(--gold)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>

          {/* Soft ping gradient for location points */}
          <radialGradient id="heroPingGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--gold-soft)" stopOpacity="0.95" />
            <stop offset="60%" stopColor="var(--gold)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Faint base path — always visible so the route reads even before
            the animated overlay completes its draw. Path traces the upper
            band of the hero so it sits above the dark gradient peak and
            stays visible behind/above the headline area without blocking
            text contrast. */}
        <path
          d="M -20 220 C 180 160, 340 120, 520 180 S 820 320, 980 240 1180 120 1240 80"
          stroke="var(--ivory)"
          strokeOpacity="0.14"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="2 10"
        />

        {/* Animated dashed route line — slowly draws in, then idles */}
        <path
          className="hero-journey-route"
          d="M -20 220 C 180 160, 340 120, 520 180 S 820 320, 980 240 1180 120 1240 80"
          stroke="url(#heroRouteGrad)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 14"
        />

        {/* Moving studio highlight — small soft glow that travels along
            the path on a long, calm loop. Gives the "being built right
            now" feel without flashy motion. */}
        <g className="hero-journey-studio">
          <circle r="38" fill="url(#heroRouteHighlight)" />
        </g>

        {/* Three location pings, staggered. Coordinates roughly match the
            inflection points of the route above. */}
        <g className="hero-journey-pings">
          <g transform="translate(340 130)" className="hero-journey-ping hero-journey-ping-1">
            <circle r="20" fill="url(#heroPingGrad)" className="hero-journey-ping-halo" />
            <circle r="3.4" fill="var(--gold)" />
          </g>
          <g transform="translate(720 280)" className="hero-journey-ping hero-journey-ping-2">
            <circle r="20" fill="url(#heroPingGrad)" className="hero-journey-ping-halo" />
            <circle r="3.4" fill="var(--gold)" />
          </g>
          <g transform="translate(1040 200)" className="hero-journey-ping hero-journey-ping-3">
            <circle r="20" fill="url(#heroPingGrad)" className="hero-journey-ping-halo" />
            <circle r="3.2" fill="var(--gold-soft)" />
          </g>
        </g>
      </svg>
    </div>
  );
}
