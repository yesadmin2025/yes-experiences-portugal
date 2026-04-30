import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";

/**
 * /qa/mobile — Internal pre-publish checklist
 *
 *  - Mirrors docs/qa/mobile-regression.md, but interactive.
 *  - Progress is persisted in localStorage so a reviewer can pause and
 *    come back. A "Reset" button clears the run.
 *  - This is intentionally unlinked from the public nav. Reach it by
 *    typing /qa/mobile.
 *
 *  Keep this list in sync with docs/qa/mobile-regression.md.
 */

type Section = {
  id: string;
  title: string;
  items: string[];
};

const SECTIONS: Section[] = [
  {
    id: "states",
    title: "1 — States: hover / active / focus",
    items: [
      "Primary CTAs show visible gold focus ring with offset",
      "Secondary CTAs flip to --charcoal and shrink to 0.98 on :active",
      "Card hover lifts ≤2px, never overlapping neighbours",
      "Sticky CTA focus ring not clipped by safe-area inset",
      "WhatsApp FAB tooltip appears on focus (not hover only)",
      "Header menu trigger focus ring visible on transparent + scrolled",
      "Arrow icons only translate on hover, never disappear",
    ],
  },
  {
    id: "spacing",
    title: "2 — Spacing & alignment",
    items: [
      "No element clipped at right edge by WhatsApp FAB halo",
      "Hero eyebrow / h1 / body / CTAs share the same gutter",
      "Why YES 01..05 numbers fully readable, never under FAB",
      "Signature cards share consistent vertical rhythm",
      "Premium blocks: gold rule 16–20px above title, below image",
      "FAQ chevron and label baseline aligned, no wrap",
      "Final CTA centered, ≥44px tall, single button",
      "Trustmary frame has visible padding on all 4 sides",
    ],
  },
  {
    id: "typography",
    title: "3 — Typography & wording",
    items: [
      "No truncation of headlines on 360px width",
      "No invisible text (light grey on ivory)",
      "No text overlapping floating UI (FAB, sticky CTA)",
      "Letter-spaced labels wrap cleanly",
      "Hero animation completes ≤1.7s, no permanently invisible text",
    ],
  },
  {
    id: "motion",
    title: "4 — Motion & images",
    items: [
      "Clip-path reveal completes when block enters viewport",
      "Ken Burns drift is gentle (≤6% scale)",
      "3D tilt is desktop-only (no jitter on touch)",
      "prefers-reduced-motion disables parallax/sheen/glow/tilt",
      "Images load at correct aspect ratio, no layout shift",
    ],
  },
  {
    id: "trustmary",
    title: "5 — Trustmary widget",
    items: [
      "Widget frame visible before script loads (≥280px)",
      "Widget renders inside sand frame, no overflow on 360px",
      "Caption 'Independently collected via Trustmary' is visible",
    ],
  },
  {
    id: "smoke",
    title: "6 — Pre-publish smoke",
    items: [
      "Lighthouse mobile ≥85 perf / 95 a11y",
      "No console errors on the homepage",
      "All hero/signature/premium images load",
      "Sticky CTA + FAB respect iOS safe-area-inset-bottom",
    ],
  },
];

const STORAGE_KEY = "qa-mobile-checklist-v1";

export const Route = createFileRoute("/qa/mobile")({
  component: QaMobilePage,
  head: () => ({
    meta: [
      { title: "Mobile QA — YesExperiences (internal)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function QaMobilePage() {
  const allItems = useMemo(
    () => SECTIONS.flatMap((s) => s.items.map((label) => `${s.id}::${label}`)),
    [],
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      /* noop */
    }
  }, [checked]);

  const total = allItems.length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const toggle = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const reset = () => setChecked({});

  return (
    <SiteLayout>
      <section className="section-y bg-[color:var(--ivory)]">
        <div className="container-x max-w-3xl">
          <span className="inline-flex items-center gap-2.5 text-[10.5px] uppercase tracking-[0.32em] font-bold text-[color:var(--charcoal)]">
            <span aria-hidden="true" className="inline-block h-[5px] w-[5px] rounded-full bg-[color:var(--gold)]" />
            Internal · pre-publish
          </span>
          <h1 className="serif mt-5 text-[2.4rem] md:text-[3.4rem] leading-[1.04] tracking-[-0.016em] text-[color:var(--charcoal)] font-semibold">
            Mobile visual regression{" "}
            <span className="italic font-medium">checklist.</span>
          </h1>
          <p className="mt-5 text-[15.5px] md:text-[17px] text-[color:var(--charcoal)] leading-[1.65]">
            Run through this list at <strong>393 × 852</strong> and spot-check
            360 / 414 widths before publishing. Progress is saved on this device.
          </p>

          <div className="mt-8 rounded-[4px] border border-[color:var(--border)] bg-[color:var(--sand)]/60 p-4 md:p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[12.5px] uppercase tracking-[0.22em] font-bold text-[color:var(--charcoal)]">
                Progress
              </span>
              <span className="text-[13px] font-semibold text-[color:var(--teal)]">
                {done} / {total} · {pct}%
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-[color:var(--ivory)] rounded-full overflow-hidden border border-[color:var(--border)]">
              <div
                className="h-full bg-[color:var(--teal)] transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              type="button"
              onClick={reset}
              className="mt-4 inline-flex items-center justify-center min-h-[44px] px-5 text-[12px] uppercase tracking-[0.2em] font-semibold border border-[color:var(--border)] bg-[color:var(--ivory)] text-[color:var(--charcoal)] hover:border-[color:var(--charcoal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
            >
              Reset run
            </button>
          </div>

          <div className="mt-12 space-y-12">
            {SECTIONS.map((section) => (
              <div key={section.id}>
                <h2 className="serif text-[1.7rem] md:text-[2rem] leading-[1.15] text-[color:var(--charcoal)] font-semibold">
                  {section.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {section.items.map((label) => {
                    const key = `${section.id}::${label}`;
                    const isOn = !!checked[key];
                    return (
                      <li key={key}>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={isOn}
                            onChange={() => toggle(key)}
                            className="mt-[3px] h-5 w-5 accent-[color:var(--teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
                          />
                          <span
                            className={
                              "text-[15px] leading-[1.55] transition-colors " +
                              (isOn
                                ? "text-[color:var(--charcoal-soft)] line-through"
                                : "text-[color:var(--charcoal)]")
                            }
                          >
                            {label}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-14 text-[11px] uppercase tracking-[0.24em] text-[color:var(--charcoal-soft)]">
            Source of truth · docs/qa/mobile-regression.md
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
