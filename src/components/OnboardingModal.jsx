import { Sparkles, MousePointer2, ListChecks, Eye, FileDown } from "lucide-react";
import { PRODUCT_NAME } from "../constants/product";
import { ModalFrame } from "./ProductModals.jsx";

const tips = [
  {
    title: "Sections and order",
    description:
      "Use the section controls to show or hide blocks. Drag sections in the editor to change the order shown in your preview and exports.",
    icon: ListChecks,
  },
  {
    title: "Editing and history",
    description:
      "Your draft saves automatically in this browser. Use undo and redo (keyboard shortcuts supported) and validation feedback while you edit.",
    icon: MousePointer2,
  },
  {
    title: "Preview layout",
    description:
      "Adjust paper size, padding, and font scale in the preview panel to match how you intend to print or export.",
    icon: Eye,
  },
  {
    title: "Export",
    description:
      "When you are satisfied with the content and layout, export to PDF or Word (DOCX) from the toolbar.",
    icon: FileDown,
  },
];

export default function OnboardingModal({ open, onClose, onLoadSample }) {
  if (!open) return null;

  return (
    <ModalFrame title={`Welcome to ${PRODUCT_NAME}`} onClose={onClose}>
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3 text-teal-900">
        <span className="rounded-full bg-white/80 p-2 shadow-sm ring-1 ring-teal-100">
          <Sparkles size={18} className="text-teal-600" />
        </span>
        <p className="text-sm text-slate-700">
          You can load a sample resume to explore every section, or start from a blank document and fill in your own
          information.
        </p>
      </div>

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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={onClose}
        >
          Start blank
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
          onClick={onLoadSample}
        >
          Load sample resume
        </button>
      </div>
    </ModalFrame>
  );
}
