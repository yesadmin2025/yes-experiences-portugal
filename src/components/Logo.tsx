interface LogoProps {
  variant?: "default" | "light";
  size?: "sm" | "md" | "lg";
}

export function Logo({ variant = "default", size = "md" }: LogoProps) {
  const teal = variant === "light" ? "#FAF8F3" : "#295B61";
  const charcoal = variant === "light" ? "#FAF8F3" : "#2E2E2E";
  const gold = "#C9A96A";

  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.2 : 1;

  return (
    <div
      className="flex flex-col items-center leading-none select-none"
      style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
    >
      <span
        className="script"
        style={{
          color: teal,
          fontSize: "44px",
          lineHeight: 0.9,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        Yes
      </span>
      <span
        className="serif"
        style={{
          color: charcoal,
          fontSize: "20px",
          fontWeight: 400,
          letterSpacing: "0.01em",
          marginTop: "-2px",
        }}
      >
        experiences
      </span>
      <div className="flex items-center gap-2 mt-1">
        <span style={{ width: 14, height: 1, background: gold }} />
        <span
          style={{
            color: gold,
            fontSize: "9px",
            letterSpacing: "0.4em",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
          }}
        >
          PORTUGAL
        </span>
        <span style={{ width: 14, height: 1, background: gold }} />
      </div>
    </div>
  );
}
