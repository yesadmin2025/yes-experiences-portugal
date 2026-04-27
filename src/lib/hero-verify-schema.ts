/**
 * Schema validator for `hero-verify-report/v3` — the JSON/CSV payload
 * produced by `HeroVerifyOverlay`'s "Export report" buttons.
 *
 * Both export handlers must call `validateReportV3(payload)` BEFORE
 * triggering the file download. If the payload doesn't conform, the
 * download is aborted and the user sees the formatted issues — this
 * guarantees no malformed audit artifacts ever leave the browser.
 *
 * The CSV exporter validates the same in-memory object that's used to
 * build the CSV preamble + rows, so JSON and CSV are validated against
 * one shared schema.
 */
import { z } from "zod";

// ---------- primitives ----------

export const heroSpecKeySchema = z.enum([
  "eyebrow",
  "headlineLine1",
  "headlineLine2",
  "subheadline",
  "primaryCta",
  "secondaryCta",
  "microcopy",
]);

export const fieldStatusSchema = z.enum(["match", "loose", "mismatch", "missing"]);

export const diffSegmentSchema = z.object({
  type: z.enum(["equal", "removed", "added"]),
  text: z.string(),
});

// ---------- nested blocks ----------

export const summarySchema = z.object({
  match: z.number().int().nonnegative(),
  loose: z.number().int().nonnegative(),
  mismatch: z.number().int().nonnegative(),
  missing: z.number().int().nonnegative(),
});

export const fieldSchema = z.object({
  key: heroSpecKeySchema,
  status: fieldStatusSchema,
  expected: z.string(),
  actual: z.string().nullable(),
  diff: z.array(diffSegmentSchema),
  diffInline: z.string(),
});

export const auditDivergenceSchema = z.object({
  key: z.string(),
  reason: z.string(),
  live: z.array(diffSegmentSchema).nullable(),
  exported: z.array(diffSegmentSchema).nullable(),
});

export const auditSchema = z.object({
  selfCheck: z.object({
    ok: z.boolean(),
    ranAt: z.string().datetime({ offset: true }),
    checkedFields: z.number().int().nonnegative(),
    divergentFields: z.number().int().nonnegative(),
    outcome: z.enum(["passed", "confirmed", "blocked"]),
    divergences: z.array(auditDivergenceSchema),
  }),
});

// ---------- root ----------

export const reportV3Schema = z
  .object({
    schema: z.literal("hero-verify-report/v3"),
    generatedAt: z.string().datetime({ offset: true }),
    url: z.string().url(),
    pathname: z.string().startsWith("/"),
    heroCopyVersion: z.string().min(1),
    viewport: z.object({
      width: z.number().positive(),
      height: z.number().positive(),
      devicePixelRatio: z.number().positive(),
    }),
    ok: z.boolean(),
    summary: summarySchema,
    audit: auditSchema,
    fields: z.array(fieldSchema).min(1),
  })
  // Cross-field invariants: summary counts must equal field-status tallies,
  // and the divergence tally must equal divergences.length. These cheap
  // checks catch logic drift in the exporter that the structural schema
  // alone wouldn't notice.
  .superRefine((value, ctx) => {
    const tally: Record<z.infer<typeof fieldStatusSchema>, number> = {
      match: 0,
      loose: 0,
      mismatch: 0,
      missing: 0,
    };
    for (const f of value.fields) tally[f.status] += 1;
    (Object.keys(tally) as Array<keyof typeof tally>).forEach((status) => {
      if (tally[status] !== value.summary[status]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["summary", status],
          message: `summary.${status}=${value.summary[status]} but ${tally[status]} field(s) actually have status="${status}"`,
        });
      }
    });
    const sc = value.audit.selfCheck;
    if (sc.divergentFields !== sc.divergences.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["audit", "selfCheck", "divergentFields"],
        message: `divergentFields=${sc.divergentFields} but divergences[] has ${sc.divergences.length} entries`,
      });
    }
    if (sc.ok && sc.divergences.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["audit", "selfCheck", "ok"],
        message: `selfCheck.ok=true but divergences[] is non-empty`,
      });
    }
    if (!sc.ok && sc.outcome === "passed") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["audit", "selfCheck", "outcome"],
        message: `outcome="passed" requires selfCheck.ok=true`,
      });
    }
  });

export type ReportV3 = z.infer<typeof reportV3Schema>;

// ---------- public API ----------

export type ValidationIssue = { path: string; message: string };

export type ValidationResult =
  | { ok: true; data: ReportV3 }
  | { ok: false; issues: ValidationIssue[] };

/**
 * Validate an in-memory payload against `hero-verify-report/v3`.
 * Returns a discriminated union so callers can either proceed with a
 * statically-typed `data` (passes) or surface `issues` to the user
 * (failures) without throwing.
 */
export function validateReportV3(payload: unknown): ValidationResult {
  const parsed = reportV3Schema.safeParse(payload);
  if (parsed.success) return { ok: true, data: parsed.data };
  const issues: ValidationIssue[] = parsed.error.issues.map((i) => ({
    path: i.path.length === 0 ? "(root)" : i.path.join("."),
    message: i.message,
  }));
  return { ok: false, issues };
}

/**
 * Format issues for a console.warn / alert / on-screen list.
 */
export function formatIssues(issues: ValidationIssue[]): string {
  return issues.map((i) => `• ${i.path}: ${i.message}`).join("\n");
}
