interface LogoProps {
  /** Visual size of the lockup. Drives the YES wordmark height. */
  size?: "sm" | "md" | "lg";
  /** "default" uses brand teal + charcoal + gold. "light" is all-ivory for dark surfaces. */
  variant?: "default" | "light";
  className?: string;
}

/**
 * Typographic YES experiences PORTUGAL lockup.
 *
 * Built as live text instead of an image so the brand colours are exact
 * (teal #295B61, charcoal #2E2E2E, gold #C9A96A, ivory #FAF8F3) and the
 * "PORTUGAL" baseline is properly sized — never the small, baked-in
 * caption from the raster source.
 */
const SIZES = {
  sm: {
    yes: "text-[44px] md:text-[52px] lg:text-[60px]",
    exp: "text-[15px] md:text-[17px] lg:text-[19px]",
    portugal: "text-[10px] md:text-[11px] lg:text-[12px]",
    rule: "w-8 md:w-10",
    gap: "gap-1.5 md:gap-2",
  },
  md: {
    yes: "text-[64px] md:text-[76px]",
    exp: "text-[20px] md:text-[24px]",
    portugal: "text-[12px] md:text-[13px]",
    rule: "w-12",
    gap: "gap-2",
  },
  lg: {
    yes: "text-[84px] md:text-[104px]",
    exp: "text-[26px] md:text-[32px]",
    portugal: "text-[14px] md:text-[16px]",
    rule: "w-16",
    gap: "gap-2.5",
  },
};

export function Logo({
  size = "sm",
  variant = "default",
  className = "",
}: LogoProps) {
  const s = SIZES[size];

  const teal = variant === "light" ? "var(--ivory)" : "var(--teal)";
  const charcoal = variant === "light" ? "var(--ivory)" : "var(--charcoal)";
  const gold = variant === "light" ? "var(--gold)" : "var(--gold)";
  const portugalColor = variant === "light" ? "var(--gold)" : "var(--gold)";

  return (
    <span
      className={`inline-flex flex-col items-center leading-none select-none ${s.gap} ${className}`}
      role="img"
      aria-label="YES experiences PORTUGAL"
      translate="no"
    >
      {/* YES — script wordmark */}
      <span
        className={`script ${s.yes} font-bold leading-none`}
        style={{
          color: teal,
          letterSpacing: "-0.02em",
          textShadow: variant === "light" ? "none" : undefined,
        }}
        aria-hidden
      >
        YES
      </span>

      {/* experiences — refined serif */}
      <span
        className={`serif ${s.exp} italic leading-none`}
        style={{
          color: charcoal,
          letterSpacing: "0.005em",
          marginTop: "-0.15em",
        }}
        aria-hidden
      >
        experiences
      </span>

      {/* gold rule + PORTUGAL — properly sized caption band */}
      <span className="inline-flex items-center gap-2.5 mt-1.5">
        <span
          className={`block h-px ${s.rule}`}
          style={{ background: gold, opacity: 0.85 }}
          aria-hidden
        />
        <span
          className={`${s.portugal} font-medium`}
          style={{
            color: portugalColor,
            letterSpacing: "0.42em",
            paddingLeft: "0.42em", // optical balance against the tracking
            fontFamily: "var(--font-sans)",
          }}
          aria-hidden
        >
          PORTUGAL
        </span>
        <span
          className={`block h-px ${s.rule}`}
          style={{ background: gold, opacity: 0.85 }}
          aria-hidden
        />
      </span>
    </span>
  );
}
