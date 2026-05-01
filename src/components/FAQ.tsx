import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";

/**
 * FAQ — conversion support.
 *
 * Eight high-intent questions, in the order that matches how a guest
 * actually decides: how to book, which path fits, can I talk to a
 * human, is it private, occasion paths, multi-day, what happens next.
 * Answers are short, human, reassuring — never robotic.
 *
 * The first three answers are open by default so the highest-intent
 * objections (booking, the three paths, talking to a local) are
 * resolved without an extra click.
 *
 * Closing micro-section ends the page on the human escape hatch:
 * "Not sure yet?" → Talk to a Local. Per brand rules, the primary
 * CTA goes to the contact form, not WhatsApp.
 */
const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "Can I book directly on the website?",
    a: (
      <>
        Yes. You can confirm a Signature, a Tailored Signature or a journey
        you build in the Studio in a few minutes — no forms, no waiting. You
        receive your confirmation and full details right away, and a local
        reaches out within one working day to align the last details.
      </>
    ),
  },
  {
    q: "What is the difference between Signature, Tailored and Studio?",
    a: (
      <>
        <strong className="font-semibold text-[color:var(--charcoal)]">
          Signature
        </strong>{" "}
        — a complete day, ready as it is, designed end to end by our local
        team.
        <br />
        <strong className="font-semibold text-[color:var(--charcoal)]">
          Tailored
        </strong>{" "}
        — that same Signature, with a few details adjusted: pace, timing,
        optional stops, lunch, group needs. Same heart, your rhythm.
        <br />
        <strong className="font-semibold text-[color:var(--charcoal)]">
          Studio
        </strong>{" "}
        — design a day from scratch, live, with a local guiding you as you
        build.
        <br />
        Pick the path that matches how you like to plan — there's no wrong
        one.
      </>
    ),
  },
  {
    q: "Can I speak with a local?",
    a: (
      <>
        Whenever you want. A local is one message away while you browse,
        while you build in the Studio, or before you confirm anything. Real
        people, based here, who know how each day actually runs on the
        ground.
      </>
    ),
  },
  {
    q: "Are experiences private?",
    a: (
      <>
        Yes — always. Every experience is just you, your people and your
        local guide. No mixing with other travellers, no fixed group
        departures, no scripted commentary.
      </>
    ),
  },
  {
    q: "Can I plan proposals or celebrations?",
    a: (
      <>
        Yes. Proposals, anniversaries, honeymoons, birthdays and family
        moments — shaped quietly with you, with full discretion and local
        knowledge behind every detail. These are arranged with our team
        directly so nothing is left to chance.
      </>
    ),
  },
  {
    q: "Do you handle corporate and private groups?",
    a: (
      <>
        Yes. For teams, incentives and private groups, we combine local
        experiences, transport, timing and logistics into a day that feels
        effortless. Invoicing and DMC support included — handled end to end
        by a local team.
      </>
    ),
  },
  {
    q: "Can I create multi-day journeys?",
    a: (
      <>
        Yes. Two to seven days across regions, with realistic driving times,
        curated overnight stops and daily local support. Designed in
        conversation with our team — never a copy-paste itinerary.
      </>
    ),
  },
  {
    q: "What happens after I confirm?",
    a: (
      <>
        You receive your confirmation and full details immediately. A local
        gets in touch within one working day to align pickup, timing and
        anything else worth confirming before the day. From that point on,
        you're never on your own.
      </>
    ),
  },
];

const DEFAULT_OPEN = ["item-0", "item-1", "item-2"] as const;

export function FAQ() {
  return (
    <section
      id="faq"
      className="he-section-rule py-16 md:py-20 bg-[color:var(--ivory)]"
      aria-labelledby="faq-title"
    >
      <div className="container-x">
        {/* ── Intro ─────────────────────────────────────────────
            Approved copy — do not paraphrase without explicit ask.
            Reassures before the questions even start. */}
        <div className="reveal max-w-3xl mx-auto text-center">
          <span className="eyebrow">Before you book</span>
          <h2 id="faq-title" className="serif text-[2rem] md:text-[2.6rem] mt-4 leading-[1.12] tracking-[-0.015em] text-[color:var(--charcoal)]">
            Still wondering{" "}
            <span className="italic text-[color:var(--teal)]">how it works?</span>
          </h2>
          <p className="mt-5 text-[15.5px] md:text-[16.5px] leading-[1.65] text-[color:var(--charcoal)] max-w-xl mx-auto">
            It's simpler than it looks — and you're never on your own.
          </p>
          <div className="gold-divider mt-8 mx-auto w-24" />
        </div>

        {/* ── Questions ─────────────────────────────────────── */}
        <div className="reveal mt-10 md:mt-12 max-w-3xl mx-auto">
          <Accordion
            type="multiple"
            defaultValue={[...DEFAULT_OPEN]}
            className="space-y-3"
          >
            {FAQS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="group relative border border-[color:var(--border)] hover:border-[color:var(--teal)]/40 bg-white/80 backdrop-blur-sm transition-colors duration-200 [&[data-state=open]]:border-[color:var(--teal)]/55 [&[data-state=open]]:shadow-[var(--shadow-card)] [&[data-state=open]]:before:content-[''] [&[data-state=open]]:before:absolute [&[data-state=open]]:before:left-0 [&[data-state=open]]:before:top-3 [&[data-state=open]]:before:bottom-3 [&[data-state=open]]:before:w-[2px] [&[data-state=open]]:before:bg-[color:var(--gold)]"
              >
                <AccordionTrigger className="px-5 md:px-6 py-4 md:py-5 text-left text-[15px] md:text-[17px] serif text-[color:var(--charcoal)] hover:no-underline hover:text-[color:var(--teal)] transition-colors duration-200 [&[data-state=open]]:text-[color:var(--teal)]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-5 md:px-6 pb-5 md:pb-6 pt-0 text-[14.5px] md:text-[15px] leading-[1.65] text-[color:var(--charcoal)]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* ── Closing micro-section ─────────────────────────────
            "Not sure yet?" → Talk to a Local. Quiet, human, never
            pushy. The primary CTA goes to /contact (per brand rules,
            WhatsApp stays as optional support, never primary). */}
        <div className="reveal mt-12 md:mt-14 max-w-md mx-auto text-center">
          <p className="text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal)]">
            Not sure yet?
          </p>
          <Link
            to="/contact"
            className="group mt-5 inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3.5 text-[12.5px] uppercase tracking-[0.18em] font-bold bg-[color:var(--teal)] text-[color:var(--ivory)] border border-[color:color-mix(in_oklab,var(--gold)_60%,transparent)] hover:bg-[color:var(--teal-2)] hover:border-[color:color-mix(in_oklab,var(--gold)_85%,transparent)] hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ivory)] shadow-[0_8px_22px_-10px_rgba(41,91,97,0.55)] active:translate-y-0"
          >
            Talk to a Local
            <ArrowRight size={14} aria-hidden="true" className="text-[color:var(--gold-soft)] transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-1" />
          </Link>
          <p className="mt-4 text-[13px] italic leading-[1.55] text-[color:var(--charcoal-soft)]">
            We'll help you shape it — no pressure.
          </p>
        </div>
      </div>
    </section>
  );
}
