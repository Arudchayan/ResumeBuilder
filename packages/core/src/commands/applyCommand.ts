import type { ResumeDocument } from "../schema/resume.js";
import { getDefaultSectionOrder } from "../schema/sections.js";

export type ResumeCommand =
  | { type: "setField"; path: string; value: unknown }
  | { type: "setDocument"; document: ResumeDocument }
  | { type: "setPhoto"; dataUrl: string }
  | { type: "addArrayItem"; key: ArrayKey; item: unknown }
  | { type: "removeArrayItem"; key: ArrayKey; index: number }
  | { type: "updateArrayItem"; key: ArrayKey; index: number; item: unknown };

export type ArrayKey =
  | "links"
  | "jobs"
  | "projects"
  | "certs"
  | "edus"
  | "languages"
  | "publications"
  | "awards";

const BLOCKED_PATH_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const PATH_PART = /^[A-Za-z0-9_-]+$/;
const MAX_PATH_DEPTH = 5;

/** Per-array growth caps, mirrored by the schema preprocess truncation (skills is setField-only and capped at 100 in the schema). */
export const ARRAY_CAPS: Record<ArrayKey, number> = {
  links: 50,
  jobs: 50,
  projects: 50,
  certs: 50,
  edus: 20,
  languages: 30,
  publications: 50,
  awards: 50,
};

function isValidIndex(arr: unknown[], index: number) {
  return Number.isInteger(index) && index >= 0 && index < arr.length;
}

/**
 * Guarded path writer. Returns false (no mutation) when the path is
 * missing, too deep, not allowlisted, a prototype-pollution attempt,
 * traverses an array, or already holds the value.
 */
function setByPath(obj: Record<string, unknown>, path: string, value: unknown): boolean {
  const parts = path.split(".");
  if (parts.length === 0 || parts.length > MAX_PATH_DEPTH) return false;
  for (const part of parts) {
    if (!part || !PATH_PART.test(part) || BLOCKED_PATH_KEYS.has(part)) return false;
  }
  let cursor: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const next = cursor[key];
    if (Array.isArray(next)) return false;
    if (typeof next !== "object" || next === null) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  const leaf = parts[parts.length - 1]!;
  if (cursor[leaf] === value) return false;
  cursor[leaf] = value;
  return true;
}

function isDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function applyCommand(doc: ResumeDocument, command: ResumeCommand): ResumeDocument {
  const draft = structuredClone(doc);
  let mutated = false;
  switch (command.type) {
    case "setField":
      mutated = setByPath(draft as unknown as Record<string, unknown>, command.path, command.value);
      break;
    case "setPhoto": {
      const photo = draft.photo ?? { enabled: false, url: "", dataUrl: "" };
      if (photo.dataUrl !== command.dataUrl || !photo.enabled) {
        draft.photo = { ...photo, dataUrl: command.dataUrl, enabled: true };
        mutated = true;
      }
      break;
    }
    case "setDocument": {
      const incoming = command.document as unknown as Record<string, unknown>;
      const target = draft as unknown as Record<string, unknown>;
      for (const [key, value] of Object.entries(incoming)) {
        if (key === "updatedAt" || key === "id" || BLOCKED_PATH_KEYS.has(key)) continue;
        if (isDeepEqual(target[key], value)) continue;
        target[key] = value;
        mutated = true;
      }
      break;
    }
    case "addArrayItem": {
      const arr = draft[command.key] as unknown[];
      if (!Array.isArray(arr)) break;
      if (arr.length >= (ARRAY_CAPS[command.key] ?? 100)) break;
      arr.push(command.item);
      mutated = true;
      break;
    }
    case "removeArrayItem": {
      const arr = draft[command.key] as unknown[];
      if (!Array.isArray(arr) || !isValidIndex(arr, command.index)) break;
      arr.splice(command.index, 1);
      mutated = true;
      break;
    }
    case "updateArrayItem": {
      const arr = draft[command.key] as unknown[];
      if (!Array.isArray(arr) || !isValidIndex(arr, command.index)) break;
      if (arr[command.index] === command.item) break;
      arr[command.index] = command.item;
      mutated = true;
      break;
    }
    default: {
      const _exhaustive: never = command;
      void _exhaustive;
      break;
    }
  }
  // No-op commands return the original reference so history can skip them.
  if (!mutated) return doc;
  draft.updatedAt = Date.now();
  return draft;
}

export function ensureSectionOrder(doc: ResumeDocument): string[] {
  return doc.sectionOrder?.length ? doc.sectionOrder : getDefaultSectionOrder();
}
