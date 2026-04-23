import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight } from "lucide-react";
import img from "@/assets/cat-proposals.jpg";

export const Route = createFileRoute("/proposals")({
  head: () => ({
    meta: [
      { title: "Proposals & Celebrations — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Romantic, intimate and milestone moments designed to be unforgettable across Portugal.",
      },
      { property: "og:title", content: "Proposals & Celebrations in Portugal" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="relative pt-32 pb-20 min-h-[60vh] flex items-end overflow-hidden">
        <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="container-x relative text-[color:var(--ivory)] max-w-2xl">
          <span className="eyebrow text-[color:var(--gold-soft)]">Once-in-a-lifetime</span>
          <h1 className="serif text-4xl md:text-6xl mt-5 leading-tight">
            Proposals & <span className="italic">Celebrations</span>
          </h1>
          <p className="mt-5 text-[color:var(--ivory)]/85">
            Cliff-top proposals, intimate vineyard dinners, milestone birthdays under the stars.
            Designed in absolute privacy and detail.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container-x grid lg:grid-cols-3 gap-8">
          {[
            {
              title: "Proposals",
              desc: "Cliffs, vineyards, candlelit terraces — the moment, perfectly held.",
            },
            {
              title: "Anniversaries",
              desc: "Reconnect over a private chef dinner where you first dreamed.",
            },
            {
              title: "Milestone Celebrations",
              desc: "Birthdays, vow renewals and reunions designed without compromise.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="bg-[color:var(--card)] border-t-2 border-[color:var(--gold)] p-8 shadow-[var(--shadow-card)]"
            >
              <h3 className="serif text-2xl text-[color:var(--charcoal)]">{c.title}</h3>
              <p className="mt-3 text-[color:var(--charcoal-soft)]">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="container-x mt-16 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide"
          >
            Plan Your Moment
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
