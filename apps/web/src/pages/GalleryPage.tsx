import { TEMPLATES, TemplateThumb } from "@resume/templates";
import type { TemplateId } from "@resume/core";
import { Button } from "@resume/ui";
import { useAppStore } from "../lib/store";

export function GalleryPage() {
  const startBlank = useAppStore((s) => s.startBlank);
  const startSample = useAppStore((s) => s.startSample);
  const setModal = useAppStore((s) => s.setModal);
  const importJsonFile = useAppStore((s) => s.importJsonFile);

  return (
    <div className="min-h-screen">
      <header role="banner" className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p className="font-display text-3xl tracking-tight text-slate-900 md:text-4xl">Resume Forge</p>
          <p className="mt-1 text-sm text-slate-600">Local-first resumes. Your data stays in this browser.</p>
        </div>
        <nav aria-label="Product" className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setModal("about")}>
            About
          </Button>
          <Button variant="ghost" onClick={() => setModal("privacy")}>
            Privacy
          </Button>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importJsonFile(file);
              }}
            />
          </label>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-6 pb-16">
        <section className="animate-fade-up rounded-3xl bg-slate-900 px-8 py-12 text-white">
          <h1 className="font-display text-4xl md:text-5xl">Choose a template</h1>
          <p className="mt-3 max-w-xl text-slate-300">
            Pick a layout, edit section by section, and export a vector PDF or DOCX that matches the preview.
          </p>
        </section>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t, index) => (
            <li
              key={t.id}
              className="animate-fade-up rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200/80 backdrop-blur"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <TemplateThumb accent={t.previewAccent} />
              <h2 className="mt-4 font-display text-xl text-slate-900">{t.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{t.description}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {t.atsFriendly ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800">ATS-friendly</span>
                ) : null}
                {t.supportsPhoto ? (
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-800">Photo</span>
                ) : null}
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => void startBlank(t.id as TemplateId)}>Start blank</Button>
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
