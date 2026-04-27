/**
 * Accessibility tests for <BrandThemeSelect>.
 *
 * Covers:
 *   1. The visible label is programmatically associated with the
 *      <select> (works for screen readers and `getByLabelText`).
 *   2. Keyboard navigation: the select is in the tab order, focusable,
 *      and changing the value via keyboard fires onChange with a
 *      typed BrandLogoTheme.
 *   3. When `value` is invalid, the dev-only error panel is announced
 *      via ARIA: it has role="alert", the <select> sets
 *      aria-invalid="true", and aria-describedby points at the panel's
 *      id so assistive tech reads the explanation alongside the field.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import { BrandThemeSelect } from "./BrandThemeSelect";

afterEach(() => {
  cleanup();
});

/* ------------------------------------------------------------------ */
/* 1. Accessible labelling                                            */
/* ------------------------------------------------------------------ */
describe("BrandThemeSelect — accessible labels", () => {
  it("associates the default visible label with the <select> via htmlFor/id", () => {
    render(
      <BrandThemeSelect value="teal-on-ivory" onChange={vi.fn()} />,
    );

    // getByLabelText only succeeds when label.htmlFor === select.id.
    const select = screen.getByLabelText("Brand theme");
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveAccessibleName("Brand theme");
  });

  it("respects a custom `label` prop and keeps the association", () => {
    render(
      <BrandThemeSelect
        value="teal-on-ivory"
        onChange={vi.fn()}
        label="Pick a brand variant"
      />,
    );

    const select = screen.getByLabelText("Pick a brand variant");
    expect(select).toHaveAccessibleName("Pick a brand variant");
  });

  it("each <option> carries its theme key as accessible text", () => {
    render(
      <BrandThemeSelect value="teal-on-ivory" onChange={vi.fn()} />,
    );

    const select = screen.getByLabelText("Brand theme");
    const options = within(select).getAllByRole("option") as HTMLOptionElement[];
    const labels = options.map((o) => o.textContent);
    expect(labels).toContain("teal-on-ivory");
    expect(labels).toContain("gold-on-charcoal");
  });
});

/* ------------------------------------------------------------------ */
/* 2. Keyboard navigation                                             */
/* ------------------------------------------------------------------ */
describe("BrandThemeSelect — keyboard navigation", () => {
  it("is reachable by Tab (no negative tabindex, not disabled)", () => {
    render(
      <BrandThemeSelect value="teal-on-ivory" onChange={vi.fn()} />,
    );

    const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    // Native <select> defaults to tabIndex 0; we must not have opted out.
    expect(select.tabIndex).toBe(0);
    expect(select).not.toBeDisabled();

    // Programmatic focus works (jsdom does not simulate the OS Tab
    // sequence, but tabIndex + non-disabled is the contract that lets
    // the browser include this in the focus order).
    select.focus();
    expect(select).toHaveFocus();
  });

  it("emits a typed BrandLogoTheme onChange when the value is changed via keyboard", () => {
    const onChange = vi.fn();
    render(
      <BrandThemeSelect value="teal-on-ivory" onChange={onChange} />,
    );

    const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    select.focus();

    // Native <select> on most platforms commits a new value on
    // ArrowDown/Up (and via type-ahead). jsdom doesn't synthesize that
    // selection model, but `change` is the DOM event the browser
    // ultimately dispatches once the user commits a keyboard choice —
    // assert the React handler agrees with that contract.
    fireEvent.change(select, { target: { value: "gold-on-charcoal" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("gold-on-charcoal");
  });

  it("type-ahead keystrokes do not throw and leave focus on the select", () => {
    render(
      <BrandThemeSelect value="teal-on-ivory" onChange={vi.fn()} />,
    );
    const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    select.focus();

    // Simulate the keydown the browser uses for type-ahead (`g` jumps
    // to "gold-..."). We just need to make sure no handler swallows
    // focus or throws.
    fireEvent.keyDown(select, { key: "g" });
    fireEvent.keyDown(select, { key: "ArrowDown" });
    fireEvent.keyDown(select, { key: "Enter" });

    expect(select).toHaveFocus();
  });
});

/* ------------------------------------------------------------------ */
/* 3. ARIA error announcement when ?theme is invalid                  */
/* ------------------------------------------------------------------ */
describe("BrandThemeSelect — ARIA error announcement (invalid theme)", () => {
  // Silence the runtime guard's console.error for these dev-mode cases.
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("renders the error panel with role='alert' so AT announces it", () => {
    render(
      <BrandThemeSelect value="emerald-on-mauve" onChange={vi.fn()} />,
    );

    // role="alert" implies aria-live="assertive" + aria-atomic="true"
    // — screen readers announce the contents on insertion without
    // requiring focus.
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute("data-testid", "brand-theme-select-error");
    expect(alert).toHaveTextContent(/Unsupported brand theme/i);
    expect(alert).toHaveTextContent("emerald-on-mauve");
  });

  it("marks the <select> as aria-invalid and points aria-describedby at the alert", () => {
    render(
      <BrandThemeSelect value="emerald-on-mauve" onChange={vi.fn()} />,
    );

    const select = screen.getByLabelText("Brand theme");
    expect(select).toHaveAttribute("aria-invalid", "true");

    const describedBy = select.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();

    // The id referenced by aria-describedby must resolve to the alert
    // node — otherwise screen readers would announce nothing.
    const describedNode = document.getElementById(describedBy!);
    expect(describedNode).not.toBeNull();
    expect(describedNode).toHaveAttribute("role", "alert");
    expect(describedNode).toBe(screen.getByTestId("brand-theme-select-error"));
  });

  it("clears aria-invalid and aria-describedby when the value is valid again", () => {
    const { rerender } = render(
      <BrandThemeSelect value="emerald-on-mauve" onChange={vi.fn()} />,
    );
    let select = screen.getByLabelText("Brand theme");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAttribute("aria-describedby");

    rerender(
      <BrandThemeSelect value="teal-on-ivory" onChange={vi.fn()} />,
    );
    select = screen.getByLabelText("Brand theme");
    expect(select).not.toHaveAttribute("aria-invalid");
    expect(select).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("the alert remains keyboard-discoverable: focusing the select exposes the description via aria-describedby", () => {
    render(
      <BrandThemeSelect value="emerald-on-mauve" onChange={vi.fn()} />,
    );
    const select = screen.getByLabelText("Brand theme") as HTMLSelectElement;
    select.focus();
    expect(select).toHaveFocus();

    // Sanity: the chain label → select → aria-describedby → alert is
    // intact, so a screen reader user tabbing into the field hears
    // both the label and the error explanation.
    expect(select).toHaveAccessibleName("Brand theme");
    const describedBy = select.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy)).toHaveTextContent(
      /Unsupported brand theme/i,
    );
  });
});
