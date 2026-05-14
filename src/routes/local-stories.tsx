import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import editCoastal from "@/assets/edit-coastal-road.jpg";
import editWinery from "@/assets/edit-winery.jpg";
import editMarket from "@/assets/edit-market.jpg";
import editViewpoint from "@/assets/edit-viewpoint.jpg";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CtaButton } from "@/components/ui/CtaButton";
import { ArrowRight } from "lucide-react";

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

const featured = {
  title: "Hidden Coastal Roads",
  subtitle: "Sintra to Cabo da Roca — the drive no guidebook gets right",
  body: "Pine-scented bends, an empty cove, a shack where the fishermen eat lunch. The road from Sintra to Cabo da Roca takes forty minutes if you follow the signs. It takes three hours if you know where to stop — and we do. This is the Portugal we return to, again and again.",
  img: editCoastal,
  tag: "Coastal",
  region: "Sintra / Cascais",
  readTime: "4 min read",
};

const stories = [
  {
    title: "Family Wineries",
    line: "Three generations, one cellar door, a glass poured by the winemaker himself. No tasting menu, no script — just the year's vintage and an unhurried afternoon.",
    img: editWinery,
    tag: "Wine & Food",
    region: "Arrábida",
  },
  {
    title: "Local Markets at Dawn",
    line: "Where breakfast is a pastel de nata and the day's plan is written on a napkin. We know the bakers, the cheesemakers, the woman who still salts her own olives.",
    img: editMarket,
    tag: "Culture",
    region: "Lisbon",
  },
  {
    title: "Secret Viewpoints",
    line: "A bend in the road. A stone wall. The whole valley below — and nobody else. The kind of place you only find if someone who lives here points the way.",
    img: editViewpoint,
    tag: "Nature",
    region: "Sintra",
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

      {/* Featured story */}
      <section className="py-16 md:py-24 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative overflow-hidden aspect-[4/3] group shadow-[0_20px_50px_-20px_rgba(41,91,97,0.25)]">
              <img
                src={featured.img}
                alt={featured.title}
                loading="eager"
                className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/50 via-transparent to-transparent" />
              <div className="absolute top-5 left-5">
                <span className="inline-block bg-[color:var(--teal)] text-[color:var(--ivory)] text-[10px] uppercase tracking-[0.22em] font-semibold px-3 py-1.5">
                  Featured
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[color:var(--teal)] bg-[color:var(--teal)]/10 px-3 py-1">
                  {featured.tag}
                </span>
                <span className="text-[11px] text-[color:var(--charcoal-soft)] uppercase tracking-[0.18em]">
                  {featured.region}
                </span>
                <span className="text-[color:var(--charcoal-soft)]/40">·</span>
                <span className="text-[11px] text-[color:var(--charcoal-soft)]">{featured.readTime}</span>
              </div>
              <h2 className="serif text-[1.8rem] md:text-[2.4rem] text-[color:var(--charcoal)] font-medium leading-[1.15] tracking-[-0.015em]">
                {featured.title}
              </h2>
              <p className="mt-3 text-[14px] text-[color:var(--charcoal-soft)] uppercase tracking-[0.18em] font-medium">
                {featured.subtitle}
              </p>
              <p className="mt-6 text-[15.5px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.8] font-light">
                {featured.body}
              </p>
              <div className="mt-8">
                <CtaButton to="/builder" variant="ghost" icon={<ArrowRight size={14} />}>
                  Design this experience
                </CtaButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial quote */}
      <section className="py-14 md:py-16 bg-[color:var(--sand)]">
        <div className="container-x max-w-3xl mx-auto text-center">
          <span className="block h-px w-12 bg-[color:var(--gold)] mx-auto mb-8" />
          <blockquote className="serif italic text-[1.4rem] md:text-[1.75rem] text-[color:var(--charcoal)] leading-[1.5] font-normal tracking-[-0.01em]">
            "The best places in Portugal are the ones that don't have a name on any map. We know
            where they are — and we'll take you there."
          </blockquote>
          <p className="mt-6 text-[11px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal-soft)]">
            — YES experiences Portugal
          </p>
        </div>
      </section>

      {/* Stories grid */}
      <section className="py-20 md:py-28 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="flex items-center justify-between mb-10 md:mb-14">
            <div>
              <Eyebrow>More stories</Eyebrow>
              <SectionTitle as="h2" size="compact" spacing="tight">
                From the <SectionTitle.Em>road</SectionTitle.Em>.
              </SectionTitle>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {stories.map((s) => (
              <article key={s.title} className="group">
                <div className="relative overflow-hidden aspect-[4/3] mb-5 shadow-[0_10px_30px_-22px_rgba(46,46,46,0.35)] group-hover:shadow-[0_24px_50px_-22px_rgba(41,91,97,0.28)] transition-shadow duration-700">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/65 via-transparent to-transparent" />
                  <div className="absolute left-5 right-5 bottom-5">
                    <span className="block h-px w-8 bg-[color:var(--gold)] mb-3 opacity-90" />
                    <h3 className="serif text-[1.3rem] md:text-[1.5rem] leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                      {s.title}
                    </h3>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="inline-block bg-[color:var(--charcoal)]/70 text-[color:var(--ivory)] text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1">
                      {s.tag}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--teal)] font-semibold mb-2">
                  {s.region}
                </p>
                <p className="text-[15px] text-[color:var(--charcoal)] leading-[1.75] font-light">
                  {s.line}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-16 md:mt-20 text-center">
            <CtaButton to="/builder" variant="primary">
              Design &amp; Secure Your Experience
            </CtaButton>
          </div>
        </div>
      </section>

      {/* Studio CTA */}
      <section className="py-16 md:py-20 bg-[color:var(--charcoal)] text-center">
        <div className="container-x max-w-2xl mx-auto">
          <Eyebrow tone="onDark" flank>Experience Studio</Eyebrow>
          <SectionTitle as="h2" size="compact" spacing="normal">
            <span className="text-[color:var(--ivory)]">
              Build your own <SectionTitle.Em>local story</SectionTitle.Em>.
            </span>
          </SectionTitle>
          <p className="mt-5 text-[color:var(--ivory)]/70 leading-[1.75] font-light text-[15px]">
            Choose your mood, rhythm and intention. Watch your private experience take shape in real
            time — with a local by your side.
          </p>
          <div className="mt-8">
            <CtaButton to="/builder" variant="primary">
              Open the Studio
            </CtaButton>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
