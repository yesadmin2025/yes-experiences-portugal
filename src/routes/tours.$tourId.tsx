import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Clock, MapPin, ArrowLeft, Check, Sparkles, Info, Heart } from "lucide-react";
import {
  signatureTours,
  findTour,
  STOP_THEME_IMG,
  type SignatureTour,
} from "@/data/signatureTours";
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
    if (!t) return { meta: [{ title: "Signature Experience — YES experiences Portugal" }] };
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
          <h1 className="serif text-4xl">Experience not found</h1>
          <p className="mt-4 text-[color:var(--charcoal-soft)]">
            That Signature Experience doesn't exist anymore.
          </p>
          <Link
            to="/experiences"
            className="mt-8 inline-flex items-center gap-2 border border-[color:var(--border)] hover:border-[color:var(--gold)] px-5 py-3 text-sm"
          >
            <ArrowLeft size={14} /> Back to all experiences
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

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <section className="pt-28 pb-4">
        <div className="container-x max-w-5xl">
          <Link
            to="/experiences"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] hover:text-[color:var(--charcoal)]"
          >
            <ArrowLeft size={12} /> All Signature Experiences
          </Link>
        </div>
      </section>

      {/* Hero + meta */}
      <section className="pb-10">
        <div className="container-x max-w-5xl">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12">
            <div className="lift-layer-sm relative aspect-[4/5] sm:aspect-[5/6] overflow-hidden shadow-[0_20px_50px_-30px_rgba(46,46,46,0.35)]">
              <img
                {...resolveImg(tour, "hero")}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.25em] bg-[color:var(--ivory)]/90 text-[color:var(--teal)] px-3 py-1.5">
                {tour.theme}
              </span>
              <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.22em] bg-[color:var(--gold)]/95 text-[color:var(--charcoal)] px-3 py-1.5">
                Signature
              </span>
            </div>

            <div className="flex flex-col">
              <span className="eyebrow">Signature Experience</span>
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

              <p className="mt-6 serif text-xl sm:text-2xl leading-snug text-[color:var(--charcoal)]">
                {tour.intro}
              </p>

              <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                Fits best · {tour.fitsBest}
              </p>

              <p className="mt-3 text-[12px] text-[color:var(--charcoal-soft)] italic">
                A complete experience, designed to be enjoyed as it is.
              </p>

              <a
                href="#tailor"
                className="mt-6 inline-flex items-center justify-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-5 py-3.5 text-sm tracking-wide transition-all"
              >
                <Sparkles size={14} /> Reserve instantly
              </a>
              <p className="mt-2 text-[11px] text-[color:var(--charcoal-soft)] text-center">
                Confirm in real time — secured directly on this site.
              </p>
              <a
                href="#tailor"
                className="mt-3 inline-flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] hover:text-[color:var(--teal)] transition-colors"
              >
                Or adjust a few details first →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Day at a glance — chapter strip with contextual imagery */}
      <ChapterStrip tour={tour} />

      {/* Structured blocks: highlights, included, ideal for, notes */}
      <section className="py-12">
        <div className="container-x max-w-5xl grid md:grid-cols-2 gap-8 md:gap-12">
          <Block icon={<Sparkles size={14} />} title="Highlights">
            <ul className="space-y-2.5 text-sm leading-relaxed">
              {(tour.highlights ?? []).map((h) => (
                <li key={h} className="flex gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[color:var(--gold)] flex-shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Block>

          <Block icon={<Check size={14} />} title="What's included">
            <ul className="space-y-2.5 text-sm leading-relaxed">
              {tour.included.map((h) => (
                <li key={h} className="flex gap-2.5">
                  <Check
                    size={14}
                    className="mt-0.5 text-[color:var(--teal)] flex-shrink-0"
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Block>

          <Block icon={<Heart size={14} />} title="Ideal for">
            <ul className="space-y-2.5 text-sm leading-relaxed">
              {tour.idealFor.map((h) => (
                <li key={h} className="flex gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[color:var(--teal)] flex-shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Block>

          {tour.notes.length > 0 && (
            <Block icon={<Info size={14} />} title="Good to know">
              <ul className="space-y-2.5 text-sm leading-relaxed text-[color:var(--charcoal-soft)]">
                {tour.notes.map((h) => (
                  <li key={h} className="flex gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[color:var(--charcoal-soft)] flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>
      </section>

      {/* Tailor */}
      <section id="tailor" className="py-12 bg-[color:var(--sand)]/40 scroll-mt-24">
        <div className="container-x max-w-5xl grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-start">
          <div>
            <span className="eyebrow">Tailored Signature</span>
            <h2 className="serif text-3xl sm:text-4xl mt-3">
              Adjust a few details — keep the experience intact.
            </h2>
            <p className="mt-4 text-sm text-[color:var(--charcoal-soft)] leading-relaxed">
              Match this experience to your rhythm. Pick your date, pace, group size,
              guide language and any small variations available within this tour. The
              story, route and trusted local guide stay the same.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li>· Reserve instantly — no waiting, no email chase.</li>
              <li>· Real-time confirmation, secured on this site.</li>
              <li>· Same trusted local guide and curated route.</li>
            </ul>
            <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
              Reservations handled securely through our integrated booking system.
            </p>
          </div>
          <SimpleTailorForm tour={tour} />
        </div>
      </section>

      <RelatedTours currentId={tour.id} />
    </SiteLayout>
  );
}

function ChapterStrip({ tour }: { tour: SignatureTour }) {
  return (
    <section className="py-10 border-t border-b border-[color:var(--border)] bg-[color:var(--ivory)]">
      <div className="container-x max-w-5xl">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="eyebrow">A day at a glance</span>
            <h2 className="serif text-2xl sm:text-3xl mt-2">The story, stop by stop</h2>
          </div>
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
            {tour.stops.length} chapters
          </span>
        </div>

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tour.stops.map((s, i) => (
            <li
              key={s.label}
              className="group relative flex flex-col bg-[color:var(--card)] border border-[color:var(--border)] overflow-hidden"
            >
              <div className="relative aspect-[5/3] overflow-hidden">
                <img
                  src={STOP_THEME_IMG[s.imageTheme]}
                  alt={s.label}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center text-[11px] bg-[color:var(--ivory)]/95 border border-[color:var(--gold)] text-[color:var(--gold)]">
                  {i + 1}
                </span>
              </div>
              <div className="p-4">
                <h3 className="serif text-lg leading-snug">{s.label}</h3>
                <p className="mt-1.5 text-sm text-[color:var(--charcoal-soft)] leading-relaxed">
                  {s.story}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Block({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[color:var(--charcoal-soft)]">
        <span className="text-[color:var(--gold)]">{icon}</span>
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function RelatedTours({ currentId }: { currentId: string }) {
  const others = signatureTours.filter((t) => t.id !== currentId).slice(0, 3);
  const { resolveImg } = useImportedTourImages();
  return (
    <section className="py-16">
      <div className="container-x max-w-5xl">
        <span className="eyebrow">More like this</span>
        <h2 className="serif text-2xl sm:text-3xl mt-3">Other Signature Experiences</h2>
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
