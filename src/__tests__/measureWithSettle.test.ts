/**
 * Verifies measureWithSettle() mounts, settles, measures, and cleans up.
 */
import React from "react";
import { describe, it, expect } from "vitest";
import { measureWithSettle } from "./helpers/measureWithSettle";

describe("measureWithSettle", () => {
  it("mounts a component and returns a measured value", async () => {
    const result = await measureWithSettle(
      React.createElement(
        "div",
        {
          style: {
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "-0.012em",
          },
          "data-testid": "target",
        },
        "Hello",
      ),
      (root) => {
        const el = root.querySelector<HTMLElement>('[data-testid="target"]')!;
        const cs = getComputedStyle(el);
        return {
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          letterSpacing: cs.letterSpacing,
          text: el.textContent,
        };
      },
    );

    expect(result.fontSize).toBe("24px");
    expect(result.fontWeight).toBe("600");
    expect(result.letterSpacing).toBe("-0.012em");
    expect(result.text).toBe("Hello");
  });

  it("respects the viewport width option (mobile)", async () => {
    const width = await measureWithSettle(
      React.createElement("span", null, "x"),
      () => window.innerWidth,
      { width: 393 },
    );
    expect(width).toBe(393);
  });

  it("unmounts and removes its container after measurement", async () => {
    const before = document.body.children.length;
    await measureWithSettle(
      React.createElement("div", null, "ephemeral"),
      (root) => root.textContent,
    );
    expect(document.body.children.length).toBe(before);
  });

  it("cleans up even when the measure callback throws", async () => {
    const before = document.body.children.length;
    await expect(
      measureWithSettle(React.createElement("div", null, "x"), () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(document.body.children.length).toBe(before);
  });
});
