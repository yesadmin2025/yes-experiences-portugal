import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import expWine from "@/assets/exp-wine.jpg";
import expCoastal from "@/assets/exp-coastal.jpg";
import expGastronomy from "@/assets/exp-gastronomy.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expRomantic from "@/assets/exp-romantic.jpg";
import expStreet from "@/assets/exp-street.jpg";

export const Route = createFileRoute("/experiences")({
  head: () => ({
    meta: [
      { title: "Signature Experiences — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Browse our signature private Portugal experiences — wine, coastal, gastronomy, nature, romantic and heritage journeys.",
      },
    ],
  }),
  component: ExperiencesPage,
});

const items = [
  { title: "Douro Wine Estates", region: "Porto · Douro", duration: "Full Day", img: expWine, theme: "Wine" },
  { title: "Algarve Coastal Drive", region: "Algarve", duration: "Full Day", img: expCoastal, theme: "Coastal" },
  { title: "Lisbon Hidden Tables", region: "Lisbon", duration: "Evening", img: expGastronomy, theme: "Gastronomy" },
  { title: "Sintra Forest Walks", region: "Lisbon", duration: "Half Day", img: expNature, theme: "Nature" },
  { title: "Sunset on the Cliffs", region: "Algarve", duration: "Evening", img: expRomantic, theme: "Romantic" },
  { title: "Old Lisbon by Foot", region: "Lisbon", duration: "Half Day", img: expStreet, theme: "Heritage" },
];

function ExperiencesPage() {
  return (
    <SiteLayout>
      <section className="pt-32 pb-12 bg-[color:var(--sand)] text-center">
        <div className="container-x">
          <span className="eyebrow">Signature Collection</span>
          <h1 className="serif text-4xl md:text-6xl mt-5 leading-tight">
            Portugal <span className="italic text-[color:var(--teal)]">Experiences</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-[color:var(--charcoal-soft)]">
            A curated selection of private experiences. Each one can be tailored — or used as the
            seed for something entirely your own.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-x">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((it) => (
              <article key={it.title} className="group">
                <div className="lift-layer-sm relative aspect-[4/5] overflow-hidden mb-5 shadow-[0_10px_30px_-20px_rgba(46,46,46,0.25)] group-hover:shadow-[0_28px_55px_-22px_rgba(41,91,97,0.3)]">
                  <img
                    src={it.img}
                    alt={it.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.25em] bg-[color:var(--ivory)]/90 text-[color:var(--teal)] px-3 py-1.5">
                    {it.theme}
                  </span>
                </div>
                <h3 className="serif text-2xl text-[color:var(--charcoal)]">{it.title}</h3>
                <div className="mt-3 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} /> {it.region}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} /> {it.duration}
                  </span>
                </div>
                <Link
                  to="/builder"
                  className="mt-5 inline-flex items-center gap-2 text-sm text-[color:var(--teal)] hover:text-[color:var(--teal-2)]"
                >
                  Tailor this experience
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
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
              Use our experience builder to design something completely bespoke.
            </p>
          </div>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 bg-[color:var(--gold)] hover:bg-[color:var(--gold-soft)] text-[color:var(--charcoal)] px-7 py-3.5 text-sm tracking-wide transition-all flex-shrink-0"
          >
            Start the Builder
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
