import { describe, expect, it } from "vitest";
import { blankResume, sampleResume } from "@resume/core";
import { documentToIr, TEMPLATES } from "../index.js";

describe("documentToIr", () => {
  it("builds sidebar IR with classic Details heading", () => {
    const ir = documentToIr(sampleResume());
    expect(ir.templateId).toBe("sidebar");
    expect(ir.pages[0]?.columns).toHaveLength(2);
    const aside = ir.pages[0]?.columns.find((c) => c.id === "aside");
    expect(aside?.blocks.some((b) => b.type === "heading" && b.text === "Details")).toBe(true);
    const main = ir.pages[0]?.columns.find((c) => c.id === "main");
    expect(main?.blocks.some((b) => b.type === "accentBar")).toBe(true);
    expect(main?.blocks.some((b) => b.type === "heading" && b.text === "Employment History")).toBe(true);
  });

  it("builds ats as single column", () => {
    const ir = documentToIr(blankResume({ template: "ats", name: "Ada", skills: ["TS"] }));
    expect(ir.pages[0]?.columns).toHaveLength(1);
    expect(ir.pages[0]?.columns[0]?.blocks.some((b) => b.type === "heading")).toBe(true);
  });

  it("exposes three templates", () => {
    expect(TEMPLATES.map((t) => t.id).sort()).toEqual(["ats", "compact", "sidebar"]);
  });
});
