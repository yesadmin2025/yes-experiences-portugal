import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/preview-check")({
  head: () => ({
    meta: [
      { title: "Preview verification — YES experiences" },
      { name: "robots", content: "noindex,nofollow" },
      {
        name: "description",
        content: "Internal one-click visual QA checklist for key homepage sections.",
      },
    ],
  }),
  component: PreviewCheckPage,
});

type CheckItem = {
  id: string;
  label: string;
  description: string;
  /** Route path to embed in the iframe. */
  src: string;
  /** Optional hash to scroll the iframe to a specific section. */
  hash?: string;
};

const CHECKS: CheckItem[] = [
  {
    id: "hero",
    label: "Hero",
    description: "Headline, subheadline, eyebrow and primary CTAs are visible and on-brand.",
    src: "/",
  },
  {
    id: "experiences",
    label: "Experiences list",
    description: "Signature experiences render with images, titles and links.",
    src: "/experiences",
  },
  {
    id: "builder",
    label: "Builder CTA",
    description: "The Studio / builder entry point loads and the primary CTA is visible.",
    src: "/builder",
  },
];

function PreviewCheckPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const completed = CHECKS.filter((c) => checked[c.id]).length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Internal · Visual QA
            </p>
            <h1 className="text-2xl font-semibold mt-1">Preview verification</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {completed} / {CHECKS.length} sections confirmed
            </p>
          </div>
          <Link
            to="/"
            className="text-sm underline underline-offset-4 hover:text-primary"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
        {CHECKS.map((item) => (
          <section
            key={item.id}
            aria-labelledby={`check-${item.id}-title`}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4 p-4 border-b border-border/60">
              <div className="flex items-start gap-3">
                <input
                  id={`check-${item.id}`}
                  type="checkbox"
                  checked={!!checked[item.id]}
                  onChange={() => toggle(item.id)}
                  className="mt-1 h-5 w-5 accent-primary cursor-pointer"
                  aria-label={`Mark ${item.label} as verified`}
                />
                <div>
                  <h2
                    id={`check-${item.id}-title`}
                    className="text-lg font-semibold"
                  >
                    {item.label}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
              <a
                href={item.src}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-xs underline underline-offset-4 text-muted-foreground hover:text-primary"
              >
                Open ↗
              </a>
            </div>

            <div className="bg-muted/30">
              <iframe
                title={`${item.label} preview`}
                src={item.src + (item.hash ?? "")}
                loading="lazy"
                className="w-full h-[520px] border-0 block"
              />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
