import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Clock, MapPin, Pencil, ExternalLink } from "lucide-react";
import { signatureTours } from "@/data/signatureTours";
import { useImportedTourImages } from "@/hooks/use-imported-tour-images";

export const Route = createFileRoute("/day-tours")({
  head: () => ({
    meta: [
      { title: "Day Tours — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Private day tours across Portugal — Arrábida, Setúbal, Sintra, Évora, Douro and more. Book ready-made or tailor in the studio.",
      },
    ],
  }),
  component: DayToursPage,
});

const dayTours = signatureTours.filter((t) => !/days?/i.test(t.duration) || /half|full|long/i.test(t.duration));

function DayToursPage() {
  const { resolve } = useImportedTourImages();
  return (
    <SiteLayout>
      <section className="pt-32 pb-12 bg-[color:var(--sand)] text-center">
        <div className="container-x">
          <span className="eyebrow">Half & Full Day</span>
          <h1 className="serif text-4xl md:text-6xl mt-5">
            Day <span className="italic text-[color:var(--teal)]">Tours</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-[color:var(--charcoal-soft)]">
            Private guides, refined pace, and the parts of Portugal you'll remember most.
            Book ready-made — or open any tour in the studio and tailor it your way.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-x grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {dayTours.map((t) => (
            <article key={t.id} className="group flex flex-col">
              <div className="lift-layer-sm relative aspect-[4/5] overflow-hidden mb-5 shadow-[0_10px_30px_-20px_rgba(46,46,46,0.25)] group-hover:shadow-[0_28px_55px_-22px_rgba(41,91,97,0.3)]">
                <img
                  src={resolve(t)}
                  alt={t.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.22em] bg-[color:var(--gold)]/95 text-[color:var(--charcoal)] px-3 py-1.5">
                  Tailorable
                </span>
              </div>

              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">
                {t.region}
              </p>
              <h3 className="serif text-2xl mt-2">{t.title}</h3>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> {t.durationHours}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} /> {t.theme}
                </span>
                <span className="text-[color:var(--teal)]">From €{t.priceFrom}</span>
              </div>

              <p className="mt-3 text-sm text-[color:var(--charcoal-soft)] leading-relaxed">
                {t.blurb}
              </p>

              <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
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
      </section>
    </SiteLayout>
  );
}
