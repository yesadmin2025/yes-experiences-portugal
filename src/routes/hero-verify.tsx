import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";

type CheckResult = {
  key: string;
  expected: string;
  found: boolean;
};

type VerifyResponse = {
  ok: boolean;
  target: string;
  httpStatus: number;
  sourceVersion: string;
  liveVersion: string | null;
  versionMatch: boolean | null;
  checks: CheckResult[];
  missing: { key: string; expected: string }[];
  checkedAt: string;
  error?: string;
};

export const Route = createFileRoute("/hero-verify")({
  head: () => ({
    meta: [
      { title: "Verify Live Hero Copy — Internal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: HeroVerifyPage,
});

function HeroVerifyPage() {
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetOverride, setTargetOverride] = useState("");

  const runCheck = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const qs = targetOverride.trim()
        ? `?url=${encodeURIComponent(targetOverride.trim())}`
        : "";
      const res = await fetch(`/api/verify-hero${qs}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as VerifyResponse;
      setResult(json);
    } catch (err) {
      setResult({
        ok: false,
        target: targetOverride || "(default)",
        httpStatus: 0,
        sourceVersion: HERO_COPY_VERSION,
        liveVersion: null,
        versionMatch: null,
        checks: [],
        missing: [],
        checkedAt: new Date().toISOString(),
        error: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, [targetOverride]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 font-sans">
      <h1 className="text-2xl font-semibold tracking-tight">
        Verify Live Hero Copy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        After clicking <strong>Publish → Update</strong>, run this check to
        confirm the live deployment matches the current source strings.
      </p>

      <div className="mt-6 space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Target URL (optional — defaults to published site)
        </label>
        <input
          type="url"
          value={targetOverride}
          onChange={(e) => setTargetOverride(e.target.value)}
          placeholder="https://your-site.lovable.app/"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={runCheck}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition disabled:opacity-50"
        >
          {loading ? "Checking…" : "Run check now"}
        </button>
        <p className="text-xs text-muted-foreground">
          Source version: <code>{HERO_COPY_VERSION}</code>
        </p>
      </div>

      {result && (
        <section className="mt-8 space-y-4">
          <div
            className={`rounded-lg border p-4 ${
              result.ok
                ? "border-green-500/40 bg-green-500/5"
                : "border-red-500/40 bg-red-500/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-block size-2.5 rounded-full ${
                  result.ok ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <strong className="text-sm">
                {result.ok ? "All strings match live" : "Mismatch detected"}
              </strong>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <dt className="text-muted-foreground">HTTP status</dt>
              <dd>{result.httpStatus || "—"}</dd>
              <dt className="text-muted-foreground">Source version</dt>
              <dd>
                <code>{result.sourceVersion}</code>
              </dd>
              <dt className="text-muted-foreground">Live version</dt>
              <dd>
                <code>{result.liveVersion ?? "(not exposed)"}</code>
                {result.versionMatch === false && (
                  <span className="ml-2 text-red-600">stale</span>
                )}
                {result.versionMatch === true && (
                  <span className="ml-2 text-green-600">match</span>
                )}
              </dd>
              <dt className="text-muted-foreground">Target</dt>
              <dd className="truncate">{result.target}</dd>
              <dt className="text-muted-foreground">Checked at</dt>
              <dd>{new Date(result.checkedAt).toLocaleTimeString()}</dd>
            </dl>
            {result.error && (
              <p className="mt-3 text-xs text-red-600">{result.error}</p>
            )}
          </div>

          <ul className="divide-y divide-border rounded-lg border border-border">
            {result.checks.map((c) => (
              <li
                key={c.key}
                className="flex items-start gap-3 px-4 py-3 text-sm"
              >
                <span
                  className={`mt-1 inline-block size-2 shrink-0 rounded-full ${
                    c.found ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{c.key}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {HERO_COPY[c.key as keyof typeof HERO_COPY]}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${
                    c.found ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {c.found ? "found" : "MISSING"}
                </span>
              </li>
            ))}
          </ul>

          {!result.ok && result.liveVersion !== result.sourceVersion && (
            <p className="rounded-md bg-amber-500/10 p-3 text-xs text-amber-700">
              Live version doesn't match source — click{" "}
              <strong>Publish → Update</strong> in the editor and re-run.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
