import { describe, expect, it } from "vitest";
import { blankResume, sampleResume } from "@resume/core";
import { documentToIr, TEMPLATES } from "../index.js";

describe("documentToIr", () => {
  it("builds sidebar IR with two columns", () => {
    const ir = documentToIr(sampleResume());
    expect(ir.templateId).toBe("sidebar");
    expect(ir.pages[0]?.columns).toHaveLength(2);
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
