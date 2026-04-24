import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Menu, X } from "lucide-react";

const navItems = [
  { to: "/experiences", label: "Experiences" },
  { to: "/day-tours", label: "Day Tours" },
  { to: "/multi-day", label: "Multi-Day Journeys" },
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
          ? "bg-[color:var(--ivory)]/92 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      {/* Mobile bar */}
      <div className="lg:hidden container-x flex items-center justify-between py-4">
        <span className="w-8" />
        <Link to="/" aria-label="YES experiences PORTUGAL — Home" className="flex justify-center">
          <Logo size="sm" />
        </Link>
        <button
          className="text-[color:var(--charcoal)] w-8 flex justify-end"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Desktop: stacked editorial header */}
      <div className="hidden lg:flex flex-col items-center pt-8 pb-5 gap-6">
        <Link
          to="/"
          aria-label="YES experiences PORTUGAL — Home"
          className="flex justify-center"
        >
          <Logo size="md" />
        </Link>

        <nav className="flex items-center justify-center gap-12 text-[11px] uppercase tracking-[0.28em] font-medium">
          {navItems.map((n) => (
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
      </div>

      {scrolled && (
        <div className="h-px bg-gradient-to-r from-transparent via-[color:var(--gold)]/40 to-transparent" />
      )}

      {open && (
        <div className="lg:hidden bg-[color:var(--ivory)] border-t border-[color:var(--border)]">
          <div className="container-x py-6 flex flex-col gap-4 text-sm">
            {navItems.map((n) => (
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
