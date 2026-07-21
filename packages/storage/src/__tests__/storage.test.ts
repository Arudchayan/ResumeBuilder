import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { blankResume } from "@resume/core";
import { IndexedDbStorage, MemoryStorage, LocalResumeLibrary, importResumeJson, exportResumeJson } from "../index.js";

describe("MemoryStorage", () => {
  it("saves and loads", async () => {
    const storage = new MemoryStorage();
    const doc = blankResume({ name: "Test" });
    await storage.save(doc);
    const loaded = await storage.load(doc.id);
    expect(loaded?.name).toBe("Test");
  });
});

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
});

describe("LocalResumeLibrary", () => {
  it("creates and duplicates", async () => {
    const lib = new LocalResumeLibrary(new MemoryStorage());
    const created = await lib.create("ats");
    expect(created.template).toBe("ats");
    const copy = await lib.duplicate(created.id);
    expect(copy.id).not.toBe(created.id);
    expect(copy.name).toContain("copy");
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
