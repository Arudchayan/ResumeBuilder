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
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-teal-900">
        <span className="mt-0.5 rounded-full bg-white p-2 shadow-sm ring-1 ring-teal-100">
          <Sparkles size={18} className="text-teal-600" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">A focused workspace for building a polished CV.</p>
          <p className="mt-1 text-sm text-slate-600">Start blank or load a sample to see the editor and live preview in action.</p>
        </div>
      </div>

      <div className="rb-onboarding-steps">
        {tips.map(({ title, description, icon: Icon }) => (
          <div key={title} className="rb-onboarding-step">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Icon size={16} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rb-onboarding-actions mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          className="rb-button inline-flex justify-center"
          onClick={onClose}
        >
          Start blank
        </button>
        <button
          type="button"
          className="rb-button rb-button-primary inline-flex justify-center"
          onClick={onLoadSample}
        >
          Load sample resume
        </button>
      </div>
    </ModalFrame>
  );
}
