import { TEMPLATES, TemplateThumb } from "@resume/templates";
import type { TemplateId } from "@resume/core";
import { Button } from "@resume/ui";
import { toast } from "sonner";
import { useAppStore } from "../lib/store";

export function GalleryPage() {
  const startBlank = useAppStore((s) => s.startBlank);
  const startSample = useAppStore((s) => s.startSample);
  const setModal = useAppStore((s) => s.setModal);
  const importJsonFile = useAppStore((s) => s.importJsonFile);

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

        <h2 className="text-lg font-semibold text-slate-800">Start with a template</h2>
        <p className="mt-1 text-sm text-slate-500">
          Classic Sidebar matches the original teal two-column layout.
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <TemplateThumb accent={t.previewAccent} />
              <h3 className="mt-3 font-semibold text-slate-900">{t.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => void startBlank(t.id as TemplateId)}>Blank</Button>
                <Button variant="secondary" onClick={() => void startSample(t.id as TemplateId)}>
                  Load sample
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
