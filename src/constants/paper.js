/** Paper presets: preview width, jsPDF format, and CSS @page size keyword or dimensions. */

export const PAPER_PRESETS = {
  a4: {
    widthMm: 210,
    heightMm: 297,
    name: "A4 (210×297mm)",
    pageCss: "A4",
    jsPdfFormat: "a4",
  },
  letter: {
    widthMm: 215.9,
    heightMm: 279.4,
    name: 'Letter (8.5×11")',
    pageCss: "letter",
    jsPdfFormat: [215.9, 279.4],
  },
  legal: {
    widthMm: 215.9,
    heightMm: 355.6,
    name: 'Legal (8.5×14")',
    pageCss: "legal",
    jsPdfFormat: [215.9, 355.6],
  },
};

export function getPaperPreset(paperSize) {
  return PAPER_PRESETS[paperSize] || PAPER_PRESETS.a4;
}
