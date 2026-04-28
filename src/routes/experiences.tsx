import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { signatureTours } from "@/data/signatureTours";
import { useImportedTourImages } from "@/hooks/use-imported-tour-images";
import { ImageQualityToggle } from "@/components/ImageQualityToggle";

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

function ExperiencesPage() {
  const { resolveImg } = useImportedTourImages();
  return (
    <SiteLayout>
      <section className="pt-32 pb-[var(--section-y-sm)] bg-[color:var(--sand)] text-center">
        <div className="container-x">
          <span className="eyebrow">Signature Collection</span>
          <h1 className="serif text-4xl md:text-6xl mt-5 leading-tight">
            Signature <span className="italic text-[color:var(--teal)]">Tours</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-[color:var(--charcoal-soft)]">
            Complete private experiences, designed to be enjoyed as they are.
            Reserve instantly — or adjust a few details within the experience to match your rhythm.
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x">
          <div className="flex justify-end mb-6">
            <ImageQualityToggle />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {signatureTours.map((t) => (
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
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.25em] bg-[color:var(--ivory)]/90 text-[color:var(--teal)] px-3 py-1.5">
                    {t.theme}
                  </span>
                  <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.22em] bg-[color:var(--gold)]/95 text-[color:var(--charcoal)] px-3 py-1.5">
                    Tailored Signature
                  </span>
                </div>

                <h3 className="serif text-2xl text-[color:var(--charcoal)] group-hover:text-[color:var(--teal)] transition-colors">
                  {t.title}
                </h3>
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

                <span className="mt-5 inline-flex items-center gap-2 text-sm tracking-wide text-[color:var(--teal)] group-hover:gap-3 transition-all">
                  View experience & reserve <ArrowRight size={14} />
                </span>
              </Link>
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
              Want to start from scratch? <span className="italic">Open the Studio.</span>
            </h3>
            <p className="mt-3 text-[color:var(--ivory)]/80 max-w-lg">
              Start your way — with a place, a region or a feeling. We'll guide you as you build,
              shaping it within what works best on the ground.
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
