import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import {
  ArrowRight,
  MessageCircle,
  Heart,
  Wine,
  Sun,
  UtensilsCrossed,
  Sparkles,
  Users,
  Lock,
  MapPin,
  Clock,
} from "lucide-react";
import { whatsappHref } from "@/components/WhatsAppFab";
import heroImg from "@/assets/cat-proposals.jpg";
import romantic from "@/assets/exp-romantic.jpg";
import coastal from "@/assets/exp-coastal.jpg";
import wine from "@/assets/exp-wine.jpg";
import nature from "@/assets/exp-nature.jpg";
import gastronomy from "@/assets/exp-gastronomy.jpg";
import decision from "@/assets/decision-moment.jpg";

export const Route = createFileRoute("/proposals")({
  head: () => ({
    meta: [
      { title: "Moments Worth Saying YES To — Proposals & Celebrations in Portugal" },
      {
        name: "description",
        content:
          "Proposals, anniversaries, birthdays and private celebrations in Portugal — shaped quietly with local knowledge. Discreet, intimate, beautifully timed.",
      },
      { property: "og:title", content: "Moments Worth Saying YES To" },
      {
        property: "og:description",
        content:
          "Proposals, anniversaries, birthdays and private celebrations shaped with local knowledge.",
      },
      { property: "og:image", content: heroImg },
      { property: "twitter:image", content: heroImg },
    ],
  }),
  component: ProposalsPage,
});

type Moment = {
  id: string;
  title: string;
  line: string;
  setting: string;
  image: string;
  icon: typeof Heart;
  hint: string; // for WhatsApp prefill
};

const MOMENTS: Moment[] = [
  {
    id: "sea",
    title: "Proposal by the sea",
    line: "A quiet cove, the light just before sunset, only the two of you.",
    setting: "Arrábida coast · golden hour",
    image: coastal,
    icon: Heart,
    hint: "a proposal by the sea",
  },
  {
    id: "vineyard",
    title: "Vineyard toast",
    line: "Old vines, a single table, a glass raised to what's next.",
    setting: "Setúbal vineyards · late afternoon",
    image: wine,
    icon: Wine,
    hint: "a vineyard toast",
  },
  {
    id: "viewpoint",
    title: "Sunset viewpoint",
    line: "A hidden ridge above the Atlantic — held just for you, just for that moment.",
    setting: "Arrábida ridge · sunset",
    image: nature,
    icon: Sun,
    hint: "a sunset viewpoint moment",
  },
  {
    id: "lunch",
    title: "Private lunch",
    line: "A long table by the water, a chef who cooks only for you.",
    setting: "Portinho da Arrábida · midday",
    image: gastronomy,
    icon: UtensilsCrossed,
    hint: "a private lunch celebration",
  },
  {
    id: "intimate",
    title: "Intimate celebration",
    line: "Anniversary, vow renewal, a milestone birthday — held with care, never staged.",
    setting: "Your chosen setting",
    image: romantic,
    icon: Sparkles,
    hint: "an intimate celebration",
  },
  {
    id: "family",
    title: "Family gathering",
    line: "Grandparents, children, the people who matter — one table, one afternoon.",
    setting: "Countryside or coast",
    image: decision,
    icon: Users,
    hint: "a private family gathering",
  },
];

function ProposalsPage() {
  return (
    <SiteLayout>
      {/* ============ HERO ============ */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/75" />
        <div className="container-x relative text-center text-white">
          <span className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold-soft)]">
            Held quietly · designed with care
          </span>
          <h1 className="serif text-[34px] md:text-6xl mt-4 leading-[1.08] max-w-3xl mx-auto">
            Moments Worth
            <br className="hidden sm:block" />{" "}
            <span className="italic text-[color:var(--gold-soft)]">Saying YES To</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-[14px] md:text-[15px] text-white/85 italic leading-relaxed">
            Proposals, anniversaries, birthdays and private celebrations shaped with local knowledge.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2.5 justify-center items-stretch sm:items-center max-w-md mx-auto">
            <a
              href={whatsappHref(
                "Hi! I'd like to plan a private moment in Portugal — could you help me shape it?",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[color:var(--ivory)] text-[color:var(--charcoal)] px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-white transition-colors"
            >
              Plan Your Moment <ArrowRight size={14} />
            </a>
            <Link
              to="/builder"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-white/10 transition-colors"
            >
              Shape it in the Studio
            </Link>
          </div>
          <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-white/65 inline-flex items-center gap-2 justify-center">
            <Lock size={10} /> Discreet · private · never staged
          </p>
        </div>
      </section>

      {/* ============ EMOTIONAL INTRO ============ */}
      <section className="py-14 md:py-20 bg-[color:var(--sand)]">
        <div className="container-x max-w-3xl text-center">
          <span className="eyebrow">Why it matters</span>
          <h2 className="serif text-[26px] md:text-4xl mt-4 leading-[1.15] text-[color:var(--charcoal)]">
            A moment is built from{" "}
            <span className="italic text-[color:var(--teal)]">small, true things</span>.
          </h2>
          <p className="mt-5 text-[14px] md:text-[15px] text-[color:var(--charcoal-soft)] leading-relaxed">
            The right light. The right hour. A place that feels like only yours. We don't stage these
            moments — we hold them. Quietly, with people who know the coast, the vineyards and the
            hidden corners of this country by heart.
          </p>
          <ul className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {[
              { k: "Setting", v: "A real place, chosen for you — not a backdrop." },
              { k: "Timing", v: "The hour the light falls right." },
              { k: "Atmosphere", v: "Quiet enough to hear what matters." },
              { k: "Privacy", v: "Held only for you, no one else." },
            ].map((it) => (
              <li
                key={it.k}
                className="border-l-2 border-[color:var(--gold)]/50 pl-3 py-1"
              >
                <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
                  {it.k}
                </p>
                <p className="mt-1.5 text-[12.5px] text-[color:var(--charcoal-soft)] italic leading-relaxed">
                  {it.v}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ MOMENTS ============ */}
      <section className="py-14 md:py-20">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Begin with a feeling</span>
            <h2 className="serif text-[26px] md:text-4xl mt-4 leading-tight text-[color:var(--charcoal)]">
              Six <span className="italic text-[color:var(--teal)]">starting moments</span>.
            </h2>
            <p className="mt-3 text-[13px] md:text-[14px] text-[color:var(--charcoal-soft)] italic">
              Each one is a beginning, not a package. We shape the rest with you.
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {MOMENTS.map((m) => (
              <li key={m.id}>
                <a
                  href={whatsappHref(
                    `Hi! I'd like to plan ${m.hint} in Portugal. Could you help me shape it?`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-[4/5] overflow-hidden rounded-sm ring-1 ring-[color:var(--border)] hover:ring-[color:var(--teal)]/50 transition-all"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.05]"
                    style={{ backgroundImage: `url(${m.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-sm text-white/90 text-[10px] uppercase tracking-[0.22em]">
                    <m.icon size={11} className="text-[color:var(--gold-soft)]" />
                    Moment
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <h3 className="serif text-[20px] md:text-[22px] text-white leading-tight">
                      {m.title}
                    </h3>
                    <p className="mt-1.5 text-[12.5px] text-white/85 italic leading-snug">
                      {m.line}
                    </p>
                    <p className="mt-2.5 text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-soft)] flex items-center gap-1.5">
                      <MapPin size={10} /> {m.setting}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-14 md:py-20 bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)]">
        <div className="container-x max-w-4xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold-soft)]">
              How a moment is shaped
            </span>
            <h2 className="serif text-[26px] md:text-4xl mt-4 leading-tight text-white">
              Quietly, <span className="italic text-[color:var(--gold-soft)]">step by step</span>.
            </h2>
          </div>

          <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                n: "01",
                k: "Start with the moment",
                v: "Tell us what you want to hold — a question, a milestone, a quiet anniversary.",
              },
              {
                n: "02",
                k: "Choose the mood",
                v: "Sea or vines, sunset or candlelight, alone or with the people who matter.",
              },
              {
                n: "03",
                k: "Shape the setting",
                v: "We propose places only locals know. You choose the one that feels right.",
              },
              {
                n: "04",
                k: "Confirm or chat",
                v: "Confirm instantly through the Studio, or shape it message by message with a local.",
              },
            ].map((s) => (
              <li
                key={s.n}
                className="border border-white/10 bg-white/[0.03] p-5 md:p-6 rounded-sm"
              >
                <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-soft)]">
                  {s.n}
                </p>
                <h3 className="serif text-[20px] mt-2 text-white leading-tight">{s.k}</h3>
                <p className="mt-2 text-[13px] text-white/75 italic leading-relaxed">{s.v}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col sm:flex-row gap-2.5 justify-center max-w-md mx-auto">
            <a
              href={whatsappHref(
                "Hi! I'd like to shape a private moment in Portugal with a local.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[color:var(--ivory)] text-[color:var(--charcoal)] px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-white transition-colors"
            >
              <MessageCircle size={13} /> Chat with a local
            </a>
            <Link
              to="/builder"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-white/10 transition-colors"
            >
              Open the Studio <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ TRUST ============ */}
      <section className="py-14 md:py-20">
        <div className="container-x max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { i: Lock, k: "Discreet", v: "Held privately. No staging, no audience." },
              { i: Heart, k: "Thoughtful", v: "Designed around the two of you, not a template." },
              { i: Clock, k: "Timed right", v: "We know the hour the light falls in each place." },
            ].map((t) => (
              <div
                key={t.k}
                className="text-center border-t border-[color:var(--gold)]/40 pt-5"
              >
                <t.i size={18} className="mx-auto text-[color:var(--teal)]" />
                <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
                  {t.k}
                </p>
                <p className="mt-2 text-[13px] text-[color:var(--charcoal-soft)] italic leading-relaxed">
                  {t.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <img
          src={romantic}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/75" />
        <div className="container-x relative text-center text-white max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold-soft)]">
            When you're ready
          </span>
          <h2 className="serif text-[28px] md:text-5xl mt-4 leading-[1.1]">
            Create Your <span className="italic text-[color:var(--gold-soft)]">Moment</span>.
          </h2>
          <p className="mt-4 text-[14px] text-white/85 italic leading-relaxed">
            Begin with a single message. We shape the rest, quietly.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2.5 justify-center max-w-md mx-auto">
            <a
              href={whatsappHref(
                "Hi! I'd like to create a private moment in Portugal — could you help me begin?",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[color:var(--ivory)] text-[color:var(--charcoal)] px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-white transition-colors"
            >
              <MessageCircle size={13} /> Create Your Moment
            </a>
            <Link
              to="/builder"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-white/10 transition-colors"
            >
              Shape it in the Studio
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
