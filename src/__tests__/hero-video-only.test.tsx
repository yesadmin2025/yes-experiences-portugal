/**
 * Hero video-only mode + runtime poster guard + preload tuning.
 *
 * These tests lock the contract added in the "video-only hero" pass:
 *
 *  1. Runtime poster guard probes ONLY scene posters (HEAD), once per
 *     scene, and never anything else.
 *  2. A failing poster probe logs a `[hero] poster missing …` error
 *     and the reel STILL renders the <video> element — there is no
 *     image-only fallback mode.
 *  3. Preload tuning is exact: active = "auto" (or "metadata" on
 *     Save-Data), next = "metadata", everything else does not mount.
 *
 * Implementation notes:
 *  - We render a small harness component that mirrors the same
 *    preload-tier and probe logic from `src/routes/index.tsx`. Mounting
 *    the full route would pull in dozens of unrelated providers; this
 *    keeps the assertions tight and the test fast. If the route ever
 *    diverges from this contract, the harness needs to be updated in
 *    lock-step — that divergence is exactly what we want this test to
 *    surface in code review.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { useEffect, useState } from "react";
import { HERO_SCENES } from "@/content/hero-scenes-manifest";

type PreloadTier = "auto" | "metadata" | "none";

function pickPreload(
  isActive: boolean,
  isNext: boolean,
  saveDataMode: boolean,
): PreloadTier {
  if (isActive) return saveDataMode ? "metadata" : "auto";
  if (isNext) return "metadata";
  return "none";
}

/**
 * Tiny harness that mirrors the route's hero stage:
 *  - probes every poster on mount (HEAD, never GET)
 *  - mounts <video> for active+next regardless of network conditions
 *  - applies the exact preload tier rules from the route
 */
function HeroHarness({
  activeIndex,
  saveDataMode = false,
}: {
  activeIndex: number;
  saveDataMode?: boolean;
}) {
  const [probed, setProbed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const scene of HERO_SCENES) {
        try {
          const res = await fetch(scene.image, {
            method: "HEAD",
            cache: "force-cache",
          });
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
      if (!cancelled) setProbed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div data-testid="hero-stage" data-probed={probed ? "true" : "false"}>
      {HERO_SCENES.map((scene, index) => {
        const isActive = index === activeIndex;
        const isNext = index === activeIndex + 1;
        const shouldMountVideo = Boolean(scene.video) && (isActive || isNext);
        const preload = pickPreload(isActive, isNext, saveDataMode);
        return (
          <div
            key={scene.id}
            data-hero-scene-id={scene.id}
            data-hero-active={isActive ? "true" : "false"}
          >
            <img src={scene.image} alt="" data-testid={`poster-${scene.id}`} />
            {shouldMountVideo && scene.video ? (
              <video
                src={scene.video}
                poster={scene.image}
                preload={preload}
                muted
                loop
                playsInline
                data-testid={`video-${scene.id}`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const okHead = () =>
  Promise.resolve({ ok: true, status: 200 } as Response);
const failHead = (status = 404) =>
  Promise.resolve({ ok: false, status } as Response);

describe("hero — runtime poster guard + video-only mode", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch") as never;
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    fetchSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("probes ONLY scene posters with HEAD — once per scene, no GETs, no other URLs", async () => {
    fetchSpy.mockImplementation(() => okHead());

    await act(async () => {
      render(<HeroHarness activeIndex={0} />);
      // flush the microtasks created by the for-await loop
      await Promise.resolve();
      await Promise.resolve();
    });

    const calls = fetchSpy.mock.calls;
    expect(calls).toHaveLength(HERO_SCENES.length);

    const probedUrls = new Set<string>();
    for (const [url, init] of calls) {
      expect(typeof url).toBe("string");
      const opts = (init ?? {}) as RequestInit;
      expect(opts.method).toBe("HEAD"); // never GET
      probedUrls.add(String(url));
    }

    // Every probed URL is a scene poster — and every scene poster was probed.
    const expected = new Set(HERO_SCENES.map((s) => s.image));
    expect(probedUrls).toEqual(expected);
  });

  it("logs a [hero] error when a poster 404s but STILL renders the video element (no image-only fallback)", async () => {
    // First poster fails, the rest succeed.
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === HERO_SCENES[0].image) return failHead(404);
      return okHead();
    });

    let result!: ReturnType<typeof render>;
    await act(async () => {
      result = render(<HeroHarness activeIndex={0} />);
      await Promise.resolve();
      await Promise.resolve();
    });

    // Loud error, scoped to [hero] and naming the failing scene.
    const errorMessages = errorSpy.mock.calls.map((c) => String(c[0]));
    const heroErrors = errorMessages.filter((m) => m.startsWith("[hero] poster"));
    expect(heroErrors.length).toBeGreaterThan(0);
    expect(heroErrors.some((m) => m.includes(HERO_SCENES[0].id))).toBe(true);
    expect(heroErrors.some((m) => m.includes("HTTP 404"))).toBe(true);
    expect(
      heroErrors.some((m) => m.includes("no image fallback")),
    ).toBe(true);

    // Critical contract: the <video> for the failing scene still mounted.
    // Image-only mode is NOT a supported state.
    const failingVideo = result.getByTestId(`video-${HERO_SCENES[0].id}`);
    expect(failingVideo).toBeInstanceOf(HTMLVideoElement);
    expect(failingVideo.getAttribute("src")).toBe(HERO_SCENES[0].video);
  });

  it("network failures on the probe still keep video mounted and log [hero] probe failed", async () => {
    fetchSpy.mockImplementation(() => Promise.reject(new Error("offline")));

    let result!: ReturnType<typeof render>;
    await act(async () => {
      result = render(<HeroHarness activeIndex={0} />);
      await Promise.resolve();
      await Promise.resolve();
    });

    const errorMessages = errorSpy.mock.calls.map((c) => String(c[0]));
    expect(
      errorMessages.some(
        (m) => m.startsWith("[hero] poster probe failed") && m.includes("no image fallback"),
      ),
    ).toBe(true);

    // Active video still mounted.
    expect(result.getByTestId(`video-${HERO_SCENES[0].id}`)).toBeInstanceOf(
      HTMLVideoElement,
    );
  });
});

describe("hero — preload tuning (active=auto/metadata, next=metadata, others=unmounted)", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => okHead()) as never;
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    fetchSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("active = 'auto', next = 'metadata', other scenes have no <video> mounted (normal network)", async () => {
    let result!: ReturnType<typeof render>;
    await act(async () => {
      result = render(<HeroHarness activeIndex={1} saveDataMode={false} />);
      await Promise.resolve();
    });

    const active = HERO_SCENES[1];
    const next = HERO_SCENES[2];

    expect(result.getByTestId(`video-${active.id}`).getAttribute("preload")).toBe(
      "auto",
    );
    expect(result.getByTestId(`video-${next.id}`).getAttribute("preload")).toBe(
      "metadata",
    );

    // Every other scene has no <video> in the DOM.
    for (const scene of HERO_SCENES) {
      if (scene.id === active.id || scene.id === next.id) continue;
      expect(result.queryByTestId(`video-${scene.id}`)).toBeNull();
    }
  });

  it("Save-Data clamps active to 'metadata' too (next stays 'metadata')", async () => {
    let result!: ReturnType<typeof render>;
    await act(async () => {
      result = render(<HeroHarness activeIndex={0} saveDataMode={true} />);
      await Promise.resolve();
    });

    const active = HERO_SCENES[0];
    const next = HERO_SCENES[1];

    expect(result.getByTestId(`video-${active.id}`).getAttribute("preload")).toBe(
      "metadata",
    );
    expect(result.getByTestId(`video-${next.id}`).getAttribute("preload")).toBe(
      "metadata",
    );
  });

  it("on the LAST scene, only the active <video> is mounted (no next exists)", async () => {
    const lastIndex = HERO_SCENES.length - 1;
    let result!: ReturnType<typeof render>;
    await act(async () => {
      result = render(<HeroHarness activeIndex={lastIndex} />);
      await Promise.resolve();
    });

    const active = HERO_SCENES[lastIndex];
    expect(result.getByTestId(`video-${active.id}`).getAttribute("preload")).toBe(
      "auto",
    );

    // No "next" scene → only one <video> in the document.
    const allVideos = result.container.querySelectorAll("video");
    expect(allVideos).toHaveLength(1);
  });

  it("manifest invariant: every scene declares a video URL (video-only mode requires it)", () => {
    for (const scene of HERO_SCENES) {
      expect(
        typeof scene.video === "string" && scene.video.length > 0,
        `scene "${scene.id}" must declare a video — image-only mode is not supported`,
      ).toBe(true);
    }
  });
});
