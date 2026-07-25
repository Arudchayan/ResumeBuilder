import { describe, expect, it } from "vitest";
import { A4_PAPER, measureSheetPages } from "../preview/paper.js";

function fakeSheet(widthPx: number, heightPx: number): HTMLElement {
  return {
    offsetWidth: widthPx,
    offsetHeight: heightPx,
    scrollHeight: heightPx,
  } as HTMLElement;
}

describe("measureSheetPages", () => {
  it("counts a single A4 page when height matches width ratio", () => {
    // 210mm wide → 794px at 96dpi; 297mm → ~1123px
    const widthPx = (A4_PAPER.widthMm / 25.4) * 96;
    const heightPx = (A4_PAPER.heightMm / 25.4) * 96;
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
});
