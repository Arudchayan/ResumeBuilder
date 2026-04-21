import { useEffect } from "react";
import { X } from "lucide-react";
import {
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
  APP_VERSION,
  SOURCE_URL,
} from "../constants/product";

export function ModalFrame({ title, children, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[min(90vh,640px)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
          <h2 id="product-modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4 text-sm text-slate-600">{children}</div>
      </div>
    </div>
  );
}

export function AboutModal({ onClose }) {
  return (
    <ModalFrame title={`About ${PRODUCT_NAME}`} onClose={onClose}>
      <p className="mb-4 text-slate-700">{PRODUCT_TAGLINE}</p>
      <p className="mb-4">
        {PRODUCT_NAME} runs entirely in your browser: a structured editor, live preview, JSON
        backup, and exports to PDF and Microsoft Word (DOCX). No account is required.
      </p>
      <ul className="mb-4 list-inside list-disc space-y-1 text-slate-700">
        <li>Section visibility, drag-and-drop order, and multiple themes</li>
        <li>Autosave to this device with undo and redo</li>
        <li>Validation and sanitization for safer content</li>
      </ul>
      <p className="mb-2 text-xs text-slate-500">Version {APP_VERSION}</p>
      <p>
        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-800"
        >
          Source &amp; license
        </a>
        <span className="text-slate-500"> — MIT</span>
      </p>
    </ModalFrame>
  );
}

export function PrivacyModal({ onClose }) {
  return (
    <ModalFrame title="Privacy &amp; data" onClose={onClose}>
      <p className="mb-4">
        This application does not send your résumé content to our servers. Your draft is stored
        locally in this browser (typically via{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">localStorage</code>
        ), subject to your browser&apos;s storage limits and policies.
      </p>
      <p className="mb-4">
        Clearing site data for this origin will remove the saved draft unless you have exported a
        JSON file as a backup. Use <strong>Export JSON</strong> regularly if you rely on autosave.
      </p>
      <p className="mb-4">
        PDF and Word export run in your browser; generated files are downloaded directly to your
        device. Embedded images in exports may be subject to third-party hosting rules (for example
        photo URLs you enter).
      </p>
      <p className="text-xs text-slate-500">
        Hosted deployments (such as GitHub Pages) serve the app static files only; they do not
        receive your résumé text from normal use of this client.
      </p>
    </ModalFrame>
  );
}

export function ShortcutsModal({ onClose }) {
  return (
    <ModalFrame title="Keyboard shortcuts" onClose={onClose}>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2 pr-4 font-medium">Action</th>
            <th className="py-2 font-medium">Shortcut</th>
          </tr>
        </thead>
        <tbody className="text-slate-800">
          <tr className="border-b border-slate-100">
            <td className="py-2 pr-4">Undo</td>
            <td className="py-2">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs">
                Z
              </kbd>
              <span className="text-slate-500"> (Windows / Linux)</span>
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="py-2 pr-4">Redo</td>
            <td className="py-2">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs">
                Y
              </kbd>
              {" or "}
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs">
                Shift
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs">
                Z
              </kbd>
            </td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-slate-500" colSpan={2}>
              On macOS, use <kbd className="rounded border px-1 font-mono text-xs">⌘</kbd> instead
              of Ctrl.
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="py-2 pr-4 align-top">Undo / redo scope</td>
            <td className="py-2 text-slate-600">
              Global shortcuts apply when focus is <strong>not</strong> inside a text field, textarea, select, or
              contenteditable region—so <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono text-xs">Ctrl</kbd>{" "}
              + <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono text-xs">Z</kbd> can still undo typing in those controls.
            </td>
          </tr>
        </tbody>
      </table>
    </ModalFrame>
  );
}
