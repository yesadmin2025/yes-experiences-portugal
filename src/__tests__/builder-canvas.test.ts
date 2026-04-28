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
});
