export {
  documentToIr,
  TEMPLATES,
  type LayoutIr,
  type IrBlock,
  type IrColumn,
  type TemplateManifest,
} from "./ir/documentToIr.js";

export { ResumePreview, TemplateThumb } from "./preview/ResumePreview.js";
export { PageBreakGuides } from "./preview/PageBreakGuides.js";
export {
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
