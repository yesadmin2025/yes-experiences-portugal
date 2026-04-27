/**
 * PlatformBadge — official brand marks for the trust bar.
 *
 * Rendered in a premium monochrome treatment: original platform colors are
 * neutralized via CSS filters so Google, Tripadvisor, Viator, GetYourGuide
 * and Trustpilot all read as soft charcoal marks. This keeps the trust row
 * curated and editorial — never a marketplace badge wall.
 *
 * Each platform gets a per-mark optical scale so square monograms (Google,
 * Tripadvisor, GetYourGuide) and wide wordmarks (Viator, Trustpilot)
 * read at the same visual weight in a single row.
 */

import googleLogo from "@/assets/platform-google.png";
import tripadvisorLogo from "@/assets/platform-tripadvisor.png";
import viatorLogo from "@/assets/platform-viator.png";
import getyourguideLogo from "@/assets/platform-getyourguide.png";
import trustpilotLogo from "@/assets/platform-trustpilot.svg";

export type Platform =
  | "google"
  | "tripadvisor"
  | "viator"
  | "getyourguide"
  | "trustpilot";

// Per-mark optical scale relative to the container height. Wordmarks read
// large at full height because they're wide; monograms need extra height
// to feel balanced against them.
const SOURCES: Record<
  Platform,
  { src: string; label: string; scale: number }
> = {
  google: { src: googleLogo, label: "Google", scale: 1 },
  tripadvisor: { src: tripadvisorLogo, label: "Tripadvisor", scale: 1 },
  viator: { src: viatorLogo, label: "Viator", scale: 0.6 },
  getyourguide: { src: getyourguideLogo, label: "GetYourGuide", scale: 1 },
  trustpilot: { src: trustpilotLogo, label: "Trustpilot", scale: 0.78 },
};

// Monochrome treatment: strip color, lift midtones, and tone toward soft
// charcoal (var(--charcoal-soft)) so every mark reads as a single neutral weight.
// `brightness(0)` collapses the artwork to pure black, then `invert(.42)`
// lifts it to ~#6B charcoal. Slight contrast boost preserves edge clarity
// on small marks. Hover deepens to dark charcoal (var(--charcoal)) for a quiet
// premium response.
const MONO_FILTER =
  "brightness(0) invert(0.42) contrast(1.05)";
const MONO_FILTER_HOVER =
  "brightness(0) invert(0.18) contrast(1.05)";

export function PlatformBadge({
  platform,
  className = "",
}: {
  platform: Platform;
  className?: string;
}) {
  const { src, label, scale } = SOURCES[platform];
  return (
    <img
      src={src}
      alt={`${label} — official review platform`}
      loading="lazy"
      decoding="async"
      style={{
        height: `${scale * 100}%`,
        filter: MONO_FILTER,
        transition: "filter 600ms ease, opacity 600ms ease",
        opacity: 0.85,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = MONO_FILTER_HOVER;
        e.currentTarget.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = MONO_FILTER;
        e.currentTarget.style.opacity = "0.85";
      }}
      className={`block w-auto object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
