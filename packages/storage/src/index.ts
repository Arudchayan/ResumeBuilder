import {
  blankResume,
  parseResumeData,
  type ResumeDocument,
  TEMPLATE_IDS,
  type TemplateId,
} from "@resume/core";
import type { ResumeLibraryPort, ResumeMeta, StoragePort } from "@resume/ports";

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

function mapLegacyTemplate(raw: unknown): TemplateId {
  if (typeof raw === "string" && (TEMPLATE_IDS as readonly string[]).includes(raw)) {
    return raw as TemplateId;
  }
  // Old app used "modern" for the sidebar layout
  if (raw === "modern") return "sidebar";
  return "sidebar";
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
    parsed.template = mapLegacyTemplate(parsed.template);
    if (!parsed.id) parsed.id = crypto.randomUUID?.() ?? `migrated-${Date.now()}`;
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

export class IndexedDbStorage implements StoragePort {
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

  async delete(id: string): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export class LocalResumeLibrary implements ResumeLibraryPort {
  constructor(private storage: StoragePort = new IndexedDbStorage()) {}

  list() {
    return this.storage.list();
  }

  async create(template = "sidebar") {
    const doc = blankResume({
      template: mapLegacyTemplate(template),
    });
    await this.storage.save(doc);
    return doc;
  }

  get(id: string) {
    return this.storage.load(id);
  }

  save(doc: ResumeDocument) {
    return this.storage.save(doc);
  }

  async duplicate(id: string) {
    const existing = await this.storage.load(id);
    if (!existing) throw new Error("Resume not found");
    const copy = blankResume({
      ...existing,
      id: crypto.randomUUID?.() ?? `copy-${Date.now()}`,
      name: existing.name ? `${existing.name} (copy)` : "Untitled resume (copy)",
    });
    await this.storage.save(copy);
    return copy;
  }

  delete(id: string) {
    return this.storage.delete(id);
  }
}

export function exportResumeJson(doc: ResumeDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function importResumeJson(raw: string): ResumeDocument {
  const parsed = JSON.parse(raw) as unknown;
  return parseResumeData(parsed);
}

/** In-memory adapter for tests / SSR. */
export class MemoryStorage implements StoragePort {
  private map = new Map<string, ResumeDocument>();

  async load(id: string) {
    return this.map.get(id) ?? null;
  }
  async save(doc: ResumeDocument) {
    this.map.set(doc.id, { ...doc, updatedAt: Date.now() });
  }
  async list(): Promise<ResumeMeta[]> {
    return [...this.map.values()]
      .map((d) => ({
        id: d.id,
        title: d.name || "Untitled resume",
        template: d.template,
        updatedAt: d.updatedAt || 0,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async delete(id: string) {
    this.map.delete(id);
  }
}
