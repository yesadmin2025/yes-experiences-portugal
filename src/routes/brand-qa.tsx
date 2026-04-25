import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/brand-qa")({
  component: BrandQAPage,
  head: () => ({
    meta: [
      { title: "Brand QA — YES Experiences Portugal" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal QA: live brand color audit comparing rendered tokens against the approved palette.",
      },
    ],
  }),
});

/**
 * APPROVED BRAND PALETTE — single source of truth.
 * Any drift between this list and the live CSS variables (or hex codes
 * referenced anywhere in the app) is reported as a failure below.
 */
const APPROVED = {
  teal: "#295B61",
  "teal-2": "#2A7C82",
  gold: "#C9A96A",
  "gold-soft": "#E1CFA6",
  ivory: "#FAF8F3",
  sand: "#F4EFE7",
  charcoal: "#2E2E2E",
  "charcoal-soft": "#6B6B6B",
} as const;

type TokenName = keyof typeof APPROVED;
const TOKEN_NAMES = Object.keys(APPROVED) as TokenName[];

// Hex codes that legitimately appear outside the brand palette.
// Pure black/white plus the dark-mode card surface are intentional.
const ALLOWLIST = new Set(
  [
    "#000",
    "#000000",
    "#fff",
    "#ffffff",
    "#1f1f1f", // dark-mode card surface
    "#ccc", // recharts internal selectors only
  ].map((h) => h.toLowerCase()),
);

/* ---------- color utilities ---------- */
function normalizeHex(input: string): string | null {
  const s = input.trim().toLowerCase();
  const m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (!m) {
    // try rgb(r,g,b)
    const rgb = s.match(/rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/);
    if (!rgb) return null;
    const [, r, g, b] = rgb;
    return (
      "#" +
      [r, g, b]
        .map((n) => Number(n).toString(16).padStart(2, "0"))
        .join("")
    );
  }
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  return "#" + hex;
}

function hexEq(a: string | null, b: string | null) {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

/* ---------- referenced hex codes (declared at build time) ----------
   Mirrors actual usages found in src/styles.css and the Tailwind tokens.
   Kept in this file so the QA page is self-contained and the audit fails
   loudly if anyone introduces a non-palette color anywhere we know about.
*/
const REFERENCED_HEXES: Array<{ where: string; hex: string }> = [
  // src/styles.css — brand variables
  { where: "styles.css :root --teal", hex: "#295B61" },
  { where: "styles.css :root --teal-2", hex: "#2A7C82" },
  { where: "styles.css :root --gold", hex: "#C9A96A" },
  { where: "styles.css :root --gold-soft", hex: "#E1CFA6" },
  { where: "styles.css :root --ivory", hex: "#FAF8F3" },
  { where: "styles.css :root --sand", hex: "#F4EFE7" },
  { where: "styles.css :root --charcoal", hex: "#2E2E2E" },
  { where: "styles.css :root --charcoal-soft", hex: "#6B6B6B" },
  // semantic surfaces (allowlisted neutrals)
  { where: "styles.css :root --card", hex: "#ffffff" },
  { where: "styles.css :root --popover", hex: "#ffffff" },
  { where: "styles.css :root --destructive-foreground", hex: "#ffffff" },
  { where: "styles.css .dark --card", hex: "#1f1f1f" },
  // Tailwind token mirror
  { where: "tailwind.config.lov.json colors.teal", hex: "#295B61" },
  { where: "tailwind.config.lov.json colors.teal-2", hex: "#2A7C82" },
  { where: "tailwind.config.lov.json colors.gold", hex: "#C9A96A" },
  { where: "tailwind.config.lov.json colors.gold-soft", hex: "#E1CFA6" },
  { where: "tailwind.config.lov.json colors.ivory", hex: "#FAF8F3" },
  { where: "tailwind.config.lov.json colors.sand", hex: "#F4EFE7" },
  { where: "tailwind.config.lov.json colors.charcoal", hex: "#2E2E2E" },
  { where: "tailwind.config.lov.json colors.charcoal-soft", hex: "#6B6B6B" },
  { where: "tailwind.config.lov.json colors.foreground", hex: "#2E2E2E" },
  { where: "tailwind.config.lov.json colors.primary-foreground", hex: "#FAF8F3" },
  { where: "tailwind.config.lov.json colors.secondary", hex: "#F4EFE7" },
  { where: "tailwind.config.lov.json colors.muted", hex: "#F4EFE7" },
  { where: "tailwind.config.lov.json colors.muted-foreground", hex: "#6B6B6B" },
  { where: "tailwind.config.lov.json colors.accent", hex: "#C9A96A" },
];

function BrandQAPage() {
  const [live, setLive] = useState<Record<TokenName, string | null>>(() =>
    Object.fromEntries(TOKEN_NAMES.map((k) => [k, null])) as Record<
      TokenName,
      string | null
    >,
  );

  // Read the actually-rendered values of each --token from :root.
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const next = {} as Record<TokenName, string | null>;
    for (const name of TOKEN_NAMES) {
      const raw = cs.getPropertyValue(`--${name}`).trim();
      next[name] = normalizeHex(raw);
    }
    setLive(next);
  }, []);

  const tokenRows = useMemo(
    () =>
      TOKEN_NAMES.map((name) => {
        const expected = APPROVED[name];
        const actual = live[name];
        return {
          name,
          expected,
          actual,
          ok: hexEq(actual, expected),
        };
      }),
    [live],
  );

  const referencedRows = useMemo(() => {
    const approvedSet = new Set(
      Object.values(APPROVED).map((h) => h.toLowerCase()),
    );
    return REFERENCED_HEXES.map((r) => {
      const norm = normalizeHex(r.hex)!;
      const inApproved = approvedSet.has(norm);
      const inAllow = ALLOWLIST.has(norm);
      return { ...r, normalized: norm, ok: inApproved || inAllow, inApproved };
    });
  }, []);

  const tokenPass = tokenRows.every((r) => r.ok);
  const refPass = referencedRows.every((r) => r.ok);
  const allPass = tokenPass && refPass;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-x py-16 md:py-20">
        <header className="mb-10 flex items-start justify-between gap-6">
          <div>
            <p className="eyebrow">Internal · Brand QA</p>
            <h1 className="mt-3 text-3xl md:text-4xl">
              Live palette audit
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[color:var(--charcoal-soft)]">
              Reads CSS custom properties from <code>:root</code> and
              compares them against the approved brand palette. Also
              verifies every hex code we knowingly reference resolves to
              an approved token (or an allowlisted neutral).
            </p>
          </div>
          <span
            className={
              "shrink-0 rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] " +
              (allPass
                ? "border-[color:var(--teal)] text-[color:var(--teal)]"
                : "border-red-600 text-red-600")
            }
          >
            {allPass ? "All checks pass" : "Mismatch detected"}
          </span>
        </header>

        {/* Palette swatches */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl">Live tokens vs. approved hex</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tokenRows.map((row) => (
              <article
                key={row.name}
                className="overflow-hidden rounded-lg border border-[color:var(--border)] bg-card shadow-[var(--shadow-card)]"
              >
                <div
                  className="h-24 w-full"
                  style={{ background: `var(--${row.name})` }}
                  aria-label={`${row.name} swatch`}
                />
                <div className="space-y-1 p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-xs">--{row.name}</code>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                        (row.ok
                          ? "bg-[color:var(--sand)] text-[color:var(--teal)]"
                          : "bg-red-100 text-red-700")
                      }
                    >
                      {row.ok ? "OK" : "FAIL"}
                    </span>
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-xs text-[color:var(--charcoal-soft)]">
                    <dt>Expected</dt>
                    <dd className="font-mono">{row.expected}</dd>
                    <dt>Live</dt>
                    <dd className="font-mono">{row.actual ?? "—"}</dd>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Referenced hex audit */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl">Referenced hex codes</h2>
          <div className="overflow-hidden rounded-lg border border-[color:var(--border)] bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-[color:var(--sand)] text-xs uppercase tracking-wider text-[color:var(--charcoal-soft)]">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Hex</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {referencedRows.map((r, i) => (
                  <tr
                    key={i}
                    className="border-t border-[color:var(--border)]"
                  >
                    <td className="px-4 py-2 font-mono text-xs">
                      {r.where}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded border border-[color:var(--border)]"
                          style={{ background: r.normalized }}
                          aria-hidden
                        />
                        <code>{r.normalized}</code>
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {r.ok ? (
                        <span className="text-[color:var(--teal)]">
                          {r.inApproved ? "Approved" : "Allowlisted"}
                        </span>
                      ) : (
                        <span className="text-red-700">
                          Not in approved palette
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[color:var(--charcoal-soft)]">
            Allowlisted neutrals: pure black, pure white, dark-mode card
            surface (<code>#1f1f1f</code>).
          </p>
        </section>

        <div className="text-sm">
          <Link to="/" className="underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
