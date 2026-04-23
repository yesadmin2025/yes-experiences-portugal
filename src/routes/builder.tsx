import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, MapPin, Calendar, Users, Sparkles, Heart } from "lucide-react";
import expWine from "@/assets/exp-wine.jpg";
import expCoastal from "@/assets/exp-coastal.jpg";
import expGastronomy from "@/assets/exp-gastronomy.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expRomantic from "@/assets/exp-romantic.jpg";
import expStreet from "@/assets/exp-street.jpg";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Build Your Experience — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Design your own bespoke Portugal experience — choose region, theme, duration and travel style. Crafted around your story.",
      },
      { property: "og:title", content: "Build Your Portugal Experience" },
      {
        property: "og:description",
        content: "Customize your private Portugal journey step by step.",
      },
    ],
  }),
  component: BuilderPage,
});

const regions = [
  { id: "lisbon", name: "Lisbon & Coast", desc: "Capital, beaches & day trips", img: expStreet },
  { id: "porto", name: "Porto & Douro", desc: "Wine country & northern soul", img: expWine },
  { id: "alentejo", name: "Alentejo", desc: "Rolling plains & quiet villages", img: expNature },
  { id: "algarve", name: "Algarve", desc: "Cliffs, coves & sunsets", img: expCoastal },
];

const themes = [
  { id: "wine", name: "Wine & Vineyards", icon: "🍷" },
  { id: "gastronomy", name: "Gastronomy", icon: "🍽️" },
  { id: "nature", name: "Nature & Outdoors", icon: "🌿" },
  { id: "heritage", name: "Heritage & Culture", icon: "🏛️" },
  { id: "coastal", name: "Coastal & Sea", icon: "🌊" },
  { id: "romantic", name: "Romantic", icon: "💛" },
];

const durations = [
  { id: "halfday", label: "Half Day", sub: "4 hours" },
  { id: "fullday", label: "Full Day", sub: "8 hours" },
  { id: "twoday", label: "2–3 Days", sub: "Long weekend" },
  { id: "week", label: "5–7 Days", sub: "Full journey" },
];

const styles = [
  { id: "intimate", label: "Intimate", desc: "Just the two of you" },
  { id: "family", label: "Family", desc: "All ages welcome" },
  { id: "friends", label: "Friends", desc: "Group of 4–8" },
  { id: "celebration", label: "Celebration", desc: "Special occasion" },
];

function BuilderPage() {
  const [step, setStep] = useState(0);
  const [region, setRegion] = useState<string | null>(null);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [duration, setDuration] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);

  const steps = ["Region", "Themes", "Duration", "Style", "Summary"];

  const toggleTheme = (id: string) => {
    setSelectedThemes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const canNext =
    (step === 0 && region) ||
    (step === 1 && selectedThemes.length > 0) ||
    (step === 2 && duration) ||
    (step === 3 && style) ||
    step === 4;

  return (
    <SiteLayout>
      <section className="pt-32 pb-12 bg-[color:var(--sand)]">
        <div className="container-x text-center">
          <span className="eyebrow">Experience Builder</span>
          <h1 className="serif text-4xl md:text-6xl mt-5 leading-tight">
            Design Your <span className="italic text-[color:var(--teal)]">Portugal Story</span>
          </h1>
          <p className="mt-5 text-[color:var(--charcoal-soft)] max-w-xl mx-auto">
            Four simple steps. We'll craft a bespoke private experience around your answers.
          </p>
        </div>
      </section>

      {/* Progress */}
      <section className="border-b border-[color:var(--border)] bg-[color:var(--ivory)] sticky top-[68px] z-30 backdrop-blur">
        <div className="container-x py-5">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {steps.map((s, i) => (
              <div
                key={s}
                className="flex items-center gap-3 flex-shrink-0"
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    i < step
                      ? "bg-[color:var(--teal)] text-[color:var(--ivory)]"
                      : i === step
                        ? "bg-[color:var(--gold)] text-[color:var(--charcoal)]"
                        : "bg-[color:var(--sand)] text-[color:var(--charcoal-soft)]"
                  }`}
                >
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span
                  className={`text-xs uppercase tracking-[0.2em] ${
                    i === step ? "text-[color:var(--teal)]" : "text-[color:var(--charcoal-soft)]"
                  }`}
                >
                  {s}
                </span>
                {i < steps.length - 1 && (
                  <div className="hidden md:block w-12 h-px bg-[color:var(--border)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-x">
          {step === 0 && (
            <StepShell
              eyebrow="Step 1"
              title="Where in Portugal?"
              sub="Pick your region — or tell us later if you want to combine several."
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {regions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRegion(r.id)}
                    className={`group text-left transition-all ${
                      region === r.id ? "ring-2 ring-[color:var(--teal)]" : ""
                    }`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden mb-4">
                      <img
                        src={r.img}
                        alt={r.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {region === r.id && (
                        <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-[color:var(--teal)] flex items-center justify-center">
                          <Check size={14} className="text-[color:var(--ivory)]" strokeWidth={3} />
                        </div>
                      )}
                      <MapPin
                        className="absolute bottom-3 left-3 text-[color:var(--gold-soft)]"
                        size={18}
                      />
                    </div>
                    <h3 className="serif text-xl text-[color:var(--charcoal)]">{r.name}</h3>
                    <p className="text-sm text-[color:var(--charcoal-soft)] mt-1">{r.desc}</p>
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {step === 1 && (
            <StepShell
              eyebrow="Step 2"
              title="What inspires you?"
              sub="Choose any themes that speak to you. Mix and match — that's the point."
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {themes.map((t) => {
                  const active = selectedThemes.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTheme(t.id)}
                      className={`text-left p-6 border transition-all ${
                        active
                          ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5"
                          : "border-[color:var(--border)] hover:border-[color:var(--gold)]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-3xl">{t.icon}</span>
                        {active && (
                          <span className="h-6 w-6 rounded-full bg-[color:var(--teal)] flex items-center justify-center">
                            <Check size={12} className="text-[color:var(--ivory)]" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <h3 className="serif text-lg mt-4 text-[color:var(--charcoal)]">
                        {t.name}
                      </h3>
                    </button>
                  );
                })}
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              eyebrow="Step 3"
              title="How long do you have?"
              sub="From an unforgettable afternoon to a full week-long story."
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {durations.map((d) => {
                  const active = duration === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDuration(d.id)}
                      className={`p-8 border text-center transition-all ${
                        active
                          ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5"
                          : "border-[color:var(--border)] hover:border-[color:var(--gold)]"
                      }`}
                    >
                      <Calendar
                        className={`mx-auto ${
                          active ? "text-[color:var(--teal)]" : "text-[color:var(--gold)]"
                        }`}
                        size={28}
                      />
                      <h3 className="serif text-xl mt-4 text-[color:var(--charcoal)]">
                        {d.label}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)] mt-2">
                        {d.sub}
                      </p>
                    </button>
                  );
                })}
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell
              eyebrow="Step 4"
              title="Who's traveling with you?"
              sub="The energy of your journey changes everything."
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {styles.map((s) => {
                  const active = style === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`p-8 border text-left transition-all ${
                        active
                          ? "border-[color:var(--teal)] bg-[color:var(--teal)]/5"
                          : "border-[color:var(--border)] hover:border-[color:var(--gold)]"
                      }`}
                    >
                      <Users
                        className={
                          active ? "text-[color:var(--teal)]" : "text-[color:var(--gold)]"
                        }
                        size={26}
                      />
                      <h3 className="serif text-xl mt-4 text-[color:var(--charcoal)]">
                        {s.label}
                      </h3>
                      <p className="text-sm text-[color:var(--charcoal-soft)] mt-1">{s.desc}</p>
                    </button>
                  );
                })}
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell
              eyebrow="Your Story"
              title="Your Portugal Experience"
              sub="Here's the foundation we'll design around. Send it to our team and we'll craft the full bespoke proposal."
            >
              <div className="bg-[color:var(--sand)] p-8 md:p-12 border-l-4 border-[color:var(--gold)]">
                <div className="grid md:grid-cols-2 gap-8">
                  <SummaryRow
                    icon={<MapPin size={18} />}
                    label="Region"
                    value={regions.find((r) => r.id === region)?.name ?? "Any"}
                  />
                  <SummaryRow
                    icon={<Sparkles size={18} />}
                    label="Themes"
                    value={
                      selectedThemes
                        .map((id) => themes.find((t) => t.id === id)?.name)
                        .filter(Boolean)
                        .join(", ") || "Open to suggestions"
                    }
                  />
                  <SummaryRow
                    icon={<Calendar size={18} />}
                    label="Duration"
                    value={durations.find((d) => d.id === duration)?.label ?? "Flexible"}
                  />
                  <SummaryRow
                    icon={<Heart size={18} />}
                    label="Style"
                    value={styles.find((s) => s.id === style)?.label ?? "Open"}
                  />
                </div>

                <div className="gold-divider my-10" />

                <p className="serif italic text-xl text-[color:var(--teal)] text-center">
                  "We'll hand-craft your journey from this moment on."
                </p>

                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide transition-all"
                  >
                    Send to Our Designers
                    <ArrowRight size={16} />
                  </Link>
                  <button
                    onClick={() => {
                      setStep(0);
                      setRegion(null);
                      setSelectedThemes([]);
                      setDuration(null);
                      setStyle(null);
                    }}
                    className="inline-flex items-center gap-2 border border-[color:var(--charcoal)]/30 hover:border-[color:var(--charcoal)] text-[color:var(--charcoal)] px-7 py-3.5 text-sm tracking-wide transition-all"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </StepShell>
          )}

          {/* Nav buttons */}
          {step < 4 && (
            <div className="mt-16 flex justify-between items-center">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-2 text-sm text-[color:var(--charcoal)] disabled:opacity-30 hover:text-[color:var(--teal)] transition-colors"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => canNext && setStep(step + 1)}
                disabled={!canNext}
                className="inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-7 py-3.5 text-sm tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {step === 3 ? "Review My Story" : "Continue"}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function StepShell({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="serif text-3xl md:text-4xl mt-4 leading-tight">{title}</h2>
        <p className="mt-3 text-[color:var(--charcoal-soft)]">{sub}</p>
      </div>
      {children}
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-1 h-9 w-9 rounded-full bg-[color:var(--ivory)] flex items-center justify-center text-[color:var(--teal)] flex-shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--charcoal-soft)]">
          {label}
        </p>
        <p className="serif text-xl text-[color:var(--charcoal)] mt-1">{value}</p>
      </div>
    </div>
  );
}
