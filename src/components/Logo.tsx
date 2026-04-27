import logoTeal from "@/assets/yes-logo-approved.png";

/**
 * Logo — shared brand wordmark used by Navbar and Footer.
 * Kept as a thin wrapper so future swaps (SVG variant, monochrome, etc.)
 * happen in one place. Sizing is controlled by the parent via className.
 */
export function Logo({
  className = "block h-[60px] md:h-[64px] lg:h-[68px] w-auto select-none",
  alt = "YES experiences PORTUGAL",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={logoTeal}
      width={909}
      height={579}
      alt={alt}
      className={className}
      draggable={false}
      fetchPriority="high"
      decoding="async"
      style={{ imageRendering: "auto", filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.4))" }}
    />
  );
}

export default Logo;
