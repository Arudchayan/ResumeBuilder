import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import type { LayoutIr, IrBlock } from "../ir/documentToIr.js";
import { themeCssVars } from "@resume/ui";

function BlockView({
  block,
  onSectionClick,
  compact,
}: {
  block: IrBlock;
  onSectionClick?: (sectionId: string) => void;
  compact?: boolean;
}) {
  const clickable = block.sectionId
    ? {
        role: "button" as const,
        tabIndex: 0,
        onClick: () => onSectionClick?.(block.sectionId!),
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSectionClick?.(block.sectionId!);
          }
        },
      }
    : {};

  switch (block.type) {
    case "heading":
      if (block.level === 1) {
        return (
          <h1
            className="font-display text-[28px] font-semibold leading-tight text-[var(--theme-dark)]"
            {...clickable}
          >
            {block.text}
          </h1>
        );
      }
      return (
        <h2
          className={`mt-3 border-b border-[var(--theme-primary)]/30 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--theme-primary)] ${compact ? "mt-2" : ""}`}
          {...clickable}
        >
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p
          className={`mt-1 text-[12px] leading-relaxed text-slate-700 ${block.muted ? "text-[13px] font-medium text-[var(--theme-dark)]" : ""} ${compact ? "text-[11px]" : ""}`}
          {...clickable}
        >
          {block.text}
        </p>
      );
    case "chips":
      return (
        <div className="mt-2 flex flex-wrap gap-1.5" {...clickable}>
          {block.items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-[var(--theme-primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--theme-dark)]"
            >
              {item}
            </span>
          ))}
        </div>
      );
    case "bullets":
      return (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] text-slate-700" {...clickable}>
          {block.items.map((item, i) => (
            <li key={`${i}-${item.slice(0, 12)}`}>{item}</li>
          ))}
        </ul>
      );
    case "kv":
      return (
        <div className="mt-1.5 text-[11px]" {...clickable}>
          <div className="font-semibold text-[var(--theme-dark)]">{block.label}</div>
          <div className="break-all text-slate-600">{block.value}</div>
        </div>
      );
    case "photo":
      return (
        <button
          type="button"
          className="mb-3 block overflow-hidden rounded-full border-2 border-white shadow"
          onClick={() => onSectionClick?.("photo")}
        >
          <img src={block.src} alt="" className="h-24 w-24 object-cover" />
        </button>
      );
    case "entry":
      return (
        <article className={`mt-2 ${compact ? "mt-1.5" : ""}`} {...clickable}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[13px] font-semibold text-slate-900">{block.title}</h3>
            {block.meta ? <span className="text-[10px] text-slate-500">{block.meta}</span> : null}
          </div>
          {block.subtitle ? <p className="text-[11px] text-slate-600">{block.subtitle}</p> : null}
          {block.url ? (
            <a
              href={block.url}
              className="text-[10px] text-[var(--theme-primary)] underline"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {block.url}
            </a>
          ) : null}
          {block.body?.length ? (
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-700">
              {block.body.map((line, i) => (
                <li key={`${i}-${line.slice(0, 16)}`}>{line}</li>
              ))}
            </ul>
          ) : null}
        </article>
      );
    case "spacer":
      return <div className={block.size === "sm" ? "h-2" : "h-4"} />;
    default: {
      const _exhaustive: never = block;
      void _exhaustive;
      return null;
    }
  }
}

export function ResumePreview({
  ir,
  zoom = 1,
  onSectionClick,
  className = "",
}: {
  ir: LayoutIr;
  zoom?: number;
  onSectionClick?: (sectionId: string) => void;
  className?: string;
}) {
  const page = ir.pages[0];
  if (!page) return null;
  const vars = themeCssVars(ir.themeId) as CSSProperties;
  const widthPx = (ir.paper.widthMm / 25.4) * 96;
  const minHeightPx = (ir.paper.heightMm / 25.4) * 96;
  const compact = ir.templateId === "compact";
  const isSidebar = ir.templateId === "sidebar";

  return (
    <div
      className={`origin-top-left ${className}`}
      style={{ ...vars, transform: `scale(${zoom})`, width: widthPx, minHeight: minHeightPx }}
      data-template={ir.templateId}
    >
      <div
        className={`sheet flex overflow-hidden bg-white text-slate-900 shadow-lg ${isSidebar ? "" : "flex-col p-8"}`}
        style={{
          width: widthPx,
          minHeight: minHeightPx,
          fontSize: compact ? 11 : 12,
        }}
      >
        {page.columns.map((col) => {
          const isAside = col.id === "aside";
          return (
            <div
              key={col.id}
              style={{ width: `${col.width * 100}%` }}
              className={
                isAside
                  ? "bg-[var(--theme-surface)] p-5"
                  : isSidebar
                    ? "flex-1 p-6"
                    : "w-full"
              }
            >
              {col.blocks.map((block, idx) => (
                <BlockView
                  key={`${col.id}-${idx}-${block.type}`}
                  block={block}
                  onSectionClick={onSectionClick}
                  compact={compact}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TemplateThumb({
  accent,
  children,
}: {
  accent: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="aspect-[210/297] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      style={{ borderTopColor: accent, borderTopWidth: 4 }}
    >
      {children ?? (
        <div className="flex h-full">
          <div className="w-1/3 p-2" style={{ background: `${accent}18` }}>
            <div className="mb-2 h-6 w-6 rounded-full" style={{ background: accent }} />
            <div className="mb-1 h-1.5 w-full rounded bg-slate-200" />
            <div className="mb-1 h-1.5 w-4/5 rounded bg-slate-200" />
            <div className="h-1.5 w-3/5 rounded bg-slate-200" />
          </div>
          <div className="flex-1 space-y-2 p-3">
            <div className="h-3 w-2/3 rounded" style={{ background: accent }} />
            <div className="h-1.5 w-full rounded bg-slate-200" />
            <div className="h-1.5 w-5/6 rounded bg-slate-200" />
            <div className="h-1.5 w-4/6 rounded bg-slate-200" />
          </div>
        </div>
      )}
    </div>
  );
}
