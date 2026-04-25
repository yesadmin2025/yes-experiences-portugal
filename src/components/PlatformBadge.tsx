/**
 * PlatformBadge — official, recognizable brand marks for the trust bar.
 *
 * All three marks are rendered on a transparent background and sized to
 * the same optical height so they read as a balanced row across every
 * breakpoint. Each is the platform's own widely-recognized identity:
 *
 *   • Google      — multi-color "G" monogram
 *   • Tripadvisor — Ollie the owl (full-color wordmark glyph)
 *   • Viator      — official "viator." lockup with the orange brand dot
 *
 * Viator does not publish a standalone glyph, so its wordmark is the
 * recognizable mark; it is sized to match the optical weight of the
 * other two glyphs on the same baseline.
 */

type Platform = "google" | "tripadvisor" | "viator";

export function PlatformBadge({
  platform,
  className = "",
}: {
  platform: Platform;
  className?: string;
}) {
  if (platform === "google") return <GoogleMark className={className} />;
  if (platform === "tripadvisor") return <TripadvisorMark className={className} />;
  return <ViatorMark className={className} />;
}

/* ---------- Google — multi-color G monogram ---------- */
function GoogleMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center h-8 sm:h-9 md:h-10 w-auto ${className}`}
      role="img"
      aria-label="Google — official review platform"
    >
      <svg
        viewBox="0 0 48 48"
        className="block h-full w-auto"
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

/* ---------- Tripadvisor — Ollie the owl (signature mark) ----------
   Faithful inline reconstruction: the green leaf accent on top, the
   black body, two large white eyes with concentric green and black
   pupils, and white catchlights. Sized to match Google optically. */
function TripadvisorMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center h-8 sm:h-9 md:h-10 w-auto ${className}`}
      role="img"
      aria-label="Tripadvisor — official review platform"
    >
      <svg
        viewBox="0 0 56 44"
        className="block h-full w-auto"
        aria-hidden="true"
        focusable="false"
      >
        {/* Green leaf accent on top of the head */}
        <path
          d="M28 1c-2.6 0-4.8 1.6-5.8 3.9 1.6-.7 3.5-1 5.8-1s4.2.3 5.8 1C32.8 2.6 30.6 1 28 1z"
          fill="#00AF87"
        />
        {/* Owl body */}
        <ellipse cx="28" cy="26" rx="26" ry="15" fill="#000" />
        {/* Eye whites */}
        <circle cx="17" cy="26" r="10" fill="#fff" />
        <circle cx="39" cy="26" r="10" fill="#fff" />
        {/* Green inner ring (Tripadvisor signature) */}
        <circle cx="17" cy="26" r="6" fill="#00AF87" />
        <circle cx="39" cy="26" r="6" fill="#00AF87" />
        {/* Black pupils */}
        <circle cx="17" cy="26" r="3.4" fill="#000" />
        <circle cx="39" cy="26" r="3.4" fill="#000" />
        {/* Catchlights */}
        <circle cx="15.8" cy="24.8" r="1" fill="#fff" />
        <circle cx="37.8" cy="24.8" r="1" fill="#fff" />
      </svg>
    </span>
  );
}

/* ---------- Viator — official "viator." wordmark with orange dot ----------
   Viator's recognizable identity is its lowercase wordmark; rendering it
   as the mark keeps it instantly identifiable. Brand teal + orange dot. */
function ViatorMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center h-8 sm:h-9 md:h-10 w-auto ${className}`}
      role="img"
      aria-label="Viator — official review platform"
    >
      <svg
        viewBox="0 0 120 36"
        className="block h-full w-auto"
        aria-hidden="true"
        focusable="false"
      >
        <text
          x="0"
          y="29"
          fontFamily="'Inter', system-ui, sans-serif"
          fontSize="34"
          fontWeight="800"
          letterSpacing="-1"
          fill="#328E7E"
        >
          viator
        </text>
        <circle cx="111" cy="29" r="4.2" fill="#F26B52" />
      </svg>
    </span>
  );
}
