export {
  resumeSchema,
  validateResumeData,
  parseResumeData,
  TEMPLATE_IDS,
  type ResumeDocument,
  type TemplateId,
  type Job,
  type Project,
} from "./schema/resume.js";

export {
  SECTION_CONFIG,
  getDefaultVisibility,
  getDefaultSectionOrder,
  isSectionEmpty,
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
  replacePresent,
  type HistoryState,
} from "./history/history.js";

export { sampleResume } from "./sample.js";
