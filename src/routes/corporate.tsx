import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, Check } from "lucide-react";
import img from "@/assets/cat-corporate.jpg";

export const Route = createFileRoute("/corporate")({
  head: () => ({
    meta: [
      { title: "Corporate & Incentive Travel — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Bespoke corporate retreats and incentive travel programs across Portugal — designed with intention.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="pt-32 pb-12 bg-[color:var(--sand)]">
        <div className="container-x text-center">
          <span className="eyebrow">For Teams</span>
          <h1 className="serif text-4xl md:text-6xl mt-5 leading-tight">
            Corporate & <span className="italic text-[color:var(--teal)]">Incentive Travel</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-[color:var(--charcoal-soft)]">
            Authentic Portuguese character, designed for international teams, executive groups
            and incentive programs.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <img src={img} alt="Corporate group meeting" loading="lazy" className="w-full aspect-[5/4] object-cover" />
          <div>
            <h2 className="serif text-3xl md:text-4xl">Designed with intention.</h2>
            <p className="mt-5 text-[color:var(--charcoal-soft)] leading-relaxed">
              From private wine estates and chef-led gastronomy to coastal team activations, every
              YES corporate program is conceived around your goals.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Executive retreats",
                "Incentive travel programs",
                "Off-sites & conferences",
                "VIP client hosting",
                "Cultural team experiences",
              ].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-[color:var(--teal)] text-[color:var(--ivory)] flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {i}
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide"
            >
              Request a Proposal
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
