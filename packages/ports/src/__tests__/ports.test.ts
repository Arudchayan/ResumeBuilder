import { describe, expect, it } from "vitest";
import { DisabledAiPort, NullAuthPort } from "../index.js";

describe("SaaS port stubs", () => {
  it("NullAuthPort returns null session", async () => {
    expect(await new NullAuthPort().getSession()).toBeNull();
  });

  it("DisabledAiPort is off", async () => {
    const ai = new DisabledAiPort();
    expect(ai.isEnabled()).toBe(false);
    expect(await ai.suggestBullets({ role: "", company: "", existingBullets: [] })).toEqual([]);
  });
});
