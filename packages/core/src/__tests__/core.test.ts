import { describe, expect, it } from "vitest";
import {
  applyCommand,
  blankResume,
  createHistory,
  dispatch,
  undo,
  redo,
  parseResumeData,
} from "../index.js";

describe("resumeSchema", () => {
  it("accepts blank resume", () => {
    expect(() => parseResumeData(blankResume())).not.toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      parseResumeData(blankResume({ contact: { email: "nope", phone: "", location: "" } })),
    ).toThrow();
  });

  it("imports legacy modern template and array tech", () => {
    const doc = parseResumeData({
      name: "Ada",
      template: "modern",
      contact: { email: "a@b.com", phone: "", location: "" },
      projects: [
        {
          title: "Tool",
          description: "Desc",
          tech: ["Python", "Spark"],
          when: "Mar 2024 — Aug 2024",
        },
      ],
    });
    expect(doc.template).toBe("sidebar");
    expect(doc.projects[0]?.tech).toBe("Python, Spark");
    expect(doc.projects[0]?.start).toBe("Mar 2024");
    expect(doc.projects[0]?.end).toBe("Aug 2024");
  });
});

describe("commands + history", () => {
  it("applies setField", () => {
    const doc = applyCommand(blankResume(), { type: "setField", path: "name", value: "Ada" });
    expect(doc.name).toBe("Ada");
  });

  it("supports undo/redo", () => {
    let h = createHistory(blankResume());
    h = dispatch(h, { type: "setField", path: "name", value: "Ada" });
    expect(h.present.name).toBe("Ada");
    h = undo(h);
    expect(h.present.name).toBe("");
    h = redo(h);
    expect(h.present.name).toBe("Ada");
  });

  it("reorders sections", () => {
    const doc = applyCommand(blankResume(), {
      type: "reorderSections",
      order: ["skills", "identity", "contact"],
    });
    expect(doc.sectionOrder?.[0]).toBe("skills");
  });
});
