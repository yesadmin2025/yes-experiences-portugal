/**
 * Accessibility-attribute snapshots for <BrandThemeSelect>.
 *
 * Why focused snapshots (not full DOM):
 *   A full innerHTML snapshot would break on any class / copy tweak,
 *   so reviewers learn to rubber-stamp updates and real a11y
 *   regressions slip through. These snapshots capture ONLY the
 *   ARIA + id wiring contract — label↔select, select.aria-invalid,
 *   select.aria-describedby↔alert.id, alert role — so any drift in
 *   that wiring (the actual regression risk) shows up immediately,
 *   while visual / copy changes leave the snapshots untouched.
 *
 * One snapshot per state (valid + invalid) keeps reviews trivial.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BrandThemeSelect } from "./BrandThemeSelect";

afterEach(() => {
  cleanup();
});

/**
 * Build a stable, id-agnostic projection of the a11y wiring around the
 * select. `useId` produces non-deterministic ids across React versions,
 * so we replace any concrete id with a token that asserts the *link*
 * (describedby → alert.id) rather than the literal value.
 */
function captureA11yWiring() {
  const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
  const label = document.querySelector(
    `label[for="${select.id}"]`,
  ) as HTMLLabelElement | null;
  const describedById = select.getAttribute("aria-describedby");
  const describedByNode = describedById
    ? document.getElementById(describedById)
    : null;

  const linkToken = (matched: boolean) =>
    matched ? "<linked-to-alert>" : "<unlinked>";

  return {
    label: {
      tag: label?.tagName ?? null,
      htmlForLinksToSelect: label?.htmlFor === select.id,
      text: label?.textContent ?? null,
    },
    select: {
      tag: select.tagName,
      tabIndex: select.tabIndex,
      disabled: select.disabled,
      role: select.getAttribute("role"), // null = native select role
      ariaInvalid: select.getAttribute("aria-invalid"),
      ariaDescribedBy:
        describedById === null
          ? null
          : linkToken(
              describedByNode !== null &&
                describedByNode.getAttribute("role") === "alert",
            ),
      accessibleName: label?.textContent ?? null,
    },
    alert:
      describedByNode === null
        ? null
        : {
            role: describedByNode.getAttribute("role"),
            isLiveRegion:
              describedByNode.getAttribute("role") === "alert" ||
              describedByNode.getAttribute("aria-live") !== null,
            mentionsBrandLock: /\[brand-lock\]/.test(
              describedByNode.textContent ?? "",
            ),
          },
  };
}

describe("BrandThemeSelect — a11y attribute snapshots", () => {
  it("valid state: no aria-invalid, no aria-describedby, no alert", () => {
    render(
      <BrandThemeSelect value="teal-on-ivory" onChange={vi.fn()} />,
    );

    expect(captureA11yWiring()).toMatchInlineSnapshot(`
      {
        "alert": null,
        "label": {
          "htmlForLinksToSelect": true,
          "tag": "LABEL",
          "text": "Brand theme",
        },
        "select": {
          "accessibleName": "Brand theme",
          "ariaDescribedBy": null,
          "ariaInvalid": null,
          "disabled": false,
          "role": null,
          "tabIndex": 0,
        },
      }
    `);
  });

  describe("invalid state", () => {
    // Silence the runtime guard's console.error in dev mode.
    let errorSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
    });
    afterEach(() => {
      errorSpy.mockRestore();
    });

    it("invalid state: aria-invalid=true and aria-describedby links to a role=alert", () => {
      render(
        <BrandThemeSelect value="emerald-on-mauve" onChange={vi.fn()} />,
      );

      expect(captureA11yWiring()).toMatchInlineSnapshot(`
        {
          "alert": {
            "isLiveRegion": true,
            "mentionsBrandLock": true,
            "role": "alert",
          },
          "label": {
            "htmlForLinksToSelect": true,
            "tag": "LABEL",
            "text": "Brand theme",
          },
          "select": {
            "accessibleName": "Brand theme",
            "ariaDescribedBy": "<linked-to-alert>",
            "ariaInvalid": "true",
            "disabled": false,
            "role": null,
            "tabIndex": 0,
          },
        }
      `);
    });
  });
});
