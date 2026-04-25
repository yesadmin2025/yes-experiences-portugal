/**
 * PlatformBadge — official, recognizable brand marks for the trust bar.
 *
 * Uses the actual high-resolution logo files supplied by the brand, rendered
 * on a transparent background and sized to a uniform optical height so they
 * read as a balanced row across every breakpoint.
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

const SOURCES: Record<Platform, { src: string; label: string }> = {
  google: { src: googleLogo, label: "Google" },
  tripadvisor: { src: tripadvisorLogo, label: "Tripadvisor" },
  viator: { src: viatorLogo, label: "Viator" },
  getyourguide: { src: getyourguideLogo, label: "GetYourGuide" },
  trustpilot: { src: trustpilotLogo, label: "Trustpilot" },
};

export function PlatformBadge({
  platform,
  className = "",
}: {
  platform: Platform;
  className?: string;
}) {
  const { src, label } = SOURCES[platform];
  return (
    <img
      src={src}
      alt={`${label} — official review platform`}
      loading="lazy"
      decoding="async"
      className={`block h-full w-auto object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
