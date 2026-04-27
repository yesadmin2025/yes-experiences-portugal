import { Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Can I really book my experience instantly?",
    a: "Yes. Design and secure your private experience directly on the platform — no waiting for confirmation emails.",
  },
  {
    q: "Do you cover all of Portugal?",
    a: "Yes. We design experiences across the entire country. If your route isn't fully available in the builder, refine it with a local experience designer.",
  },
  {
    q: "Is everything private?",
    a: "Yes. Every experience is fully private and tailored to you and your group — solo, couple, family, or larger.",
  },
  {
    q: "Can I customise my experience?",
    a: "Yes. Adjust and refine your experience at any time, before or after booking.",
  },
  {
    q: "What if I need help designing it?",
    a: "Build it yourself, or refine it with a local experience designer at any stage.",
  },
  {
    q: "What is the Experience Investment?",
    a: "The total cost of your curated experience, based on your selections, group size, and duration.",
  },
  {
    q: "What happens after I book?",
    a: "You receive immediate confirmation and your full experience details. Everything is handled seamlessly.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Most experiences can be cancelled free of charge up to 24 hours before. Full details are always shown before booking.",
  },
  {
    q: "Do you offer multi-day experiences?",
    a: "Yes. Design private multi-day journeys across Portugal.",
  },
  {
    q: "Are these authentic local experiences?",
    a: "Yes. Every experience is rooted in local knowledge, hidden places, and genuine connections.",
  },
];

export function FAQ() {
  return (
    <section
      id="faq"
      className="py-32 md:py-40 bg-[color:var(--ivory)]"
      aria-labelledby="faq-title"
    >
      <div className="container-x">
        <div className="reveal max-w-3xl mx-auto text-center">
          <span className="eyebrow">Before you book</span>
          <h2 id="faq-title" className="serif text-4xl md:text-5xl mt-5">
            Everything You Need to Know{" "}
            <span className="italic text-[color:var(--teal)]">Before You Book</span>
          </h2>
          <p className="mt-5 text-[color:var(--charcoal-soft)] leading-relaxed">
            Clear answers to help you design and secure your private Portugal experience with
            confidence.
          </p>
          <div className="gold-divider mt-8 mx-auto w-24" />
        </div>

        <div className="reveal mt-14 max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="group border border-[color:var(--border)] hover:border-[color:var(--teal)]/40 bg-white/80 backdrop-blur-sm transition-colors duration-500 [&[data-state=open]]:border-[color:var(--teal)]/50 [&[data-state=open]]:shadow-[var(--shadow-card)]"
              >
                <AccordionTrigger className="px-6 py-5 text-left text-base md:text-[17px] serif text-[color:var(--charcoal)] hover:no-underline hover:text-[color:var(--teal)] transition-colors duration-300 [&[data-state=open]]:text-[color:var(--teal)]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0 text-[15px] leading-relaxed text-[color:var(--charcoal-soft)]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-[color:var(--charcoal-soft)]">
            <span>Still have a question?</span>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-[color:var(--teal)] hover:text-[color:var(--teal-2)] transition-colors duration-300"
            >
              Speak with our team
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
