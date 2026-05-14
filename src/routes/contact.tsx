import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Mail, Phone, MapPin, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CtaButton } from "@/components/ui/CtaButton";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Speak directly with our YES Portugal experience designers. We respond within one business day — personally, not automatically.",
      },
      { property: "og:title", content: "Contact YES experiences Portugal" },
      {
        property: "og:description",
        content: "Speak directly with our YES Portugal experience designers.",
      },
    ],
  }),
  component: Page,
});

const OCCASIONS = [
  "Private Day Tour",
  "Multi-Day Journey",
  "Proposal or Celebration",
  "Corporate / Group",
  "Something else",
];

function Page() {
  const [sent, setSent] = useState(false);
  const [occasion, setOccasion] = useState("");

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="pt-32 pb-16 bg-[color:var(--sand)] reveal">
        <div className="container-x max-w-3xl text-center">
          <Eyebrow flank>Talk to a Designer</Eyebrow>
          <SectionTitle as="h1" size="anchor" spacing="loose">
            Begin Your{" "}
            <SectionTitle.Em>Portugal Story</SectionTitle.Em>
          </SectionTitle>
          <span className="gold-rule mt-6 mx-auto max-w-[80px]" aria-hidden="true" />
          <p className="mt-6 text-[1rem] md:text-[1.1rem] text-[color:var(--charcoal-soft)] leading-relaxed max-w-xl mx-auto">
            Tell us a little about who you are and what you'd love to experience.
            We'll respond within one business day — personally, not automatically.
          </p>
        </div>
      </section>

      {/* FORM + SIDEBAR */}
      <section className="py-20 md:py-24">
        <div className="container-x grid lg:grid-cols-3 gap-12 lg:gap-16 items-start">

          {/* FORM */}
          <div className="lg:col-span-2 reveal">
            {sent ? (
              <div className="border-l-4 border-[color:var(--gold)] bg-[color:var(--sand)] p-10 md:p-12">
                <div className="inline-flex items-center justify-center h-12 w-12 bg-[color:var(--teal)]/10 text-[color:var(--teal)] mb-5">
                  <CheckCircle size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-[1.8rem] md:text-[2.2rem] text-[color:var(--teal)] leading-snug">
                  Thank you.
                </h3>
                <p className="mt-3 text-[color:var(--charcoal-soft)] leading-relaxed">
                  Your message has reached our experience designers. We'll be in touch
                  within one business day — personally, with a real reply.
                </p>
                <p className="mt-5 font-serif italic text-[color:var(--teal)]">
                  "Every reply is personal."
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-8 text-[11px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] hover:text-[color:var(--teal)] transition-colors underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="space-y-8"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <Field label="First Name" name="first" required />
                  <Field label="Last Name" name="last" required />
                </div>
                <Field label="Email Address" name="email" type="email" required />
                <Field label="Phone (optional)" name="phone" type="tel" />
                <div>
                  <span className="block text-[11px] uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)] mb-3">
                    What are you planning?
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setOccasion(o)}
                        className={`px-4 py-2 text-[11px] uppercase tracking-[0.18em] border transition-all duration-200 ${
                          occasion === o
                            ? "border-[color:var(--teal)] bg-[color:var(--teal)] text-[color:var(--ivory)]"
                            : "border-[color:var(--charcoal)]/20 text-[color:var(--charcoal-soft)] hover:border-[color:var(--teal)] hover:text-[color:var(--teal)]"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="occasion" value={occasion} />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Field label="Approximate Travel Dates" name="dates" placeholder="e.g. June 2025" />
                  <Field label="Number of Guests" name="guests" placeholder="e.g. 2 adults" />
                </div>
                <Field
                  label="What are you dreaming of?"
                  name="message"
                  textarea
                  required
                  placeholder="Tell us about your ideal experience — the places, the mood, the people you're travelling with..."
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2.5 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-8 py-4 text-[11px] uppercase tracking-[0.22em] transition-all duration-200 hover:-translate-y-px active:scale-[0.98]"
                  >
                    <MessageCircle size={14} aria-hidden="true" />
                    Send Message
                  </button>
                  <p className="text-[12px] text-[color:var(--charcoal-soft)]">
                    We reply within one business day.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="reveal space-y-8 lg:pt-2">
            <div className="space-y-6">
              <ContactInfo
                icon={<Mail size={16} />}
                label="Email"
                value="hello@yesexperiences.pt"
                href="mailto:hello@yesexperiences.pt"
              />
              <ContactInfo
                icon={<Phone size={16} />}
                label="WhatsApp"
                value="+351 910 000 000"
                href="https://wa.me/351910000000"
              />
              <ContactInfo
                icon={<MapPin size={16} />}
                label="Based in"
                value="Lisbon, Portugal"
              />
              <ContactInfo
                icon={<Clock size={16} />}
                label="Response time"
                value="Within one business day"
              />
            </div>
            <div className="h-px bg-[color:var(--border)]" />
            <p className="font-serif italic text-[1.05rem] text-[color:var(--teal)] leading-relaxed">
              "We design Portugal experiences with care. Every reply is personal — from a local
              who knows the places, the timing and the details that make a day unforgettable."
            </p>
            <div className="h-px bg-[color:var(--border)]" />
            <div>
              <p className="text-[13px] text-[color:var(--charcoal-soft)] leading-relaxed mb-4">
                Prefer a quick message? A local is one message away on WhatsApp.
              </p>
              <CtaButton
                href="https://wa.me/351910000000"
                variant="ghost"
                size="sm"
                icon={null}
                iconLeading={<MessageCircle size={13} aria-hidden="true" />}
              >
                Chat on WhatsApp
              </CtaButton>
            </div>
          </aside>
        </div>
      </section>

      {/* REASSURANCE STRIP */}
      <section className="py-12 bg-[color:var(--sand)] reveal">
        <div className="container-x">
          <div className="grid sm:grid-cols-3 gap-8 text-center max-w-3xl mx-auto">
            {[
              { label: "Personal reply", text: "Every message is read and answered by a local designer — never a bot." },
              { label: "No commitment", text: "Ask anything. There's no obligation until you decide to confirm." },
              { label: "Always private", text: "Your details are never shared. Every experience is designed with full discretion." },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold-deep)] font-semibold mb-2">
                  {item.label}
                </p>
                <p className="text-[13.5px] text-[color:var(--charcoal-soft)] leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  textarea = false,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block group">
      <span className="block text-[11px] uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)] mb-2">
        {label}
        {required && <span className="ml-1 text-[color:var(--teal)]">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          rows={5}
          required={required}
          placeholder={placeholder}
          className="w-full bg-transparent border-b border-[color:var(--charcoal)]/25 focus:border-[color:var(--teal)] outline-none py-2.5 text-[15px] resize-none transition-colors duration-200 placeholder:text-[color:var(--charcoal-soft)]/40 text-[color:var(--charcoal)]"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          className="w-full bg-transparent border-b border-[color:var(--charcoal)]/25 focus:border-[color:var(--teal)] outline-none py-2.5 text-[15px] transition-colors duration-200 placeholder:text-[color:var(--charcoal-soft)]/40 text-[color:var(--charcoal)]"
        />
      )}
    </label>
  );
}

function ContactInfo({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="mt-0.5 h-9 w-9 shrink-0 flex items-center justify-center bg-[color:var(--sand)] text-[color:var(--teal)]">
        {icon}
      </span>
      <div>
        <p className="text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--charcoal-soft)] mb-0.5">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            className="text-[14.5px] text-[color:var(--charcoal)] hover:text-[color:var(--teal)] transition-colors"
          >
            {value}
          </a>
        ) : (
          <p className="text-[14.5px] text-[color:var(--charcoal)]">{value}</p>
        )}
      </div>
    </div>
  );
}
