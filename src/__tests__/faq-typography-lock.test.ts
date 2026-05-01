/**
 * FAQ typography lock — Phase 3 (Nov 2026 refinement).
 *
 * Pins the exact mobile + md sizes and line-heights of the FAQ headline,
 * accordion trigger and accordion content so they cannot silently drift.
 *
 * If you intentionally change FAQ typography, update this test in the
 * SAME commit and document the new values here.
 *
 * Locked values (post-Phase 3):
 *
 *   #faq-title h2
 *     · mobile: text-[2rem]      → 2rem
 *     · md:    text-[2.6rem]     → 2.6rem
 *     · line-height: leading-[1.12]
 *     · tracking: tracking-[-0.015em]
 *
 *   AccordionTrigger
 *     · mobile: text-[15px]
 *     · md:    text-[17px]
 *     · padding: px-5 md:px-6, py-4 md:py-5
 *
 *   AccordionContent
 *     · mobile: text-[14.5px]
 *     · md:    text-[15px]
 *     · line-height: leading-[1.65]
 *     · padding: px-5 md:px-6, pb-5 md:pb-6
 *
 *   Section padding wrapper (FAQ section)
 *     · mobile: py-16
 *     · md:    py-20
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const faqPath = resolve(__dirname, "../components/FAQ.tsx");
const src = readFileSync(faqPath, "utf8");

function classOf(regex: RegExp): string {
  const m = src.match(regex);
  if (!m) throw new Error(`Selector not found in FAQ.tsx: ${regex}`);
  return m[1];
}

const faqTitleClass = classOf(/id="faq-title"\s+className="([^"]+)"/);
const triggerClass = classOf(/<AccordionTrigger\s+className="([^"]+)"/);
const contentClass = classOf(/<AccordionContent\s+className="([^"]+)"/);
const sectionClass = classOf(/id="faq"\s+className="([^"]+)"/);

describe("FAQ headline — locked typography (Phase 3)", () => {
  it("mobile size is text-[2rem]", () => {
    expect(faqTitleClass).toMatch(/(?:^|\s)text-\[2rem\](?:\s|$)/);
  });
  it("md size is text-[2.6rem]", () => {
    expect(faqTitleClass).toMatch(/md:text-\[2\.6rem\]/);
  });
  it("line-height is leading-[1.12]", () => {
    expect(faqTitleClass).toMatch(/leading-\[1\.12\]/);
  });
  it("letter-spacing is tracking-[-0.015em]", () => {
    expect(faqTitleClass).toMatch(/tracking-\[-0\.015em\]/);
  });
  it("uses --charcoal color token", () => {
    expect(faqTitleClass).toMatch(/text-\[color:var\(--charcoal\)\]/);
  });
});

describe("Accordion trigger — locked typography (Phase 3)", () => {
  it("mobile font-size is text-[15px]", () => {
    expect(triggerClass).toMatch(/(?:^|\s)text-\[15px\](?:\s|$)/);
  });
  it("md font-size is text-[17px]", () => {
    expect(triggerClass).toMatch(/md:text-\[17px\]/);
  });
  it("horizontal padding is px-5 md:px-6", () => {
    expect(triggerClass).toMatch(/(?:^|\s)px-5(?:\s|$)/);
    expect(triggerClass).toMatch(/md:px-6/);
  });
  it("vertical padding is py-4 md:py-5", () => {
    expect(triggerClass).toMatch(/(?:^|\s)py-4(?:\s|$)/);
    expect(triggerClass).toMatch(/md:py-5/);
  });
});

describe("Accordion content — locked typography (Phase 3)", () => {
  it("mobile font-size is text-[14.5px]", () => {
    expect(contentClass).toMatch(/(?:^|\s)text-\[14\.5px\](?:\s|$)/);
  });
  it("md font-size is text-[15px]", () => {
    expect(contentClass).toMatch(/md:text-\[15px\]/);
  });
  it("line-height is leading-[1.65]", () => {
    expect(contentClass).toMatch(/leading-\[1\.65\]/);
  });
  it("horizontal padding is px-5 md:px-6", () => {
    expect(contentClass).toMatch(/(?:^|\s)px-5(?:\s|$)/);
    expect(contentClass).toMatch(/md:px-6/);
  });
  it("bottom padding is pb-5 md:pb-6", () => {
    expect(contentClass).toMatch(/(?:^|\s)pb-5(?:\s|$)/);
    expect(contentClass).toMatch(/md:pb-6/);
  });
});

describe("FAQ section padding — locked rhythm (Phase 3)", () => {
  it("mobile vertical padding is py-16", () => {
    expect(sectionClass).toMatch(/(?:^|\s)py-16(?:\s|$)/);
  });
  it("md vertical padding is md:py-20", () => {
    expect(sectionClass).toMatch(/md:py-20/);
  });
});
