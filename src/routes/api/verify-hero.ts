import { createFileRoute } from "@tanstack/react-router";
import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";
import { HERO_COPY_SPEC } from "@/content/hero-copy.spec";

const PUBLISHED_URL = "https://dreamscape-builder-co.lovable.app";

/**
 * Allowlist of origins permitted as `?url=` overrides. Any value outside this
 * set is rejected before a fetch is issued (SSRF defence). HTTPS-only.
 */
const ALLOWED_ORIGINS = new Set<string>([
  new URL(PUBLISHED_URL).origin,
]);

/**
 * Validate a caller-supplied base URL. Must parse, must be https, and must
 * have an origin present in ALLOWED_ORIGINS. Returns null on rejection.
 */
function validateTargetUrl(raw: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  if (!ALLOWED_ORIGINS.has(parsed.origin)) return null;
  // Normalise: strip query/hash, keep pathname only as base.
  return parsed.origin + (parsed.pathname === "/" ? "" : parsed.pathname);
}

/**
 * Validate a caller-supplied path. Must be a relative path beginning with `/`
 * and must not contain a scheme (e.g. `https://attacker.com`) or
 * protocol-relative form (`//attacker.com`). Returns null on rejection.
 */
function validatePath(raw: string): string | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  if (raw.length > 256) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null; // protocol-relative
  if (raw.includes("://")) return null;
  // Sentinel-base check: resolving against a placeholder origin must not
  // change the origin (which would indicate the path overrode the base).
  try {
    const sentinel = "http://verify-hero.invalid";
    const resolved = new URL(raw, sentinel);
    if (resolved.origin !== sentinel) return null;
  } catch {
    return null;
  }
  return raw;
}

/**
 * Constant-time string comparison to avoid leaking auth tokens via timing.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Redact sensitive fields from a URL before logging. Strips the entire query
 * string and fragment so callers can never leak `?token=...` or other
 * sensitive overrides via worker logs. Returns only `<origin><pathname>`,
 * or `"<unparseable-url>"` if the input is not a valid URL.
 */
function redactUrlForLog(raw: string): string {
  try {
    const u = new URL(raw);
    return `${u.origin}${u.pathname}`;
  } catch {
    return "<unparseable-url>";
  }
}

/**
 * Emit a structured log line for a rejected request. Never includes the
 * presented token, the raw query string, request headers, or the
 * caller-supplied `?url=` / `?path=` values verbatim. Only the request method,
 * route pathname, response status, and a stable reason code are recorded.
 */
function logRejection(
  method: string,
  requestUrl: string,
  status: number,
  reason: string,
): void {
  // eslint-disable-next-line no-console
  console.warn(
    JSON.stringify({
      evt: "verify_hero_reject",
      method,
      route: redactUrlForLog(requestUrl),
      status,
      reason,
    }),
  );
}

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
      expected: HERO_COPY_SPEC[key],
      found: decoded.includes(HERO_COPY_SPEC[key]),
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
      missing: HERO_KEYS.map((key) => ({ key, expected: HERO_COPY_SPEC[key] })),
      ok: false,
      error: (err as Error).message,
    };
  }
}

/**
 * Compare the in-source HERO_COPY against the frozen HERO_COPY_SPEC. If any
 * string drifts, the verifier reports it before even hitting the network — so
 * unauthorised wording changes are caught at the source, not after publish.
 */
function detectSpecDrift() {
  const drifted = HERO_KEYS.filter(
    (k) => HERO_COPY[k] !== HERO_COPY_SPEC[k],
  ).map((k) => ({
    key: k,
    expected: HERO_COPY_SPEC[k],
    actual: HERO_COPY[k],
  }));
  return { ok: drifted.length === 0, drifted };
}


type FailureReason =
  | "fetch_error"
  | "non_200"
  | "missing_strings"
  | "stale_version"
  | "spec_drift";

type FailedRouteSummary = {
  path: string;
  url: string;
  httpStatus: number;
  reasons: FailureReason[];
  missingKeys: string[];
  liveVersion: string | null;
};

type SpecDriftEntry = { key: string; expected: string; actual: string };
type SpecDriftResult = { ok: boolean; drifted: SpecDriftEntry[] };

type Summary = {
  totalPages: number;
  passedPages: number;
  failedPages: number;
  failedRoutes: FailedRouteSummary[];
  failedPaths: string[];
  specDriftKeys: string[];
  message: string;
};

function buildSummary(
  pages: PageReport[],
  specDrift: SpecDriftResult,
): Summary {
  const failed = pages.filter((p) => !p.ok);
  const failedRoutes: FailedRouteSummary[] = failed.map((p) => {
    const reasons: FailureReason[] = [];
    if (p.error) reasons.push("fetch_error");
    if (!p.error && p.httpStatus !== 200) reasons.push("non_200");
    if (p.missing.length > 0) reasons.push("missing_strings");
    if (p.versionMatch === false) reasons.push("stale_version");
    return {
      path: p.path,
      url: p.url,
      httpStatus: p.httpStatus,
      reasons,
      missingKeys: p.missing.map((m) => m.key),
      liveVersion: p.liveVersion,
    };
  });

  const failedPaths = failedRoutes.map((r) => r.path);
  const specDriftKeys = specDrift.drifted.map((d) => d.key);

  const parts: string[] = [];
  if (!specDrift.ok) {
    parts.push(
      `Source HERO_COPY drifted from spec: ${specDriftKeys.join(", ")}`,
    );
  }
  if (failed.length > 0) {
    parts.push(
      `${failed.length} of ${pages.length} page(s) failed: ${failedPaths.join(", ")}`,
    );
  }
  const message =
    parts.length === 0
      ? `All ${pages.length} page(s) match the frozen hero copy spec.`
      : parts.join(" — ");

  return {
    totalPages: pages.length,
    passedPages: pages.length - failed.length,
    failedPages: failed.length,
    failedRoutes,
    failedPaths,
    specDriftKeys,
    message,
  };
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
        try {
          const url = new URL(request.url);

          // ---- Auth: require shared secret before any fetch logic runs ----
          const expectedToken = process.env.VERIFY_HERO_TOKEN;
          if (!expectedToken) {
            // Fail closed if the server is misconfigured rather than allowing
            // unauthenticated access by default. Do not echo configuration
            // detail back to the caller — only a stable code.
            logRejection(request.method, request.url, 503, "endpoint_disabled");
            return Response.json(
              { ok: false, error: "endpoint_disabled" },
              { status: 503, headers: { "cache-control": "no-store" } },
            );
          }
          const authHeader = request.headers.get("authorization") ?? "";
          const bearer = authHeader.startsWith("Bearer ")
            ? authHeader.slice("Bearer ".length)
            : "";
          const queryToken = url.searchParams.get("token") ?? "";
          const presented = bearer || queryToken;
          if (!presented || !timingSafeEqual(presented, expectedToken)) {
            // CRITICAL: never include `presented`, `bearer`, `queryToken`,
            // request headers, or the raw `request.url` (which carries the
            // token) in either the response body or the log line.
            logRejection(request.method, request.url, 401, "unauthorized");
            return Response.json(
              { ok: false, error: "unauthorized" },
              { status: 401, headers: { "cache-control": "no-store" } },
            );
          }

          // ---- Input validation: ?url= must be in allowlist, ?path= must be relative ----
          const rawTarget = url.searchParams.get("url");
          const target = rawTarget === null
            ? PUBLISHED_URL
            : validateTargetUrl(rawTarget);
          if (target === null) {
            // Do NOT echo the rejected `?url=` value back to the caller or
            // into logs — it may itself be an SSRF probe (e.g. an internal
            // IP). Only the stable error code is returned.
            logRejection(request.method, request.url, 400, "invalid_url_param");
            return Response.json(
              { ok: false, error: "invalid_url_param" },
              { status: 400, headers: { "cache-control": "no-store" } },
            );
          }

          const all = url.searchParams.get("all");
          const strictParam = url.searchParams.get("strict");
          const strict = strictParam === "1" || strictParam === "true";

          const rawPath = url.searchParams.get("path");
          const singlePath = rawPath === null ? "/" : validatePath(rawPath);
          if (singlePath === null) {
            // Same rule: do not echo the rejected `?path=` value.
            logRejection(
              request.method,
              request.url,
              400,
              "invalid_path_param",
            );
            return Response.json(
              { ok: false, error: "invalid_path_param" },
              { status: 400, headers: { "cache-control": "no-store" } },
            );
          }

          const paths: readonly string[] =
            all === "1" || all === "true" ? ALL_ROUTES : [singlePath];

          // Run in parallel; cap concurrency implicitly via Promise.all on a
          // small fixed list (≤12 paths today).
          const pages = await Promise.all(
            paths.map((p) => verifyPage(target, p)),
          );

          const specDrift = detectSpecDrift();
          const pagesOk = pages.every((p) => p.ok);
          const ok = pagesOk && specDrift.ok;
          const failedCount =
            pages.filter((p) => !p.ok).length + (specDrift.ok ? 0 : 1);
          const summary = buildSummary(pages, specDrift);

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
                specDrift,
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
              specDrift,
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
        } catch {
          // Catch-all: never let an unexpected error bubble up with a stack
          // trace or the raw request URL. Log only a stable reason code and
          // a redacted route, and return a generic 500.
          logRejection(
            request.method,
            request.url,
            500,
            "unexpected_error",
          );
          return Response.json(
            { ok: false, error: "internal_error" },
            { status: 500, headers: { "cache-control": "no-store" } },
          );
        }
      },
    },
  },
});
