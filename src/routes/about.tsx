import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CtaButton } from "@/components/ui/CtaButton";
import { MessageCircle, Heart, MapPin, Compass, Users, Star } from "lucide-react";
import img from "@/assets/why-image.jpg";
import imgArrabidaWine from "@/assets/tours/arrabida-wine-allinclusive/hero.jpg";
import imgSintra from "@/assets/tours/sintra-cascais/hero.jpg";
import imgTroia from "@/assets/tours/troia-comporta/hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — YES experiences Portugal" },
      {
        name: "description",
        content:
          "YES experiences Portugal is a small studio of designers, hosts and local experts. We craft private journeys around the people taking them — quietly, attentively, with absolute care for detail.",
      },
      { property: "og:title", content: "About YES experiences Portugal" },
      {
        property: "og:description",
        content: "We design private, meaningful Portugal experiences — not tours. Get to know YES.",
      },
      { property: "og:image", content: img },
    ],
  }),
  component: Page,
});

const VALUES = [
  {
    icon: Heart,
    title: "Designed around you.",
    text: "Every journey begins with who you are — your rhythm, your people, your reason for being here. We don't fit you into a template. We shape the day around you.",
  },
  {
    icon: MapPin,
    title: "Local from the start.",
    text: "We live here. We know which roads are worth the detour, which winemakers open their doors on a Tuesday, and which viewpoints nobody else has found yet.",
  },
  {
    icon: Compass,
    title: "Honest by design.",
    text: "We tell you what fits and what doesn't. If a place isn't right for your group or your timing, we say so — and we find something better.",
  },
  {
    icon: Users,
    title: "Always private.",
    text: "Every experience is just you, your people and your local guide. No mixing with other travellers, no fixed departures, no scripted commentary.",
  },
];

const STATS = [
  { value: "700+", label: "Five-star reviews" },
  { value: "10+", label: "Years in Portugal" },
  { value: "100%", label: "Private experiences" },
  { value: "3", label: "Booking paths" },
];

function Page() {
  return (
    <SiteLayout>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 bg-[color:var(--sand)] text-center reveal">
        <div className="container-x max-w-3xl">
          <Eyebrow flank>About YES</Eyebrow>
          <SectionTitle as="h1" size="anchor" spacing="loose">
            We design{" "}
            <SectionTitle.Em>meaningful Portugal.</SectionTitle.Em>
          </SectionTitle>
          <span className="gold-rule mt-6 mx-auto max-w-[80px]" aria-hidden="true" />
          <p className="mt-6 text-[1rem] md:text-[1.1rem] text-[color:var(--charcoal-soft)] leading-relaxed max-w-xl mx-auto">
            A small studio of designers, hosts and local experts — crafting private journeys
            around the people taking them. Quietly, attentively, with absolute care for detail.
          </p>
        </div>
      </section>

      {/* ── STORY + IMAGE ────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container-x grid lg:grid-cols-2 gap-14 items-center">
          <div className="reveal overflow-hidden">
            <img
              src={img}
              alt="YES experiences Portugal — local guide in Portugal"
              loading="lazy"
              className="w-full aspect-[4/5] object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
          <div className="reveal">
            <Eyebrow>Our story</Eyebrow>
            <span className="gold-rule mt-4 max-w-[64px]" aria-hidden="true" />
            <SectionTitle size="compact" spacing="loose">
              Not a tour company.{" "}
              <SectionTitle.Em>A design studio.</SectionTitle.Em>
            </SectionTitle>
            <p className="mt-5 text-[color:var(--charcoal-soft)] leading-relaxed">
              YES experiences Portugal was born from a simple frustration: the best of Portugal
              was hidden behind generic itineraries and crowded group tours. We knew there was
              a better way — because we live here.
            </p>
            <p className="mt-4 text-[color:var(--charcoal-soft)] leading-relaxed">
              Every experience is designed in Portugal, by people who live here, for travellers
              who want something more than a checklist. We combine local knowledge, honest
              curation and real-time design tools so you can shape a day that feels entirely yours.
            </p>
            <p className="mt-4 text-[color:var(--charcoal-soft)] leading-relaxed">
              Whether you're planning a quiet afternoon in the Arrábida, a multi-day journey
              through the Alentejo, or a private proposal at sunset — we handle every detail
              with the same care.
            </p>
            <p className="mt-8 font-serif italic text-[1.2rem] text-[color:var(--teal)] leading-snug">
              "Portugal, designed around you."
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <CtaButton to="/builder" variant="primary">
                Begin Your Story
              </CtaButton>
              <CtaButton
                to="/contact"
                variant="ghost"
                icon={null}
                iconLeading={<MessageCircle size={14} aria-hidden="true" />}
              >
                Talk to a Local
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="py-14 bg-[color:var(--charcoal)] reveal">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-serif text-[2.4rem] md:text-[3rem] font-medium text-[color:var(--gold-warm)] leading-none">
                  {s.value}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-[color:var(--ivory)]/70">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[color:var(--ivory)]">
        <div className="container-x">
          <div className="reveal max-w-2xl mx-auto text-center mb-14">
            <Eyebrow flank>What we believe</Eyebrow>
            <SectionTitle spacing="loose">
              The principles behind{" "}
              <SectionTitle.Em>every journey.</SectionTitle.Em>
            </SectionTitle>
          </div>
          <div className="reveal-stagger grid sm:grid-cols-2 gap-8 md:gap-10 max-w-4xl mx-auto">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <article
                  key={v.title}
                  className="bg-[color:var(--sand)] p-8 md:p-10 border-t-2 border-[color:var(--gold)]"
                >
                  <div className="inline-flex items-center justify-center h-10 w-10 bg-[color:var(--teal)]/10 text-[color:var(--teal)] mb-5">
                    <Icon size={20} strokeWidth={1.6} />
                  </div>
                  <h3 className="font-serif text-[1.15rem] md:text-[1.25rem] text-[color:var(--charcoal)] font-medium leading-snug">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] text-[color:var(--charcoal-soft)] leading-relaxed">
                    {v.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PORTUGAL GALLERY ─────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="container-x">
          <div className="reveal max-w-xl mb-12">
            <Eyebrow>Where we take you</Eyebrow>
            <span className="gold-rule mt-4 max-w-[64px]" aria-hidden="true" />
            <SectionTitle size="compact" spacing="loose">
              Portugal, seen through{" "}
              <SectionTitle.Em>local eyes.</SectionTitle.Em>
            </SectionTitle>
            <p className="mt-4 text-[color:var(--charcoal-soft)] leading-relaxed">
              From the dramatic cliffs of Arrábida to the golden plains of the Alentejo —
              every destination we take you to is one we know intimately, chosen for what
              it gives you, not for what it looks like on a map.
            </p>
          </div>
          <div className="reveal grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="overflow-hidden aspect-[3/4]">
              <img
                src={imgArrabidaWine}
                alt="Arrábida wine experience"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
              />
            </div>
            <div className="overflow-hidden aspect-[3/4] sm:mt-10">
              <img
                src={imgSintra}
                alt="Sintra private tour"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
              />
            </div>
            <div className="overflow-hidden aspect-[3/4]">
              <img
                src={imgTroia}
                alt="Tróia and Comporta"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST QUOTE ──────────────────────────────────────── */}
      <section className="py-14 bg-[color:var(--sand)] reveal">
        <div className="container-x max-w-2xl text-center">
          <div className="inline-flex items-center gap-1 text-[color:var(--gold)] mb-5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <p className="font-serif italic text-[1.3rem] md:text-[1.5rem] text-[color:var(--charcoal)] leading-snug">
            "The best day of our entire trip. Nothing felt like a tour — it felt like spending
            the day with a friend who happened to know every hidden corner of Portugal."
          </p>
          <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)]">
            Sarah &amp; James · Arrábida Wine Tour · Verified Review
          </p>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────── */}
      <section className="py-20 md:py-24 reveal">
        <div className="container-x max-w-2xl text-center">
          <Eyebrow flank>Ready to begin?</Eyebrow>
          <SectionTitle spacing="loose">
            Start in the Studio, or{" "}
            <SectionTitle.Em>talk to a local.</SectionTitle.Em>
          </SectionTitle>
          <span className="gold-rule mt-5 mx-auto max-w-[64px]" aria-hidden="true" />
          <p className="mt-5 text-[color:var(--charcoal-soft)] leading-relaxed">
            Sketch the route yourself in real time, or tell us what you have in mind
            and we'll shape it with you.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <CtaButton to="/builder" variant="primary">
              Open the Studio
            </CtaButton>
            <CtaButton
              to="/contact"
              variant="ghost"
              icon={null}
              iconLeading={<MessageCircle size={14} aria-hidden="true" />}
            >
              Talk to a Local
            </CtaButton>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
