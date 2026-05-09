import { Check } from "lucide-react";

/**
 * BuilderStepper — Step 1–4 indicator with completed / active / upcoming states.
 *
 * - Completed steps render a check icon and are clickable (jump back to edit).
 * - The active step is highlighted in gold with the step number.
 * - Upcoming steps are dimmed and non-interactive.
 *
 * Accessibility: rendered as an ordered list with `aria-current="step"` on the
 * active item. The visual ring + number is mirrored by readable labels for
 * screen readers ("Step 2 of 4 — Who, current step").
 */

export const BUILDER_STEP_LABELS = ["Mood", "Who", "Intention", "Rhythm"] as const;

interface Props {
  /** 1-indexed current step (1..4). */
  step: number;
  /** Highest step the user has completed (1-indexed). 0 = none. */
  furthestCompleted?: number;
  /** Optional click handler — receives 1-indexed step number. */
  onStepClick?: (step: 1 | 2 | 3 | 4) => void;
}

export function BuilderStepper({ step, furthestCompleted = 0, onStepClick }: Props) {
  const total = 4;
  const current = Math.max(1, Math.min(step, total));

  return (
    <nav aria-label="Builder steps" data-testid="builder-stepper">
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {Array.from({ length: total }, (_, i) => {
          const n = (i + 1) as 1 | 2 | 3 | 4;
          const isActive = n === current;
          const isComplete = n < current || n <= furthestCompleted;
          const isUpcoming = !isActive && !isComplete;
          const interactive = !!onStepClick && isComplete && !isActive;
          const label = BUILDER_STEP_LABELS[i];

          const dot = (
            <span
              className={[
                "inline-flex items-center justify-center rounded-full transition-all duration-200",
                "h-7 w-7 sm:h-8 sm:w-8 text-[11px] font-bold tabular-nums",
                isActive
                  ? "bg-[color:var(--gold)] text-[color:var(--ivory)] shadow-[0_0_0_4px_color-mix(in_oklab,var(--gold)_25%,transparent)]"
                  : isComplete
                    ? "bg-[color:var(--charcoal)] text-[color:var(--ivory)]"
                    : "bg-transparent text-[color:var(--charcoal)]/40 ring-1 ring-[color:var(--charcoal)]/20",
              ].join(" ")}
              aria-hidden="true"
            >
              {isComplete ? <Check size={13} strokeWidth={3} /> : n}
            </span>
          );

          const labelEl = (
            <span
              className={[
                "hidden sm:inline text-[10.5px] uppercase tracking-[0.2em] font-bold transition-colors",
                isActive
                  ? "text-[color:var(--charcoal)]"
                  : isComplete
                    ? "text-[color:var(--charcoal)]/70"
                    : "text-[color:var(--charcoal)]/35",
              ].join(" ")}
            >
              {label}
            </span>
          );

          const srLabel = `Step ${n} of ${total} — ${label}${
            isActive ? ", current step" : isComplete ? ", completed" : ", upcoming"
          }`;

          return (
            <li key={n} className="flex items-center gap-1.5 sm:gap-2">
              {interactive ? (
                <button
                  type="button"
                  onClick={() => onStepClick?.(n)}
                  aria-label={`Go back to ${srLabel}`}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/50"
                >
                  {dot}
                  {labelEl}
                </button>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 sm:gap-2"
                  aria-current={isActive ? "step" : undefined}
                  aria-label={srLabel}
                >
                  {dot}
                  {labelEl}
                </span>
              )}
              {n < total && (
                <span
                  aria-hidden="true"
                  className={[
                    "h-[2px] w-4 sm:w-6 rounded-full transition-colors",
                    isComplete ? "bg-[color:var(--charcoal)]/45" : "bg-[color:var(--charcoal)]/15",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
      <span className="sr-only" aria-live="polite">
        Currently on step {current} of {total}: {BUILDER_STEP_LABELS[current - 1]}.
      </span>
    </nav>
  );
}
