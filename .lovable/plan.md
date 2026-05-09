## Scope

One-pass rework of homepage hero, mobile layout, brand-message coverage, and Studio Builder. Locked snapshots/specs will be updated to match. No backend changes.

## 1. Hero — continuous cinematic film

Current state: 5-scene "chapter" stage with cross-fades, debug overlays, A/B variants, and timed text per scene. The continuous file `public/video/film/yes-hero-film-1080.mp4` already exists.

Changes in `src/routes/index.tsx` + new `src/components/home/CinematicHero.tsx`:
- Replace the multi-scene stage with ONE `<video>` element (1080 + 720 sources, poster `yes-hero-poster.jpg`), `autoPlay muted playsInline loop preload="auto"`, full-bleed via `absolute inset-0 w-full h-full object-cover` inside a `min-h-[100svh]` section. No rounded corners, no inner box, no chapter splits.
- Mobile: section is edge-to-edge (no container-x, no side gutters). Subtle bottom gradient `from-charcoal/55 to-transparent` only where text sits, so the image stays uncropped.
- Timed overlays driven by `video.currentTime` (single `requestAnimationFrame` loop), 4 beats keyed to film timestamps:
  - 0.5–4s: eyebrow "Private · By locals · Your way"
  - 3–9s: H1 line 1 "Portugal is the stage."
  - 6–12s: H1 line 2 "You write the story." (Georgia italic)
  - 10s+: subheadline + CTAs (`Create your story` primary, `Explore signature experiences` ghost) + microcopy
- CTAs render `opacity-0 pointer-events-none` until ~10s, then fade up. No CTA above the hero (remove any pre-hero strip).
- Reduced-motion fallback: hide the video, show poster + show ALL text + CTAs immediately.
- Delete: `HeroJourneyOverlay`, `HeroChapterDebugOverlay` usage, `useHeroVariant` scene swap, per-scene cross-fade machinery on the home route. Keep `HERO_COPY` as the source of truth for the rendered strings.

## 2. Mobile layout — native, full-width, 20px padding

Global change in `src/styles.css` to the `.container-x` utility:
- Mobile (default): `padding-inline: 20px; max-width: 100%;`
- ≥640px: `padding-inline: 24px;`
- ≥1024px: `padding-inline: 32px; max-width: 80rem; margin-inline: auto;`

So mobile uses full width with 20px gutters; the narrow centered column only kicks in on tablet/desktop. Audit `src/routes/index.tsx`, `src/components/Footer.tsx`, `src/components/home/*` for any `max-w-screen-sm`/`max-w-md` wrappers on mobile and remove. Add `text-pretty` / `hyphens: manual` to headings to prevent word-by-word breaks; ensure `overflow-wrap: normal` + reasonable `min-width` on grid children to stop the "one word per line" effect.

## 3. Brand message coverage

Restructure `APPROVED_HOMEPAGE_SECTIONS` and the matching JSX to communicate all 10 truths. Single, scannable mobile order:

```text
1.  Hero (cinematic film, copy + CTAs at end)
2.  Trust strip (reviews + "real local guidance")
3.  What we do — 4 paths grid (Signature · Tailored · Studio Builder · Proposals)
4.  Studio Builder promo card (visual, link to /builder)
5.  Signature Experiences carousel (4 real tours)
6.  Occasions band (Private days · Proposals · Celebrations · Corporate · Private groups · Multi-day) — 6 small cards on mobile, 2 cols
7.  Why YES (4 manifesto cards: instant booking, local guidance, real operation, your way)
8.  FAQ
9.  Final CTA — talk to a local
```

Each section gets one sentence-case H2 + one supporting line. Update `src/content/approved-homepage-structure.ts` to match (9 blocks).

## 4. Studio Builder — interactive journey creator

`src/routes/builder.tsx` + `src/components/builder/*`:
- Replace any form-feeling step with a card-grid stepper. Each step = full-bleed mobile screen with one question, 2–4 visual cards (image + label), tap-to-pick, no labels-on-the-left layout.
- Steps in order:
  1. Experience type (Private day · Multi-day · Celebration · Proposal · Corporate · Private group) — 6 cards
  2. Group type (Couple · Family · Friends · Team) — 4 cards
  3. Mood (Coast · Wine · Hidden · Romantic · Active · Cultural) — 6 cards, real Viator imagery
  4. Region — Portugal map preview (reuse `BuilderMap`/`PremiumMap`) with tappable regions
  5. Live route summary — map + selected stops list + storytelling preview paragraph (tone-only AI output)
  6. Final booking CTA — single sticky button "Reserve instantly"
- Add `BuilderJourneyHeader` showing animated step dots + step title.
- Reuse existing `BuilderMap` (per-region zoom memory preserved).
- Keep all server-fn calls / persistence / Supabase rate limiting untouched.

## 5. Style — palette enforcement

Audit pass on home + builder for any non-token colors. Verify only the 8 tokens are used (`--teal #295B61`, `--gold #C9A96A`, `--ivory #FAF8F3`, `--charcoal #2E2E2E`, plus `--teal-2`, `--gold-soft`, `--sand`, `--charcoal-soft`). Replace any literal hex/`text-white`/`bg-black` with tokens. No new tokens added.

## 6. Locked tests — update to match

These specs/snapshots will be updated (not bypassed) in the same diff:
- `src/content/hero-copy.ts` — keep strings, but timing of reveal changes. Update `e2e/hero-copy.spec.ts` waits to ≥10s.
- `e2e/hero-chapter-crossfade.spec.ts` + `e2e/hero-chapter-crossfade-mobile.spec.ts` + `src/__tests__/hero-scene-contract.test.tsx` — remove (no longer applicable; single continuous film).
- `e2e/hero-chapter-timeline.spec.ts`, `src/__tests__/hero-credits-pacing.test.ts`, `src/__tests__/hero-timeline-scaling.test.ts` — replace with a single `hero-cinematic-timing.test.ts` asserting the 4 timed reveals.
- `src/content/approved-homepage-structure.ts` + `src/routes/__tests__/-homepage-structure.test.ts` + `e2e/homepage-structure.spec.ts` — updated to the 9-block order above.
- `e2e/builder-stepper-keyboard.spec.ts`, `src/__tests__/builder-step-advance.test.ts` — updated selectors for the new card-grid steps.
- All visual-regression PNG baselines on hero/homepage/builder will be regenerated next CI run; mark them stale via empty snapshot directories.

## 7. Out of scope (explicit)

- No backend / DB / edge-function changes.
- No payments / Bokun changes.
- Hero copy strings stay byte-identical to `HERO_COPY` lock.
- No new colors, fonts, or tokens.
- No competitor copy, no invented tours, no stock imagery.

## Risk + verification

- Largest risk: stale visual snapshots will fail until baselines regenerate. CI will go red on the first push; that's expected and called out.
- Verification: typecheck (auto), `vitest run` for the rewritten unit tests, manual QA at 393×851 (the canonical mobile viewport) and 1280×800.

## Deliverables

~12 file edits, 1 new component (`CinematicHero`), 1 new test (`hero-cinematic-timing.test.ts`), 3 deleted obsolete specs. Estimated diff: ~1500 lines net.
