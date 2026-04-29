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
    q: "How does booking work?",
    a: "Send your request through the website. A local reviews your dates and confirms personally — usually within a few hours. Online checkout is coming soon.",
  },
  {
    q: "What is the difference between Signature, Tailored and Builder?",
    a: "Signature is ready as it is. Tailored adjusts selected details inside that tour. Builder starts from scratch using guided, realistic options.",
  },
  {
    q: "Can I get help from a local?",
    a: "Yes. Real-time guidance is available whenever you want help.",
  },
  {
    q: "Do you cover all of Portugal?",
    a: "Yes — with routes planned realistically, around timing, geography and availability.",
  },
  {
    q: "Can you organize proposals or celebrations?",
    a: "Yes. Private proposals, anniversaries, birthdays, honeymoons and intimate celebrations.",
  },
  {
    q: "Do you work with groups or corporate?",
    a: "Yes. Private groups, incentives and corporate experiences — with full logistics support.",
  },
  {
    q: "Are all experiences private?",
    a: "Yes. We design private experiences only.",
  },
  {
    q: "Can I create a multi-day journey?",
    a: "Yes. Shape it in the Studio, or with a local in real time.",
  },
  {
    q: "What can I tailor in a Signature?",
    a: "Selected details inside that specific tour — pace, timing and the options available within it.",
  },
  {
    q: "What happens after I send my request?",
    a: "A local reviews availability and confirms your booking personally — usually within hours. You then receive confirmation and full details by email.",
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
