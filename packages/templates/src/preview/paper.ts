/** Supported paper presets for preview + PDF export. */
export const PAPER_PRESETS = {
  a4: {
    id: "a4",
    name: "A4",
    widthMm: 210,
    heightMm: 297,
    label: "A4 · 210 × 297 mm",
    jsPdfFormat: "a4" as const,
  },
  letter: {
    id: "letter",
    name: "Letter",
    widthMm: 215.9,
    heightMm: 279.4,
    label: "Letter · 8.5 × 11 in",
    jsPdfFormat: "letter" as const,
  },
} as const;

export type PaperId = keyof typeof PAPER_PRESETS;
export type PaperPreset = (typeof PAPER_PRESETS)[PaperId];

/** @deprecated Use PAPER_PRESETS.a4 — kept for existing imports. */
export const A4_PAPER = PAPER_PRESETS.a4;

export type SheetPageMetrics = {
  pages: number;
  heightMm: number;
  widthMm: number;
  overflowMm: number;
  fillsFirstPage: number;
};

export type PageCrossing = {
  sectionId: string;
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
  const fillsFirstPage = Math.min(1, heightMm / paper.heightMm);
  return {
    pages,
    heightMm,
    widthMm: paper.widthMm,
    overflowMm,
    fillsFirstPage,
  };
}

/** Find resume blocks that straddle a page boundary (for author warnings). */
export function findPageCrossings(
  sheet: HTMLElement,
  paper: { widthMm: number; heightMm: number } = PAPER_PRESETS.a4,
): PageCrossing[] {
  const widthPx = Math.max(1, sheet.offsetWidth);
  const pageHeightPx = (paper.heightMm / paper.widthMm) * widthPx;
  const sheetTop = sheet.getBoundingClientRect().top;
  const crossings: PageCrossing[] = [];
  const seen = new Set<string>();

  sheet.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => {
    const sectionId = el.dataset.section;
    if (!sectionId || seen.has(sectionId)) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top - sheetTop;
    const bottom = rect.bottom - sheetTop;
    const startPage = Math.floor(top / pageHeightPx) + 1;
    const endPage = Math.floor((bottom - 1) / pageHeightPx) + 1;
    if (endPage > startPage) {
      seen.add(sectionId);
      crossings.push({
        sectionId,
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
