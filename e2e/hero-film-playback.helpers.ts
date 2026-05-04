/**
 * First-frame retry classification — pure helpers extracted so the
 * decision logic is unit-testable without spinning up a browser.
 *
 * The first-frame budget assertion in
 * `e2e/hero-film-playback.spec.ts` retries ONLY when a failure looks
 * like CI scheduler jitter:
 *   - reason starts with "budget exceeded"
 *   - the observed time is a near-miss (< JITTER_RATIO × budget)
 * Every other failure is treated as a hard regression and fails fast.
 */

export const FIRST_FRAME_JITTER_RATIO = 1.5;

export type FirstFrameProbeResult = {
  ok: boolean;
  /** Free-text reason — see classifier below for the recognised forms. */
  reason: string;
  /** Observed ms from `loadedmetadata` to first frame (or -1 if N/A). */
  ms: number;
};

/**
 * Returns true iff the failure should trigger a retry.
 *
 * Hard failures (NEVER retried):
 *   - ok=true (success — nothing to retry)
 *   - "video element missing"
 *   - "decoder error: ..."
 *   - "autoplay rejected: ..."
 *   - "budget exceeded" with ms ≥ JITTER_RATIO × budget (real regression)
 *   - any unrecognised reason (treated as hard so we never silently
 *     paper over a new failure mode)
 *
 * Jitter (retried up to caller's MAX_ATTEMPTS):
 *   - "budget exceeded" with 0 < ms < JITTER_RATIO × budget
 */
export function isFirstFrameJitter(
  result: FirstFrameProbeResult,
  budgetMs: number,
  jitterRatio: number = FIRST_FRAME_JITTER_RATIO,
): boolean {
  if (result.ok) return false;
  if (!result.reason.startsWith("budget exceeded")) return false;
  if (result.ms <= 0) return false;
  return result.ms < budgetMs * jitterRatio;
}
