import { createFileRoute } from "@tanstack/react-router";

/**
 * /api/health — dev/preview readiness probe.
 *
 * Stable, no-auth, no-db endpoint that returns 200 + a small JSON
 * payload as soon as the Worker/SSR runtime is up. Useful for:
 *   - external readiness checks (curl, uptime monitors, the preview
 *     harness, CI smoke tests),
 *   - debugging "is the server actually up?" before chasing app bugs,
 *   - confirming a fresh deploy is reachable.
 *
 * Lives under `/api/` (not `/api/public/`) because it returns no PII
 * and performs no writes — it's a pure liveness probe.
 *
 * Cache-Control: no-store so probes always see the live state.
 */
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            ok: true,
            service: "yes-experiences-portugal",
            // ISO timestamp of when this request was served — handy
            // for spotting stale caches or stuck Workers.
            ts: new Date().toISOString(),
            // Best-effort runtime hint. process.env.NODE_ENV is
            // injected at build time by Vite; defaults to "unknown"
            // if the runtime doesn't expose it.
            env: process.env.NODE_ENV ?? "unknown",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "no-store, no-cache, must-revalidate",
              // Lets the browser/preview iframe call this from any
              // origin without a CORS preflight surprise.
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      },
    },
  },
});
