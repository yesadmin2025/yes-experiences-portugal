import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "./Logo";
import { Menu, X } from "lucide-react";

const navLinks = [
  { to: "/experiences", label: "Experiences" },
  { to: "/day-tours", label: "Day Tours" },
  { to: "/multi-day", label: "Multi-Day Journeys" },
  { to: "/proposals", label: "Proposals & Celebrations" },
  { to: "/corporate", label: "Corporate" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-black/[0.05] shadow-[0_1px_0_0_rgba(201,169,106,0.22),0_10px_28px_-18px_rgba(15,23,42,0.10)] opacity-0 animate-[headerFade_900ms_ease-out_forwards]">
      <div className="container-x">
        <div className="flex items-center justify-between h-[84px] md:h-[96px] lg:h-[104px]">
          {/* Logo — left, vertically centered. Tight header lockup with
              enlarged PORTUGAL aligned to the YES+experiences midline. */}
          <Link
            to="/"
            className="flex-shrink-0 inline-flex items-center h-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="YES experiences PORTUGAL — Home"
          >
            <Logo layout="header" size="sm" className="block" />
          </Link>

          {/* Desktop nav — right, vertically centered.
              Default uses charcoal (#2E2E2E, 13.58:1) instead of charcoal-soft
              for stronger small-text contrast. Hover/active = teal (7.60:1).
              Focus-visible ring guarantees keyboard accessibility (WCAG 2.4.7). */}
          <nav className="hidden lg:flex items-center h-full gap-10 text-[11px] uppercase tracking-[0.24em] font-normal leading-none">
            {navLinks.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="inline-flex items-center text-[color:var(--charcoal)] hover:text-[color:var(--teal)] transition-colors duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-4 focus-visible:ring-offset-white"
                activeProps={{ className: "text-[color:var(--teal)]" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button — right, vertically centered.
              Uses charcoal (13.58:1) for max icon contrast on white. */}
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
          <div className="container-x py-6 flex flex-col gap-5 text-sm">
            {navLinks.map((n) => (
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
          </div>
        </div>
      )}
    </header>
  );
}
