/** ISO A4 — the only paper size the builder exports today. */
export const A4_PAPER = {
  id: "a4",
  name: "A4",
  widthMm: 210,
  heightMm: 297,
  label: "A4 · 210 × 297 mm",
} as const;

export type SheetPageMetrics = {
  pages: number;
  heightMm: number;
  widthMm: number;
  overflowMm: number;
  fillsFirstPage: number;
};

/**
 * Estimate how many A4 pages a laid-out `.sheet` will produce.
 * Uses the sheet's CSS mm width as the scale reference so zoom transforms
 * on an ancestor do not skew the page count.
 */
export function measureSheetPages(
  sheet: HTMLElement,
  paper: { widthMm: number; heightMm: number } = A4_PAPER,
): SheetPageMetrics {
  const widthPx = Math.max(1, sheet.offsetWidth);
  const heightPx = Math.max(sheet.scrollHeight, sheet.offsetHeight, 1);
  const heightMm = (heightPx / widthPx) * paper.widthMm;
  // Tiny slack so a sheet that is exactly one page does not round up to 2.
  const pages = Math.max(1, Math.ceil((heightMm - 0.75) / paper.heightMm));
  const overflowMm = Math.max(0, heightMm - paper.heightMm);
  const fillsFirstPage = Math.min(1, heightMm / paper.heightMm);
  return {
    pages,
    heightMm,
    widthMm: paper.widthMm,
    overflowMm,
    fillsFirstPage,
  };
}
