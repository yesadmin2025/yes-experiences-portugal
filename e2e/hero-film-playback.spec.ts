/**
 * Hero film — playback smoothness check.
 *
 * Verifies the re-encoded 30fps hero film actually:
 *   1. Loads metadata and starts playing after the route mounts (no
 *      autoplay rejection / decode failure).
 *   2. Reports 30fps source (catches accidental re-encode regressions).
 *   3. Advances currentTime monotonically during a 1s sample window
 *      with NO frame drops above tolerance — quantified via
 *      `getVideoPlaybackQuality()` (totalVideoFrames / droppedVideoFrames).
 *
 * Runs at desktop (1280×720) and mobile (393×851) — the canonical
 * viewports the team browses on. Mobile is where decode pressure is
 * highest, so the dropped-frame budget there is more lenient (5%).
 */
import { test, expect, devices, type Page } from "@playwright/test";
import path from "path";
import {
  FIRST_FRAME_JITTER_RATIO,
  isFirstFrameJitter,
} from "./hero-film-playback.helpers";

const VIDEO_SELECTOR = ".hero-story-stage video[data-hero-film='true']";

type PlaybackProbe = {
  readyState: number;
  paused: boolean;
  startTime: number;
  endTime: number;
  elapsed: number;
  totalFrames: number;
  droppedFrames: number;
  videoWidth: number;
  videoHeight: number;
};

async function waitForVideoMetadata(page: Page) {
  await page.locator(VIDEO_SELECTOR).waitFor({ state: "attached" });
  await page.evaluate(
    (sel) =>
      new Promise<void>((resolve) => {
        const v = document.querySelector(sel) as HTMLVideoElement | null;
        if (!v) return resolve();
        if (v.readyState >= 1) return resolve();
        v.addEventListener("loadedmetadata", () => resolve(), { once: true });
      }),
    VIDEO_SELECTOR,
  );
}

/**
 * Wait until the video reports playing (paused === false AND currentTime
 * advances on a rAF tick), then sample a 1.2s playback window.
 */
async function probePlayback(page: Page): Promise<PlaybackProbe> {
  return page.evaluate(async (sel) => {
    const v = document.querySelector(sel) as HTMLVideoElement | null;
    if (!v) throw new Error("hero film not found");

    // Some browsers need a kickstart if autoplay rejected silently.
    if (v.paused) {
      try {
        await v.play();
      } catch {
        /* noop — surfaced below via paused check */
      }
    }

    // Wait up to 2s for currentTime to actually start advancing.
    const beforeT = v.currentTime;
    const startedAt = performance.now();
    while (performance.now() - startedAt < 2000) {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      if (!v.paused && v.currentTime > beforeT + 0.05) break;
    }

    const startTime = v.currentTime;
    const startQuality =
      typeof v.getVideoPlaybackQuality === "function"
        ? v.getVideoPlaybackQuality()
        : null;
    const startFrames = startQuality?.totalVideoFrames ?? 0;
    const startDropped = startQuality?.droppedVideoFrames ?? 0;

    // Sample a 1.2s window — long enough to span ~36 frames @ 30fps.
    await new Promise((r) => setTimeout(r, 1200));

    const endTime = v.currentTime;
    const endQuality =
      typeof v.getVideoPlaybackQuality === "function"
        ? v.getVideoPlaybackQuality()
        : null;
    const endFrames = endQuality?.totalVideoFrames ?? 0;
    const endDropped = endQuality?.droppedVideoFrames ?? 0;

    return {
      readyState: v.readyState,
      paused: v.paused,
      startTime,
      endTime,
      elapsed: endTime - startTime,
      totalFrames: endFrames - startFrames,
      droppedFrames: endDropped - startDropped,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
    };
  }, VIDEO_SELECTOR);
}

const VIEWPORTS = [
  {
    name: "desktop 1280×720",
    use: { viewport: { width: 1280, height: 720 } },
    droppedFrameRatioMax: 0.03, // ≤3% on desktop CI
    firstFrameBudgetMs: 2000, // first decoded frame within 2s on desktop
  },
  {
    name: "mobile 393×851 (iPhone 14)",
    use: {
      ...devices["iPhone 14"],
      viewport: { width: 393, height: 851 },
    },
    droppedFrameRatioMax: 0.05, // ≤5% under mobile decode pressure
    firstFrameBudgetMs: 2500, // mobile decode pressure → +500ms slack
  },
] as const;

for (const vp of VIEWPORTS) {
  test.describe(`Hero film playback smoothness — ${vp.name}`, () => {
    test.use(vp.use);

    test("video loads, plays, and advances smoothly", async ({ page }) => {
      await page.goto("/");
      await waitForVideoMetadata(page);

      const probe = await probePlayback(page);

      // 1. Decoder is ready and playback is unpaused.
      expect(
        probe.readyState,
        `video readyState too low: ${probe.readyState}`,
      ).toBeGreaterThanOrEqual(2);
      expect(
        probe.paused,
        "video remained paused — autoplay rejected or decode failed",
      ).toBe(false);

      // 2. currentTime advanced at near-real-time during the 1.2s window.
      //    Allow 30% slack for CI scheduling jitter.
      expect(
        probe.elapsed,
        `currentTime barely moved: Δ=${probe.elapsed.toFixed(3)}s over 1.2s window`,
      ).toBeGreaterThan(0.84);

      // 3. Source dimensions match the 1080×1920 portrait (or 720×1280
      //    on Save-Data). The router picks one based on `saveDataMode`.
      expect([1080, 720]).toContain(probe.videoWidth);

      // 4. Dropped-frame budget. Skip when the browser doesn't expose
      //    getVideoPlaybackQuality (probe.totalFrames === 0).
      if (probe.totalFrames > 0) {
        const ratio = probe.droppedFrames / probe.totalFrames;
        expect(
          ratio,
          `dropped ${probe.droppedFrames}/${probe.totalFrames} frames (${(ratio * 100).toFixed(1)}%) — exceeds ${(vp.droppedFrameRatioMax * 100).toFixed(0)}% budget`,
        ).toBeLessThanOrEqual(vp.droppedFrameRatioMax);
      }
    });

    test("hero film source is 30fps (catches re-encode regressions)", async ({
      page,
    }) => {
      // We can't read fps directly from HTMLVideoElement, but we can
      // approximate it: getVideoPlaybackQuality counts decoded frames,
      // and the canonical film is ~39.6s. After 1.2s playback we expect
      // ~36 decoded frames @ 30fps (±20% for jitter / dropped frames).
      await page.goto("/");
      await waitForVideoMetadata(page);
      const probe = await probePlayback(page);

      if (probe.totalFrames > 0 && probe.elapsed > 0.84) {
        const observedFps = probe.totalFrames / probe.elapsed;
        expect(
          observedFps,
          `observed ~${observedFps.toFixed(1)}fps — expected ≈30fps. The hero film may have been re-encoded to a different frame rate.`,
        ).toBeGreaterThan(24);
        expect(observedFps).toBeLessThan(40);
      }
    });

    test(`first decoded frame within ${vp.firstFrameBudgetMs}ms of metadata-ready`, async ({
      page,
    }) => {
      // Strict time-to-first-frame budget — measured from the
      // `loadedmetadata` event, NOT from page.goto(). This isolates
      // the *playback* readiness budget from network/route-load noise.
      //
      // Retry policy (jitter-only):
      //   We retry the probe up to MAX_ATTEMPTS times BUT only when the
      //   failure reason indicates timing jitter — i.e. the budget was
      //   exceeded by a small margin (< 1.5×) on a fully wired-up
      //   pipeline. We do NOT retry on:
      //     - missing video element        (real regression)
      //     - decoder error                (real regression)
      //     - autoplay rejection w/o frame (real regression)
      //     - budget exceeded by ≥ 1.5×    (real regression, not jitter)
      //   This keeps the assertion meaningful while absorbing CI
      //   scheduler hiccups that produce sporadic ~50–200ms overruns.
      const MAX_ATTEMPTS = 3;
      const JITTER_RATIO = 1.5;

      type ProbeResult = {
        ok: boolean;
        reason: string;
        ms: number;
        gotoToMetadataMs: number;
        gotoToFirstFrameMs: number;
      };

      const runProbe = async (): Promise<ProbeResult> => {
        const tNav = Date.now();
        await page.goto("/");
        await waitForVideoMetadata(page);
        const gotoToMetadataMs = Date.now() - tNav;

        const probe = await page.evaluate(
          async ({ sel, budget }) => {
            const start = performance.now();
            const v = document.querySelector(sel) as HTMLVideoElement | null;
            if (!v) return { ok: false, reason: "video element missing", ms: -1 };

            // Surface decoder errors as a non-retryable failure.
            if (v.error) {
              return {
                ok: false,
                reason: `decoder error: code=${v.error.code} msg="${v.error.message}"`,
                ms: -1,
              };
            }

            if (
              !v.paused &&
              v.currentTime > 0 &&
              v.readyState >= 2 /* HAVE_CURRENT_DATA */
            ) {
              return { ok: true, reason: "already playing", ms: 0 };
            }

            if (v.paused) {
              try {
                await v.play();
              } catch (err) {
                return {
                  ok: false,
                  reason: `autoplay rejected: ${(err as Error)?.message ?? "unknown"}`,
                  ms: performance.now() - start,
                };
              }
            }

            return await new Promise<{
              ok: boolean;
              reason: string;
              ms: number;
            }>((resolve) => {
              const settle = (ok: boolean, reason: string) => {
                cleanup();
                resolve({ ok, reason, ms: performance.now() - start });
              };
              const onPlaying = () => settle(true, "playing event");
              const onTimeUpdate = () => {
                if (v.currentTime > 0 && v.readyState >= 2) {
                  settle(true, "currentTime advanced");
                }
              };
              const onError = () =>
                settle(
                  false,
                  `decoder error: code=${v.error?.code ?? "?"} msg="${v.error?.message ?? ""}"`,
                );
              const cleanup = () => {
                v.removeEventListener("playing", onPlaying);
                v.removeEventListener("timeupdate", onTimeUpdate);
                v.removeEventListener("error", onError);
                clearTimeout(timer);
              };
              const timer = setTimeout(
                () => settle(false, `budget exceeded (${budget}ms)`),
                budget,
              );
              v.addEventListener("playing", onPlaying);
              v.addEventListener("timeupdate", onTimeUpdate);
              v.addEventListener("error", onError);
            });
          },
          { sel: VIDEO_SELECTOR, budget: vp.firstFrameBudgetMs },
        );

        return {
          ...probe,
          gotoToMetadataMs,
          gotoToFirstFrameMs: Date.now() - tNav,
        };
      };

      // Classify a failure as retryable jitter vs. hard regression.
      const isJitter = (r: ProbeResult): boolean => {
        if (r.ok) return false;
        if (!r.reason.startsWith("budget exceeded")) return false;
        // Only treat near-miss overruns as jitter. A wildly over-budget
        // result (e.g. 5s when budget is 2s) is a real regression.
        return r.ms > 0 && r.ms < vp.firstFrameBudgetMs * JITTER_RATIO;
      };

      const attempts: ProbeResult[] = [];
      let final: ProbeResult | null = null;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        const r = await runProbe();
        attempts.push(r);
        if (r.ok) {
          final = r;
          break;
        }
        if (!isJitter(r)) {
          // Hard failure — abort retries, fail fast with full context.
          final = r;
          break;
        }
        // Jitter — log and retry. Cool-down lets the worker settle.
        // eslint-disable-next-line no-console
        console.warn(
          `[hero-film-playback] attempt ${attempt}/${MAX_ATTEMPTS} jittered: ` +
            `${r.reason} (post-metadata=${r.ms.toFixed(0)}ms, ` +
            `goto→metadata=${r.gotoToMetadataMs}ms). Retrying.`,
        );
        await page.waitForTimeout(250);
      }
      if (!final) final = attempts[attempts.length - 1];

      const summary = attempts
        .map(
          (a, i) =>
            `  attempt ${i + 1}: ok=${a.ok} reason="${a.reason}" ` +
            `post-metadata=${a.ms.toFixed(0)}ms ` +
            `goto→metadata=${a.gotoToMetadataMs}ms ` +
            `goto→firstFrame=${a.gotoToFirstFrameMs}ms`,
        )
        .join("\n");

      expect(
        final.ok,
        `hero video did not produce a first frame within ${vp.firstFrameBudgetMs}ms of loadedmetadata after ${attempts.length} attempt(s).\n${summary}`,
      ).toBe(true);
      expect(
        final.ms,
        `first frame at ${final.ms.toFixed(0)}ms after metadata — exceeds ${vp.firstFrameBudgetMs}ms budget after ${attempts.length} attempt(s).\n${summary}`,
      ).toBeLessThanOrEqual(vp.firstFrameBudgetMs);
    });
  });
}
