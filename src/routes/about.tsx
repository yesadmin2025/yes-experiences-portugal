import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CtaButton } from "@/components/ui/CtaButton";
import { Heart, Users, Star, Compass, Clock, Shield, Leaf } from "lucide-react";
import imgWhy from "@/assets/why-image.jpg";
import imgCoastal from "@/assets/edit-coastal-road.jpg";
import imgWinery from "@/assets/edit-winery.jpg";
import imgMarket from "@/assets/edit-market.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — YES experiences Portugal" },
      {
        name: "description",
        content:
          "We design private, meaningful Portugal experiences — not tours. A small studio of local designers, hosts and experts. Get to know YES.",
      },
    ],
  }),
  component: Page,
});

const stats = [
  { value: "700+", label: "Five-star reviews" },
  { value: "10+", label: "Years designing Portugal" },
  { value: "100%", label: "Private experiences" },
  { value: "3", label: "Ways to shape your journey" },
];

const values = [
  {
    icon: <Compass size={20} />,
    title: "Local from the start",
    body: "Every route, timing and hidden detail is guided by real local knowledge — not call centres, not algorithms.",
  },
  {
    icon: <Shield size={20} />,
    title: "Absolute discretion",
    body: "Proposals, celebrations, corporate moments — handled with care, privacy and attention to what matters.",
  },
  {
    icon: <Users size={20} />,
    title: "Designed around you",
    body: "We don't sell fixed tours. We shape each experience around the people taking it — your rhythm, your occasion.",
  },
  {
    icon: <Heart size={20} />,
    title: "Crafted with care",
    body: "Small details make the difference: the right winery, the quiet viewpoint, the table by the water. We know them all.",
  },
  {
    icon: <Clock size={20} />,
    title: "Confirmed instantly",
    body: "Book a Signature, tailor the details, or build from scratch in the Studio. Confirmation arrives in minutes.",
  },
  {
    icon: <Leaf size={20} />,
    title: "Rooted in Portugal",
    body: "We work with family wineries, local guides and independent producers — people who love what they do.",
  },
];

const gallery = [
  { src: imgCoastal, alt: "Coastal road, Sintra" },
  { src: imgWinery, alt: "Family winery, Arrábida" },
  { src: imgMarket, alt: "Local market, Lisbon" },
];

function Page() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-[color:var(--sand)] text-center">
        <div className="container-x">
          <Eyebrow flank>About YES</Eyebrow>
          <SectionTitle as="h1" size="anchor" spacing="loose">
            We design <SectionTitle.Em>meaningful Portugal</SectionTitle.Em>.
          </SectionTitle>
          <p className="mt-6 max-w-2xl mx-auto text-[16px] md:text-[18px] text-[color:var(--charcoal-soft)] leading-[1.75] font-light">
            A small studio of designers, hosts and local experts. We don't sell tours — we craft
            journeys around the people taking them, quietly and with absolute care for detail.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[color:var(--charcoal)] py-12 md:py-16">
        <div className="container-x">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-[color:var(--ivory)]/10 list-none p-0 m-0">
            {stats.map((s) => (
              <li key={s.label} className="text-center md:px-8">
                <p className="serif text-[2.8rem] md:text-[3.4rem] leading-none font-medium text-[color:var(--gold)]">
                  {s.value}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.28em] font-semibold text-[color:var(--ivory)]/70">
                  {s.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Story section */}
      <section className="py-20 md:py-28 bg-[color:var(--ivory)]">
        <div className="container-x grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div className="relative">
            <img
              src={imgWhy}
              alt="YES experiences — Portugal"
              loading="lazy"
              className="w-full aspect-[4/5] object-cover shadow-[0_30px_60px_-20px_rgba(41,91,97,0.25)]"
            />
            <div className="absolute -bottom-6 -right-6 hidden lg:block bg-[color:var(--teal)] text-[color:var(--ivory)] px-6 py-5 max-w-[220px]">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} fill="currentColor" strokeWidth={0} className="text-[color:var(--gold)]" />
                ))}
              </div>
              <p className="serif italic text-[1rem] leading-[1.4]">
                "The best day of our trip — by far."
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.22em] opacity-70">
                Sarah &amp; James, London
              </p>
            </div>
          </div>
          <div>
            <Eyebrow>Our story</Eyebrow>
            <SectionTitle as="h2" size="default" spacing="normal">
              Portugal, designed <SectionTitle.Em>around you</SectionTitle.Em>.
            </SectionTitle>
            <div className="mt-6 space-y-5 text-[color:var(--charcoal-soft)] leading-[1.8] text-[15.5px] md:text-[17px] font-light">
              <p>
                YES experiences Portugal was born from a simple belief: that the best way to
                discover a country is with someone who lives there — someone who knows the quiet
                road, the family winery, the table by the water.
              </p>
              <p>
                We are a small studio of designers, hosts and local experts. Every experience is
                designed in Portugal, by people who live here, for travellers who want something
                more than a checklist.
              </p>
              <p>
                We don't sell tours. We craft journeys — shaped around the people taking them,
                their rhythm, their occasion, their intention.
              </p>
            </div>
            <blockquote className="mt-8 border-l-2 border-[color:var(--gold)] pl-6">
              <p className="serif italic text-[1.35rem] md:text-[1.5rem] text-[color:var(--teal)] leading-[1.45]">
                "Portugal feels different to everyone. That's why we let you choose, shape and book
                around your story."
              </p>
            </blockquote>
            <div className="mt-8 flex flex-wrap gap-4">
              <CtaButton to="/builder" variant="primary">
                Begin Your Story
              </CtaButton>
              <CtaButton to="/contact" variant="ghost">
                Talk to a Local
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      {/* Values grid */}
      <section className="py-20 md:py-28 bg-[color:var(--sand)]">
        <div className="container-x">
          <div className="text-center mb-12 md:mb-16">
            <Eyebrow flank>What we stand for</Eyebrow>
            <SectionTitle as="h2" size="default" spacing="normal">
              Six things that make <SectionTitle.Em>YES different</SectionTitle.Em>.
            </SectionTitle>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {values.map((v) => (
              <article
                key={v.title}
                className="group bg-[color:var(--ivory)] p-8 border border-[color:var(--charcoal)]/8 hover:border-[color:var(--gold)]/60 hover:shadow-[0_8px_30px_-10px_rgba(41,91,97,0.15)] transition-all duration-500"
              >
                <div className="h-10 w-10 rounded-full bg-[color:var(--teal)]/10 flex items-center justify-center text-[color:var(--teal)] mb-5 group-hover:bg-[color:var(--teal)] group-hover:text-[color:var(--ivory)] transition-colors duration-300">
                  {v.icon}
                </div>
                <h3 className="serif text-[1.15rem] md:text-[1.25rem] text-[color:var(--charcoal)] font-medium mb-3">
                  {v.title}
                </h3>
                <p className="text-[14.5px] md:text-[15px] text-[color:var(--charcoal-soft)] leading-[1.75] font-light">
                  {v.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      <section className="py-16 md:py-20 bg-[color:var(--charcoal)] overflow-hidden">
        <div className="container-x">
          <div className="text-center mb-10">
            <Eyebrow tone="onDark" flank>The Portugal we travel ourselves</Eyebrow>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {gallery.map((g) => (
              <div key={g.alt} className="relative overflow-hidden aspect-[4/3] group">
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/60 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-4 text-[11px] uppercase tracking-[0.22em] text-[color:var(--ivory)]/80 font-semibold">
                  {g.alt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 md:py-28 bg-[color:var(--ivory)] text-center">
        <div className="container-x max-w-2xl mx-auto">
          <Eyebrow flank>Ready to begin?</Eyebrow>
          <SectionTitle as="h2" size="default" spacing="normal">
            Your Portugal story <SectionTitle.Em>starts here</SectionTitle.Em>.
          </SectionTitle>
          <p className="mt-5 text-[color:var(--charcoal-soft)] leading-[1.75] font-light">
            Explore a Signature, tailor the details, or build from scratch with a local.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CtaButton to="/experiences" variant="primary">
              Explore Experiences
            </CtaButton>
            <CtaButton to="/contact" variant="ghost">
              Talk to a Local
            </CtaButton>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
