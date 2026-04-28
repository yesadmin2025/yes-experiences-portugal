import { useEffect, useState, useCallback } from "react";

/**
 * Persisted preference for how aggressively imported tour images should be
 * downsampled in preview cards.
 *
 * - `fast`  → request the smaller candidate widths so cards render quicker
 *             on slow connections / mobile data.
 * - `crisp` → request larger candidates for retina sharpness.
 *
 * The choice only affects the proxy width hint passed to `/api/img`; layout,
 * `srcSet` candidates and `sizes` stay identical so card dimensions never
 * shift when the user toggles.
 */
export type ImageQuality = "fast" | "crisp";

const KEY = "ye:image-quality";
const DEFAULT: ImageQuality = "fast";

function read(): ImageQuality {
  if (typeof localStorage === "undefined") return DEFAULT;
  try {
    const v = localStorage.getItem(KEY);
    return v === "crisp" || v === "fast" ? v : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

const listeners = new Set<(q: ImageQuality) => void>();

function broadcast(q: ImageQuality) {
  for (const l of listeners) l(q);
}

export function useImageQuality(): {
  quality: ImageQuality;
  setQuality: (q: ImageQuality) => void;
} {
  const [quality, setLocal] = useState<ImageQuality>(DEFAULT);

  // Hydrate from storage after mount (SSR-safe).
  useEffect(() => {
    setLocal(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setLocal(read());
    };
    const onLocal = (q: ImageQuality) => setLocal(q);
    listeners.add(onLocal);
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onLocal);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setQuality = useCallback((q: ImageQuality) => {
    try {
      localStorage.setItem(KEY, q);
    } catch {
      /* quota / private mode */
    }
    setLocal(q);
    broadcast(q);
  }, []);

  return { quality, setQuality };
}
