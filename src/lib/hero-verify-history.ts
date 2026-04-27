/**
 * localStorage-backed history of /hero-verify runs.
 *
 * Stores up to MAX_HISTORY entries (most recent last). Used by Compare mode
 * to diff the two most recent reports without server round-trips.
 */
import type { VerifyResponse } from "@/lib/hero-verify-download";

const STORAGE_KEY = "hero-verify:history:v1";
const MAX_HISTORY = 5;

export type HistoryEntry = {
  id: string;
  savedAt: string;
  result: VerifyResponse;
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HistoryEntry =>
        !!e &&
        typeof e === "object" &&
        typeof (e as HistoryEntry).id === "string" &&
        typeof (e as HistoryEntry).savedAt === "string" &&
        !!(e as HistoryEntry).result,
    );
  } catch {
    return [];
  }
}

export function saveRun(result: VerifyResponse): HistoryEntry[] {
  if (!isBrowser()) return [];
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
    result,
  };
  const next = [...loadHistory(), entry].slice(-MAX_HISTORY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota or serialization failure — silently skip.
  }
  return next;
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
