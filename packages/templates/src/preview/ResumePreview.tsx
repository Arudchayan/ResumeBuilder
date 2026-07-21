import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import type { ResumeDocument } from "@resume/core";
import type { LayoutIr, IrBlock } from "../ir/documentToIr.js";
import { themeCssVars } from "@resume/ui";
import { ClassicSidebarSheet } from "./ClassicSidebarSheet.js";

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
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900" {...clickable}>
            {block.text}
          </h1>
        );
      }
      return (
        <h2
          className="mb-2 mt-4 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--theme-dark)]"
          {...clickable}
        >
          {block.text}
        </h2>
      );
    case "accentBar":
      return <div className="my-4 h-1.5 w-16 rounded-full bg-[var(--theme-primary)]" />;
    case "paragraph":
      return (
        <p
          className={
            block.muted
              ? "mt-1 font-bold text-[var(--theme-dark)]"
              : `text-[13px] leading-relaxed text-slate-800 ${compact ? "text-[12px]" : ""}`
          }
          {...clickable}
        >
          {block.text}
        </p>
      );
    case "chips":
      return (
        <div className="mt-1 flex flex-wrap gap-2" {...clickable}>
          {block.items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11.5px] text-slate-800"
            >
              {item}
            </span>
          ))}
        </div>
      );
    case "bullets":
      return (
        <div className="mt-1" {...clickable}>
          {block.items.map((item, i) => (
            <div key={`${i}-${item.slice(0, 12)}`} className="my-1 grid grid-cols-[12px_1fr] gap-2 text-[12.5px]">
              <span className="text-[var(--theme-dark)]">•</span>
              <span className="text-slate-800">{item}</span>
            </div>
          ))}
        </div>
      );
    case "kv":
      return (
        <div className="my-2 text-[12px] text-slate-800" {...clickable}>
          <div className="mb-0.5 text-[10px] uppercase tracking-wider text-slate-500">{block.label}</div>
          <div className="break-all leading-relaxed">{block.value}</div>
        </div>
      );
    case "link":
      return (
        <a href={block.href} className="block text-[12px] font-medium text-[var(--theme-primary)]" {...clickable}>
          {block.label}
        </a>
      );
    case "photo":
      return <img src={block.src} alt="" className="mb-3 h-24 w-24 rounded-full object-cover" />;
    case "lineItem":
      return (
        <div className="my-1 text-[12.5px]" {...clickable}>
          <span className="font-semibold">{block.text}</span>{" "}
          {block.muted ? <span className="text-slate-500">{block.muted}</span> : null}
        </div>
      );
    case "entry":
      return (
        <article className="mb-3" {...clickable}>
          <div className="text-sm font-bold">{block.title}</div>
          {block.subtitle ? <div className="text-sm font-semibold text-slate-500">{block.subtitle}</div> : null}
          {block.meta ? <div className="text-xs text-slate-500">{block.meta}</div> : null}
          {block.subsections?.map((sec, i) => (
            <div key={i} className="mt-2">
              {sec.title ? <div className="font-semibold">{sec.title}</div> : null}
              {sec.bullets.map((line, j) => (
                <div key={j} className="my-1 grid grid-cols-[12px_1fr] gap-2 text-[12.5px]">
                  <span>•</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          ))}
          {block.body?.map((line, i) => (
            <p key={i} className="mt-1 text-[12.5px]">
              {line}
            </p>
          ))}
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
  doc,
  ir,
  zoom = 1,
  contentPadding = 48,
  fontScale = 100,
  onSectionClick,
  className = "",
}: {
  doc?: ResumeDocument;
  ir: LayoutIr;
  zoom?: number;
  contentPadding?: number;
  fontScale?: number;
  onSectionClick?: (sectionId: string) => void;
  className?: string;
}) {
  // Classic sidebar: use the faithful DOM layout (matches the old builder / PDF look)
  if (ir.templateId === "sidebar" && doc) {
    return (
      <div
        className={`origin-top-left ${className}`}
        style={{ transform: `scale(${zoom})`, width: `calc(210mm * ${zoom})` }}
      >
        <ClassicSidebarSheet
          doc={doc}
          contentPadding={contentPadding}
          fontScale={fontScale}
          onSectionClick={onSectionClick}
        />
      </div>
    );
  }

  const page = ir.pages[0];
  if (!page) return null;
  const vars = themeCssVars(ir.themeId) as CSSProperties;
  const widthPx = (ir.paper.widthMm / 25.4) * 96;
  const minHeightPx = (ir.paper.heightMm / 25.4) * 96;
  const compact = ir.templateId === "compact";

  return (
    <div
      className={`origin-top-left ${className}`}
      style={{ ...vars, transform: `scale(${zoom})`, width: widthPx }}
      data-template={ir.templateId}
    >
      <div
        className="sheet flex flex-col bg-white p-8 text-slate-900 shadow-lg"
        style={{ width: widthPx, minHeight: minHeightPx }}
      >
        {page.columns[0]?.blocks.map((block, idx) => (
          <BlockView
            key={`main-${idx}-${block.type}`}
            block={block}
            onSectionClick={onSectionClick}
            compact={compact}
          />
        ))}
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
          <div className="w-[30%] border-r p-2" style={{ background: `linear-gradient(180deg, ${accent}22, #fff)` }}>
            <div className="mb-2 h-1.5 w-10 rounded bg-slate-300" />
            <div className="mb-1 h-1 w-full rounded bg-slate-200" />
            <div className="mb-1 h-1 w-4/5 rounded bg-slate-200" />
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="h-2 w-8 rounded-full border bg-slate-50" />
              <span className="h-2 w-6 rounded-full border bg-slate-50" />
            </div>
          </div>
          <div className="flex-1 space-y-2 p-3">
            <div className="h-3 w-2/3 rounded" style={{ background: accent }} />
            <div className="h-1 w-12 rounded-full" style={{ background: accent }} />
            <div className="h-1.5 w-full rounded bg-slate-200" />
            <div className="h-1.5 w-5/6 rounded bg-slate-200" />
          </div>
        </div>
      )}
    </div>
  );
}

export { ClassicSidebarSheet };
