import { useEffect, useState } from "react";

/**
 * Hidden meta probe. Reads the live `<head>` after mount and mirrors the
 * exported title, description, and every hero-related meta tag onto a
 * single sr-only element with `data-*` attributes. Useful in preview to
 * confirm a metadata change actually shipped — no need to inspect
 * response headers or open the Network tab.
 *
 * Quick checks (paste in the browser console):
 *   const m = document.querySelector('[data-meta-probe]');
 *   m.dataset.metaTitle;
 *   m.dataset.metaDescription;
 *   m.dataset.metaOgTitle;
 *   m.dataset.metaTwitterDescription;
 *   m.dataset.metaYesHeroCopyVersion;
 *
 * The probe re-reads on every navigation/title-change via a MutationObserver
 * on `<head>`, so the values stay accurate after client-side route changes.
 */
type MetaSnapshot = Record<string, string>;

function readHeadSnapshot(): MetaSnapshot {
  if (typeof document === "undefined") return {};
  const out: MetaSnapshot = {};
  out.title = document.title ?? "";

  const metas = document.head.querySelectorAll("meta");
  metas.forEach((el) => {
    const key =
      el.getAttribute("name") ?? el.getAttribute("property") ?? el.getAttribute("http-equiv");
    const value = el.getAttribute("content");
    if (!key || value == null) return;
    // Mirror everything that's clearly hero/SEO related so future additions
    // (new og:* / twitter:* / hero-* tags) get picked up automatically.
    const isHeroOrSeo =
      key === "description" ||
      key.startsWith("og:") ||
      key.startsWith("twitter:") ||
      key.includes("hero") ||
      key.includes("yes-");
    if (isHeroOrSeo) out[key] = value;
  });
  return out;
}

function toDataAttrName(key: string): string {
  // "og:title" → "data-meta-og-title"; "yes-hero-copy-version" → "data-meta-yes-hero-copy-version"
  const safe = key.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return `data-meta-${safe}`;
}

export function HeroMetaProbe() {
  const [snapshot, setSnapshot] = useState<MetaSnapshot>(() => readHeadSnapshot());

  useEffect(() => {
    // Initial post-mount sync (head() may have been applied just after first paint).
    setSnapshot(readHeadSnapshot());

    const observer = new MutationObserver(() => {
      setSnapshot(readHeadSnapshot());
    });
    observer.observe(document.head, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, []);

  const dataAttrs: Record<string, string> = {};
  for (const [k, v] of Object.entries(snapshot)) {
    dataAttrs[toDataAttrName(k)] = v;
  }

  return (
    <div
      data-meta-probe=""
      data-testid="hero-meta-probe"
      aria-hidden="true"
      {...dataAttrs}
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {Object.entries(snapshot).map(([k, v]) => (
        <span key={k} data-probe-meta={k}>
          {k}={v}
          {" | "}
        </span>
      ))}
    </div>
  );
}
