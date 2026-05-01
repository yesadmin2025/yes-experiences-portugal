import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import { Logo } from "@/components/Logo";

/**
 * Footer — 4-column nav with logo + tagline on desktop,
 * stacked on mobile. Per v3 homepage spec:
 *   col 1: Experiences
 *   col 2: Occasions
 *   col 3: Company
 *   col 4: Connect (social icons)
 *
 * Logo + tagline sit ABOVE the column grid so the 4 columns get
 * proportionate space at desktop instead of being squeezed beside
 * a logo block. On mobile everything stacks vertically.
 */
const SOCIALS = [
  { href: "https://instagram.com/", label: "Instagram", Icon: Instagram },
  { href: "https://facebook.com/", label: "Facebook", Icon: Facebook },
  { href: "https://youtube.com/", label: "YouTube", Icon: Youtube },
  { href: "https://linkedin.com/", label: "LinkedIn", Icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="relative bg-[color:var(--charcoal)] text-[color:var(--ivory)]">
      {/* Thin champagne-gold top hairline — visual handoff from the
          ivory final-CTA section into the footer. Decorative. */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--gold) 70%, transparent) 50%, transparent)",
        }}
      />
      <div className="container-x py-14 md:py-16">
        {/* Brand row — logo + tagline. Sits above the column grid so
            the 4 nav columns can breathe at desktop. */}
        <div className="max-w-3xl">
          <Link
            to="/"
            className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--charcoal-deep)]"
            aria-label="YES experiences PORTUGAL — Home"
          >
            <Logo
              theme="gold-on-charcoal"
              loading="lazy"
              className="block h-[56px] md:h-[60px] w-auto select-none"
            />
          </Link>
          <p
            className="mt-6 text-[14px] text-[color:var(--ivory)]/80 leading-[1.7] max-w-md"
            style={{ fontWeight: 320, letterSpacing: "0.005em" }}
          >
            Private, designed Portugal experiences — crafted around your story by passionate local
            experts.
          </p>
        </div>

        {/* 4-column nav grid */}
        <div className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-10">
          <FooterCol
            title="Experiences"
            links={[
              { to: "/experiences", label: "All Experiences" },
              { to: "/day-tours", label: "Day Tours" },
              { to: "/multi-day", label: "Multi-Day Journeys" },
              { to: "/builder", label: "Build Your Own" },
            ]}
          />
          <FooterCol
            title="Occasions"
            links={[
              { to: "/proposals", label: "Proposals & Celebrations" },
              { to: "/corporate", label: "Corporate" },
              { to: "/contact", label: "Private Bookings" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { to: "/about", label: "About YES" },
              { to: "/contact", label: "Contact" },
            ]}
          />

          {/* Connect column — social icons rendered inline as part of
              the 4-column grid. Each icon is a 44×44 hit target on
              mobile to satisfy A11y. */}
          <div>
            <h4
              className="font-sans text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-6"
              style={{ fontWeight: 400 }}
            >
              Connect
            </h4>
            <ul className="flex flex-wrap items-center gap-3 list-none p-0 m-0">
              {SOCIALS.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex items-center justify-center h-11 w-11 rounded-sm border border-[color:var(--ivory)]/40 text-[color:var(--ivory)]/65 hover:text-[color:var(--gold)] hover:border-[color:var(--gold)]/70 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--charcoal-deep)]"
                  >
                    <Icon size={18} strokeWidth={1.5} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar — copyright + tagline. Quiet, single line. */}
        <div className="mt-12 md:mt-14 pt-6 border-t border-[color:var(--gold)]/20">
          <div
            className="flex flex-col md:flex-row justify-between items-center gap-3 text-[12px] text-[color:var(--ivory)]/70"
            style={{ fontWeight: 350 }}
          >
            <p>© {new Date().getFullYear()} YES experiences Portugal. All rights reserved.</p>
            <p
              className="tracking-[0.32em] uppercase text-[color:var(--gold)]"
              style={{ fontWeight: 400 }}
            >
              Designed in Portugal
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4
        className="font-sans text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-6"
        style={{ fontWeight: 400 }}
      >
        {title}
      </h4>
      <ul className="space-y-3 text-[14px]" style={{ fontWeight: 350 }}>
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-[color:var(--ivory)]/85 hover:text-[color:var(--gold-soft)] transition-colors duration-300"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
