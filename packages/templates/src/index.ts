export {
  documentToIr,
  TEMPLATES,
  type LayoutIr,
  type IrBlock,
} from "./ir/documentToIr.js";

export { ResumePreview, TemplateThumb } from "./preview/ResumePreview.js";
export {
  PAPER_PRESETS,
  measureSheetPages,
  findPageCrossings,
  suggestFitStep,
  type SheetPageMetrics,
  type PaperId,
  type PageCrossing,
} from "./preview/paper.js";
export {
  defaultSkillsDensity,
  applyOnePageVisibility,
  trimOlderJobs,
  type SkillsDensity,
} from "./preview/layoutAssist.js";
