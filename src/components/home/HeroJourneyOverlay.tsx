/**
 * HeroJourneyOverlay
 *
 * Narrative motion layer for the hero. Communicates how YES operates:
 * a private Portugal experience being shaped in real time, point by
 * point, choice by choice. The route draws across the hero while four
 * location pings light up sequentially. Next to each ping a label
 * appears with a different motion direction (slide-right, fade-up,
 * blur-to-sharp, slide-left) and cross-fades to a second word — the
 * visual metaphor of "a choice being made".
 *
 * 4 pings × 2 words = 8 narrative beats, evenly distributed across
 * the route draw (0.6s → 6.1s) so the user reads the entire concept
 * within ~6 seconds.
 *
 * Pure SVG + a thin absolute label layer. No video. Mobile-first:
 * label density reduced and sizes scaled. Honours
 * `prefers-reduced-motion`.
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
          <linearGradient id="heroRouteGrad" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0" />
            <stop offset="14%" stopColor="var(--gold)" stopOpacity="0.95" />
            <stop offset="62%" stopColor="var(--gold-soft)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--teal-2, var(--teal))" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="heroRouteHighlight" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.55" />
            <stop offset="60%" stopColor="var(--gold)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="heroPingGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--gold-soft)" stopOpacity="0.95" />
            <stop offset="60%" stopColor="var(--gold)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Faint base path — always visible. */}
        <path
          d="M -20 220 C 160 150, 320 120, 480 170 S 760 300, 920 240 1140 130 1240 80"
          stroke="var(--ivory)"
          strokeOpacity="0.14"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="2 10"
        />

        {/* Animated dashed route line. */}
        <path
          className="hero-journey-route"
          d="M -20 220 C 160 150, 320 120, 480 170 S 760 300, 920 240 1140 130 1240 80"
          stroke="url(#heroRouteGrad)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 14"
        />

        {/* Studio highlight gliding along the path. */}
        <g className="hero-journey-studio">
          <circle r="38" fill="url(#heroRouteHighlight)" />
        </g>

        {/* Four location pings, evenly distributed along the route.
            Coordinates align with the curve's inflection points. */}
        <g className="hero-journey-pings">
          <g transform="translate(260 130)" className="hero-journey-ping hero-journey-ping-1">
            <circle r="20" fill="url(#heroPingGrad)" className="hero-journey-ping-halo" />
            <circle r="3.4" fill="var(--gold)" />
          </g>
          <g transform="translate(540 200)" className="hero-journey-ping hero-journey-ping-2">
            <circle r="20" fill="url(#heroPingGrad)" className="hero-journey-ping-halo" />
            <circle r="3.4" fill="var(--gold)" />
          </g>
          <g transform="translate(820 270)" className="hero-journey-ping hero-journey-ping-3">
            <circle r="20" fill="url(#heroPingGrad)" className="hero-journey-ping-halo" />
            <circle r="3.4" fill="var(--gold)" />
          </g>
          <g transform="translate(1080 170)" className="hero-journey-ping hero-journey-ping-4">
            <circle r="20" fill="url(#heroPingGrad)" className="hero-journey-ping-halo" />
            <circle r="3.2" fill="var(--gold-soft)" />
          </g>
        </g>
      </svg>

      {/* Narrative labels — 4 slots × 2 words, each with a different
          motion direction so the page reads as choreographed, not
          mechanical. Each label is paired with the ping at the same
          numbered position; the second word cross-fades in to suggest
          a choice being made in real time.
            slot 1 — slide from left  (Wine → Local stop)
            slot 2 — fade & rise      (Coast → Celebration)
            slot 3 — blur to sharp    (Hidden places → Group journey)
            slot 4 — slide from right (Vineyard → Proposal moment)
      */}
      <div className="hero-journey-labels">
        {/* Slot 1 — top-left, slide right */}
        <span
          className="hero-journey-label hero-journey-label-1a hero-journey-dir-slide-right"
          style={{ left: "20%", top: "16%" }}
        >
          Wine
        </span>
        <span
          className="hero-journey-label hero-journey-label-1b hero-journey-dir-slide-right"
          style={{ left: "20%", top: "16%" }}
        >
          Local stop
        </span>

        {/* Slot 2 — left-mid, fade & rise */}
        <span
          className="hero-journey-label hero-journey-label-2a hero-journey-dir-rise"
          style={{ left: "42%", top: "26%" }}
        >
          Coast
        </span>
        <span
          className="hero-journey-label hero-journey-label-2b hero-journey-dir-rise"
          style={{ left: "42%", top: "26%" }}
        >
          Celebration
        </span>

        {/* Slot 3 — mid-right, blur to sharp */}
        <span
          className="hero-journey-label hero-journey-label-3a hero-journey-dir-blur"
          style={{ left: "64%", top: "35%" }}
        >
          Hidden places
        </span>
        <span
          className="hero-journey-label hero-journey-label-3b hero-journey-dir-blur"
          style={{ left: "64%", top: "35%" }}
        >
          Group journey
        </span>

        {/* Slot 4 — top-right, slide from right */}
        <span
          className="hero-journey-label hero-journey-label-4a hero-journey-label-right hero-journey-dir-slide-left"
          style={{ right: "6%", top: "21%" }}
        >
          Vineyard
        </span>
        <span
          className="hero-journey-label hero-journey-label-4b hero-journey-label-right hero-journey-dir-slide-left"
          style={{ right: "6%", top: "21%" }}
        >
          Proposal moment
        </span>
      </div>
    </div>
  );
}
