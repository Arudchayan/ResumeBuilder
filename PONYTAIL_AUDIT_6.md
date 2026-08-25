# ponytail-audit 6 — ResumeBuilder

1. `delete:` stale `dist/` output trees committed under `packages/*/dist` (core, export, storage, templates, ui — plus orphaned `ports/dist`) from before audit 5 pointed exports at `src/index.ts`; nothing consumes them and they drift silently. Delete; `dist/` is already gitignored. [packages/core/dist, packages/export/dist, packages/storage/dist, packages/templates/dist, packages/ui/dist]
2. `native:` hand-rolled dialog focus trap in `Dialog` — 30-line useEffect cycling focusable elements, Escape handler, backdrop `<button>`. Native `<dialog>` + `showModal()` gives focus trap, Escape, and `::backdrop` free. [packages/ui/src/components/primitives.tsx:86-156]
3. `shrink:` `chips` IrBlock variant — every renderer flattens it to joined text anyway (preview joins with " · ", docx joins with " · ", compact path emits plain paragraph). Emit `paragraph` from documentToIr; delete the union member and both render branches. [packages/templates/src/ir/documentToIr.ts:9,97,250, packages/templates/src/preview/ResumePreview.tsx:68-75, packages/export/src/docx/exportDocx.ts:50-57]
4. `yagni:` `LayoutIr.pages` array — `documentToIr` always returns exactly one page; pagination happens in DOM/CSS (measureSheetPages, print). Flatten to `columns: IrColumn[]`, delete `IrPage`, update the `ir.pages[0]` consumers. [packages/templates/src/ir/documentToIr.ts:31-39,256-281, packages/templates/src/preview/ResumePreview.tsx:186, packages/export/src/docx/exportDocx.ts:196-207]
5. `yagni:` `Label` component exported but internal-only — Field renders it; no other file uses it. Unexport (keep inline for Field). [packages/ui/src/components/primitives.tsx:27-41, packages/ui/src/index.ts:2]
6. `delete:` `IndexedDbStorage.delete()` — zero callers anywhere (gallery offers no delete UI). Nothing. [packages/storage/src/index.ts:107-115]
7. `shrink:` `PageBreakGuides` renders three parallel `.map` loops over the same edges array (bands, indicators, badges). One loop emitting all three elements. [packages/templates/src/preview/PageBreakGuides.tsx:23-68]
8. `delete:` no-op spread `...(ir.templateId === "compact" ? {} : {})` — both branches empty. Nothing. [packages/templates/src/preview/ResumePreview.tsx:226]
9. `yagni:` speculative core re-exports with no external consumers — `type Job`, `type Project`, `getDefaultVisibility`, `getDefaultSectionOrder` are only used inside core. Trim `index.ts` to what's imported. [packages/core/src/index.ts]
10. `shrink:` `crypto.randomUUID?.() ?? \`${prefix}-${Date.now()}\``-style fallback armor — `randomUUID` is baseline in every supported browser. Plain `crypto.randomUUID()` where remnants remain. [packages/storage/src/index.ts:41]

net: -120 lines, -0 deps possible.
