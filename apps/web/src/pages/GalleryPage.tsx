import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildGalleryTemplatePreviews,
  getGalleryPreview,
  PAPER_PRESETS,
  ResumePreview,
} from "@resume/templates";
import type { TemplateId } from "@resume/core";
import { Button } from "@resume/ui";
import { toast } from "sonner";
import { useAppStore } from "../lib/store";

/** Fit a full A4 sheet into a thumbnail box (mirrors the editor's fit-to-width math). */
function scaleForWidth(containerWidth: number) {
  const sheetPx = (PAPER_PRESETS.a4.widthMm / 25.4) * 96;
  return Math.min(1, Math.max(0.15, containerWidth / sheetPx));
}

export function GalleryPage() {
  const startBlank = useAppStore((s) => s.startBlank);
  const startSample = useAppStore((s) => s.startSample);
  const setModal = useAppStore((s) => s.setModal);
  const importJsonFile = useAppStore((s) => s.importJsonFile);

  const previews = useMemo(() => buildGalleryTemplatePreviews(), []);
  const [selectedId, setSelectedId] = useState<TemplateId>(previews[0]?.id ?? "sidebar");
  const selected = getGalleryPreview(previews, selectedId);

  const thumbHostRef = useRef<HTMLDivElement>(null);
  const [thumbZoom, setThumbZoom] = useState(0.32);

  useEffect(() => {
    const host = thumbHostRef.current;
    if (!host) return;
    const updateZoom = () => {
      const width = host.clientWidth;
      if (width > 0) setThumbZoom(scaleForWidth(width));
    };
    updateZoom();
    const observer = new ResizeObserver(updateZoom);
    observer.observe(host);
    window.addEventListener("resize", updateZoom);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateZoom);
    };
  }, []);

  const onImport = async (file: File) => {
    try {
      await importJsonFile(file);
      toast.success("Resume imported");
    } catch (err) {
      console.error(err);
      toast.error("Could not import JSON — check it was exported from this builder");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header
        role="banner"
        className="border-b border-slate-200 bg-white"
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Resume Builder</h1>
            <p className="text-sm text-slate-500">Edit locally. Export PDF or DOCX. Your data stays in this browser.</p>
          </div>
          <nav aria-label="Product" className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => setModal("about")}>
              About
            </Button>
            <Button variant="ghost" onClick={() => setModal("privacy")}>
              Privacy
            </Button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700">
              Import JSON
              <input
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onImport(file);
                }}
              />
            </label>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-sm text-teal-900">
          Have an existing <code className="rounded bg-white px-1">resume.json</code>? Use <strong>Import JSON</strong> —
          files from the previous version (including <code className="rounded bg-white px-1">template: &quot;modern&quot;</code>) are supported.
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Start with a template</h2>
            <p className="mt-1 text-sm text-slate-500">
              Live previews use the same renderer as the editor and PDF export. Pick a template to preview it with sample content.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-600" role="status">
            Showing: <span className="font-bold text-slate-900" data-testid="gallery-selected-template">{selected.name}</span>
          </p>
          <p className="sr-only" aria-live="polite">
            {selected.name} preview selected
          </p>
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previews.map((preview, idx) => (
            <li key={preview.id}>
              <button
                type="button"
                onClick={() => setSelectedId(preview.id)}
                aria-pressed={preview.id === selectedId}
                data-template-card={preview.id}
                className={`block w-full rounded-xl border bg-white p-4 text-left shadow-sm transition-[border-color,box-shadow] ${
                  preview.id === selectedId
                    ? "border-teal-500 ring-2 ring-teal-500/40"
                    : "border-slate-200 hover:border-teal-300"
                }`}
              >
                <div
                  className="pointer-events-none select-none"
                  ref={idx === 0 ? thumbHostRef : undefined}
                  style={{
                    width: "100%",
                    aspectRatio: "210 / 297",
                    overflow: "hidden",
                    position: "relative",
                    background: "#fff",
                  }}
                >
                  <div
                    className="origin-top-left"
                    style={{ transform: `scale(${thumbZoom})`, width: `calc(210mm * ${thumbZoom})` }}
                  >
                    <ResumePreview
                      doc={preview.doc}
                      ir={preview.ir}
                      zoom={1}
                      showPageGuides={false}
                      skillsDensity={preview.skillsDensity}
                    />
                  </div>
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{preview.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{preview.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      preview.atsFriendly ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {preview.atsFriendly ? "ATS-friendly" : "Visual layout"}
                  </span>
                  {preview.supportsPhoto ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">Photo</span> : null}
                </div>
              </button>
            </li>
          ))}
        </ul>

        <section
          aria-label="Template preview"
          className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 data-testid="gallery-preview-title" className="text-lg font-semibold text-slate-900">
                {selected.name}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{selected.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void startBlank(selected.id as TemplateId)}>Blank</Button>
              <Button variant="secondary" onClick={() => void startSample(selected.id as TemplateId)}>
                Load sample
              </Button>
            </div>
          </div>
          <div className="gallery-preview-stage mt-4 overflow-x-auto">
            <div className="gallery-preview-frame">
              <ResumePreview
                doc={selected.doc}
                ir={selected.ir}
                zoom={0.75}
                showPageGuides={false}
                skillsDensity={selected.skillsDensity}
                onSectionClick={(sectionId) => {
                  toast.info(`${selected.name}: ${sectionId} section is editable after you start`);
                }}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
