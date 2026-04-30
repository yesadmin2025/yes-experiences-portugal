import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, MessageCircle, Compass, MapPin, Calendar } from "lucide-react";
import imgTroiaBeach from "@/assets/tours/troia-comporta/beach.jpg";
import imgArrabidaWineLunch from "@/assets/tours/arrabida-wine-allinclusive/lunch.jpg";
import imgSintraEstates from "@/assets/tours/sintra-cascais/estates.jpg";

export const Route = createFileRoute("/multi-day")({
  head: () => ({
    meta: [
      { title: "Multi-Day Journeys Across Portugal — YES experiences" },
      {
        name: "description",
        content:
          "Private multi-day journeys across Portugal — realistic timing, local flow, and support from people who know how each day should connect.",
      },
      { property: "og:title", content: "Multi-Day Journeys Across Portugal" },
      {
        property: "og:description",
        content:
          "More than one day. One coherent journey — built with realistic timing and local flow.",
      },
      { property: "og:image", content: imgTroiaBeach },
      { property: "twitter:image", content: imgTroiaBeach },
    ],
  }),
  component: MultiDayPage,
});

const BLOCKS = [
  {
    eyebrow: "How it connects",
    title: "Days that lead into each other.",
    emotional:
      "Not a checklist of regions — a real rhythm, with the right pacing between each day.",
    practical:
      "2–7 days · realistic driving times · curated overnight stops · transitions designed around your pace.",
    local:
      "Designed in conversation with a local team — never a copy-paste itinerary.",
    image: imgTroiaBeach,
    icon: Calendar,
  },
  {
    eyebrow: "Where it goes",
    title: "Across Portugal, with intention.",
    emotional:
      "Lisbon, Arrábida, Alentejo, Douro — chosen because they belong in your story, not because they're on a list.",
    practical:
      "Region selection based on your interests, season and time available. We tell you honestly what fits and what doesn't.",
    local:
      "Routed by people who know which villages welcome guests and which roads are worth the drive.",
    image: imgSintraEstates,
    icon: MapPin,
  },
  {
    eyebrow: "Who's behind it",
    title: "Local support, every day.",
    emotional:
      "You're never on your own. There's always someone reachable when something needs to shift.",
    practical:
      "Daily local contact · in-country adjustments · transport coordination · trusted partners on the ground.",
    local:
      "We handle the moving parts so the trip feels effortless — even when plans change mid-journey.",
    image: imgArrabidaWineLunch,
    icon: Compass,
  },
];

function MultiDayPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="pt-28 pb-14 bg-[color:var(--sand)] reveal">
        <div className="container-x max-w-3xl text-center">
          <span className="eyebrow">Multi-Day Journeys</span>
          <h1 className="font-display font-bold text-[2.4rem] md:text-[3.6rem] leading-[1.05] mt-5 text-[color:var(--charcoal)]">
            More than one day.{" "}
            <span className="font-serif italic font-normal text-[color:var(--teal)]">
              One coherent journey.
            </span>
          </h1>
          <span className="gold-rule mt-6 mx-auto max-w-[80px]" aria-hidden="true" />
          <p className="mt-6 text-[1rem] md:text-[1.1rem] text-[color:var(--charcoal-soft)] leading-relaxed">
            Build Portugal across regions with realistic timing, <span className="kw">local flow</span> and
            support from people who know how each day should connect.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/builder"
              className="group inline-flex items-center justify-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide transition-all duration-200 hover:-translate-y-[2px] min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--teal)]"
            >
              Plan a Multi-Day Journey
              <ArrowRight size={16} className="cta-arrow" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border border-[color:var(--charcoal)]/25 text-[color:var(--charcoal)] hover:border-[color:var(--teal)] hover:text-[color:var(--teal)] px-7 py-3.5 text-sm tracking-wide transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--teal)]"
            >
              <MessageCircle size={16} />
              Talk to a Local
            </Link>
          </div>
        </div>
      </section>

      {/* Service blocks */}
      <section className="py-16 md:py-24">
        <div className="container-x space-y-16 md:space-y-24">
          {BLOCKS.map((b, i) => {
            const Icon = b.icon;
            const reverse = i % 2 === 1;
            return (
              <article
                key={b.eyebrow}
                className={`reveal-stagger grid lg:grid-cols-2 gap-8 md:gap-12 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="overflow-hidden">
                  <img
                    src={b.image}
                    alt={b.title}
                    loading="lazy"
                    className="w-full aspect-[4/5] md:aspect-[5/6] object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 text-[color:var(--gold)]">
                    <Icon size={16} strokeWidth={1.8} />
                    <span className="eyebrow">{b.eyebrow}</span>
                  </div>
                  <span className="gold-rule mt-4 max-w-[64px]" aria-hidden="true" />
                  <h2 className="font-display font-bold text-[1.85rem] md:text-[2.35rem] leading-[1.1] mt-4 text-[color:var(--charcoal)]">
                    {b.title}
                  </h2>
                  <p className="mt-4 font-serif italic text-[1.1rem] md:text-[1.2rem] text-[color:var(--teal)] leading-snug">
                    {b.emotional}
                  </p>
                  <p className="mt-4 text-[color:var(--charcoal-soft)] leading-relaxed">
                    {b.practical}
                  </p>
                  <div className="mt-5 pl-4 border-l-2 border-[color:var(--gold)] text-sm text-[color:var(--charcoal-soft)] leading-relaxed">
                    {b.local}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 md:py-20 bg-[color:var(--sand)] reveal">
        <div className="container-x max-w-2xl text-center">
          <h2 className="font-display font-bold text-[1.85rem] md:text-[2.5rem] leading-tight text-[color:var(--charcoal)]">
            Start in the Studio, or talk to a local.
          </h2>
          <span className="gold-rule mt-5 mx-auto max-w-[64px]" aria-hidden="true" />
          <p className="mt-5 text-[color:var(--charcoal-soft)] leading-relaxed">
            Sketch the route yourself in real time, or tell us what you have in
            mind and we'll shape it with you.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/builder"
              className="group inline-flex items-center justify-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide transition-all duration-200 hover:-translate-y-[2px] min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--teal)]"
            >
              Open the Studio
              <ArrowRight size={16} className="cta-arrow" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border border-[color:var(--charcoal)]/25 text-[color:var(--charcoal)] hover:border-[color:var(--teal)] hover:text-[color:var(--teal)] px-7 py-3.5 text-sm tracking-wide transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--teal)]"
            >
              <MessageCircle size={16} />
              Talk to a Local
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
