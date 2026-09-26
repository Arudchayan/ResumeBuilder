export {
  parseResumeData,
  parseResumeMeta,
  normalizeTemplateId,
  normalizeThemeId,
  THEME_IDS,
  type ResumeDocument,
  type TemplateId,
  type ThemeId,
} from "./schema/resume.js";

export {
  SECTION_CONFIG,
  blankResume,
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
