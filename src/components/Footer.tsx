import { Link } from "@tanstack/react-router";
import logoGold1x from "@/assets/yes-experiences-portugal-logo-gold-1x.png";
import logoGold2x from "@/assets/yes-experiences-portugal-logo-gold-2x.png";
import logoGold3x from "@/assets/yes-experiences-portugal-logo-gold-3x.png";

export function Footer() {
  return (
    <footer className="bg-[color:var(--charcoal)] text-[color:var(--ivory)]">
      <div className="container-x py-20">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            {/* Gold variant of the official master logo — same letterforms,
                proportions and gold rules as the header lockup, recolored
                so YES reads in champagne gold and "experiences" in warm
                ivory for the dark charcoal footer surface. */}
            <Link
              to="/"
              className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--charcoal)]"
              aria-label="YES experiences PORTUGAL — Home"
            >
              <img
                src={logoGold1x}
                srcSet={`${logoGold1x} 1x, ${logoGold2x} 2x, ${logoGold3x} 3x`}
                width={452}
                height={312}
                alt="YES experiences PORTUGAL"
                className="block h-[78px] md:h-[92px] lg:h-[104px] w-auto select-none"
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="mt-7 text-sm text-[color:var(--ivory)]/70 leading-relaxed max-w-xs">
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

        <div className="mt-16 pt-8 border-t border-[color:var(--ivory)]/15 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[color:var(--ivory)]/60">
          <p>© {new Date().getFullYear()} YES experiences Portugal. All rights reserved.</p>
          <p className="tracking-[0.3em] uppercase text-[color:var(--gold)]">
            Designed in Portugal
          </p>
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
      <h4 className="text-xs uppercase tracking-[0.28em] text-[color:var(--gold)] mb-5">
        {title}
      </h4>
      <ul className="space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-[color:var(--ivory)]/80 hover:text-[color:var(--ivory)] transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
