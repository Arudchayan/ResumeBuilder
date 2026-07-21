import { Button, Dialog } from "@resume/ui";
import { useAppStore } from "../lib/store";

export function ProductModals() {
  const modal = useAppStore((s) => s.modal);
  const setModal = useAppStore((s) => s.setModal);
  const close = () => setModal(null);

  return (
    <>
      <Dialog open={modal === "about"} title="About Resume Forge" onClose={close}>
        <p>
          Resume Forge is a local-first resume builder. Edit with a live preview, then export vector PDF or
          DOCX from the same layout model.
        </p>
        <p className="mt-3">Version 2.0 — monorepo rewrite with templates, IndexedDB, and SaaS-ready ports.</p>
        <div className="mt-4">
          <Button onClick={close}>Close</Button>
        </div>
      </Dialog>
      <Dialog open={modal === "privacy"} title="Privacy" onClose={close}>
        <p>
          Your resume data is stored in this browser (IndexedDB). Nothing is uploaded to a server. Export files
          are created on your device.
        </p>
        <p className="mt-3">Clear site data for this origin to permanently remove drafts.</p>
        <div className="mt-4">
          <Button onClick={close}>Close</Button>
        </div>
      </Dialog>
      <Dialog open={modal === "shortcuts"} title="Keyboard shortcuts" onClose={close}>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <kbd>Ctrl/Cmd</kbd> + <kbd>Z</kbd> — Undo (outside text fields)
          </li>
          <li>
            <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> — Redo
          </li>
          <li>
            <kbd>Ctrl/Cmd</kbd> + <kbd>S</kbd> — Save now
          </li>
          <li>Native undo still works inside inputs and textareas</li>
        </ul>
        <div className="mt-4">
          <Button onClick={close}>Close</Button>
        </div>
      </Dialog>
    </>
  );
}
