import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import heroImg from "@/assets/hero-coast.jpg";
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
import editCoastal from "@/assets/edit-coastal-road.jpg";
import editWinery from "@/assets/edit-winery.jpg";
import editMarket from "@/assets/edit-market.jpg";
import editViewpoint from "@/assets/edit-viewpoint.jpg";
import { ArrowRight, Star, MapPin, Compass, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YES experiences Portugal — Portugal, Designed Around You" },
      {
        name: "description",
        content:
          "Private Portugal experiences crafted through local knowledge, hidden gems and authentic moments — like exploring Portugal with a local friend.",
      },
      { property: "og:title", content: "YES experiences Portugal" },
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
    line: "A single, perfect day — designed entirely around you.",
    img: catPrivate,
    to: "/day-tours",
  },
  {
    title: "Multi-Day Journeys",
    line: "Several days, one continuous story — coast to vineyard, city to village.",
    img: catMultiday,
    to: "/multi-day",
  },
  {
    title: "Corporate & Incentive Travel",
    line: "Refined private programs for teams who deserve more than a hotel ballroom.",
    img: catCorporate,
    to: "/corporate",
  },
  {
    title: "Proposals & Celebrations",
    line: "Quietly extraordinary moments — proposals, anniversaries, milestones.",
    img: catProposals,
    to: "/proposals",
  },
];

const signatures = [
  {
    title: "A Day in Hidden Douro",
    img: expWine,
    line: "Family wineries, schist terraces, a long lunch above the river.",
    pace: ["Morning vineyard walk", "Long table lunch", "Sunset tasting"],
  },
  {
    title: "Wild Atlantic Coast",
    img: expCoastal,
    line: "Coastal roads only locals drive, a fishermen's lunch, no crowds.",
    pace: ["Cliff walk", "Seafood by the harbor", "Hidden cove"],
  },
  {
    title: "Lisbon Through Locals",
    img: expStreet,
    line: "The Lisbon postcards never see — neighborhoods, ateliers, tascas.",
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
      {/* 1 — HERO */}
      <section className="relative min-h-[80vh] md:min-h-[94vh] flex items-end overflow-hidden">
        <img
          src={heroImg}
          alt="Hidden coastal road in Portugal at golden hour"
          className="absolute inset-0 w-full h-full object-cover object-center scale-110 animate-[heroZoom_32s_ease-out_forwards]"
          width={1920}
          height={1080}
        />
        {/* Refined dark overlay — readable but cinematic. Strengthened for WCAG AA on mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/90 via-[color:var(--charcoal)]/55 to-[color:var(--charcoal)]/55 md:from-[color:var(--charcoal)]/88 md:via-[color:var(--charcoal)]/45 md:to-[color:var(--charcoal)]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_65%,transparent_35%,rgba(0,0,0,0.5)_100%)]" />

        <div className="container-x relative z-10 pb-20 md:pb-32 pt-32 md:pt-40">
          <div className="max-w-3xl text-[color:var(--ivory)]">
            <span
              className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.34em] text-[color:var(--gold-soft)] opacity-0 animate-[heroFade_1.1s_ease-out_0.3s_forwards]"
            >
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              Private · By local hands · Designed around you
            </span>
            <h1
              className="serif mt-6 md:mt-8 text-[2.6rem] sm:text-5xl md:text-7xl lg:text-[5.25rem] leading-[1.04] font-light tracking-[-0.015em] opacity-0 animate-[heroFade_1.4s_ease-out_0.6s_forwards]"
            >
              Portugal,
              <br />
              <span className="italic text-[color:var(--gold-soft)]">Designed Around You</span>
            </h1>
            <p
              className="mt-6 md:mt-8 text-base md:text-xl text-[color:var(--ivory)]/90 max-w-xl leading-[1.7] font-light opacity-0 animate-[heroFade_1.4s_ease-out_0.95s_forwards]"
            >
              Private experiences crafted through local knowledge, hidden gems and authentic
              moments — like exploring Portugal with a local friend.
            </p>

            <div className="mt-9 md:mt-11 flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 opacity-0 animate-[heroFade_1.4s_ease-out_1.25s_forwards]">
              {/* Primary — teal bg, white text, thin gold border */}
              <Link
                to="/builder"
                className="group inline-flex items-center justify-center gap-3 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-white px-9 py-4 text-[11px] tracking-[0.22em] uppercase border border-[color:var(--gold)]/70 hover:border-[color:var(--gold)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(41,91,97,0.55)]"
              >
                Design &amp; Secure Your Experience
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-500" />
              </Link>
              {/* Secondary — transparent, thin gold border, white text */}
              <Link
                to="/experiences"
                className="group inline-flex items-center justify-center gap-3 bg-transparent text-white px-9 py-4 text-[11px] tracking-[0.22em] uppercase border border-[color:var(--gold)]/70 hover:border-[color:var(--gold)] hover:bg-white/[0.06] transition-all duration-700 hover:-translate-y-1"
              >
                Explore Signature Experiences
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-500" />
              </Link>
            </div>

            {/* Supporting microcopy — instant, direct, simple */}
            <div className="mt-6 md:mt-7 max-w-xl opacity-0 animate-[heroFade_1.4s_ease-out_1.5s_forwards]">
              <p className="text-[13px] md:text-sm text-[color:var(--ivory)]/95 leading-relaxed font-light tracking-wide">
                Instant confirmation. Direct booking. No waiting.
              </p>
            </div>

            <p
              className="mt-8 md:mt-10 text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold-soft)]/90 flex items-center gap-3 opacity-0 animate-[heroFade_1.4s_ease-out_1.75s_forwards]"
            >
              <span className="h-px w-6 bg-[color:var(--gold)]" />
              Private experiences only — from 1 guest to large private groups
            </p>
          </div>
        </div>
      </section>

      {/* 2 — TRUST BAR */}
      <section className="bg-[color:var(--ivory)] border-b border-[color:var(--border)] py-14 md:py-16">
        <div className="container-x">
          <div className="reveal flex flex-col items-center text-center gap-4">
            {/* Headline */}
            <p className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--charcoal)]">
              Trusted by international travelers
            </p>

            {/* 5-star rating */}
            <div className="flex items-center gap-2.5">
              <div className="flex gap-0.5 text-[color:var(--gold)]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill="currentColor"
                    strokeWidth={0}
                    className="reveal-stagger"
                    style={{ transitionDelay: `${i * 90}ms` }}
                  />
                ))}
              </div>
              <span className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)]">
                5.0
              </span>
            </div>

            {/* Supporting line */}
            <p className="text-[13px] text-[color:var(--charcoal-soft)] max-w-xl leading-relaxed">
              600+ 5-star reviews across Google, TripAdvisor and Viator
            </p>

            {/* Brand marks — platform name + small trust badge underneath */}
            <div className="mt-3 flex flex-wrap items-start justify-center gap-x-10 sm:gap-x-14 gap-y-5">
              {[
                { name: "Google", badge: "Excellent · 5.0" },
                { name: "Tripadvisor", badge: "Travelers' Choice" },
                { name: "Viator", badge: "Top-rated Operator" },
              ].map((p, i) => (
                <div
                  key={p.name}
                  className="flex flex-col items-center gap-1.5 reveal-stagger"
                  style={{ transitionDelay: `${250 + i * 140}ms` }}
                >
                  <span className="serif text-base md:text-lg text-[color:var(--charcoal)] tracking-tight">
                    {p.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] border border-[color:var(--border)] px-2 py-1">
                    <Star size={8} fill="currentColor" strokeWidth={0} className="text-[color:var(--gold)]" />
                    {p.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 — EXPERIENCE TYPES */}
      <section className="py-32 md:py-44 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow">The Experiences</span>
            <h2 className="serif text-4xl md:text-5xl mt-5 leading-tight">
              From intimate moments <br />
              to <span className="italic">large private programs</span>
            </h2>
            <p className="mt-5 text-[color:var(--charcoal-soft)] leading-relaxed">
              Always curated. Always personal. Always private — for one guest, for a hundred.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {types.map((c, i) => (
              <Link
                key={c.title}
                to={c.to}
                className="group block reveal-stagger"
              >
                {/* lift-layer-sm owns hover transform — reveal owns entrance, no double transform */}
                <div className="lift-layer-sm">
                  <div className="relative overflow-hidden aspect-[3/4] mb-5 shadow-[0_10px_30px_-20px_rgba(46,46,46,0.28)] group-hover:shadow-[0_28px_55px_-22px_rgba(41,91,97,0.32)] transition-shadow duration-700">
                    <img
                      src={c.img}
                      alt={c.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
                    />
                    {/* Bottom gradient + top scrim — guarantees readability for both top eyebrow and any caption */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/80 via-[color:var(--charcoal)]/15 to-transparent" />
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[color:var(--charcoal)]/55 to-transparent" />
                    <div className="absolute inset-0 bg-[color:var(--teal)]/0 group-hover:bg-[color:var(--teal)]/10 transition-colors duration-700" />
                    <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.25em] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
                      Private · Tailored
                    </span>
                  </div>
                  <h3 className="serif text-[1.35rem] text-[color:var(--charcoal)] leading-snug group-hover:text-[color:var(--teal)] transition-colors duration-500">
                    {c.title}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] text-[color:var(--charcoal-soft)] leading-[1.65] font-light">
                    {c.line}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — EXPERIENCE STUDIO PREVIEW */}
      <section className="bg-[color:var(--teal)] text-[color:var(--ivory)] py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full border border-[color:var(--gold)]" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full border border-[color:var(--gold)]" />
        </div>
        <div className="container-x relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="reveal lg:col-span-6">
              <span className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--ivory)]/75">
                <span className="h-px w-8 bg-[color:var(--gold)]" />
                The Experience Studio
              </span>
              <h2 className="serif text-4xl md:text-5xl mt-6 leading-tight font-light">
                Build your own Portugal —<br />
                <span className="italic">step by step.</span>
              </h2>
              <p className="mt-6 text-[color:var(--ivory)]/85 leading-relaxed max-w-lg">
                Tell us how you travel. We'll shape a private experience around your group, your
                pace, your highlights — with a live story, timeline and map evolving as you go.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/builder"
                  className="inline-flex items-center gap-2 bg-[color:var(--ivory)] text-[color:var(--teal)] hover:bg-white border border-[color:var(--gold)]/50 hover:border-[color:var(--gold)] px-8 py-4 text-sm uppercase tracking-[0.1em] transition-all duration-500 hover:-translate-y-0.5"
                >
                  Open the Studio
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Visual preview */}
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

      {/* 5 — SIGNATURE EXPERIENCES */}
      <section className="py-32 md:py-44 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="eyebrow">Signature Experiences</span>
              <h2 className="serif text-4xl md:text-5xl mt-5 leading-tight">
                Crafted by us, <span className="italic">customized by you</span>
              </h2>
            </div>
            <Link
              to="/experiences"
              className="text-sm uppercase tracking-[0.2em] text-[color:var(--teal)] hover:text-[color:var(--teal-2)] inline-flex items-center gap-2 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {signatures.map((s, i) => (
              <article key={s.title} className="group reveal-stagger">
                {/* lift-layer owns hover transform/shadow/border — reveal owns entrance */}
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
                <div className="p-6">
                  <h3 className="serif text-2xl text-[color:var(--charcoal)] group-hover:text-[color:var(--teal)] transition-colors duration-500">{s.title}</h3>
                  <p className="mt-2 text-sm text-[color:var(--charcoal-soft)] leading-relaxed">
                    {s.line}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {s.pace.map((p, idx) => (
                      <li
                        key={p}
                        className="flex items-center gap-3 text-[13px] text-[color:var(--charcoal)]"
                      >
                        <span className="text-[color:var(--teal)] text-[10px] tracking-wider">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="h-px w-4 bg-[color:var(--gold)]/50" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-5 border-t border-[color:var(--border)] flex flex-wrap gap-2">
                    <Link
                      to="/contact"
                      className="text-xs uppercase tracking-[0.18em] bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-4 py-2.5 transition-colors"
                    >
                      Book
                    </Link>
                    <Link
                      to="/builder"
                      className="text-xs uppercase tracking-[0.18em] border border-[color:var(--charcoal)]/20 hover:border-[color:var(--teal)] hover:text-[color:var(--teal)] text-[color:var(--charcoal)] px-4 py-2.5 transition-colors"
                    >
                      Customize
                    </Link>
                    <Link
                      to="/builder"
                      className="text-xs uppercase tracking-[0.18em] text-[color:var(--teal)] hover:text-[color:var(--teal-2)] px-4 py-2.5 transition-colors"
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

      {/* 6 — MULTI-DAY HIGHLIGHT */}
      <section className="bg-[color:var(--sand)] py-32 md:py-44">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal lg:order-2">
              <span className="eyebrow">Multi-Day Journeys</span>
              <h2 className="serif text-4xl md:text-5xl mt-5 leading-tight">
                A few days, <br />
                <span className="italic">one continuous story.</span>
              </h2>
              <p className="mt-6 text-[color:var(--charcoal-soft)] leading-relaxed max-w-lg">
                Linger longer. Travel slower. Wake up in a vineyard, lunch in a fishing village,
                fall asleep above the Douro — connected by quiet roads and people who know them
                by name.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {["Coast & Vineyards", "Lisbon to Douro", "Alentejo Slow"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs uppercase tracking-[0.2em] px-4 py-2 border border-[color:var(--charcoal)]/15 text-[color:var(--charcoal)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                to="/multi-day"
                className="mt-10 inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] border border-[color:var(--gold)]/50 hover:border-[color:var(--gold)] px-7 py-3.5 text-sm uppercase tracking-[0.1em] transition-all duration-500 hover:-translate-y-0.5"
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

      {/* 7 — EDITORIAL STORYTELLING */}
      <section className="py-32 md:py-44 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="eyebrow">From the field</span>
            <h2 className="serif text-[2.5rem] md:text-5xl lg:text-[3.4rem] mt-6 leading-[1.08] text-[color:var(--charcoal)]">
              The Portugal <span className="italic">we travel ourselves</span>
            </h2>
            <p className="mt-6 text-[15px] md:text-[17px] text-[color:var(--charcoal-soft)] leading-[1.75] max-w-xl mx-auto font-light">
              Notes from the road — the places we keep returning to, away from the crowds.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
            {editorial.map((e, i) => (
              <article
                key={e.title}
                className="group reveal-stagger"

              >
                <div className="relative overflow-hidden aspect-[4/5] mb-5 shadow-[0_10px_30px_-22px_rgba(46,46,46,0.35)] group-hover:shadow-[0_24px_50px_-22px_rgba(41,91,97,0.28)] transition-shadow duration-700">
                  <img
                    src={e.img}
                    alt={e.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
                  />
                  {/* Stronger bottom gradient — guarantees title contrast (WCAG AA on large serif) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/88 via-[color:var(--charcoal)]/25 to-transparent" />
                  <div className="absolute inset-0 bg-[color:var(--teal)]/0 group-hover:bg-[color:var(--teal)]/10 transition-colors duration-700" />
                  {/* On-image title — bold, readable, editorial */}
                  <div className="absolute left-5 right-5 bottom-5">
                    <span className="block h-px w-8 bg-[color:var(--gold)] mb-3 opacity-90" />
                    <h3 className="serif text-[1.35rem] md:text-[1.45rem] leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                      {e.title}
                    </h3>
                  </div>
                </div>
                {/* Body copy below the image — charcoal on ivory for max readability */}
                <p className="text-[15px] text-[color:var(--charcoal)] leading-[1.7] font-light max-w-[34ch]">
                  {e.line}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 8 — CORPORATE & CELEBRATIONS */}
      <section className="bg-[color:var(--charcoal)] text-[color:var(--ivory)] py-28 md:py-36">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <span className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--ivory)]/75">
                <span className="h-px w-8 bg-[color:var(--gold)]" />
                Corporate & Celebrations
              </span>
              <h2 className="serif text-4xl md:text-5xl mt-6 leading-tight font-light">
                Fully private. <br />
                <span className="italic">Fully managed.</span>
              </h2>
              <p className="mt-6 text-[color:var(--ivory)]/85 leading-relaxed max-w-lg">
                From an intimate proposal to a 200-guest incentive program — tailored
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
                    className="flex items-center gap-2 text-sm text-[color:var(--ivory)]/90"
                  >
                    <span className="h-1 w-1 bg-[color:var(--gold)] rounded-full" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/corporate"
                  className="inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-white border border-[color:var(--gold)]/60 hover:border-[color:var(--gold)] px-7 py-3.5 text-sm uppercase tracking-[0.1em] transition-all duration-500 hover:-translate-y-0.5"
                >
                  For Companies
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/proposals"
                  className="inline-flex items-center gap-2 border border-[color:var(--ivory)]/40 hover:border-[color:var(--ivory)] text-[color:var(--ivory)] px-7 py-3.5 text-sm uppercase tracking-[0.1em] transition-all duration-500 hover:-translate-y-0.5"
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
          <div className="reveal text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow">Voices</span>
            <h2 className="serif text-4xl md:text-5xl mt-5">
              What guests <span className="italic">tell us after</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {reviews.map((r, i) => (
              <figure key={i} className="group reveal-stagger h-full">
                {/* lift-layer owns hover transform/shadow — reveal owns entrance */}
                <div className="lift-layer-sm bg-[color:var(--card)] border border-[color:var(--border)] group-hover:border-[color:var(--teal)]/25 group-hover:shadow-[0_24px_50px_-24px_rgba(41,91,97,0.2)] p-8 h-full">
                  <div className="flex gap-0.5 text-[color:var(--gold)] mb-4">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={12} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote className="serif italic text-lg leading-relaxed text-[color:var(--charcoal)]">
                    "{r.quote}"
                  </blockquote>
                  <figcaption className="mt-6 pt-4 border-t border-[color:var(--border)]">
                    <p className="text-sm font-medium text-[color:var(--charcoal)]">{r.name}</p>
                    <p className="text-xs text-[color:var(--charcoal-soft)] mt-0.5">
                      {r.location}
                    </p>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 10 — FINAL CTA */}
      <section className="pb-28 md:pb-36 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal relative bg-[color:var(--sand)] p-12 md:p-20 overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border border-[color:var(--gold)]/15" />
            <div className="absolute -top-12 right-1/4 w-40 h-40 rounded-full border border-[color:var(--gold)]/10" />
            <div className="relative max-w-2xl">
              <span className="eyebrow">Begin</span>
              <h2 className="serif text-4xl md:text-5xl mt-5 leading-tight">
                Your Portugal story <br />
                <span className="italic text-[color:var(--teal)]">starts with a single step.</span>
              </h2>
              <p className="mt-6 text-[color:var(--charcoal-soft)] leading-relaxed max-w-lg">
                Open the Experience Studio and shape a private journey designed entirely around
                you — or speak with our team for a fully bespoke proposal.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/builder"
                  className="inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] border border-[color:var(--gold)]/60 hover:border-[color:var(--gold)] px-8 py-4 text-sm uppercase tracking-[0.1em] transition-all duration-500 hover:-translate-y-0.5"
                >
                  Build Your Own Experience
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 border border-[color:var(--charcoal)]/25 hover:border-[color:var(--teal)] hover:text-[color:var(--teal)] text-[color:var(--charcoal)] px-8 py-4 text-sm uppercase tracking-[0.1em] transition-all duration-500 hover:-translate-y-0.5"
                >
                  Speak with our team
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
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
