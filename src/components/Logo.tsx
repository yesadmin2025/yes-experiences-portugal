import logoSrc from "@/assets/yes-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
  className?: string;
}

const sizes = {
  sm: "h-14 md:h-16",
  md: "h-20 md:h-24",
  lg: "h-28 md:h-32",
};

export function Logo({ size = "md", variant = "default", className = "" }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt="YES experiences PORTUGAL"
      className={`${sizes[size]} w-auto select-none ${
        variant === "light" ? "brightness-0 invert opacity-95" : ""
      } ${className}`}
      draggable={false}
    />
  );
}
