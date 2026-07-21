import { describe, expect, it } from "vitest";
import { sampleResume, blankResume } from "@resume/core";
import { documentToIr } from "@resume/templates";
import { exportDocxBlob, exportJsonString, irFingerprint } from "../index.js";

describe("export parity helpers", () => {
  it("json round content", () => {
    const doc = sampleResume();
    const json = exportJsonString(doc);
    expect(JSON.parse(json).name).toBe(doc.name);
  });

  it("fingerprint stable for same doc", () => {
    const doc = sampleResume();
    expect(irFingerprint(doc)).toEqual(irFingerprint(doc));
  });

  it("docx blob for all templates", async () => {
    for (const template of ["ats", "sidebar", "compact"] as const) {
      const doc = blankResume({ ...sampleResume(), template, id: `t-${template}` });
      const ir = documentToIr(doc);
      expect(ir.templateId).toBe(template);
      const blob = await exportDocxBlob(doc);
      expect(blob.size).toBeGreaterThan(500);
    }
  });
});
