/**
 * PlatformBadge — recognizable brand glyphs for the trust bar.
 *
 * Glyph-only marks (no wordmarks) on a transparent background. All three
 * are rendered inside an identical fixed-size square so they share the
 * same optical weight and baseline regardless of the brand's natural
 * proportions. This matches the "just the badge" treatment used next to
 * the platform name in the trust bar.
 */

type Platform = "google" | "tripadvisor" | "viator";

// Fixed square slot — keeps Google / Tripadvisor / Viator visually
// matched in the trust-bar grid at every breakpoint.
const SLOT =
  "inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 " +
  "bg-transparent select-none";

export function PlatformBadge({
  platform,
  className = "",
}: {
  platform: Platform;
  className?: string;
}) {
  if (platform === "google") return <GoogleBadge className={className} />;
  if (platform === "tripadvisor") return <TripadvisorBadge className={className} />;
  return <ViatorBadge className={className} />;
}

/* ---------- Google — full-color G ---------- */
function GoogleBadge({ className }: { className?: string }) {
  return (
    <span
      className={`${SLOT} ${className}`}
      role="img"
      aria-label="Google — official review platform"
    >
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
    </span>
  );
}

/* ---------- Tripadvisor — owl glyph ---------- */
function TripadvisorBadge({ className }: { className?: string }) {
  return (
    <span
      className={`${SLOT} ${className}`}
      role="img"
      aria-label="Tripadvisor — official review platform"
    >
      <svg
        viewBox="0 0 32 22"
        className="w-full h-full"
        aria-hidden="true"
        focusable="false"
      >
        {/* Owl body */}
        <ellipse cx="16" cy="13" rx="15" ry="8.5" fill="#000" />
        {/* Eyes — outer white */}
        <circle cx="10.5" cy="13" r="5.2" fill="#fff" />
        <circle cx="21.5" cy="13" r="5.2" fill="#fff" />
        {/* Pupils */}
        <circle cx="10.5" cy="13" r="2.4" fill="#000" />
        <circle cx="21.5" cy="13" r="2.4" fill="#000" />
        {/* Catchlights */}
        <circle cx="9.8" cy="12.3" r="0.8" fill="#fff" />
        <circle cx="20.8" cy="12.3" r="0.8" fill="#fff" />
        {/* Trademark green leaf accent */}
        <circle cx="16" cy="3.3" r="1.8" fill="#00AF87" />
      </svg>
    </span>
  );
}

/* ---------- Viator — teal "v." monogram ---------- */
function ViatorBadge({ className }: { className?: string }) {
  // Viator's standalone glyph is the lowercase "v" + brand dot.
  // Rendered as inline type so it scales cleanly with the slot.
  return (
    <span
      className={`${SLOT} ${className}`}
      role="img"
      aria-label="Viator — official review platform"
    >
      <span
        className="font-bold leading-none tracking-tight text-[18px] sm:text-[20px] md:text-[22px] text-[#328E7E]"
        aria-hidden="true"
      >
        v<span className="text-[#F26B52]">.</span>
      </span>
    </span>
  );
}
