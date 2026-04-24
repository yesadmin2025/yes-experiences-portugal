import logoSrc from "@/assets/yes-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  /** Kept for API compatibility — the official logo is never recolored. */
  variant?: "default" | "light";
  className?: string;
}

const sizes = {
  sm: "h-14 md:h-16",
  md: "h-24 md:h-28",
  lg: "h-32 md:h-40",
};

export function Logo({ size = "md", className = "" }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt="YES experiences PORTUGAL"
      width={909}
      height={579}
      className={`${sizes[size]} w-auto select-none ${className}`}
      draggable={false}
      decoding="async"
      loading="eager"
      style={{ imageRendering: "auto" }}
    />
  );
}
