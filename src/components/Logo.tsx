interface LogoProps {
  /** Visual size of the lockup. Drives the YES wordmark height. */
  size?: "sm" | "md" | "lg";
  /** "default" uses brand teal + charcoal + gold. "light" is all-ivory for dark surfaces. */
  variant?: "default" | "light";
  /**
   * "stack" = full editorial lockup with gold rules and small PORTUGAL caption.
   * "header" = tight horizontal-friendly lockup tuned for the navbar:
   *   smaller YES + experiences, but a noticeably larger, centered PORTUGAL
   *   band, no decorative rules.
   */
  layout?: "stack" | "header";
  className?: string;
}

/**
 * Typographic YES experiences PORTUGAL lockup.
 *
 * Built as live text instead of an image so the brand colours are exact
 * (teal #295B61, charcoal #2E2E2E, gold #C9A96A, ivory #FAF8F3).
 */
const STACK_SIZES = {
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

/** Header-tuned: tighter YES/experiences, larger centered PORTUGAL. */
const HEADER_SIZES = {
  sm: {
    yes: "text-[34px] md:text-[40px] lg:text-[44px]",
    exp: "text-[12px] md:text-[14px] lg:text-[15px]",
    portugal: "text-[12px] md:text-[13px] lg:text-[14px]",
  },
  md: {
    yes: "text-[44px] md:text-[52px] lg:text-[58px]",
    exp: "text-[15px] md:text-[17px] lg:text-[18px]",
    portugal: "text-[13px] md:text-[14px] lg:text-[15px]",
  },
  lg: {
    yes: "text-[56px] md:text-[68px] lg:text-[76px]",
    exp: "text-[18px] md:text-[20px] lg:text-[22px]",
    portugal: "text-[14px] md:text-[15px] lg:text-[16px]",
  },
};

export function Logo({
  size = "sm",
  variant = "default",
  layout = "stack",
  className = "",
}: LogoProps) {
  const isLight = variant === "light";
  const yesColor = isLight ? "var(--ivory)" : "var(--teal)";
  const expColor = isLight ? "var(--ivory)" : "var(--charcoal)";
  const gold = "var(--gold)";

  if (layout === "header") {
    const s = HEADER_SIZES[size];
    // Tight header lockup: YES + experiences stacked on the left, an
    // enlarged centered PORTUGAL band on the right, vertically aligned.
    return (
      <span
        className={`inline-flex items-center leading-none select-none gap-3 md:gap-4 ${className}`}
        role="img"
        aria-label="YES experiences PORTUGAL"
        translate="no"
      >
        <span className="inline-flex flex-col items-start leading-none">
          <span
            className={`script ${s.yes} font-bold leading-none`}
            style={{ color: yesColor, letterSpacing: "-0.02em" }}
            aria-hidden
          >
            YES
          </span>
          <span
            className={`serif ${s.exp} italic leading-none`}
            style={{
              color: expColor,
              letterSpacing: "0.01em",
              marginTop: "-0.05em",
              opacity: isLight ? 0.92 : 1,
            }}
            aria-hidden
          >
            experiences
          </span>
        </span>

        {/* Vertical gold divider for an editorial seam */}
        <span
          aria-hidden
          className="block self-stretch w-px"
          style={{ background: gold, opacity: 0.55 }}
        />

        {/* PORTUGAL — enlarged, centered vertically against YES+experiences */}
        <span
          className={`${s.portugal} font-medium inline-flex items-center`}
          style={{
            color: gold,
            letterSpacing: "0.42em",
            paddingLeft: "0.42em",
            fontFamily: "var(--font-sans)",
          }}
          aria-hidden
        >
          PORTUGAL
        </span>
      </span>
    );
  }

  // Default: editorial stacked lockup with gold rules.
  const s = STACK_SIZES[size];
  const align = isLight ? "items-start" : "items-center";

  return (
    <span
      className={`inline-flex flex-col ${align} leading-none select-none ${s.gap} ${className}`}
      role="img"
      aria-label="YES experiences PORTUGAL"
      translate="no"
    >
      <span
        className={`script ${s.yes} font-bold leading-none`}
        style={{
          color: yesColor,
          letterSpacing: "-0.02em",
          textShadow: isLight ? "none" : undefined,
        }}
        aria-hidden
      >
        YES
      </span>

      <span
        className={`serif ${s.exp} italic leading-none`}
        style={{
          color: expColor,
          letterSpacing: "0.005em",
          marginTop: "-0.15em",
          opacity: isLight ? 0.92 : 1,
        }}
        aria-hidden
      >
        experiences
      </span>

      <span className="inline-flex items-center gap-2.5 mt-1.5">
        <span
          className={`block h-px ${s.rule}`}
          style={{ background: gold, opacity: 0.85 }}
          aria-hidden
        />
        <span
          className={`${s.portugal} font-medium`}
          style={{
            color: gold,
            letterSpacing: "0.42em",
            paddingLeft: "0.42em",
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
