import { describe, it } from "vitest";
import { installIframeFooterGuard, isInIframe } from "../lib/iframe-footer-guard";

describe("debug", () => {
  it("trace", () => {
    const listeners = new Map<string, Set<() => void>>();
    const win: any = {
      scrollY: 0,
      innerHeight: 800,
      document: { documentElement: { scrollHeight: 5000 } },
      addEventListener(t: string, f: () => void) {
        if (!listeners.has(t)) listeners.set(t, new Set());
        listeners.get(t)!.add(f);
      },
      removeEventListener() {},
      scrollTo: (...args: unknown[]) => console.log("SCROLLTO", args),
    };
    Object.defineProperty(win, "self", { value: win });
    Object.defineProperty(win, "top", { value: {} });
    console.log("isInIframe", isInIframe(win));
    const dispose = installIframeFooterGuard({}, win);
    console.log("listener keys", [...listeners.keys()]);
    win.scrollY = 1200;
    listeners.get("scroll")?.forEach((f) => f());
    console.log("after first scroll");
    win.scrollY = 4250;
    listeners.get("scroll")?.forEach((f) => f());
    console.log("after second scroll");
    dispose();
  });
});
