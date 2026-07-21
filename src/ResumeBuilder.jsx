import { useMemo, useRef, useEffect, useState, lazy, Suspense } from "react";
import { Upload, Download, Printer, Save, Undo2, Redo2, FileText, Keyboard, Eye, PenLine, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import useUndo from "use-undo";

// Components
const EditorPanelWithDnd = lazy(() => import("./components/Editor/EditorPanelWithDnd"));
import Aside from "./components/Preview/Aside";
import Main from "./components/Preview/Main";
import SectionVisibility from "./components/Controls/SectionVisibility";
import ThemePicker from "./components/Controls/ThemePicker";
import OnboardingModal from "./components/OnboardingModal";
import { AboutModal, PrivacyModal, ShortcutsModal } from "./components/ProductModals.jsx";

// Utils
import { saveToLocalStorage, loadFromLocalStorage, cleanupOldDrafts } from "./utils/localStorage";
import { safeHydrate } from "./utils/dataHelpers";
import { validateImportedResume } from "./utils/validation";
import { validateResumeData } from "./utils/schema";
import { shouldDeferGlobalUndoRedo } from "./utils/appKeyboard";

// Constants
import { blankState } from "./constants/defaultData";
import { sampleFromYourPDF } from "./constants/sampleData";
import { getDefaultVisibility, SECTION_CONFIG } from "./constants/sectionConfig";
import { themes, defaultTheme } from "./constants/themes";
import { PRODUCT_NAME, APP_VERSION } from "./constants/product";
import { PAPER_PRESETS, getPaperPreset } from "./constants/paper.js";
import { useResumeExport } from "./hooks/useResumeExport.js";

export default function ResumeBuilder() {
  // Initialize state with undo/redo support
  const initialState = useMemo(() => {
    const saved = loadFromLocalStorage('resume_draft');
    if (saved && saved._savedAt && Date.now() - saved._savedAt < 7 * 24 * 60 * 60 * 1000) {
      delete saved._savedAt;
      return safeHydrate(saved);
    }
    return blankState();
  }, []);
  
  const [state, { set: setState, undo, redo, canUndo, canRedo }] = useUndo(initialState);
  
  // UI state (not undoable)
  const fileInputRef = useRef(null);
  const sheetRef = useRef(null);
  const previewStageRef = useRef(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const [paperSize, setPaperSize] = useState('a4');
  const [contentPadding, setContentPadding] = useState(48);
  const [fontSize, setFontSize] = useState(100);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'preview' for mobile
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [productDialog, setProductDialog] = useState(null);
  const [showPageGuide, setShowPageGuide] = useState(true);
  const [pageEstimate, setPageEstimate] = useState(1);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewStageHeight, setPreviewStageHeight] = useState(null);
  const [previewZoom, setPreviewZoom] = useState('fit');

  const currentPaper = useMemo(() => getPaperPreset(paperSize), [paperSize]);

  const { exporting, handlePrintPDF, handleExportDocx } = useResumeExport({
    statePresent: state.present,
    paperSize,
    fontSize,
    contentPadding,
    sheetRef,
  });
  const relativeTimeFormatter = useMemo(() => new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }), []);
  const relativeLastSaved = useMemo(() => {
    if (!lastSaved) return null;
    const diff = lastSaved - nowTick;
    const absDiff = Math.abs(diff);
    if (absDiff < 15 * 1000) return "just now";
    if (absDiff < 60 * 60 * 1000) {
      return relativeTimeFormatter.format(Math.round(diff / (60 * 1000)), "minute");
    }
    if (absDiff < 24 * 60 * 60 * 1000) {
      return relativeTimeFormatter.format(Math.round(diff / (60 * 60 * 1000)), "hour");
    }
    return relativeTimeFormatter.format(Math.round(diff / (24 * 60 * 60 * 1000)), "day");
  }, [lastSaved, nowTick, relativeTimeFormatter]);
  const validationMessages = useMemo(() => {
    const result = validateResumeData(state.present);
    if (result.success) return {};
    return result.error.issues.reduce((acc, issue) => {
      const key = issue.path.join('.');
      if (!acc[key]) acc[key] = issue.message;
      return acc;
    }, {});
  }, [state.present]);

  // Auto-save to localStorage
  useEffect(() => {
    if (exporting) return; // pause autosave while exporting
    setIsDirty(true);
    const timer = setTimeout(() => {
        const toSave = { ...state.present, _savedAt: Date.now() };
      if (saveToLocalStorage('resume_draft', toSave)) {
          setLastSaved(Date.now());
          setIsDirty(false);
          cleanupOldDrafts();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [state.present, exporting]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem('resume_onboarding_complete');
    if (!seen) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mmToPx = 3.7795275591;
    const updatePageEstimate = () => {
      const mainEl = sheetRef.current?.querySelector('main');
      if (!mainEl) return;
      const totalHeight = mainEl.scrollHeight || 0;
      const estimate = Math.max(1, Math.ceil(totalHeight / (currentPaper.heightMm * mmToPx)));
      setPageEstimate(estimate);
    };
    updatePageEstimate();
    const ResizeObserverCtor = window.ResizeObserver;
    if (typeof ResizeObserverCtor === "undefined") return;
    const mainEl = sheetRef.current?.querySelector('main');
    if (!mainEl) return;
    const observer = new ResizeObserverCtor(updatePageEstimate);
    observer.observe(mainEl);
    return () => observer.disconnect();
  }, [state.present, currentPaper.heightMm, fontSize, contentPadding, viewMode]);

  useEffect(() => {
    const stage = previewStageRef.current;
    const sheet = sheetRef.current;
    if (!stage || !sheet) return;

    const updatePreviewScale = () => {
      const availableWidth = Math.max(260, stage.clientWidth - 24);
      const sheetWidth = sheet.offsetWidth || 794;
      const nextScale = previewZoom === 'full' ? 1 : Math.min(1, availableWidth / sheetWidth);
      setPreviewScale(nextScale);
      setPreviewStageHeight((sheet.offsetHeight || 1122) * nextScale + 42);
    };

    updatePreviewScale();
    const ResizeObserverCtor = window.ResizeObserver;
    if (typeof ResizeObserverCtor === "undefined") return;
    const observer = new ResizeObserverCtor(updatePreviewScale);
    observer.observe(stage);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [currentPaper.widthMm, currentPaper.heightMm, fontSize, contentPadding, viewMode, previewZoom]);

  // Keyboard shortcuts (defer when typing in native editable controls)
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (shouldDeferGlobalUndoRedo(e.target)) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
          toast.info("Undo");
        }
      }
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        if (canRedo) {
          redo();
          toast.info("Redo");
        }
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [undo, redo, canUndo, canRedo]);

  // Action functions
  function update(path, value) {
    const next = structuredClone(state.present);
    const parts = path.split(".");
    let obj = next;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts.at(-1)] = value;
    setState(next);
  }

  function addRow(key, value) {
    const next = structuredClone(state.present);
    next[key].push(value);
    setState(next);
  }

  function removeRow(key, idx) {
    const next = structuredClone(state.present);
    next[key].splice(idx, 1);
    setState(next);
  }

  function addJobSection(jdx) {
    const next = structuredClone(state.present);
    next.jobs[jdx].sections.push({ title: "", bullets: [""] });
    setState(next);
  }

  function removeJob(idx) {
    const next = structuredClone(state.present);
    next.jobs.splice(idx, 1);
    setState(next);
  }

  function updateJob(jdx, field, value) {
    const next = structuredClone(state.present);
    next.jobs[jdx][field] = value;
    setState(next);
  }

  function removeJobSection(jdx, sidx) {
    const next = structuredClone(state.present);
    next.jobs[jdx].sections.splice(sidx, 1);
    setState(next);
  }

  function updateJobSection(jdx, sidx, field, value) {
    const next = structuredClone(state.present);
    next.jobs[jdx].sections[sidx][field] = value;
    setState(next);
  }

  function addBullet(jdx, sidx) {
    const next = structuredClone(state.present);
    next.jobs[jdx].sections[sidx].bullets.push("");
    setState(next);
  }

  function updateBullet(jdx, sidx, bidx, value) {
    const next = structuredClone(state.present);
    next.jobs[jdx].sections[sidx].bullets[bidx] = value;
    setState(next);
  }

  function removeBullet(jdx, sidx, bidx) {
    const next = structuredClone(state.present);
    next.jobs[jdx].sections[sidx].bullets.splice(bidx, 1);
    setState(next);
  }

  function updatePhoto(field, value){
    const next = structuredClone(state.present);
    next.photo = { ...(next.photo || {}), [field]: value };
    setState(next);
  }

  function loadSample() { 
    setState(sampleFromYourPDF());
    toast.success("Sample resume loaded.");
  }

  const dismissOnboarding = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem('resume_onboarding_complete', '1');
    }
    setShowOnboarding(false);
  };

  const handleOnboardingLoad = () => {
    loadSample();
    dismissOnboarding();
  };

  function exportJSON() {
    const blob = new Blob([JSON.stringify(state.present, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "resume.json"; a.click(); URL.revokeObjectURL(url);
    toast.success("Resume exported as JSON!");
  }

  function importJSONFile(e) {
    const file = e.target.files?.[0]; 
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { 
        const json = JSON.parse(reader.result);
        const validated = validateImportedResume(json);
        if (!validated) return;
        setState(safeHydrate(validated));
        toast.success("Resume imported successfully!");
      }
      catch (err) { 
        toast.error("Invalid JSON: " + err.message);
      }
      finally { e.target.value = ""; }
    };
    reader.readAsText(file);
  }

  // Section chrome lives in undoable state.present (theme, order, visibility)
  const sectionVisibility = state.present.sectionVisibility || getDefaultVisibility();
  const setSectionVisibility = (nextVis) => {
    const next = structuredClone(state.present);
    const base = next.sectionVisibility || getDefaultVisibility();
    next.sectionVisibility = typeof nextVis === "function" ? nextVis(base) : nextVis;
    setState(next);
  };

  const sectionOrder = state.present.sectionOrder || SECTION_CONFIG.map((s) => s.id);
  const setSectionOrder = (nextOrder) => {
    const next = structuredClone(state.present);
    const base = next.sectionOrder || SECTION_CONFIG.map((s) => s.id);
    next.sectionOrder = typeof nextOrder === "function" ? nextOrder(base) : nextOrder;
    setState(next);
  };

  const theme = state.present.theme || defaultTheme;
  const setTheme = (nextTheme) => {
    const next = structuredClone(state.present);
    next.theme = nextTheme;
    setState(next);
  };

  // Group all actions for passing to children
  const actions = {
    update,
    updatePhoto,
    addRow,
    removeRow,
    setState,
    updateJob,
    removeJob,
    addJobSection,
    removeJobSection,
    updateJobSection,
    addBullet,
    updateBullet,
    removeBullet
  };

  const currentTheme = themes[theme] || themes[defaultTheme];

  return (
    <div className="rb-app flex min-h-screen flex-col" style={{
      '--theme-primary': currentTheme.primary,
      '--theme-dark': currentTheme.dark,
      '--theme-light': currentTheme.light,
      '--theme-gradient-from': currentTheme.gradient[0],
      '--theme-gradient-to': currentTheme.gradient[1],
    }}>
      <OnboardingModal open={showOnboarding} onClose={dismissOnboarding} onLoadSample={handleOnboardingLoad} />

      {/* Print styles — @page size follows selected paper (browser support varies). */}
      <style>{`
        @page { size: ${currentPaper.pageCss}; margin: 12mm }
        @media print {
          .product-chrome, .rb-view-tabs, .rb-preview-header, .rb-settings, .editor { display: none !important; }
          .rb-preview-panel { display: block !important; min-height: 0 !important; border: 0 !important; box-shadow: none !important; }
          .rb-preview-stage { min-height: 0 !important; padding: 0 !important; overflow: visible !important; background: transparent !important; }
          .rb-preview-sheet-wrap { display: block !important; }
          .sheet, .rb-preview-sheet { transform: none !important; box-shadow: none !important; border: none !important; }
          body { background: transparent !important; }
          .page-break-indicator { display: none !important; }
          .sheet main > section { break-inside: avoid; page-break-inside: avoid; }
        }
        .overflow-wrap-anywhere { overflow-wrap: anywhere; word-break: break-word; hyphens: auto; }
        .sheet * { max-width: 100%; }
      `}</style>

      <a href="#main-application" className="skip-to-content">Skip to main content</a>

      <header className="product-chrome rb-app-header sticky top-0 z-40 border-b">
        <div className="mx-auto flex w-full max-w-[1520px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rb-brand-mark" aria-hidden="true"><span className="text-[11px] font-black">R</span></span>
            <div className="min-w-0">
              <h1 className="truncate text-[0.95rem] font-extrabold tracking-tight text-slate-900">{PRODUCT_NAME}</h1>
              <p className="truncate text-[0.7rem] text-slate-500">Edit once. Export with confidence.</p>
            </div>
          </div>
          <nav className="flex shrink-0 items-center gap-1" aria-label="Product help">
            <span className="mr-2 hidden items-center gap-1.5 text-[0.68rem] font-semibold text-slate-500 sm:inline-flex">
              <CheckCircle2 size={13} className="text-emerald-600" aria-hidden="true" /> Private by default
            </span>
            <button type="button" onClick={() => setProductDialog("about")} className="rb-help-link px-2.5">About</button>
            <button type="button" onClick={() => setProductDialog("privacy")} className="rb-help-link px-2.5">Privacy</button>
            <button type="button" onClick={() => setProductDialog("shortcuts")} className="rb-help-link inline-flex items-center gap-1 px-2.5">
              <Keyboard size={13} aria-hidden="true" /> <span className="hidden sm:inline">Shortcuts</span><span className="sm:hidden">Keys</span>
            </button>
          </nav>
        </div>
      </header>

      <main id="main-application" className="mx-auto w-full max-w-[1520px] flex-1 px-3 py-4 sm:px-6 sm:py-5">
        <div className="rb-view-tabs" role="tablist" aria-label="Resume workspace view">
          <button type="button" role="tab" aria-selected={viewMode === 'editor'} aria-pressed={viewMode === 'editor'} className={`rb-view-tab ${viewMode === 'editor' ? 'is-active' : ''}`} onClick={() => setViewMode('editor')}>
            <PenLine size={15} className="mr-1.5 inline" aria-hidden="true" /> Editor
          </button>
          <button type="button" role="tab" aria-selected={viewMode === 'preview'} aria-pressed={viewMode === 'preview'} className={`rb-view-tab ${viewMode === 'preview' ? 'is-active' : ''}`} onClick={() => setViewMode('preview')}>
            <Eye size={15} className="mr-1.5 inline" aria-hidden="true" /> Preview
          </button>
        </div>

        <div className="rb-workspace">
          <section className={`editor rb-panel rb-editor-panel ${viewMode === 'preview' ? 'rb-panel-mobile-hidden' : ''}`} aria-labelledby="editor-title">
            <div className="rb-editor-toolbar">
              <div className="rb-toolbar-meta">
                <div className="min-w-0">
                  <h2 id="editor-title" className="text-[0.92rem] font-extrabold tracking-tight text-slate-900">Edit your resume</h2>
                  <p className="mt-1 truncate text-[0.7rem] text-slate-500">
                    {state.present.name ? `Shaping ${state.present.name}` : "Start with the essentials, then add detail."}
                  </p>
                  <div className="rb-status mt-2" aria-live="polite">
                    <span className={`rb-status-dot ${isDirty ? 'is-dirty' : ''}`} aria-hidden="true" />
                    <Save size={12} aria-hidden="true" />
                    {isDirty && !exporting && <span>Saving changes…</span>}
                    {exporting && <span>Paused while exporting…</span>}
                    {!isDirty && !exporting && lastSaved && <span>Saved {relativeLastSaved}</span>}
                    {!isDirty && !exporting && !lastSaved && <span>Saved locally</span>}
                  </div>
                </div>
                <div className="rb-history" aria-label="Edit history">
                  <button type="button" className="rb-icon-button" disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)" aria-label="Undo résumé change"><Undo2 size={16} aria-hidden="true" /></button>
                  <button type="button" className="rb-icon-button" disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Y)" aria-label="Redo résumé change"><Redo2 size={16} aria-hidden="true" /></button>
                </div>
              </div>
              <div className="rb-action-grid">
                <button type="button" className="rb-button rb-button-wide" onClick={loadSample}><FileText size={15} aria-hidden="true" /> Load sample resume</button>
                <button type="button" className="rb-button" onClick={exportJSON}><Download size={15} aria-hidden="true" /> Export JSON</button>
                <label className="rb-button cursor-pointer" aria-label="Import resume JSON">
                  <Upload size={15} aria-hidden="true" /> Import JSON
                  <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={importJSONFile} />
                </label>
                <button type="button" disabled={!!exporting} className="rb-button rb-button-primary" onClick={handlePrintPDF}><Printer size={15} aria-hidden="true" />{exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}</button>
                <button type="button" disabled={!!exporting} className="rb-button rb-button-secondary" onClick={handleExportDocx}><FileText size={15} aria-hidden="true" />{exporting === 'docx' ? 'Exporting…' : 'Export DOCX'}</button>
              </div>
            </div>

            <div className="rb-editor-body">
              <SectionVisibility state={state.present} sectionVisibility={sectionVisibility} setSectionVisibility={setSectionVisibility} sectionOrder={sectionOrder} setSectionOrder={setSectionOrder} />
              <ThemePicker theme={theme} setTheme={setTheme} />
              <Suspense fallback={<div className="p-5 text-sm text-slate-600" role="status" aria-live="polite">Loading editor…</div>}>
                <EditorPanelWithDnd state={state.present} actions={actions} sectionVisibility={sectionVisibility} sectionOrder={sectionOrder} setSectionOrder={setSectionOrder} validationMessages={validationMessages} />
              </Suspense>
            </div>
          </section>

          <section className={`rb-panel rb-preview-panel ${viewMode === 'editor' ? 'rb-panel-mobile-hidden' : ''}`} aria-labelledby="preview-title">
            <div className="rb-preview-header">
              <div className="rb-preview-title-row">
                <div>
                  <h2 id="preview-title" className="text-[0.92rem] font-extrabold tracking-tight text-slate-900">Live preview</h2>
                  <p className="rb-preview-subtitle mt-1">A faithful view of the document you will export.</p>
                </div>
                <span className="rb-preview-stat"><CheckCircle2 size={13} aria-hidden="true" /> {pageEstimate} page{pageEstimate === 1 ? '' : 's'}</span>
              </div>

              <div className="rb-preview-controls">
                <div className="rb-control">
                  <label className="rb-control-label" htmlFor="paper-size">Paper size</label>
                  <select id="paper-size" value={paperSize} onChange={(e) => { const v = e.target.value; setPaperSize(v); toast.success(`Preview size changed to ${getPaperPreset(v).name}`); }} className="px-2.5">
                    {Object.entries(PAPER_PRESETS).map(([id, p]) => <option key={id} value={id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="rb-control">
                  <div className="rb-control-inline"><label className="rb-control-label" htmlFor="content-padding">Padding</label><span className="rb-control-value">{contentPadding}px</span></div>
                  <input id="content-padding" type="range" min="24" max="72" step="4" value={contentPadding} onChange={(e) => setContentPadding(Number(e.target.value))} aria-valuetext={`${contentPadding} pixels`} />
                </div>

                <div className="rb-control">
                  <div className="rb-control-inline"><label className="rb-control-label" htmlFor="font-scale">Font scale</label><span className="rb-control-value">{fontSize}%</span></div>
                  <input id="font-scale" type="range" min="75" max="125" step="5" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
                  <div className="rb-presets">
                    {[85, 100, 115].map((preset) => <button key={preset} type="button" onClick={() => setFontSize(preset)} className={`rb-preset ${fontSize === preset ? 'is-selected' : ''}`} aria-label={`Set font scale to ${preset}%`}>{preset}%</button>)}
                  </div>
                </div>
              </div>

              <div className="rb-preview-actions">
                <button type="button" className="rb-button" onClick={() => { setContentPadding(48); setFontSize(100); toast.success("Layout reset to defaults"); }}><RotateCcw size={14} aria-hidden="true" /> Reset layout</button>
                <button type="button" className="rb-button" onClick={() => setShowPageGuide((prev) => !prev)}>{showPageGuide ? "Hide page guide" : "Show page guide"}</button>
                <button type="button" className="rb-button" onClick={() => setPreviewZoom((current) => current === 'fit' ? 'full' : 'fit')}>{previewZoom === 'fit' ? "Full size" : "Fit width"}</button>
              </div>
            </div>

            <div ref={previewStageRef} className="rb-preview-stage" style={{ minHeight: previewStageHeight ? `${previewStageHeight}px` : undefined, overflowX: previewZoom === 'full' ? 'auto' : 'hidden' }}>
              <div className={`rb-preview-sheet-wrap ${previewZoom === 'full' ? 'is-full-size' : ''}`}>
                <div ref={sheetRef} className="sheet rb-preview-sheet relative border" style={{ width: `${currentPaper.widthMm}mm`, minHeight: `${currentPaper.heightMm}mm`, background: "white", fontSize: `${fontSize}%`, transform: `scale(${previewScale})` }}>
                  {showPageGuide && <div className="page-break-indicator pointer-events-none absolute left-0 right-0 z-10 border-b-2 border-dashed border-red-400" style={{ top: `${currentPaper.heightMm}mm` }}><div className="absolute -top-3 right-2 rounded bg-red-500/95 px-2 py-0.5 text-[10px] font-medium text-white shadow-md">First page ends here</div></div>}
                  <div className="grid grid-cols-[30%_1fr]" style={{ minHeight: `${currentPaper.heightMm}mm` }}>
                    <aside className="border-r" style={{ padding: `${contentPadding}px ${contentPadding * 0.667}px`, background: `linear-gradient(180deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%)` }}><Aside state={state.present} sectionVisibility={sectionVisibility} /></aside>
                    <main style={{ padding: `${contentPadding}px` }}><Main state={state.present} sectionVisibility={sectionVisibility} sectionOrder={sectionOrder} /></main>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="product-chrome border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
        <p>{PRODUCT_NAME} · v{APP_VERSION} · Your content stays in this browser · <button type="button" className="font-medium text-teal-700 underline decoration-teal-200 underline-offset-2 hover:text-teal-800" onClick={() => setProductDialog("privacy")}>Privacy</button></p>
      </footer>

      {productDialog === "about" && <AboutModal onClose={() => setProductDialog(null)} />}
      {productDialog === "privacy" && <PrivacyModal onClose={() => setProductDialog(null)} />}
      {productDialog === "shortcuts" && <ShortcutsModal onClose={() => setProductDialog(null)} />}
    </div>
  );
}
