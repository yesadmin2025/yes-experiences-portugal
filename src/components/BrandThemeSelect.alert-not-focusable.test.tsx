/**
 * Regression test: the error panel is descriptive only.
 *
 * Contract this test locks in (so a future contributor cannot quietly
 * add `tabIndex` or `alertRef.current?.focus()` to the alert):
 *
 *   1. While the value is invalid, the role="alert" panel:
 *        - has no `tabIndex` attribute
 *        - has `tabIndex === -1` per the DOM (the default for non-
 *          interactive elements; i.e. it is NOT in the tab order)
 *        - has no interactive descendants (no buttons, links, inputs)
 *        - never receives focus on mount
 *   2. The <select> holds focus across the entire invalid → valid
 *        correction:
 *        - on mount with an invalid value (after we move focus there)
 *        - while the alert is being unmounted
 *        - after the value becomes valid (alert gone, aria-* cleared)
 *
 * If any of those flip, this single test fails with a precise message,
 * pointing the contributor at the `role="alert"` + `aria-describedby`
 * pattern instead of focus management.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { useState } from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
  within,
} from "@testing-library/react";
import { BrandThemeSelect } from "./BrandThemeSelect";
import type { BrandLogoTheme } from "@/lib/brand-tokens";

afterEach(() => {
  cleanup();
});

function ControlledHarness({ initialValue }: { initialValue: unknown }) {
  const [value, setValue] = useState<unknown>(initialValue);
  return (
    <BrandThemeSelect
      value={value}
      onChange={(next: BrandLogoTheme) => setValue(next)}
    />
  );
}

describe("BrandThemeSelect — error panel is never focusable (regression)", () => {
  // The runtime guard logs to console.error on the invalid render.
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("alert is non-tabbable, never focused, and the <select> keeps focus through invalid → valid correction", () => {
    render(<ControlledHarness initialValue="emerald-on-mauve" />);

    const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    const alert = screen.getByRole("alert");

    // ----- (1a) Alert has no explicit tabIndex attribute -----
    expect(alert).not.toHaveAttribute("tabindex");
    // Default tabIndex for a <div> with no explicit attribute is -1.
    expect(alert.tabIndex).toBe(-1);

    // ----- (1b) Alert contains no interactive controls -----
    // If a future change adds a "Dismiss" button or a docs link inside
    // the alert, this assertion will fail and force the contributor to
    // either remove it or update this contract intentionally.
    expect(within(alert).queryAllByRole("button")).toHaveLength(0);
    expect(within(alert).queryAllByRole("link")).toHaveLength(0);
    expect(within(alert).queryAllByRole("textbox")).toHaveLength(0);
    expect(within(alert).queryAllByRole("combobox")).toHaveLength(0);

    // ----- (1c) Alert did not steal focus on mount -----
    expect(alert).not.toHaveFocus();
    expect(document.activeElement).not.toBe(alert);

    // ----- (2a) Move keyboard focus to the <select> -----
    act(() => {
      select.focus();
    });
    const pinnedSelect = select; // pin to detect any re-mount
    expect(document.activeElement).toBe(pinnedSelect);
    expect(pinnedSelect).toHaveAttribute("aria-invalid", "true");
    expect(pinnedSelect.getAttribute("aria-describedby")).toBe(alert.id);

    // ----- (2b) Correct the value via the keyboard commit path -----
    fireEvent.keyDown(pinnedSelect, { key: "ArrowDown" });
    fireEvent.change(pinnedSelect, { target: { value: "teal-on-ivory" } });

    // ----- (2c) Same DOM node still focused after the alert unmounts -----
    expect(document.activeElement).toBe(pinnedSelect);
    expect(pinnedSelect.isConnected).toBe(true);
    expect(pinnedSelect).not.toHaveAttribute("aria-invalid");
    expect(pinnedSelect).not.toHaveAttribute("aria-describedby");

    // ----- (2d) Alert is gone, and focus did NOT fall back to <body> -----
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(document.activeElement).not.toBe(document.body);
    expect(alert.isConnected).toBe(false); // the original alert node was removed
  });
});
