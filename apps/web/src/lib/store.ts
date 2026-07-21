import { create } from "zustand";
import {
  blankResume,
  createHistory,
  dispatch,
  redo as redoHistory,
  undo as undoHistory,
  replacePresent,
  sampleResume,
  type HistoryState,
  type ResumeCommand,
  type ResumeDocument,
  type TemplateId,
} from "@resume/core";
import {
  IndexedDbStorage,
  LocalResumeLibrary,
  migrateLegacyDraft,
  exportResumeJson,
  importResumeJson,
} from "@resume/storage";
import { DisabledAiPort, NullAuthPort } from "@resume/ports";

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
  saveNow: () => Promise<void>;
  importJsonFile: (file: File) => Promise<void>;
  exportJson: () => void;
}

function persistDebounced(get: () => AppState) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void get().saveNow();
    }, 800);
  };
}

export const useAppStore = create<AppState>((set, get) => {
  const scheduleSave = persistDebounced(get);

  return {
    ready: false,
    screen: "gallery",
    history: createHistory(blankResume()),
    activeSection: "identity",
    zoom: 0.85,
    dirty: false,
    lastSaved: null,
    exporting: null,
    modal: null,

    async bootstrap() {
      const migrated = await migrateLegacyDraft();
      const list = await library.list();
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
      const history = dispatch(get().history, command);
      set({ history, dirty: true });
      scheduleSave();
    },

    undo() {
      const history = undoHistory(get().history);
      set({ history, dirty: true });
      scheduleSave();
    },

    redo() {
      const history = redoHistory(get().history);
      set({ history, dirty: true });
      scheduleSave();
    },

    async startBlank(template) {
      const doc = await library.create(template);
      set({
        history: createHistory(doc),
        screen: "editor",
        activeSection: "identity",
        dirty: false,
        lastSaved: Date.now(),
      });
    },

    async startSample(template) {
      const doc = sampleResume();
      doc.template = template;
      doc.id = crypto.randomUUID();
      await library.save(doc);
      set({
        history: createHistory(doc),
        screen: "editor",
        activeSection: "identity",
        dirty: false,
        lastSaved: Date.now(),
      });
    },

    loadDocument(doc) {
      set({ history: replacePresent(get().history, doc), dirty: true });
      scheduleSave();
    },

    async saveNow() {
      const doc = get().history.present;
      await library.save(doc);
      set({ dirty: false, lastSaved: Date.now() });
    },

    async importJsonFile(file) {
      const text = await file.text();
      const doc = importResumeJson(text);
      if (!doc.id) doc.id = crypto.randomUUID();
      await library.save(doc);
      set({
        history: createHistory(doc),
        screen: "editor",
        dirty: false,
        lastSaved: Date.now(),
      });
    },

    exportJson() {
      const json = exportResumeJson(get().history.present);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.json";
      a.click();
      URL.revokeObjectURL(url);
    },
  };
});

export function selectDoc(s: AppState) {
  return s.history.present;
}
