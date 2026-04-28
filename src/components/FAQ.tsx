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
    q: "What's the difference between Signature, Tailored and the Studio?",
    a: (
      <>
        <strong>Signature</strong> experiences are complete, designed to be enjoyed as they are.
        {" "}<strong>Tailored Signature</strong> lets you adjust a few details — date, pace,
        small variations — within that specific experience. The <strong>Studio</strong> is for
        building a journey from scratch: intuitive, guided, and shaped within what works on the ground.
      </>
    ),
  },
  {
    q: "Can I really reserve my experience instantly?",
    a: "Yes. Reserve directly on this site with real-time confirmation — no waiting, no email chase.",
  },
  {
    q: "Is the booking secure?",
    a: "Yes. Reservations are handled securely through our integrated booking system, with immediate confirmation.",
  },
  {
    q: "Do you cover all of Portugal?",
    a: "Yes. We design experiences across the country. The Studio guides you within realistic routes and timings — so what you build is always feasible on the day.",
  },
  {
    q: "Is everything private?",
    a: "Yes. Every experience is fully private — solo, couple, family or larger group.",
  },
  {
    q: "Can I customise a Signature experience?",
    a: "Within that experience — yes. Tailored Signature lets you change the date, pace, group size and small variations available in that tour. The story and route stay intact.",
  },
  {
    q: "What if I want something completely different?",
    a: "Open the Studio and start your way — with a place, a region or a feeling. We'll guide you as you build, with intelligent suggestions drawn from our real experiences.",
  },
  {
    q: "What is the Experience Investment?",
    a: "The total cost of your experience, based on your selections, group size and duration. Confirmed in real time before you reserve.",
  },
  {
    q: "What happens after I reserve?",
    a: "You receive immediate confirmation and your full experience details. Everything is handled seamlessly on this site.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Most experiences can be cancelled free of charge up to 24 hours before. Full details are always shown before you reserve.",
  },
  {
    q: "Do you offer multi-day experiences?",
    a: "Yes. Design private multi-day journeys — with realistic transfers, pacing and stays.",
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
