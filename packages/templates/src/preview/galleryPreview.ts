import { sampleResume, type ResumeDocument, type TemplateId } from "@resume/core";
import { documentToIr, TEMPLATES, type LayoutIr } from "../ir/documentToIr.js";
import { defaultSkillsDensity, type SkillsDensity } from "./layoutAssist.js";

/** A template manifest paired with the rendered sample doc + IR for live previews. */
export interface GalleryTemplatePreview {
  id: TemplateId;
  name: string;
  description: string;
  atsFriendly: boolean;
  supportsPhoto: boolean;
  previewAccent: string;
  doc: ResumeDocument;
  ir: LayoutIr;
  skillsDensity: SkillsDensity;
}

/** Shared doc id for gallery samples so they never collide with saved user resumes. */
export const GALLERY_PREVIEW_DOC_ID = "gallery-template-sample";

/** Build one render-ready sample preview per template, in manifest order. */
export function buildGalleryTemplatePreviews(): GalleryTemplatePreview[] {
  const sample = sampleResume();
  return TEMPLATES.map((manifest) => {
    const doc: ResumeDocument = { ...sample, id: GALLERY_PREVIEW_DOC_ID, template: manifest.id };
    return {
      ...manifest,
      doc,
      ir: documentToIr(doc),
      skillsDensity: defaultSkillsDensity(doc),
    };
  });
}

/** Find a preview by template id, falling back to the first template. */
export function getGalleryPreview(
  previews: GalleryTemplatePreview[],
  id: string,
): GalleryTemplatePreview {
  return previews.find((preview) => preview.id === id) ?? previews[0]!;
}
