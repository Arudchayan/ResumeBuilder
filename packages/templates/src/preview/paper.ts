/** Supported paper presets for preview + print. */
export const PAPER_PRESETS = {
  a4: {
    id: "a4",
    name: "A4",
    widthMm: 210,
    heightMm: 297,
    label: "A4 · 210 × 297 mm",
  },
  letter: {
    id: "letter",
    name: "Letter",
    widthMm: 215.9,
    heightMm: 279.4,
    label: "Letter · 8.5 × 11 in",
  },
} as const;

export type PaperId = keyof typeof PAPER_PRESETS;
export type PaperPreset = (typeof PAPER_PRESETS)[PaperId];

export type SheetPageMetrics = {
  pages: number;
  heightMm: number;
  overflowMm: number;
};

export type PageCrossing = {
  label: string;
  crossesPage: number;
};

/**
 * Estimate how many pages a laid-out `.sheet` will produce.
 * Uses the sheet's CSS mm width as the scale reference so zoom transforms
 * on an ancestor do not skew the page count.
 */
export function measureSheetPages(
  sheet: HTMLElement,
  paper: { widthMm: number; heightMm: number } = PAPER_PRESETS.a4,
): SheetPageMetrics {
  const widthPx = Math.max(1, sheet.offsetWidth);
  const heightPx = Math.max(sheet.scrollHeight, sheet.offsetHeight, 1);
  const heightMm = (heightPx / widthPx) * paper.widthMm;
  // Tiny slack so a sheet that is exactly one page does not round up to 2.
  const pages = Math.max(1, Math.ceil((heightMm - 0.75) / paper.heightMm));
  const overflowMm = Math.max(0, heightMm - paper.heightMm);
  return {
    pages,
    heightMm,
    overflowMm,
  };
}

/** Find resume blocks that straddle a page boundary (for author warnings). */
export function findPageCrossings(
  sheet: HTMLElement,
  paper: { widthMm: number; heightMm: number } = PAPER_PRESETS.a4,
): PageCrossing[] {
  const widthPx = Math.max(1, sheet.offsetWidth);
  const pageHeightPx = (paper.heightMm / paper.widthMm) * widthPx;
  // Preview zoom scales getBoundingClientRect; divide it back out.
  const sheetBox = sheet.getBoundingClientRect();
  const scale = Math.max(0.01, sheetBox.width / widthPx);
  const crossings: PageCrossing[] = [];
  const seen = new Set<string>();

  sheet.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => {
    const sectionId = el.dataset.section;
    if (!sectionId || seen.has(sectionId)) return;
    const box = el.getBoundingClientRect();
    const top = (box.top - sheetBox.top) / scale;
    const bottom = (box.bottom - sheetBox.top) / scale;
    const startPage = Math.floor(top / pageHeightPx) + 1;
    const endPage = Math.floor((bottom - 1) / pageHeightPx) + 1;
    if (endPage > startPage) {
      seen.add(sectionId);
      crossings.push({
        label: el.dataset.sectionLabel || sectionId,
        crossesPage: startPage,
      });
    }
  });

  return crossings;
}

/**
 * Suggest font/padding steps to reach a target page count.
 * Pure helper — caller applies values and remeasures.
 */
export function suggestFitStep(options: {
  currentPages: number;
  targetPages: number;
  fontScale: number;
  contentPadding: number;
}): { fontScale: number; contentPadding: number } | null {
  const { currentPages, targetPages, fontScale, contentPadding } = options;
  if (currentPages <= targetPages) return null;

  // Prefer shrinking font first, then padding.
  if (fontScale > 85) {
    return { fontScale: Math.max(85, fontScale - 5), contentPadding };
  }
  if (contentPadding > 24) {
    return { fontScale, contentPadding: Math.max(24, contentPadding - 4) };
  }
  return null;
}
