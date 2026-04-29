import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";
import { whatsappHref } from "@/components/WhatsAppFab";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I book online?",
    a: "Yes for Tailored, Builder and Multi-day journeys — paid securely on this site. Signature tours are confirmed through our booking partner; the on-site reservation link goes live shortly. Corporate, proposals and celebrations are arranged with a local.",
  },
  {
    q: "What's the difference between Signature, Tailored and Builder?",
    a: "Signature is a fixed, curated tour. Tailored keeps that same tour and lets you adjust selected details (pace, options, language). Builder starts from a blank canvas and shapes a private day or multi-day journey from real, available stops.",
  },
  {
    q: "Are all experiences private?",
    a: "Yes. Every YES experience is private to your group — no strangers joining, no shared vans.",
  },
  {
    q: "Can I get help from a local before I book?",
    a: "Yes. A local guide is available by WhatsApp to answer questions, validate feasibility, or co-design your journey with you.",
  },
  {
    q: "Do you cover all of Portugal?",
    a: "Yes — but routes are planned realistically. We won't squeeze the country into a day. Multi-day journeys move between regions in honest, drivable steps.",
  },
  {
    q: "Can you organise proposals or celebrations?",
    a: "Yes. Proposals, anniversaries, vow renewals, birthdays and intimate family celebrations are planned one-to-one with a local — not booked from a template.",
  },
  {
    q: "Do you work with groups or corporate?",
    a: "Yes. Private groups, incentives and corporate experiences are handled by a dedicated planner with a written proposal — typically same business day.",
  },
  {
    q: "What happens after I pay or request?",
    a: "For online payments you receive an immediate email receipt and a follow-up from a local within hours with pickup details. For Signature and human-assisted paths, a local confirms availability and details before any payment.",
  },
  {
    q: "Can I change details after I confirm?",
    a: "Yes — within reason. Pace, timing, optional stops and dietary needs can be adjusted up to 48h before. Significant route changes go through your local.",
  },
  {
    q: "What's the cancellation policy?",
    a: "Free cancellation up to 24h before the experience for most online bookings. Custom multi-day and group programs follow the terms in your written proposal.",
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
            <span>Still wondering?</span>
            <a
              href={whatsappHref("Hi! I have a quick question before booking.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[color:var(--teal)] hover:text-[color:var(--charcoal)] transition-colors duration-300"
            >
              <MessageCircle size={14} /> Ask a local
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
