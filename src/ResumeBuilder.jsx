import { useMemo, useRef, useEffect, useState, lazy, Suspense } from "react";
import { Upload, Download, Printer, Save, Undo2, Redo2, FileText, Keyboard } from "lucide-react";
import { toast } from "sonner";
import useUndo from "use-undo";

// Components
const EditorPanelWithDnd = lazy(() => import("./components/Editor/EditorPanelWithDnd"));
import Aside from "./components/Preview/Aside";
import Main from "./components/Preview/Main";
import SectionVisibility from "./components/Controls/SectionVisibility";
import SectionOrderManager from "./components/Controls/SectionOrderManager";
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
import { PRODUCT_NAME, PRODUCT_TAGLINE, APP_VERSION } from "./constants/product";
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
    <div className="flex min-h-screen flex-col bg-slate-50" style={{
      '--theme-primary': currentTheme.primary,
      '--theme-dark': currentTheme.dark,
      '--theme-light': currentTheme.light,
      '--theme-gradient-from': currentTheme.gradient[0],
      '--theme-gradient-to': currentTheme.gradient[1],
    }}>
      <OnboardingModal
        open={showOnboarding}
        onClose={dismissOnboarding}
        onLoadSample={handleOnboardingLoad}
      />
      {/* Print styles — @page size follows selected paper (browser support varies) */}
      <style>{`
        @page { size: ${currentPaper.pageCss}; margin: 12mm }
        @media print { 
          .product-chrome { display: none !important; }
          .editor { display: none !important; }
          .sheet { box-shadow: none !important; border: none !important; }
          body { background: transparent !important; }
          .page-break-indicator { display: none !important; }
          .sheet main > section { break-inside: avoid; page-break-inside: avoid; }
        }
        .overflow-wrap-anywhere {
          overflow-wrap: anywhere;
          word-break: break-word;
          hyphens: auto;
        }
        .sheet * {
          max-width: 100%;
        }
      `}</style>

      <a href="#main-application" className="skip-to-content">
        Skip to main content
      </a>

      <header className="product-chrome sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900">{PRODUCT_NAME}</h1>
            <p className="text-xs text-slate-500">{PRODUCT_TAGLINE}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-1 text-xs" aria-label="Product help">
            <button
              type="button"
              onClick={() => setProductDialog("about")}
              className="rounded-lg px-2.5 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => setProductDialog("privacy")}
              className="rounded-lg px-2.5 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => setProductDialog("shortcuts")}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Keyboard className="inline" size={14} aria-hidden />
              Shortcuts
            </button>
          </nav>
        </div>
      </header>

      <div id="main-application" className="mx-auto w-full max-w-[1480px] flex-1 p-4">
        {/* Mobile view toggle */}
        <div className="lg:hidden mb-3 flex items-center gap-2">
          <button
            className={`px-3 py-1.5 text-sm rounded border ${viewMode==='editor' ? 'bg-teal-50 border-teal-300 text-teal-700' : 'hover:bg-slate-50'}`}
            onClick={() => setViewMode('editor')}
          >
            Editor
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded border ${viewMode==='preview' ? 'bg-teal-50 border-teal-300 text-teal-700' : 'hover:bg-slate-50'}`}
            onClick={() => setViewMode('preview')}
          >
            Preview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4">
        {/* Editor */}
        <div className={`editor rounded-2xl border bg-white shadow-sm overflow-hidden ${viewMode==='preview' ? 'hidden' : ''} lg:block`}>
          <div className="flex items-center justify-between border-b p-3">
            <div>
              <h2 className="text-sm font-bold tracking-wide">{PRODUCT_NAME}</h2>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <span className={`inline-flex h-2 w-2 rounded-full ${isDirty ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} aria-hidden />
                <Save size={12} />
                {isDirty && !exporting && <span>Saving changes…</span>}
                {exporting && <span>Paused while exporting…</span>}
                {!isDirty && !exporting && lastSaved && <span>Saved {relativeLastSaved}</span>}
                {!isDirty && !exporting && !lastSaved && <span>Not saved yet</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!canUndo}
                className={`px-3 py-2 rounded-xl border text-sm ${!canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                onClick={undo}
                title="Undo (Ctrl+Z)"
                aria-label="Undo résumé change"
              >
                <Undo2 className="inline -mt-1" size={16} aria-hidden />
              </button>
              <button
                type="button"
                disabled={!canRedo}
                className={`px-3 py-2 rounded-xl border text-sm ${!canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                onClick={redo}
                title="Redo (Ctrl+Y)"
                aria-label="Redo résumé change"
              >
                <Redo2 className="inline -mt-1" size={16} aria-hidden />
              </button>
              <div className="border-l mx-1" />
              <button 
                className="px-3 py-2 rounded-xl border text-sm hover:bg-slate-50 transition-colors active:scale-95" 
                onClick={loadSample}
              >
                Load sample resume
              </button>
              <button 
                className="px-3 py-2 rounded-xl border text-sm hover:bg-slate-50 transition-colors active:scale-95" 
                onClick={exportJSON}
              >
                <Download className="inline -mt-1 mr-1" size={16}/>Export JSON
              </button>
              <label className="px-3 py-2 rounded-xl border text-sm cursor-pointer hover:bg-slate-50 transition-colors active:scale-95">
                <Upload className="inline -mt-1 mr-1" size={16}/>Import JSON
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={importJSONFile} />
              </label>
              <button 
                disabled={!!exporting} 
                className={`px-3 py-2 rounded-xl text-sm transition-all ${exporting ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-teal-500 text-white hover:bg-teal-600 active:scale-95'}`} 
                onClick={handlePrintPDF}
              >
                <Printer className="inline -mt-1 mr-1" size={16}/>{exporting === 'pdf' ? 'Exporting…' : 'Export to PDF'}
              </button>
              <button
                disabled={!!exporting}
                className={`px-3 py-2 rounded-xl text-sm transition-all ${exporting ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'}`}
                onClick={handleExportDocx}
              >
                <FileText className="inline -mt-1 mr-1" size={16}/>{exporting === 'docx' ? 'Exporting…' : 'Export to DOCX'}
              </button>
            </div>
          </div>

          <SectionVisibility 
            state={state.present} 
            sectionVisibility={sectionVisibility} 
            setSectionVisibility={setSectionVisibility} 
            sectionOrder={sectionOrder}
            setSectionOrder={setSectionOrder}
          />

          <SectionOrderManager
            sectionOrder={sectionOrder}
            setSectionOrder={setSectionOrder}
          />

          <ThemePicker
            theme={theme}
            setTheme={setTheme}
          />

          <Suspense fallback={<div className="p-4 text-sm text-slate-600" role="status" aria-live="polite">Loading editor…</div>}>
            <EditorPanelWithDnd 
              state={state.present} 
              actions={actions} 
              sectionVisibility={sectionVisibility}
              sectionOrder={sectionOrder}
              setSectionOrder={setSectionOrder}
              validationMessages={validationMessages}
            />
          </Suspense>
        </div>

        {/* Preview */}
        <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${viewMode==='editor' ? 'hidden' : ''} lg:block`}>
          <div className="border-b p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-bold tracking-wide">Live Preview</h2>
              <span className="text-xs text-slate-500">Auto-updates as you type</span>
            </div>
            
            {/* Layout Controls */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <label className="text-slate-600 font-medium">Paper Size:</label>
                <select
                  value={paperSize}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPaperSize(v);
                    toast.success(`Preview size changed to ${getPaperPreset(v).name}`);
                  }}
                  className="text-xs border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-teal-400"
                >
                  {Object.entries(PAPER_PRESETS).map(([id, p]) => (
                    <option key={id} value={id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-slate-600 font-medium">Padding:</label>
                <input
                  type="range"
                  min="24"
                  max="72"
                  step="4"
                  value={contentPadding}
                  onChange={(e) => setContentPadding(Number(e.target.value))}
                  className="w-24"
                  aria-valuetext={`${contentPadding} pixels`}
                />
                <span className="text-slate-500 min-w-[52px]">{contentPadding}px</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <label className="text-slate-600 font-medium">Font Scale:</label>
                  <input 
                    type="range" 
                    min="75" 
                    max="125" 
                    step="5"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-slate-500 min-w-[45px]">{fontSize}%</span>
                </div>
                <div className="flex items-center gap-1">
                  {[85, 100, 115].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFontSize(preset)}
                      className={`rounded border px-2 py-0.5 text-[11px] ${fontSize === preset ? 'bg-teal-50 border-teal-300 text-teal-700' : 'hover:bg-slate-50'}`}
                      aria-label={`Set font scale to ${preset}%`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Page length:</span>
                <span className={`font-semibold ${pageEstimate > 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {pageEstimate} page{pageEstimate > 1 ? 's' : ''}
                </span>
              </div>
              
              <button
                className="px-2 py-1 text-xs rounded border hover:bg-slate-50 transition-colors"
                onClick={() => {
                  setContentPadding(48);
                  setFontSize(100);
                  toast.success("Layout reset to defaults");
                }}
              >
                Reset Layout
              </button>
              <button
                className="px-2 py-1 text-xs rounded border hover:bg-slate-50 transition-colors"
                onClick={() => setShowPageGuide(prev => !prev)}
              >
                {showPageGuide ? "Hide page guide" : "Show page guide"}
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-slate-100">
            <div ref={sheetRef} className="sheet mx-auto border shadow-lg relative" style={{ width: `${currentPaper.widthMm}mm`, minHeight: `${currentPaper.heightMm}mm`, background: "white", fontSize: `${fontSize}%` }}>
              {/* Page break indicator */}
              {showPageGuide && (
                <div 
                  className="page-break-indicator absolute left-0 right-0 border-b-2 border-dashed border-red-400 pointer-events-none z-10" 
                  style={{ top: `${currentPaper.heightMm}mm` }}
                >
                  <div className="absolute right-2 -top-3 bg-red-500/95 text-white text-[10px] px-2 py-0.5 rounded shadow-md font-medium">
                    First page ends here
                  </div>
                </div>
              )}
              <div className="grid grid-cols-[30%_1fr]" style={{ minHeight: `${currentPaper.heightMm}mm` }}>
                <aside className="border-r" style={{ padding: `${contentPadding}px ${contentPadding * 0.667}px`, background: `linear-gradient(180deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%)` }}>
                  <Aside state={state.present} sectionVisibility={sectionVisibility} />
                </aside>
                <main style={{ padding: `${contentPadding}px` }}>
                  <Main state={state.present} sectionVisibility={sectionVisibility} sectionOrder={sectionOrder} />
                </main>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <footer className="product-chrome border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>
          {PRODUCT_NAME} · v{APP_VERSION} · Your content stays in this browser ·{" "}
          <button
            type="button"
            className="font-medium text-teal-700 underline decoration-teal-200 underline-offset-2 hover:text-teal-800"
            onClick={() => setProductDialog("privacy")}
          >
            Privacy
          </button>
        </p>
      </footer>

      {productDialog === "about" && <AboutModal onClose={() => setProductDialog(null)} />}
      {productDialog === "privacy" && <PrivacyModal onClose={() => setProductDialog(null)} />}
      {productDialog === "shortcuts" && <ShortcutsModal onClose={() => setProductDialog(null)} />}
    </div>
  );
}
