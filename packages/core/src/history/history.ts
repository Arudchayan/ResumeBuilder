import type { ResumeDocument } from "../schema/resume.js";
import { applyCommand, type ResumeCommand } from "../commands/applyCommand.js";

export interface HistoryState {
  past: ResumeDocument[];
  present: ResumeDocument;
  future: ResumeDocument[];
}

const MAX_HISTORY = 50;

export function createHistory(present: ResumeDocument): HistoryState {
  return { past: [], present, future: [] };
}

export function dispatch(history: HistoryState, command: ResumeCommand): HistoryState {
  const next = applyCommand(history.present, command);
  if (next === history.present) return history;
  return {
    past: [...history.past, history.present].slice(-MAX_HISTORY),
    present: next,
    future: [],
  };
}

export function undo(history: HistoryState): HistoryState {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1]!;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo(history: HistoryState): HistoryState {
  if (history.future.length === 0) return history;
  const next = history.future[0]!;
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}

export function replacePresent(history: HistoryState, present: ResumeDocument): HistoryState {
  return { past: [], present, future: [] };
}
