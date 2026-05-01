import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight } from "lucide-react";
import editCoastal from "@/assets/edit-coastal-road.jpg";
import editWinery from "@/assets/edit-winery.jpg";
import editMarket from "@/assets/edit-market.jpg";
import editViewpoint from "@/assets/edit-viewpoint.jpg";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const Route = createFileRoute("/local-stories")({
  head: () => ({
    meta: [
      { title: "Local Stories & Hidden Gems — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Notes from the road. Hidden corners of Portugal we keep returning to — written by the locals who design our private experiences.",
      },
      { property: "og:title", content: "Local Stories & Hidden Gems — YES experiences Portugal" },
      {
        property: "og:description",
        content:
          "Hidden corners, family wineries, secret viewpoints — the Portugal we travel ourselves.",
      },
      { property: "og:image", content: editCoastal },
    ],
  }),
  component: Page,
});

const stories = [
  {
    title: "Hidden Coastal Roads",
    line: "The drive from Sintra to Cabo da Roca that no guidebook quite gets right — pine-scented bends, an empty cove, a shack where the fishermen eat lunch.",
    img: editCoastal,
  },
  {
    title: "Family Wineries",
    line: "Three generations, one cellar door, a glass poured by the winemaker himself. No tasting menu, no script — just the year's vintage and an unhurried afternoon.",
    img: editWinery,
  },
  {
    title: "Local Markets at Dawn",
    line: "Where breakfast is a pastel de nata and the day's plan is written on a napkin. We know the bakers, the cheesemakers, the woman who still salts her own olives.",
    img: editMarket,
  },
  {
    title: "Secret Viewpoints",
    line: "A bend in the road. A stone wall. The whole valley below — and nobody else. The kind of place you only find if someone who lives here points the way.",
    img: editViewpoint,
  },
];

function Page() {
  return (
    <SiteLayout>
      {/* Header */}
      <section className="pt-40 pb-16 md:pt-48 md:pb-20 bg-[color:var(--sand)] text-center">
        <div className="container-x">
          <Eyebrow flank>Local Stories &amp; Hidden Gems</Eyebrow>
          <SectionTitle as="h1" size="anchor" spacing="loose">
            The Portugal{" "}
            <SectionTitle.Em>we travel ourselves</SectionTitle.Em>
          </SectionTitle>
          <p className="mt-6 max-w-xl mx-auto text-[15px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.75] font-light">
            Notes from the road — written by the locals who design our private experiences. Hidden
            places, family kitchens, quiet corners of a country we know by heart.
          </p>
        </div>
      </section>

      {/* Stories */}
      <section className="py-24 md:py-32 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14">
            {stories.map((s) => (
              <article key={s.title} className="group reveal-stagger">
                <div className="relative overflow-hidden aspect-[4/3] mb-6 shadow-[0_10px_30px_-22px_rgba(46,46,46,0.35)] group-hover:shadow-[0_24px_50px_-22px_rgba(41,91,97,0.28)] transition-shadow duration-700">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/70 via-transparent to-transparent" />
                  <div className="absolute left-5 right-5 bottom-5">
                    <span className="block h-px w-8 bg-[color:var(--gold)] mb-3 opacity-90" />
                    <h2 className="serif text-2xl md:text-[1.7rem] leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                      {s.title}
                    </h2>
                  </div>
                </div>
                <p className="text-[15.5px] text-[color:var(--charcoal)] leading-[1.75] font-light max-w-[52ch]">
                  {s.line}
                </p>
              </article>
            ))}
          </div>

          <div className="reveal mt-20 text-center">
            <Link
              to="/builder"
              className="inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-white border border-[color:var(--gold)]/60 hover:border-[color:var(--gold)] px-8 py-4 text-sm uppercase tracking-[0.18em] transition-all duration-500 hover:-translate-y-0.5"
            >
              Design &amp; Secure Your Experience
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
