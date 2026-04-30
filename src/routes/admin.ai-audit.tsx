import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UsageRow {
  id: string;
  created_at: string;
  provider: string;
  model: string | null;
  feature: string;
  status: string;
  latency_ms: number | null;
  error_code: string | null;
  error_message: string | null;
}

interface Stats {
  total: number;
  success: number;
  failures: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  avgLatency: number | null;
  byProvider: Record<string, number>;
}

function statusColor(s: string) {
  if (s === "success") return "text-emerald-700 bg-emerald-50";
  if (s === "rate_limited") return "text-amber-800 bg-amber-50";
  if (s === "fallback") return "text-stone-700 bg-stone-100";
  return "text-rose-700 bg-rose-50";
}

function AuditPage() {
  const [rows, setRows] = useState<UsageRow[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        if (active) setAllowed(false);
        return;
      }
      // Try to read; RLS will reject non-admins
      const { data, error } = await supabase
        .from("ai_usage_logs")
        .select("id,created_at,provider,model,feature,status,latency_ms,error_code,error_message")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!active) return;
      if (error) {
        setAllowed(false);
        setError(error.message);
        return;
      }
      setAllowed(true);
      const list = (data ?? []) as UsageRow[];
      setRows(list);

      const success = list.filter((r) => r.status === "success");
      const failures = list.filter((r) => r.status === "failure" || r.status === "rate_limited");
      const byProvider = list.reduce<Record<string, number>>((acc, r) => {
        acc[r.provider] = (acc[r.provider] ?? 0) + 1;
        return acc;
      }, {});
      const latencies = list.map((r) => r.latency_ms).filter((n): n is number => n !== null);
      setStats({
        total: list.length,
        success: success.length,
        failures: failures.length,
        lastSuccessAt: success[0]?.created_at ?? null,
        lastFailureAt: failures[0]?.created_at ?? null,
        avgLatency: latencies.length
          ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
          : null,
        byProvider,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  if (allowed === false) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-[#2E2E2E]">Admins only</h1>
        <p className="mt-3 text-sm text-[#2E2E2E]/70">
          {error ?? "You need an admin account to view this page."}
        </p>
        <Link to="/" className="mt-6 inline-block text-sm underline underline-offset-4">
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F3] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-3xl text-[#2E2E2E]">AI usage audit</h1>
          <Link to="/" className="text-sm text-[#2E2E2E]/70 underline underline-offset-4">
            Home
          </Link>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-[#2E2E2E]/70">
          Every narrative generation call is logged here. The API key value is never stored.
        </p>

        {stats && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total calls" value={String(stats.total)} />
            <Stat label="Successful" value={String(stats.success)} />
            <Stat label="Failures" value={String(stats.failures)} />
            <Stat
              label="Avg latency"
              value={stats.avgLatency !== null ? `${stats.avgLatency} ms` : "—"}
            />
            <Stat
              label="Last success"
              value={stats.lastSuccessAt ? new Date(stats.lastSuccessAt).toLocaleString() : "—"}
            />
            <Stat
              label="Last failure"
              value={stats.lastFailureAt ? new Date(stats.lastFailureAt).toLocaleString() : "—"}
            />
            <Stat
              label="By provider"
              value={
                Object.entries(stats.byProvider)
                  .map(([k, v]) => `${k} ${v}`)
                  .join(" · ") || "—"
              }
            />
          </div>
        )}

        <div className="mt-10 overflow-hidden rounded-2xl border border-[#2E2E2E]/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F3] text-xs uppercase tracking-wider text-[#2E2E2E]/60">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Error</th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#2E2E2E]/50">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#2E2E2E]/50">
                    No calls yet. Generate a narrative in the Builder to populate this list.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-[#2E2E2E]/5">
                    <td className="px-4 py-3 text-[#2E2E2E]/80">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{r.provider}</td>
                    <td className="px-4 py-3 text-[#2E2E2E]/70">{r.model ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#2E2E2E]/70">
                      {r.latency_ms !== null ? `${r.latency_ms} ms` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#2E2E2E]/60">
                      {r.error_code ? `${r.error_code}${r.error_message ? ` · ${r.error_message}` : ""}` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#2E2E2E]/10 bg-white px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-[#2E2E2E]/50">{label}</div>
      <div className="mt-1 font-serif text-base text-[#2E2E2E]">{value}</div>
    </div>
  );
}

export const Route = createFileRoute("/admin/ai-audit")({
  head: () => ({
    meta: [
      { title: "AI usage audit · YesExperiences" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuditPage,
});
