import { create } from "zustand";
import { toast } from "sonner";
import {
  applyCommand,
  blankResume,
  createHistory,
  dispatch,
  parseResumeData,
  redo as redoHistory,
  undo as undoHistory,
  sampleResume,
  type HistoryState,
  type ResumeCommand,
  type ResumeDocument,
  type TemplateId,
} from "@resume/core";
import {
  IndexedDbStorage,
  migrateLegacyDraft,
  newResumeId,
  type ResumeMeta,
} from "@resume/storage";
import { downloadBlob, downloadDocx } from "@resume/export";

const library = new IndexedDbStorage();

type Screen = "gallery" | "editor";

const MAX_IMPORT_BYTES = 10_000_000;
const TYPING_WINDOW_MS = 1200;

/** Strip characters illegal in file names and cap length. */
export function sanitizeFilename(name: string, ext = ".json"): string {
  const base = (name || "resume").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "").trim().slice(0, 80).trim();
  return `${base || "resume"}${ext}`;
}

function quotaMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/quota|storage.*full|NS_ERROR_DOM_QUOTA/i.test(msg)) {
    return "Browser storage is full — free space or export JSON backups, then retry.";
  }
  return `Save failed (${msg || "unknown error"}). Your edits are kept — retry shortly.`;
}

/** Map a command to its typing-coalescing key, or null when it must push history. */
function typingKey(cmd: ResumeCommand): string | null {
  switch (cmd.type) {
    case "setField":
      return `set:${cmd.path}`;
    case "updateArrayItem":
      return `arr:${cmd.key}:${cmd.index}`;
    case "setPhoto":
      return "photo";
    default:
      return null;
  }
}

let lastTyping: { key: string; at: number } | null = null;
/** Any non-typing transition (undo/redo/open/load) ends the coalescing window. */
function resetTyping() {
  lastTyping = null;
}

interface AppState {
  ready: boolean;
  screen: Screen;
  history: HistoryState;
  resumes: ResumeMeta[];
  activeSection: string;
  zoom: number;
  dirty: boolean;
  lastSaved: number | null;
  modal: "about" | "privacy" | "shortcuts" | null;
  bootstrap: () => Promise<void>;
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
  refreshLibrary: () => Promise<void>;
  openResume: (id: string) => Promise<void>;
  duplicateResume: (id: string) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  saveNow: () => Promise<boolean>;
  importJsonFile: (file: File) => Promise<boolean>;
  exportJson: () => void;
}

export const useAppStore = create<AppState>((set, get) => {
  // Serialized autosave: concurrent triggers queue a follow-up pass so the
  // last write always reflects the latest present.
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inFlight = false;
  let queued = false;
  const runSave = async () => {
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
        await get().saveNow();
      }
    }
  };
  const scheduleSave = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void runSave();
    }, 800);
  };

  // Best-effort flush on unload. Async IndexedDB writes may not complete
  // once the page is gone; the 800ms debounce covers anything older.
  if (typeof window !== "undefined") {
    const flush = () => {
      if (get().dirty) void runSave();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }

  return {
    ready: false,
    screen: "gallery",
    history: createHistory(blankResume()),
    resumes: [],
    activeSection: "identity",
    zoom: 0.72,
    dirty: false,
    lastSaved: null,
    modal: null,

    async bootstrap() {
      try {
        const migrated = await migrateLegacyDraft();
        const list = await library.list();
        set({ resumes: list });
        if (migrated) {
          resetTyping();
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
            const doc = await library.load(list[0].id);
            if (doc) {
              resetTyping();
              set({
                history: createHistory(doc),
                screen: "editor",
                ready: true,
                lastSaved: doc.updatedAt || Date.now(),
              });
              return;
            }
          } catch (err) {
            console.error("Failed to open most recent resume", err);
          }
        }
      } catch (err) {
        // IndexedDB unavailable (private mode, blocked) — land on the
        // gallery instead of hanging on a loading screen forever.
        console.error("Failed to initialize library", err);
        toast.error("Local library unavailable — you can still edit, but saving is disabled.");
      }
      set({ ready: true, screen: "gallery" });
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
      // Coalesce rapid keystrokes on the same field: mutate present without
      // pushing history, so typing a word is one undo step. A new edit
      // always invalidates the redo stack.
      const key = typingKey(command);
      const now = Date.now();
      if (key && lastTyping && lastTyping.key === key && now - lastTyping.at < TYPING_WINDOW_MS) {
        const h = get().history;
        const next = applyCommand(h.present, command);
        lastTyping = { key, at: now };
        if (next === h.present) return;
        set({ history: { ...h, present: next, future: [] }, dirty: true });
        scheduleSave();
        return;
      }
      const history = dispatch(get().history, command);
      lastTyping = key ? { key, at: now } : null;
      if (history === get().history) return;
      set({ history, dirty: true });
      scheduleSave();
    },

    undo() {
      const prev = get().history;
      const history = undoHistory(prev);
      resetTyping();
      if (history === prev) return;
      set({ history, dirty: true });
      scheduleSave();
    },

    redo() {
      const prev = get().history;
      const history = redoHistory(prev);
      resetTyping();
      if (history === prev) return;
      set({ history, dirty: true });
      scheduleSave();
    },

    async startBlank(template) {
      try {
        const doc = await library.create(template);
        resetTyping();
        set({
          history: createHistory(doc),
          resumes: await library.list(),
          screen: "editor",
          activeSection: "identity",
          dirty: false,
          lastSaved: Date.now(),
        });
      } catch (err) {
        toast.error(quotaMessage(err));
      }
    },

    async startSample(template) {
      try {
        const doc = sampleResume();
        doc.template = template;
        doc.id = newResumeId("sample");
        await library.save(doc);
        resetTyping();
        set({
          history: createHistory(doc),
          resumes: await library.list(),
          screen: "editor",
          activeSection: "identity",
          dirty: false,
          lastSaved: Date.now(),
        });
      } catch (err) {
        toast.error(quotaMessage(err));
      }
    },

    loadDocument(doc) {
      resetTyping();
      set({ history: createHistory(doc), dirty: true });
      scheduleSave();
    },

    async refreshLibrary() {
      try {
        set({ resumes: await library.list() });
      } catch (err) {
        console.error("Failed to refresh library", err);
      }
    },

    async openResume(id) {
      try {
        const doc = await library.load(id);
        if (!doc) {
          toast.error("Resume not found — it may have been deleted in another tab.");
          set({ resumes: await library.list() });
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
      } catch (err) {
        toast.error(`Could not open resume (${err instanceof Error ? err.message : "unknown error"}).`);
      }
    },

    async duplicateResume(id) {
      try {
        const src = await library.load(id);
        if (!src) {
          toast.error("Resume not found — it may have been deleted in another tab.");
          return;
        }
        const copy: ResumeDocument = {
          ...structuredClone(src),
          id: newResumeId("copy"),
          name: `${src.name || "Untitled resume"} (copy)`,
        };
        await library.save(copy);
        resetTyping();
        set({
          history: createHistory(copy),
          resumes: await library.list(),
          screen: "editor",
          activeSection: "identity",
          dirty: false,
          lastSaved: Date.now(),
        });
      } catch (err) {
        toast.error(quotaMessage(err));
      }
    },

    async deleteResume(id) {
      try {
        await library.delete(id);
        const resumes = await library.list();
        // If the open document was deleted, reset to blank so the next
        // autosave cannot resurrect it.
        if (get().history.present.id === id) {
          resetTyping();
          set({ history: createHistory(blankResume()), resumes, screen: "gallery", dirty: false });
        } else {
          set({ resumes });
        }
      } catch (err) {
        toast.error(`Could not delete resume (${err instanceof Error ? err.message : "unknown error"}).`);
      }
    },

    async saveNow() {
      const doc = get().history.present;
      try {
        await library.save(doc);
      } catch (err) {
        toast.error(quotaMessage(err));
        return false;
      }
      // Only clear dirty when nothing changed mid-save; concurrent edits
      // keep dirty:true and rely on the queued follow-up pass.
      if (get().history.present === doc) {
        set({ dirty: false, lastSaved: Date.now() });
      }
      return true;
    },

    async importJsonFile(file) {
      try {
        if (file.size > MAX_IMPORT_BYTES) {
          toast.error(`File is too large (${(file.size / 1_000_000).toFixed(1)}MB). Limit is 10MB.`);
          return false;
        }
        const text = await file.text();
        if (text.length > MAX_IMPORT_BYTES) {
          toast.error("File is too large. Limit is 10MB.");
          return false;
        }
        const doc = parseResumeData(JSON.parse(text) as unknown);
        if (!doc.id) doc.id = newResumeId("import");
        await library.save(doc);
        resetTyping();
        set({
          history: createHistory(doc),
          resumes: await library.list(),
          screen: "editor",
          dirty: false,
          lastSaved: Date.now(),
        });
        return true;
      } catch (err) {
        toast.error(
          err instanceof SyntaxError
            ? "That file is not valid JSON."
            : `Could not import resume (${err instanceof Error ? err.message : "unknown error"}).`,
        );
        return false;
      }
    },

    exportJson() {
      const doc = get().history.present;
      const json = JSON.stringify(doc, null, 2);
      downloadBlob(new Blob([json], { type: "application/json" }), sanitizeFilename(doc.name));
    },
  };
});

export const selectDoc = (s: AppState) => s.history.present;
