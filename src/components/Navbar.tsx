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
    <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-[color:var(--border)] shadow-[0_6px_24px_-18px_rgba(15,23,42,0.18)] opacity-0 animate-[headerFade_700ms_ease-out_forwards]">
      <div className="container-x">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo — left */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center"
            aria-label="YES experiences PORTUGAL — Home"
          >
            <Logo size="sm" />
          </Link>

          {/* Desktop nav — right */}
          <nav className="hidden lg:flex items-center gap-9 text-[11px] uppercase tracking-[0.22em] font-medium">
            {navLinks.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-[color:var(--charcoal)] hover:text-[color:var(--teal)] transition-colors duration-300"
                activeProps={{ className: "text-[color:var(--teal)]" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button — right, vertically centered */}
          <button
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 -mr-2 text-[color:var(--charcoal)] hover:text-[color:var(--teal)] transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-[color:var(--border)]">
          <div className="container-x py-6 flex flex-col gap-5 text-sm">
            {navLinks.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-[color:var(--charcoal)] hover:text-[color:var(--teal)] transition-colors uppercase tracking-[0.18em] text-[12px]"
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
