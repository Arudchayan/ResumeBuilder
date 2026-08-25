export {
  parseResumeData,
  normalizeTemplateId,
  type ResumeDocument,
  type TemplateId,
} from "./schema/resume.js";

export {
  SECTION_CONFIG,
  blankResume,
  type SectionId,
} from "./schema/sections.js";

export {
  applyCommand,
  ensureSectionOrder,
  type ResumeCommand,
  type ArrayKey,
} from "./commands/applyCommand.js";

export {
  createHistory,
  dispatch,
  undo,
  redo,
  type HistoryState,
} from "./history/history.js";

export { sampleResume } from "./sample.js";
