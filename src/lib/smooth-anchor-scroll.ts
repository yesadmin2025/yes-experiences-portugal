/**
 * Global smooth-anchor scroll handler.
 *
 * Intercepts clicks on in-page hash links (<a href="#section">) and:
 *   1. cancels the default native jump,
 *   2. resolves the actual target element by id,
 *   3. computes a top offset that matches the fixed Navbar height tier
 *      (80 / 88 / 96px), so the section title lands below the navbar
 *      instead of being clipped under it,
 *   4. scrolls smoothly there (or instantly when prefers-reduced-motion
 *      is on),
 *   5. updates `location.hash` without triggering another browser jump,
 *      so deep-linking + back-button still work.
 *
 * It also covers same-page hash links written as <a href="/path#section">
 * when `path` matches `location.pathname`.
 *
 * Per-section `scroll-mt-*` utilities still win when set; the offset we
 * compute here is a baseline so links never land "cut off" under the
 * navbar. CSS `scroll-padding-top` on <html> already handles native
 * fragment navigation; this handler covers click-driven jumps where we
 * also want a smooth easing curve.
 *
 * Returns a dispose() to remove the listener (used by tests + HMR).
 */

const NAVBAR_TIERS: Array<{ minWidth: number; offset: number }> = [
  { minWidth: 1024, offset: 96 },
  { minWidth: 768, offset: 88 },
  { minWidth: 0, offset: 80 },
];

function navbarOffset(win: Window): number {
  const w = win.innerWidth || 0;
  for (const t of NAVBAR_TIERS) if (w >= t.minWidth) return t.offset;
  return 80;
}

function isHashLink(a: HTMLAnchorElement): string | null {
  // Honour explicit opt-outs (e.g. third-party widgets).
  if (a.dataset.noSmoothScroll === "true") return null;
  // Modifier keys / non-primary clicks should keep native behaviour
  // (open in new tab, etc.) — caller already filtered those.
  const href = a.getAttribute("href");
  if (!href) return null;
  if (href.startsWith("#")) return href.slice(1) || null;
  // Same-pathname hash link: "/path#anchor"
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    if (url.pathname !== window.location.pathname) return null;
    if (!url.hash) return null;
    return url.hash.slice(1) || null;
  } catch {
    return null;
  }
}

export function installSmoothAnchorScroll(
  win: Window | undefined = typeof window !== "undefined" ? window : undefined,
): () => void {
  if (!win) return () => {};
  const doc = win.document;

  const onClick = (e: MouseEvent) => {
    // Respect modifier-clicks / middle-click / non-primary buttons —
    // these are user-intent for "open elsewhere" and must not be hijacked.
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const target = e.target as Element | null;
    if (!target) return;
    const a = target.closest?.("a") as HTMLAnchorElement | null;
    if (!a) return;
    if (a.target && a.target !== "" && a.target !== "_self") return;

    const id = isHashLink(a);
    if (!id) return;

    const el = doc.getElementById(id);
    if (!el) return;

    e.preventDefault();

    const reduce = win.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    // Honour any per-section scroll-mt-* the author set, then add our
    // navbar baseline so we never land clipped under the header.
    const rect = el.getBoundingClientRect();
    const scrollMt = parseFloat(win.getComputedStyle(el).scrollMarginTop || "0") || 0;
    const baseline = navbarOffset(win);
    const offset = Math.max(scrollMt, baseline);
    const top = rect.top + win.scrollY - offset;

    win.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });

    // Keep the URL in sync (deep-link + back-button) without triggering
    // a second native jump.
    if (win.location.hash !== `#${id}`) {
      try {
        win.history.replaceState(null, "", `#${id}`);
      } catch {
        /* sandboxed history — ignore */
      }
    }
  };

  doc.addEventListener("click", onClick, { capture: false });
  return () => doc.removeEventListener("click", onClick, { capture: false });
}
