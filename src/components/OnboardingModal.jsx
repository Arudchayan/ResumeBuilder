import { Sparkles, MousePointer2, ListChecks, Eye, FileDown } from "lucide-react";

const tips = [
  {
    title: "Toggle & reorder sections",
    description: "Use the Section Controls panel to hide optional blocks and drag handles to rearrange everything in the editor.",
    icon: ListChecks,
  },
  {
    title: "Edit with confidence",
    description: "Autosave, undo/redo shortcuts, and inline validation keep your data safe while you experiment.",
    icon: MousePointer2,
  },
  {
    title: "Dial in the preview",
    description: "Switch paper sizes, margins, font scale, and watch the live preview update instantly.",
    icon: Eye,
  },
  {
    title: "Export when ready",
    description: "Download polished PDFs or DOCX files that mirror your current layout and theme.",
    icon: FileDown,
  },
];

export default function OnboardingModal({ open, onClose, onLoadSample }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 text-white">
          <span className="rounded-full bg-white/20 p-2">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/80">welcome aboard</p>
            <p className="text-lg font-semibold">Build a standout resume in minutes</p>
          </div>
        </div>

        <div className="space-y-4 px-6 py-6 text-slate-700">
          <p className="text-sm text-slate-500">
            Quick tour before you dive in. Load the sample to see real data, or start blank and customize every panel.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {tips.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-900">
                  <span className="rounded-lg bg-white p-2 shadow-sm">
                    <Icon size={16} className="text-teal-600" />
                  </span>
                  <p className="text-sm font-semibold">{title}</p>
                </div>
                <p className="text-sm text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
            onClick={onLoadSample}
          >
            Load sample & explore
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            onClick={onClose}
          >
            Start from blank
          </button>
        </div>
      </div>
    </div>
  );
}

