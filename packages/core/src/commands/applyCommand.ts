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
  | { type: "setSkills"; skills: string[] };

export type ArrayKey =
  | "links"
  | "jobs"
  | "projects"
  | "certs"
  | "edus"
  | "languages"
  | "publications"
  | "awards";

function setByPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let cursor: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const next = cursor[key];
    if (typeof next !== "object" || next === null) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]!] = value;
}

export function applyCommand(doc: ResumeDocument, command: ResumeCommand): ResumeDocument {
  return produce(doc, (draft) => {
    draft.updatedAt = Date.now();
    switch (command.type) {
      case "setField":
        setByPath(draft as unknown as Record<string, unknown>, command.path, command.value);
        break;
      case "setDocument":
        Object.assign(draft, command.document);
        break;
      case "reorderSections":
        draft.sectionOrder = command.order;
        break;
      case "setSectionVisibility":
        draft.sectionVisibility = {
          ...draft.sectionVisibility,
          [command.id]: command.visible,
        };
        break;
      case "setTemplate":
        draft.template = command.template;
        break;
      case "setTheme":
        draft.theme = command.theme;
        break;
      case "addArrayItem":
        (draft[command.key] as unknown[]).push(command.item);
        break;
      case "removeArrayItem":
        (draft[command.key] as unknown[]).splice(command.index, 1);
        break;
      case "updateArrayItem":
        (draft[command.key] as unknown[])[command.index] = command.item;
        break;
      case "reorderArray": {
        const arr = draft[command.key] as unknown[];
        const [moved] = arr.splice(command.from, 1);
        if (moved !== undefined) arr.splice(command.to, 0, moved);
        break;
      }
      case "setSkills":
        draft.skills = command.skills;
        break;
      default: {
        const _exhaustive: never = command;
        void _exhaustive;
        break;
      }
    }
  });
}

export function ensureSectionOrder(doc: ResumeDocument): string[] {
  return doc.sectionOrder?.length ? doc.sectionOrder : getDefaultSectionOrder();
}
