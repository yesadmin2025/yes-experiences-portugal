import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { signatureTours } from "@/data/signatureTours";
import { useImportedTourImages } from "@/hooks/use-imported-tour-images";
import { ImageQualityToggle } from "@/components/ImageQualityToggle";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const Route = createFileRoute("/day-tours")({
  head: () => ({
    meta: [
      { title: "Day Tours — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Private day experiences across Portugal — Arrábida, Setúbal, Sintra, Évora, Douro and more. Reserve instantly, with real-time confirmation.",
      },
    ],
  }),
  component: DayToursPage,
});

const dayTours = signatureTours.filter((t) => !/days?/i.test(t.duration) || /half|full|long/i.test(t.duration));

function DayToursPage() {
  const { resolveImg } = useImportedTourImages();
  return (
    <SiteLayout>
      <section className="pt-32 pb-12 bg-[color:var(--sand)] text-center">
        <div className="container-x">
          <Eyebrow flank>Half &amp; Full Day</Eyebrow>
          <SectionTitle as="h1" size="anchor" spacing="loose">
            Day <SectionTitle.Em>Tours</SectionTitle.Em>
          </SectionTitle>
          <p className="mt-5 max-w-xl mx-auto text-[color:var(--charcoal-soft)]">
            Private guides, refined pace, and the parts of Portugal you'll remember most.
            Reserve instantly — or adjust a few details within the experience to match your rhythm.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-x">
          <div className="flex justify-end mb-6">
            <ImageQualityToggle />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dayTours.map((t) => (
            <Link
              key={t.id}
              to="/tours/$tourId"
              params={{ tourId: t.id }}
              className="group flex flex-col text-left"
              aria-label={`Open ${t.title}`}
            >
              <div className="lift-layer-sm relative aspect-[4/5] overflow-hidden mb-5 shadow-[0_10px_30px_-20px_rgba(46,46,46,0.25)] group-hover:shadow-[0_28px_55px_-22px_rgba(41,91,97,0.3)]">
                <img
                  {...resolveImg(t, "lg")}
                  alt={t.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.22em] bg-[color:var(--gold)]/95 text-[color:var(--charcoal)] px-3 py-1.5">
                  Tailored Signature
                </span>
              </div>

              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">
                {t.region}
              </p>
              <h3 className="serif text-2xl mt-2 group-hover:text-[color:var(--teal)] transition-colors">
                {t.title}
              </h3>

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

              <span className="tour-card-link mt-5">
                View experience &amp; reserve <ArrowRight size={14} />
              </span>
            </Link>
          ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
