import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, Clock, MapPin, Pencil, ExternalLink } from "lucide-react";
import { signatureTours } from "@/data/signatureTours";
import { useImportedTourImages } from "@/hooks/use-imported-tour-images";

export const Route = createFileRoute("/experiences")({
  head: () => ({
    meta: [
      { title: "Signature Tours — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Our signature private tours in Portugal — book as-is or tailor in the studio. Arrábida, Setúbal, Sintra, Évora, Douro, Algarve and more.",
      },
      { property: "og:title", content: "Signature Tours — YES experiences Portugal" },
      {
        property: "og:description",
        content:
          "Real, top-rated private experiences. Book ready-made — or open any tour in the studio and tailor it your way.",
      },
    ],
  }),
  component: ExperiencesPage,
});

function ExperiencesPage() {
  const { resolve } = useImportedTourImages();
  return (
    <SiteLayout>
      <section className="pt-32 pb-12 bg-[color:var(--sand)] text-center">
        <div className="container-x">
          <span className="eyebrow">Signature Collection</span>
          <h1 className="serif text-4xl md:text-6xl mt-5 leading-tight">
            Signature <span className="italic text-[color:var(--teal)]">Tours</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-[color:var(--charcoal-soft)]">
            Our top-rated private experiences. Book one as-is — or open it in the studio
            and tailor every stop, pace and detail.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-x">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {signatureTours.map((t) => (
              <article key={t.id} className="group flex flex-col">
                <div className="lift-layer-sm relative aspect-[4/5] overflow-hidden mb-5 shadow-[0_10px_30px_-20px_rgba(46,46,46,0.25)] group-hover:shadow-[0_28px_55px_-22px_rgba(41,91,97,0.3)]">
                  <img
                    src={resolve(t)}
                    alt={t.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.25em] bg-[color:var(--ivory)]/90 text-[color:var(--teal)] px-3 py-1.5">
                    {t.theme}
                  </span>
                  <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.22em] bg-[color:var(--gold)]/95 text-[color:var(--charcoal)] px-3 py-1.5">
                    Tailorable
                  </span>
                </div>

                <h3 className="serif text-2xl text-[color:var(--charcoal)]">{t.title}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} /> {t.region}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} /> {t.durationHours}
                  </span>
                  <span className="text-[color:var(--teal)]">From €{t.priceFrom}</span>
                </div>

                <p className="mt-3 text-sm text-[color:var(--charcoal-soft)] leading-relaxed">
                  {t.blurb}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                  Fits best · {t.fitsBest}
                </p>

                <div className="mt-5 flex flex-col sm:flex-row gap-2.5 sm:items-center">
                  <a
                    href={t.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-5 py-3 text-sm tracking-wide transition-all"
                  >
                    Book this tour <ExternalLink size={14} />
                  </a>
                  <Link
                    to="/builder"
                    search={{ tour: t.id }}
                    className="inline-flex items-center justify-center gap-2 border border-[color:var(--border)] hover:border-[color:var(--gold)] text-[color:var(--charcoal)] px-5 py-3 text-sm tracking-wide transition-all"
                  >
                    <Pencil size={14} /> Tailor in studio
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip />
    </SiteLayout>
  );
}

function CtaStrip() {
  return (
    <section className="pb-24">
      <div className="container-x">
        <div className="bg-[color:var(--teal)] text-[color:var(--ivory)] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="serif text-3xl md:text-4xl">
              Don't see your story? <span className="italic">Build your own.</span>
            </h3>
            <p className="mt-3 text-[color:var(--ivory)]/80 max-w-lg">
              Open the studio with a blank slate and design something completely bespoke.
            </p>
          </div>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 bg-[color:var(--gold)] hover:bg-[color:var(--gold-soft)] text-[color:var(--charcoal)] px-7 py-3.5 text-sm tracking-wide transition-all flex-shrink-0"
          >
            Start the Studio
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
