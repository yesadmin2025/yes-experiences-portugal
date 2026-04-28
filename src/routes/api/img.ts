/**
 * Optional image proxy for imported tour images.
 *
 * - Restricts upstream to an allowlist (yesexperiences.pt) so the route can't
 *   be used as an open relay.
 * - Forwards modern Accept formats (AVIF/WebP) so upstream returns the
 *   smallest variant the browser supports.
 * - Sets long-lived `Cache-Control` + `CDN-Cache-Control` so the Worker edge
 *   caches aggressively after the first hit, dramatically speeding up
 *   repeat loads of preview cards.
 * - Accepts `?w=` and `?q=` hints that are folded into the cache key today
 *   and can drive a real resizer later (e.g. Cloudflare Image Resizing) without
 *   changing any callers.
 *
 * Usage:  /api/img?u=<encoded https URL>&w=800
 */
import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_HOSTS = new Set(["yesexperiences.pt", "www.yesexperiences.pt"]);
const ALLOWED_EXT = /\.(avif|webp|jpe?g|png)$/i;
// 30 days at the edge, 7 days in the browser. Imported tour images are
// content-addressed by WordPress filename so safe to cache for a long time.
const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=604800, immutable",
  "CDN-Cache-Control": "public, max-age=2592000",
} as const;

function badRequest(msg: string): Response {
  return new Response(msg, { status: 400, headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/img")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const target = url.searchParams.get("u");
        if (!target) return badRequest("Missing ?u=");

        let upstream: URL;
        try {
          upstream = new URL(target);
        } catch {
          return badRequest("Invalid URL");
        }
        if (upstream.protocol !== "https:") return badRequest("HTTPS only");
        if (!ALLOWED_HOSTS.has(upstream.hostname)) return badRequest("Host not allowed");
        if (!ALLOWED_EXT.test(upstream.pathname)) return badRequest("Extension not allowed");

        // Forward the browser's modern format preferences so upstream/Cloudflare
        // can serve AVIF or WebP when available.
        const accept =
          request.headers.get("Accept") ?? "image/avif,image/webp,image/*,*/*;q=0.8";

        const upstreamRes = await fetch(upstream.toString(), {
          headers: {
            Accept: accept,
            "User-Agent":
              "Mozilla/5.0 (compatible; YesExperiencesImageProxy/1.0; +https://yesexperiences.pt)",
            Referer: "https://yesexperiences.pt/",
          },
          // Let the platform cache this response.
          cf: { cacheEverything: true, cacheTtl: 2592000 },
        } as RequestInit);

        if (!upstreamRes.ok || !upstreamRes.body) {
          return new Response("Upstream error", {
            status: upstreamRes.status || 502,
            headers: { "Cache-Control": "no-store" },
          });
        }

        const headers = new Headers();
        const contentType = upstreamRes.headers.get("Content-Type") ?? "image/jpeg";
        headers.set("Content-Type", contentType);
        const len = upstreamRes.headers.get("Content-Length");
        if (len) headers.set("Content-Length", len);
        for (const [k, v] of Object.entries(CACHE_HEADERS)) headers.set(k, v);
        // Vary on Accept so AVIF/WebP/JPEG variants don't collide in caches.
        headers.set("Vary", "Accept");

        return new Response(upstreamRes.body, { status: 200, headers });
      },
    },
  },
});
