import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Clock, MapPin, Star, MessageCircle } from "lucide-react";
import { signatureTours } from "@/data/signatureTours";
import { useImportedTourImages } from "@/hooks/use-imported-tour-images";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CtaButton } from "@/components/ui/CtaButton";
import { useState } from "react";

export const Route = createFileRoute("/experiences")({
  head: () => ({
    meta: [
      { title: "Signature Tours — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Complete private experiences across Portugal — designed to be enjoyed as they are. Reserve instantly, with real-time confirmation.",
      },
      { property: "og:title", content: "Signature Experiences — YES experiences Portugal" },
      {
        property: "og:description",
        content:
          "Complete, curated private experiences. Reserve instantly — or adjust a few details within the experience to match your rhythm.",
      },
    ],
  }),
  component: ExperiencesPage,
});

const ALL_REGIONS = ["All Regions", "Arrábida", "Sintra", "Tróia & Comporta", "Tomar & Coimbra", "Alentejo"];

function ExperiencesPage() {
  const { resolveImg } = useImportedTourImages();
  const [activeRegion, setActiveRegion] = useState("All Regions");

  const filtered = activeRegion === "All Regions"
    ? signatureTours
    : signatureTours.filter((t) => t.region.includes(activeRegion.split(" &")[0]));

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="pt-32 pb-14 bg-[color:var(--sand)] text-center reveal">
        <div className="container-x max-w-3xl">
          <Eyebrow flank>Signature Collection</Eyebrow>
          <SectionTitle as="h1" size="anchor" spacing="loose">
            Signature <SectionTitle.Em>Experiences</SectionTitle.Em>
          </SectionTitle>
          <span className="gold-rule mt-6 mx-auto max-w-[80px]" aria-hidden="true" />
          <p className="mt-6 text-[1rem] md:text-[1.1rem] text-[color:var(--charcoal-soft)] leading-relaxed max-w-xl mx-auto">
            Complete private experiences, designed to be enjoyed as they are.
            Reserve instantly — or adjust a few details to match your rhythm.
          </p>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="bg-[color:var(--ivory)] border-b border-[color:var(--border)] py-4">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[12px] text-[color:var(--charcoal-soft)]">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 text-[color:var(--gold)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} fill="currentColor" strokeWidth={0} />
              ))}
            </span>
            700+ five-star reviews
          </span>
          <span className="h-3 w-px bg-[color:var(--border)] hidden sm:block" aria-hidden="true" />
          <span>100% private — no shared groups</span>
          <span className="h-3 w-px bg-[color:var(--border)] hidden sm:block" aria-hidden="true" />
          <span>Real-time confirmation</span>
          <span className="h-3 w-px bg-[color:var(--border)] hidden sm:block" aria-hidden="true" />
          <span>Designed in Portugal</span>
        </div>
      </div>

      {/* FILTER + GRID */}
      <section className="py-14 md:py-20">
        <div className="container-x">
          {/* Region filter */}
          <div className="reveal flex flex-wrap gap-2 mb-10">
            {ALL_REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRegion(r)}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.18em] border transition-all duration-200 ${
                  activeRegion === r
                    ? "border-[color:var(--teal)] bg-[color:var(--teal)] text-[color:var(--ivory)]"
                    : "border-[color:var(--charcoal)]/20 text-[color:var(--charcoal-soft)] hover:border-[color:var(--teal)] hover:text-[color:var(--teal)]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Tours grid */}
          <div className="reveal-stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((t) => {
              const topHighlights = t.highlights.slice(0, 3);
              return (
                <article
                  key={t.id}
                  className="group flex flex-col text-left"
                  aria-label={t.title}
                >
                  <Link
                    to="/tours/$tourId"
                    params={{ tourId: t.id }}
                    className="relative aspect-[4/5] overflow-hidden mb-5 shadow-[0_10px_30px_-20px_rgba(46,46,46,0.25)] group-hover:shadow-[0_28px_55px_-22px_rgba(41,91,97,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2"
                    aria-label={`Open ${t.title}`}
                  >
                    <img
                      {...resolveImg(t, "lg")}
                      alt={t.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.25em] bg-[color:var(--ivory)]/90 text-[color:var(--teal)] px-3 py-1.5">
                      {t.theme}
                    </span>
                    {/* Price badge */}
                    <span className="absolute bottom-4 right-4 text-[11px] uppercase tracking-[0.18em] bg-[color:var(--charcoal)]/80 text-[color:var(--ivory)] px-3 py-1.5">
                      From €{t.priceFrom}
                    </span>
                  </Link>
                  <Link
                    to="/tours/$tourId"
                    params={{ tourId: t.id }}
                    className="font-serif text-[1.35rem] md:text-[1.5rem] text-[color:var(--charcoal)] hover:text-[color:var(--teal)] transition-colors focus-visible:outline-none focus-visible:underline leading-snug"
                  >
                    {t.title}
                  </Link>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={11} aria-hidden="true" /> {t.region}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} aria-hidden="true" /> {t.durationHours}
                    </span>
                  </div>
                  <p className="mt-3 text-[13.5px] text-[color:var(--charcoal-soft)] leading-relaxed">
                    {t.blurb}
                  </p>
                  {topHighlights.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1.5 text-[13px] leading-[1.55] text-[color:var(--charcoal)]">
                      {topHighlights.map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <span
                            aria-hidden="true"
                            className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--gold)]"
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--gold-deep)]">
                    Fits best · {t.fitsBest}
                  </p>
                  <div className="mt-5 flex flex-col xs:flex-row gap-2.5">
                    <CtaButton
                      to="/tours/$tourId"
                      params={{ tourId: t.id }}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      aria-label={`Book ${t.title}`}
                    >
                      Book
                    </CtaButton>
                    <CtaButton
                      to="/tours/$tourId/tailor"
                      params={{ tourId: t.id }}
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      aria-label={`Tailor ${t.title}`}
                    >
                      Tailor
                    </CtaButton>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="py-0">
        <div className="container-x">
          <div className="bg-[color:var(--teal)] text-[color:var(--ivory)] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--ivory)]/60 mb-3">
                Not finding what you're looking for?
              </p>
              <h3 className="font-serif text-[1.8rem] md:text-[2.2rem] leading-snug">
                Want to start from scratch?{" "}
                <span className="italic font-normal">Open the Studio.</span>
              </h3>
              <p className="mt-3 text-[color:var(--ivory)]/80 max-w-lg text-[15px] leading-relaxed">
                Start with a place, a region or a feeling. We'll guide you as you build,
                shaping it within what works best on the ground.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <CtaButton to="/builder" variant="ghostDark">
                Start the Studio
              </CtaButton>
              <CtaButton
                to="/contact"
                variant="ghostDark"
                icon={null}
                iconLeading={<MessageCircle size={14} aria-hidden="true" />}
              >
                Talk to a Local
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      {/* SPACER */}
      <div className="py-10 md:py-14" />
    </SiteLayout>
  );
}
