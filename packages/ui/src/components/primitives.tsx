import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      type="button"
      className={`ui-button ui-button-${variant} inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

function Label({
  htmlFor,
  children,
  className = "",
}: {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={`block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500 ${className}`}>
      {children}
    </label>
  );
}

export function Field({
  label,
  error,
  multiline,
  ...props
}: InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    error?: string;
    multiline?: boolean;
  }) {
  const id = useId();
  const errorId = `${id}-error`;
  const control = multiline ? (
    <textarea
      id={id}
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={error ? errorId : undefined}
      className="field-control min-h-[112px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-[var(--theme-primary)] focus:ring-2"
      {...props}
    />
  ) : (
    <input
      id={id}
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={error ? errorId : undefined}
      className="field-control w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-[var(--theme-primary)] focus:ring-2"
      {...props}
    />
  );
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {control}
      {error ? (
        <p id={errorId} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Dialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="fixed inset-0 z-50 m-auto max-h-[min(720px,calc(100dvh-2rem))] w-full max-w-lg rounded-3xl bg-white p-5 text-sm text-slate-600 shadow-2xl backdrop:bg-slate-900/40 sm:p-6"
    >
      <h2 id={titleId} className="font-display text-xl text-slate-900">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </dialog>
  );
}
