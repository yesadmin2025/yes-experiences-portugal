import { useId, useMemo, useState } from "react";
import {
  BRAND_LOGO_THEMES,
  isBrandLogoTheme,
  type BrandLogoTheme,
} from "@/lib/brand-tokens";

/**
 * Detect dev/test at module scope so the component renders the same
 * tree on every call (no try/catch in render). Mirrors the helper in
 * `brand-tokens.ts` so the visible warning shows up in exactly the same
 * environments where `assertBrandLogoTheme` would throw.
 */
const IS_DEV: boolean = (() => {
  try {
    const flag = (import.meta as unknown as { env?: { DEV?: boolean } }).env
      ?.DEV;
    if (typeof flag === "boolean") return flag;
  } catch {
    /* ignore */
  }
  if (typeof process !== "undefined" && process.env) {
    const n = process.env.NODE_ENV;
    return n === "development" || n === "test" || n === undefined;
  }
  return false;
})();

export interface BrandThemeSelectProps {
  /**
   * Current theme. Typed loosely as `unknown` so callers wiring this up
   * to CMS / URL / DB strings get the runtime guard rather than a
   * TypeScript-only check that disappears at runtime.
   */
  value: unknown;
  /** Fired only with values that pass the `BrandLogoTheme` guard. */
  onChange: (next: BrandLogoTheme) => void;
  label?: string;
  /** Extra class for the wrapper, e.g. layout spacing. */
  className?: string;
  /** Override the component name used in the dev error message. */
  componentName?: string;
}

/**
 * Dev-only theme picker that:
 *
 *  - Lists every value in `BRAND_LOGO_THEMES` (single source of truth).
 *  - Refuses to emit anything outside `BrandLogoTheme` from `onChange`.
 *  - When the controlled `value` prop is unsupported, renders a
 *    visible red error panel **in development** explaining what was
 *    received and what the allowed values are. In production the
 *    panel is suppressed and the select silently falls back to the
 *    first valid theme so end users never see a broken UI.
 */
export function BrandThemeSelect({
  value,
  onChange,
  label = "Brand theme",
  className,
  componentName = "BrandThemeSelect",
}: BrandThemeSelectProps) {
  const reactId = useId();
  const selectId = `brand-theme-select-${reactId}`;
  const errorId = `${selectId}-error`;

  const valid = isBrandLogoTheme(value);
  const fallback: BrandLogoTheme = BRAND_LOGO_THEMES[0];
  const effective: BrandLogoTheme = valid ? value : fallback;

  const allowedList = useMemo(
    () => BRAND_LOGO_THEMES.map((t) => `"${t}"`).join(", "),
    [],
  );

  const received =
    value === undefined
      ? "undefined"
      : value === null
        ? "null"
        : `${typeof value} ${JSON.stringify(value)}`;

  // Track the last invalid value we logged so re-renders with the same
  // bad input don't spam the console on every keystroke / parent update.
  const [lastLogged, setLastLogged] = useState<unknown>(undefined);
  if (IS_DEV && !valid && value !== lastLogged) {
    // eslint-disable-next-line no-console
    console.error(
      `[brand-lock] <${componentName}> received an unsupported brand theme: ${received}. Allowed values: ${allowedList}.`,
    );
    // setState in render is allowed when guarded by an equality check
    // (React docs: "Storing information from previous renders").
    setLastLogged(value);
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (!isBrandLogoTheme(next)) {
      // Should be unreachable — every <option> comes from BRAND_LOGO_THEMES
      // — but guard anyway in case someone monkey-patches the DOM.
      const msg = `[brand-lock] <${componentName}> attempted to emit unsupported theme: ${JSON.stringify(next)}.`;
      // eslint-disable-next-line no-console
      console.error(msg);
      if (IS_DEV) throw new Error(msg);
      return;
    }
    onChange(next);
  };

  const showDevError = IS_DEV && !valid;

  return (
    <div className={className} data-testid="brand-theme-select">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-foreground mb-1"
      >
        {label}
      </label>
      <select
        id={selectId}
        value={effective}
        onChange={handleChange}
        aria-invalid={showDevError || undefined}
        aria-describedby={showDevError ? errorId : undefined}
        data-brand-theme-invalid={showDevError ? "true" : undefined}
        className={
          "w-full rounded-md border bg-background px-3 py-2 text-sm " +
          "focus:outline-none focus:ring-2 focus:ring-ring " +
          (showDevError
            ? "border-destructive ring-1 ring-destructive"
            : "border-input")
        }
      >
        {BRAND_LOGO_THEMES.map((theme) => (
          <option key={theme} value={theme}>
            {theme}
          </option>
        ))}
      </select>

      {showDevError ? (
        <div
          id={errorId}
          role="alert"
          data-testid="brand-theme-select-error"
          className="mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
        >
          <div className="font-semibold">
            [brand-lock] Unsupported brand theme (dev only)
          </div>
          <div className="mt-1">
            <code>&lt;{componentName}&gt;</code> received:{" "}
            <code className="break-all">{received}</code>
          </div>
          <div className="mt-1">
            Allowed values: <code>{allowedList}</code>
          </div>
          <div className="mt-1 opacity-80">
            Falling back to <code>"{fallback}"</code> for the picker. This
            warning is suppressed in production builds.
          </div>
        </div>
      ) : null}
    </div>
  );
}
