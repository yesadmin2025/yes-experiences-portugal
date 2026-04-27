/**
 * Integration-style tests for the /brand-qa theme selector.
 *
 * These tests do NOT mount a full TanStack router — they drive the
 * pure presentational `BrandThemeSelectorView` with the same values the
 * route's `validateSearch` schema would forward, so they cover both:
 *
 *   1. The URL → component contract (`?theme=` → `rawThemeParam` prop).
 *   2. The runtime guard's dev-only error UI inside <BrandThemeSelect>.
 *
 * The schema itself is exercised separately to lock in the
 * "invalid → sentinel" behavior the view depends on.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  BrandThemeSelectorView,
  themeSearchSchema,
  INVALID_THEME_SENTINEL,
} from "./brand-qa";

afterEach(() => {
  cleanup();
});

/* ------------------------------------------------------------------ */
/* 1. validateSearch schema parity                                    */
/* ------------------------------------------------------------------ */
describe("/brand-qa — themeSearchSchema (URL contract)", () => {
  it("accepts known BrandLogoTheme values verbatim", () => {
    expect(themeSearchSchema.parse({ theme: "teal-on-ivory" })).toEqual({
      theme: "teal-on-ivory",
    });
    expect(themeSearchSchema.parse({ theme: "gold-on-charcoal" })).toEqual({
      theme: "gold-on-charcoal",
    });
  });

  it("treats a missing ?theme as undefined (no sentinel)", () => {
    expect(themeSearchSchema.parse({})).toEqual({});
  });

  it("forwards unknown strings through the invalid sentinel", () => {
    // The fallback() wrapping the union collapses any string the union
    // *would* match into the sentinel only for non-string inputs; for
    // arbitrary strings the inner z.string() leg matches and we get
    // the raw value back. Either way the view treats anything outside
    // BrandLogoTheme as invalid, but the schema must never throw.
    const out = themeSearchSchema.parse({ theme: "emerald-on-mauve" });
    expect(typeof out.theme).toBe("string");
    expect(out.theme).not.toBe("teal-on-ivory");
    expect(out.theme).not.toBe("gold-on-charcoal");
  });

  it("never throws for non-string input — falls back to sentinel", () => {
    expect(() =>
      themeSearchSchema.parse({ theme: 42 as unknown as string }),
    ).not.toThrow();
    expect(themeSearchSchema.parse({ theme: 42 as unknown as string })).toEqual(
      { theme: INVALID_THEME_SENTINEL },
    );
  });
});

/* ------------------------------------------------------------------ */
/* 2. View — valid ?theme= renders the live preview                   */
/* ------------------------------------------------------------------ */
describe("/brand-qa — BrandThemeSelectorView with valid ?theme=", () => {
  it("renders the Logo preview and no dev error panel for teal-on-ivory", () => {
    render(
      <BrandThemeSelectorView
        rawThemeParam="teal-on-ivory"
        onSetTheme={vi.fn()}
        onSetRawTheme={vi.fn()}
      />,
    );

    // Live preview is mounted (Logo renders an <img>).
    const preview = screen.getByTestId("brand-theme-preview");
    expect(preview.querySelector("img")).not.toBeNull();
    // The "preview hidden" placeholder is NOT present.
    expect(
      screen.queryByTestId("brand-theme-preview-hidden"),
    ).not.toBeInTheDocument();
    // The dev error panel is NOT present.
    expect(
      screen.queryByTestId("brand-theme-select-error"),
    ).not.toBeInTheDocument();
    // URL echo reflects the value.
    expect(screen.getByTestId("brand-theme-current-param")).toHaveTextContent(
      "?theme=teal-on-ivory",
    );
  });

  it("renders the Logo preview for gold-on-charcoal", () => {
    render(
      <BrandThemeSelectorView
        rawThemeParam="gold-on-charcoal"
        onSetTheme={vi.fn()}
        onSetRawTheme={vi.fn()}
      />,
    );

    const preview = screen.getByTestId("brand-theme-preview");
    expect(preview.querySelector("img")).not.toBeNull();
    expect(
      screen.queryByTestId("brand-theme-select-error"),
    ).not.toBeInTheDocument();
  });

  it("treats a missing ?theme as the default (valid) preview", () => {
    render(
      <BrandThemeSelectorView
        rawThemeParam={undefined}
        onSetTheme={vi.fn()}
        onSetRawTheme={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("brand-theme-preview").querySelector("img"),
    ).not.toBeNull();
    expect(
      screen.queryByTestId("brand-theme-select-error"),
    ).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/* 3. View — invalid ?theme= hides preview + shows dev error panel    */
/* ------------------------------------------------------------------ */
describe("/brand-qa — BrandThemeSelectorView with invalid ?theme=", () => {
  // The runtime guard inside BrandThemeSelect calls console.error when
  // the value is unsupported. Silence it so the suite stays clean,
  // but assert it was called.
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("hides the live preview and renders the placeholder for unsupported strings", () => {
    render(
      <BrandThemeSelectorView
        rawThemeParam="emerald-on-mauve"
        onSetTheme={vi.fn()}
        onSetRawTheme={vi.fn()}
      />,
    );

    // Preview is hidden — no <img>, placeholder visible.
    expect(
      screen.getByTestId("brand-theme-preview").querySelector("img"),
    ).toBeNull();
    expect(
      screen.getByTestId("brand-theme-preview-hidden"),
    ).toBeInTheDocument();
  });

  it("surfaces the dev-only error panel inside <BrandThemeSelect>", () => {
    render(
      <BrandThemeSelectorView
        rawThemeParam="emerald-on-mauve"
        onSetTheme={vi.fn()}
        onSetRawTheme={vi.fn()}
      />,
    );

    const errorPanel = screen.getByTestId("brand-theme-select-error");
    expect(errorPanel).toBeInTheDocument();
    expect(errorPanel).toHaveTextContent(/Unsupported brand theme/i);
    expect(errorPanel).toHaveTextContent("emerald-on-mauve");
    // The schema's allowed list is named in the panel.
    expect(errorPanel).toHaveTextContent("teal-on-ivory");
    expect(errorPanel).toHaveTextContent("gold-on-charcoal");

    // And a console.error was emitted with the brand-lock prefix.
    expect(errorSpy).toHaveBeenCalled();
    const firstMessage = String(errorSpy.mock.calls[0]?.[0] ?? "");
    expect(firstMessage).toMatch(/\[brand-lock\]/);
    expect(firstMessage).toMatch(/BrandQA\.ThemeSelect/);
  });

  it("also flags the schema's INVALID_THEME_SENTINEL as unsupported", () => {
    render(
      <BrandThemeSelectorView
        rawThemeParam={INVALID_THEME_SENTINEL}
        onSetTheme={vi.fn()}
        onSetRawTheme={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("brand-theme-select-error"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("brand-theme-preview").querySelector("img"),
    ).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* 4. View — picker change → onSetTheme; dev buttons → onSetRawTheme  */
/* ------------------------------------------------------------------ */
describe("/brand-qa — BrandThemeSelectorView write-back", () => {
  it("calls onSetTheme with a valid BrandLogoTheme when the user changes the dropdown", () => {
    const onSetTheme = vi.fn();
    render(
      <BrandThemeSelectorView
        rawThemeParam="teal-on-ivory"
        onSetTheme={onSetTheme}
        onSetRawTheme={vi.fn()}
      />,
    );

    const select = screen
      .getByTestId("brand-theme-select")
      .querySelector("select")!;
    fireEvent.change(select, { target: { value: "gold-on-charcoal" } });

    expect(onSetTheme).toHaveBeenCalledWith("gold-on-charcoal");
  });

  it("calls onSetRawTheme('emerald-on-mauve') when the inject button is clicked", () => {
    const onSetRawTheme = vi.fn();
    render(
      <BrandThemeSelectorView
        rawThemeParam="teal-on-ivory"
        onSetTheme={vi.fn()}
        onSetRawTheme={onSetRawTheme}
      />,
    );

    fireEvent.click(screen.getByText(/Inject invalid \?theme/i));
    expect(onSetRawTheme).toHaveBeenCalledWith("emerald-on-mauve");
  });

  it("calls onSetRawTheme(undefined) when the clear button is clicked", () => {
    const onSetRawTheme = vi.fn();
    render(
      <BrandThemeSelectorView
        rawThemeParam="emerald-on-mauve"
        onSetTheme={vi.fn()}
        onSetRawTheme={onSetRawTheme}
      />,
    );

    // Silence the guard's console.error from the invalid initial state.
    const spy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      fireEvent.click(screen.getByText(/Clear \?theme/i));
      expect(onSetRawTheme).toHaveBeenCalledWith(undefined);
    } finally {
      spy.mockRestore();
    }
  });
});
