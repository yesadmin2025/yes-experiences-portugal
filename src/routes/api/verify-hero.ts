import { createFileRoute } from "@tanstack/react-router";
import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";

const PUBLISHED_URL = "https://dreamscape-builder-co.lovable.app";

/**
 * Every routable path generated from `src/routes/` (excluding `__root` and the
 * api/* server routes). Keep this list in sync when new top-level routes are
 * added — it powers the multi-page hero verification mode.
 */
const ALL_ROUTES = [
  "/",
  "/about",
  "/brand-qa",
  "/builder",
  "/contact",
  "/corporate",
  "/day-tours",
  "/experiences",
  "/local-stories",
  "/multi-day",
  "/proposals",
  "/hero-verify",
] as const;

const HERO_KEYS = [
  "eyebrow",
  "headlineLine1",
  "headlineLine2",
  "subheadline",
  "primaryCta",
  "secondaryCta",
  "microcopy",
] as const;

type CheckResult = {
  key: string;
  expected: string;
  found: boolean;
};

type PageReport = {
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

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&middot;/g, "·")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function verifyPage(targetUrl: string, path: string): Promise<PageReport> {
  const url = new URL(path, targetUrl).toString();
  const base: Omit<PageReport, "ok" | "httpStatus" | "checks" | "missing"> = {
    path,
    url,
    liveVersion: null,
    versionMatch: null,
  };

  try {
    const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
    const liveVersion = res.headers.get("x-hero-copy-version");
    const html = await res.text();
    const decoded = decodeHtml(html);

    const checks: CheckResult[] = HERO_KEYS.map((key) => ({
      key,
      expected: HERO_COPY[key],
      found: decoded.includes(HERO_COPY[key]),
    }));

    const missing = checks
      .filter((c) => !c.found)
      .map((c) => ({ key: c.key, expected: c.expected }));

    return {
      ...base,
      httpStatus: res.status,
      liveVersion,
      versionMatch:
        liveVersion === null ? null : liveVersion === HERO_COPY_VERSION,
      checks,
      missing,
      ok: missing.length === 0 && res.status === 200,
    };
  } catch (err) {
    return {
      ...base,
      httpStatus: 0,
      checks: [],
      missing: HERO_KEYS.map((key) => ({ key, expected: HERO_COPY[key] })),
      ok: false,
      error: (err as Error).message,
    };
  }
}

/**
 * GET /api/verify-hero
 *
 * Default: verifies the homepage of the published site against the current
 * source `HERO_COPY` (eyebrow, both headline lines, subheadline, CTAs,
 * microcopy).
 *
 * Query params:
 *   ?url=<base>   Override the base URL (e.g. preview deployment).
 *   ?all=1        Fan out across every route in ALL_ROUTES and require every
 *                 page to contain all 7 hero strings verbatim.
 *   ?path=/x      Check a single specific path instead of "/".
 *   ?strict=1     Escalate any failure to HTTP 422 (instead of 409) and
 *                 include a top-level `summary` object listing failed routes
 *                 and reason codes — designed for CI / curl `--fail` checks.
 *
 * Status codes:
 *   200  all checks passed
 *   409  one or more strings missing (default failure code)
 *   422  failure under ?strict=1
 *   502  network/fetch error reaching the target
 */
export const Route = createFileRoute("/api/verify-hero")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const target = url.searchParams.get("url") ?? PUBLISHED_URL;
        const all = url.searchParams.get("all");
        const strictParam = url.searchParams.get("strict");
        const strict = strictParam === "1" || strictParam === "true";
        const singlePath = url.searchParams.get("path") ?? "/";

        const paths: readonly string[] =
          all === "1" || all === "true" ? ALL_ROUTES : [singlePath];

        // Run in parallel; cap concurrency implicitly via Promise.all on a
        // small fixed list (≤12 paths today).
        const pages = await Promise.all(
          paths.map((p) => verifyPage(target, p)),
        );

        const ok = pages.every((p) => p.ok);
        const failedCount = pages.filter((p) => !p.ok).length;
        const summary = buildSummary(pages);

        // Backwards-compatible single-page shape when not in `all` mode.
        if (paths.length === 1) {
          const only = pages[0];
          const failureStatus = strict ? 422 : only.error ? 502 : 409;
          return Response.json(
            {
              ok: only.ok,
              strict,
              target: only.url,
              httpStatus: only.httpStatus,
              sourceVersion: HERO_COPY_VERSION,
              liveVersion: only.liveVersion,
              versionMatch: only.versionMatch,
              checks: only.checks,
              missing: only.missing,
              summary,
              checkedAt: new Date().toISOString(),
              ...(only.error ? { error: only.error } : {}),
            },
            {
              status: only.ok ? 200 : failureStatus,
              headers: { "cache-control": "no-store" },
            },
          );
        }

        const multiFailureStatus = strict ? 422 : 409;
        return Response.json(
          {
            ok,
            strict,
            mode: "all",
            base: target,
            sourceVersion: HERO_COPY_VERSION,
            totalPages: pages.length,
            failedCount,
            summary,
            pages,
            checkedAt: new Date().toISOString(),
          },
          {
            status: ok ? 200 : multiFailureStatus,
            headers: { "cache-control": "no-store" },
          },
        );
      },
    },
  },
});
