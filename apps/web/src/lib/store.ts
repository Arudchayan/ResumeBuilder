import { create } from "zustand";
import {
  blankResume,
  createHistory,
  dispatch,
  applyCommand,
  redo as redoHistory,
  undo as undoHistory,
  replacePresent,
  sampleResume,
  type HistoryState,
  type ResumeCommand,
  type ResumeDocument,
  type TemplateId,
} from "@resume/core";
import { toast } from "sonner";
import {
  IndexedDbStorage,
  LocalResumeLibrary,
  migrateLegacyDraft,
  exportResumeJson,
  importResumeJson,
} from "@resume/storage";
import { DisabledAiPort, NullAuthPort, type ResumeMeta } from "@resume/ports";

let lastTyping: { key: string; at: number } | null = null;
function typingKey(cmd: ResumeCommand): string | null {
  if (cmd.type === "setField") return `set:${cmd.path}`;
  if (cmd.type === "updateArrayItem") return `arr:${String(cmd.key)}:${cmd.index}`;
  if (cmd.type === "setSkills") return "skills";
  if (cmd.type === "setPhoto") return "photo";
  return null;
}
/** Any non-typing transition (undo/load/open/…) ends the coalescing window. */
function resetTyping() {
  lastTyping = null;
}

const storage = new IndexedDbStorage();
const library = new LocalResumeLibrary(storage);
export const authPort = new NullAuthPort();
export const aiPort = new DisabledAiPort();

type Screen = "gallery" | "editor";

interface AppState {
  ready: boolean;
  screen: Screen;
  history: HistoryState;
  activeSection: string;
  zoom: number;
  dirty: boolean;
  lastSaved: number | null;
  exporting: "pdf" | "docx" | "json" | null;
  modal: "about" | "privacy" | "shortcuts" | null;
  bootstrap: () => Promise<void>;
  refreshLibrary: () => Promise<void>;
  openResume: (id: string) => Promise<void>;
  duplicateResume: (id: string) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  resumes: ResumeMeta[];
  setScreen: (screen: Screen) => void;
  setActiveSection: (id: string) => void;
  setZoom: (zoom: number) => void;
  setModal: (modal: AppState["modal"]) => void;
  apply: (command: ResumeCommand) => void;
  undo: () => void;
  redo: () => void;
  startBlank: (template: TemplateId) => Promise<void>;
  startSample: (template: TemplateId) => Promise<void>;
  loadDocument: (doc: ResumeDocument) => void;
  saveNow: () => Promise<boolean>;
  importJsonFile: (file: File) => Promise<void>;
  exportJson: () => void;
}

function persistDebounced(get: () => AppState) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inFlight = false;
  let queued = false;
  const run = async () => {
    if (inFlight) {
      queued = true;
      return;
    }
    inFlight = true;
    try {
      await get().saveNow();
    } finally {
      inFlight = false;
      if (queued) {
        queued = false;
        timer = setTimeout(() => void run(), 800);
      }
    }
  };
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void run(), 800);
  };
  if (typeof window !== "undefined") {
    // Best-effort only: async IndexedDB writes may not complete on unload,
    // but pagehide/visibilitychange fire earlier than beforeunload and the
    // debounced timer already covers everything older than 800ms.
    const flush = () => {
      void get().saveNow();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }
  return schedule;
}

export function sanitizeFilename(name: string, ext = ".json"): string {
  const base = (name || "resume").trim().slice(0, 80) || "resume";
  return `${base.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-")}${ext}`;
}

export const useAppStore = create<AppState>((set, get) => {
  const scheduleSave = persistDebounced(get);

  return {
    ready: false,
    screen: "gallery",
    resumes: [],
    history: createHistory(blankResume()),
    activeSection: "identity",
    zoom: 0.72,
    dirty: false,
    lastSaved: null,
    exporting: null,
    modal: null,

    async bootstrap() {
      try {
        const migrated = await migrateLegacyDraft();
        const list = await library.list();
        set({ resumes: list });
        if (migrated) {
          set({
            history: createHistory(migrated),
            screen: "editor",
            ready: true,
            lastSaved: Date.now(),
          });
          return;
        }
        if (list[0]) {
          try {
            const doc = await library.get(list[0].id);
            if (doc) {
              set({
                history: createHistory(doc),
                screen: "editor",
                ready: true,
                lastSaved: doc.updatedAt || Date.now(),
              });
              return;
            }
          } catch {
            // fall through to gallery rather than hanging
          }
        }
        set({ ready: true, screen: "gallery", resumes: list });
      } catch {
        set({ ready: true, screen: "gallery" });
      }
    },

    async refreshLibrary() {
      try {
        set({ resumes: await library.list() });
      } catch {
        // keep stale list rather than clearing UI
      }
    },

    async openResume(id) {
      try {
        const doc = await library.get(id);
        if (!doc) {
          toast.error("Could not open resume — it may be corrupt.");
          return;
        }
        resetTyping();
        set({
          history: createHistory(doc),
          screen: "editor",
          activeSection: "identity",
          dirty: false,
          lastSaved: doc.updatedAt || Date.now(),
        });
      } catch {
        toast.error("Could not open resume — storage read failed.");
      }
    },

    async duplicateResume(id) {
      try {
        const copy = await library.duplicate(id);
        resetTyping();
        set({ resumes: await library.list() });
        set({
          history: createHistory(copy),
          screen: "editor",
          activeSection: "identity",
          dirty: false,
          lastSaved: Date.now(),
        });
      } catch {
        toast.error("Could not duplicate resume.");
      }
    },

    async deleteResume(id) {
      try {
        await library.delete(id);
        const list = await library.list();
        if (get().history.present.id === id) {
          // Don't autosave-resurrect the doc we just deleted.
          resetTyping();
          set({ resumes: list, history: createHistory(blankResume()), screen: "gallery", dirty: false });
        } else {
          set({ resumes: list });
        }
      } catch {
        toast.error("Could not delete resume.");
      }
    },

    setScreen(screen) {
      set({ screen });
    },
    setActiveSection(id) {
      set({ activeSection: id });
    },
    setZoom(zoom) {
      set({ zoom: Math.min(1.25, Math.max(0.5, zoom)) });
    },
    setModal(modal) {
      set({ modal });
    },

    apply(command) {
      const key = typingKey(command);
      const now = Date.now();
      if (key && lastTyping && lastTyping.key === key && now - lastTyping.at < 1200) {
        const next = applyCommand(get().history.present, command);
        if (next === get().history.present) return;
        // A coalesced keystroke is still a new edit: drop any redo future
        // so redo can never resurrect pre-undo state.
        set((s) => ({ history: { past: s.history.past, present: next, future: [] }, dirty: true }));
        lastTyping = { key, at: now };
        scheduleSave();
        return;
      }
      const history = dispatch(get().history, command);
      if (history === get().history) return;
      set({ history, dirty: true });
      lastTyping = key ? { key, at: now } : null;
      scheduleSave();
    },

    undo() {
      const prev = get().history;
      const history = undoHistory(prev);
      if (history === prev) return;
      resetTyping();
      set({ history, dirty: true });
      scheduleSave();
    },

    redo() {
      const prev = get().history;
      const history = redoHistory(prev);
      if (history === prev) return;
      resetTyping();
      set({ history, dirty: true });
      scheduleSave();
    },

    async startBlank(template) {
      try {
        const doc = await library.create(template);
        resetTyping();
        set({
          history: createHistory(doc),
          screen: "editor",
          activeSection: "identity",
          dirty: false,
          lastSaved: Date.now(),
          resumes: await library.list(),
        });
      } catch {
        toast.error("Could not create resume — storage write failed.");
      }
    },

    async startSample(template) {
      try {
        const doc = sampleResume();
        doc.template = template;
        doc.id = globalThis.crypto?.randomUUID?.() ?? `sample-${Date.now()}`;
        await library.save(doc);
        resetTyping();
        set({
          history: createHistory(doc),
          screen: "editor",
          activeSection: "identity",
          dirty: false,
          lastSaved: Date.now(),
          resumes: await library.list(),
        });
      } catch {
        toast.error("Could not create sample resume — storage write failed.");
      }
    },

    loadDocument(doc) {
      resetTyping();
      set({ history: replacePresent(get().history, doc), dirty: true });
      scheduleSave();
    },

    async saveNow() {
      const doc = get().history.present;
      try {
        await library.save(doc);
        // Only clear dirty if nothing changed underneath us mid-save.
        if (get().history.present === doc) {
          set({ dirty: false, lastSaved: Date.now() });
        }
        return true;
      } catch (err) {
        set({ dirty: true });
        if (typeof window !== "undefined") {
          const msg =
            err instanceof Error && /quota/i.test(err.message)
              ? "Storage full: remove the photo or an old resume and retry."
              : "Autosave failed — will retry. Your edits are still in memory.";
          toast.error(msg);
        }
        return false;
      }
    },

    async importJsonFile(file) {
      if (file.size > 10_000_000) throw new Error("Import too large (max 10MB)");
      const text = await file.text();
      if (text.length > 10_000_000) throw new Error("Import too large (max 10MB)");
      const doc = importResumeJson(text);
      if (!doc.id) doc.id = globalThis.crypto?.randomUUID?.() ?? `import-${Date.now()}`;
      await library.save(doc);
      resetTyping();
      set({
        history: createHistory(doc),
        screen: "editor",
        dirty: false,
        lastSaved: Date.now(),
      });
    },

    exportJson() {
      const doc = get().history.present;
      const json = exportResumeJson(doc);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = sanitizeFilename(doc.name);
      a.click();
      URL.revokeObjectURL(url);
    },
  };
});

export function selectDoc(s: AppState) {
  return s.history.present;
}
