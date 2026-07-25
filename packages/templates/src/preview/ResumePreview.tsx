import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import type { ResumeDocument } from "@resume/core";
import type { LayoutIr, IrBlock } from "../ir/documentToIr.js";
import { themeCssVars } from "@resume/ui";
import { ClassicSidebarSheet } from "./ClassicSidebarSheet.js";
import { PageBreakGuides } from "./PageBreakGuides.js";
import { PAPER_PRESETS, type PaperId } from "./paper.js";
import type { SkillsDensity } from "./layoutAssist.js";

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

  const sectionAttrs = block.sectionId
    ? { "data-section": block.sectionId, "data-section-label": block.sectionId }
    : {};

  switch (block.type) {
    case "heading":
      if (block.level === 1) {
        return (
          <h1 className="rb-keep text-3xl font-extrabold leading-tight text-slate-900" {...sectionAttrs} {...clickable}>
            {block.text}
          </h1>
        );
      }
      return (
        <h2
          className="rb-keep mb-2 mt-4 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--theme-dark)]"
          {...sectionAttrs}
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
              ? "rb-keep mt-1 font-bold text-[var(--theme-dark)]"
              : `rb-keep text-[13px] leading-relaxed text-slate-800 ${compact ? "text-[12px]" : ""}`
          }
          {...sectionAttrs}
          {...clickable}
        >
          {block.text}
        </p>
      );
    case "chips":
      return (
        <div className="rb-section mt-1" {...sectionAttrs} {...clickable}>
          <p className="skills-compact text-[11px] leading-snug text-slate-800">{block.items.join(" · ")}</p>
        </div>
      );
    case "bullets":
      return (
        <div className="mt-1" {...sectionAttrs} {...clickable}>
          {block.items.map((item, i) => (
            <div
              key={`${i}-${item.slice(0, 12)}`}
              className="rb-keep my-1 grid gap-2 text-[12.5px]"
              style={{ gridTemplateColumns: "12px 1fr" }}
            >
              <span className="text-[var(--theme-dark)]">•</span>
              <span className="text-slate-800">{item}</span>
            </div>
          ))}
        </div>
      );
    case "kv":
      return (
        <div className="rb-keep my-2 text-[12px] text-slate-800" {...sectionAttrs} {...clickable}>
          <div className="mb-0.5 text-[10px] uppercase tracking-wider text-slate-500">{block.label}</div>
          <div className="break-all leading-relaxed">{block.value}</div>
        </div>
      );
    case "link":
      return (
        <a
          href={block.href}
          className="rb-keep block text-[12px] font-medium text-[var(--theme-primary)]"
          {...sectionAttrs}
          {...clickable}
        >
          {block.label}
        </a>
      );
    case "photo":
      return <img src={block.src} alt="" className="rb-keep mb-3 h-24 w-24 rounded-full object-cover" />;
    case "lineItem":
      return (
        <div className="rb-keep my-1 text-[12.5px]" {...sectionAttrs} {...clickable}>
          <span className="font-semibold">{block.text}</span>{" "}
          {block.muted ? <span className="text-slate-500">{block.muted}</span> : null}
        </div>
      );
    case "entry":
      return (
        <article className="rb-entry mb-3" {...sectionAttrs} {...clickable}>
          <div className="text-sm font-bold">{block.title}</div>
          {block.subtitle ? <div className="text-sm font-semibold text-slate-500">{block.subtitle}</div> : null}
          {block.meta ? <div className="text-xs text-slate-500">{block.meta}</div> : null}
          {block.subsections?.map((sec, i) => (
            <div key={i} className="rb-keep mt-2">
              {sec.title ? <div className="font-semibold">{sec.title}</div> : null}
              {sec.bullets.map((line, j) => (
                <div
                  key={j}
                  className="rb-keep my-1 grid gap-2 text-[12.5px]"
                  style={{ gridTemplateColumns: "12px 1fr" }}
                >
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
  pageCount = 1,
  showPageGuides = true,
  paperId = "a4",
  skillsDensity = "comfortable",
}: {
  doc?: ResumeDocument;
  ir: LayoutIr;
  zoom?: number;
  contentPadding?: number;
  fontScale?: number;
  onSectionClick?: (sectionId: string) => void;
  className?: string;
  pageCount?: number;
  showPageGuides?: boolean;
  paperId?: PaperId;
  skillsDensity?: SkillsDensity;
}) {
  const paper = PAPER_PRESETS[paperId] ?? PAPER_PRESETS.a4;

  // Classic sidebar: use the faithful DOM layout (matches the old builder / PDF look)
  if (ir.templateId === "sidebar" && doc) {
    return (
      <div
        className={`origin-top-left ${className}`}
        style={{ transform: `scale(${zoom})`, width: `calc(${paper.widthMm}mm * ${zoom})` }}
      >
        <ClassicSidebarSheet
          doc={doc}
          contentPadding={contentPadding}
          fontScale={fontScale}
          onSectionClick={onSectionClick}
          pageCount={pageCount}
          showPageGuides={showPageGuides}
          paperId={paperId}
          skillsDensity={skillsDensity}
        />
      </div>
    );
  }

  const page = ir.pages[0];
  if (!page) return null;
  const vars = themeCssVars(ir.themeId) as CSSProperties;
  const compact = ir.templateId === "compact";
  const pad = compact ? Math.max(24, contentPadding - 12) : contentPadding;

  return (
    <div
      className={`origin-top-left ${className}`}
      style={{
        ...vars,
        transform: `scale(${zoom})`,
        width: `calc(${paper.widthMm}mm * ${zoom})`,
      }}
      data-template={ir.templateId}
    >
      <div
        className={`sheet relative flex flex-col bg-white text-slate-900 shadow-lg ${
          compact ? "ats-compact" : "ats-standard"
        }`}
        data-page-count={pageCount}
        data-paper={paper.id}
        style={{
          width: `${paper.widthMm}mm`,
          minHeight: `${paper.heightMm}mm`,
          fontSize: `${fontScale}%`,
          padding: `${pad}px`,
        }}
      >
        <PageBreakGuides
          pages={pageCount}
          pageHeightMm={paper.heightMm}
          pageWidthMm={paper.widthMm}
          visible={showPageGuides}
        />
        <div className="relative z-[1]">
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
