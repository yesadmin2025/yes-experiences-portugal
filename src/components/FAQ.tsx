import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";
import { whatsappHref } from "@/components/WhatsAppFab";

/**
 * FAQ — visible helpful answers.
 *
 * The first three questions cover the highest-intent objections
 * (instant confirmation, the three paths, and human help) and are
 * shown OPEN by default so users get immediate clarity without an
 * extra click. The rest stay collapsed for calm density.
 */
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Can I confirm instantly?",
    a: (
      <>
        Yes. Design your experience in the Studio and book immediately — no
        waiting, no forms. Payments are processed securely and you receive
        confirmation and full details within minutes. Your local guide reaches
        out within one working day to confirm final arrangements.
      </>
    ),
  },
  {
    q: "What's the difference between Signature, Tailored and Builder?",
    a: (
      <>
        <strong className="font-semibold text-[color:var(--charcoal)]">
          Signature
        </strong>{" "}
        — complete ready-made days, designed end-to-end by our local team.
        Explore, choose, book.
        <br />
        <strong className="font-semibold text-[color:var(--charcoal)]">
          Tailored
        </strong>{" "}
        — start from a Signature, then adjust pace, swap a stop or add an
        upgrade. Same structure, fully personal.
        <br />
        <strong className="font-semibold text-[color:var(--charcoal)]">
          Builder
        </strong>{" "}
        — design from scratch in the Studio. Shape the journey step by step
        and watch it evolve in real time.
        <br />
        All three confirm instantly and are fully customisable. Pick the path
        that matches how you like to plan.
      </>
    ),
  },
  {
    q: "Can I get help from a local?",
    a: (
      <>
        Always. In the Studio, a local can refine your journey in real time as
        you design. With a Signature, talk to a local about customisation
        options. Anywhere on the site, a local is one message away on WhatsApp
        or via the contact form — replies within one working day.
      </>
    ),
  },
  {
    q: "Do you cover all of Portugal?",
    a: "Yes — north to south, with routes planned realistically around timing, geography and availability. Most departures are from Lisbon, but pickup can be arranged from anywhere.",
  },
  {
    q: "Can you organise proposals or celebrations?",
    a: "Yes. Private proposals, anniversaries, birthdays, honeymoons and intimate celebrations — designed with discretion and care. Contact us directly to plan the moment.",
  },
  {
    q: "Do you work with corporate groups?",
    a: "Yes. Team-building, incentives and private group experiences for up to 30 guests. Full logistics, transport, invoicing and DMC coordination.",
  },
  {
    q: "Are all experiences private?",
    a: "Yes. Every experience is private — just you, your group and a local guide. No mixing with other travellers.",
  },
  {
    q: "Can I create a multi-day journey?",
    a: "Yes. Multi-day journeys (2–7 days) include real driving times, overnight accommodation and are shaped in the Studio or in conversation with our local team.",
  },
  {
    q: "What if I don't want to design myself?",
    a: "Explore Signature Experiences (ready-made days) or contact a local directly. They'll design your journey and handle every detail — no Studio required.",
  },
  {
    q: "What happens after I confirm?",
    a: "Instant confirmation with all experience details. Your local guide contacts you within one working day to confirm final arrangements and answer any questions.",
  },
];

const DEFAULT_OPEN = ["item-0", "item-1", "item-2"] as const;

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
            Everything you need to know{" "}
            <span className="italic text-[color:var(--teal)]">before you book</span>
          </h2>
          <p className="mt-5 text-[color:var(--charcoal-soft)] leading-relaxed">
            Clear answers to help you design and secure your private Portugal experience with
            confidence.
          </p>
          <div className="gold-divider mt-8 mx-auto w-24" />
        </div>

        <div className="reveal mt-14 max-w-3xl mx-auto">
          <Accordion
            type="multiple"
            defaultValue={[...DEFAULT_OPEN]}
            className="space-y-3"
          >
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
