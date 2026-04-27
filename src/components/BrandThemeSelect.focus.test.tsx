/**
 * Focus-retention tests for <BrandThemeSelect>.
 *
 * Contract under test: while a keyboard user corrects an invalid theme,
 * focus must never leave the <select>. Specifically:
 *
 *   - Focus survives the initial invalid render (mount with bad value
 *     and then focus → still focused).
 *   - Focus survives the same-tick transition where `aria-invalid` /
 *     `aria-describedby` are removed and the role=alert panel unmounts
 *     (the alert disappearing must not cause React to re-key the
 *     select, which would blur it).
 *   - Focus survives valid → invalid → valid round-trips (e.g. user
 *     undoes their fix, then redoes it).
 *   - Focus survives parent re-renders that change unrelated props
 *     (className, label) while the value stays valid.
 *
 * `document.activeElement` is checked at every step — `toHaveFocus()`
 * alone can pass if the element is *re-mounted* with focus restored,
 * which would still be a perceptible focus loss in a real browser.
 * We pin a stable reference to the original DOM node and assert it is
 * still the active element after each interaction.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { BrandThemeSelect } from "./BrandThemeSelect";
import type { BrandLogoTheme } from "@/lib/brand-tokens";

afterEach(() => {
  cleanup();
});

function ControlledHarness({
  initialValue,
  label,
  className,
}: {
  initialValue: unknown;
  label?: string;
  className?: string;
}) {
  const [value, setValue] = useState<unknown>(initialValue);
  // Expose a way for the test to push arbitrary values (including
  // invalid ones) without going through onChange.
  (
    globalThis as unknown as { __setBrandThemeForTest?: (v: unknown) => void }
  ).__setBrandThemeForTest = setValue;
  return (
    <BrandThemeSelect
      value={value}
      onChange={(next: BrandLogoTheme) => setValue(next)}
      label={label}
      className={className}
    />
  );
}

function pushTheme(value: unknown) {
  const setter = (globalThis as unknown as { __setBrandThemeForTest?: (v: unknown) => void })
    .__setBrandThemeForTest;
  if (!setter) throw new Error("Harness setter not registered");
  act(() => setter(value));
}

describe("BrandThemeSelect — focus retention during invalid → valid correction", () => {
  // The runtime guard logs to console.error during invalid renders.
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("focus stays on the same select node when the user picks a valid theme via keyboard", () => {
    render(<ControlledHarness initialValue="emerald-on-mauve" />);

    const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    act(() => {
      select.focus();
    });
    expect(document.activeElement).toBe(select);
    expect(select).toHaveAttribute("aria-invalid", "true");

    // Pin the node reference so we can detect any re-mount.
    const pinnedNode = select;

    fireEvent.keyDown(select, { key: "ArrowDown" });
    fireEvent.change(select, { target: { value: "gold-on-charcoal" } });

    // Same DOM node — not a re-mount with focus "restored".
    expect(document.activeElement).toBe(pinnedNode);
    expect(pinnedNode.isConnected).toBe(true);
    expect(pinnedNode).not.toHaveAttribute("aria-invalid");
    expect(pinnedNode).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("focus stays on the same select node when the value is corrected via an external prop update", () => {
    // Simulates a programmatic correction (e.g. a route navigate that
    // rewrites ?theme=) while the user already has the field focused.
    render(<ControlledHarness initialValue="emerald-on-mauve" />);

    const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    act(() => {
      select.focus();
    });
    const pinnedNode = select;
    expect(document.activeElement).toBe(pinnedNode);

    pushTheme("teal-on-ivory");

    expect(document.activeElement).toBe(pinnedNode);
    expect(pinnedNode.isConnected).toBe(true);
    expect(pinnedNode).not.toHaveAttribute("aria-invalid");
    expect(pinnedNode).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("focus survives a valid → invalid → valid round-trip without ever blurring", () => {
    render(<ControlledHarness initialValue="teal-on-ivory" />);

    const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    act(() => {
      select.focus();
    });
    const pinnedNode = select;
    expect(document.activeElement).toBe(pinnedNode);

    // 1. valid → invalid: alert mounts, aria flips on
    pushTheme("emerald-on-mauve");
    expect(document.activeElement).toBe(pinnedNode);
    expect(pinnedNode).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // 2. invalid → valid: alert unmounts, aria flips off
    pushTheme("gold-on-charcoal");
    expect(document.activeElement).toBe(pinnedNode);
    expect(pinnedNode).not.toHaveAttribute("aria-invalid");
    expect(pinnedNode).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // 3. valid → another valid: nothing should disturb focus
    pushTheme("teal-on-ivory");
    expect(document.activeElement).toBe(pinnedNode);
    expect(pinnedNode.isConnected).toBe(true);
  });

  it("focus stays on the select when an unrelated prop (className, label) changes during correction", () => {
    const { rerender } = render(
      <ControlledHarness initialValue="emerald-on-mauve" label="Brand theme" className="initial" />,
    );

    const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    act(() => {
      select.focus();
    });
    const pinnedNode = select;
    expect(document.activeElement).toBe(pinnedNode);

    // Re-render with new className AND a corrected value at the same
    // time. If the component recreated the <select> on prop change,
    // focus would be lost.
    rerender(
      <ControlledHarness
        initialValue="emerald-on-mauve" // ignored — useState already initialized
        label="Brand theme"
        className="changed"
      />,
    );
    pushTheme("teal-on-ivory");

    expect(document.activeElement).toBe(pinnedNode);
    expect(pinnedNode.isConnected).toBe(true);
    expect(pinnedNode).not.toHaveAttribute("aria-invalid");
  });

  it("focus is retained even when the alert had been the aria-describedby target (no focus delegation to the removed node)", () => {
    // Regression guard: if a future change tried to focus the alert on
    // mount (e.g. role="alertdialog" or autoFocus), unmounting it
    // during the fix would dump focus to <body>. This test asserts the
    // alert is purely descriptive and never grabs focus.
    render(<ControlledHarness initialValue="emerald-on-mauve" />);

    const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    act(() => {
      select.focus();
    });
    expect(document.activeElement).toBe(select);

    const alert = screen.getByRole("alert");
    expect(document.activeElement).toBe(select); // alert mount didn't steal focus
    expect(alert).not.toHaveFocus();

    pushTheme("teal-on-ivory");

    expect(document.activeElement).toBe(select);
    expect(document.activeElement).not.toBe(document.body);
  });
});
