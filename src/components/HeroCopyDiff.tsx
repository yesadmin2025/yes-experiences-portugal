import { useEffect } from "react";
import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";

/**
 * Hidden hero-copy diff helper.
 *
 * On mount, compares the current `HERO_COPY` JSON against a baseline
 * stored in `localStorage` under `hero-copy:baseline`. If anything
 * changed, it logs a tidy table of `{ field, before, after }` rows to
 * the console — perfect for spotting accidental copy drift in preview.
 *
 * Manual controls (exposed on `window.__heroCopy`):
 *   __heroCopy.diff()        // re-run the diff and return the rows
 *   __heroCopy.snapshot()    // current { version, copy } object
 *   __heroCopy.baseline()    // stored baseline (or null)
 *   __heroCopy.setBaseline() // overwrite the baseline with current copy
 *   __heroCopy.clear()       // remove the baseline entirely
 *
 * Renders nothing visible. Skips gracefully on the server.
 */

const STORAGE_KEY = "hero-copy:baseline";

type Snapshot = {
  version: string;
  copy: Record<string, string>;
};

type DiffRow = {
  field: string;
  before: string | undefined;
  after: string | undefined;
  change: "added" | "removed" | "changed";
};

function currentSnapshot(): Snapshot {
  return {
    version: HERO_COPY_VERSION,
    copy: { ...HERO_COPY },
  };
}

function readBaseline(): Snapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.version === "string" &&
      parsed.copy &&
      typeof parsed.copy === "object"
    ) {
      return parsed as Snapshot;
    }
    return null;
  } catch {
    return null;
  }
}

function writeBaseline(snapshot: Snapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* quota / privacy mode — ignore */
  }
}

function diffSnapshots(before: Snapshot, after: Snapshot): DiffRow[] {
  const rows: DiffRow[] = [];
  const keys = new Set<string>([
    ...Object.keys(before.copy),
    ...Object.keys(after.copy),
  ]);
  for (const field of keys) {
    const b = before.copy[field];
    const a = after.copy[field];
    if (b === a) continue;
    let change: DiffRow["change"];
    if (b === undefined) change = "added";
    else if (a === undefined) change = "removed";
    else change = "changed";
    rows.push({ field, before: b, after: a, change });
  }
  return rows.sort((x, y) => x.field.localeCompare(y.field));
}

function runDiff(): DiffRow[] {
  const after = currentSnapshot();
  const before = readBaseline();

  if (!before) {
    writeBaseline(after);
    console.info(
      "%c[hero-copy] baseline stored (first run)",
      "color:#9ca3af",
      `version=${after.version}`,
    );
    return [];
  }

  if (before.version === after.version) {
    console.debug(
      "%c[hero-copy] no changes",
      "color:#9ca3af",
      `version=${after.version}`,
    );
    return [];
  }

  const rows = diffSnapshots(before, after);
  console.groupCollapsed(
    `%c[hero-copy] ${rows.length} field${rows.length === 1 ? "" : "s"} changed`,
    "color:#f59e0b;font-weight:bold",
    `${before.version} → ${after.version}`,
  );
  // Use console.table so before/after are easy to scan and copy.
  console.table(rows);
  console.info(
    "Call __heroCopy.setBaseline() to accept these changes as the new baseline.",
  );
  console.groupEnd();

  return rows;
}

declare global {
  interface Window {
    __heroCopy?: {
      diff: () => DiffRow[];
      snapshot: () => Snapshot;
      baseline: () => Snapshot | null;
      setBaseline: () => Snapshot;
      clear: () => void;
    };
  }
}

export function HeroCopyDiff() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.__heroCopy = {
      diff: runDiff,
      snapshot: currentSnapshot,
      baseline: readBaseline,
      setBaseline: () => {
        const snap = currentSnapshot();
        writeBaseline(snap);
        console.info(
          "%c[hero-copy] baseline updated",
          "color:#10b981",
          `version=${snap.version}`,
        );
        return snap;
      },
      clear: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        console.info("%c[hero-copy] baseline cleared", "color:#9ca3af");
      },
    };

    runDiff();
  }, []);

  return null;
}
