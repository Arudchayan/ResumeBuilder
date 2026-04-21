import { describe, it, expect } from "vitest";
import { validateResumeData } from "../schema.js";
import { blankState } from "../../constants/defaultData.js";

describe("resumeSchema / validateResumeData", () => {
  it("accepts blankState()", () => {
    const r = validateResumeData(blankState());
    expect(r.success).toBe(true);
  });

  it("rejects invalid email on contact", () => {
    const base = blankState();
    base.contact.email = "not-an-email";
    const r = validateResumeData(base);
    expect(r.success).toBe(false);
  });

  it("accepts optional empty strings", () => {
    const r = validateResumeData({
      ...blankState(),
      headline: "",
      summary: "",
    });
    expect(r.success).toBe(true);
  });
});
