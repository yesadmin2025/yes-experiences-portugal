import { Link } from "@tanstack/react-router";
import logoTealThin from "@/assets/yes-logo-approved-thin.png";
import logoGoldThin from "@/assets/yes-logo-approved-gold-silk-thin.png";

/**
 * Logo — single source of truth for the YES experiences PORTUGAL wordmark.
 *
 * Both header and footer MUST use this component. It guarantees:
 *   • Identical approved artwork (thin-stroke recut of the master).
 *   • Identical scaling ladder across breakpoints (60 / 64 / 68 px).
 *   • Identical natural aspect (1264×848 from the master file).
 *   • Color treatment driven only by `variant` ("teal" for light surfaces,
 *     "gold" for the dark footer surface), never overridden ad-hoc.
 *   • Consistent focus ring + accessible label + Link wrapping to "/".
 *
 * To change logo size, color, or focus styles SITE-WIDE, edit this file.
 * Do not import the raw PNGs anywhere else.
 */

export type LogoVariant = "teal" | "gold";

interface LogoProps {
  /** "teal" for light surfaces (header), "gold" for dark surfaces (footer). */
  variant: LogoVariant;
  /** Loading priority: "high" for above-the-fold header, "low" for footer. */
  priority?: "high" | "low";
  /** Optional className appended to the wrapper Link. */
  className?: string;
}

// Locked scaling ladder — applied identically wherever the logo appears.
// Tuned so the "PORTUGAL" wordmark below the YES lockup stays legible on
// mobile while preserving a calm ~70% bar-height ratio at every breakpoint.
const LOGO_SIZE_CLASS = "block h-[60px] md:h-[64px] lg:h-[68px] w-auto select-none";

// Natural artwork dimensions — preserved aspect ratio prevents CLS.
const NATURAL_WIDTH = 1264;
const NATURAL_HEIGHT = 848;

export function Logo({ variant, priority = "low", className = "" }: LogoProps) {
  const src = variant === "teal" ? logoTealThin : logoGoldThin;

  // Surface-aware focus ring tokens. Teal ring on light surfaces, gold ring
  // on the dark footer — both meet AA against their respective backgrounds.
  const focusRing =
    variant === "teal"
      ? "focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-white"
      : "focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-[color:var(--charcoal-deep)]";

  // Subtle, surface-aware optical lift. White hairline glow on light surface
  // mimics print-on-paper presence; warm halo on dark surface keeps the gold
  // wordmark from feeling pasted onto the charcoal field.
  const dropShadow =
    variant === "teal"
      ? "drop-shadow(0 1px 0 rgba(255,255,255,0.4))"
      : "drop-shadow(0 1px 0 rgba(0,0,0,0.25))";

  return (
    <Link
      to="/"
      className={`inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${focusRing} ${className}`}
      aria-label="YES experiences PORTUGAL — Home"
    >
      <img
        src={src}
        width={NATURAL_WIDTH}
        height={NATURAL_HEIGHT}
        alt="YES experiences PORTUGAL"
        className={LOGO_SIZE_CLASS}
        draggable={false}
        fetchPriority={priority}
        loading={priority === "high" ? "eager" : "lazy"}
        decoding="async"
        style={{ imageRendering: "auto", filter: dropShadow }}
      />
    </Link>
  );
}
