import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { runTourImport } from "@/server/tourImporter.functions";
import {
  listMappingRules,
  saveMappingRules,
  deleteMappingRules,
} from "@/server/mappingRules.functions";
import { DEFAULT_MAPPING_RULES } from "@/data/defaultMappingRules";
import { toast } from "sonner";
import { Loader2, RefreshCw, Check, AlertTriangle, Sliders, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/import-tours")({
  head: () => ({
    meta: [{ title: "Import Tours — Studio Admin" }],
  }),
  component: AdminImportPage,
});

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];

type ImportedRow = {
  id: string;
  title: string;
  region_label: string;
  duration_label: string;
  duration_hours: string;
  price_from: number;
  theme: string;
  styles: string[];
  highlights: string[];
  pace: string;
  tier: string;
  fits_best: string;
  blurb: string;
  stops: { label: string; tag: string; x: number; y: number }[];
  imported_at: string;
};

function AdminImportPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tours, setTours] = useState<ImportedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    status: string;
    toursImported: number;
    toursFailed: number;
    errors: string[];
  } | null>(null);

  const runImport = useServerFn(runTourImport);
  const callListRules = useServerFn(listMappingRules);
  const callSaveRules = useServerFn(saveMappingRules);
  const callDeleteRules = useServerFn(deleteMappingRules);

  type RuleRow = {
    id: string;
    name: string;
    notes: string | null;
    rules: unknown;
    is_active: boolean;
    updated_at: string;
  };
  const [rulesList, setRulesList] = useState<RuleRow[]>([]);
  const [editingRuleId, setEditingRuleId] = useState<string | "new" | null>(null);
  const [ruleDraft, setRuleDraft] = useState<{
    name: string;
    notes: string;
    json: string;
    isActive: boolean;
  }>({ name: "", notes: "", json: JSON.stringify(DEFAULT_MAPPING_RULES, null, 2), isActive: false });
  const [savingRules, setSavingRules] = useState(false);

  const refreshRules = async () => {
    try {
      const r = await callListRules();
      setRulesList(r.rules as RuleRow[]);
    } catch (e) {
      // silent — admin gate handles auth errors below
    }
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (!data.session) navigate({ to: "/auth" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) navigate({ to: "/auth" });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  // Check admin role + load existing tours.
  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!roleRow);

      const { data: rows } = await supabase
        .from("imported_tours")
        .select(
          "id,title,region_label,duration_label,duration_hours,price_from,theme,styles,highlights,pace,tier,fits_best,blurb,stops,imported_at"
        )
        .order("imported_at", { ascending: false });
      setTours((rows as ImportedRow[]) ?? []);
    })();
  }, [session]);

  const onImport = async () => {
    setLoading(true);
    setLastResult(null);
    try {
      const result = await runImport();
      setLastResult({
        status: result.status,
        toursImported: result.toursImported,
        toursFailed: result.toursFailed,
        errors: result.errors,
      });
      const { data: rows } = await supabase
        .from("imported_tours")
        .select(
          "id,title,region_label,duration_label,duration_hours,price_from,theme,styles,highlights,pace,tier,fits_best,blurb,stops,imported_at"
        )
        .order("imported_at", { ascending: false });
      setTours((rows as ImportedRow[]) ?? []);
      if (result.status === "success") toast.success(`Imported ${result.toursImported} tours`);
      else if (result.status === "partial")
        toast.warning(`Imported ${result.toursImported}, ${result.toursFailed} failed`);
      else toast.error("Import failed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const headerLine = useMemo(() => {
    if (!session) return "";
    return session.user.email ?? session.user.id;
  }, [session]);

  if (!session) return null; // redirecting

  if (isAdmin === false) {
    return (
      <SiteLayout>
        <section className="pt-32 pb-20 min-h-[70vh]">
          <div className="container-x max-w-xl">
            <span className="eyebrow">Studio Admin</span>
            <h1 className="serif text-4xl mt-4">Admin only</h1>
            <p className="mt-4 text-[color:var(--charcoal-soft)]">
              Your account ({headerLine}) doesn't have the <code>admin</code> role yet.
              Ask the workspace owner to grant it via the database.
            </p>
            <button
              onClick={signOut}
              className="mt-8 border border-[color:var(--border)] hover:border-[color:var(--gold)] px-5 py-3 text-sm"
            >
              Sign out
            </button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="pt-32 pb-20">
        <div className="container-x max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Studio Admin</span>
              <h1 className="serif text-4xl mt-4">Import Tours</h1>
              <p className="mt-3 text-sm text-[color:var(--charcoal-soft)] max-w-xl">
                Fetches the live YES experiences catalog, maps each tour to builder
                regions, durations, signature moments and stop coordinates with AI,
                and saves them to the database.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[color:var(--charcoal-soft)]">
              <span>{headerLine}</span>
              <button
                onClick={signOut}
                className="border border-[color:var(--border)] hover:border-[color:var(--gold)] px-3 py-1.5"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onImport}
              disabled={loading || isAdmin !== true}
              className="inline-flex items-center justify-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] disabled:opacity-60 text-[color:var(--ivory)] px-6 py-3 text-sm tracking-wide transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {loading ? "Importing…" : "Run import now"}
            </button>
            <Link
              to="/experiences"
              className="inline-flex items-center justify-center border border-[color:var(--border)] hover:border-[color:var(--gold)] px-6 py-3 text-sm"
            >
              View public Signature page
            </Link>
          </div>

          {lastResult && (
            <div
              className={`mt-6 p-4 border ${
                lastResult.status === "success"
                  ? "border-[color:var(--teal)]/40 bg-[color:var(--teal)]/5"
                  : lastResult.status === "partial"
                    ? "border-[color:var(--gold)]/60 bg-[color:var(--gold)]/10"
                    : "border-red-400/60 bg-red-50"
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                {lastResult.status === "success" ? (
                  <Check size={16} className="text-[color:var(--teal)]" />
                ) : (
                  <AlertTriangle size={16} className="text-[color:var(--gold)]" />
                )}
                <span className="font-medium uppercase tracking-[0.18em] text-xs">
                  {lastResult.status}
                </span>
                <span className="text-[color:var(--charcoal-soft)]">
                  {lastResult.toursImported} imported · {lastResult.toursFailed} failed
                </span>
              </div>
              {lastResult.errors.length > 0 && (
                <ul className="mt-3 text-xs text-[color:var(--charcoal-soft)] list-disc pl-5 space-y-1">
                  {lastResult.errors.slice(0, 5).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <h2 className="serif text-2xl mt-12">
            Imported tours <span className="text-sm text-[color:var(--charcoal-soft)]">({tours.length})</span>
          </h2>

          {tours.length === 0 ? (
            <p className="mt-4 text-sm text-[color:var(--charcoal-soft)]">
              Nothing imported yet. Click <strong>Run import now</strong> to fetch.
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {tours.map((t) => (
                <li
                  key={t.id}
                  className="border border-[color:var(--border)] p-5 bg-[color:var(--card)]"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="serif text-xl">{t.title}</h3>
                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--charcoal-soft)]">
                      <span>{t.region_label}</span>
                      <span>{t.duration_label} · {t.duration_hours}</span>
                      <span className="text-[color:var(--teal)]">€{t.price_from}+</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--charcoal-soft)]">{t.blurb}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                    Fits best · {t.fits_best}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Tag>{t.theme}</Tag>
                    <Tag>{t.pace}</Tag>
                    <Tag>{t.tier}</Tag>
                    {t.styles.map((s) => <Tag key={s}>{s}</Tag>)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.highlights.map((h) => (
                      <span key={h} className="text-[11px] px-2 py-0.5 border border-[color:var(--gold)]/40 text-[color:var(--charcoal)]">
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-[color:var(--charcoal-soft)]">
                    Stops: {t.stops.map((s) => s.label).join(" → ")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] uppercase tracking-[0.18em] px-2 py-0.5 bg-[color:var(--sand)] text-[color:var(--charcoal-soft)]">
      {children}
    </span>
  );
}
