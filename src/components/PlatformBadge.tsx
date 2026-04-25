/**
 * PlatformBadge — recognizable brand marks for the trust bar.
 *
 * Each badge is a self-contained, accessible inline SVG that visually
 * references the platform's well-known wordmark/glyph (multi-color "G"
 * for Google, owl mark for Tripadvisor, teal-on-white wordmark for
 * Viator). They are sized consistently so the three sit on a clean
 * visual baseline under the platform name.
 */

type Platform = "google" | "tripadvisor" | "viator";

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

/* ---------- Google — full-color G in a hairline pill ---------- */
function GoogleBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 bg-white border border-[color:var(--border)] rounded-full px-3.5 py-1.5 shadow-[0_1px_0_0_rgba(46,46,46,0.04)] ${className}`}
      role="img"
      aria-label="Google — official review platform"
    >
      <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
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
      <span className="text-[10px] font-medium tracking-wide text-[#3c4043]">Google</span>
    </span>
  );
}

/* ---------- Tripadvisor — owl glyph + wordmark ---------- */
function TripadvisorBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 bg-white border border-[color:var(--border)] rounded-full px-3.5 py-1.5 shadow-[0_1px_0_0_rgba(46,46,46,0.04)] ${className}`}
      role="img"
      aria-label="Tripadvisor — official review platform"
    >
      {/* Stylised owl mark — two eyes inside a rounded body. */}
      <svg width="20" height="14" viewBox="0 0 28 18" aria-hidden="true" focusable="false">
        <ellipse cx="14" cy="9" rx="13" ry="7.5" fill="#000" />
        <circle cx="9" cy="9" r="4.6" fill="#fff" />
        <circle cx="19" cy="9" r="4.6" fill="#fff" />
        <circle cx="9" cy="9" r="2.1" fill="#000" />
        <circle cx="19" cy="9" r="2.1" fill="#000" />
        <circle cx="8.4" cy="8.4" r="0.7" fill="#fff" />
        <circle cx="18.4" cy="8.4" r="0.7" fill="#fff" />
        {/* Small green dot — the trademark "leaf" accent */}
        <circle cx="14" cy="2.3" r="1.4" fill="#00AF87" />
      </svg>
      <span className="text-[10px] font-semibold tracking-wide text-[#000]">Tripadvisor</span>
    </span>
  );
}

/* ---------- Viator — teal wordmark with the trailing "dot" ---------- */
function ViatorBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 bg-white border border-[color:var(--border)] rounded-full px-3.5 py-1.5 shadow-[0_1px_0_0_rgba(46,46,46,0.04)] ${className}`}
      role="img"
      aria-label="Viator — official review platform"
    >
      <span
        className="text-[11px] font-bold tracking-tight text-[#328E7E] leading-none"
        aria-hidden="true"
      >
        viator
        <span className="text-[#F26B52]">.</span>
      </span>
      <span className="text-[8.5px] uppercase tracking-[0.18em] text-[#6B6B6B]" aria-hidden="true">
        a Tripadvisor company
      </span>
    </span>
  );
}
