/**
 * Hero film contrast — runs scripts/hero-frame-contrast.mjs which samples
 * N frames from the actual hero MP4, composites the same dark scrim
 * CinematicHero.tsx renders on top, and asserts every text region
 * (headline · subheadline · microcopy) clears WCAG AA against the
 * computed effective background on every sampled frame.
 *
 * The script skips gracefully when ffmpeg or the source video are not
 * available (eg. some CI shards) — we treat that as a skip, not a
 * failure, so this test never blocks on infra. When the script does
 * run, any frame below threshold fails the suite with the offending
 * timestamp, region and ratio.
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const SCRIPT = resolve("scripts/hero-frame-contrast.mjs");
const VIDEO = resolve("public/video/film/yes-hero-film-720.mp4");

function haveFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const videoExists = existsSync(VIDEO) && statSync(VIDEO).size > 10_000;
const ffmpegOk = haveFfmpeg();
const canRun = videoExists && ffmpegOk;

describe("Hero film — frame-sampled WCAG AA contrast", () => {
  it.skipIf(!canRun)(
    "every sampled frame keeps headline/subheadline/microcopy above WCAG AA",
    () => {
      let stdout: string;
      try {
        stdout = execFileSync("node", [SCRIPT, "--json"], {
          encoding: "utf8",
          timeout: 180_000,
          maxBuffer: 4 * 1024 * 1024,
        });
      } catch (err) {
        // Non-zero exit → script reported failures; surface them with the
        // structured payload so the failing frame is obvious in CI logs.
        const e = err as { stdout?: Buffer | string };
        const payload = e.stdout?.toString() ?? "";
        throw new Error(
          `hero-frame-contrast failed:\n${payload || (err as Error).message}`,
        );
      }

      const report = JSON.parse(stdout) as {
        skipped: boolean;
        reason: string | null;
        passed?: boolean;
        failures?: Array<{
          t: number;
          region: string;
          color: string;
          ratio: number;
          required: number;
        }>;
        frames?: Array<unknown>;
      };

      if (report.skipped) {
        // Belt-and-braces: matches `it.skipIf` above. Keeps the test green
        // on environments where the script self-skipped after our own
        // pre-check passed (e.g. ffmpeg path lookup race).
        return;
      }

      expect(
        report.passed,
        `Failures: ${JSON.stringify(report.failures ?? [], null, 2)}`,
      ).toBe(true);
      // Sanity: at least 4 frames must have been sampled or the script
      // didn't actually exercise the loop.
      expect(report.frames?.length ?? 0).toBeGreaterThanOrEqual(4);
    },
    200_000,
  );

  it("script + video are present in this environment (advisory)", () => {
    if (!canRun) {
      // eslint-disable-next-line no-console
      console.warn(
        `[hero-frame-contrast] skipped — ffmpeg=${ffmpegOk} video=${videoExists}`,
      );
    }
    expect(existsSync(SCRIPT)).toBe(true);
  });
});
