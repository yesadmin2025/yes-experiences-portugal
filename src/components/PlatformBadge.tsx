/**
 * PlatformBadge — recognizable brand marks for the trust bar.
 *
 * All three badges share an identical chassis (height, padding, radius,
 * border, shadow, gap) so they sit on a single visual baseline at every
 * breakpoint. Only the inner glyph + wordmark differ. Glyphs are rendered
 * at a fixed pixel box (16×16) and wordmarks share a fixed type size, so
 * widths feel matched even though each brand mark is a different shape.
 */

type Platform = "google" | "tripadvisor" | "viator";

const CHASSIS =
  // Identical pill across all three: same height, same padding, same gap,
  // same radius, same hairline border, same micro-shadow. The fixed h-7
  // (28px) guarantees a perfect baseline regardless of glyph proportions.
  "inline-flex items-center justify-center gap-1.5 h-7 px-3 " +
  "bg-white border border-[color:var(--border)] rounded-full " +
  "shadow-[0_1px_0_0_rgba(46,46,46,0.04)] " +
  "leading-none whitespace-nowrap select-none";

const GLYPH = "inline-flex items-center justify-center w-4 h-4 shrink-0";
const WORDMARK = "text-[11px] font-semibold tracking-wide leading-none";

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
      className={`${CHASSIS} ${className}`}
      role="img"
      aria-label="Google — official review platform"
    >
      <span className={GLYPH} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 48 48" focusable="false">
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
      <span className={`${WORDMARK} text-[#3c4043]`} aria-hidden="true">
        Google
      </span>
    </span>
  );
}

/* ---------- Tripadvisor — owl glyph + wordmark ---------- */
function TripadvisorBadge({ className }: { className?: string }) {
  return (
    <span
      className={`${CHASSIS} ${className}`}
      role="img"
      aria-label="Tripadvisor — official review platform"
    >
      <span className={GLYPH} aria-hidden="true">
        {/* Stylised owl mark — sized inside the same 16×16 box as Google. */}
        <svg width="16" height="11" viewBox="0 0 28 18" focusable="false">
          <ellipse cx="14" cy="9" rx="13" ry="7.5" fill="#000" />
          <circle cx="9" cy="9" r="4.6" fill="#fff" />
          <circle cx="19" cy="9" r="4.6" fill="#fff" />
          <circle cx="9" cy="9" r="2.1" fill="#000" />
          <circle cx="19" cy="9" r="2.1" fill="#000" />
          <circle cx="8.4" cy="8.4" r="0.7" fill="#fff" />
          <circle cx="18.4" cy="8.4" r="0.7" fill="#fff" />
          <circle cx="14" cy="2.3" r="1.4" fill="#00AF87" />
        </svg>
      </span>
      <span className={`${WORDMARK} text-[#000]`} aria-hidden="true">
        Tripadvisor
      </span>
    </span>
  );
}

/* ---------- Viator — teal wordmark with the trailing dot ---------- */
function ViatorBadge({ className }: { className?: string }) {
  return (
    <span
      className={`${CHASSIS} ${className}`}
      role="img"
      aria-label="Viator — official review platform"
    >
      {/* Viator has no compact glyph; we use a small teal dot in the
          glyph slot so the chassis width matches the other two badges. */}
      <span className={GLYPH} aria-hidden="true">
        <span className="block w-2 h-2 rounded-full bg-[#328E7E]" />
      </span>
      <span className={`${WORDMARK} text-[#328E7E]`} aria-hidden="true">
        viator<span className="text-[#F26B52]">.</span>
      </span>
    </span>
  );
}
