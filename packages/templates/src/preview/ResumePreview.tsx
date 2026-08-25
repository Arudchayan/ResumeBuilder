import type { CSSProperties, KeyboardEvent } from "react";
import type { LayoutIr, IrBlock } from "../ir/documentToIr.js";
import { themeCssVars } from "@resume/ui";
import { PageBreakGuides } from "./PageBreakGuides.js";
import { PAPER_PRESETS, type PaperId } from "./paper.js";

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
    case "chips": {
      const items = (block.items as string[]).map((s) => s.trim()).filter(Boolean);
      return (
        <div className="rb-section mt-1" {...sectionAttrs} {...clickable}>
          <p className="skills-compact text-[11px] leading-snug text-slate-800">{items.join(" · ")}</p>
        </div>
      );
    }
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
          target="_blank"
          rel="noreferrer noopener"
          onClick={(e) => e.stopPropagation()}
          className="rb-keep block text-[12px] font-medium hover:underline text-[var(--theme-primary)]"
          {...sectionAttrs}
          {...clickable}
        >
          {block.label}
        </a>
      );
    case "photo":
      return (
        <img src={block.src} alt="" className="rb-keep mb-6 mx-auto h-28 w-28 rounded-full border object-cover shadow-sm" />
      );
    case "lineItem":
      return (
        <div className="rb-keep my-1 text-[12.5px]" {...sectionAttrs} {...clickable}>
          <span className="font-semibold">{block.text}</span>{" "}
          {block.muted ? <span className="text-slate-500">{block.muted}</span> : null}
        </div>
      );
    case "entry": {
      const isCompactEntry = Boolean(block.url);
      return (
        <article className={`rb-entry ${isCompactEntry ? "my-1.5" : "mb-3"}`} {...sectionAttrs} {...clickable}>
          <div className={isCompactEntry ? "font-semibold text-[12.5px]" : "text-sm font-bold"}>
            {block.title}
            {isCompactEntry && block.url ? (
              <a
                href={normalizeUrl(block.url)}
                target="_blank"
                rel="noreferrer noopener"
                className="ml-1 text-xs hover:underline"
                style={{ color: "var(--theme-primary)" }}
                onClick={(e) => e.stopPropagation()}
              >
                ↗
              </a>
            ) : null}
          </div>
          {block.subtitle ? <div className="text-slate-600">{block.subtitle}</div> : null}
          {block.meta ? (
            <div className={isCompactEntry ? "text-slate-600" : "text-xs text-slate-500"}>{block.meta}</div>
          ) : null}
          {block.subsections?.map((sec, i) => (
            <div key={i} className="rb-keep mt-2">
              {sec.title ? <div className="mt-1 font-semibold text-slate-900">{sec.title}</div> : null}
              {sec.bullets.map((line, j) => (
                <div
                  key={j}
                  className="rb-keep my-1 grid gap-2 text-[12.5px]"
                  style={{ gridTemplateColumns: "12px 1fr" }}
                >
                  <span style={{ color: "var(--theme-dark)" }}>•</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          ))}
          {block.body?.map((line, i) => (
            <div key={i} className="mt-1 text-[12.5px]">
              {line}
            </div>
          ))}
        </article>
      );
    }
    default: {
      const _exhaustive: never = block;
      void _exhaustive;
      return null;
    }
  }
}

/** Classic two-column sheet rendered straight from the IR (same blocks DOCX consumes). */
export function ResumePreview({
  ir,
  zoom = 1,
  contentPadding = 48,
  fontScale = 100,
  onSectionClick,
  className = "",
  pageCount = 1,
  showPageGuides = true,
  paperId = "a4",
}: {
  ir: LayoutIr;
  zoom?: number;
  contentPadding?: number;
  fontScale?: number;
  onSectionClick?: (sectionId: string) => void;
  className?: string;
  pageCount?: number;
  showPageGuides?: boolean;
  paperId?: PaperId;
}) {
  const paper = PAPER_PRESETS[paperId] ?? PAPER_PRESETS.a4;

  const page = ir.pages[0];
  if (!page) return null;
  const vars = themeCssVars(ir.themeId) as CSSProperties;
  const isSidebar = ir.templateId === "sidebar";
  const pad = contentPadding;

  const renderColumn = (blocks: IrBlock[], key: string) =>
    blocks.map((block, idx) => (
      <BlockView
        key={`${key}-${idx}-${block.type}`}
        block={block}
        onSectionClick={onSectionClick}
        compact={ir.templateId === "compact"}
      />
    ));

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
        className={`sheet relative bg-white text-slate-900 shadow-lg ${
          isSidebar ? "border" : "flex flex-col"
        }`}
        data-page-count={pageCount}
        data-paper={paper.id}
        style={{
          width: `${paper.widthMm}mm`,
          minHeight: `${paper.heightMm}mm`,
          fontSize: `${fontScale}%`,
          ...(isSidebar
            ? {}
            : {
                padding: `${pad}px`,
                ...(ir.templateId === "compact" ? {} : {}),
              }),
        }}
      >
        <PageBreakGuides
          pages={pageCount}
          pageHeightMm={paper.heightMm}
          pageWidthMm={paper.widthMm}
          visible={showPageGuides}
        />
        {isSidebar ? (
          <div
            className="sheet-grid relative z-[1] grid"
            style={{ gridTemplateColumns: "30% 1fr", minHeight: `${paper.heightMm}mm` }}
          >
            <aside
              className="border-r"
              style={{
                padding: `${pad}px ${pad * 0.667}px`,
                background:
                  "linear-gradient(180deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%)",
              }}
            >
              {page.columns.find((c) => c.id === "aside")?.blocks.map((block, idx) => (
                <BlockView
                  key={`aside-${idx}-${block.type}`}
                  block={block}
                  onSectionClick={onSectionClick}
                />
              ))}
            </aside>
            <main style={{ padding: `${pad}px` }}>
              {renderColumn(page.columns.find((c) => c.id === "main")?.blocks ?? [], "main")}
            </main>
          </div>
        ) : (
          <div className="relative z-[1]">
            {renderColumn(page.columns[0]?.blocks ?? [], "main")}
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeUrl(url?: string) {
  const raw = (url || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function TemplateThumb({
  accent,
}: {
  accent: string;
}) {
  return (
    <div
      className="aspect-[210/297] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      style={{ borderTopColor: accent, borderTopWidth: 4 }}
    >
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
    </div>
  );
}
