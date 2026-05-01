import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

interface Props {
  onStart: () => void;
}

/**
 * Step 0 — first impression. Warm ivory canvas, an animated route line,
 * one primary CTA into the flow + one secondary into Signature tours.
 * No form feel, no cards stacked.
 */
export function EntryScreen({ onStart }: Props) {
  return (
    <section
      aria-labelledby="builder-entry-title"
      className="relative isolate overflow-hidden bg-[color:var(--ivory)] text-[color:var(--charcoal)]"
    >
      {/* Subtle moving route line — pure SVG, respects reduced motion */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-[0.18] motion-reduce:opacity-[0.12]"
      >
        <defs>
          <linearGradient id="builderEntryLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--gold)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M -50 420 C 220 360, 360 220, 560 240 S 880 360, 1080 220 1280 120 1300 80"
          stroke="url(#builderEntryLine)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 14"
          className="builder-entry-line"
        />
        <path
          d="M -80 480 C 200 440, 380 320, 600 340 S 920 460, 1140 320"
          stroke="var(--teal)"
          strokeOpacity="0.35"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="2 10"
        />
      </svg>

      <div className="container-x relative z-10 grid min-h-[78svh] place-items-center py-16 md:py-24">
        <div className="section-enter max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--gold)]">
            <Sparkles size={12} aria-hidden="true" />
            Experience studio
          </span>

          <h1
            id="builder-entry-title"
            className="serif mt-5 text-[2.6rem] sm:text-[3.4rem] md:text-[4rem] leading-[1.02] tracking-[-0.02em] font-semibold"
          >
            Create your Portugal <span className="italic">experience</span>.
          </h1>

          <p className="mt-5 max-w-xl mx-auto serif italic text-[1.15rem] sm:text-[1.35rem] leading-[1.3] text-[color:var(--charcoal)]/85">
            Choose what feels right. We'll shape a starting point in real time.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onStart}
              className="cta-unified group inline-flex items-center justify-center gap-2 px-7 py-4 min-h-[52px] rounded-[2px] bg-[color:var(--charcoal)] text-[color:var(--ivory)] text-[12.5px] uppercase tracking-[0.22em] font-bold hover:bg-[color:var(--teal)] shadow-[0_14px_32px_-16px_rgba(46,46,46,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gold)]"
            >
              Start building
              <ArrowRight size={14} className="cta-unified-arrow" />
            </button>

            <Link
              to="/experiences"
              className="cta-unified inline-flex items-center justify-center gap-2 px-6 py-4 min-h-[52px] rounded-[2px] border border-[color:var(--charcoal)]/20 bg-transparent text-[12.5px] uppercase tracking-[0.22em] font-bold text-[color:var(--charcoal)] hover:border-[color:var(--charcoal)]/45"
            >
              Start from a signature
            </Link>
          </div>

          <p className="mt-6 text-[12px] text-[color:var(--charcoal)]/55 tracking-wide">
            About a minute. No form. Just choices.
          </p>
        </div>
      </div>
    </section>
  );
}
