import type { ResumeDocument } from "@resume/core";
import { documentToIr } from "@resume/templates";

export function exportJsonString(doc: ResumeDocument): string {
  return JSON.stringify(doc, null, 2);
}

/** Structural parity fingerprint: sectionIds + block types in IR order */
export function irFingerprint(doc: ResumeDocument): string[] {
  const ir = documentToIr(doc);
  const marks: string[] = [];
  for (const page of ir.pages) {
    for (const col of page.columns) {
      for (const block of col.blocks) {
        marks.push(`${col.id}:${block.type}:${"sectionId" in block ? block.sectionId ?? "" : ""}`);
      }
    }
  }
  return marks;
}
