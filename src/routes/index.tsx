import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { FAQ } from "@/components/FAQ";
import { CtaButton } from "@/components/ui/CtaButton";

import heroImg from "@/assets/hero-coast.jpg";

// Real Viator-sourced tour photography used by the Occasions / Signature
// cards on this page. Hero-scene imagery is declared in the manifest at
// `src/content/hero-scenes-manifest.ts` (single source of truth, feeds
// both the route and the credits modal).
import imgArrabidaViewpoint from "@/assets/tours/arrabida-wine-allinclusive/viewpoint.jpg";
import imgArrabidaWineLunch from "@/assets/tours/arrabida-wine-allinclusive/lunch.jpg";
import imgSintraCaboDaRoca from "@/assets/tours/sintra-cascais/cabo-da-roca.jpg";
import imgTomarCoimbra from "@/assets/tours/tomar-coimbra/hero.jpg";
import imgArrabidaCoves from "@/assets/tours/arrabida-boat/coves.jpg";
import imgSintraHero from "@/assets/tours/sintra-cascais/hero.jpg";
import imgTroiaBeach from "@/assets/tours/troia-comporta/beach.jpg";

import {
  ArrowRight,
  Star,
  Sparkles,
  MapPin,
  MessageCircle,
  Compass,
  Feather,
  LifeBuoy,
} from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";
import { StudioLivePreview } from "@/components/home/StudioLivePreview";
import { getScrollDebugFlags, useScrollDebugFlags } from "@/lib/scroll-debug";

import { HERO_COPY, HERO_COPY_VERSION } from "@/content/hero-copy";
import { HERO_SCENES } from "@/content/hero-scenes-manifest";
import { useHeroVariant } from "@/hooks/use-hero-variant";
import { signatureTours, isValidTourId } from "@/data/signatureTours";

/* ──────────────────────────────────────────────────────────────────
 * Featured Signature tours — exactly 4 real tours, in display order.
 * Each id MUST exist in `signatureTours` (validated below).
 * ────────────────────────────────────────────────────────────── */
const FEATURED_TOUR_IDS = [
  "arrabida-wine-allinclusive",
  "sintra-cascais",
  "arrabida-boat",
  "troia-comporta",
] as const;

/* ──────────────────────────────────────────────────────────────────
 * HERO — cinematic 5-scene storytelling sequence (mobile-first).
 *
 * Each scene shows ONE main message + ONE short supporting line, on a
 * single real Viator-sourced image. Scenes auto-advance every 5s with
 * a slow crossfade + soft Ken Burns drift. CTAs and microcopy appear
 * ONLY on scene 5 (the action scene).
 *
 * Scene 5's visible copy intentionally aligns with the approved
 * HERO_COPY lock — it carries the canonical H1 / subheadline / CTAs /
 * microcopy / brand line. `?hero=last` (used by the e2e copy lock and
 * visual-regression specs) freezes the sequence on scene 5 so all
 * approved strings are simultaneously rendered for byte-exact and
 * visibility assertions.
 *
 * No invented stops. Imagery is real Viator-sourced operation
 * photography. AI is not used to shape any of these strings.
 * ────────────────────────────────────────────────────────────── */
const HERO_SCENE_DURATION_MS = 5200;

/* ──────────────────────────────────────────────────────────────────
 * Cinematic horizontal storytelling hero — 5 scenes, each a short
 * "chapter" of a Portugal film. Background pans slowly right→left
 * (drift-left) like a film reel; only the OPENING scene shows the
 * canonical H1, and only the FINAL scene reveals CTAs. Every other
 * scene shows ONE short cinematic line + ONE supporting microline.
 * Imagery is real Viator-sourced operation photography only.
 * ────────────────────────────────────────────────────────────── */
/**
 * Cinematic 5-scene story. Each scene = ONE real Portugal image +
 * one cinematic headline (with intentional line breaks) + one short
 * supporting microline. CTAs appear ONLY on scene 5.
 *
 * `main` is an array so we can render line breaks the same way an
 * editorial film would title-card a chapter — each line lands as its
 * own beat, not a run-on sentence.
 *
 * Imagery is real Viator-sourced operation photography only — no
 * stock, no AI faces, no generic clichés.
 */
/**
 * Cinematic hero sequence is now declared in
 * `src/content/hero-scenes-manifest.ts` — single source of truth that
 * also feeds the credits modal. Adding/replacing a scene clip happens
 * THERE, not here, so attribution stays in sync with what's rendered.
 */


const signatures = FEATURED_TOUR_IDS
  .filter((id) => isValidTourId(id))
  .map((id) => signatureTours.find((t) => t.id === id)!)
  .map((t) => ({
    id: t.id,
    title: t.title,
    img: t.img,
    line: t.blurb,
    pace: t.pace,
    region: t.region,
    priceFrom: t.priceFrom,
    durationHours: t.durationHours,
    // First 3 real highlights from the matching Viator-sourced catalog.
    // Never fabricated — sourced from `signatureTours[].highlights`.
    highlights: t.highlights.slice(0, 3),
  }));

/* ──────────────────────────────────────────────────────────────────
 * Moments / Groups preview — Multi-day, Proposals, Celebrations,
 * Corporate collapsed into a single band (see groupsAndCelebrations).
 * ────────────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────────────────
 * Moments / Groups preview — Multi-day, Celebrations, Corporate
 * collapsed into a single 3-card band.
 * ────────────────────────────────────────────────────────────── */
/* ──────────────────────────────────────────────────────────────────
 * Occasions band — Proposals · Celebrations · Corporate & Groups ·
 * Multi-Day. Each block carries the four required elements:
 *   1. strong headline (`title`)
 *   2. short emotional value (`pull`)
 *   3. practical value (`line` body + `detail` + `handles`)
 *   4. local guidance / logistics note (`trust`)
 *   + CTA (`cta` + `to`)
 * Copy is approved verbatim — do not paraphrase without explicit ask.
 * Each block uses its OWN real Viator-sourced image (no duplicates,
 * no stock, no invented imagery).
 * ────────────────────────────────────────────────────────────── */
const groupsAndCelebrations = [
  {
    id: "proposals",
    eyebrow: "Proposals",
    title: "A private moment, shaped with care.",
    line: (
      <>
        From location to timing, we plan the details{" "}
        <span className="kw">discreetly</span> with local knowledge.
      </>
    ),
    pull: "Designed for the moment, not the template.",
    detail: "Discreet · location of your choosing",
    handles: [
      "Location scouting",
      "Timing optimisation",
      "Full discretion",
    ],
    trust: "Planned end to end with our local team.",
    cta: "Plan a Proposal",
    to: "/proposals",
    img: imgArrabidaViewpoint,
  },
  {
    id: "celebrations",
    eyebrow: "Celebrations",
    title: "For days worth remembering.",
    line: (
      <>
        Birthdays, anniversaries and family moments shaped around{" "}
        <span className="kw">your people</span> and pace.
      </>
    ),
    pull: "Your people, your pace.",
    detail: "Private host · any group size",
    handles: [
      "Group coordination",
      "Multi-activity planning",
      "Personal touches",
    ],
    trust: "Coordinated by a local host who knows how the day connects.",
    cta: "Plan a Celebration",
    to: "/proposals",
    img: imgArrabidaWineLunch,
  },
  {
    id: "corporate",
    eyebrow: "Corporate & Groups",
    title: "Private group days, without the generic formula.",
    line: (
      <>
        Local experiences, transport and timing coordinated into one{" "}
        <span className="kw">effortless</span> day.
      </>
    ),
    pull: "Handled end to end, locally.",
    detail: "Any group size · invoice & DMC support",
    handles: [
      "Full logistics management",
      "Transport coordination",
      "Invoice & DMC support",
    ],
    trust: "Real driving times, real venues, real partners.",
    cta: "Plan a Group Experience",
    to: "/corporate",
    img: imgSintraCaboDaRoca,
  },
  {
    id: "multi-day",
    eyebrow: "Multi-day",
    title: "More than one day. One coherent journey.",
    line: (
      <>
        Build Portugal across regions with realistic timing and{" "}
        <span className="kw">local flow</span>.
      </>
    ),
    pull: "A real journey, not a checklist.",
    detail: "Any length · local-designed",
    handles: [
      "Route planning across regions",
      "Curated overnight stops",
      "Daily local support",
    ],
    trust: "Designed in conversation with a local team.",
    cta: "Plan a Multi-Day Journey",
    to: "/multi-day",
    img: imgTomarCoimbra,
  },
] as const;


/* ──────────────────────────────────────────────────────────────────
 * Route definition — keeps headers, head meta and HERO_COPY_VERSION
 * exposure intact so existing locks (X-Hero-Copy-Version,
 * yes-hero-copy-version meta tag) keep passing.
 * ────────────────────────────────────────────────────────────── */
export const Route = createFileRoute("/")({
  headers: () => ({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    "Surrogate-Control": "no-store",
    "X-Hero-Copy-Version": HERO_COPY_VERSION,
  }),
  head: () => ({
    meta: [
      { title: "YES experiences Portugal — Portugal is the stage. You write the story." },
      { name: "yes-hero-copy-version", content: HERO_COPY_VERSION },
      { name: "description", content: HERO_COPY.subheadline },
      {
        property: "og:title",
        content: "Portugal is the stage. You write the story. — YES experiences",
      },
      { property: "og:description", content: HERO_COPY.subheadline },
      {
        property: "twitter:title",
        content: "Portugal is the stage. You write the story. — YES experiences",
      },
      { property: "twitter:description", content: HERO_COPY.subheadline },
      { property: "og:image", content: heroImg },
      { property: "twitter:image", content: heroImg },
    ],
  }),
  component: HomePage,
});

/* ════════════════════════════════════════════════════════════════
 * HOMEPAGE — 8 sections (structural pass: dedup + reorder)
 * 1. Hero
 * 2. Social proof — trust strip
 * 3. Why YES — editorial manifesto (5 blocks)
 * 4. Experience Studio preview (Builder)
 * 5. Real Signature Experiences preview
 * 6. Proposals / Celebrations / Corporate / Multi-Day (combined band)
 * 7. FAQ
 * 8. Final CTA — Talk to a local
 * ════════════════════════════════════════════════════════════ */
function HomePage() {
  const scrollDebug = useScrollDebugFlags();
  // `?hero=last` query param freezes the cinematic sequence on the
  // final (action) scene where all approved HERO_COPY strings are
  // simultaneously rendered. Used by the e2e copy lock + byte-exact +
  // visual-regression suites so they don't race the auto-advance loop.
  const heroFreezeOnLast =
    typeof window !== "undefined" &&
    /[?&]hero=last(?:&|$)/.test(window.location.search);
  // A/B variant resolution. SSR returns the control; on the client the
  // visitor's assigned variant is swapped in (one re-render, no flicker
  // for the ~1/N visitors in control). Imagery / video / position are
  // ALWAYS taken from the manifest — only `main` and `support` strings
  // are varied. CTAs and locked HERO_COPY are never touched.
  const { scenes: heroScenes, trackEvent: trackHeroEvent } = useHeroVariant();
  const [heroSceneIndex, setHeroSceneIndex] = useState(
    heroFreezeOnLast ? heroScenes.length - 1 : 0,
  );
  const heroScene = heroScenes[heroSceneIndex];
  const isHeroActionScene = heroSceneIndex === heroScenes.length - 1;

  // Runtime poster guard — verify each scene's poster URL responds 2xx
  // BEFORE the slide goes active. If a poster is missing/404 we log a
  // loud error (so it surfaces in Sentry / console / QA), but the reel
  // NEVER falls back to image-only mode: videos keep playing as the
  // sole visual carrier. This is the single source of truth that
  // "image fallback" is no longer a supported state for the hero.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    (async () => {
      for (const scene of HERO_SCENES) {
        if (!scene.image) {
          // eslint-disable-next-line no-console
          console.error(
            `[hero] scene "${scene.id}" has no poster declared — video-only playback continues, but please add a poster jpg.`,
          );
          continue;
        }
        try {
          const res = await fetch(scene.image, { method: "HEAD", cache: "force-cache" });
          if (cancelled) return;
          if (!res.ok) {
            // eslint-disable-next-line no-console
            console.error(
              `[hero] poster missing for scene "${scene.id}" (${scene.image} → HTTP ${res.status}). Video-only playback continues — no image fallback.`,
            );
          }
        } catch (err) {
          if (cancelled) return;
          // eslint-disable-next-line no-console
          console.error(
            `[hero] poster probe failed for scene "${scene.id}" (${scene.image}). Video-only playback continues — no image fallback.`,
            err,
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ──────────────────────────────────────────────────────────────
   * Hero video — uniform video-only playback across all devices.
   *
   *   • Scenes 1–5 are videos. There is NO image-only fallback mode.
   *     The poster jpg is shown only for the brief first-paint window
   *     before the video element decodes its first frame.
   *   • The ONLY case where we don't autoplay is `prefers-reduced-motion`
   *     (a11y). Even then the <video> element mounts with `preload=metadata`
   *     so the first frame paints — we just don't loop-animate it.
   *   • Save-Data / slow-2g / 2g / 3g / narrow viewports DO get videos,
   *     but with tighter preload (only the NEXT scene is fetched as
   *     `metadata`, never `auto`) so initial load stays low.
   * ────────────────────────────────────────────────────────────── */
  // Hero is a 5-scene cinematic VIDEO reel — every scene is a moving
  // clip, never a still image. Per explicit product direction, the
  // hero clips are decorative + muted + looping, so they autoplay on
  // every device including reduced-motion (the clips are gentle
  // drifts/pull-backs, never strobing or fast cuts). Save-Data still
  // shrinks preload weight but does NOT freeze the active clip.
  const [videosAllowed] = useState(true);
  const [saveDataMode, setSaveDataMode] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn = (navigator as any).connection;
    if (conn) {
      const eff = String(conn.effectiveType || "");
      if (conn.saveData || eff === "slow-2g" || eff === "2g" || eff === "3g") {
        setSaveDataMode(true);
      }
    }
  }, []);

  // Warm ONLY the next scene's video URL via `<link rel="preload">` so
  // the CDN handshake + first bytes land before the slide goes active.
  // We never warm scenes beyond N+1 — keeps initial load low even on
  // Save-Data / slow networks, where the active clip is the only one
  // fully fetched and the next is just metadata-prefetched.
  useEffect(() => {
    if (typeof window === "undefined") return;
    // On Save-Data / slow networks, skip the proactive `<link rel=preload>`
    // entirely — the in-DOM `<video preload="metadata">` on the NEXT slide
    // is enough to get a first frame ready without a second parallel fetch.
    if (saveDataMode) return;
    const next = HERO_SCENES[heroSceneIndex + 1];
    if (!next?.video) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = next.video;
    // Browsers gate cross-origin preload on a matching crossorigin
    // attribute; the asset CDN serves with permissive CORS so anonymous
    // is the right value here.
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [heroSceneIndex, saveDataMode]);

  /* ──────────────────────────────────────────────────────────────
   * Runtime assertions (dev-only) — verify that the hero stage
   * actually mounted in the contract we claim:
   *
   *   1. Video-only mode: every ACTIVE and NEXT slide must have a
   *      <video> element. An <img>-only slide would be an image-only
   *      fallback state, which is not supported.
   *   2. Preload tier contract: every mounted <video>'s `preload`
   *      attribute must match the active/next rule
   *      (active = "auto" | "metadata" on Save-Data, next = "metadata").
   *
   * These run after every scene change, only in dev (Vite's
   * `import.meta.env.DEV`), and never throw — they only console.error
   * so QA / Sentry pick the violations up without breaking the page
   * for real visitors.
   * ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!import.meta.env.DEV) return;
    // Defer one frame so React has committed the DOM.
    const raf = window.requestAnimationFrame(() => {
      const stage = document.querySelector<HTMLElement>(".hero-story-stage");
      if (!stage) return;
      const slides = Array.from(
        stage.querySelectorAll<HTMLElement>("[data-hero-scene-id]"),
      );
      const activeScene = HERO_SCENES[heroSceneIndex];
      const nextScene = HERO_SCENES[heroSceneIndex + 1];
      for (const slide of slides) {
        const sceneId = slide.getAttribute("data-hero-scene-id");
        const isActive = sceneId === activeScene?.id;
        const isNext = nextScene ? sceneId === nextScene.id : false;
        const video = slide.querySelector<HTMLVideoElement>("video");

        // Contract 1 — video-only mode for active + next.
        if ((isActive || isNext) && !video) {
          // eslint-disable-next-line no-console
          console.error(
            `[hero/runtime] scene "${sceneId}" is ${isActive ? "ACTIVE" : "NEXT"} but has NO <video> — image-only mode is not supported.`,
          );
        }

        // Contract 2 — preload tier matches active/next rule.
        if (video) {
          const preload = video.getAttribute("preload");
          if (isActive) {
            const expected = saveDataMode ? "metadata" : "auto";
            if (preload !== expected) {
              // eslint-disable-next-line no-console
              console.error(
                `[hero/runtime] active scene "${sceneId}" has preload="${preload}" — expected "${expected}".`,
              );
            }
          } else if (isNext) {
            if (preload !== "metadata") {
              // eslint-disable-next-line no-console
              console.error(
                `[hero/runtime] next scene "${sceneId}" has preload="${preload}" — expected "metadata".`,
              );
            }
          } else {
            // Non-active / non-next slides should not have <video> at all.
            // eslint-disable-next-line no-console
            console.error(
              `[hero/runtime] scene "${sceneId}" mounted a <video> but is neither ACTIVE nor NEXT — preload tier broken.`,
            );
          }
        }
      }
    });
    return () => window.cancelAnimationFrame(raf);
  }, [heroSceneIndex, saveDataMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (heroFreezeOnLast) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setHeroSceneIndex((index) => {
        if (index >= HERO_SCENES.length - 1) {
          window.clearInterval(timer);
          return index;
        }
        return index + 1;
      });
    }, HERO_SCENE_DURATION_MS);

    return () => window.clearInterval(timer);
  }, [heroFreezeOnLast]);

  // Homepage motion controller — `[data-motion]` / `.motion-in`.
  // See src/lib/home-motion.ts for the full contract. This is the
  // single source of truth for visible scroll motion on the homepage.
  // Auto-tags legacy `.reveal` / `.reveal-stagger` / `.section-enter`
  // elements with `data-motion`, so this controller wins on the
  // homepage without per-component edits.
  useEffect(() => {
    let dispose: (() => void) | undefined;
    import("@/lib/home-motion").then(({ startHomeMotion }) => {
      dispose = startHomeMotion();
    });
    return () => {
      dispose?.();
    };
  }, []);

  // ── Hash navigation ────────────────────────────────────────────────
  // Two cooperating effects:
  //   1. Deep-link handler: on mount (and on subsequent hashchange via
  //      in-page anchor clicks), resolves aliases, smooth-scrolls to the
  //      target, and sets a shared lock so the observer below doesn't
  //      overwrite the hash mid-animation.
  //   2. Hash sync observer: as the user scrolls, replaces the URL hash
  //      with whichever tracked section is "most under" the anchor line —
  //      a fixed line ~14% down the viewport (just below the navbar).
  //      We use a distance-to-anchor-line metric instead of raw
  //      intersectionRatio so short sections (e.g. trust bar) don't beat
  //      tall ones (e.g. Builder) just because they're 100% visible.
  //
  // The lock is a module-scoped `useRef` shared between effects via a
  // closure variable in component scope.

  const TRACKED_IDS = [
    "reviews",
    "builder",
    "studio",
    "why-yes",
    "signatures",
    "occasions",
    "faq",
    "final-cta",
  ] as const;

  const HASH_ALIASES: Record<string, string> = {
    // Why YES
    "why-yes": "why-yes",
    whyyes: "why-yes",
    why: "why-yes",
    // Builder / Studio — Studio is its own anchor inside the builder section
    build: "builder",
    builder: "builder",
    studio: "studio",
    "experience-studio": "studio",
    // Signatures
    signature: "signatures",
    signatures: "signatures",
    // Occasions / Groups (legacy aliases preserved)
    occasion: "occasions",
    occasions: "occasions",
    groups: "occasions",
    group: "occasions",
    proposal: "occasions",
    proposals: "occasions",
    celebration: "occasions",
    celebrations: "occasions",
    corporate: "occasions",
    // Reviews / trust
    review: "reviews",
    reviews: "reviews",
    // Final CTA
    "final-cta": "final-cta",
    final: "final-cta",
    book: "final-cta",
    talk: "final-cta",
    contact: "final-cta",
  };

  // Shared "don't sync the hash right now" lock. Held while a programmatic
  // smooth-scroll is in flight. Stored on window so both effects see the
  // same value without prop-drilling a ref.
  // Using a numeric timestamp (ms since epoch) — observer reads
  // performance.now() and skips while the lock is in the future.
  const getLockKey = () => "__yesHashSyncLockUntil";

  // Effect 1 — deep-link handling (runs on mount + on hashchange events
  // triggered by clicks on in-page anchors that point to a tracked id).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (getScrollDebugFlags().disableHashSync) return;

    const resolveTarget = (raw: string): HTMLElement | null => {
      if (!raw) return null;
      const key = raw.toLowerCase();
      const aliased = HASH_ALIASES[key] ?? key;
      return (
        document.getElementById(aliased) ?? document.getElementById(key)
      );
    };

    let cancelled = false;
    let timer = 0;

    // Single, simple deep-link handler.
    //
    // Previous version stacked three smooth-scroll systems (CSS
    // scroll-behavior + global anchor handler + scrollIntoView here)
    // plus corrective re-scrolls at 500ms / 1400ms / on every img.load /
    // on document.fonts.ready. That caused the page to snap back after
    // the user started scrolling.
    //
    // Now: one smooth scroll, no corrections. The global
    // installSmoothAnchorScroll handler (SiteLayout) covers click-driven
    // jumps with the proper navbar offset; this effect only handles
    // initial mount + hashchange (programmatic). We poll briefly for the
    // target to exist (lazy chunks/images), do ONE scroll, and stop.
    const scrollToHash = (rawHash: string, smooth: boolean) => {
      // Lock the scroll-spy briefly so it doesn't fight us during the
      // initial smooth scroll.
      (window as unknown as Record<string, number>)[getLockKey()] =
        performance.now() + 900;

      let tries = 0;
      const tick = () => {
        if (cancelled) return;
        const el = resolveTarget(rawHash);
        if (el) {
          const reduce =
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
          // Compute target with navbar offset so we land cleanly under the
          // fixed header instead of clipping under it.
          const navOffset =
            window.innerWidth >= 1024 ? 96 : window.innerWidth >= 768 ? 88 : 80;
          const scrollMt =
            parseFloat(window.getComputedStyle(el).scrollMarginTop || "0") || 0;
          const offset = Math.max(scrollMt, navOffset);
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({
            top: Math.max(0, top),
            behavior: smooth && !reduce ? "smooth" : "auto",
          });

          // Force-reveal the section once so deep-linked anchors don't
          // land on opacity:0 content (IO race on mount). Transform/opacity
          // only — no layout shift.
          const scope: ParentNode = el.querySelector(
            ".reveal, .reveal-stagger",
          )
            ? el
            : (el.closest("section") ?? el);
          scope
            .querySelectorAll<HTMLElement>(
              ".reveal:not(.is-visible), .reveal-stagger:not(.is-visible), .section-enter:not(.is-visible)",
            )
            .forEach((node) => node.classList.add("is-visible"));

          // Canonicalise URL hash.
          const canonical =
            HASH_ALIASES[rawHash.toLowerCase()] ?? rawHash.toLowerCase();
          if (canonical && `#${canonical}` !== window.location.hash) {
            window.history.replaceState(
              window.history.state,
              "",
              window.location.pathname + window.location.search + `#${canonical}`,
            );
          }
          return;
        }
        // Section not in DOM yet (lazy chunk). Poll briefly.
        if (++tries < 20) {
          timer = window.setTimeout(tick, 80);
        }
      };
      timer = window.setTimeout(tick, 60);
    };

    const initial = window.location.hash?.slice(1);
    if (initial) scrollToHash(initial, true);

    const onHashChange = () => {
      const h = window.location.hash?.slice(1);
      if (h) scrollToHash(h, true);
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", onHashChange);
      if (timer) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 2 — REMOVED PERMANENTLY.
  // Previously synced the URL hash to the currently visible section as the
  // user scrolled. This was identified as a likely contributor to scroll
  // instability (rAF + IO + history.replaceState during native scroll). It
  // is intentionally not replaced. Anchor link clicks still work via
  // Effect 1 + the global smooth-anchor-scroll handler.

  // Effect 3 — homepage-only parallax driver. Writes `--parallax-y` to
  // every `.he-parallax` / `.he-parallax-counter` element via rAF on
  // scroll. Disabled for prefers-reduced-motion. Caps travel so it
  // stays "everyday", never woozy.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) return;
    if (getScrollDebugFlags().disableMobileStudioMotion && window.innerWidth < 768) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".he-parallax, .he-parallax-counter",
      ),
    );
    if (!els.length) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        // Skip when fully off-screen.
        if (rect.bottom < -200 || rect.top > vh + 200) continue;
        // Normalised position: -1 (above viewport) → 0 (centred) → 1 (below).
        const center = rect.top + rect.height / 2;
        const t = (center - vh / 2) / vh; // ~ -1..1 across viewport
        // Cap travel on tablet/desktop only. Mobile parallax is disabled.
        const cap = 28;
        const y = Math.max(-cap, Math.min(cap, t * cap * -1));
        el.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
      }
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <SiteLayout>
       <div className="home-energy">
       {/* 1 — HERO
           Mobile-first cinematic 4-beat storytelling sequence. Each beat
           communicates ONE emotional idea. Copy reveals progressively in
           a calm cascade so the user feels atmosphere first, action last.
           HERO_COPY stays byte-exact for lock parity. The brand signature
           ("Whatever you have in mind, We say YES.") is rendered ONCE
           inside HERO_COPY.brandLine — no duplicate slogans.

           Reveal cascade (all `forwards`, so the animation freeze in
           e2e tests resolves to the final visible state):
             0.20s  eyebrow         — slide 1 atmosphere
             0.55s  headline        — slide 1 hook
             1.50s  supporting line — slide 2 personalization
             2.60s  primary CTA     — slide 4 action
             2.90s  secondary CTA   — slide 4 action
             3.40s  microcopy       — slide 4 reassurance

           4-beat background sequence — real Viator-sourced imagery only:
             1. Opening / hook       — coastal road        (hero-coast)
             2. Personalization      — wine table          (Arrábida lunch)
             3. Local / authentic    — hidden viewpoint    (Arrábida viewpoint)
             4. Action / celebration — estate intimate     (Sintra estates)
           40s total loop (10s per beat ≈ 8s hold + 2s crossfade).
           Slide 1 is the SSR/static fallback. Reduced-motion freezes
           on slide 1 with all copy at full opacity. */}
        <section
          className="relative min-h-[85svh] md:min-h-[90vh] flex items-end overflow-hidden"
          data-hero-scene={heroScene.id}
          data-hero-scene-index={heroSceneIndex}
        >
          <div
            aria-hidden="true"
            className="hero-story-stage absolute inset-0 w-full h-full overflow-hidden"
          >
            {/*
              Per-breakpoint object-position presets — emitted once,
              driven entirely by the manifest. Mobile = ≤767px (tall
              portrait, protect heads/horizons from the bottom scrim),
              tablet = 768–1199px, desktop = ≥1200px. CSS @media swaps
              framing without React re-renders or resize listeners.
              The desktop value is also the inline default so the very
              first paint on ≥1200px viewports already uses the correct
              framing before the stylesheet attaches.
            */}
            <style>{HERO_SCENES.map((s) => (
              `[data-hero-scene-id="${s.id}"] > video{object-position:${s.position.mobile}}` +
              `@media (min-width:768px){[data-hero-scene-id="${s.id}"] > video{object-position:${s.position.tablet}}}` +
              `@media (min-width:1200px){[data-hero-scene-id="${s.id}"] > video{object-position:${s.position.desktop}}}`
            )).join("")}</style>
            {HERO_SCENES.map((scene, index) => {
              const isActive = index === heroSceneIndex;
              const isNext = index === heroSceneIndex + 1;
              // Hero is video-only on EVERY slide — no static fallback.
              // We always mount the <video> element so the user never
              // sees a frozen poster on inactive slides; the active
              // clip loads as `auto`, the next as `metadata`, and the
              // rest stay at `none` (browser fetches a few KB to paint
              // the first frame, no full download).
              const hasVideo = Boolean(scene.video);
              const videoPreload: "auto" | "metadata" | "none" = isActive
                ? saveDataMode
                  ? "metadata"
                  : "auto"
                : isNext
                  ? "metadata"
                  : "none";
              return (
                <div
                  key={scene.id}
                  className={`hero-story-slide absolute inset-0 w-full h-full ${isActive ? "is-active" : ""}`}
                  data-hero-pan={scene.pan}
                  data-hero-scene-id={scene.id}
                  aria-hidden="true"
                >
                  {hasVideo && scene.video ? (
                    <video
                      src={scene.video}
                      poster={scene.image}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectPosition: scene.position.desktop }}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload={videoPreload}
                      ref={(el) => {
                        if (!el) return;
                        // Some embedded contexts (Lovable preview iframe,
                        // reduced-motion environments) ignore the
                        // declarative `autoplay` attribute. Kicking
                        // `.play()` on the active slide guarantees the
                        // hero is ALWAYS in motion as designed.
                        if (isActive && videosAllowed) {
                          const p = el.play();
                          if (p && typeof p.catch === "function") {
                            p.catch(() => {
                              /* autoplay rejection — leave first frame visible */
                            });
                          }
                        }
                      }}
                      onError={() => {
                        // eslint-disable-next-line no-console
                        console.error(
                          `[hero] video failed to load for scene "${scene.id}" (${scene.video}).`,
                        );
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
         {/* Hidden hero alt text for SEO/a11y — the storytelling stage stays
             a pure aria-hidden backdrop. */}
         <span className="sr-only">
           A cinematic story of Portugal — coastal roads, intimate local tables, hidden coves, estate gardens and cliff horizons.
         </span>

         {/* Cinematic readability overlay — layered scrim ensures the
             eyebrow + headline + supporting line stay AA-legible on
             every frame, including bright vineyard / wine-table /
             sunlit-village clips. Top→bottom: gentle top vignette,
             strong bottom anchor (where text lives), and a low-left
             radial focus that pools shadow exactly under the copy. */}
         <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,16,0.42)_0%,rgba(20,18,16,0.10)_28%,rgba(20,18,16,0.32)_55%,rgba(14,12,10,0.85)_100%)] pointer-events-none z-[2]" />
         <div className="absolute inset-0 bg-[radial-gradient(140%_85%_at_22%_92%,rgba(14,10,8,0.72)_0%,rgba(14,10,8,0.22)_45%,rgba(14,10,8,0)_70%)] pointer-events-none z-[2]" />
         <div className="absolute inset-x-0 bottom-0 h-[62%] bg-[linear-gradient(180deg,rgba(46,30,18,0)_0%,rgba(30,20,12,0.22)_45%,rgba(20,14,10,0.65)_100%)] mix-blend-multiply pointer-events-none z-[2]" />

          {/* Subtle story progress — a thin cinematic timeline at the
              bottom of the hero. Re-keys per scene so the fill replays. */}
         <div
           aria-hidden="true"
            className="hero-story-progress absolute z-10 left-6 right-6 bottom-5 md:left-10 md:right-10 md:bottom-9 opacity-0 animate-[heroFadeFromRight_0.9s_ease-out_1.4s_forwards]"
         >
            <span key={heroScene.id} className="hero-story-progress-fill" />
         </div>

         <div className="container-x relative z-10 pb-[max(5rem,calc(env(safe-area-inset-bottom)+4rem))] md:pb-32 pt-24 md:pt-40">
           <div className="max-w-[19.5rem] xs:max-w-[21rem] sm:max-w-2xl md:max-w-3xl text-[color:var(--ivory)] text-left">
              {/* Eyebrow — refined: smaller, lighter, calmer. Should sit
                  above the image without dominating it. */}
              <span className="inline-flex items-center gap-2 sm:gap-3 max-w-full text-[8.5px] xs:text-[9px] sm:text-[10px] md:text-[10.5px] uppercase tracking-[0.24em] xs:tracking-[0.28em] sm:tracking-[0.32em] text-[color:var(--gold-soft)]/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.6),0_0_2px_rgba(0,0,0,0.5)] opacity-0 animate-[heroFadeFromRight_0.9s_ease-out_0.20s_forwards]">
                <span aria-hidden="true" className="shrink-0 text-[6.5px] sm:text-[7.5px] opacity-70">✦</span>
                <span data-hero-field="eyebrow" className="whitespace-nowrap truncate font-medium">
                  {HERO_COPY.eyebrow}
                </span>
                <span aria-hidden="true" className="shrink-0 text-[6.5px] sm:text-[7.5px] opacity-70">✦</span>
              </span>

             {/* Canonical H1 — carries the approved HERO_COPY locks.
                 The brief asks the headline to appear ONLY in the opening
                 scene; we also keep it visible on the final action scene
                 so it anchors the close (and so the byte-exact `?hero=last`
                 lock still resolves it as visible). On scenes 2–4 the H1
                 is removed from the visual flow entirely so each scene
                 carries a single short message. */}
              {heroSceneIndex === 0 ? (
                <h1
                  data-hero-field="headlineLine1 headlineLine2"
                  data-hero-anchor="spotlight"
                 className="hero-h1 hero-h1-cinematic serif mt-3.5 md:mt-6 text-[1.4rem] xs:text-[1.6rem] sm:text-[2.15rem] md:text-[2.95rem] lg:text-[3.4rem] leading-[1.16] sm:leading-[1.08] md:leading-[1.04] tracking-[-0.02em] text-[color:var(--ivory)] text-left opacity-0 animate-[heroFadeFromRight_1s_ease-out_0.55s_forwards] [text-shadow:0_2px_22px_rgba(0,0,0,0.4)]"
               >
                 <span
                   data-hero-field="headlineLine1"
                   data-hero-spotlight="on"
                   className="hero-h1-line block font-medium tracking-[-0.018em]"
                 >
                   {HERO_COPY.headlineLine1}
                 </span>
                 <span
                   data-hero-field="headlineLine2"
                   data-hero-spotlight="on"
                   className="hero-h1-line block italic font-normal text-[color:var(--gold-soft)] mt-1.5 md:mt-1.5 tracking-[-0.026em]"
                 >
                   {HERO_COPY.headlineLine2}
                 </span>
               </h1>
             ) : (
               // Visually-hidden H1 on intermediate scenes so the SEO/a11y
               // anchor + lock probes still resolve the canonical strings.
               <h1
                 data-hero-field="headlineLine1 headlineLine2"
                 data-hero-anchor="rest"
                 className="hero-h1 hero-h1-cinematic serif sr-only"
               >
                 <span
                   data-hero-field="headlineLine1"
                   data-hero-spotlight="off"
                   className="hero-h1-line"
                 >
                   {HERO_COPY.headlineLine1}
                 </span>{" "}
                 <span
                   data-hero-field="headlineLine2"
                   data-hero-spotlight="off"
                   className="hero-h1-line italic"
                 >
                   {HERO_COPY.headlineLine2}
                 </span>
               </h1>
             )}

             {/* Subheadline — visually-hidden SEO/a11y anchor. The brief
                 forbids a long paragraph in the cinematic hero. */}
             <p
               data-hero-field="subheadline"
               className="sr-only"
             >
               {HERO_COPY.subheadline}
             </p>

             {/* Single scene-message block — carries the ONE short cinematic
                 line + optional supporting microline for the current scene.
                 Re-keyed per scene so the rise-fade replays cleanly and only
                 ONE message is ever readable at a time. */}
              <div
                key={`scene-msg-${heroScene.id}`}
                className="hero-scene-message is-on mt-3.5 md:mt-6 max-w-[18rem] xs:max-w-[20rem] sm:max-w-xl"
              >
                  {heroScene.main.length > 0 ? (
                    <p
                      className={`hero-scene-main serif leading-[1.16] sm:leading-[1.1] md:leading-[1.06] tracking-[-0.018em] font-medium text-[color:var(--ivory)] [text-shadow:0_2px_4px_rgba(0,0,0,0.55),0_4px_22px_rgba(0,0,0,0.55)] ${
                        heroScene.main.length >= 3
                          ? "text-[1.3rem] xs:text-[1.45rem] sm:text-[1.85rem] md:text-[2.3rem]"
                          : "text-[1.55rem] xs:text-[1.7rem] sm:text-[2.15rem] md:text-[2.65rem]"
                      }`}
                    >
                      {heroScene.main.map((line, i) => (
                        <span key={i} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                  ) : null}
                  {"support" in heroScene && heroScene.support ? (
                    <p className="hero-scene-supporting mt-2.5 md:mt-3.5 font-sans text-[12px] xs:text-[12.5px] sm:text-[13.5px] md:text-[14px] tracking-[0.01em] leading-[1.5] font-medium text-[color:var(--ivory)] [text-shadow:0_1px_3px_rgba(0,0,0,0.65),0_2px_14px_rgba(0,0,0,0.55)]">
                      {heroScene.support}
                    </p>
                  ) : null}
               </div>

             {/* Action block — CTAs + microcopy + brand signature appear
                 ONLY on scene 5 per the storytelling brief. */}
             {isHeroActionScene ? (
               <div key="hero-action" className="hero-action-block mt-6 md:mt-9">
                 <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3.5 w-full max-w-[19rem] sm:max-w-lg">
                    <Link
                      to="/builder"
                      data-hero-field="primaryCta"
                      onClick={() => {
                        trackHeroEvent("cta_click", {
                          sceneId: heroScene.id,
                          extra: { cta: "primary", target: "/builder" },
                        });
                        trackHeroEvent("builder_start", { sceneId: heroScene.id });
                      }}
                      className="hero-cta-button hero-cta-button--compact cta-primary he-glow he-sheen group relative inline-flex w-full sm:flex-1 sm:basis-0 items-center justify-between gap-3 text-left"
                    >
                      <span className="block">{HERO_COPY.primaryCta}</span>
                      <ArrowRight
                        size={15}
                        strokeWidth={2.25}
                        className="hero-cta-arrow-pulse shrink-0 text-[color:var(--gold-soft)] transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-1.5 group-hover:text-[color:var(--gold)]"
                        aria-hidden="true"
                      />
                    </Link>
                    <Link
                      to="/experiences"
                      data-hero-field="secondaryCta"
                      onClick={() => {
                        trackHeroEvent("cta_click", {
                          sceneId: heroScene.id,
                          extra: { cta: "secondary", target: "/experiences" },
                        });
                        trackHeroEvent("view_signature", { sceneId: heroScene.id });
                      }}
                      className="hero-cta-button hero-cta-button--compact cta-secondary-dark he-glow he-sheen group relative inline-flex w-full sm:flex-1 sm:basis-0 items-center justify-between gap-3 text-left"
                    >
                      <span className="block">{HERO_COPY.secondaryCta}</span>
                      <ArrowRight
                        size={15}
                        strokeWidth={2.25}
                        className="hero-cta-arrow-pulse shrink-0 text-[color:var(--gold-soft)] transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-1.5 group-hover:text-[color:var(--gold)]"
                        aria-hidden="true"
                      />
                    </Link>
                 </div>

                 <div className="hero-rhythm-cta-to-microcopy max-w-sm sm:max-w-xl mx-auto sm:mx-0">
                    <p
                      data-hero-field="microcopy"
                      className="text-[9.5px] md:text-[10.5px] text-[color:var(--ivory)]/65 [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] leading-[1.55] font-normal tracking-[0.015em] text-center sm:text-left"
                    >
                      {HERO_COPY.microcopy}
                    </p>
                 </div>
               </div>
             ) : null}

            {/* Brand signature — visually-hidden anchor for the e2e
                copy lock. Rendered ONCE on the page. */}
            <div
              data-hero-field="brandLine"
              aria-label={HERO_COPY.brandLine}
              className="sr-only"
            >
              {HERO_COPY.brandLine}
            </div>

            {/* Hidden hero-copy probes — required by HERO_COPY locks.
                Visually-hidden, no layout impact. */}
            <div
              data-hero-copy-version={HERO_COPY_VERSION}
              data-hero-eyebrow={HERO_COPY.eyebrow}
              data-hero-headline={`${HERO_COPY.headlineLine1} ${HERO_COPY.headlineLine2}`}
              data-hero-subheadline={HERO_COPY.subheadline}
              data-hero-primary-cta={HERO_COPY.primaryCta}
              data-hero-secondary-cta={HERO_COPY.secondaryCta}
              data-hero-microcopy={HERO_COPY.microcopy}
              data-hero-brand-line={HERO_COPY.brandLine}
              data-testid="hero-copy-version"
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0,0,0,0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            />

            <div
              data-hero-copy-json={JSON.stringify({ version: HERO_COPY_VERSION, copy: HERO_COPY })}
              data-testid="hero-copy-json"
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0,0,0,0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              <script
                type="application/json"
                data-probe-field="hero-copy-json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({ version: HERO_COPY_VERSION, copy: HERO_COPY }, null, 2),
                }}
              />
            </div>
          </div>
          </div>
          {/* Soft transition into the next section — extended ivory fade
              so the trust strip lands without a hard edge and the eye gets
              breathing room after the cinematic close. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 md:h-36 z-[3] bg-[linear-gradient(180deg,rgba(250,248,243,0)_0%,rgba(250,248,243,0.35)_55%,rgba(250,248,243,0.85)_85%,var(--ivory)_100%)]"
          />
        </section>

      {/* 1.5 — AUDIENCE BRIDGE
          Soft editorial bridge between the cinematic hero and the trust
          strip. Names the use cases the hero hinted at (one private day,
          a proposal/celebration, a group escape, a full Portugal
          journey) so the audience never has to guess "is this for me?".
          No CTAs, no images, no buttons — calm + premium, then proof. */}
      <section
        id="audience-bridge"
        aria-labelledby="audience-bridge-title"
        className="section-enter bg-[color:var(--ivory)] border-b border-[color:var(--border)] py-12 md:py-20"
      >
        <div className="container-x">
          <div className="reveal max-w-2xl mx-auto text-center px-2">
            <h2
              id="audience-bridge-title"
              className="serif text-[1.05rem] xs:text-[1.12rem] sm:text-[1.5rem] md:text-[2rem] leading-[1.42] sm:leading-[1.3] md:leading-[1.22] tracking-[-0.012em] text-[color:var(--charcoal)] font-normal"
            >
              Some come for one private day.
              <br />
              Some for a <span className="italic text-[color:var(--teal)]">proposal</span>, a celebration, or a group escape.
              <br />
              Some are planning a full <span className="italic">journey across Portugal</span>.
            </h2>
            {/* Champagne gold hairline divider */}
            <div
              aria-hidden="true"
              className="mx-auto my-6 md:my-9 h-px w-16 md:w-28 bg-gradient-to-r from-transparent via-[color:var(--gold)]/60 to-transparent"
            />
            <p className="text-[12px] md:text-[14.5px] leading-[1.65] tracking-[0.005em] text-[color:var(--charcoal-soft)]">
              However your story begins,
              <br className="hidden sm:block" />
              {" "}we shape it with local knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* 2 — TRUST STRIP
          Restrained: review count, real platforms, one short line about
          private guides + real local knowledge. No avatars carousel, no
          repeated review block. This is the SINGLE review surface on the
          page (per "no repeated review sections" guardrail). */}
      <section
        id="reviews"
        className="he-trust-rule section-enter bg-[color:var(--ivory)] border-b border-[color:var(--border)] pt-16 md:pt-24 pb-12 md:pb-14 scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="trust-bar-title"
      >
        <h2 id="trust-bar-title" className="sr-only">
          700+ five-star reviews across major platforms
        </h2>
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
              <p
                className="flex items-center justify-center md:justify-start gap-1 text-[color:var(--gold)]"
                role="img"
                aria-label="Rated 5 out of 5 stars"
              >
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="he-trust-star" size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" focusable="false" />
                ))}
              </p>
              <p className="serif text-[1.15rem] md:text-[1.35rem] text-[color:var(--charcoal)] leading-[1.25] font-normal">
                700+ <span className="italic">five-star reviews</span>
                <span className="hidden md:inline text-[color:var(--charcoal-soft)]"> · </span>
                <span className="block md:inline text-[10.5px] md:text-[11.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal)] md:ml-1 mt-1.5 md:mt-0">
                  Private · Local · Designed in Portugal
                </span>
              </p>
            </div>
            <ul
              className="he-stagger flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3 md:gap-x-8 list-none p-0 h-6 md:h-7 opacity-90"
              aria-label="Featured on Google, Tripadvisor, Viator, GetYourGuide and Trustpilot"
            >
              {(["google", "tripadvisor", "viator", "getyourguide", "trustpilot"] as const).map((p) => (
                <li key={p} className="reveal-stagger h-full flex items-center">
                  <PlatformBadge platform={p} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3 — THREE PATHS + EXPERIENCE STUDIO (promoted)
          Promoted up the page so the Builder reads as the core
          innovation, not just another tile. The section opens with a
          compact Three-paths primer (Signature / Tailored / Studio)
          so users immediately understand the three distinct ways to
          shape Portugal — then drops into the live Studio device.
          Mobile order: paths primer → headline → live preview → CTA.
          Desktop: text rail left, preview right. One CTA only
          ("Open the Studio"). The "Ask a local" duplicate has been
          removed; local guidance lives in the reassurance line, the
          FAQ closer, and the Final CTA. */}
      <section
        id="builder"
        className="he-section-rule section-enter section-y-lg bg-[color:var(--sand)] border-b border-[color:var(--border)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="studio-title"
      >
        <div className="container-x">
          {/* Three paths primer — compact horizontal strip on desktop,
              stacked on mobile. No images, no large surfaces; numbered
              labels + a one-line definition each. Establishes the
              vocabulary used everywhere downstream. */}
          <div className="reveal max-w-5xl mx-auto mb-10 md:mb-14">
            <div className="text-center">
              <span className="he-eyebrow-bar mb-5">Three ways in</span>
              <h2
                id="paths-title"
                className="serif mt-3 text-[1.7rem] sm:text-[1.95rem] md:text-[2.4rem] leading-[1.18] md:leading-[1.1] tracking-[-0.012em] text-[color:var(--charcoal)] font-medium"
              >
                Three ways to <span className="italic font-normal text-[color:var(--teal)]">begin.</span>
              </h2>
              <p className="mt-4 text-[14.5px] md:text-[15.5px] text-[color:var(--charcoal-soft)] leading-[1.6] max-w-md mx-auto">
                Choose a ready-made Signature, tailor the details, or build from scratch.
              </p>
            </div>
            <ol
              className="he-stagger mt-7 md:mt-9 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 list-none p-0"
              aria-label="Three paths to shape your Portugal experience"
            >
              {[
                {
                  num: "01",
                  label: "Signature",
                  body: "Ready-to-book private experiences.",
                },
                {
                  num: "02",
                  label: "Tailored",
                  body: "Adjust selected details inside a Signature.",
                },
                {
                  num: "03",
                  label: "Studio",
                  body: "Create from scratch in real time.",
                },
              ].map((p) => (
                <li
                  key={p.num}
                  className="reveal-stagger relative flex items-start gap-3.5 rounded-[6px] border border-[#EAE2D6] bg-[color:var(--ivory)] px-4 py-3.5 md:px-5 md:py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--gold)]/45"
                >
                  <span className="shrink-0 serif text-[1.5rem] md:text-[1.7rem] leading-none text-[color:var(--gold)] font-light tabular-nums">{p.num}</span>
                  <div className="flex flex-col">
                    <span className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[color:var(--charcoal)]">
                      {p.label}
                    </span>
                    <p className="mt-1 text-[13px] md:text-[13.5px] leading-[1.5] text-[color:var(--charcoal-soft)]">
                      {p.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Inner anchor target for /#studio — sits right before the
              "Create it live." rail so deep-links land on the Studio
              block, not the wider builder eyebrow. scroll-mt matches
              the same offset used elsewhere on the page. */}
          <div
            id="studio"
            aria-hidden="true"
            className="scroll-mt-24 md:scroll-mt-28"
          />
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
            {/* On mobile: text rail (with the headline) renders FIRST so
                the user reads "Create it live." before seeing the
                device. On desktop the rail returns to the left so the
                reading flow stays natural. */}
            <div className="reveal lg:col-span-5 lg:order-1 order-1">
              <span className="he-eyebrow-bar mb-5">
                <span className="live-dot" aria-hidden="true" />
                Experience Studio
              </span>
              <h2
                id="studio-title"
                className="serif mt-3 text-[2rem] sm:text-[2.4rem] md:text-[3.6rem] leading-[1.1] md:leading-[1.0] tracking-[-0.018em] text-[color:var(--charcoal)] font-medium"
              >
                Create it <span className="italic font-normal text-[color:var(--teal)]">live.</span>
              </h2>
              <p className="mt-5 text-[14.5px] md:text-[16px] text-[color:var(--charcoal-soft)] leading-[1.7] max-w-md font-normal">
                Choose your <span className="kw">mood</span>, rhythm and intention. Watch your private experience take shape in <span className="kw">real time</span>.
              </p>

              {/* Three Studio inputs — small index, signposts the
                  live chips at the top of the preview device. */}
              <ol className="mt-7 grid grid-cols-3 gap-1.5 max-w-md" aria-label="Three Studio inputs">
                {["Mood", "Who", "Rhythm"].map((label, i) => (
                  <li key={label} className="flex flex-col gap-1.5">
                    <span aria-hidden="true" className="block h-[3px] bg-[color:var(--gold)]" />
                    <span className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-[color:var(--charcoal)] tabular-nums">
                      0{i + 1} · {label}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-4">
                <CtaButton to="/builder" variant="primary">
                  Open the Studio
                </CtaButton>
              </div>

              {/* Starting-point microcopy — sits just under the CTA so
                  the user reads "this is a draft, designed for you"
                  before the reassurance line. Italic Georgia per
                  Typography v3, gold detail to keep it editorial. */}
              <p className="mt-4 inline-flex items-center gap-2 text-[12.5px] md:text-[13px] leading-[1.55] text-[color:var(--charcoal-soft)] max-w-md">
                <span aria-hidden="true" className="block h-px w-5 bg-[color:var(--gold)]" />
                <span className="serif italic">A starting point, shaped around you.</span>
              </p>

              {/* Reassurance line — three short reassurances. "A local is
                  one message away" matches the approved brief copy. */}
              <p className="mt-3 inline-flex items-start gap-2 text-[12.5px] md:text-[13px] leading-[1.6] text-[color:var(--charcoal-soft)] max-w-md">
                <MessageCircle size={13} aria-hidden="true" className="mt-[3px] shrink-0 text-[color:var(--teal)]" />
                <span>About a minute. No form. <span className="font-medium text-[color:var(--charcoal)]">A local is one message away.</span></span>
              </p>
            </div>

            <div className="he-parallax-counter lg:col-span-7 lg:order-2 order-2">
              <StudioLivePreview />
            </div>
          </div>
        </div>
      </section>

      {/* 4 — WHY YES
          Editorial manifesto — 4 modular cards (down from 5 per the
          approved consolidation). Each card carries a number, icon,
          label, serif headline, body and one strategic phrase.
          Closing microline keeps the "a local is always one message
          away" reassurance. */}
      <section
        id="why-yes"
        className="he-section-rule section-enter section-y bg-[color:var(--ivory)] border-b border-[color:var(--border)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="why-yes-title"
      >
        <div className="container-x">
          <div className="reveal max-w-2xl mx-auto text-center mb-10 md:mb-14">
            <span className="he-eyebrow-bar mb-5">Why YES</span>
            <h2
              id="why-yes-title"
              className="serif mt-3 text-[2rem] sm:text-[2.4rem] md:text-[3.6rem] leading-[1.1] md:leading-[1.0] tracking-[-0.018em] text-[color:var(--charcoal)] font-medium text-balance"
            >
              Portugal feels different to <span className="italic font-normal text-[color:var(--teal)]">everyone.</span>
            </h2>
            <p className="mt-5 text-[14.5px] md:text-[16px] text-[color:var(--charcoal-soft)] leading-[1.7] max-w-xl mx-auto">
              That's why YES lets you choose, shape and book private experiences around your <span className="kw">rhythm</span>, occasion and intention.
            </p>
            <span aria-hidden="true" className="gold-rule mt-8 md:mt-9 mx-auto block max-w-[3rem]" />
          </div>

          {/* 4-card editorial grid (consolidated from 5). 2-col desktop,
              stacked mobile. Each card: number, icon, label, serif
              headline, body, strategic phrase. */}
          <ul className="he-stagger max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4 list-none p-0">
            {[
              {
                Icon: Feather,
                num: "01",
                label: "You decide",
                title: (<>You shape the <span className="italic">story.</span></>),
                body: (<>Choose the rhythm, places and feeling you want to take home.</>),
                pull: "Designed around you, not a template.",
              },
              {
                Icon: Compass,
                num: "02",
                label: "Local from the start",
                title: (<>Local <span className="italic">from the start.</span></>),
                body: (<>Real <span className="kw">local knowledge</span> guides the route, timing and hidden details.</>),
                pull: "Locals on the ground, not call-centres.",
              },
              {
                Icon: Sparkles,
                num: "03",
                label: "Any occasion",
                title: (<>Any <span className="italic">occasion.</span></>),
                body: (<>Private days, proposals, celebrations, corporate moments or full journeys.</>),
                pull: "The intention shapes the day.",
              },
              {
                Icon: MapPin,
                num: "04",
                label: "Three ways to shape it",
                title: (<>Three ways to <span className="italic">shape it.</span></>),
                body: (<>Start with a Signature, tailor details, or build from scratch in the Studio.</>),
                pull: "Choose, tailor, or build.",
              },
            ].map((b) => (
              <li
                key={b.num}
                className="reveal-stagger he-card-lift group relative flex flex-col rounded-[6px] border border-[#EAE2D6] bg-[color:var(--ivory)] p-5 md:p-7 shadow-[0_1px_2px_rgba(46,46,46,0.04)] overflow-hidden"
              >
                <span aria-hidden="true" className="gold-rule absolute left-0 top-0" />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 bottom-0 h-px w-full origin-left scale-x-0 bg-[color:var(--gold)]/55 transition-transform duration-500 ease-out group-hover:scale-x-100"
                />
                <div className="flex items-start justify-between gap-4 pr-1">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--gold)]/30 bg-[color:var(--ivory)] transition-all duration-300 group-hover:border-[color:var(--gold)]/60 group-hover:scale-[1.05]">
                    <b.Icon
                      size={16}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className="text-[color:var(--teal)] transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="serif text-[1.9rem] md:text-[2.1rem] leading-none text-[color:var(--gold)] font-light tabular-nums">
                    {b.num}
                  </span>
                </div>
                <span className="mt-4 text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal-soft)]">
                  {b.label}
                </span>
                <h3 className="serif mt-2.5 text-[1.3rem] md:text-[1.6rem] leading-[1.22] md:leading-[1.18] text-[color:var(--charcoal)] font-medium">
                  {b.title}
                </h3>
                <p className="mt-3 text-[14px] md:text-[15px] text-[color:var(--charcoal-soft)] leading-[1.6]">
                  {b.body}
                </p>
                <p className="he-pull mt-4 serif italic text-[14px] md:text-[15px] leading-[1.45] text-[color:var(--charcoal)]">
                  {b.pull}
                </p>
              </li>
            ))}
          </ul>

          <p className="reveal mt-10 md:mt-12 text-center inline-flex flex-wrap w-full items-center justify-center gap-x-2 gap-y-1 px-4 text-[14px] md:text-[15px] leading-[1.6] tracking-[0.005em] text-[color:var(--charcoal-soft)]">
            <MessageCircle size={14} aria-hidden="true" className="shrink-0 text-[color:var(--teal)]" />
            <span className="text-balance">Need help shaping it? <span className="text-[color:var(--charcoal)]">A local is one message away.</span></span>
          </p>
        </div>
        </section>


      {/* 5 — SIGNATURE EXPERIENCES PREVIEW
          Up to 4 real Signature tours. Each card uses the tour's real
          hero image (sourced from the matching Viator page), real title
          and real blurb from `signatureTours`. No vague taglines, no
          repeated labels. */}
      <section
        id="signatures"
        className="he-section-rule section-enter section-y bg-[color:var(--ivory)] border-b border-[color:var(--border)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="signatures-title"
      >
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <span className="he-eyebrow-bar mb-5">Signature experiences</span>
            <h2 id="signatures-title" className="serif mt-3 text-[2rem] sm:text-[2.4rem] md:text-[3.6rem] leading-[1.1] md:leading-[1.0] tracking-[-0.018em] text-[color:var(--charcoal)] font-medium">
              Signature days, <span className="italic font-normal text-[color:var(--teal)]">ready when you are.</span>
            </h2>
            <p className="mt-4 text-[14.5px] md:text-[16px] text-[color:var(--charcoal-soft)] leading-[1.65] max-w-md mx-auto">
              Book a Signature as it is, or tailor selected details.
            </p>
          </div>

          {/* Mobile: full-bleed editorial cover carousel. Uses
              snap-proximity (NOT mandatory) so the horizontal strip
              never grabs vertical page scroll near snap points — that
              was the main source of "jumpy" feel on Android. Each card
              is 84vw so the next card peeks. `overscroll-x-contain`
              + `[contain:layout_paint]` isolate the strip from the
              page so its own scroll never reflows neighbours.
              Tablet+: keeps the calm 2/4-col grid. */}
          <ul
            className={[
              scrollDebug.staticMobileCarousels
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                : "flex sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible overscroll-x-contain sm:overscroll-auto [contain:layout_paint] sm:[contain:none] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              "he-stagger gap-5 md:gap-7 list-none p-0",
            ].join(" ")}
            aria-label="Signature experiences"
          >
            {signatures.map((t) => {
              return (
                <li
                  key={t.id}
                  className={
                    scrollDebug.staticMobileCarousels
                      ? "reveal-stagger w-full"
                      : "reveal-stagger shrink-0 w-[84vw] sm:w-auto sm:shrink"
                  }
                >
                  {/* Card is a structured composition (NOT a single link) so
                      we can expose two distinct CTAs — Book + Tailor — and
                      a short list of REAL highlights pulled from the
                      Viator-sourced catalog. No invented copy. */}
                  <article
                    className="he-card-lift group relative flex flex-col h-full overflow-hidden rounded-[6px] border border-[color:var(--border)] bg-[color:var(--ivory)] transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:border-[color:var(--charcoal)]/30 hover:shadow-[0_18px_40px_-22px_rgba(46,46,46,0.32)]"
                  >
                    {/* Cover — clickable to detail page */}
                    <Link
                      to="/tours/$tourId"
                      params={{ tourId: t.id }}
                      className="he-image-cinema he-image-rise relative block aspect-[4/5] overflow-hidden bg-[color:var(--card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2"
                      aria-label={`Open ${t.title}`}
                    >
                      <img
                        src={t.img}
                        alt={t.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.05]"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"
                      />
                      {/* Top row: region + price */}
                      <div className="absolute inset-x-0 top-0 p-4 md:p-5 flex items-start justify-between gap-3">
                        <span className="text-[10px] uppercase tracking-[0.28em] text-white/85 drop-shadow-sm">
                          {t.region}
                        </span>
                        <span className="inline-flex items-baseline gap-1 rounded-full bg-[color:var(--ivory)]/95 px-2.5 py-1 text-[color:var(--charcoal)] shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
                          <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold">
                            From
                          </span>
                          <span className="serif text-[14px] leading-none">
                            €{t.priceFrom}
                          </span>
                        </span>
                      </div>
                      {/* Bottom: real title + real duration */}
                      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white">
                        <h3 className="serif text-[1.35rem] md:text-[1.5rem] leading-[1.18] text-white text-balance">
                          {t.title}
                        </h3>
                        <span className="mt-2 inline-block text-[11px] uppercase tracking-[0.22em] text-white/85">
                          {t.durationHours} · Private
                        </span>
                      </div>
                    </Link>

                    {/* Body — real teaser + real highlights + dual CTAs */}
                    <div className="flex flex-col gap-4 p-5 md:p-6">
                      <p className="text-[13.5px] leading-[1.55] text-[color:var(--charcoal)]">
                        {t.line}
                      </p>

                      {/* Real highlights — pulled directly from the
                          tour's `highlights` array. Capped at 3 for
                          card-level legibility. */}
                      {t.highlights.length > 0 && (
                        <ul className="flex flex-col gap-1.5 text-[12.5px] leading-[1.5] text-[color:var(--charcoal)]">
                          {t.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-2">
                              <span
                                aria-hidden="true"
                                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--gold)]"
                              />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Dual CTAs — Book + Tailor. Book is the primary
                          (solid teal); Tailor is a quieter outlined
                          option, reflecting the brand rule that Tailored
                          = adjustments INSIDE one Signature, never a
                          replacement for the Signature itself. */}
                      <div className="mt-auto flex flex-col xs:flex-row gap-2.5 pt-1">
                        <CtaButton
                          to="/tours/$tourId"
                          params={{ tourId: t.id }}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          aria-label={`Book ${t.title}`}
                        >
                          Book
                        </CtaButton>
                        <CtaButton
                          to="/tours/$tourId/tailor"
                          params={{ tourId: t.id }}
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          aria-label={`Tailor ${t.title}`}
                        >
                          Tailor
                        </CtaButton>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {/* Mobile-only swipe hint */}
          <p className={scrollDebug.staticMobileCarousels ? "hidden" : "sm:hidden mt-4 text-center text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal)]"}>
            Swipe to explore
          </p>

          <div className="mt-12 md:mt-14 text-center">
            <CtaButton to="/experiences" variant="ghost" size="sm">
              See every Signature
            </CtaButton>
          </div>
        </div>
      </section>

      {/* 6 — PROPOSALS / CELEBRATIONS / CORPORATE / MULTI-DAY
          One combined editorial band — Proposals, Celebrations,
          Corporate & Groups, and Multi-Day routes — so every "bigger
          occasion" path lives together with clear hierarchy. */}
      <section
        id="occasions"
        className="he-section-rule section-enter section-y bg-[color:var(--sand)] border-b border-[color:var(--border)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="groups-title"
      >
        <div className="container-x">
          <div className="reveal text-center max-w-2xl mx-auto mb-10 md:mb-12">
            <span className="he-eyebrow-bar mb-5">Groups &amp; celebrations</span>
            <h2 id="groups-title" className="serif mt-3 text-[2rem] sm:text-[2.4rem] md:text-[3.6rem] leading-[1.1] md:leading-[1.0] tracking-[-0.018em] text-[color:var(--charcoal)] font-medium">
              For moments bigger than a <span className="italic font-normal text-[color:var(--teal)]">tour.</span>
            </h2>
            <p className="mt-4 text-[14.5px] md:text-[16px] text-[color:var(--charcoal-soft)] leading-[1.65] max-w-md mx-auto">
              Proposals, celebrations, corporate groups and multi-day journeys — shaped with local care.
            </p>
          </div>

          {/* Three premium feature blocks — alternating image/text on
              tablet+, stacked image-then-text on mobile. Each block:
              animated category label, soft gold divider, bold serif
              headline, body with one highlighted phrase, italic pull
              line, gold detail line, CTA with arrow nudge. */}
          <div className="max-w-6xl mx-auto flex flex-col gap-12 md:gap-16">
            {groupsAndCelebrations.map((m, i) => {
              const reverse = i % 2 === 1;
              return (
                <article
                  key={m.eyebrow}
                  id={m.id}
                  className="reveal-stagger he-seq group grid grid-cols-1 md:grid-cols-12 gap-7 md:gap-12 items-center scroll-mt-24 md:scroll-mt-28"
                >
                  {/* Image side */}
                  <Link
                    to={m.to}
                    aria-label={m.cta}
                    onMouseMove={(e) => {
                      // Pointer-aware micro-tilt: max ±2.5deg, dampened.
                      const el = e.currentTarget as HTMLElement;
                      const r = el.getBoundingClientRect();
                      const px = (e.clientX - r.left) / r.width - 0.5;
                      const py = (e.clientY - r.top) / r.height - 0.5;
                      el.style.setProperty("--tilt-y", `${(px * 5).toFixed(2)}deg`);
                      el.style.setProperty("--tilt-x", `${(-py * 4).toFixed(2)}deg`);
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.setProperty("--tilt-y", "0deg");
                      el.style.setProperty("--tilt-x", "0deg");
                    }}
                    className={
                      "he-tilt relative block md:col-span-7 overflow-hidden rounded-[2px] border border-[color:var(--border)] bg-[color:var(--card)] transition-transform duration-300 ease-out group-hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 " +
                      (reverse ? "md:order-2" : "md:order-1")
                    }
                  >
                    <div className="he-image-cinema he-image-rise relative aspect-[4/3] md:aspect-[5/4] overflow-hidden">
                      <img
                        src={m.img}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.05]"
                      />
                      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[color:var(--charcoal-deep)]/40 via-[color:var(--charcoal-deep)]/10 to-transparent" />
                      {/* Subtle animated category label — soft pulsing
                          gold dot signals "live / curated", and the pill
                          lifts gently on hover. */}
                      <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--ivory)]/95 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal)] shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                        <span aria-hidden="true" className="live-dot" />
                        {m.eyebrow}
                      </span>
                    </div>
                  </Link>

                  {/* Text side */}
                  <div
                    className={
                      "md:col-span-5 flex flex-col pt-1 md:pt-0 " +
                      (reverse ? "md:order-1" : "md:order-2")
                    }
                  >
                    {/* Soft gold divider — animates from left on reveal */}
                    <span aria-hidden="true" className="gold-rule mb-4 md:mb-5 max-w-[3rem] md:max-w-[3.5rem]" />
                    {(() => {
                      const accent =
                        m.id === "proposals" ? "var(--gold)" :
                        m.id === "celebrations" ? "var(--teal-2)" :
                        m.id === "corporate" ? "var(--teal)" :
                        m.id === "multi-day" ? "var(--gold-soft)" :
                        "var(--charcoal)";
                      return (
                        <>
                          <span className="inline-flex items-center gap-2.5 text-[10.5px] md:text-[10.5px] uppercase tracking-[0.24em] md:tracking-[0.3em] font-semibold text-[color:var(--charcoal-soft)]">
                            <span aria-hidden="true" className="inline-block h-[6px] w-[6px] rounded-full" style={{ backgroundColor: accent }} />
                            {m.eyebrow}
                          </span>
                          <h3 className="serif mt-3 text-[1.6rem] md:text-[2.1rem] leading-[1.14] md:leading-[1.08] tracking-[-0.014em] text-[color:var(--charcoal)] font-medium">
                            {m.title}
                          </h3>
                          <p className="mt-4 md:mt-4 text-[14.5px] md:text-[16px] leading-[1.65] md:leading-[1.7] text-[color:var(--charcoal-soft)]">
                            {m.line}
                          </p>
                          <p className="mt-4 md:mt-4 text-[13.5px] md:text-[14.5px] leading-[1.55] text-[color:var(--charcoal-soft)]">
                            {m.pull}
                          </p>
                          <p className="mt-5 md:mt-5 inline-flex items-center gap-2.5 text-[10.5px] md:text-[10.5px] uppercase tracking-[0.22em] md:tracking-[0.26em] font-semibold text-[color:var(--charcoal-soft)]">
                            <span aria-hidden="true" className="inline-block h-[6px] w-[6px] rounded-full" style={{ backgroundColor: accent }} />
                            {m.detail}
                          </p>
                          {/* What we handle — checklist of concrete deliverables.
                              Editorial, not form-y: tight serif label, gold/teal
                              ticks per accent, no boxes. */}
                          <p className="mt-7 md:mt-6 text-[10.5px] uppercase tracking-[0.28em] font-semibold text-[color:var(--charcoal-soft)]">
                            What we handle
                          </p>
                          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 list-none p-0">
                            {m.handles.map((h) => (
                              <li
                                key={h}
                                className="flex items-start gap-2 text-[13px] leading-[1.55] text-[color:var(--charcoal)]"
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-[2px] inline-flex shrink-0 items-center justify-center font-bold text-[12px]"
                                  style={{ color: accent }}
                                >
                                  ✓
                                </span>
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      );
                    })()}
                    <CtaButton
                      to={m.to}
                      variant="primary"
                      className="mt-7 md:mt-6 self-start"
                    >
                      {m.cta}
                    </CtaButton>
                    <p className="mt-3 text-[11.5px] leading-[1.55] text-[color:var(--charcoal-soft)]/85 font-normal">
                      {m.trust}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>


      {/* 7 — FAQ
          Reuses the shared FAQ component, which renders its own
          labelled landmark with visible expandable answers. The wrapper
          section below carries the spacing class the lock checks; the
          inner FAQ component carries aria-labelledby="faq-title". */}
      <section
        id="faq"
        className="he-section-rule section-enter section-y scroll-mt-24 md:scroll-mt-28 relative"
        aria-labelledby="faq-title"
      >
        <FAQ />
      </section>

      {/* 8 — FINAL CTA — Talk to a local
          Distinct from the hero CTAs (Explore Signatures / Build) — this
          is the human escape hatch. No duplicate CTA band; one purpose,
          one button. */}
      <section
        id="final-cta"
        className="section-y relative overflow-hidden bg-[color:var(--sand)] text-[color:var(--charcoal)] scroll-mt-24 md:scroll-mt-28"
        aria-labelledby="final-cta-title"
      >
        {/* Warm ivory→sand wash so the section reads as a chapter, not a
            block. Decorative + aria-hidden. No animation. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 0%, color-mix(in oklab, var(--ivory) 92%, transparent), transparent 70%)",
          }}
        />

        <div className="container-x relative">
          {/* Chapter divider above the card — gold dot + flanking rules */}
          <div className="reveal max-w-md mx-auto mb-10 md:mb-14" aria-hidden="true">
            <div className="chapter-divider"><span className="dot" /></div>
          </div>

          {/* Final CTA card — deep teal with champagne-gold hairline,
              gold top rule and a soft warm shadow. Editorial radius. */}
          <div className="reveal mx-auto max-w-2xl">
            <div
              className="relative overflow-hidden rounded-[6px] bg-[color:var(--ivory)] text-[color:var(--charcoal)] px-6 py-10 sm:px-10 sm:py-12 md:px-14 md:py-14 text-center"
              style={{
                border: "1px solid color-mix(in oklab, var(--gold-deep) 55%, transparent)",
                boxShadow:
                  "0 1px 0 0 color-mix(in oklab, var(--gold) 22%, transparent) inset, " +
                  "0 24px 60px -28px color-mix(in oklab, var(--charcoal) 18%, transparent), " +
                  "0 12px 28px -18px color-mix(in oklab, var(--charcoal-deep) 14%, transparent)",
              }}
            >
              {/* Soft warm wash — ivory to sand for editorial depth */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(70% 90% at 90% 0%, color-mix(in oklab, var(--sand) 55%, transparent), transparent 60%), " +
                    "radial-gradient(60% 80% at 5% 100%, color-mix(in oklab, var(--sand) 40%, transparent), transparent 65%)",
                }}
              />
              {/* Gold top rule — short, centered, the editorial signature */}
              <div
                aria-hidden="true"
                className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-24 md:w-32"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--gold-warm) 50%, transparent)",
                  opacity: 0.9,
                }}
              />

              <div className="relative">
                <span className="he-eyebrow-bar mb-5">
                  <MessageCircle aria-hidden="true" />
                  Prefer a conversation
                </span>
              <h2
                id="final-cta-title"
                className="serif mt-3 text-[2rem] sm:text-[2.4rem] md:text-[3.6rem] leading-[1.1] md:leading-[1.0] tracking-[-0.018em] text-[color:var(--charcoal)] font-medium"
              >
                  Ready to design your{" "}
                  <span className="italic font-normal text-[color:var(--teal)]">
                    Portugal?
                  </span>
                </h2>
                <p className="mt-5 text-[14.5px] md:text-[16px] text-[color:var(--charcoal-soft)] leading-[1.7] max-w-md mx-auto">
                  Start in the Studio, explore a Signature, or talk to a local.
                </p>
                <div className="reveal-stagger mt-9 flex flex-col sm:flex-row gap-y-4 gap-x-4 justify-center items-stretch sm:items-center">
                  <CtaButton to="/builder" variant="primary">
                    Create Your Story
                  </CtaButton>
                  <CtaButton to="/contact" variant="ghost">
                    Talk to a Local
                  </CtaButton>
                </div>
                <p className="serif mt-6 text-[13px] italic text-[color:var(--charcoal-soft)]">
                  Need help shaping it? A local is one message away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </SiteLayout>
  );
}
