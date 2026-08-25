import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { blankResume } from "@resume/core";
import { IndexedDbStorage, importResumeJson, exportResumeJson } from "../index.js";

describe("IndexedDbStorage", () => {
  it("persists documents", async () => {
    const storage = new IndexedDbStorage();
    const doc = blankResume({ name: "IDB" });
    await storage.save(doc);
    const loaded = await storage.load(doc.id);
    expect(loaded?.name).toBe("IDB");
    const list = await storage.list();
    expect(list.some((m) => m.id === doc.id)).toBe(true);
  });

  it("creates a resume with a given template", async () => {
    const storage = new IndexedDbStorage();
    const created = await storage.create("ats");
    expect(created.template).toBe("ats");
    const list = await storage.list();
    expect(list.some((m) => m.id === created.id)).toBe(true);
  });
});

describe("JSON import/export", () => {
  it("round-trips", () => {
    const doc = blankResume({ name: "Round" });
    const json = exportResumeJson(doc);
    const back = importResumeJson(json);
    expect(back.name).toBe("Round");
  });
});
