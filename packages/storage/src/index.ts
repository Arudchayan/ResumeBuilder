import {
  blankResume,
  parseResumeData,
  normalizeTemplateId,
  type ResumeDocument,
} from "@resume/core";

const DB_NAME = "resume-builder-v2";
const STORE = "resumes";
const DB_VERSION = 1;
const LEGACY_KEY = "resume_draft";
const MIGRATED_FLAG = "resume_draft_migrated_v2";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

/** Migrate localStorage resume_draft → IndexedDB once. */
export async function migrateLegacyDraft(): Promise<ResumeDocument | null> {
  if (typeof localStorage === "undefined") return null;
  if (localStorage.getItem(MIGRATED_FLAG) === "1") return null;
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) {
    localStorage.setItem(MIGRATED_FLAG, "1");
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    delete parsed._savedAt;
    parsed.template = normalizeTemplateId(parsed.template);
    if (!parsed.id) parsed.id = crypto.randomUUID();
    const doc = parseResumeData(parsed);
    const storage = new IndexedDbStorage();
    await storage.save(doc);
    localStorage.setItem(MIGRATED_FLAG, "1");
    return doc;
  } catch {
    localStorage.setItem(MIGRATED_FLAG, "1");
    return null;
  }
}

export type ResumeMeta = {
  id: string;
  title: string;
  template: string;
  updatedAt: number;
};

export class IndexedDbStorage {
  async load(id: string): Promise<ResumeDocument | null> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => {
        const value = req.result;
        resolve(value ? parseResumeData(value) : null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async save(doc: ResumeDocument): Promise<void> {
    const db = await openDb();
    const toSave = { ...doc, updatedAt: Date.now() };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(toSave);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async list(): Promise<ResumeMeta[]> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => {
        const rows = (req.result as ResumeDocument[]) ?? [];
        resolve(
          rows
            .map((d) => ({
              id: d.id || "unknown",
              title: d.name || "Untitled resume",
              template: d.template,
              updatedAt: d.updatedAt || 0,
            }))
            .sort((a, b) => b.updatedAt - a.updatedAt),
        );
      };
      req.onerror = () => reject(req.error);
    });
  }

  async create(template = "sidebar"): Promise<ResumeDocument> {
    const doc = blankResume({ template: normalizeTemplateId(template) });
    await this.save(doc);
    return doc;
  }
}

