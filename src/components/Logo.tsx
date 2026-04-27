import logoTealAsset from "@/assets/yes-logo-approved.png";
import logoGoldAsset from "@/assets/yes-logo-approved-gold-silk.png";

type LogoTheme = "teal-on-ivory" | "gold-on-charcoal";

const SOURCES: Record<LogoTheme, string> = {
  "teal-on-ivory": logoTealAsset,
  "gold-on-charcoal": logoGoldAsset,
};

/**
 * Logo — shared brand wordmark.
 *
 * Theme drives both the artwork and the matching .logo-mark--* utility
 * class, so consumers can never accidentally pair (e.g.) the teal artwork
 * with the gold-on-charcoal filter recipe. Sizing is controlled by the
 * parent via `className`.
 */
export function Logo({
  theme = "teal-on-ivory",
  className = "block h-[60px] md:h-[64px] lg:h-[68px] w-auto select-none",
  alt = "YES experiences PORTUGAL",
  loading,
  fetchPriority,
}: {
  theme?: LogoTheme;
  className?: string;
  alt?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}) {
  return (
    <img
      src={SOURCES[theme]}
      width={909}
      height={579}
      alt={alt}
      className={`logo-mark logo-mark--${theme} ${className}`}
      draggable={false}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
    />
  );
}

export default Logo;
