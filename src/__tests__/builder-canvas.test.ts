/**
 * Builder canvas typography & spacing contract
 * ─────────────────────────────────────────────────────────────────
 * Mounts the two primitives that define every step of the builder
 * canvas — StepHeader (title + sub) and MomentCard (image-led tile)
 * — through measureWithSettle() and verifies the typography and
 * spacing landmarks are byte-identical across the three states a
 * user can drive them into while customizing an experience:
 *
 *   1. fresh / unselected — initial state when a step opens
 *   2. selected           — after the user picks the option
 *   3. selected + sub     — after the user opens detail with a
 *                            secondary line
 *
 * The contract: the className strings and the inline style props
 * (computed via getComputedStyle) on every landmark element MUST
 * be identical across all three states. Only the selected ring,
 * the check icon and the optional <p data-builder-landmark="moment-line">
 * are allowed to change — and those are exercised explicitly.
 *
 * Why this matters:
 *   - jsdom does NOT run the Tailwind/PostCSS pipeline, so we can't
 *     assert resolved font-size from `text-[26px]` directly. We CAN
 *     assert the className contract that drives those styles, and
 *     we use measureWithSettle() to confirm layout has flushed
 *     before reading inline styles + bounding boxes.
 *   - This catches regressions like "spacing collapses when a card
 *     becomes selected", "title font shrinks when a sub is added",
 *     or "the gap between header and first card changes mid-flow".
 *
 * Run with: bunx vitest run src/__tests__/builder-canvas.test.ts
 * ──────────────────────────────────────────────────────────────── */

import React from "react";
import { describe, it, expect } from "vitest";
import { measureWithSettle } from "./helpers/measureWithSettle";
import { StepHeader, MomentCard } from "@/routes/builder";

const SAMPLE_IMG =
  "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&q=80";

type LandmarkSnapshot = {
  selector: string;
  className: string;
  inline: {
    fontSize: string;
    lineHeight: string;
    fontStyle: string;
    color: string;
    marginTop: string;
    marginBottom: string;
    paddingTop: string;
    paddingBottom: string;
  };
};

function snapshotLandmarks(root: HTMLElement): LandmarkSnapshot[] {
  const els = root.querySelectorAll<HTMLElement>("[data-builder-landmark]");
  const out: LandmarkSnapshot[] = [];
  els.forEach((el) => {
    const cs = getComputedStyle(el);
    out.push({
      selector: el.getAttribute("data-builder-landmark") ?? "?",
      className: el.className.split(/\s+/).filter(Boolean).sort().join(" "),
      inline: {
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        fontStyle: cs.fontStyle,
        color: cs.color,
        marginTop: cs.marginTop,
        marginBottom: cs.marginBottom,
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
      },
    });
  });
  return out;
}

describe("Builder canvas — typography & spacing landmarks", () => {
  it("StepHeader landmarks are stable when a sub-line is added", async () => {
    const noSub = await measureWithSettle(
      React.createElement(StepHeader, { title: "Choose your region" }),
      snapshotLandmarks,
      { width: 393 },
    );
    const withSub = await measureWithSettle(
      React.createElement(StepHeader, {
        title: "Choose your region",
        sub: "Where do you want to wake up tomorrow?",
      }),
      snapshotLandmarks,
      { width: 393 },
    );

    // Title landmark must be byte-identical regardless of sub presence.
    const noSubTitle = noSub.find((l) => l.selector === "step-title");
    const withSubTitle = withSub.find((l) => l.selector === "step-title");
    expect(noSubTitle).toEqual(withSubTitle);

    // Outer header landmark must also be byte-identical (no spacing
    // collapse when sub is absent).
    const noSubHeader = noSub.find((l) => l.selector === "step-header");
    const withSubHeader = withSub.find((l) => l.selector === "step-header");
    expect(noSubHeader).toEqual(withSubHeader);

    // Sub appears only in the with-sub variant.
    expect(noSub.find((l) => l.selector === "step-sub")).toBeUndefined();
    expect(withSub.find((l) => l.selector === "step-sub")).toBeDefined();

    // Lock the full ordered shape via snapshot.
    expect({ noSub, withSub }).toMatchSnapshot();
  });

  it("MomentCard landmarks are stable across selected / line variants", async () => {
    const baseProps = {
      image: SAMPLE_IMG,
      name: "Quinta do Crasto",
      onClick: () => {},
    };

    const states = {
      unselected: await measureWithSettle(
        React.createElement(MomentCard, { ...baseProps, selected: false }),
        snapshotLandmarks,
        { width: 393 },
      ),
      selected: await measureWithSettle(
        React.createElement(MomentCard, { ...baseProps, selected: true }),
        snapshotLandmarks,
        { width: 393 },
      ),
      selectedWithLine: await measureWithSettle(
        React.createElement(MomentCard, {
          ...baseProps,
          selected: true,
          line: "Vintage cellars overlooking the Douro",
        }),
        snapshotLandmarks,
        { width: 393 },
      ),
    };

    // The moment-name landmark MUST keep identical typography across
    // every state — selecting a card or adding a sub-line cannot
    // shift the headline metrics.
    const names = (Object.keys(states) as Array<keyof typeof states>).map(
      (k) => states[k].find((l) => l.selector === "moment-name"),
    );
    expect(names[0]).toEqual(names[1]);
    expect(names[1]).toEqual(names[2]);

    // The card landmark itself MUST keep its typography classes
    // identical across selected/unselected; only the ring changes.
    const cardClasses = (Object.keys(states) as Array<keyof typeof states>).map(
      (k) =>
        states[k]
          .find((l) => l.selector === "moment-card")!
          .className.split(" ")
          .filter(
            (c) =>
              !c.startsWith("ring-") &&
              !c.startsWith("hover:ring-") &&
              c !== "ring-2" &&
              c !== "ring-1",
          )
          .sort()
          .join(" "),
    );
    expect(cardClasses[0]).toBe(cardClasses[1]);
    expect(cardClasses[1]).toBe(cardClasses[2]);

    // Line landmark only appears when a line is provided.
    expect(
      states.unselected.find((l) => l.selector === "moment-line"),
    ).toBeUndefined();
    expect(
      states.selected.find((l) => l.selector === "moment-line"),
    ).toBeUndefined();
    expect(
      states.selectedWithLine.find((l) => l.selector === "moment-line"),
    ).toBeDefined();

    expect(states).toMatchSnapshot();
  });

  it("Header → first MomentCard vertical rhythm is preserved (mobile)", async () => {
    // Mount header + card together to verify the visual rhythm
    // between them isn't disturbed by a customization change.
    type Geom = { headerBottom: number; cardTop: number; gap: number };

    const geom = (selected: boolean) =>
      measureWithSettle<Geom>(
        React.createElement(
          "div",
          null,
          React.createElement(StepHeader, {
            title: "Pick your style",
            sub: "We'll match the pace to your mood.",
          }),
          React.createElement(
            "div",
            { style: { marginTop: "20px" } },
            React.createElement(MomentCard, {
              image: SAMPLE_IMG,
              name: "Slow & contemplative",
              selected,
              onClick: () => {},
            }),
          ),
        ),
        (root) => {
          const header = root.querySelector<HTMLElement>(
            '[data-builder-landmark="step-header"]',
          )!;
          const card = root.querySelector<HTMLElement>(
            '[data-builder-landmark="moment-card"]',
          )!;
          const h = header.getBoundingClientRect();
          const c = card.getBoundingClientRect();
          return {
            headerBottom: Math.round(h.bottom),
            cardTop: Math.round(c.top),
            gap: Math.round(c.top - h.bottom),
          };
        },
        { width: 393 },
      );

    const unselected = await geom(false);
    const selected = await geom(true);

    // The vertical gap between header and card must NOT change when
    // the card flips to selected — that's the regression we're
    // guarding against.
    expect(selected.gap).toBe(unselected.gap);
  });

  it("Two sequential customizations leave header + first card landmarks unchanged", async () => {
    /**
     * Simulates a real user flow on a single step:
     *   1. Initial render — Option A is the first card, nothing selected.
     *   2. User picks Option B (different experience) — selection moves
     *      to the second card, the first card flips back to unselected.
     *   3. User opens detail and a `line` (sub-line) is added to the
     *      currently-selected card.
     *
     * Across all three render passes, the StepHeader landmarks AND the
     * first MomentCard's typography landmarks (className contract +
     * computed inline styles for moment-card / moment-name) MUST remain
     * byte-identical. The header → first-card vertical gap MUST also
     * be preserved — customizing options cannot reflow the canvas.
     */
    type Pass = {
      header: LandmarkSnapshot[];
      firstCard: LandmarkSnapshot[];
      gap: number;
    };

    const OPTIONS: Array<{ name: string; image: string }> = [
      { name: "Quinta do Crasto", image: SAMPLE_IMG },
      { name: "Niepoort cellars", image: SAMPLE_IMG },
    ];

    const renderStep = (
      selectedIndex: number | null,
      lineForSelected?: string,
    ) =>
      measureWithSettle<Pass>(
        React.createElement(
          "div",
          null,
          React.createElement(StepHeader, {
            title: "Pick a winery",
            sub: "We'll tailor the visit around your pace.",
          }),
          React.createElement(
            "div",
            { style: { marginTop: "20px" } },
            ...OPTIONS.map((opt, i) =>
              React.createElement(MomentCard, {
                key: opt.name,
                image: opt.image,
                name: opt.name,
                selected: selectedIndex === i,
                line:
                  selectedIndex === i && lineForSelected
                    ? lineForSelected
                    : undefined,
                onClick: () => {},
              }),
            ),
          ),
        ),
        (root) => {
          const headerEl = root.querySelector<HTMLElement>(
            '[data-builder-landmark="step-header"]',
          )!;
          const firstCardEl = root.querySelectorAll<HTMLElement>(
            '[data-builder-landmark="moment-card"]',
          )[0]!;

          // Snapshot landmarks scoped to header + first card only.
          const header = snapshotLandmarks(headerEl.parentElement as HTMLElement)
            .filter((l) => l.selector.startsWith("step-"));
          const firstCard = snapshotLandmarks(
            firstCardEl.parentElement as HTMLElement,
          )
            // Only the first card; ignore landmarks from sibling cards.
            .filter((_, idx, arr) => {
              // landmarks are emitted in DOM order; the first
              // moment-card and its descendant moment-name belong to
              // index 0. We keep landmarks until we hit a second
              // moment-card.
              const seenSecondCard = arr
                .slice(0, idx)
                .filter((l) => l.selector === "moment-card").length;
              return seenSecondCard === 0;
            });

          const h = headerEl.getBoundingClientRect();
          const c = firstCardEl.getBoundingClientRect();
          return {
            header,
            firstCard,
            gap: Math.round(c.top - h.bottom),
          };
        },
        { width: 393 },
      );

    // Pass 1: nothing selected (first card is the "default focus").
    const initial = await renderStep(null);
    // Pass 2: user picks the SECOND option — first card returns to
    // unselected; we're verifying picking a *different* experience
    // doesn't disturb the first card's landmarks.
    const switched = await renderStep(1);
    // Pass 3: user adds a detail line on the selected (second) card.
    // The first card still has no line — its landmarks must not move.
    const withDetail = await renderStep(1, "Vintage cellars overlooking the Douro");

    // Header landmarks: byte-identical across all three passes.
    expect(switched.header).toEqual(initial.header);
    expect(withDetail.header).toEqual(initial.header);

    // First card landmarks: byte-identical across all three passes.
    expect(switched.firstCard).toEqual(initial.firstCard);
    expect(withDetail.firstCard).toEqual(initial.firstCard);

    // Vertical rhythm: header→first-card gap is invariant.
    expect(switched.gap).toBe(initial.gap);
    expect(withDetail.gap).toBe(initial.gap);
  });

  it("Back-and-forth selection (A → B → B+detail → A) preserves header + first-card landmarks", async () => {
    /**
     * Simulates a user toggling between two options:
     *   1. Pass A0 — select the FIRST card (Option A).
     *   2. Pass B  — switch selection to the SECOND card (Option B).
     *   3. Pass B' — keep B selected and add a detail line to it.
     *   4. Pass A1 — return selection to the FIRST card.
     *
     * Across all four passes:
     *   - StepHeader landmarks must remain byte-identical.
     *   - The FIRST MomentCard's typography landmarks (className contract
     *     minus selection-only ring classes, plus computed inline styles
     *     on moment-card / moment-name) must remain byte-identical.
     *   - The header → first-card vertical gap must be invariant.
     *
     * The first card flips selected → unselected → unselected → selected
     * across these passes, so we strip ring-* classes from the moment-card
     * landmark className before comparing (selection ring is the only
     * sanctioned visual diff; everything else must hold).
     */
    type Pass = {
      header: LandmarkSnapshot[];
      firstCard: LandmarkSnapshot[];
      gap: number;
    };

    const OPTIONS: Array<{ name: string; image: string }> = [
      { name: "Quinta do Crasto", image: SAMPLE_IMG },
      { name: "Niepoort cellars", image: SAMPLE_IMG },
    ];

    const renderStep = (
      selectedIndex: number | null,
      lineForSelected?: string,
    ) =>
      measureWithSettle<Pass>(
        React.createElement(
          "div",
          null,
          React.createElement(StepHeader, {
            title: "Pick a winery",
            sub: "We'll tailor the visit around your pace.",
          }),
          React.createElement(
            "div",
            { style: { marginTop: "20px" } },
            ...OPTIONS.map((opt, i) =>
              React.createElement(MomentCard, {
                key: opt.name,
                image: opt.image,
                name: opt.name,
                selected: selectedIndex === i,
                line:
                  selectedIndex === i && lineForSelected
                    ? lineForSelected
                    : undefined,
                onClick: () => {},
              }),
            ),
          ),
        ),
        (root) => {
          const headerEl = root.querySelector<HTMLElement>(
            '[data-builder-landmark="step-header"]',
          )!;
          const firstCardEl = root.querySelectorAll<HTMLElement>(
            '[data-builder-landmark="moment-card"]',
          )[0]!;

          const header = snapshotLandmarks(
            headerEl.parentElement as HTMLElement,
          ).filter((l) => l.selector.startsWith("step-"));
          const firstCard = snapshotLandmarks(
            firstCardEl.parentElement as HTMLElement,
          ).filter((_, idx, arr) => {
            const seenSecondCard = arr
              .slice(0, idx)
              .filter((l) => l.selector === "moment-card").length;
            return seenSecondCard === 0;
          });

          const h = headerEl.getBoundingClientRect();
          const c = firstCardEl.getBoundingClientRect();
          return {
            header,
            firstCard,
            gap: Math.round(c.top - h.bottom),
          };
        },
        { width: 393 },
      );

    // Strip ring-* classes from the moment-card landmark — selection
    // ring is the only allowed visual diff between selected/unselected.
    const stripRing = (pass: Pass): Pass => ({
      ...pass,
      firstCard: pass.firstCard.map((l) =>
        l.selector !== "moment-card"
          ? l
          : {
              ...l,
              className: l.className
                .split(" ")
                .filter(
                  (c) =>
                    !c.startsWith("ring-") &&
                    !c.startsWith("hover:ring-") &&
                    c !== "ring-2" &&
                    c !== "ring-1",
                )
                .sort()
                .join(" "),
            },
      ),
    });

    const a0 = stripRing(await renderStep(0)); // Option A selected
    const b = stripRing(await renderStep(1)); // Switch to Option B
    const bDetail = stripRing(
      await renderStep(1, "Vintage cellars overlooking the Douro"),
    ); // B + detail line
    const a1 = stripRing(await renderStep(0)); // Back to Option A

    // Header landmarks: byte-identical across all four passes.
    expect(b.header).toEqual(a0.header);
    expect(bDetail.header).toEqual(a0.header);
    expect(a1.header).toEqual(a0.header);

    // First card landmarks (ring-stripped): byte-identical across all
    // four passes — toggling selection elsewhere or returning to the
    // original choice cannot drift the first card's typography contract.
    expect(b.firstCard).toEqual(a0.firstCard);
    expect(bDetail.firstCard).toEqual(a0.firstCard);
    expect(a1.firstCard).toEqual(a0.firstCard);

    // Vertical rhythm: header→first-card gap is invariant across the
    // entire back-and-forth flow.
    expect(b.gap).toBe(a0.gap);
    expect(bDetail.gap).toBe(a0.gap);
    expect(a1.gap).toBe(a0.gap);

    // Returning to the original selection must produce a state
    // indistinguishable from the original (after ring-strip).
    expect(a1).toEqual(a0);
  });
});
