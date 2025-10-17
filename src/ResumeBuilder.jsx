import { useMemo, useRef, useEffect, useState, lazy, Suspense } from "react";
import { Upload, Download, Printer, Save, Undo2, Redo2, FileText } from "lucide-react";
import { toast } from "sonner";
import useUndo from "use-undo";

// Components
const EditorPanelWithDnd = lazy(() => import("./components/Editor/EditorPanelWithDnd"));
import Aside from "./components/Preview/Aside";
import Main from "./components/Preview/Main";
import SectionVisibility from "./components/Controls/SectionVisibility";
import SectionOrderManager from "./components/Controls/SectionOrderManager";
import ThemePicker from "./components/Controls/ThemePicker";

// Utils
import { exportToPDF } from "./utils/exportPdf";
import { exportToDocx } from "./utils/exportDocx";
import { saveToLocalStorage, loadFromLocalStorage, cleanupOldDrafts } from "./utils/localStorage";
import { safeHydrate } from "./utils/dataHelpers";
import { validateImportedResume } from "./utils/validation";

// Constants
import { blankState } from "./constants/defaultData";
import { sampleFromYourPDF } from "./constants/sampleData";
import { getDefaultVisibility, SECTION_CONFIG } from "./constants/sectionConfig";
import { themes, defaultTheme } from "./constants/themes";

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
  const [exporting, setExporting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [paperSize, setPaperSize] = useState('a4');
  const [contentPadding, setContentPadding] = useState(48);
  const [fontSize, setFontSize] = useState(100);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'preview' for mobile

  const paperSizes = {
    a4: { width: 210, height: 297, name: 'A4 (210×297mm)' },
    letter: { width: 215.9, height: 279.4, name: 'Letter (8.5×11")' },
    legal: { width: 215.9, height: 355.6, name: 'Legal (8.5×14")' }
  };
  
  const currentPaper = paperSizes[paperSize] || paperSizes.a4;

  // Auto-save to localStorage
  useEffect(() => {
    if (exporting) return; // pause autosave while exporting
    const timer = setTimeout(() => {
        const toSave = { ...state.present, _savedAt: Date.now() };
      if (saveToLocalStorage('resume_draft', toSave)) {
          setLastSaved(new Date());
          cleanupOldDrafts();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [state.present, exporting]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
          toast.info('Undo');
        }
      }
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        if (canRedo) {
          redo();
          toast.info('Redo');
        }
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
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
    toast.success("Sample resume loaded!");
  }

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

  async function handlePrintPDF() {
    setExporting(true);
    const success = await exportToPDF(state.present, paperSize, fontSize, contentPadding);
    setExporting(false);
  }

  async function handleExportDocx() {
    setExporting(true);
    const success = await exportToDocx(state.present);
    setExporting(false);
  }

  // Section visibility (separate state, not undoable)
  const [sectionVisibility, setSectionVisibility] = useState(
    state.present.sectionVisibility || getDefaultVisibility()
  );

  // Section order (separate state, not undoable)
  const [sectionOrder, setSectionOrder] = useState(
    state.present.sectionOrder || SECTION_CONFIG.map(s => s.id)
  );

  // Theme (separate state, not undoable)
  const [theme, setTheme] = useState(
    state.present.theme || defaultTheme
  );

  // Sync sectionVisibility with state for persistence
  useEffect(() => {
    if (JSON.stringify(state.present.sectionVisibility) !== JSON.stringify(sectionVisibility)) {
      const next = structuredClone(state.present);
      next.sectionVisibility = sectionVisibility;
      setState(next);
    }
  }, [sectionVisibility, state.present.sectionVisibility, setState]);

  // Sync sectionOrder with state for persistence
  useEffect(() => {
    if (JSON.stringify(state.present.sectionOrder) !== JSON.stringify(sectionOrder)) {
      const next = structuredClone(state.present);
      next.sectionOrder = sectionOrder;
      setState(next);
    }
  }, [sectionOrder, state.present.sectionOrder, setState]);

  // Sync theme with state for persistence
  useEffect(() => {
    if (state.present.theme !== theme) {
      const next = structuredClone(state.present);
      next.theme = theme;
      setState(next);
    }
  }, [theme, state.present.theme, setState]);

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
    <div className="min-h-screen bg-slate-50" style={{
      '--theme-primary': currentTheme.primary,
      '--theme-dark': currentTheme.dark,
      '--theme-light': currentTheme.light,
      '--theme-gradient-from': currentTheme.gradient[0],
      '--theme-gradient-to': currentTheme.gradient[1],
    }}>
      {/* Print styles */}
      <style>{`
        @page { size: A4; margin: 12mm }
        @media print { 
          .editor { display: none !important; }
          .sheet { box-shadow: none !important; border: none !important; }
          body { background: transparent !important; }
          .page-break-indicator { display: none !important; }
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

      <div className="mx-auto max-w-[1480px] p-4">
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
              <h2 className="text-sm font-bold tracking-wide">Resume Builder</h2>
              {lastSaved && (
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Save size={12} />
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                disabled={!canUndo} 
                className={`px-3 py-2 rounded-xl border text-sm ${!canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`} 
                onClick={undo}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="inline -mt-1" size={16}/>
              </button>
              <button 
                disabled={!canRedo} 
                className={`px-3 py-2 rounded-xl border text-sm ${!canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`} 
                onClick={redo}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="inline -mt-1" size={16}/>
              </button>
              <div className="border-l mx-1" />
              <button 
                className="px-3 py-2 rounded-xl border text-sm hover:bg-slate-50 transition-colors active:scale-95" 
                onClick={loadSample}
              >
                Load Sample
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
                disabled={exporting} 
                className={`px-3 py-2 rounded-xl text-sm transition-all ${exporting ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-teal-500 text-white hover:bg-teal-600 active:scale-95'}`} 
                onClick={handlePrintPDF}
              >
                <Printer className="inline -mt-1 mr-1" size={16}/>{exporting ? 'Exporting…' : 'Export to PDF'}
              </button>
            </div>
          </div>

          <SectionVisibility 
            state={state.present} 
            sectionVisibility={sectionVisibility} 
            setSectionVisibility={setSectionVisibility} 
          />

          <SectionOrderManager
            sectionOrder={sectionOrder}
            setSectionOrder={setSectionOrder}
          />

          <ThemePicker
            theme={theme}
            setTheme={setTheme}
          />

          <Suspense fallback={<div className="p-4 text-sm text-slate-600">Loading editor…</div>}>
            <EditorPanelWithDnd 
              state={state.present} 
              actions={actions} 
              sectionVisibility={sectionVisibility}
              sectionOrder={sectionOrder}
              setSectionOrder={setSectionOrder}
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
                    setPaperSize(e.target.value);
                    toast.success(`Preview size changed to ${paperSizes[e.target.value].name}`);
                  }}
                  className="text-xs border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="a4">A4 (210×297mm)</option>
                  <option value="letter">Letter (8.5×11")</option>
                  <option value="legal">Legal (8.5×14")</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-slate-600 font-medium">Margins:</label>
                <input 
                  type="range" 
                  min="24" 
                  max="72" 
                  step="4"
                  value={contentPadding}
                  onChange={(e) => setContentPadding(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-slate-500 min-w-[60px]">{Math.round(contentPadding / 4)}mm</span>
              </div>
              
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
            </div>
          </div>
          
          <div className="p-4 bg-slate-100">
            <div className="sheet mx-auto border shadow-lg relative" style={{ width: `${currentPaper.width}mm`, minHeight: `${currentPaper.height}mm`, background: "white", fontSize: `${fontSize}%` }}>
              {/* Page break indicator */}
              <div 
                className="page-break-indicator absolute left-0 right-0 border-b-2 border-dashed border-red-400 pointer-events-none z-10" 
                style={{ top: `${currentPaper.height}mm` }}
              >
                <div className="absolute right-2 -top-3 bg-red-400 text-white text-[10px] px-2 py-0.5 rounded shadow-md">
                  📄 Page 1 ends here
                </div>
              </div>
              <div className="grid grid-cols-[30%_1fr]" style={{ minHeight: `${currentPaper.height}mm` }}>
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
    </div>
  );
}
