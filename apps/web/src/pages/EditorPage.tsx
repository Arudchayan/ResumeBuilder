import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SECTION_CONFIG,
  ensureSectionOrder,
  type ResumeDocument,
} from "@resume/core";
import type { CSSProperties } from "react";
import { documentToIr, ResumePreview, TEMPLATES } from "@resume/templates";
import { Button, themeCssVars } from "@resume/ui";
import {
  Download,
  FileJson,
  FileText,
  Printer,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
  LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";
import { selectDoc, useAppStore } from "../lib/store";
import { SectionEditor } from "../components/SectionEditor";

function SortableTocItem({
  id,
  label,
  active,
  visible,
  onSelect,
  onToggleVisible,
}: {
  id: string;
  label: string;
  active: boolean;
  visible: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-1">
      <button
        type="button"
        className="cursor-grab rounded px-1 text-slate-400 hover:text-slate-700"
        aria-label={`Drag to reorder ${label}`}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <button
        type="button"
        onClick={onSelect}
        className={`flex-1 rounded-lg px-2 py-1.5 text-left text-sm ${active ? "bg-[var(--theme-primary)]/10 font-semibold text-[var(--theme-dark)]" : "text-slate-700 hover:bg-slate-100"}`}
      >
        {label}
      </button>
      <button
        type="button"
        aria-pressed={visible}
        aria-label={`${visible ? "Hide" : "Show"} ${label}`}
        className="rounded px-2 text-xs text-slate-500 hover:bg-slate-100"
        onClick={onToggleVisible}
      >
        {visible ? "On" : "Off"}
      </button>
    </li>
  );
}

function shouldDeferUndo(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function EditorPage() {
  const doc = useAppStore(selectDoc);
  const apply = useAppStore((s) => s.apply);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const history = useAppStore((s) => s.history);
  const activeSection = useAppStore((s) => s.activeSection);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const zoom = useAppStore((s) => s.zoom);
  const setZoom = useAppStore((s) => s.setZoom);
  const dirty = useAppStore((s) => s.dirty);
  const lastSaved = useAppStore((s) => s.lastSaved);
  const setScreen = useAppStore((s) => s.setScreen);
  const setModal = useAppStore((s) => s.setModal);
  const exportJson = useAppStore((s) => s.exportJson);
  const saveNow = useAppStore((s) => s.saveNow);
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  const order = ensureSectionOrder(doc);
  const ir = useMemo(() => documentToIr(doc), [doc]);
  const cssVars = themeCssVars(doc.theme);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveNow().then(() => toast.success("Saved"));
        return;
      }
      if (e.key.toLowerCase() === "z") {
        if (shouldDeferUndo(e.target)) return;
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, saveNow]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    apply({ type: "reorderSections", order: arrayMove(order, oldIndex, newIndex) });
  };

  const runExport = async (kind: "pdf" | "docx") => {
    setExporting(kind);
    try {
      const { downloadPdf, downloadDocx } = await import("@resume/export");
      if (kind === "pdf") await downloadPdf(doc, `${doc.name || "resume"}.pdf`);
      else await downloadDocx(doc, `${doc.name || "resume"}.docx`);
      toast.success(kind === "pdf" ? "PDF downloaded" : "DOCX downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen" style={cssVars as CSSProperties}>
      <header
        role="banner"
        className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur"
      >
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-3">
          <button
            type="button"
            className="text-lg font-bold text-slate-900"
            onClick={() => setScreen("gallery")}
          >
            Resume Builder
          </button>
          <span className="hidden text-sm text-slate-500 sm:inline">
            {doc.name || "Untitled"} · {TEMPLATES.find((t) => t.id === doc.template)?.name}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <Button variant="ghost" aria-label="Undo" disabled={history.past.length === 0} onClick={undo}>
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" aria-label="Redo" disabled={history.future.length === 0} onClick={redo}>
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={() => setScreen("gallery")}>
              <LayoutTemplate className="h-4 w-4" /> Templates
            </Button>
            <Button variant="secondary" onClick={exportJson}>
              <FileJson className="h-4 w-4" /> JSON
            </Button>
            <Button disabled={exporting !== null} onClick={() => void runExport("pdf")}>
              <Download className="h-4 w-4" /> {exporting === "pdf" ? "…" : "PDF"}
            </Button>
            <Button variant="secondary" disabled={exporting !== null} onClick={() => void runExport("docx")}>
              <FileText className="h-4 w-4" /> {exporting === "docx" ? "…" : "DOCX"}
            </Button>
            <Button variant="ghost" onClick={() => window.print()} aria-label="Print">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => setModal("shortcuts")}>
              ?
            </Button>
          </div>
          <p className="w-full text-xs text-slate-500" aria-live="polite">
            {dirty ? "Unsaved changes…" : lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString()}` : "Ready"}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[280px_minmax(0,420px)_1fr]">
        <aside className="rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-slate-200/70" aria-label="Sections">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sections</h2>
            <div className="flex gap-1 lg:hidden">
              <Button
                variant={mobilePane === "edit" ? "primary" : "ghost"}
                className="!px-2 !py-1 text-xs"
                onClick={() => setMobilePane("edit")}
              >
                Edit
              </Button>
              <Button
                variant={mobilePane === "preview" ? "primary" : "ghost"}
                className="!px-2 !py-1 text-xs"
                onClick={() => setMobilePane("preview")}
              >
                Preview
              </Button>
            </div>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              <ul className="space-y-0.5">
                {order.map((id) => {
                  const meta = SECTION_CONFIG.find((s) => s.id === id);
                  return (
                    <SortableTocItem
                      key={id}
                      id={id}
                      label={meta?.label ?? id}
                      active={activeSection === id}
                      visible={doc.sectionVisibility?.[id] !== false}
                      onSelect={() => {
                        setActiveSection(id);
                        setMobilePane("edit");
                      }}
                      onToggleVisible={() =>
                        apply({
                          type: "setSectionVisibility",
                          id,
                          visible: doc.sectionVisibility?.[id] === false,
                        })
                      }
                    />
                  );
                })}
              </ul>
            </SortableContext>
          </DndContext>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="theme-select">
              Theme
            </label>
            <select
              id="theme-select"
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              value={doc.theme}
              onChange={(e) => apply({ type: "setTheme", theme: e.target.value })}
            >
              <option value="teal">Teal</option>
              <option value="blue">Ocean</option>
              <option value="slate">Slate</option>
              <option value="forest">Forest</option>
              <option value="copper">Copper</option>
            </select>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="template-select">
              Template
            </label>
            <select
              id="template-select"
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              value={doc.template}
              onChange={(e) =>
                apply({ type: "setTemplate", template: e.target.value as ResumeDocument["template"] })
              }
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <section
          id="main"
          className={`rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200/70 ${mobilePane === "preview" ? "hidden lg:block" : ""}`}
          aria-label="Editor"
        >
          <SectionEditor doc={doc} sectionId={activeSection} apply={apply} />
        </section>

        <section
          className={`rounded-2xl bg-slate-100/80 p-4 ${mobilePane === "edit" ? "hidden lg:block" : ""}`}
          aria-label="Preview"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</span>
            <Button variant="ghost" aria-label="Zoom out" onClick={() => setZoom(zoom - 0.05)}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs tabular-nums text-slate-600">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" aria-label="Zoom in" onClick={() => setZoom(zoom + 0.05)}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" className="!py-1 text-xs" onClick={() => setZoom(0.85)}>
              Fit
            </Button>
            <div className="ml-auto flex gap-2 lg:hidden">
              <Button disabled={exporting !== null} onClick={() => void runExport("pdf")}>
                PDF
              </Button>
              <Button variant="secondary" disabled={exporting !== null} onClick={() => void runExport("docx")}>
                DOCX
              </Button>
            </div>
          </div>
          <div className="overflow-auto rounded-xl bg-slate-200/50 p-4">
            <ResumePreview ir={ir} zoom={zoom} onSectionClick={setActiveSection} />
          </div>
        </section>
      </div>
    </div>
  );
}
