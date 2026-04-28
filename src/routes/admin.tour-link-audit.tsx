import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auditTourLinks } from "@/server/tourLinkAudit.functions";
import type { TourLinkAuditReport } from "@/server/tourLinkAudit.server";
import { SiteLayout } from "@/components/SiteLayout";
import { AlertTriangle, Check, RefreshCw, FileSearch, Link2Off, HelpCircle, FileCode2 } from "lucide-react";

export const Route = createFileRoute("/admin/tour-link-audit")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw new Error("Tour link audit is only available in development.");
    }
  },
  component: TourLinkAuditPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <SiteLayout>
        <section className="pt-32 pb-20 min-h-[60vh]">
          <div className="container-x max-w-2xl">
            <h1 className="serif text-3xl">Audit failed</h1>
            <p className="mt-4 text-sm text-[color:var(--charcoal-soft)]">
              {error.message}
            </p>
            <button
              type="button"
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="mt-6 inline-flex items-center gap-2 border border-[color:var(--border)] px-4 py-2 text-sm hover:border-[color:var(--gold)]"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </section>
      </SiteLayout>
    );
  },
  notFoundComponent: () => (
    <SiteLayout>
      <section className="pt-32 pb-20 min-h-[60vh]">
        <div className="container-x max-w-xl">
          <h1 className="serif text-3xl">Not available</h1>
          <p className="mt-4 text-sm text-[color:var(--charcoal-soft)]">
            The link audit is only available in development builds.
          </p>
          <Link to="/" className="mt-6 inline-block text-sm underline">
            Back home
          </Link>
        </div>
      </section>
    </SiteLayout>
  ),
});

function TourLinkAuditPage() {
  const isDev = import.meta.env.DEV;
  const [report, setReport] = useState<TourLinkAuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditTourLinks();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDev) void run();
  }, [isDev]);

  if (!isDev) {
    return (
      <SiteLayout>
        <section className="pt-32 pb-20 min-h-[60vh]">
          <div className="container-x max-w-xl">
            <h1 className="serif text-3xl">Not available</h1>
            <p className="mt-4 text-sm text-[color:var(--charcoal-soft)]">
              The tour link audit only runs in development builds.
            </p>
            <Link to="/" className="mt-6 inline-block text-sm underline">
              Back home
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const invalid = report?.invalidReferences ?? [];
  const allClean = !!report && invalid.length === 0;

  return (
    <SiteLayout>
      <section className="pt-28 pb-20 min-h-[80vh]">
        <div className="container-x max-w-4xl">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[color:var(--charcoal-soft)]">
            <FileSearch size={12} /> Dev tool
          </div>
          <h1 className="serif text-3xl sm:text-4xl mt-3">Tour link audit</h1>
          <p className="mt-3 text-sm text-[color:var(--charcoal-soft)] max-w-xl leading-relaxed">
            Scans every <code>.ts/.tsx/.js/.jsx/.mdx</code> file under{" "}
            <code>src/</code> for internal <code>/tours/$tourId</code> references
            and verifies each id exists in the catalog (<code>signatureTours</code>).
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={run}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-[color:var(--border)] hover:border-[color:var(--gold)] px-4 py-2 text-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Scanning…" : "Re-run scan"}
            </button>
            {report && (
              <span className="text-xs text-[color:var(--charcoal-soft)]">
                Last run: {new Date(report.scannedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          {error && (
            <div className="mt-6 border border-red-300 bg-red-50 p-4 text-sm text-red-800">
              <strong>Audit error:</strong> {error}
            </div>
          )}

          {report && (
            <>
              {/* Summary */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Files scanned" value={report.scannedFiles} />
                <Stat label="Catalog tours" value={report.catalogIds.length} />
                <Stat label="References" value={report.totalReferences} />
                <Stat
                  label="Invalid"
                  value={invalid.length}
                  tone={invalid.length === 0 ? "good" : "bad"}
                />
              </div>

              {/* Status banner */}
              <div
                className={`mt-6 flex items-start gap-3 p-4 border ${
                  allClean
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-amber-300 bg-amber-50 text-amber-900"
                }`}
              >
                {allClean ? (
                  <Check size={18} className="mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                )}
                <div className="text-sm leading-relaxed">
                  {allClean ? (
                    <>
                      All {report.totalReferences} tour links resolve to a real
                      catalog id. No mismatches.
                    </>
                  ) : (
                    <>
                      Found <strong>{invalid.length}</strong> reference
                      {invalid.length === 1 ? "" : "s"} to tour ids that don't
                      exist in the catalog. Fix the files below.
                    </>
                  )}
                </div>
              </div>

              {/* Invalid references */}
              {invalid.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xs uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] flex items-center gap-2">
                    <Link2Off size={12} /> Invalid references
                  </h2>
                  <ul className="mt-3 divide-y divide-[color:var(--border)] border border-[color:var(--border)]">
                    {invalid.map((hit, i) => (
                      <li key={`${hit.file}:${hit.line}:${i}`} className="p-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="font-mono text-[12px] bg-[color:var(--sand)]/60 px-1.5 py-0.5">
                            {hit.tourId}
                          </code>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
                            {hit.source}
                          </span>
                        </div>
                        <div className="mt-1 text-[12px] text-[color:var(--charcoal-soft)] font-mono break-all">
                          {hit.file}:{hit.line}
                        </div>
                        <pre className="mt-2 text-[12px] bg-[color:var(--sand)]/40 p-2 overflow-x-auto whitespace-pre-wrap break-all">
                          {hit.snippet}
                        </pre>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unreferenced catalog ids — informational */}
              {report.unreferencedCatalogIds.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xs uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
                    Catalog tours with no in-source references
                  </h2>
                  <p className="mt-2 text-xs text-[color:var(--charcoal-soft)]">
                    These exist in the catalog but no source file links to them
                    by literal id. They are still reachable when iterating{" "}
                    <code>signatureTours</code> dynamically.
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {report.unreferencedCatalogIds.map((id) => (
                      <li
                        key={id}
                        className="text-[12px] font-mono border border-[color:var(--border)] px-2 py-0.5"
                      >
                        {id}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.warnings.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xs uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
                    Warnings
                  </h2>
                  <ul className="mt-2 text-xs text-[color:var(--charcoal-soft)] list-disc pl-5 space-y-1">
                    {report.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <RouteTreeTroubleshooting />
        </div>
      </section>
    </SiteLayout>
  );
}

type RouteTreeProbe = {
  status: "loading" | "ok" | "error";
  routeCount?: number;
  hasAuditRoute?: boolean;
  error?: string;
};

function RouteTreeTroubleshooting() {
  const [probe, setProbe] = useState<RouteTreeProbe>({ status: "loading" });

  const probeRouteTree = async () => {
    setProbe({ status: "loading" });
    try {
      // Dynamic import so a generator failure surfaces here instead of crashing the page.
      const mod: any = await import("@/routeTree.gen");
      const tree = mod.routeTree;
      const ids: string[] = [];
      const walk = (node: any) => {
        if (!node) return;
        if (node.id) ids.push(node.id);
        const children = node.children
          ? Array.isArray(node.children)
            ? node.children
            : Object.values(node.children)
          : [];
        for (const c of children) walk(c);
      };
      walk(tree);
      setProbe({
        status: "ok",
        routeCount: ids.length,
        hasAuditRoute: ids.some((id) => id.includes("admin/tour-link-audit")),
      });
    } catch (err) {
      setProbe({
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  useEffect(() => {
    void probeRouteTree();
  }, []);

  const toneBorder =
    probe.status === "ok"
      ? probe.hasAuditRoute
        ? "border-emerald-300 bg-emerald-50"
        : "border-amber-300 bg-amber-50"
      : probe.status === "error"
        ? "border-red-300 bg-red-50"
        : "border-[color:var(--border)] bg-[color:var(--sand)]/40";

  return (
    <div className="mt-12 border border-[color:var(--border)] p-5">
      <h2 className="text-xs uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)] flex items-center gap-2">
        <HelpCircle size={12} /> Troubleshooting · route crawler
      </h2>

      <div className={`mt-4 border p-4 text-sm ${toneBorder}`}>
        <div className="flex items-center gap-2 font-medium">
          <FileCode2 size={14} />
          <code className="font-mono text-[12px]">src/routeTree.gen.ts</code>
          <span className="ml-auto text-[10px] uppercase tracking-[0.2em]">
            {probe.status}
          </span>
        </div>

        {probe.status === "loading" && (
          <p className="mt-2 text-xs text-[color:var(--charcoal-soft)]">
            Probing generated route tree…
          </p>
        )}

        {probe.status === "ok" && (
          <ul className="mt-2 text-xs space-y-1">
            <li>
              <strong>Routes registered:</strong> {probe.routeCount}
            </li>
            <li>
              <strong>/admin/tour-link-audit present:</strong>{" "}
              {probe.hasAuditRoute ? "yes ✓" : "no — crawler missed this file"}
            </li>
          </ul>
        )}

        {probe.status === "error" && (
          <div className="mt-2 text-xs">
            <p className="font-medium text-red-900">Failed to load route tree.</p>
            <pre className="mt-2 bg-white/60 p-2 overflow-x-auto whitespace-pre-wrap break-all text-[11px]">
              {probe.error}
            </pre>
          </div>
        )}

        <button
          type="button"
          onClick={probeRouteTree}
          className="mt-3 inline-flex items-center gap-2 border border-[color:var(--border)] hover:border-[color:var(--gold)] px-3 py-1.5 text-xs"
        >
          <RefreshCw size={12} /> Re-probe
        </button>
      </div>

      <div className="mt-5 text-xs text-[color:var(--charcoal-soft)] leading-relaxed space-y-3">
        <p>
          <strong className="text-[color:var(--charcoal)]">Why crawling fails.</strong>{" "}
          The TanStack Router Vite plugin statically parses files in{" "}
          <code>src/routes/</code> and writes <code>src/routeTree.gen.ts</code>{" "}
          before TS checks. If parsing fails, the generated tree goes stale and
          paths like <code>/admin/tour-link-audit</code> raise{" "}
          <code>TS2345 — not assignable to keyof FileRoutesByPath</code>.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>Non-literal route path.</strong>{" "}
            <code>createFileRoute()</code> requires a plain string literal —
            never a variable, template string, or <code>as</code> cast.
          </li>
          <li>
            <strong>File name ≠ route path.</strong> Use dot-separated flat
            files: <code>admin.tour-link-audit.tsx</code> →{" "}
            <code>/admin/tour-link-audit</code>. Trailing slashes break it.
          </li>
          <li>
            <strong>Syntax / JSX errors</strong> in any route file abort the
            entire crawl, not just that file.
          </li>
          <li>
            <strong>Manual edits to <code>routeTree.gen.ts</code></strong> are
            overwritten on every dev reload — never edit it.
          </li>
          <li>
            <strong>Stale dev cache.</strong> If the probe above shows the route
            missing while the file exists, restart the dev server to force a
            re-crawl.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "good" | "bad";
}) {
  const toneClasses =
    tone === "good"
      ? "border-emerald-300 text-emerald-900 bg-emerald-50"
      : tone === "bad" && value > 0
        ? "border-red-300 text-red-900 bg-red-50"
        : "border-[color:var(--border)]";
  return (
    <div className={`border p-3 ${toneClasses}`}>
      <div className="text-[10px] uppercase tracking-[0.22em] opacity-70">{label}</div>
      <div className="mt-1 serif text-2xl">{value}</div>
    </div>
  );
}
