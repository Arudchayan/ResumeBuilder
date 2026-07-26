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
export {
  A4_PAPER,
  PAPER_PRESETS,
  measureSheetPages,
  findPageCrossings,
  suggestFitStep,
  type SheetPageMetrics,
  type PaperId,
  type PaperPreset,
  type PageCrossing,
} from "./preview/paper.js";
export {
  defaultSkillsDensity,
  applyOnePageVisibility,
  trimOlderJobs,
  type SkillsDensity,
} from "./preview/layoutAssist.js";
