import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight } from "lucide-react";
import expStreet from "@/assets/exp-street.jpg";
import expGastronomy from "@/assets/exp-gastronomy.jpg";
import expNature from "@/assets/exp-nature.jpg";

export const Route = createFileRoute("/day-tours")({
  head: () => ({
    meta: [
      { title: "Day Tours — YES experiences Portugal" },
      {
        name: "description",
        content: "Private day tours across Portugal — half day and full day experiences.",
      },
    ],
  }),
  component: DayToursPage,
});

const tours = [
  { title: "Lisbon, Behind the Postcard", city: "Lisbon", img: expStreet },
  { title: "Sintra by Locals", city: "Sintra", img: expNature },
  { title: "Porto Tasting Walk", city: "Porto", img: expGastronomy },
];

function DayToursPage() {
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
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-x grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((t) => (
            <article key={t.title} className="group">
              <div className="lift-layer-sm relative aspect-[4/5] overflow-hidden mb-5 shadow-[0_10px_30px_-20px_rgba(46,46,46,0.25)] group-hover:shadow-[0_28px_55px_-22px_rgba(41,91,97,0.3)]">
                <img
                  src={t.img}
                  alt={t.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">
                {t.city}
              </p>
              <h3 className="serif text-2xl mt-2">{t.title}</h3>
              <Link
                to="/builder"
                className="mt-4 inline-flex items-center gap-2 text-sm text-[color:var(--teal)]"
              >
                Tailor & Book <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
