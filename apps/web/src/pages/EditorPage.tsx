import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SECTION_CONFIG, ensureSectionOrder, type ResumeDocument } from "@resume/core";
import { documentToIr, ResumePreview, TEMPLATES } from "@resume/templates";
import { Button, themeCssVars } from "@resume/ui";
import {
  Check,
  Download,
  Eye,
  EyeOff,
  FileJson,
  FileText,
  GripVertical,
  HelpCircle,
  LayoutTemplate,
  Maximize2,
  Minimize2,
  Printer,
  Redo2,
  RotateCcw,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { selectDoc, useAppStore } from "../lib/store";
import { SectionEditor } from "../components/SectionEditor";

function SortableTocItem({
  id,
  label,
  required,
  active,
  visible,
  onSelect,
  onToggleVisible,
}: {
  id: string;
  label: string;
  required: boolean;
  active: boolean;
  visible: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.58 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className={`toc-item ${active ? "is-active" : ""}`}>
      <button
        type="button"
        className="toc-grip"
        aria-label={`Drag to reorder ${label}`}
        title={`Reorder ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="toc-select"
        aria-current={active ? "page" : undefined}
      >
        <span className="toc-label">{label}</span>
        {required ? <span className="toc-required">Core</span> : null}
      </button>
      <button
        type="button"
        aria-pressed={visible}
        aria-label={`${visible ? "Hide" : "Show"} ${label}`}
        title={`${visible ? "Hide" : "Show"} ${label}`}
        className="toc-visibility"
        onClick={onToggleVisible}
      >
        {visible ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
      </button>
    </li>
  );
}

function shouldDeferUndo(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function formatSavedTime(timestamp: number | null) {
  if (!timestamp) return "Ready to edit";
  return `Saved ${new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
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
  const [contentPadding, setContentPadding] = useState(48);
  const [fontScale, setFontScale] = useState(100);
  const [previewMode, setPreviewMode] = useState<"fit" | "inspect">("fit");
  const previewHostRef = useRef<HTMLDivElement>(null);

  const order = ensureSectionOrder(doc);
  const ir = useMemo(() => documentToIr(doc), [doc]);
  const cssVars = themeCssVars(doc.theme);
  const activeMeta = SECTION_CONFIG.find((section) => section.id === activeSection);
  const visibleCount = order.filter((id) => doc.sectionVisibility?.[id] !== false).length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fitPreview = () => {
    const host = previewHostRef.current;
    if (!host) return;
    const sheetPx = (210 / 25.4) * 96;
    const available = Math.max(280, host.clientWidth - 48);
    setZoom(Math.min(1, Math.max(0.45, available / sheetPx)));
  };

  useEffect(() => {
    if (previewMode !== "fit") return;
    fitPreview();
    const onResize = () => fitPreview();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [previewMode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;
      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveNow().then(() => toast.success("Resume saved"));
        return;
      }
      if (event.key.toLowerCase() === "z") {
        if (shouldDeferUndo(event.target)) return;
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redo, saveNow, undo]);

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
      const filename = (doc.name || "resume").trim().replace(/\s+/g, "_");
      if (kind === "pdf") {
        const sheet =
          previewHostRef.current?.querySelector<HTMLElement>(".sheet") ?? document.querySelector<HTMLElement>(".sheet");
        await downloadPdf(doc, `${filename}.pdf`, sheet);
      } else {
        await downloadDocx(doc, `${filename}.docx`);
      }
      toast.success(kind === "pdf" ? "PDF downloaded" : "DOCX downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Export failed. Check the resume content and try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="workspace-page" style={cssVars as CSSProperties}>
      <a href="#main" className="skip-to-content">
        Skip to editor
      </a>

      <header className="workspace-header" role="banner">
        <div className="workspace-header-inner">
          <button type="button" className="brand-lockup" onClick={() => setScreen("gallery")}>
            <span className="brand-mark" aria-hidden="true">
              <FileText className="h-4 w-4" />
            </span>
            <span className="brand-copy">
              <span className="brand-title">Resume Builder</span>
              <span className="brand-context">
                {doc.name || "Untitled resume"} <span aria-hidden="true">·</span>{" "}
                {TEMPLATES.find((template) => template.id === doc.template)?.name}
              </span>
            </span>
          </button>

          <div className="workspace-status" aria-live="polite">
            <span className={`status-dot ${dirty ? "is-dirty" : ""}`} aria-hidden="true" />
            {dirty ? "Unsaved changes" : formatSavedTime(lastSaved)}
          </div>

          <div className="workspace-actions">
            <Button
              variant="ghost"
              aria-label="Undo"
              title="Undo"
              disabled={history.past.length === 0}
              onClick={undo}
            >
              <Undo2 className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              aria-label="Redo"
              title="Redo"
              disabled={history.future.length === 0}
              onClick={redo}
            >
              <Redo2 className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="secondary" className="action-secondary" onClick={() => setScreen("gallery")}>
              <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
              <span className="action-label">Templates</span>
            </Button>
            <Button variant="secondary" className="action-secondary" onClick={exportJson}>
              <FileJson className="h-4 w-4" aria-hidden="true" />
              <span className="action-label">JSON</span>
            </Button>
            <Button
              className="action-export"
              disabled={exporting !== null}
              onClick={() => void runExport("pdf")}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span className="action-label">{exporting === "pdf" ? "Exporting" : "Export PDF"}</span>
            </Button>
            <Button
              variant="ghost"
              className="action-secondary"
              aria-label="Print resume"
              title="Print resume"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
              onClick={() => setModal("shortcuts")}
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <div className="workspace-body">
        <nav className="mobile-pane-switcher" aria-label="Workspace view">
          <button
            type="button"
            className={mobilePane === "edit" ? "is-active" : ""}
            aria-current={mobilePane === "edit" ? "page" : undefined}
            onClick={() => setMobilePane("edit")}
          >
            Edit content
          </button>
          <button
            type="button"
            className={mobilePane === "preview" ? "is-active" : ""}
            aria-current={mobilePane === "preview" ? "page" : undefined}
            onClick={() => setMobilePane("preview")}
          >
            Preview resume
          </button>
        </nav>

        <div className="workspace-layout">
          <aside className={`workspace-sidebar ${mobilePane === "preview" ? "is-mobile-hidden" : ""}`} aria-label="Resume setup">
            <div className="workspace-sidebar-head">
              <div>
                <p className="eyebrow">Build</p>
                <h2 className="panel-title">Sections</h2>
              </div>
              <span className="section-count" aria-label={`${visibleCount} of ${order.length} sections visible`}>
                {visibleCount}/{order.length}
              </span>
            </div>
            <p className="panel-hint">Choose a section to edit. Drag to change its order, or hide it from the resume.</p>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={order} strategy={verticalListSortingStrategy}>
                <ul className="toc-list" aria-label="Resume sections">
                  {order.map((id) => {
                    const meta = SECTION_CONFIG.find((section) => section.id === id);
                    const isVisible = doc.sectionVisibility?.[id] !== false;
                    return (
                      <SortableTocItem
                        key={id}
                        id={id}
                        label={meta?.label ?? id}
                        required={Boolean(meta?.required)}
                        active={activeSection === id}
                        visible={isVisible}
                        onSelect={() => {
                          setActiveSection(id);
                          setMobilePane("edit");
                        }}
                        onToggleVisible={() =>
                          apply({
                            type: "setSectionVisibility",
                            id,
                            visible: !isVisible,
                          })
                        }
                      />
                    );
                  })}
                </ul>
              </SortableContext>
            </DndContext>

            <div className="sidebar-settings">
              <span className="settings-label">Appearance</span>
              <label className="field-stack" htmlFor="theme-select">
                <span className="settings-label">Accent</span>
                <select
                  id="theme-select"
                  className="select-control w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  value={doc.theme}
                  onChange={(event) => apply({ type: "setTheme", theme: event.target.value })}
                >
                  <option value="teal">Teal</option>
                  <option value="blue">Professional Blue</option>
                  <option value="purple">Creative Purple</option>
                  <option value="green">Nature Green</option>
                  <option value="slate">Classic Gray</option>
                  <option value="black">Executive Black</option>
                  <option value="forest">Forest</option>
                  <option value="copper">Copper</option>
                </select>
              </label>
              <label className="field-stack" htmlFor="template-select">
                <span className="settings-label">Template</span>
                <select
                  id="template-select"
                  className="select-control w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  value={doc.template}
                  onChange={(event) =>
                    apply({ type: "setTemplate", template: event.target.value as ResumeDocument["template"] })
                  }
                >
                  {TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </aside>

          <section
            id="main"
            className={`workspace-editor ${mobilePane === "preview" ? "is-mobile-hidden" : ""}`}
            aria-label="Resume editor"
          >
            <div className="editor-panel-head">
              <div>
                <p className="eyebrow">Edit content</p>
                <h2 className="panel-title">{activeMeta?.label ?? "Section"}</h2>
              </div>
              <span className="section-state">
                {doc.sectionVisibility?.[activeSection] === false ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Hidden
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" /> Visible
                  </>
                )}
              </span>
            </div>
            <div className="editor-scroll">
              <SectionEditor doc={doc} sectionId={activeSection} apply={apply} />
              <div className="mobile-action-row">
                <Button variant="secondary" disabled={exporting !== null} onClick={() => void runExport("docx")}>
                  <FileText className="h-4 w-4" aria-hidden="true" /> DOCX
                </Button>
                <Button disabled={exporting !== null} onClick={() => void runExport("pdf")}>
                  <Download className="h-4 w-4" aria-hidden="true" /> PDF
                </Button>
              </div>
            </div>
          </section>

          <section
            className={`workspace-preview ${mobilePane === "edit" ? "is-mobile-hidden" : ""}`}
            aria-label="Resume preview"
          >
            <div className="preview-panel-head">
              <div>
                <p className="eyebrow">Live canvas</p>
                <h2 className="panel-title">Preview resume</h2>
              </div>
              <span className="section-state">A4 · {Math.round(zoom * 100)}%</span>
            </div>
            <div className="preview-toolbar">
              <Button variant="ghost" aria-label="Zoom out" title="Zoom out" onClick={() => { setPreviewMode("inspect"); setZoom(zoom - 0.05); }}>
                <ZoomOut className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span className="preview-zoom">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" aria-label="Zoom in" title="Zoom in" onClick={() => { setPreviewMode("inspect"); setZoom(zoom + 0.05); }}>
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant={previewMode === "fit" ? "primary" : "secondary"}
                className="!min-h-9 !rounded-lg !px-2.5 !py-1.5 text-xs"
                onClick={() => {
                  setPreviewMode("fit");
                  requestAnimationFrame(fitPreview);
                }}
              >
                <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" /> Fit width
              </Button>
              <Button
                variant={previewMode === "inspect" ? "primary" : "secondary"}
                className="!min-h-9 !rounded-lg !px-2.5 !py-1.5 text-xs"
                onClick={() => {
                  setPreviewMode("inspect");
                  setZoom(1);
                }}
              >
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" /> Full size
              </Button>
              <Button
                variant="ghost"
                className="!min-h-9 !rounded-lg !px-2.5 !py-1.5 text-xs"
                onClick={() => {
                  setContentPadding(48);
                  setFontScale(100);
                  setPreviewMode("fit");
                  requestAnimationFrame(fitPreview);
                  toast.success("Preview layout reset");
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
              </Button>
              <span className="preview-toolbar-divider" aria-hidden="true" />
              <label className="range-control" htmlFor="content-padding">
                Pad
                <input
                  id="content-padding"
                  type="range"
                  min={24}
                  max={64}
                  step={4}
                  value={contentPadding}
                  onChange={(event) => setContentPadding(Number(event.target.value))}
                />
                <span className="range-value">{contentPadding}</span>
              </label>
              <label className="range-control" htmlFor="font-scale">
                Font
                <input
                  id="font-scale"
                  type="range"
                  min={85}
                  max={115}
                  step={5}
                  value={fontScale}
                  onChange={(event) => setFontScale(Number(event.target.value))}
                />
                <span className="range-value">{fontScale}%</span>
              </label>
            </div>
            <div ref={previewHostRef} className={`preview-stage ${previewMode === "inspect" ? "is-inspecting" : ""}`}>
              <ResumePreview
                doc={doc}
                ir={ir}
                zoom={zoom}
                contentPadding={contentPadding}
                fontScale={fontScale}
                onSectionClick={(sectionId) => {
                  setActiveSection(sectionId);
                  setMobilePane("edit");
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
