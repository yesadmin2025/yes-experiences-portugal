/**
 * Keyboard-interaction tests for <BrandThemeSelect>.
 *
 * Scenario: a screen-reader / keyboard user lands on /brand-qa with an
 * invalid `?theme=`, tabs to the select, picks a valid theme via the
 * keyboard, and the ARIA wiring (aria-invalid, aria-describedby, the
 * role=alert panel) clears immediately on that same render — no extra
 * focus loss, no flash of stale state.
 *
 * We use a small controlled wrapper so the value transition is a real
 * React state update driven by the component's own `onChange`, mirroring
 * how `BrandThemeSelectorPanel` behaves in the route.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { useState } from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import { BrandThemeSelect } from "./BrandThemeSelect";
import type { BrandLogoTheme } from "@/lib/brand-tokens";

afterEach(() => {
  cleanup();
});

/** Controlled wrapper: starts with whatever value the test passes in
 * and updates state on every valid `onChange`, just like the route. */
function ControlledHarness({ initialValue }: { initialValue: unknown }) {
  const [value, setValue] = useState<unknown>(initialValue);
  return (
    <BrandThemeSelect
      value={value}
      onChange={(next: BrandLogoTheme) => setValue(next)}
    />
  );
}

describe("BrandThemeSelect — keyboard transition from invalid → valid", () => {
  // The runtime guard inside <BrandThemeSelect> logs to console.error
  // during the invalid initial render. Silence + assert at the end.
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("focuses the select, picks a valid theme via keyboard, and clears aria-invalid + aria-describedby immediately", () => {
    render(<ControlledHarness initialValue="emerald-on-mauve" />);

    // ----- Initial state: invalid ?theme=, ARIA wiring is hot -----
    let select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    expect(select).toHaveAttribute("aria-invalid", "true");
    const initialDescribedBy = select.getAttribute("aria-describedby");
    expect(initialDescribedBy).toBeTruthy();
    expect(document.getElementById(initialDescribedBy!)).toHaveAttribute(
      "role",
      "alert",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/Unsupported brand theme/i);

    // ----- Move focus with the keyboard -----
    // jsdom doesn't synthesize the OS Tab sequence, but the contract is
    // that the select is in the tab order and accepts focus.
    expect(select.tabIndex).toBe(0);
    expect(select).not.toBeDisabled();
    act(() => {
      select.focus();
    });
    expect(select).toHaveFocus();

    // ----- Simulate the keyboard commit (Arrow → Enter / type-ahead) -----
    // The DOM event browsers ultimately dispatch when a keyboard user
    // commits a new <select> value is `change`. We fire that explicitly
    // so the React handler runs the same path as the production code.
    fireEvent.keyDown(select, { key: "ArrowDown" });
    fireEvent.change(select, { target: { value: "gold-on-charcoal" } });

    // ----- Post-commit state: ARIA wiring must clear in the same tick -----
    select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    expect(select.value).toBe("gold-on-charcoal");
    expect(select).not.toHaveAttribute("aria-invalid");
    expect(select).not.toHaveAttribute("aria-describedby");

    // The alert is unmounted — assistive tech will not announce stale
    // error text after the user has corrected the value.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("brand-theme-select-error"),
    ).not.toBeInTheDocument();

    // Focus stays on the select so the keyboard user is not thrown back
    // to the top of the page after the correction.
    expect(select).toHaveFocus();

    // The runtime guard logged exactly the invalid initial render and
    // nothing after the value became valid.
    expect(errorSpy).toHaveBeenCalled();
    const messages = errorSpy.mock.calls.map(
      (c: unknown[]) => String(c[0] ?? ""),
    );
    // The invalid initial value was logged.
    expect(
      messages.some((m: string) =>
        /\[brand-lock\].*received an unsupported.*emerald-on-mauve/.test(m),
      ),
    ).toBe(true);
    // The valid replacement was NOT logged as unsupported. Note: the
    // log line for the invalid render *does* mention gold-on-charcoal
    // in its "allowed values" list, so we match on the "received an
    // unsupported … gold-on-charcoal" shape, not the bare string.
    expect(
      messages.some((m: string) =>
        /received an unsupported.*gold-on-charcoal/.test(m),
      ),
    ).toBe(false);
  });

  it("repeated valid → valid keyboard changes never re-introduce aria-invalid", () => {
    render(<ControlledHarness initialValue="teal-on-ivory" />);

    const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    expect(select).not.toHaveAttribute("aria-invalid");

    act(() => {
      select.focus();
    });
    fireEvent.change(select, { target: { value: "gold-on-charcoal" } });
    expect(select).not.toHaveAttribute("aria-invalid");
    expect(select).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    fireEvent.change(select, { target: { value: "teal-on-ivory" } });
    expect(select).not.toHaveAttribute("aria-invalid");
    expect(select).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(select).toHaveFocus();

    // No brand-lock console.error should fire on a clean valid → valid path.
    expect(
      errorSpy.mock.calls.some((c: unknown[]) =>
        /\[brand-lock\]/.test(String(c[0] ?? "")),
      ),
    ).toBe(false);
  });
});
