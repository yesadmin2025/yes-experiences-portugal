/**
 * QA / preview mode toggle.
 *
 * Independent of host: any environment (preview, prod, localhost) can opt
 * in. Persisted in localStorage so it survives reloads.
 *
 * Activation:
 *   - URL flag: `?qa=on` enables, `?qa=off` disables
 *   - Keyboard: Ctrl+Shift+Q (or Cmd+Shift+Q on Mac) toggles
 *   - Programmatic: `setQaMode(true|false)`
 *
 * Subscribers are notified on every change so the UI can react without
 * a full reload.
 */

const STORAGE_KEY = "yes:qa-mode";
const EVENT_NAME = "yes:qa-mode-change";

export function isQaModeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setQaMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled) {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore quota / privacy-mode errors
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { enabled } }));
}

export function subscribeQaMode(cb: (enabled: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb(isQaModeEnabled());
  window.addEventListener(EVENT_NAME, handler);
  // also react to storage changes from other tabs
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

/**
 * Read URL flags + install keyboard shortcut. Idempotent: safe to call
 * multiple times. Returns a teardown function.
 */
export function installQaModeActivators(): () => void {
  if (typeof window === "undefined") return () => {};

  // URL flag
  try {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("qa");
    if (flag === "on") setQaMode(true);
    else if (flag === "off") setQaMode(false);
  } catch {
    // ignore
  }

  const onKey = (e: KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.shiftKey && (e.key === "Q" || e.key === "q")) {
      e.preventDefault();
      setQaMode(!isQaModeEnabled());
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}
