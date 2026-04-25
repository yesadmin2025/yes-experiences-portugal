import logoSrc from "@/assets/yes-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
  className?: string;
}

const sizes = {
  sm: "h-12 md:h-14 lg:h-[68px]",
  md: "h-20 md:h-24",
  lg: "h-28 md:h-36",
};

export function Logo({ size = "md", variant = "default", className = "" }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt="YES experiences PORTUGAL"
      width={909}
      height={579}
      className={`${sizes[size]} w-auto select-none ${
        variant === "light" ? "brightness-0 invert opacity-95" : ""
      } ${className}`}
      draggable={false}
      decoding="sync"
      loading="eager"
      fetchPriority="high"
      style={{
        imageRendering: "auto",
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
        filter: "contrast(1.04)",
      }}
    />
  );
}
