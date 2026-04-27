import { describe, it, expect } from "vitest";
import { evaluateRefreshDecision } from "./HeroCopyDiff";

/**
 * Unit tests for the post-route-boundary refresh version guard.
 *
 * The guard's job: after outlines are cleared on a route boundary, only
 * re-run the diff when there is a chance it will produce a different
 * result than the last one. The decision tree is intentionally tiny and
 * fully covered below.
 */
describe("evaluateRefreshDecision — version guard", () => {
  const CURRENT = "abc123";

  it("skips refresh when navigating away from the index", () => {
    const decision = evaluateRefreshDecision({
      isIndex: false,
      forced: false,
      baselineVersion: "older",
      currentVersion: CURRENT,
    });
    expect(decision).toEqual({ shouldRefresh: false, reason: "not-index" });
  });

  it("skips refresh when baseline version matches current version", () => {
    const decision = evaluateRefreshDecision({
      isIndex: true,
      forced: false,
      baselineVersion: CURRENT,
      currentVersion: CURRENT,
    });
    expect(decision.shouldRefresh).toBe(false);
    expect(decision.reason).toBe("version-match");
  });

  it("runs refresh when baseline version differs from current version", () => {
    const decision = evaluateRefreshDecision({
      isIndex: true,
      forced: false,
      baselineVersion: "older-hash",
      currentVersion: CURRENT,
    });
    expect(decision.shouldRefresh).toBe(true);
    expect(decision.reason).toBe("version-diff");
  });

  it("runs refresh when no baseline has been stored yet", () => {
    const decision = evaluateRefreshDecision({
      isIndex: true,
      forced: false,
      baselineVersion: null,
      currentVersion: CURRENT,
    });
    expect(decision.shouldRefresh).toBe(true);
    expect(decision.reason).toBe("no-baseline");
  });

  it("forced override bypasses the version guard even when versions match", () => {
    const decision = evaluateRefreshDecision({
      isIndex: true,
      forced: true,
      baselineVersion: CURRENT,
      currentVersion: CURRENT,
    });
    expect(decision.shouldRefresh).toBe(true);
    expect(decision.reason).toBe("forced");
  });

  it("forced override is ignored when not on the index route", () => {
    // Reason: the route-boundary effect only consumes the flag when it
    // crosses INTO "/". A forced flag while leaving "/" should not
    // trigger a refresh on a different route.
    const decision = evaluateRefreshDecision({
      isIndex: false,
      forced: true,
      baselineVersion: "older",
      currentVersion: CURRENT,
    });
    expect(decision).toEqual({ shouldRefresh: false, reason: "not-index" });
  });

  it("treats empty-string baseline version as a real (differing) value", () => {
    // Defensive: a corrupt/empty stored version should not be coerced
    // into the "no-baseline" branch. It's a string mismatch → refresh.
    const decision = evaluateRefreshDecision({
      isIndex: true,
      forced: false,
      baselineVersion: "",
      currentVersion: CURRENT,
    });
    expect(decision.shouldRefresh).toBe(true);
    expect(decision.reason).toBe("version-diff");
  });
});
