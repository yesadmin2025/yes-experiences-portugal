import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { fmtMinutes, type RouteUI, type RoutedStopUI, builderWaHref } from "./types";
import type { BuilderImageRef } from "@/hooks/useBuilderImages";

interface Props {
  route: RouteUI;
  stops: RoutedStopUI[];
  guests: number;
  narrative: string;
  reviewThumbs?: BuilderImageRef[];
  onConfirm: () => void;
  onBack: () => void;
}

const TRUST_POINTS = [
  "Private experience",
  "Local guidance",
  "Realistic, achievable route",
  "Instant confirmation",
];

const INCLUDED = [
  "Private driver-host",
  "All planned stops",
  "Curated tastings & visits",
  "Personalised story for the day",
];

const FLEXIBLE = [
  "Final stop order",
  "Lunch & wine choices",
  "Pace adjustments",
  "Adding a celebration moment",
];

/**
 * Step "Final review" — last beat before checkout. Restates everything in
 * one clean editorial layout, surfaces trust, and offers a final call to
 * either confirm (Stripe) or talk to a local first (WhatsApp).
 */
export function ReviewScreen({ route, stops, guests, narrative, reviewThumbs, onConfirm, onBack }: Props) {
  const thumbs = (reviewThumbs ?? []).slice(0, 4);
  const totalEur = route.pricePerPersonEur * guests;

  return (
    <section className="bg-[color:var(--ivory)] text-[color:var(--charcoal)]">
      <div className="container-x py-10 md:py-16 builder-reveal">
        <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--gold)]">
          Final review
        </span>
        <h2 className="serif mt-3 text-[2rem] sm:text-[2.6rem] md:text-[3rem] leading-[1.04] tracking-[-0.01em] font-semibold">
          Your experience is <span className="italic">ready</span>.
        </h2>
        {narrative && (
          <p className="mt-4 max-w-2xl serif italic text-[1.1rem] sm:text-[1.25rem] leading-[1.4] text-[color:var(--charcoal)]/85">
            {narrative}
          </p>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Left: details */}
          <div className="flex flex-col gap-6">
            <div className="rounded-[2px] border border-[color:var(--charcoal)]/12 bg-[color:var(--ivory)] p-5">
              <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-[color:var(--gold)]">
                Route
              </p>
              <p className="mt-1 serif text-[1.2rem] font-semibold leading-[1.15]">
                {route.region.label}
              </p>
              <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[color:var(--charcoal)]/80">
                {stops.map((s, i) => (
                  <li key={s.key} className="inline-flex items-center gap-2">
                    {i > 0 && <span className="text-[color:var(--charcoal)]/30">→</span>}
                    <span className="font-semibold">{s.label}</span>
                  </li>
                ))}
              </ol>
            </div>

            {thumbs.length > 0 && (
              <div className="-mx-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {thumbs.map((t, i) => (
                  <figure
                    key={`${t.url}-${i}`}
                    className="relative overflow-hidden rounded-[2px] border border-[color:var(--charcoal)]/10 bg-[color:var(--sand)]/40 aspect-[4/5]"
                  >
                    <img
                      src={t.url}
                      alt={t.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[600ms] ease-out hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal)]/35 via-transparent to-transparent" />
                  </figure>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Stops" value={String(stops.length)} />
              <Stat label="Duration" value={fmtMinutes(route.totals.experienceMinutes)} />
              <Stat label="Pace" value={route.pace} capitalize />
              <Stat label="Guests" value={String(guests)} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Block title="What's included" items={INCLUDED} />
              <Block title="What can still change" items={FLEXIBLE} muted />
            </div>
          </div>

          {/* Right: trust + price + CTAs */}
          <aside className="flex flex-col gap-5 self-start lg:sticky lg:top-24">
            <div className="rounded-[2px] border border-[color:var(--charcoal)]/12 bg-[color:var(--sand)]/40 p-5">
              <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-[color:var(--gold)]">
                Estimated investment
              </p>
              <p className="mt-2 serif text-[2.4rem] leading-none font-semibold tabular-nums">
                €{totalEur}
              </p>
              <p className="mt-1 text-[12px] text-[color:var(--charcoal)]/65">
                €{route.pricePerPersonEur} per guest · {guests} guest
                {guests > 1 ? "s" : ""}
              </p>

              <ul className="mt-5 flex flex-col gap-2">
                {TRUST_POINTS.map((t) => (
                  <li
                    key={t}
                    className="inline-flex items-start gap-2 text-[13px] text-[color:var(--charcoal)]/85"
                  >
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      className="mt-0.5 shrink-0 text-[color:var(--gold)]"
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[2px] bg-[color:var(--charcoal)] px-7 py-4 min-h-[52px] text-[12.5px] uppercase tracking-[0.22em] font-bold text-[color:var(--ivory)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[color:var(--teal)] shadow-[0_14px_28px_-14px_rgba(46,46,46,0.55)]"
            >
              Confirm your experience
              <ArrowRight size={14} />
            </button>

            <a
              href={builderWaHref(
                `Hi! I'd like to talk to a local before confirming this experience: ${route.region.label}, ${stops.length} stops, ${guests} guest${guests > 1 ? "s" : ""}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[2px] border border-[color:var(--charcoal)]/20 px-6 py-3.5 min-h-[48px] text-[12px] uppercase tracking-[0.2em] font-bold text-[color:var(--charcoal)] transition-colors duration-200 hover:border-[color:var(--charcoal)]/45"
            >
              <MessageCircle size={14} strokeWidth={1.75} />
              Talk to a local before confirming
            </a>

            <button
              type="button"
              onClick={onBack}
              className="self-start text-[12px] underline underline-offset-4 text-[color:var(--charcoal)]/55 hover:text-[color:var(--charcoal)]"
            >
              ← Keep adjusting
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-[2px] border border-[color:var(--charcoal)]/12 bg-[color:var(--ivory)] px-3 py-2.5">
      <p className="text-[9.5px] uppercase tracking-[0.24em] font-semibold text-[color:var(--charcoal)]/55">
        {label}
      </p>
      <p
        className={[
          "mt-1 serif text-[1.15rem] font-semibold text-[color:var(--charcoal)] tabular-nums",
          capitalize ? "capitalize" : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function Block({
  title,
  items,
  muted,
}: {
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div className="rounded-[2px] border border-[color:var(--charcoal)]/12 bg-[color:var(--ivory)] p-5">
      <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-[color:var(--gold)]">
        {title}
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((it) => (
          <li
            key={it}
            className={[
              "text-[13px] leading-snug",
              muted ? "text-[color:var(--charcoal)]/65" : "text-[color:var(--charcoal)]/85",
            ].join(" ")}
          >
            · {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
