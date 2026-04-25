import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { FAQ } from "@/components/FAQ";
import heroImg from "@/assets/hero-coast.jpg";
import multiDayImg from "@/assets/multi-day.jpg";
import expWine from "@/assets/exp-wine.jpg";
import expCoastal from "@/assets/exp-coastal.jpg";
import expStreet from "@/assets/exp-street.jpg";
import catPrivate from "@/assets/cat-private.jpg";
import catMultiday from "@/assets/cat-multiday.jpg";
import catCorporate from "@/assets/cat-corporate.jpg";
import catProposals from "@/assets/cat-proposals.jpg";
import editCoastal from "@/assets/edit-coastal-road.jpg";
import editWinery from "@/assets/edit-winery.jpg";
import editMarket from "@/assets/edit-market.jpg";
import editViewpoint from "@/assets/edit-viewpoint.jpg";
import { ArrowRight, Star, MapPin, Compass, Clock } from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YES experiences Portugal — Portugal, Designed Around You" },
      {
        name: "description",
        content:
          "Private Portugal experiences crafted through local knowledge, hidden gems and authentic moments — like exploring Portugal with a local friend.",
      },
      { property: "og:title", content: "Portugal, Designed Around You — YES experiences" },
      {
        property: "og:description",
        content:
          "Private experiences crafted through local knowledge, hidden gems and authentic moments — like exploring Portugal with a local friend.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: HomePage,
});

const types = [
  {
    title: "Private Day Experiences",
    line: "One unhurried day, designed entirely around you — at your pace, in your story.",
    img: catPrivate,
    to: "/day-tours",
  },
  {
    title: "Multi-Day Journeys",
    line: "Several days woven into one continuous story — coast to vineyard, city to village.",
    img: catMultiday,
    to: "/multi-day",
  },
  {
    title: "Corporate & Incentive",
    line: "Refined private programs for teams who deserve more than a hotel ballroom.",
    img: catCorporate,
    to: "/corporate",
  },
  {
    title: "Proposals & Celebrations",
    line: "Quietly extraordinary moments — proposals, anniversaries, milestones to remember.",
    img: catProposals,
    to: "/proposals",
  },
];

const signatures = [
  {
    title: "A Day in Hidden Douro",
    img: expWine,
    line: "Family wineries, schist terraces, a long lunch above the river — far from the bus routes.",
    pace: ["Morning vineyard walk", "Long table lunch", "Sunset tasting"],
  },
  {
    title: "Wild Atlantic Coast",
    img: expCoastal,
    line: "Coastal roads only locals drive, a fishermen's lunch, a hidden cove with no one else in sight.",
    pace: ["Cliff walk", "Seafood by the harbor", "Hidden cove"],
  },
  {
    title: "Lisbon Through Locals",
    img: expStreet,
    line: "The Lisbon postcards never see — quiet neighborhoods, ateliers and family-run tascas.",
    pace: ["Morning market", "Artisan visit", "Family tavern lunch"],
  },
];

const editorial = [
  {
    title: "Hidden Coastal Roads",
    line: "The drive from Sintra to Cabo da Roca that no guidebook quite gets right.",
    img: editCoastal,
  },
  {
    title: "Family Wineries",
    line: "Three generations, one cellar door, a glass poured by the winemaker himself.",
    img: editWinery,
  },
  {
    title: "Local Markets at Dawn",
    line: "Where breakfast is a pastel de nata and the day's plan is written on a napkin.",
    img: editMarket,
  },
  {
    title: "Secret Viewpoints",
    line: "A bend in the road. A stone wall. The whole valley below — and nobody else.",
    img: editViewpoint,
  },
];

const reviews = [
  {
    quote:
      "It felt like traveling Portugal with a local friend. Every stop was somewhere we'd never have found ourselves.",
    name: "Sarah T.",
    location: "San Francisco",
  },
  {
    quote:
      "Quiet luxury done properly. No itineraries shoved at us — just thoughtful, beautifully timed moments.",
    name: "Pierre L.",
    location: "Paris",
  },
  {
    quote:
      "Our 12 guests, fully private, completely seamless. They handled everything with extraordinary grace.",
    name: "Akiko M.",
    location: "Tokyo",
  },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* 1 — HERO
          Cinematic image, slow zoom, layered overlays for AA-compliant
          contrast on the headline and microcopy. */}
      <section className="relative min-h-[80vh] md:min-h-[94vh] flex items-end overflow-hidden">
        <img
          src={heroImg}
          alt="Hidden coastal road in Portugal at golden hour"
          className="absolute inset-0 w-full h-full object-cover object-center scale-110 animate-[heroZoom_32s_ease-out_forwards]"
          width={1920}
          height={1080}
        />
        {/* Dark gradient + radial vignette — keeps copy effortlessly readable
            without flattening the image. Slightly deeper at the base so the
            CTAs and microcopy never compete with the photograph. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/95 via-[color:var(--charcoal)]/60 to-[color:var(--charcoal)]/55 md:from-[color:var(--charcoal-deep)]/92 md:via-[color:var(--charcoal)]/50 md:to-[color:var(--charcoal)]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_65%,transparent_30%,rgba(0,0,0,0.55)_100%)]" />

        <div className="container-x relative z-10 pb-24 md:pb-36 pt-32 md:pt-40">
          <div className="max-w-3xl text-[color:var(--ivory)]">
            <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.34em] text-[color:var(--gold-soft)] opacity-0 animate-[heroFade_1.1s_ease-out_0.3s_forwards]">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              Private · By local hands · Designed around you
            </span>

            <h1 className="serif mt-7 md:mt-9 text-[2.7rem] sm:text-5xl md:text-7xl lg:text-[5.4rem] opacity-0 animate-[heroFade_1.4s_ease-out_0.6s_forwards]">
              Portugal,
              <br />
              <span className="italic text-[color:var(--gold-soft)]">Designed Around You</span>
            </h1>

            <p className="mt-7 md:mt-9 text-[18px] md:text-[22px] text-[color:var(--ivory)] max-w-xl leading-[1.7] font-light opacity-0 animate-[heroFade_1.4s_ease-out_0.95s_forwards]">
              Private experiences shaped by local knowledge, hidden places and quiet moments —
              like exploring Portugal with a friend who lives here.
            </p>

            <div className="mt-10 md:mt-12 flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-5 opacity-0 animate-[heroFade_1.4s_ease-out_1.25s_forwards]">
              {/* Primary — clear conversion anchor */}
              <Link
                to="/builder"
                className="cta-primary group inline-flex items-center justify-center gap-3 px-10 py-[18px] text-[12.5px] tracking-[0.22em] uppercase font-semibold"
              >
                Design &amp; Secure Your Experience
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              {/* Secondary — refined outline, slightly stronger visibility */}
              <Link
                to="/experiences"
                className="cta-secondary-dark group inline-flex items-center justify-center gap-3 px-10 py-[18px] text-[12.5px] tracking-[0.22em] uppercase font-semibold"
              >
                Explore Signature Experiences
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            {/* Microcopy — friction-removing, calm, trust-building */}
            <div className="mt-7 md:mt-8 max-w-xl opacity-0 animate-[heroFade_1.4s_ease-out_1.5s_forwards]">
              <p className="text-[14px] md:text-[15px] text-[color:var(--ivory)]/95 leading-[1.7] font-light tracking-wide">
                Instant confirmation · Designed around you · No back-and-forth
              </p>
            </div>

            <p className="mt-9 md:mt-11 text-[10.5px] uppercase tracking-[0.32em] text-[color:var(--gold-soft)] flex items-center gap-3 opacity-0 animate-[heroFade_1.4s_ease-out_1.75s_forwards]">
              <span className="h-px w-6 bg-[color:var(--gold)]" />
              From a single guest to large private groups
            </p>
          </div>
        </div>
      </section>

      {/* 2 — TRUST BAR
          Reveal cadence is locked with explicit transitionDelay values so
          all six pieces (eyebrow → stars → supporting line → 3 marks)
          cascade in as ONE continuous sequence at the project-wide 110ms
          rhythm — even though they sit under two different DOM parents.
          The SiteLayout IntersectionObserver respects inline delays and
          only adds the .is-visible class, so motion stays restrained,
          smooth, and perfectly in time with every other section.
          Gold is used sparingly: just the 5 hero stars, the hairline
          vertical dividers between marks, and the tiny check inside
          each "Official platform" caption.

          Accessibility:
          • Section is a labelled landmark via aria-labelledby pointing to
            a visually-hidden heading.
          • The hero star row is a single role="img" with an explicit
            "Rated 5.0 out of 5 stars" label; the visual "5.0" glyph is
            aria-hidden so it isn't announced twice.
          • Each platform is a <figure> with a <figcaption>; the platform
            name carries aria-describedby pointing to its caption's id,
            so a screen reader announces e.g.
            "Google, Google — official review platform".
          • Decorative glyphs and column dividers are aria-hidden. */}
      <section
        className="bg-[color:var(--ivory)] border-b border-[color:var(--border)] py-16 md:py-20"
        aria-labelledby="trust-bar-title"
      >
        <h2 id="trust-bar-title" className="sr-only">
          Trusted by international travelers — 5.0 average rating
        </h2>

        <div className="container-x">
          {/* Intro: eyebrow → 5 gold stars + 5.0 → supporting line. */}
          <div className="flex flex-col items-center text-center gap-4">
            <p
              className="reveal-stagger text-[11px] uppercase tracking-[0.34em] text-[color:var(--charcoal)]"
              style={{ transitionDelay: "0ms" }}
              id="trust-bar-eyebrow"
            >
              Trusted by international travelers
            </p>

            <p
              className="reveal-stagger flex items-center gap-1 text-[color:var(--gold)]"
              style={{ transitionDelay: "110ms" }}
              role="img"
              aria-label="Rated 5 out of 5 stars"
            >
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill="currentColor"
                  strokeWidth={0}
                  aria-hidden="true"
                  focusable="false"
                />
              ))}
            </p>

            <p
              className="reveal-stagger text-[15px] text-[color:var(--charcoal-soft)] leading-[1.7]"
              style={{ transitionDelay: "220ms" }}
              id="trust-bar-summary"
            >
              700+ verified 5-star reviews across trusted platforms
            </p>
          </div>

          {/* Platform marks — true 3-column grid; the three cells continue
              the same 110ms cadence (330 → 440 → 550 ms) so the whole
              Trust Bar reads as one unbroken reveal.
              Per brief: under each platform name we show an "Official
              platform" caption — a small hairline tag with a tiny gold
              checkmark — instead of repeating the star/rating badge that
              already appears once at the top of the section. */}
          <ul
            className="mt-12 mx-auto grid grid-cols-5 items-center list-none p-0 gap-x-1 sm:gap-x-3 max-w-[480px] sm:max-w-2xl"
            aria-label="Official review platforms"
          >
            {[
              { key: "google" as const },
              { key: "tripadvisor" as const },
              { key: "viator" as const },
              { key: "getyourguide" as const },
              { key: "trustpilot" as const },
            ].map((p, i) => {
              return (
                <li
                  key={p.key}
                  className="reveal-stagger flex items-center justify-center px-1 sm:px-2 py-2"
                  style={{ transitionDelay: `${330 + i * 90}ms` }}
                >
                  <div className="flex items-center justify-center h-8 sm:h-9 md:h-10 w-full">
                    <PlatformBadge platform={p.key} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 3 — EXPERIENCE TYPES */}
      <section className="py-32 md:py-44 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-20">
            <span className="eyebrow">The Experiences</span>
            <h2 className="serif text-4xl md:text-5xl mt-6">
              From intimate moments <br />
              to <span className="italic">large private programs</span>
            </h2>
            <p className="mt-6 text-[16px] text-[color:var(--charcoal-soft)] leading-[1.75]">
              Always private. Always personal. Always designed around you — for one guest, or a hundred.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {types.map((c) => (
              <Link key={c.title} to={c.to} className="group block reveal-stagger">
                <div className="lift-layer-sm">
                  <div className="relative overflow-hidden aspect-[3/4] mb-6 shadow-[0_10px_30px_-20px_rgba(46,46,46,0.28)] group-hover:shadow-[0_28px_55px_-22px_rgba(41,91,97,0.32)] transition-shadow duration-700">
                    <img
                      src={c.img}
                      alt={c.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/85 via-[color:var(--charcoal)]/20 to-transparent" />
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[color:var(--charcoal)]/55 to-transparent" />
                    <div className="absolute inset-0 bg-[color:var(--teal)]/0 group-hover:bg-[color:var(--teal)]/10 transition-colors duration-700" />
                    <span className="absolute top-4 left-4 text-[10.5px] uppercase tracking-[0.25em] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
                      Private · Tailored
                    </span>
                  </div>
                  <h3 className="serif text-[1.5rem] text-[color:var(--charcoal)] leading-snug group-hover:text-[color:var(--teal)] transition-colors duration-500">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-[15.5px] text-[color:var(--charcoal-soft)] leading-[1.7] font-light">
                    {c.line}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — SIGNATURE EXPERIENCES */}
      <section className="py-32 md:py-44 bg-[color:var(--sand)]">
        <div className="container-x">
          <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="eyebrow">Signature Experiences</span>
              <h2 className="serif text-4xl md:text-5xl mt-6 leading-[1.1]">
                Crafted by us, <span className="italic">customized by you</span>
              </h2>
              <p className="mt-6 max-w-lg text-[16px] text-[color:var(--charcoal-soft)] leading-[1.75]">
                Ready-to-book private experiences — refined over years and adjusted in minutes
                to fit the way you travel.
              </p>
            </div>
            <Link
              to="/experiences"
              className="text-[13px] uppercase tracking-[0.2em] text-[color:var(--teal)] hover:text-[color:var(--teal-2)] inline-flex items-center gap-2 transition-colors font-medium"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {signatures.map((s) => (
              <article key={s.title} className="group reveal-stagger">
                <div className="lift-layer-sm bg-[color:var(--card)] border border-[color:var(--border)] group-hover:border-[color:var(--teal)]/30 group-hover:shadow-[0_24px_50px_-24px_rgba(41,91,97,0.25)] h-full">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={s.img}
                      alt={s.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-[color:var(--teal)]/0 group-hover:bg-[color:var(--teal)]/8 transition-colors duration-700" />
                  </div>
                  <div className="p-7 md:p-8">
                    <h3 className="serif text-[1.65rem] text-[color:var(--charcoal)] group-hover:text-[color:var(--teal)] transition-colors duration-500 leading-snug">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-[15px] text-[color:var(--charcoal-soft)] leading-[1.7]">
                      {s.line}
                    </p>
                    <ul className="mt-6 space-y-2.5">
                      {s.pace.map((p, idx) => (
                        <li
                          key={p}
                          className="flex items-center gap-3 text-[14px] text-[color:var(--charcoal)]"
                        >
                          <span className="text-[color:var(--teal)] text-[10.5px] tracking-wider font-medium">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="h-px w-4 bg-[color:var(--gold)]/60" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7 pt-5 border-t border-[color:var(--border)] flex flex-wrap gap-2">
                      <Link
                        to="/contact"
                        className="cta-primary text-[12px] uppercase tracking-[0.18em] px-5 py-2.5 font-semibold"
                      >
                        Book
                      </Link>
                      <Link
                        to="/builder"
                        className="text-[12px] uppercase tracking-[0.18em] border border-[color:var(--charcoal)]/25 hover:border-[color:var(--teal)] hover:text-[color:var(--teal)] text-[color:var(--charcoal)] px-4 py-2.5 transition-colors"
                      >
                        Customize
                      </Link>
                      <Link
                        to="/builder"
                        className="text-[12px] uppercase tracking-[0.18em] text-[color:var(--teal)] hover:text-[color:var(--teal-2)] px-4 py-2.5 transition-colors"
                      >
                        Build your own →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — EXPERIENCE STUDIO PREVIEW */}
      <section className="bg-[color:var(--teal)] text-[color:var(--ivory)] py-28 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full border border-[color:var(--gold)]" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full border border-[color:var(--gold)]" />
        </div>
        <div className="container-x relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="reveal lg:col-span-6">
              <span className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--ivory)]/80">
                <span className="h-px w-8 bg-[color:var(--gold)]" />
                The Experience Studio
              </span>
              <h2 className="serif text-4xl md:text-5xl mt-6 leading-tight font-light">
                Design your own Portugal —<br />
                <span className="italic">step by step.</span>
              </h2>
              <p className="mt-7 text-[17px] text-[color:var(--ivory)]/95 leading-[1.75] max-w-lg font-light">
                Tell us how you travel. We'll shape a private experience around your group, your
                pace and the moments that matter — with a live story, timeline and map evolving
                as you go. Secure it the moment it feels right.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/builder"
                  className="group inline-flex items-center gap-2 bg-[color:var(--ivory)] text-[color:var(--teal)] hover:bg-white border-[1.5px] border-[color:var(--gold)]/70 hover:border-[color:var(--gold)] px-9 py-[18px] text-[12.5px] uppercase tracking-[0.2em] font-semibold transition-all duration-[260ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:-translate-y-[2px] hover:shadow-[0_14px_30px_-12px_rgba(201,169,106,0.45)]"
                >
                  Open the Studio
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="reveal lg:col-span-6">
              <div className="bg-[color:var(--ivory)] text-[color:var(--charcoal)] p-8 md:p-10 shadow-[var(--shadow-elegant)]">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--charcoal-soft)]">
                    Your Experience
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--teal)]">
                    Step 4 of 9
                  </span>
                </div>
                <div className="space-y-5">
                  {[
                    { label: "Group", value: "Two travelers · Anniversary" },
                    { label: "Region", value: "Douro & Northern Portugal" },
                    { label: "Duration", value: "3 days · slow pace" },
                    { label: "Style", value: "Wine, gastronomy, hidden viewpoints" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-baseline gap-4 pb-3 border-b border-[color:var(--border)]"
                    >
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--charcoal-soft)]">
                        {row.label}
                      </span>
                      <span className="serif text-base text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-5 bg-[color:var(--sand)] border-l-2 border-[color:var(--gold)]">
                  <p className="serif italic text-[color:var(--teal)] text-[15px] leading-relaxed">
                    "Day one begins with a quiet drive into Douro — a family vineyard waits with
                    fresh bread, olives and a pour from the cellar."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 — MULTI-DAY JOURNEYS */}
      <section className="bg-[color:var(--ivory)] py-32 md:py-44">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal lg:order-2">
              <span className="eyebrow">Multi-Day Journeys</span>
              <h2 className="serif text-4xl md:text-5xl mt-5 leading-tight">
                A few days, <br />
                <span className="italic">one continuous story.</span>
              </h2>
              <p className="mt-7 text-[17px] text-[color:var(--charcoal-soft)] leading-[1.75] max-w-lg">
                Linger longer. Travel slower. Wake in a vineyard, lunch in a fishing village,
                fall asleep above the Douro — connected by quiet roads and people who know them
                by name.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                {["Coast & Vineyards", "Lisbon to Douro", "Alentejo Slow"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[12px] uppercase tracking-[0.2em] px-4 py-2 border border-[color:var(--charcoal)]/20 text-[color:var(--charcoal)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                to="/multi-day"
                className="cta-primary mt-10 inline-flex items-center gap-2 px-8 py-[16px] text-[12.5px] uppercase tracking-[0.2em] font-semibold"
              >
                Discover Multi-Day Journeys
                <ArrowRight size={15} />
              </Link>
            </div>
            <div className="reveal lg:order-1 relative group">
              <div className="overflow-hidden">
                <img
                  src={multiDayImg}
                  alt="Aerial view of Douro Valley vineyards"
                  loading="lazy"
                  className="w-full aspect-[5/4] object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 hidden md:block w-28 h-28 border border-[color:var(--gold)]/60" />
            </div>
          </div>
        </div>
      </section>

      {/* 7 — LOCAL STORIES / HIDDEN GEMS */}
      <section className="py-32 md:py-44 bg-[color:var(--sand)]">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="eyebrow">Local Stories &amp; Hidden Gems</span>
            <h2 className="serif text-[2.5rem] md:text-5xl lg:text-[3.4rem] mt-6 leading-[1.08] text-[color:var(--charcoal)]">
              The Portugal <span className="italic">we travel ourselves</span>
            </h2>
            <p className="mt-6 text-[16px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.75] max-w-xl mx-auto font-light">
              Notes from the road — the places we keep returning to, away from the crowds.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
            {editorial.map((e) => (
              <article key={e.title} className="group reveal-stagger">
                <div className="relative overflow-hidden aspect-[4/5] mb-5 shadow-[0_10px_30px_-22px_rgba(46,46,46,0.35)] group-hover:shadow-[0_24px_50px_-22px_rgba(41,91,97,0.28)] transition-shadow duration-700">
                  <img
                    src={e.img}
                    alt={e.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/88 via-[color:var(--charcoal)]/25 to-transparent" />
                  <div className="absolute inset-0 bg-[color:var(--teal)]/0 group-hover:bg-[color:var(--teal)]/10 transition-colors duration-700" />
                  <div className="absolute left-5 right-5 bottom-5">
                    <span className="block h-px w-8 bg-[color:var(--gold)] mb-3 opacity-90" />
                    <h3 className="serif text-[1.4rem] md:text-[1.5rem] leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                      {e.title}
                    </h3>
                  </div>
                </div>
                <p className="text-[15.5px] text-[color:var(--charcoal)] leading-[1.7] font-light max-w-[34ch]">
                  {e.line}
                </p>
              </article>
            ))}
          </div>
          <div className="reveal mt-16 text-center">
            <Link
              to="/local-stories"
              className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.2em] text-[color:var(--teal)] hover:text-[color:var(--teal-2)] transition-colors font-medium"
            >
              Read all local stories <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 8 — CORPORATE & CELEBRATIONS */}
      <section className="bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)] py-32 md:py-40">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-[color:var(--ivory)]/85">
                <span className="h-px w-8 bg-[color:var(--gold)]" />
                Corporate &amp; Celebrations
              </span>
              <h2 className="serif text-4xl md:text-5xl mt-7 leading-[1.1] font-light">
                Fully private. <br />
                <span className="italic">Fully managed.</span>
              </h2>
              <p className="mt-7 text-[17px] text-[color:var(--ivory)]/95 leading-[1.75] max-w-lg">
                From an intimate proposal to a 200-guest incentive program — designed
                end-to-end by a single team. Quietly extraordinary, never ordinary.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 max-w-md">
                {[
                  "Corporate programs",
                  "Incentive travel",
                  "Proposals",
                  "Anniversaries",
                  "Milestones",
                  "Private celebrations",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 text-[14.5px] text-[color:var(--ivory)]/95"
                  >
                    <span className="h-1 w-1 bg-[color:var(--gold)] rounded-full" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/corporate"
                  className="cta-primary inline-flex items-center gap-2 px-8 py-[16px] text-[12.5px] uppercase tracking-[0.2em] font-semibold"
                >
                  For Companies
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/proposals"
                  className="cta-secondary-dark inline-flex items-center gap-2 px-8 py-[16px] text-[12.5px] uppercase tracking-[0.2em] font-semibold"
                >
                  For Celebrations
                </Link>
              </div>
            </div>
            <div className="reveal grid grid-cols-2 gap-4">
              <div className="overflow-hidden group">
                <img
                  src={catCorporate}
                  alt="Corporate private experience"
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
              </div>
              <div className="overflow-hidden group mt-10">
                <img
                  src={catProposals}
                  alt="Private celebration"
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9 — REVIEWS */}
      <section className="py-28 md:py-36 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow">Voices</span>
            <h2 className="serif text-4xl md:text-5xl mt-6 leading-[1.1]">
              What guests <span className="italic">tell us after</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {reviews.map((r, i) => (
              <figure key={i} className="group reveal-stagger h-full">
                <div className="lift-layer-sm bg-[color:var(--card)] border border-[color:var(--border)] group-hover:border-[color:var(--teal)]/25 group-hover:shadow-[0_24px_50px_-24px_rgba(41,91,97,0.2)] p-8 md:p-9 h-full">
                  <div className="flex gap-0.5 text-[color:var(--gold)] mb-5">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={13} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote className="serif italic text-[19px] md:text-[20px] leading-[1.6] text-[color:var(--charcoal)]">
                    "{r.quote}"
                  </blockquote>
                  <figcaption className="mt-7 pt-5 border-t border-[color:var(--border)]">
                    <p className="text-[14px] font-medium text-[color:var(--charcoal)]">{r.name}</p>
                    <p className="text-[12.5px] text-[color:var(--charcoal-soft)] mt-1">
                      {r.location}
                    </p>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 10 — FAQ (placed right before the final CTA) */}
      <FAQ />

      {/* 11 — FINAL CTA */}
      <section className="pb-28 md:pb-36 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal relative bg-[color:var(--sand)] p-12 md:p-20 overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border border-[color:var(--gold)]/15" />
            <div className="absolute -top-12 right-1/4 w-40 h-40 rounded-full border border-[color:var(--gold)]/10" />
            <div className="relative max-w-2xl">
              <span className="eyebrow">Begin</span>
              <h2 className="serif text-4xl md:text-5xl mt-6 leading-[1.1]">
                Your Portugal story <br />
                <span className="italic text-[color:var(--teal)]">starts with a single step.</span>
              </h2>
              <p className="mt-7 text-[17px] text-[color:var(--charcoal-soft)] leading-[1.75] max-w-lg">
                Open the Experience Studio and design a private journey around you —
                or speak with a local experience designer for a fully bespoke proposal.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/builder"
                  className="cta-primary inline-flex items-center gap-2 px-9 py-[18px] text-[12.5px] uppercase tracking-[0.22em] font-semibold"
                >
                  Design &amp; Secure Your Experience
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/contact"
                  className="cta-secondary-light inline-flex items-center gap-2 px-9 py-[18px] text-[12.5px] uppercase tracking-[0.22em] font-semibold"
                >
                  Speak with our team
                </Link>
              </div>

              <div className="mt-11 flex flex-wrap gap-x-8 gap-y-3 text-[12px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
                <span className="inline-flex items-center gap-2">
                  <Compass size={13} className="text-[color:var(--gold)]" /> Local hands
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin size={13} className="text-[color:var(--gold)]" /> Hidden places
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock size={13} className="text-[color:var(--gold)]" /> Designed at your pace
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
