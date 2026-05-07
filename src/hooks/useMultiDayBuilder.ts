import { useCallback, useEffect, useState } from "react";
import type { Pace } from "@/components/builder/types";

const KEY = "yes.builder.multiday.v1";

export interface DayState {
  /** Stable id (e.g. crypto.randomUUID) so UI keys are stable across reorders. */
  id: string;
  /** Region for this specific day. */
  regionKey: string;
  /** Ordered stop keys (user-chosen). */
  stopKeys: string[];
  /** Optional per-day label override. */
  label?: string;
}

export interface MultiDayState {
  days: DayState[];
  activeDayId: string | null;
  guests: number;
  pace: Pace;
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

function defaults(regionKey = "arrabida-setubal"): MultiDayState {
  const id = makeId();
  return {
    days: [{ id, regionKey, stopKeys: [] }],
    activeDayId: id,
    guests: 2,
    pace: "balanced",
  };
}

function read(): MultiDayState {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<MultiDayState>;
    if (!Array.isArray(parsed.days) || parsed.days.length === 0) return defaults();
    const days: DayState[] = parsed.days
      .filter((d): d is DayState =>
        typeof d === "object" && d !== null &&
        typeof (d as DayState).id === "string" &&
        typeof (d as DayState).regionKey === "string" &&
        Array.isArray((d as DayState).stopKeys),
      )
      .map((d) => ({
        id: d.id,
        regionKey: d.regionKey,
        stopKeys: d.stopKeys.filter((k) => typeof k === "string"),
        label: typeof d.label === "string" ? d.label : undefined,
      }));
    if (days.length === 0) return defaults();
    const activeDayId =
      typeof parsed.activeDayId === "string" && days.some((d) => d.id === parsed.activeDayId)
        ? parsed.activeDayId
        : days[0].id;
    return {
      days,
      activeDayId,
      guests: typeof parsed.guests === "number" && parsed.guests >= 1 && parsed.guests <= 12 ? parsed.guests : 2,
      pace: (parsed.pace === "relaxed" || parsed.pace === "full" || parsed.pace === "balanced")
        ? parsed.pace : "balanced",
    };
  } catch {
    return defaults();
  }
}

export function useMultiDayBuilder() {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<MultiDayState>(() => defaults());

  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const activeDay =
    state.days.find((d) => d.id === state.activeDayId) ?? state.days[0] ?? null;

  const addDay = useCallback((regionKey?: string) => {
    setState((s) => {
      const id = makeId();
      const seedRegion = regionKey ?? activeDay?.regionKey ?? s.days[0]?.regionKey ?? "arrabida-setubal";
      return {
        ...s,
        days: [...s.days, { id, regionKey: seedRegion, stopKeys: [] }],
        activeDayId: id,
      };
    });
  }, [activeDay?.regionKey]);

  const removeDay = useCallback((id: string) => {
    setState((s) => {
      if (s.days.length <= 1) return s; // keep at least one day
      const days = s.days.filter((d) => d.id !== id);
      const activeDayId =
        s.activeDayId === id ? days[0].id : s.activeDayId;
      return { ...s, days, activeDayId };
    });
  }, []);

  const setActiveDay = useCallback((id: string) => {
    setState((s) => ({ ...s, activeDayId: id }));
  }, []);

  const updateDay = useCallback((id: string, patch: Partial<DayState>) => {
    setState((s) => ({
      ...s,
      days: s.days.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  }, []);

  const moveDay = useCallback((id: string, dir: -1 | 1) => {
    setState((s) => {
      const idx = s.days.findIndex((d) => d.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= s.days.length) return s;
      const days = s.days.slice();
      [days[idx], days[j]] = [days[j], days[idx]];
      return { ...s, days };
    });
  }, []);

  const addStopToActive = useCallback((stopKey: string) => {
    setState((s) => {
      if (!s.activeDayId) return s;
      return {
        ...s,
        days: s.days.map((d) =>
          d.id === s.activeDayId && !d.stopKeys.includes(stopKey)
            ? { ...d, stopKeys: [...d.stopKeys, stopKey] }
            : d,
        ),
      };
    });
  }, []);

  const removeStopFromActive = useCallback((stopKey: string) => {
    setState((s) => {
      if (!s.activeDayId) return s;
      return {
        ...s,
        days: s.days.map((d) =>
          d.id === s.activeDayId
            ? { ...d, stopKeys: d.stopKeys.filter((k) => k !== stopKey) }
            : d,
        ),
      };
    });
  }, []);

  const moveStopInActive = useCallback((idx: number, dir: -1 | 1) => {
    setState((s) => {
      const day = s.days.find((d) => d.id === s.activeDayId);
      if (!day) return s;
      const j = idx + dir;
      if (j < 0 || j >= day.stopKeys.length) return s;
      const next = day.stopKeys.slice();
      [next[idx], next[j]] = [next[j], next[idx]];
      return {
        ...s,
        days: s.days.map((d) =>
          d.id === s.activeDayId ? { ...d, stopKeys: next } : d,
        ),
      };
    });
  }, []);

  const setGuests = useCallback((n: number) => {
    setState((s) => ({ ...s, guests: Math.max(1, Math.min(12, n)) }));
  }, []);

  const setPace = useCallback((p: Pace) => {
    setState((s) => ({ ...s, pace: p }));
  }, []);

  const setRegion = useCallback((dayId: string, regionKey: string) => {
    setState((s) => ({
      ...s,
      days: s.days.map((d) =>
        d.id === dayId ? { ...d, regionKey, stopKeys: [] } : d,
      ),
    }));
  }, []);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
    }
    setState(defaults());
  }, []);

  return {
    state,
    hydrated,
    activeDay,
    addDay,
    removeDay,
    setActiveDay,
    updateDay,
    moveDay,
    addStopToActive,
    removeStopFromActive,
    moveStopInActive,
    setGuests,
    setPace,
    setRegion,
    reset,
  };
}
