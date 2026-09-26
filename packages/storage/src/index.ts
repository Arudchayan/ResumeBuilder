import {
  blankResume,
  parseResumeData,
  parseResumeMeta,
  normalizeTemplateId,
  normalizeThemeId,
  type ResumeDocument,
} from "@resume/core";

const DB_NAME = "resume-builder-v2";
const STORE = "resumes";
const DB_VERSION = 1;
const LEGACY_KEY = "resume_draft";
const MIGRATED_FLAG = "resume_draft_migrated_v2";
const QUARANTINE_KEY = "resume_draft_quarantine_v2";

function newId(prefix: string): string {
  try {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return uuid;
  } catch {
    // fall through to the Math.random fallback below
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (err) {
      reject(err instanceof Error ? err : new Error("IndexedDB unavailable"));
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onblocked = () => reject(new Error("IndexedDB upgrade blocked by another tab"));
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
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // Not JSON at all: quarantine the raw text so it is never retried,
    // then flag as migrated so boot does not hit this every time.
    try {
      try {
        localStorage.setItem(QUARANTINE_KEY, raw);
      } catch {
        localStorage.setItem(QUARANTINE_KEY, raw.slice(0, 100_000));
      }
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      // storage itself is broken; nothing more we can preserve
    }
    localStorage.setItem(MIGRATED_FLAG, "1");
    return null;
  }
  try {
    delete parsed._savedAt;
    parsed.template = normalizeTemplateId(parsed.template);
    parsed.theme = normalizeThemeId(parsed.theme);
    if (!parsed.id) parsed.id = newId("legacy");
    const doc = parseResumeData(parsed);
    const storage = new IndexedDbStorage();
    await storage.save(doc);
    try {
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      // non-fatal: the migrated flag below prevents re-migration
    }
    localStorage.setItem(MIGRATED_FLAG, "1");
    return doc;
  } catch {
    // Parseable JSON but invalid as a resume: quarantine for inspection,
    // remove the legacy key, and flag so boot moves on.
    try {
      try {
        localStorage.setItem(QUARANTINE_KEY, raw);
      } catch {
        localStorage.setItem(QUARANTINE_KEY, raw.slice(0, 100_000));
      }
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      // storage itself is broken; nothing more we can preserve
    }
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
        try {
          resolve(value ? parseResumeData(value) : null);
        } catch (err) {
          reject(err);
        }
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

  async delete(id: string): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
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
        const rows = (req.result as unknown[]) ?? [];
        // Loose meta parse: a row with a strict body field still shows up;
        // full validation happens on load().
        const metas: ResumeMeta[] = [];
        for (const row of rows) {
          const meta = parseResumeMeta(row);
          if (!meta) continue;
          metas.push({
            id: meta.id,
            title: meta.name || "Untitled resume",
            template: meta.template,
            updatedAt: meta.updatedAt,
          });
        }
        resolve(metas.sort((a, b) => b.updatedAt - a.updatedAt));
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

export { newId as newResumeId };
