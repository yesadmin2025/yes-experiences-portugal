import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight } from "lucide-react";
import multiDay from "@/assets/multi-day.jpg";
import expCoastal from "@/assets/exp-coastal.jpg";
import expWine from "@/assets/exp-wine.jpg";

export const Route = createFileRoute("/multi-day")({
  head: () => ({
    meta: [
      { title: "Multi-Day Journeys — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Bespoke multi-day Portugal journeys connecting coast, culture, gastronomy and hidden landscapes.",
      },
      { property: "og:title", content: "Multi-Day Portugal Journeys" },
    ],
  }),
  component: MultiDayPage,
});

const journeys = [
  {
    title: "The Northern Story",
    days: "5 Days",
    route: "Porto · Douro · Minho",
    desc: "Wine valleys, granite villages and the soul of Portugal's north.",
    img: expWine,
  },
  {
    title: "Coast to Cliff",
    days: "7 Days",
    route: "Lisbon · Alentejo · Algarve",
    desc: "From the capital to the wild Atlantic — a journey through landscape and light.",
    img: expCoastal,
  },
  {
    title: "Quiet Portugal",
    days: "4 Days",
    route: "Alentejo & inland",
    desc: "Slow, soulful and uncrowded — for travelers seeking depth, not checklists.",
    img: multiDay,
  },
];

function MultiDayPage() {
  return (
    <SiteLayout>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <img
          src={multiDay}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[color:var(--ivory)]/70" />
        <div className="container-x relative text-center">
          <span className="eyebrow">Designed Across Days</span>
          <h1 className="serif text-4xl md:text-6xl mt-5 leading-tight">
            Multi-Day <span className="italic text-[color:var(--teal)]">Portugal Journeys</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-[color:var(--charcoal-soft)]">
            Travel beyond the highlights. Bespoke journeys connecting Portugal's coast, culture,
            gastronomy and hidden landscapes.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-x space-y-16">
          {journeys.map((j, i) => (
            <article
              key={j.title}
              className={`grid lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <img
                  src={j.img}
                  alt={j.title}
                  loading="lazy"
                  className="w-full aspect-[5/4] object-cover"
                />
              </div>
              <div className="lg:px-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">
                  {j.days} · {j.route}
                </p>
                <h2 className="serif text-3xl md:text-4xl mt-4 text-[color:var(--charcoal)]">
                  {j.title}
                </h2>
                <p className="mt-5 text-[color:var(--charcoal-soft)] leading-relaxed">{j.desc}</p>
                <Link
                  to="/builder"
                  className="mt-7 inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide transition-all"
                >
                  Design This Journey
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
