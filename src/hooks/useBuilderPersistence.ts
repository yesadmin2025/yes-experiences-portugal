import { useEffect, useState } from "react";
import type { ElementKey } from "@/components/builder/elements";

const KEY = "yes.builder.state.v1";

export interface PersistedBuilderState {
  excluded: string[];
  orderOverride: string[] | null;
  guests: number;
  selectedElements: ElementKey[];
}

const DEFAULTS: PersistedBuilderState = {
  excluded: [],
  orderOverride: null,
  guests: 2,
  selectedElements: [],
};

function read(): PersistedBuilderState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<PersistedBuilderState>;
    return {
      excluded: Array.isArray(parsed.excluded) ? parsed.excluded.filter((x) => typeof x === "string") : [],
      orderOverride:
        Array.isArray(parsed.orderOverride) && parsed.orderOverride.every((x) => typeof x === "string")
          ? parsed.orderOverride
          : null,
      guests: typeof parsed.guests === "number" && parsed.guests >= 1 && parsed.guests <= 12 ? parsed.guests : 2,
      selectedElements: Array.isArray(parsed.selectedElements)
        ? (parsed.selectedElements.filter((x) => typeof x === "string") as ElementKey[])
        : [],
    };
  } catch {
    return DEFAULTS;
  }
}

/**
 * Persisted slice of builder state (everything that can't live in URL).
 * Step/mood/who/intention/pace are already in the URL search params.
 */
export function useBuilderPersistence() {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<PersistedBuilderState>(DEFAULTS);

  // Hydrate from localStorage after mount (SSR-safe).
  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  // Persist on every change (after hydration only — avoid clobbering on first render).
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [state, hydrated]);

  const reset = () => {
    clearBuilderPersistence();
    setState(DEFAULTS);
  };

  return { state, setState, hydrated, reset };
}

export function clearBuilderPersistence() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
