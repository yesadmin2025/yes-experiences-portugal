/**
 * PlatformBadge — official brand marks for the trust bar.
 *
 * Uses the actual high-resolution logo files supplied by the brand. Each
 * platform gets a per-mark optical scale so square monograms (Google,
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
      style={{ height: `${scale * 100}%` }}
      className={`block w-auto object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
