import { produce } from "immer";
import type { ResumeDocument } from "../schema/resume.js";
import { getDefaultSectionOrder } from "../schema/sections.js";

export type ResumeCommand =
  | { type: "setField"; path: string; value: unknown }
  | { type: "setDocument"; document: ResumeDocument }
  | { type: "reorderSections"; order: string[] }
  | { type: "setSectionVisibility"; id: string; visible: boolean }
  | { type: "setTemplate"; template: ResumeDocument["template"] }
  | { type: "setTheme"; theme: string }
  | { type: "addArrayItem"; key: ArrayKey; item: unknown }
  | { type: "removeArrayItem"; key: ArrayKey; index: number }
  | { type: "updateArrayItem"; key: ArrayKey; index: number; item: unknown }
  | { type: "reorderArray"; key: ArrayKey; from: number; to: number }
  | { type: "setSkills"; skills: string[] }
  | { type: "setPhoto"; dataUrl: string };

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

const THEME_IDS = ["teal", "blue", "purple", "green", "slate", "forest", "copper", "black"] as const;
type ThemeId = (typeof THEME_IDS)[number];

const ARRAY_CAPS: Record<ArrayKey, number> = {
  links: 50,
  jobs: 50,
  projects: 50,
  certs: 50,
  edus: 20,
  languages: 30,
  publications: 50,
  awards: 50,
};

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let cursor: unknown = obj;
  for (const key of parts) {
    if (typeof cursor !== "object" || cursor === null) return undefined;
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return cursor;
}

function setByPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  if (parts.length === 0 || parts.length > 5) return false;
  for (const key of parts) {
    if (!key || BLOCKED_PATH_KEYS.has(key) || !/^[A-Za-z0-9_-]+$/.test(key)) return false;
  }
  let cursor: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const next = cursor[key];
    if (typeof next !== "object" || next === null || Array.isArray(next)) {
      return false;
    }
    cursor = next as Record<string, unknown>;
  }
  const leaf = parts[parts.length - 1]!;
  if (cursor[leaf] === value) return false;
  cursor[leaf] = value;
  return true;
}

function isValidIndex(length: number, index: number) {
  return Number.isInteger(index) && index >= 0 && index < length;
}

export function applyCommand(doc: ResumeDocument, command: ResumeCommand): ResumeDocument {
  return produce(doc, (draft) => {
    let mutated = false;
    switch (command.type) {
      case "setField":
        mutated = setByPath(
          draft as unknown as Record<string, unknown>,
          command.path,
          command.value,
        );
        break;
      case "setDocument": {
        // Merge-only: ignore caller-supplied updatedAt, sanitize theme, and
        // assign per-key so identical documents stay a no-op for history.
        const { updatedAt: _ignored, ...rest } = (command.document ?? {}) as Record<string, unknown>;
        const target = draft as unknown as Record<string, unknown>;
        for (const [key, value] of Object.entries(rest)) {
          if (BLOCKED_PATH_KEYS.has(key)) continue;
          if (key === "theme" && !(THEME_IDS as readonly string[]).includes(value as string)) continue;
          const current = target[key];
          if (current !== value && JSON.stringify(current) !== JSON.stringify(value)) {
            target[key] = value;
            mutated = true;
          }
        }
        break;
      }
      case "reorderSections": {
        const seen = new Set<string>();
        const clean = command.order.filter((id) => {
          if (typeof id !== "string" || !id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        const defaults = getDefaultSectionOrder();
        for (const id of defaults) if (!seen.has(id)) clean.push(id);
        mutated = JSON.stringify(draft.sectionOrder) !== JSON.stringify(clean);
        if (mutated) draft.sectionOrder = clean;
        break;
      }
      case "setSectionVisibility": {
        if (!command.id || BLOCKED_PATH_KEYS.has(command.id)) break;
        if (draft.sectionVisibility?.[command.id] !== command.visible) {
          draft.sectionVisibility = {
            ...draft.sectionVisibility,
            [command.id]: command.visible,
          };
          mutated = true;
        }
        break;
      }
      case "setTemplate":
        if ((draft.template as string) !== (command.template as string)) {
          draft.template = command.template;
          mutated = true;
        }
        break;
      case "setTheme": {
        const next = command.theme as ThemeId;
        if (THEME_IDS.includes(next) && (draft.theme as string) !== next) {
          draft.theme = next;
          mutated = true;
        }
        break;
      }
      case "addArrayItem": {
        const arr = draft[command.key] as unknown[];
        if (Array.isArray(arr) && arr.length < (ARRAY_CAPS[command.key] ?? 100)) {
          arr.push(command.item);
          mutated = true;
        }
        break;
      }
      case "removeArrayItem": {
        const arr = draft[command.key] as unknown[];
        if (Array.isArray(arr) && isValidIndex(arr.length, command.index)) {
          arr.splice(command.index, 1);
          mutated = true;
        }
        break;
      }
      case "updateArrayItem": {
        const arr = draft[command.key] as unknown[];
        if (Array.isArray(arr) && isValidIndex(arr.length, command.index)) {
          if (arr[command.index] !== command.item) {
            arr[command.index] = command.item;
            mutated = true;
          }
        }
        break;
      }
      case "reorderArray": {
        const arr = draft[command.key] as unknown[];
        if (
          Array.isArray(arr) &&
          isValidIndex(arr.length, command.from) &&
          Number.isInteger(command.to) &&
          command.to >= 0 &&
          command.to < arr.length &&
          command.from !== command.to
        ) {
          const [moved] = arr.splice(command.from, 1);
          if (moved !== undefined) {
            arr.splice(command.to, 0, moved);
            mutated = true;
          }
        }
        break;
      }
      case "setSkills": {
        const input = Array.isArray(command.skills) ? command.skills : [];
        const clean = input
          .filter((s): s is string => typeof s === "string")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 100);
        if (JSON.stringify(draft.skills) !== JSON.stringify(clean)) {
          draft.skills = clean;
          mutated = true;
        }
        break;
      }
      case "setPhoto": {
        const url = typeof command.dataUrl === "string" ? command.dataUrl : "";
        const photo = draft.photo ?? { enabled: false, url: "", dataUrl: "" };
        if (photo.dataUrl !== url || photo.enabled !== true) {
          draft.photo = { ...photo, dataUrl: url, enabled: true };
          mutated = true;
        }
        break;
      }
      default: {
        const _exhaustive: never = command;
        void _exhaustive;
        break;
      }
    }
    if (mutated) {
      draft.updatedAt = Date.now();
    }
  });
}

export { getByPath };

export function ensureSectionOrder(doc: ResumeDocument): string[] {
  return doc.sectionOrder?.length ? doc.sectionOrder : getDefaultSectionOrder();
}
