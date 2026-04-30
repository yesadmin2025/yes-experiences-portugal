# Mobile Visual Regression Checklist

Run this checklist on every release before publishing. Target viewport: **393 × 852** (iPhone 14 Pro). Also spot-check **360 × 800** and **414 × 896**.

> Tip: also available as an interactive page at [`/qa/mobile`](/qa/mobile).

## 1 — States: hover / active / focus

- [ ] **Primary CTAs** (hero, sticky, final CTA) — visible focus ring (gold, 2px) with offset.
- [ ] **Secondary CTAs** (block CTAs, "Talk to a local") — `:active` shrinks to 0.98 and bg flips to `--charcoal`.
- [ ] **Cards & links** — `:hover` lifts ≤2px, never overlaps neighbours.
- [ ] **Sticky CTA** — focus ring not clipped by the safe-area inset.
- [ ] **WhatsApp FAB** — focus ring visible, tooltip appears on focus, not only hover.
- [ ] **Header menu trigger** — focus ring visible against transparent + scrolled states.
- [ ] **In-card chevrons / arrow icons** — only translate on hover, never disappear.

## 2 — Spacing & alignment

- [ ] No element clipped at the right edge by the WhatsApp FAB's halo (≥56px corridor).
- [ ] Hero copy: eyebrow, h1, body, two CTAs all left-aligned to the same gutter.
- [ ] "Why YES" cards — `01..05` numbers fully readable, never under FAB.
- [ ] Signature cards — image, title, meta and CTA share a consistent vertical rhythm.
- [ ] Premium blocks (Proposals/Celebrations/Corporate) — gold rule has 16–20px space below image, 16–20px above title.
- [ ] FAQ — chevron and label baseline are on the same line; no wrap.
- [ ] Final CTA — single button, centered, ≥44px tall.
- [ ] Trustmary widget frame — has visible padding on all 4 sides; no edge-to-edge content.

## 3 — Typography & wording

- [ ] No truncation of headlines on 360px.
- [ ] No invisible text (light grey on ivory). Body uses `--charcoal`, not `--charcoal-soft`, except for meta lines.
- [ ] No text overlapping floating UI (FAB, sticky CTA).
- [ ] Letter-spacing labels (≥0.18em) wrap cleanly — no orphans creating extra rows.
- [ ] Hero animation completes within 1.7s; no permanently invisible text on first paint.

## 4 — Motion & images

- [ ] Premium image animations: clip-path reveal completes when the block enters the viewport.
- [ ] Ken Burns drift is gentle (≤6% scale), never jittery.
- [ ] 3D tilt hover is desktop-only (mobile must not jitter on touch).
- [ ] `prefers-reduced-motion: reduce` disables parallax, sheen, glow, Ken Burns, tilt.
- [ ] Images load at correct aspect ratio; no layout shift when the image arrives.

## 5 — Trustmary widget

- [ ] Widget frame visible even before the script loads (min-height ≥280px).
- [ ] Widget renders inside the sand frame; doesn't overflow horizontally on 360px.
- [ ] "Independently collected via Trustmary" caption is visible.

## 6 — Pre-publish smoke

- [ ] Lighthouse mobile score ≥85 perf / 95 a11y.
- [ ] No console errors on the homepage.
- [ ] All hero, signature, and premium block images load (no broken `<img>`).
- [ ] Sticky CTA + FAB respect iOS safe-area-inset-bottom.

---

_Last updated: keep in sync with `src/routes/qa/mobile.tsx`._
