import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight } from "lucide-react";
import img from "@/assets/why-image.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — YES experiences Portugal" },
      {
        name: "description",
        content:
          "We design private, meaningful Portugal experiences — not tours. Get to know YES.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="pt-32 pb-12 bg-[color:var(--sand)] text-center">
        <div className="container-x">
          <span className="eyebrow">About YES</span>
          <h1 className="serif text-4xl md:text-6xl mt-5 leading-tight">
            We design <span className="italic text-[color:var(--teal)]">meaningful Portugal</span>.
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="container-x grid lg:grid-cols-2 gap-14 items-center">
          <img src={img} alt="" loading="lazy" className="w-full aspect-[4/5] object-cover" />
          <div>
            <p className="text-[color:var(--charcoal-soft)] leading-relaxed">
              YES experiences Portugal is a small studio of designers, hosts and local experts.
              We don't sell tours. We craft journeys around the people taking them — quietly,
              attentively, with absolute care for detail.
            </p>
            <p className="mt-5 text-[color:var(--charcoal-soft)] leading-relaxed">
              Every experience is designed in Portugal, by people who live here, for travelers
              who want something more than a checklist.
            </p>
            <p className="mt-8 serif italic text-2xl text-[color:var(--teal)]">
              Portugal, designed around you.
            </p>
            <Link
              to="/builder"
              className="mt-8 inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide"
            >
              Begin Your Story
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
