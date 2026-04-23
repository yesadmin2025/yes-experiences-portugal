import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import heroImg from "@/assets/hero-coast.jpg";
import whyImg from "@/assets/why-image.jpg";
import multiDayImg from "@/assets/multi-day.jpg";
import expWine from "@/assets/exp-wine.jpg";
import expCoastal from "@/assets/exp-coastal.jpg";
import expGastronomy from "@/assets/exp-gastronomy.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expRomantic from "@/assets/exp-romantic.jpg";
import expStreet from "@/assets/exp-street.jpg";
import catPrivate from "@/assets/cat-private.jpg";
import catMultiday from "@/assets/cat-multiday.jpg";
import catCorporate from "@/assets/cat-corporate.jpg";
import catProposals from "@/assets/cat-proposals.jpg";
import { ArrowRight, Star, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YES experiences Portugal — Portugal, Designed Around You" },
      {
        name: "description",
        content:
          "Private, designed Portugal experiences — bespoke day tours, multi-day journeys, and celebrations crafted around your story by passionate local experts.",
      },
      { property: "og:title", content: "YES experiences Portugal" },
      {
        property: "og:description",
        content: "Portugal, Designed Around You — private experiences crafted by local experts.",
      },
    ],
  }),
  component: HomePage,
});

const categories = [
  {
    title: "Private Experiences",
    desc: "Tailor-made journeys designed around your interests and pace.",
    img: catPrivate,
    to: "/experiences",
  },
  {
    title: "Multi-Day Journeys",
    desc: "Discover Portugal deeper through curated multi-day experiences.",
    img: catMultiday,
    to: "/multi-day",
  },
  {
    title: "Corporate & Incentive Travel",
    desc: "Expressive and immersive experiences with authentic Portuguese character.",
    img: catCorporate,
    to: "/corporate",
  },
  {
    title: "Proposals & Celebrations",
    desc: "Romantic, intimate and milestone moments designed to be unforgettable.",
    img: catProposals,
    to: "/proposals",
  },
];

const signatures = [
  { title: "Wine", img: expWine },
  { title: "Coastal", img: expCoastal },
  { title: "Gastronomy", img: expGastronomy },
  { title: "Nature", img: expNature },
  { title: "Romantic", img: expRomantic },
  { title: "Heritage", img: expStreet },
];

const reviews = [
  {
    quote:
      "Travel beyond the highlights. YES designed a multi-day journey connecting Portugal's coast, culture, gastronomy and hidden landscapes.",
    name: "Sarah T.",
    location: "San Francisco",
  },
  {
    quote:
      "A bespoke experience without the noise — authentic, refined and meticulously thought through from start to finish.",
    name: "Pierre L.",
    location: "Paris",
  },
  {
    quote:
      "A perfect, unique highlight of our year. They captured Portugal's coast, culture and quiet magic perfectly.",
    name: "Akiko M.",
    location: "Tokyo",
  },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">
        <img
          src={heroImg}
          alt="Portuguese Atlantic coastline at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/40" />

        <div className="container-x relative z-10 pb-20 md:pb-28 pt-32">
          <div className="max-w-2xl text-[color:var(--ivory)]">
            <span className="eyebrow text-[color:var(--gold-soft)]">
              Portugal · Private · Designed
            </span>
            <h1 className="serif mt-6 text-5xl md:text-7xl leading-[1.05] font-light">
              Portugal,
              <br />
              <span className="italic">Designed Around You</span>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--ivory)]/85 max-w-xl leading-relaxed">
              Private experiences created around your story — discover authentic Portugal with
              passionate local experts and unforgettable moments.
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[color:var(--gold-soft)]">
              Trusted by international travelers visiting authentic Portugal
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/builder"
                className="group inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide transition-all"
              >
                Design Your Portugal Experience
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/experiences"
                className="group inline-flex items-center gap-2 border border-[color:var(--ivory)]/60 hover:border-[color:var(--ivory)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide transition-all"
              >
                Explore Signature Experiences
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-[color:var(--sand)] py-10">
        <div className="container-x flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex gap-0.5 text-[color:var(--gold)]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <span className="text-[color:var(--charcoal-soft)]">
              Trusted by international travelers — 600+ 5-star reviews
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[color:var(--charcoal-soft)]">
            <span className="font-medium">Tripadvisor</span>
            <span className="text-[color:var(--gold)]">·</span>
            <span className="font-medium">Viator</span>
            <span className="text-[color:var(--gold)]">·</span>
            <span className="font-medium">Google</span>
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)] mt-2">
            Top rated private Portugal experiences
          </p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 md:py-32">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow">Our Experiences</span>
            <h2 className="serif text-4xl md:text-5xl mt-5 leading-tight">
              Private Experiences, <span className="italic">Designed Around You</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((c) => (
              <Link
                key={c.title}
                to={c.to}
                className="group block"
              >
                <div className="relative overflow-hidden aspect-[3/4] mb-5 rounded-sm">
                  <img
                    src={c.img}
                    alt={c.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                </div>
                <h3 className="serif text-xl text-[color:var(--charcoal)] group-hover:text-[color:var(--teal)] transition-colors">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--charcoal-soft)] leading-relaxed">
                  {c.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY TRAVELERS CHOOSE */}
      <section className="bg-[color:var(--sand)] py-24 md:py-32">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="eyebrow">Why YES</span>
              <h2 className="serif text-4xl md:text-5xl mt-5 leading-tight">
                Why Travelers <br />
                Choose <span className="italic">YES Experiences</span>
              </h2>
              <p className="mt-6 text-[color:var(--charcoal-soft)] leading-relaxed">
                We believe the best journeys are personal. Every YES experience is thoughtfully
                curated around each traveler — combining authentic local insight with meaningful
                moments.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Authentic local insight",
                  "Private personalized experiences",
                  "Hidden gems beyond tourist routes",
                  "Designed around each traveler",
                  "Trusted by international clients",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[color:var(--charcoal)]"
                  >
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--teal)] text-[color:var(--ivory)] flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="text-[15px]">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 serif italic text-xl text-[color:var(--teal)]">
                We don't sell tours. We design meaningful Portugal experiences.
              </p>
            </div>
            <div className="relative">
              <img
                src={whyImg}
                alt="Sunlit Portuguese street"
                loading="lazy"
                className="w-full aspect-[4/5] object-cover rounded-sm"
              />
              <div className="absolute -bottom-6 -right-6 hidden md:block w-32 h-32 border border-[color:var(--gold)]" />
            </div>
          </div>
        </div>
      </section>

      {/* SIGNATURE EXPERIENCES */}
      <section className="py-24 md:py-32">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow">Signature</span>
            <h2 className="serif text-4xl md:text-5xl mt-5 leading-tight">
              Signature Portugal <span className="italic">Experiences</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
            {signatures.map((s) => (
              <Link
                key={s.title}
                to="/experiences"
                className="group relative overflow-hidden aspect-[4/5] block rounded-sm"
              >
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="serif italic text-2xl md:text-3xl text-[color:var(--ivory)]">
                    {s.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--gold-soft)]">
                    Discover Experiences
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MULTI-DAY */}
      <section className="bg-[color:var(--sand)] py-24 md:py-32">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="lg:order-2">
              <span className="eyebrow">Multi-Day</span>
              <h2 className="serif text-4xl md:text-5xl mt-5 leading-tight">
                Your Portugal Story, <br />
                <span className="italic">Designed Across Days</span>
              </h2>
              <p className="mt-6 text-[color:var(--charcoal-soft)] leading-relaxed max-w-lg">
                Travel beyond the highlights with bespoke multi-day journeys connecting
                Portugal's coast, culture, gastronomy and hidden landscapes.
              </p>
              <Link
                to="/multi-day"
                className="mt-8 inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide transition-all"
              >
                Explore Multi-Day Journeys
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="lg:order-1">
              <img
                src={multiDayImg}
                alt="Aerial view of Douro Valley vineyards"
                loading="lazy"
                className="w-full aspect-[5/4] object-cover rounded-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24 md:py-32">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow">Voices</span>
            <h2 className="serif text-4xl md:text-5xl mt-5">Reviews</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((r, i) => (
              <div key={i} className="bg-[color:var(--card)] p-8 border-t-2 border-[color:var(--gold)] shadow-[var(--shadow-card)]">
                <div className="flex gap-0.5 text-[color:var(--gold)] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <p className="serif italic text-lg leading-relaxed text-[color:var(--charcoal)]">
                  "{r.quote}"
                </p>
                <div className="mt-6 pt-4 border-t border-[color:var(--border)]">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-[color:var(--charcoal-soft)] mt-0.5">
                    {r.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 md:pb-32">
        <div className="container-x">
          <div className="relative bg-[color:var(--sand)] p-12 md:p-20 overflow-hidden">
            <Sparkles
              className="absolute top-8 right-8 text-[color:var(--gold)]/40"
              size={48}
            />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-[color:var(--gold)]/20" />
            <div className="absolute -top-10 right-1/3 w-40 h-40 rounded-full border border-[color:var(--gold)]/15" />
            <div className="relative max-w-2xl">
              <h2 className="serif text-4xl md:text-5xl leading-tight">
                Ready to Design Your <br />
                <span className="italic text-[color:var(--teal)]">Portugal Experience?</span>
              </h2>
              <p className="mt-6 text-[color:var(--charcoal-soft)]">
                Start planning your unique Portugal journey and create memories that will last
                a lifetime.
              </p>
              <Link
                to="/builder"
                className="mt-8 inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide transition-all"
              >
                Start Your Portugal Story
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
