/**
 * Shared types + download helpers for the /hero-verify page.
 *
 * Kept in a dedicated module (rather than inline in the route file) so the
 * helpers are unambiguously in scope for any consumer and don't rely on
 * function-declaration hoisting within a single large file.
 */

export type CheckResult = {
  key: string;
  expected: string;
  found: boolean;
};

export type PageReport = {
  path: string;
  url: string;
  ok: boolean;
  httpStatus: number;
  liveVersion: string | null;
  versionMatch: boolean | null;
  checks: CheckResult[];
  missing: { key: string; expected: string }[];
  error?: string;
};

export type SpecDrift = {
  ok: boolean;
  drifted: { key: string; expected: string; actual: string }[];
};

export type SingleResponse = {
  ok: boolean;
  target: string;
  httpStatus: number;
  sourceVersion: string;
  liveVersion: string | null;
  versionMatch: boolean | null;
  checks: CheckResult[];
  missing: { key: string; expected: string }[];
  specDrift?: SpecDrift;
  checkedAt: string;
  error?: string;
};

export type MultiResponse = {
  ok: boolean;
  mode: "all";
  base: string;
  sourceVersion: string;
  totalPages: number;
  failedCount: number;
  pages: PageReport[];
  specDrift?: SpecDrift;
  checkedAt: string;
};

export type VerifyResponse = SingleResponse | MultiResponse;

export function isMulti(r: VerifyResponse): r is MultiResponse {
  return (r as MultiResponse).mode === "all";
}

export function triggerDownload(blob: Blob, filename: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildFilename(result: VerifyResponse, ext: "json" | "csv"): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const scope = isMulti(result) ? "all" : "single";
  const status = result.ok ? "ok" : "fail";
  return `hero-verify-${scope}-${status}-${stamp}.${ext}`;
}

function csvEscape(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(result: VerifyResponse): string {
  const header = [
    "scope",
    "path",
    "url",
    "ok",
    "httpStatus",
    "liveVersion",
    "versionMatch",
    "missingKey",
    "expected",
    "specDriftKey",
    "specExpected",
    "specActual",
    "checkedAt",
  ];
  const rows: string[][] = [header];
  const checkedAt = result.checkedAt;

  if (result.specDrift && !result.specDrift.ok) {
    for (const d of result.specDrift.drifted) {
      rows.push([
        "spec_drift",
        "",
        "",
        "false",
        "",
        "",
        "",
        "",
        "",
        d.key,
        d.expected,
        d.actual,
        checkedAt,
      ]);
    }
  }

  if (isMulti(result)) {
    for (const page of result.pages) {
      if (page.missing.length === 0) {
        rows.push([
          "page",
          page.path,
          page.url,
          String(page.ok),
          String(page.httpStatus),
          page.liveVersion ?? "",
          page.versionMatch === null ? "" : String(page.versionMatch),
          "",
          "",
          "",
          "",
          "",
          checkedAt,
        ]);
      } else {
        for (const m of page.missing) {
          rows.push([
            "page",
            page.path,
            page.url,
            String(page.ok),
            String(page.httpStatus),
            page.liveVersion ?? "",
            page.versionMatch === null ? "" : String(page.versionMatch),
            m.key,
            m.expected,
            "",
            "",
            "",
            checkedAt,
          ]);
        }
      }
    }
  } else if (result.missing.length === 0) {
    rows.push([
      "page",
      "/",
      result.target,
      String(result.ok),
      String(result.httpStatus),
      result.liveVersion ?? "",
      result.versionMatch === null ? "" : String(result.versionMatch),
      "",
      "",
      "",
      "",
      "",
      checkedAt,
    ]);
  } else {
    for (const m of result.missing) {
      rows.push([
        "page",
        "/",
        result.target,
        String(result.ok),
        String(result.httpStatus),
        result.liveVersion ?? "",
        result.versionMatch === null ? "" : String(result.versionMatch),
        m.key,
        m.expected,
        "",
        "",
        "",
        checkedAt,
      ]);
    }
  }

  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}
