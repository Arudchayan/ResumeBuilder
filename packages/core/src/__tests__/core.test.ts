import { describe, expect, it } from "vitest";
import {
  applyCommand,
  blankResume,
  createHistory,
  dispatch,
  undo,
  redo,
  validateResumeData,
} from "../index.js";

describe("resumeSchema", () => {
  it("accepts blank resume", () => {
    const result = validateResumeData(blankResume());
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = validateResumeData(blankResume({ contact: { email: "nope", phone: "", location: "" } }));
    expect(result.success).toBe(false);
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
