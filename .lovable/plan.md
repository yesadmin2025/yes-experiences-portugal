# Hero timeline validation + accessible captions + remove copyright

## 1. Remove the copyright line
File: `src/routes/index.tsx` (lines ~1007–1012)

Delete the `© {year} YES experiences Portugal` `<p>` block from the hero overlay. No replacement element — keep spacing intact via the existing `mt-3 md:mt-4` rhythm on adjacent blocks.

## 2. Accessible captions layer (legibility at every contrast level)
The existing scene message stack already fades cross-chapter, but it relies on a soft `text-shadow` only — over bright frames (azulejos, vineyards) it can dip below WCAG 4.5:1.

Add a dedicated **caption scrim** behind every active scene message so contrast is guaranteed regardless of the underlying frame, while staying invisible visually (no hard box).

Changes in `src/routes/index.tsx` (scene-message stack ~1024–1180) and `src/styles.css` (`.hero-scene-message` block ~1928):

- Wrap each `.hero-scene-message` content in a `.hero-caption` element with:
  - `data-hero-caption="true"` for tests
  - A radial-gradient scrim pseudo-element (`::before`): `radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 80%)`, blurred, sized to text bounds via `padding: 0.6em 1.1em; margin: -0.6em -1.1em;`
  - `backdrop-filter: blur(2px) saturate(1.05)` (graceful no-op when unsupported)
  - Adds a stronger combined `text-shadow` stack for non-blur fallback: `0 1px 2px rgba(0,0,0,0.85), 0 2px 18px rgba(0,0,0,0.6)`
- Use `prefers-contrast: more` to bump scrim alpha to 0.75/0.55 and remove italic styling on emphasis spans.
- Honor `prefers-reduced-motion: reduce`: fade duration drops to 120ms, no translate, no blur transitions.
- Captions get `role="group"` + `aria-live="polite"` on the stack root so AT users hear new beats; outgoing copy stays `aria-hidden`.
- Caption text uses `color-mix(in oklab, var(--ivory) 100%, white 0%)` and a min font-size floor of `1.05rem` on mobile so the smallest viewport (320px) still passes APCA Lc 75.
- Smooth fade-in is unified to a single keyframe `heroCaptionFadeIn` (opacity 0→1, translateY 6px→0, 520ms `cubic-bezier(0.22,0.61,0.36,1)`), applied per scene boundary; matches the existing 1450ms cross-fade window without fighting it.

## 3. Automated hero timeline + phrases test
New file: `src/__tests__/hero-timeline-phrases.test.ts`

Pure unit test (no DOM), driven entirely by `HERO_SCENES` + `HERO_FILM` from the manifest. Validates the contract every render path (mobile + desktop) depends on, so if anyone re-times a beat the test fails before shipping.

Asserts:
1. **Coverage** — first chapter `startTime === 0`, last chapter `endTime === HERO_FILM.durationSeconds` (within 1e-6).
2. **Gapless + monotonic** — for every adjacent pair, `chapter[i].endTime === chapter[i+1].startTime`; all windows strictly increasing.
3. **Exact phrase mapping** — locks the canonical phrase per chapter id so re-orderings are caught:
   - `imagine` → `main: []`, support contains "Private experiences"
   - `choose` → `["Hidden gems,", "known by locals."]`
   - `taste` → `["Your private day,", "shaped around you."]`
   - `celebrate` → `["Celebrations,", "made effortless."]`
   - `corporate` → `["For teams", "with purpose."]`
   - `journey` → `["One perfect day", "to remember."]`
   - `build` → `["A journey", "across Portugal."]`
   - `confirm` → `main: []`
4. **Frame-accurate sampling** — at sample times `[0.0, 2.9, 7.0, 9.6, 11.75, 13.9, 16.9, 24.7, 27.6]` the active chapter (via the same `t >= start && t <= end` rule the route uses) resolves to the expected id. This is the same lookup the rAF loop runs at runtime, so passing here proves desktop and mobile show the phrase at the exact moment (the lookup is viewport-agnostic — the only viewport-specific concern is layout, covered by the existing `hero-scene-contract` + a11y axe tests).
5. **Scaling preserves alignment** — `scaleHeroTimeline(actual)` for `actual ∈ {20, 27.633333, 35}` keeps gapless + monotonic + first=0 + last=actual.

Also extend `src/__tests__/hero-credits-pacing.test.ts` with one extra assertion: every chapter's window length × `HERO_FILM_PLAYBACK_RATE` ≥ 2.15s (existing) AND ≤ 8.0s (new ceiling) so no future edit can drag a beat too long either.

## Technical notes
- No manifest re-timing in this change — only the test, the copyright removal, and the captions layer.
- No new dependencies.
- The captions scrim uses CSS only; no JS reflow cost.
- All changes mobile-first; desktop adapts via existing `sm:` / `md:` breakpoints already on `.hero-scene-message`.

## Files touched
- `src/routes/index.tsx` — remove copyright `<p>`, wrap scene messages in `.hero-caption`, add `aria-live` group.
- `src/styles.css` — `.hero-caption` scrim, `heroCaptionFadeIn` keyframe, `prefers-contrast` + `prefers-reduced-motion` rules.
- `src/__tests__/hero-timeline-phrases.test.ts` — NEW.
- `src/__tests__/hero-credits-pacing.test.ts` — add ceiling assertion.
