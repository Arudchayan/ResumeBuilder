import { describe, expect, it } from "vitest";
import {
  PAPER_PRESETS,
  measureSheetPages,
  suggestFitStep,
} from "../preview/paper.js";

function fakeSheet(widthPx: number, heightPx: number): HTMLElement {
  return {
    offsetWidth: widthPx,
    offsetHeight: heightPx,
    scrollHeight: heightPx,
  } as HTMLElement;
}

describe("measureSheetPages", () => {
  it("counts a single A4 page when height matches width ratio", () => {
    const widthPx = (PAPER_PRESETS.a4.widthMm / 25.4) * 96;
    const heightPx = (PAPER_PRESETS.a4.heightMm / 25.4) * 96;
    const metrics = measureSheetPages(fakeSheet(widthPx, heightPx));
    expect(metrics.pages).toBe(1);
    expect(metrics.overflowMm).toBeLessThan(1);
  });

  it("counts three pages for ~3× A4 height", () => {
    const widthPx = 794;
    const heightPx = 1123 * 3;
    const metrics = measureSheetPages(fakeSheet(widthPx, heightPx));
    expect(metrics.pages).toBe(3);
    expect(metrics.overflowMm).toBeGreaterThan(500);
  });

  it("supports letter paper dimensions", () => {
    const widthPx = (PAPER_PRESETS.letter.widthMm / 25.4) * 96;
    const heightPx = (PAPER_PRESETS.letter.heightMm / 25.4) * 96;
    const metrics = measureSheetPages(fakeSheet(widthPx, heightPx), PAPER_PRESETS.letter);
    expect(metrics.pages).toBe(1);
    expect(metrics.widthMm).toBe(PAPER_PRESETS.letter.widthMm);
  });
});

describe("suggestFitStep", () => {
  it("reduces font before padding", () => {
    expect(
      suggestFitStep({
        currentPages: 3,
        targetPages: 2,
        fontScale: 100,
        contentPadding: 48,
      }),
    ).toEqual({ fontScale: 95, contentPadding: 48 });
  });

  it("returns null when already fitting", () => {
    expect(
      suggestFitStep({
        currentPages: 2,
        targetPages: 2,
        fontScale: 100,
        contentPadding: 48,
      }),
    ).toBeNull();
  });
});
