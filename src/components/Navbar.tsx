import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Menu, X } from "lucide-react";

const leftNav = [
  { to: "/experiences", label: "Experiences" },
  { to: "/day-tours", label: "Day Tours" },
  { to: "/multi-day", label: "Multi-Day Journeys" },
];
const rightNav = [
  { to: "/proposals", label: "Proposals & Celebrations" },
  { to: "/corporate", label: "Corporate" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[color:var(--ivory)]/90 backdrop-blur-xl"
          : "bg-[color:var(--ivory)]/0"
      }`}
    >
      <div className="container-x py-5 md:py-7">
        <div className="flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
          <nav className="hidden lg:flex items-center justify-end gap-10 text-[11px] uppercase tracking-[0.22em] font-medium">
            {leftNav.map((n) => (
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

          <Link
            to="/"
            className="flex-shrink-0 flex justify-center items-center px-2"
            aria-label="YES experiences PORTUGAL — Home"
          >
            <Logo size="sm" />
          </Link>

          <nav className="hidden lg:flex items-center justify-start gap-10 text-[11px] uppercase tracking-[0.22em] font-medium">
            {rightNav.map((n) => (
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

          <button
            className="lg:hidden text-[color:var(--charcoal)] absolute right-6"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {scrolled && (
        <div className="h-px bg-gradient-to-r from-transparent via-[color:var(--gold)]/40 to-transparent" />
      )}

      {open && (
        <div className="lg:hidden bg-[color:var(--ivory)] border-t border-[color:var(--border)]">
          <div className="container-x py-6 flex flex-col gap-4 text-sm">
            {[...leftNav, ...rightNav].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-[color:var(--charcoal)]"
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
