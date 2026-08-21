import { describe, expect, it } from "vitest";
import { sampleResume, type ResumeDocument } from "@resume/core";
import {
  buildGalleryTemplatePreviews,
  GALLERY_PREVIEW_DOC_ID,
  getGalleryPreview,
} from "../preview/galleryPreview.js";
import { TEMPLATES } from "../ir/documentToIr.js";

describe("buildGalleryTemplatePreviews", () => {
  it("creates one preview per template manifest, in order", () => {
    const previews = buildGalleryTemplatePreviews();
    expect(previews.map((p) => p.id)).toEqual(TEMPLATES.map((t) => t.id));
    expect(previews.map((p) => p.id)).toEqual(["sidebar", "ats", "compact"]);
  });

  it("renders sample content into a template-specific IR per preview", () => {
    const previews = buildGalleryTemplatePreviews();
    const byId = new Map(previews.map((p) => [p.id, p]));

    const sidebar = byId.get("sidebar");
    expect(sidebar?.ir.templateId).toBe("sidebar");
    expect(sidebar?.ir.pages[0]?.columns).toHaveLength(2);
    expect(sidebar?.doc.name).toBe(sampleResume().name);

    const ats = byId.get("ats");
    expect(ats?.ir.templateId).toBe("ats");
    expect(ats?.ir.pages[0]?.columns).toHaveLength(1);

    const compact = byId.get("compact");
    expect(compact?.ir.templateId).toBe("compact");
    expect(compact?.ir.pages[0]?.columns).toHaveLength(1);
  });

  it("uses a shared gallery doc id so samples never collide with saved resumes", () => {
    const previews = buildGalleryTemplatePreviews();
    for (const preview of previews) {
      expect(preview.doc.id).toBe(GALLERY_PREVIEW_DOC_ID);
    }
  });

  it("keeps sample content identical across templates (only the layout differs)", () => {
    const previews = buildGalleryTemplatePreviews();
    const names = new Set(previews.map((p) => p.doc.name));
    const skills = new Set(previews.map((p) => p.doc.skills.length));
    expect(names.size).toBe(1);
    expect(skills.size).toBe(1);
  });

  it("carries manifest metadata through to each preview", () => {
    const previews = buildGalleryTemplatePreviews();
    for (const preview of previews) {
      const manifest = TEMPLATES.find((t) => t.id === preview.id);
      expect(preview.name).toBe(manifest?.name);
      expect(preview.description).toBe(manifest?.description);
      expect(preview.previewAccent).toBe(manifest?.previewAccent);
      expect(preview.atsFriendly).toBe(manifest?.atsFriendly);
      expect(preview.supportsPhoto).toBe(manifest?.supportsPhoto);
    }
  });

  it("derives skills density from the sample document", () => {
    const previews = buildGalleryTemplatePreviews();
    const sample: ResumeDocument = sampleResume();
    const expected = sample.skills.length > 12 ? "compact" : "comfortable";
    for (const preview of previews) {
      expect(preview.skillsDensity).toBe(expected);
    }
  });
});

describe("getGalleryPreview", () => {
  it("finds a preview by template id", () => {
    const previews = buildGalleryTemplatePreviews();
    expect(getGalleryPreview(previews, "compact").id).toBe("compact");
  });

  it("falls back to the first template for unknown ids (e.g. legacy 'modern')", () => {
    const previews = buildGalleryTemplatePreviews();
    expect(getGalleryPreview(previews, "modern").id).toBe(previews[0]?.id);
    expect(getGalleryPreview(previews, "nope").id).toBe("sidebar");
  });
});
