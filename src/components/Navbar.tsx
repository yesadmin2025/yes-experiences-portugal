import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import logoTeal from "@/assets/yes-logo-approved.png";

// Desktop nav — full editorial set, kept compact in tracking so all 8
// items fit gracefully on a single row at lg+ widths.
const desktopLinks = [
  { to: "/experiences", label: "Experiences" },
  { to: "/builder", label: "Experience Studio" },
  { to: "/multi-day", label: "Multi-Day Journeys" },
  { to: "/corporate", label: "Corporate" },
  { to: "/proposals", label: "Proposals & Celebrations" },
  { to: "/local-stories", label: "Local Stories" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

// Mobile uses slightly different labels per the brief (more inviting on small
// screens) — "Design Your Experience" instead of the studio name, and
// Local Stories is intentionally omitted to keep the mobile menu focused.
const mobileLinks = [
  { to: "/experiences", label: "Experiences" },
  { to: "/builder", label: "Design Your Experience" },
  { to: "/multi-day", label: "Multi-Day Journeys" },
  { to: "/corporate", label: "Corporate" },
  { to: "/proposals", label: "Proposals & Celebrations" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-black/[0.06] shadow-[0_1px_0_0_rgba(201,169,106,0.18),0_10px_28px_-18px_rgba(15,23,42,0.10)] opacity-0 animate-[headerFade_900ms_ease-out_forwards]">
      <div className="container-x">
        <div className="flex items-center justify-between h-[88px] md:h-[100px] lg:h-[108px]">
          {/* Official master logo — uploaded brand asset, used as-is.
              Sized for premium presence with breathing room in the header. */}
          <Link
            to="/"
            className="flex-shrink-0 inline-flex items-center h-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="YES experiences PORTUGAL — Home"
          >
            <img
              src={logoTeal}
              width={909}
              height={579}
              alt="YES experiences PORTUGAL"
              className="block h-[64px] md:h-[76px] lg:h-[84px] w-auto select-none"
              draggable={false}
              fetchPriority="high"
              decoding="async"
              style={{ imageRendering: "auto" }}
            />
          </Link>

          {/* Desktop nav + CTA — right side, vertically centered.
              Default text: charcoal (#2E2E2E, 13.58:1). Hover/active: teal (7.60:1).
              Tracking tightened slightly (0.20em) so all 8 labels fit on one
              row at lg+ without wrapping. The CTA button is the calm,
              conversion-focused anchor — teal fill, fine gold border. */}
          <nav className="hidden lg:flex items-center h-full gap-7 xl:gap-9 text-[11px] uppercase tracking-[0.2em] font-normal leading-none">
            {desktopLinks.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="inline-flex items-center text-[color:var(--charcoal)] hover:text-[color:var(--teal)] transition-colors duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-4 focus-visible:ring-offset-white"
                activeProps={{ className: "text-[color:var(--teal)]" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/builder"
              className="nav-cta ml-2 group inline-flex items-center gap-2.5 pl-4 pr-3 py-3 text-[10.5px] uppercase font-medium"
            >
              <span aria-hidden className="nav-cta-pulse" />
              <span className="nav-cta-label">Design &amp; Secure</span>
              <span className="nav-cta-arrow">
                <span aria-hidden className="nav-cta-halo is-ambient" />
                <span aria-hidden className="nav-cta-halo is-close" />
                <ArrowRight size={13} />
              </span>
            </Link>
          </nav>

          {/* Mobile menu button — right, vertically centered. */}
          <button
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 -mr-2 text-[color:var(--charcoal)] hover:text-[color:var(--teal)] transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="lg:hidden bg-white border-t border-black/[0.05]"
        >
          <div className="container-x py-7 flex flex-col gap-5 text-sm">
            {mobileLinks.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-[color:var(--charcoal)] hover:text-[color:var(--teal)] transition-colors uppercase tracking-[0.2em] text-[12px] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                activeProps={{ className: "text-[color:var(--teal)]" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/builder"
              onClick={() => setOpen(false)}
              className="nav-cta group mt-3 inline-flex items-center justify-center gap-2.5 pl-4 pr-3.5 py-3.5 text-[11px] uppercase font-medium"
            >
              <span aria-hidden className="nav-cta-pulse" />
              <span className="nav-cta-label" style={{ letterSpacing: "0.22em" }}>Design &amp; Secure Your Experience</span>
              <span className="nav-cta-arrow">
                <span aria-hidden className="nav-cta-halo is-ambient" />
                <span aria-hidden className="nav-cta-halo is-close" />
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
