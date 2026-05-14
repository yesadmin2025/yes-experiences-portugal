import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import editCoastal from "@/assets/edit-coastal-road.jpg";
import editWinery from "@/assets/edit-winery.jpg";
import editMarket from "@/assets/edit-market.jpg";
import editViewpoint from "@/assets/edit-viewpoint.jpg";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CtaButton } from "@/components/ui/CtaButton";
import { MessageCircle } from "lucide-react";

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
    tag: "Sintra · Cascais",
    line: "The drive from Sintra to Cabo da Roca that no guidebook quite gets right — pine-scented bends, an empty cove, a shack where the fishermen eat lunch.",
    body: "Most visitors take the main road. We take the one that winds through the Sintra hills, past estates hidden behind stone walls, down to a cove that doesn't appear on any tourist map. The fishermen's shack is still there — no menu, just whatever came in that morning and a glass of vinho verde poured without ceremony.",
    img: editCoastal,
    readTime: "3 min read",
  },
  {
    title: "Family Wineries",
    tag: "Arrábida · Setúbal",
    line: "Three generations, one cellar door, a glass poured by the winemaker himself. No tasting menu, no script — just the year's vintage and an unhurried afternoon.",
    body: "The Arrábida peninsula has been producing wine since the Romans. But the wineries we take you to aren't the ones with tasting rooms and gift shops. They're the ones where the winemaker's grandmother still lives upstairs, where the dog follows you between the vines, and where the best bottle isn't on any list.",
    img: editWinery,
    readTime: "4 min read",
  },
  {
    title: "Local Markets at Dawn",
    tag: "Lisbon · Alentejo",
    line: "Where breakfast is a pastel de nata and the day's plan is written on a napkin. We know the bakers, the cheesemakers, the woman who still salts her own olives.",
    body: "The best markets in Portugal happen before most tourists are awake. We know the vendors by name — the baker from Alentejo who drives three hours each Saturday, the cheesemaker from Azeitão whose queijo fresco runs out by nine, the woman who's been selling her own olives from the same spot for forty years.",
    img: editMarket,
    readTime: "3 min read",
  },
  {
    title: "Secret Viewpoints",
    tag: "Alentejo · Douro",
    line: "A bend in the road. A stone wall. The whole valley below — and nobody else. The kind of place you only find if someone who lives here points the way.",
    body: "Portugal's most beautiful views aren't at the miradouros on the tourist maps. They're at the end of a dirt track, through a gate that looks like it belongs to a farm, at a bend in the road where the landscape suddenly opens up and you understand why people have been living here for thousands of years.",
    img: editViewpoint,
    readTime: "3 min read",
  },
];

function Page() {
  return (
    <SiteLayout>
      {/* HEADER */}
      <section className="pt-40 pb-16 md:pt-48 md:pb-20 bg-[color:var(--sand)] text-center reveal">
        <div className="container-x max-w-3xl">
          <Eyebrow flank>From the locals</Eyebrow>
          <SectionTitle as="h1" size="anchor" spacing="loose">
            Local Stories &{" "}
            <SectionTitle.Em>Hidden Gems</SectionTitle.Em>
          </SectionTitle>
          <span className="gold-rule mt-6 mx-auto max-w-[80px]" aria-hidden="true" />
          <p className="mt-6 text-[1rem] md:text-[1.1rem] text-[color:var(--charcoal-soft)] leading-relaxed max-w-xl mx-auto">
            Notes from the road. Hidden corners of Portugal we keep returning to —
            written by the locals who design our private experiences.
          </p>
        </div>
      </section>

      {/* FEATURED STORY */}
      <section className="py-16 md:py-20">
        <div className="container-x">
          <article className="reveal grid lg:grid-cols-2 gap-10 md:gap-14 items-center">
            <div className="overflow-hidden">
              <img
                src={stories[0].img}
                alt={stories[0].title}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--gold-deep)]">
                  {stories[0].tag}
                </span>
                <span className="text-[color:var(--charcoal-soft)]/40">·</span>
                <span className="text-[10.5px] text-[color:var(--charcoal-soft)]">
                  {stories[0].readTime}
                </span>
              </div>
              <Eyebrow>Featured story</Eyebrow>
              <span className="gold-rule mt-4 max-w-[64px]" aria-hidden="true" />
              <SectionTitle size="compact" spacing="loose">
                {stories[0].title}
              </SectionTitle>
              <p className="mt-4 font-serif italic text-[1.1rem] text-[color:var(--teal)] leading-snug">
                {stories[0].line}
              </p>
              <p className="mt-4 text-[color:var(--charcoal-soft)] leading-relaxed">
                {stories[0].body}
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* STORIES GRID */}
      <section className="py-16 md:py-20 bg-[color:var(--sand)]">
        <div className="container-x">
          <div className="reveal max-w-xl mb-12">
            <Eyebrow>More stories</Eyebrow>
            <span className="gold-rule mt-4 max-w-[64px]" aria-hidden="true" />
            <SectionTitle size="compact" spacing="loose">
              The Portugal we{" "}
              <SectionTitle.Em>travel ourselves.</SectionTitle.Em>
            </SectionTitle>
          </div>
          <div className="reveal-stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.slice(1).map((s) => (
              <article key={s.title} className="group bg-[color:var(--ivory)]">
                <div className="overflow-hidden aspect-[4/3]">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-6 md:p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-deep)]">
                      {s.tag}
                    </span>
                    <span className="text-[color:var(--charcoal-soft)]/40">·</span>
                    <span className="text-[10px] text-[color:var(--charcoal-soft)]">
                      {s.readTime}
                    </span>
                  </div>
                  <h3 className="font-serif text-[1.2rem] text-[color:var(--charcoal)] font-medium leading-snug mb-3">
                    {s.title}
                  </h3>
                  <p className="text-[13.5px] text-[color:var(--charcoal-soft)] leading-relaxed">
                    {s.line}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL PULL QUOTE */}
      <section className="py-16 md:py-20 reveal">
        <div className="container-x max-w-2xl text-center">
          <span className="gold-rule mx-auto max-w-[64px] mb-8" aria-hidden="true" />
          <p className="font-serif italic text-[1.4rem] md:text-[1.7rem] text-[color:var(--charcoal)] leading-snug">
            "The best of Portugal isn't in any guidebook. It's in the knowledge of the people
            who live here — and that's what we bring to every experience we design."
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)]">
            YES experiences Portugal
          </p>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="py-16 md:py-20 bg-[color:var(--sand)] reveal">
        <div className="container-x max-w-2xl text-center">
          <SectionTitle size="compact">
            Want to see it{" "}
            <SectionTitle.Em>for yourself?</SectionTitle.Em>
          </SectionTitle>
          <span className="gold-rule mt-5 mx-auto max-w-[64px]" aria-hidden="true" />
          <p className="mt-5 text-[color:var(--charcoal-soft)] leading-relaxed">
            Every story we tell is a place we can take you. Design your own journey in the Studio,
            or tell us what you'd love to find and we'll shape it with you.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <CtaButton to="/builder" variant="primary">
              Design Your Day
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
