import { describe, it, expect } from "vitest";
import { quantizeWidth } from "@/hooks/use-imported-tour-images";

describe("quantizeWidth", () => {
  it("rounds up to the next bucket", () => {
    expect(quantizeWidth(100)).toBe(240);
    expect(quantizeWidth(241)).toBe(320);
    expect(quantizeWidth(401)).toBe(480);
    expect(quantizeWidth(800)).toBe(800);
    expect(quantizeWidth(801)).toBe(1024);
  });
  it("caps at the largest bucket", () => {
    expect(quantizeWidth(99999)).toBe(1920);
  });
  it("matches the proxy's width buckets so cache keys converge", () => {
    // Same widths the resolver emits should map to the same buckets the
    // proxy uses when building the cache key.
    expect(quantizeWidth(401)).toBe(quantizeWidth(412));
    expect(quantizeWidth(820)).toBe(quantizeWidth(900));
  });
});
