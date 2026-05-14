import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Linkedin, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useState } from "react";

/**
 * Footer — 4-column nav with logo + tagline + newsletter on desktop,
 * stacked on mobile.
 *
 * Improvements v2:
 * - Added newsletter subscription strip above the main footer
 * - Added Local Stories to Company column
 * - Added WhatsApp link to Connect column
 * - Improved tagline copy
 */

const SOCIALS = [
  { href: "https://instagram.com/yesexperiencesportugal", label: "Instagram", Icon: Instagram },
  { href: "https://facebook.com/", label: "Facebook", Icon: Facebook },
  { href: "https://youtube.com/", label: "YouTube", Icon: Youtube },
  { href: "https://linkedin.com/", label: "LinkedIn", Icon: Linkedin },
];

function NewsletterStrip() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div
      className="border-b border-[color:var(--gold-warm)]/20 py-8 md:py-10"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p
            className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold-warm)] mb-1"
            style={{ fontWeight: 500 }}
          >
            Local notes
          </p>
          <p
            className="text-[14px] text-[color:var(--ivory)]/80 leading-snug max-w-xs"
            style={{ fontWeight: 320 }}
          >
            Hidden corners, seasonal stories and new experiences — from our team in Portugal.
          </p>
        </div>
        {done ? (
          <p className="text-[13px] text-[color:var(--gold-warm)] italic font-serif">
            Thank you — we'll be in touch.
          </p>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
            className="flex items-stretch gap-0 max-w-sm w-full"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 bg-[color:var(--ivory)]/8 border border-[color:var(--ivory)]/20 border-r-0 text-[color:var(--ivory)] placeholder:text-[color:var(--ivory)]/40 px-4 py-3 text-[13px] outline-none focus:border-[color:var(--gold-warm)]/60 transition-colors"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="inline-flex items-center justify-center px-4 py-3 bg-[color:var(--gold-warm)] hover:bg-[color:var(--gold)] text-[color:var(--charcoal)] transition-colors duration-200"
            >
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-[color:var(--charcoal)] text-[color:var(--ivory)]">
      {/* Thin champagne-gold top hairline */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--gold-warm) 80%, transparent) 50%, transparent)",
        }}
      />
      <div className="container-x py-10 md:py-12">
        {/* Newsletter strip */}
        <NewsletterStrip />

        {/* Brand row */}
        <div className="max-w-3xl mt-10 md:mt-12">
          <Link
            to="/"
            className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--charcoal)]"
            aria-label="YES experiences PORTUGAL — Home"
          >
            <Logo
              theme="gold-on-charcoal"
              loading="lazy"
              className="block h-[48px] md:h-[52px] w-auto select-none"
            />
          </Link>
          <p
            className="mt-5 text-[14px] text-[color:var(--ivory)]/80 leading-[1.65] max-w-md"
            style={{ fontWeight: 320, letterSpacing: "0.005em" }}
          >
            Private, designed Portugal experiences — crafted around your story by passionate local
            experts. Every journey begins with who you are.
          </p>
        </div>

        {/* 4-column nav grid */}
        <div className="mt-9 md:mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-8">
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
              { to: "/local-stories", label: "Local Stories" },
              { to: "/contact", label: "Contact" },
            ]}
          />
          {/* Connect column */}
          <div>
            <h4
              className="font-sans text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold-warm)] mb-5"
              style={{ fontWeight: 500 }}
            >
              Connect
            </h4>
            <ul className="flex flex-wrap items-center gap-3 list-none p-0 m-0 mb-5">
              {SOCIALS.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex items-center justify-center h-11 w-11 rounded-sm border border-[color:var(--ivory)]/40 text-[color:var(--ivory)]/70 hover:text-[color:var(--gold-warm)] hover:border-[color:var(--gold-warm)]/70 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--charcoal)]"
                  >
                    <Icon size={18} strokeWidth={1.5} />
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/351910000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[12px] text-[color:var(--ivory)]/70 hover:text-[color:var(--gold-warm)] transition-colors duration-200"
              style={{ fontWeight: 350 }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--gold-warm)]" aria-hidden="true" />
              WhatsApp · A local is one message away
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 md:mt-10 pt-5 border-t border-[color:var(--gold-warm)]/25">
          <div
            className="flex flex-col md:flex-row justify-between items-center gap-3 text-[12px] text-[color:var(--ivory)]/70"
            style={{ fontWeight: 350 }}
          >
            <p>© {new Date().getFullYear()} YES experiences Portugal. All rights reserved.</p>
            <p
              className="tracking-[0.32em] uppercase text-[color:var(--gold-warm)]"
              style={{ fontWeight: 500 }}
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
        className="font-sans text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold-warm)] mb-5"
        style={{ fontWeight: 500 }}
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
