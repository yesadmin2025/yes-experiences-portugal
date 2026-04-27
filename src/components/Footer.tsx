import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import logoGold from "@/assets/yes-logo-approved-gold-silk.png";

const SOCIALS = [
  { href: "https://instagram.com/", label: "Instagram", Icon: Instagram },
  { href: "https://facebook.com/", label: "Facebook", Icon: Facebook },
  { href: "https://youtube.com/", label: "YouTube", Icon: Youtube },
  { href: "https://linkedin.com/", label: "LinkedIn", Icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)]">
      <div className="container-x py-24 md:py-28">
        <div className="grid md:grid-cols-4 gap-14">
          <div className="md:col-span-1">
            {/* Gold variant of the approved header artwork — same silhouette
                and scale, with a softer champagne-gold finish for the dark
                footer surface. */}
            <Link
              to="/"
              className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--charcoal-deep)]"
              aria-label="YES experiences PORTUGAL — Home"
            >
              <img
                src={logoGold}
                width={909}
                height={579}
                alt="YES experiences PORTUGAL"
                className="block h-[60px] md:h-[64px] lg:h-[68px] w-auto select-none"
                draggable={false}
                loading="lazy"
                decoding="async"
                style={{ imageRendering: "auto" }}
              />
            </Link>
            <p className="mt-8 text-[14.5px] text-[color:var(--ivory)]/85 leading-[1.8] max-w-xs" style={{ fontWeight: 320, letterSpacing: "0.005em" }}>
              Private, designed Portugal experiences — crafted around your story by passionate
              local experts.
            </p>
          </div>

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
        </div>

        <div className="mt-20 pt-10 border-t border-[color:var(--ivory)]/15 flex flex-col items-center gap-8">
          <ul className="flex items-center gap-6 list-none p-0 m-0">
            {SOCIALS.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex items-center justify-center text-[color:var(--ivory)]/55 hover:text-[color:var(--gold)] hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--charcoal-deep)] rounded-sm"
                >
                  <Icon size={17} strokeWidth={1.5} />
                </a>
              </li>
            ))}
          </ul>
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-[color:var(--ivory)]/75" style={{ fontWeight: 350 }}>
            <p>© {new Date().getFullYear()} YES experiences Portugal. All rights reserved.</p>
            <p className="tracking-[0.32em] uppercase text-[color:var(--gold)]" style={{ fontWeight: 400 }}>
              Designed in Portugal
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="font-sans text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)] mb-6" style={{ fontWeight: 400 }}>
        {title}
      </h4>
      <ul className="space-y-3.5 text-[14.5px]" style={{ fontWeight: 350 }}>
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
