/**
 * HeroContractAssert — preview-only automated check.
 *
 * Validates each PHRASE_SCENES entry + PHRASE_GAP_MS against the
 * film-title cadence contract (1200 / ≥3200 / 900 / 400–600).
 *
 * On violation:
 *   • console.error with a structured table of every offender
 *   • renders a fixed bottom banner over the hero
 *   • exposes window.__heroContractViolations for E2E / manual checks
 *
 * Runs only in dev (import.meta.env.DEV) or when ?contract-check=1 is
 * present — never in production. Silent on PASS.
 */

import { useEffect, useState } from "react";
import {
  validateHeroContract,
  type ContractViolation,
  type ContractFix,
  type PhraseTimings,
  HERO_PHRASE_CONTRACT,
} from "@/lib/hero-phrase-contract";

declare global {
  interface Window {
    __heroContractViolations?: ContractViolation[];
  }
}

function shouldRun(): boolean {
  if (typeof window === "undefined") return false;
  if (import.meta.env.DEV) return true;
  try {
    return new URLSearchParams(window.location.search).has("contract-check");
  } catch {
    return false;
  }
}

export function HeroContractAssert({
  scenes,
  gapMs,
}: {
  scenes: PhraseTimings[];
  gapMs: number;
}) {
  const [violations, setViolations] = useState<ContractViolation[]>([]);
  const [active, setActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!shouldRun()) return;
    setActive(true);
    const v = validateHeroContract(scenes, gapMs);
    setViolations(v);
    window.__heroContractViolations = v;
    if (v.length > 0) {
      // eslint-disable-next-line no-console
      console.error(
        `[hero-contract] ${v.length} violation${v.length === 1 ? "" : "s"} ` +
          `(spec: ${HERO_PHRASE_CONTRACT.fadeInMs}/≥${HERO_PHRASE_CONTRACT.holdMinMs}/` +
          `${HERO_PHRASE_CONTRACT.fadeOutMs}ms · gap ${HERO_PHRASE_CONTRACT.gapMinMs}–${HERO_PHRASE_CONTRACT.gapMaxMs}ms)`,
      );
      // eslint-disable-next-line no-console
      console.table(v);
    } else {
      // eslint-disable-next-line no-console
      console.info("[hero-contract] PASS — all phrases within contract");
    }
  }, [scenes, gapMs]);

  if (!active || dismissed || violations.length === 0) return null;

  return (
    <div
      role="alert"
      data-hero-contract-violation="true"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 9999,
        maxHeight: "40vh",
        overflow: "auto",
        background: "rgba(28,12,8,0.96)",
        color: "var(--ivory)",
        border: "1px solid #E58A6B",
        borderLeft: "4px solid #E58A6B",
        borderRadius: 6,
        padding: "10px 12px",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11.5,
        lineHeight: 1.45,
        boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
        <strong style={{ color: "#E58A6B", letterSpacing: "0.08em" }}>
          HERO CONTRACT · {violations.length} VIOLATION{violations.length === 1 ? "" : "S"}
        </strong>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss hero contract banner"
          style={{
            background: "transparent",
            color: "rgba(250,248,243,0.7)",
            border: "1px solid rgba(250,248,243,0.3)",
            borderRadius: 3,
            fontSize: 10,
            letterSpacing: "0.08em",
            padding: "1px 6px",
            cursor: "pointer",
          }}
        >
          DISMISS
        </button>
      </div>
      <div style={{ opacity: 0.75, marginBottom: 6 }}>
        spec: enter {HERO_PHRASE_CONTRACT.fadeInMs}ms · hold ≥{HERO_PHRASE_CONTRACT.holdMinMs}ms ·
        exit {HERO_PHRASE_CONTRACT.fadeOutMs}ms · gap {HERO_PHRASE_CONTRACT.gapMinMs}–{HERO_PHRASE_CONTRACT.gapMaxMs}ms
        (±{HERO_PHRASE_CONTRACT.toleranceMs}ms)
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", opacity: 0.7 }}>
            <th style={{ padding: "2px 6px" }}>phrase</th>
            <th style={{ padding: "2px 6px" }}>field</th>
            <th style={{ padding: "2px 6px" }}>actual</th>
            <th style={{ padding: "2px 6px" }}>expected</th>
          </tr>
        </thead>
        <tbody>
          {violations.map((v, i) => (
            <tr key={i} style={{ borderTop: "1px solid rgba(250,248,243,0.1)" }}>
              <td style={{ padding: "2px 6px" }}>{v.phraseIndex < 0 ? "—" : v.phraseIndex}</td>
              <td style={{ padding: "2px 6px" }}>{v.field}</td>
              <td style={{ padding: "2px 6px", color: "#E58A6B" }}>{v.actual}ms</td>
              <td style={{ padding: "2px 6px" }}>{v.expected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
