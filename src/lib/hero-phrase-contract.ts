/**
 * Hero phrase cadence contract.
 *
 * Single source of truth for the film-title cadence:
 *   • enter (fadeIn)         = 1200ms
 *   • hold                   ≥ 3200ms
 *   • exit  (fadeOut)        = 900ms
 *   • breathing pause (gap)  = 400–600ms
 *
 * Used by:
 *   - HeroPhraseDebug overlay (per-phrase live readout)
 *   - HeroContractAssert (preview-only automated check that surfaces
 *     a fixed banner + console.error + window.__heroContractViolations
 *     whenever any phrase scene violates the contract)
 */

export const HERO_PHRASE_CONTRACT = {
  fadeInMs: 1200,
  holdMinMs: 3200,
  fadeOutMs: 900,
  gapMinMs: 400,
  gapMaxMs: 600,
  toleranceMs: 40,
} as const;

export type PhraseTimings = {
  fadeInMs: number;
  holdMs: number;
  fadeOutMs: number;
};

export type ContractViolation = {
  phraseIndex: number; // -1 = global (gap)
  field: "fadeInMs" | "holdMs" | "fadeOutMs" | "gapMs";
  actual: number;
  expected: string;
};

const C = HERO_PHRASE_CONTRACT;

export function validateHeroContract(
  scenes: PhraseTimings[],
  gapMs: number,
): ContractViolation[] {
  const out: ContractViolation[] = [];
  scenes.forEach((s, i) => {
    if (Math.abs(s.fadeInMs - C.fadeInMs) > C.toleranceMs) {
      out.push({ phraseIndex: i, field: "fadeInMs", actual: s.fadeInMs, expected: `${C.fadeInMs}ms ±${C.toleranceMs}` });
    }
    if (s.holdMs < C.holdMinMs - C.toleranceMs) {
      out.push({ phraseIndex: i, field: "holdMs", actual: s.holdMs, expected: `≥${C.holdMinMs}ms` });
    }
    if (Math.abs(s.fadeOutMs - C.fadeOutMs) > C.toleranceMs) {
      out.push({ phraseIndex: i, field: "fadeOutMs", actual: s.fadeOutMs, expected: `${C.fadeOutMs}ms ±${C.toleranceMs}` });
    }
  });
  if (gapMs < C.gapMinMs - C.toleranceMs || gapMs > C.gapMaxMs + C.toleranceMs) {
    out.push({ phraseIndex: -1, field: "gapMs", actual: gapMs, expected: `${C.gapMinMs}–${C.gapMaxMs}ms` });
  }
  return out;
}
