import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

/**
 * SignatureCarousel — premium horizontal swipe carousel for the
 * homepage Signature Journeys section.
 *
 * Mobile-first: native scroll-snap horizontal scroll with momentum;
 * cards are 84vw wide so the next card peeks at the right edge,
 * signalling "more to swipe". Desktop: 3 cards visible.
 *
 * Cinematic feel:
 *   - large editorial photography (4:5 aspect)
 *   - bottom-anchored gradient overlay for text legibility
 *   - subtle image zoom on hover (1.05× over 1.4s)
 *   - eyebrow pace tag, serif title, italic teaser, tiny CTA arrow
 *   - active card tracked via IntersectionObserver → tiny dot indicator
 *
 * No heavy controls (no big arrows). A quiet pagination dot row sits
 * below the strip so the user always knows their position.
 */

type Item = {
  id: string;
  title: string;
  img: string;
  line: string;
  pace?: string[];
};

type Props = {
  items: Item[];
};

export function SignatureCarousel({ items }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track the most-visible card → drive the dot indicator.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-carousel-card]"),
    );
    if (cards.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        let bestIdx = activeIndex;
        let bestRatio = 0;
        for (const e of entries) {
          const idx = cards.indexOf(e.target as HTMLElement);
          if (idx === -1) continue;
          if (e.intersectionRatio > bestRatio) {
            bestRatio = e.intersectionRatio;
            bestIdx = idx;
          }
        }
        if (bestRatio > 0.4) setActiveIndex(bestIdx);
      },
      {
        root: track,
        threshold: [0.25, 0.5, 0.75, 1],
      },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToIndex = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>("[data-carousel-card]");
    const target = cards[idx];
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "start",
      block: "nearest",
    });
  }, []);

  return (
    <div className="relative">
      {/* Track — native horizontal scroll, snap-mandatory.
          Padding-x equals the container gutter so the first card aligns
          to the column, and `scroll-padding` keeps the snap target on
          the same gutter line. */}
      <div
        ref={trackRef}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-5 px-5 md:-mx-8 md:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingLeft: "1.25rem" }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Signature Journeys"
      >
        {items.map((s, i) => (
          <article
            key={s.id}
            data-carousel-card
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}: ${s.title}`}
            className="snap-start shrink-0 basis-[84%] sm:basis-[58%] lg:basis-[31%] group"
          >
            <Link
              to="/tours/$tourId"
              params={{ tourId: s.id }}
              className="editorial-card block relative overflow-hidden aspect-[4/5] border border-[color:var(--border)] active:scale-[1.01] active:transition-transform active:duration-150"
              aria-label={`Open journey — ${s.title}`}
            >
              <img
                src={s.img}
                alt={s.title}
                loading="lazy"
                data-card-image
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Cinematic bottom-anchored wash. Top kept light so the
                  photography breathes; bottom carries the legibility. */}
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/90 via-[color:var(--charcoal-deep)]/35 to-transparent" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(15,15,15,0.35)_100%)]" />

              {/* Top-left pace eyebrow — sets pace before the title. */}
              {s.pace && s.pace[0] && (
                <span className="absolute top-4 left-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-soft)]">
                  <span className="block h-px w-5 bg-[color:var(--gold)]/80" />
                  {s.pace[0]}
                </span>
              )}

              {/* Bottom content stack — title, teaser, micro CTA. */}
              <div className="absolute inset-x-5 bottom-5 md:inset-x-7 md:bottom-7 text-[color:var(--ivory)]">
                <h3 className="serif text-[1.6rem] md:text-[1.85rem] leading-[1.1] tracking-[-0.005em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
                  {s.title.split(" — ")[0]}
                </h3>
                <p className="mt-3 text-[13.5px] md:text-[14.5px] italic font-light leading-[1.55] text-[color:var(--ivory)]/90 max-w-[34ch]">
                  {s.line}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] font-medium text-[color:var(--gold-soft)] group-hover:text-[color:var(--gold)] transition-colors">
                  Discover
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Quiet pagination dots — premium, no chunky controls. */}
      <div
        className="mt-6 flex justify-center items-center gap-2"
        role="tablist"
        aria-label="Carousel pagination"
      >
        {items.map((s, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${i + 1}: ${s.title}`}
              onClick={() => scrollToIndex(i)}
              className="relative inline-flex items-center justify-center w-9 h-9 -mx-1 group/dot"
            >
              <span
                aria-hidden="true"
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-6 h-1.5 bg-[color:var(--gold)]"
                    : "w-1.5 h-1.5 bg-[color:var(--charcoal)]/25 group-active/dot:bg-[color:var(--charcoal)]/55"
                }`}
              />
            </button>
      </div>
    </div>
  );
}
