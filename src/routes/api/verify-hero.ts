import { createFileRoute } from "@tanstack/react-router";
import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";

const PUBLISHED_URL = "https://dreamscape-builder-co.lovable.app/";

type CheckResult = {
  key: string;
  expected: string;
  found: boolean;
};

/**
 * GET /api/verify-hero
 *
 * Fetches the live published homepage and verifies that every hero string
 * (eyebrow, headline lines, subheadline, CTAs, microcopy) from the current
 * source `HERO_COPY` is present verbatim in the rendered HTML.
 *
 * Optional `?url=` query param overrides the target (e.g. preview URL).
 */
export const Route = createFileRoute("/api/verify-hero")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const target = url.searchParams.get("url") ?? PUBLISHED_URL;

        let html = "";
        let liveVersion: string | null = null;
        let status = 0;

        try {
          const res = await fetch(target, {
            headers: { "cache-control": "no-cache" },
          });
          status = res.status;
          liveVersion = res.headers.get("x-hero-copy-version");
          html = await res.text();
        } catch (err) {
          return Response.json(
            {
              ok: false,
              error: `Failed to fetch ${target}: ${(err as Error).message}`,
              target,
            },
            { status: 502 },
          );
        }

        // Decode common HTML entities so verbatim string matching works against
        // SSR output that may have escaped quotes, dashes, or middots.
        const decoded = html
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          .replace(/&middot;/g, "·")
          .replace(/&mdash;/g, "—")
          .replace(/&ndash;/g, "–")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">");

        const checks: CheckResult[] = (
          [
            "eyebrow",
            "headlineLine1",
            "headlineLine2",
            "subheadline",
            "primaryCta",
            "secondaryCta",
            "microcopy",
          ] as const
        ).map((key) => ({
          key,
          expected: HERO_COPY[key],
          found: decoded.includes(HERO_COPY[key]),
        }));

        const missing = checks.filter((c) => !c.found);
        const ok = missing.length === 0 && status === 200;
        const versionMatch =
          liveVersion === null ? null : liveVersion === HERO_COPY_VERSION;

        return Response.json(
          {
            ok,
            target,
            httpStatus: status,
            sourceVersion: HERO_COPY_VERSION,
            liveVersion,
            versionMatch,
            checks,
            missing: missing.map((c) => ({ key: c.key, expected: c.expected })),
            checkedAt: new Date().toISOString(),
          },
          {
            status: ok ? 200 : 409,
            headers: { "cache-control": "no-store" },
          },
        );
      },
    },
  },
});
