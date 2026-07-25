export {
  documentToIr,
  TEMPLATES,
  getTemplate,
  type LayoutIr,
  type IrBlock,
  type IrColumn,
  type IrPage,
  type TemplateManifest,
} from "./ir/documentToIr.js";

export { ResumePreview, TemplateThumb } from "./preview/ResumePreview.js";
export { ClassicSidebarSheet } from "./preview/ClassicSidebarSheet.js";
export { PageBreakGuides } from "./preview/PageBreakGuides.js";
export { A4_PAPER, measureSheetPages, type SheetPageMetrics } from "./preview/paper.js";
