/**
 * Field-level diff between two /hero-verify reports.
 *
 * Produces a flat list of FieldChange entries the UI can render with
 * green (added/now-passing), red (removed/now-failing), or amber (changed)
 * highlights. "Identical" entries are omitted — only differences appear.
 */
import {
  isMulti,
  type PageReport,
  type SpecDrift,
  type VerifyResponse,
} from "@/lib/hero-verify-download";

export type ChangeKind = "added" | "removed" | "changed" | "unchanged";

export type FieldChange = {
  scope: "report" | "page" | "spec_drift";
  path: string; // e.g. "summary.ok", "/about → httpStatus", "spec_drift.eyebrow"
  kind: ChangeKind;
  before: string;
  after: string;
};

function fmt(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length === 0 ? "[]" : value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function pushIfChanged(
  out: FieldChange[],
  scope: FieldChange["scope"],
  path: string,
  before: unknown,
  after: unknown,
) {
  const b = fmt(before);
  const a = fmt(after);
  if (b === a) return;
  let kind: ChangeKind = "changed";
  if (before === undefined || before === null || b === "—") kind = "added";
  else if (after === undefined || after === null || a === "—") kind = "removed";
  out.push({ scope, path, kind, before: b, after: a });
}

function pagesByPath(r: VerifyResponse): Record<string, PageReport> {
  if (isMulti(r)) {
    const map: Record<string, PageReport> = {};
    for (const p of r.pages) map[p.path] = p;
    return map;
  }
  // Synthesize a single "/" page from a SingleResponse so diff logic is uniform.
  return {
    "/": {
      path: "/",
      url: r.target,
      ok: r.ok,
      httpStatus: r.httpStatus,
      liveVersion: r.liveVersion,
      versionMatch: r.versionMatch,
      checks: r.checks,
      missing: r.missing,
      ...(r.error ? { error: r.error } : {}),
    },
  };
}

function diffSpecDrift(
  out: FieldChange[],
  before: SpecDrift | undefined,
  after: SpecDrift | undefined,
) {
  const beforeMap = new Map((before?.drifted ?? []).map((d) => [d.key, d.actual]));
  const afterMap = new Map((after?.drifted ?? []).map((d) => [d.key, d.actual]));
  const keys = new Set([...beforeMap.keys(), ...afterMap.keys()]);
  for (const k of keys) {
    pushIfChanged(out, "spec_drift", k, beforeMap.get(k), afterMap.get(k));
  }
  pushIfChanged(out, "spec_drift", "ok", before?.ok ?? true, after?.ok ?? true);
}

export function diffReports(before: VerifyResponse, after: VerifyResponse): FieldChange[] {
  const out: FieldChange[] = [];

  // Top-level report fields.
  pushIfChanged(out, "report", "ok", before.ok, after.ok);
  pushIfChanged(out, "report", "sourceVersion", before.sourceVersion, after.sourceVersion);
  pushIfChanged(
    out,
    "report",
    "mode",
    isMulti(before) ? "all" : "single",
    isMulti(after) ? "all" : "single",
  );
  if (isMulti(before) && isMulti(after)) {
    pushIfChanged(out, "report", "totalPages", before.totalPages, after.totalPages);
    pushIfChanged(out, "report", "failedCount", before.failedCount, after.failedCount);
  }

  // Spec drift.
  diffSpecDrift(out, before.specDrift, after.specDrift);

  // Per-page diffs.
  const beforePages = pagesByPath(before);
  const afterPages = pagesByPath(after);
  const allPaths = Array.from(
    new Set([...Object.keys(beforePages), ...Object.keys(afterPages)]),
  ).sort();

  for (const path of allPaths) {
    const b = beforePages[path];
    const a = afterPages[path];
    if (!b && a) {
      out.push({
        scope: "page",
        path: `${path} → present`,
        kind: "added",
        before: "—",
        after: "page added to report",
      });
      continue;
    }
    if (b && !a) {
      out.push({
        scope: "page",
        path: `${path} → present`,
        kind: "removed",
        before: "page in report",
        after: "—",
      });
      continue;
    }
    if (!b || !a) continue;

    pushIfChanged(out, "page", `${path} → ok`, b.ok, a.ok);
    pushIfChanged(out, "page", `${path} → httpStatus`, b.httpStatus, a.httpStatus);
    pushIfChanged(out, "page", `${path} → liveVersion`, b.liveVersion, a.liveVersion);
    pushIfChanged(out, "page", `${path} → versionMatch`, b.versionMatch, a.versionMatch);
    pushIfChanged(
      out,
      "page",
      `${path} → missingKeys`,
      b.missing.map((m) => m.key).sort(),
      a.missing.map((m) => m.key).sort(),
    );
    pushIfChanged(out, "page", `${path} → error`, b.error, a.error);
  }

  return out;
}
