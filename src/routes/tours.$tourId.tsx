import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Clock, MapPin, ExternalLink, ArrowLeft, Star } from "lucide-react";
import { signatureTours, findTour, tripadvisorHrefFor } from "@/data/signatureTours";
import { SimpleTailorForm } from "@/components/SimpleTailorForm";
import { useImportedTourImages } from "@/hooks/use-imported-tour-images";

export const Route = createFileRoute("/tours/$tourId")({
  loader: ({ params }) => {
    const tour = findTour(params.tourId);
    if (!tour) throw notFound();
    return { tour };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.tour;
    if (!t) return { meta: [{ title: "Tour — YES experiences Portugal" }] };
    return {
      meta: [
        { title: `${t.title} — YES experiences Portugal` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — YES experiences Portugal` },
        { property: "og:description", content: t.blurb },
        { property: "og:image", content: t.img },
        { property: "twitter:image", content: t.img },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <section className="pt-32 pb-20 min-h-[60vh]">
        <div className="container-x max-w-xl text-center">
          <h1 className="serif text-4xl">Tour not found</h1>
          <p className="mt-4 text-[color:var(--charcoal-soft)]">
            That tour doesn't exist anymore.
          </p>
          <Link
            to="/experiences"
            className="mt-8 inline-flex items-center gap-2 border border-[color:var(--border)] hover:border-[color:var(--gold)] px-5 py-3 text-sm"
          >
            <ArrowLeft size={14} /> Back to all tours
          </Link>
        </div>
      </section>
    </SiteLayout>
  ),
  component: TourDetailPage,
});

function TourDetailPage() {
  const { tour } = Route.useLoaderData();
  const { resolveImg } = useImportedTourImages();
  const tripadvisor = tripadvisorHrefFor(tour);

  return (
    <SiteLayout>
      <section className="pt-28 pb-6">
        <div className="container-x max-w-5xl">
          <Link
            to="/experiences"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] hover:text-[color:var(--charcoal)]"
          >
            <ArrowLeft size={12} /> All Signature Tours
          </Link>
        </div>
      </section>

      <section className="pb-12">
        <div className="container-x max-w-5xl">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12">
            {/* Hero image */}
            <div className="lift-layer-sm relative aspect-[4/5] sm:aspect-[5/6] overflow-hidden shadow-[0_20px_50px_-30px_rgba(46,46,46,0.35)]">
              <img
                {...resolveImg(tour, "hero")}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.25em] bg-[color:var(--ivory)]/90 text-[color:var(--teal)] px-3 py-1.5">
                {tour.theme}
              </span>
            </div>

            {/* Header content */}
            <div className="flex flex-col">
              <span className="eyebrow">Signature Tour</span>
              <h1 className="serif text-3xl sm:text-4xl md:text-5xl mt-3 leading-tight">
                {tour.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} /> {tour.region}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> {tour.durationHours}
                </span>
                <span className="text-[color:var(--teal)]">From €{tour.priceFrom}</span>
              </div>

              <p className="mt-6 text-[15px] leading-relaxed text-[color:var(--charcoal)]">
                {tour.blurb}
              </p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                Fits best · {tour.fitsBest}
              </p>

              <div className="mt-6 border-t border-[color:var(--border)] pt-5">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--charcoal-soft)]">
                  A day at a glance
                </span>
                <ul className="mt-3 space-y-2.5">
                  {tour.pace.map((p, i) => (
                    <li key={p} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex-shrink-0 w-6 h-6 border border-[color:var(--gold)] text-[color:var(--gold)] text-[11px] flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 flex flex-col gap-2.5">
                <a
                  href={tour.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-5 py-3.5 text-sm tracking-wide transition-all"
                >
                  Book on YES experiences <ExternalLink size={14} />
                </a>
                <a
                  href={tripadvisor}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-[color:var(--border)] hover:border-[color:var(--gold)] text-[color:var(--charcoal)] px-5 py-3.5 text-sm tracking-wide transition-all"
                >
                  <Star size={14} /> Read reviews on TripAdvisor <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tailor */}
      <section id="tailor" className="py-12 bg-[color:var(--sand)]/40">
        <div className="container-x max-w-5xl grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-start">
          <div>
            <span className="eyebrow">Customise</span>
            <h2 className="serif text-3xl sm:text-4xl mt-3">
              Make it yours — without rebuilding it.
            </h2>
            <p className="mt-4 text-sm text-[color:var(--charcoal-soft)] leading-relaxed">
              You picked the story. Now adjust just the details that matter for you:
              date, group size, pace, add-ons, and which stops to keep. Send your
              request and a real local replies — usually within an hour.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li>· No accounts. No long forms.</li>
              <li>· Same trusted guide and route.</li>
              <li>· Pay only after we confirm.</li>
            </ul>
          </div>
          <SimpleTailorForm tour={tour} />
        </div>
      </section>

      {/* Related */}
      <RelatedTours currentId={tour.id} />
    </SiteLayout>
  );
}

function RelatedTours({ currentId }: { currentId: string }) {
  const others = signatureTours.filter((t) => t.id !== currentId).slice(0, 3);
  const { resolveImg } = useImportedTourImages();
  return (
    <section className="py-16">
      <div className="container-x max-w-5xl">
        <span className="eyebrow">More like this</span>
        <h2 className="serif text-2xl sm:text-3xl mt-3">Other Signature Tours</h2>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {others.map((t) => (
            <Link
              key={t.id}
              to="/tours/$tourId"
              params={{ tourId: t.id }}
              className="group flex flex-col"
            >
              <div className="relative aspect-[4/5] overflow-hidden mb-3">
                <img
                  {...resolveImg(t, "md")}
                  alt={t.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="serif text-lg">{t.title}</h3>
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] mt-1">
                {t.region}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
