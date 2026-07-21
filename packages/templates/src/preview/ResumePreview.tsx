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
          <div className="break-all leading-relaxed">
            {block.href ? (
              <a
                href={block.href}
                className="font-medium text-[var(--theme-primary)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {block.value}
              </a>
            ) : (
              <span>{block.value}</span>
            )}
          </div>
        </div>
      );
    case "link":
      return (
        <div className="space-y-1.5" {...clickable}>
          <a
            href={block.href}
            target="_blank"
            rel="noreferrer noopener"
            className="block text-[12px] font-medium text-[var(--theme-primary)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {block.label}
          </a>
        </div>
      );
    case "photo":
      return (
        <button
          type="button"
          className="mb-6 flex w-full items-center justify-center"
          onClick={() => onSectionClick?.("photo")}
        >
          <img
            src={block.src}
            alt="Profile"
            className="h-28 w-28 rounded-full border object-cover shadow-sm"
          />
        </button>
      );
    case "lineItem":
      return (
        <div className="my-1 text-[12.5px] text-slate-800" {...clickable}>
          <span className="font-semibold">{block.text}</span>{" "}
          {block.muted ? <span className="text-slate-500">{block.muted}</span> : null}
        </div>
      );
    case "entry":
      return (
        <article className="mb-3" {...clickable}>
          <div className="text-sm font-bold text-slate-900">
            {block.title}
            {block.url ? (
              <a
                href={block.url}
                target="_blank"
                rel="noreferrer noopener"
                className="ml-1.5 text-xs text-[var(--theme-primary)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                ↗
              </a>
            ) : null}
          </div>
          {block.subtitle ? (
            <div className="text-sm font-semibold text-slate-500">{block.subtitle}</div>
          ) : null}
          {block.meta ? <div className="mt-0.5 text-xs text-slate-500">{block.meta}</div> : null}
          {block.subsections?.map((sec, i) => (
            <div key={i} className="mt-2">
              {sec.title ? <div className="mt-1 font-semibold text-slate-900">{sec.title}</div> : null}
              {sec.bullets.map((line, j) => (
                <div key={j} className="my-1 grid grid-cols-[12px_1fr] gap-2 text-[12.5px]">
                  <span className="text-[var(--theme-dark)]">•</span>
                  <span className="text-slate-800">{line}</span>
                </div>
              ))}
            </div>
          ))}
          {block.body?.map((line, i) =>
            line.startsWith("Tech:") ? (
              <div key={i} className="mt-1 text-[11.5px] text-slate-600">
                <span className="font-semibold">Tech:</span> {line.slice(5).trim()}
              </div>
            ) : (
              <p key={i} className="mt-1 text-[12.5px] text-slate-800">
                {line}
              </p>
            ),
          )}
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
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        {page.columns.map((col) => {
          const isAside = col.id === "aside";
          return (
            <div
              key={col.id}
              style={{
                width: `${col.width * 100}%`,
                background: isAside ? "linear-gradient(180deg, var(--theme-surface), #fff)" : undefined,
              }}
              className={isAside ? "p-5" : isSidebar ? "flex-1 p-6" : "w-full"}
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
