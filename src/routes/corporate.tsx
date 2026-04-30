import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, MessageCircle, Users, Compass, ClipboardCheck } from "lucide-react";
import imgFatimaNazare from "@/assets/tours/fatima-nazare-obidos/nazare.jpg";
import imgArrabidaWineLunch from "@/assets/tours/arrabida-wine-allinclusive/lunch.jpg";
import imgSintraEstates from "@/assets/tours/sintra-cascais/estates.jpg";

export const Route = createFileRoute("/corporate")({
  head: () => ({
    meta: [
      { title: "Corporate & Private Groups in Portugal — YES experiences" },
      {
        name: "description",
        content:
          "Private group days in Portugal — local experiences, timing, transport and logistics handled end to end by a local team.",
      },
      { property: "og:title", content: "Corporate & Private Groups in Portugal" },
      {
        property: "og:description",
        content:
          "Private group days, designed end to end by a local team — never the generic formula.",
      },
      { property: "og:image", content: imgFatimaNazare },
      { property: "twitter:image", content: imgFatimaNazare },
    ],
  }),
  component: CorporatePage,
});

const BLOCKS = [
  {
    eyebrow: "Executive & Incentive",
    title: "A day that feels effortless, not arranged.",
    emotional:
      "Your team arrives, the day unfolds, nothing feels stitched together. That's the work behind it.",
    practical:
      "Up to 30 guests · private transport · invoice & DMC support · designed around your goals.",
    local:
      "We handle the moving parts on the ground — real driving times, real venues, real partners.",
    image: imgArrabidaWineLunch,
    icon: Users,
  },
  {
    eyebrow: "Off-sites & Retreats",
    title: "Local Portugal, designed for working groups.",
    emotional:
      "Space to think, eat well, and feel the place — without the conference-hotel feeling.",
    practical:
      "Multi-day flow, regional logistics, meeting-friendly venues, cultural moments built into the rhythm.",
    local:
      "Coordinated by a local host who knows how each piece of the day connects.",
    image: imgSintraEstates,
    icon: Compass,
  },
  {
    eyebrow: "Client Hosting & VIP",
    title: "Quiet, considered, fully discreet.",
    emotional:
      "When it matters who's in the room and how the day feels — we shape it accordingly.",
    practical:
      "Small groups · private settings · careful pacing · NDAs welcome.",
    local:
      "Planned end to end with our local team — every detail confirmed before the day.",
    image: imgFatimaNazare,
    icon: ClipboardCheck,
  },
];

function CorporatePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="pt-28 pb-14 bg-[color:var(--sand)]">
        <div className="container-x max-w-3xl text-center">
          <span className="eyebrow">For Teams & Private Groups</span>
          <h1 className="font-display font-bold text-[2.4rem] md:text-[3.6rem] leading-[1.05] mt-5 text-[color:var(--charcoal)]">
            Private group days,{" "}
            <span className="font-serif italic font-normal text-[color:var(--teal)]">
              without the generic formula.
            </span>
          </h1>
          <p className="mt-5 text-[1rem] md:text-[1.1rem] text-[color:var(--charcoal-soft)] leading-relaxed">
            For teams, incentives and private groups, we combine local
            experiences, timing, transport and logistics into a day that feels
            effortless.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide transition-colors"
            >
              Plan a Group Experience
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border border-[color:var(--charcoal)]/20 text-[color:var(--charcoal)] hover:border-[color:var(--teal)] hover:text-[color:var(--teal)] px-7 py-3.5 text-sm tracking-wide transition-colors"
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
                className={`grid lg:grid-cols-2 gap-8 md:gap-12 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="overflow-hidden">
                  <img
                    src={b.image}
                    alt={b.title}
                    loading="lazy"
                    className="w-full aspect-[4/5] md:aspect-[5/6] object-cover transition-transform duration-700 hover:scale-[1.02]"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 text-[color:var(--gold)]">
                    <Icon size={16} strokeWidth={1.6} />
                    <span className="eyebrow">{b.eyebrow}</span>
                  </div>
                  <h2 className="font-display font-bold text-[1.75rem] md:text-[2.25rem] leading-[1.1] mt-4 text-[color:var(--charcoal)]">
                    {b.title}
                  </h2>
                  <p className="mt-4 font-serif italic text-[1.05rem] md:text-[1.15rem] text-[color:var(--teal)] leading-snug">
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
      <section className="py-16 md:py-20 bg-[color:var(--sand)]">
        <div className="container-x max-w-2xl text-center">
          <h2 className="font-display font-bold text-[1.75rem] md:text-[2.4rem] leading-tight text-[color:var(--charcoal)]">
            Tell us about your group.
          </h2>
          <p className="mt-4 text-[color:var(--charcoal-soft)]">
            Real driving times, real venues, real partners. We shape the
            proposal around what your team actually needs — never a copy-paste
            template.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide"
            >
              Request a Proposal
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border border-[color:var(--charcoal)]/20 text-[color:var(--charcoal)] hover:border-[color:var(--teal)] hover:text-[color:var(--teal)] px-7 py-3.5 text-sm tracking-wide"
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
