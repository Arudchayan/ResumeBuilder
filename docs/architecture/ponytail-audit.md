# ponytail-audit — ResumeBuilder

Consolidated code-cleanup audit for the `ponytail-cleanup` branch.
Merged from draft notes `PONYTAIL_AUDIT_2.md` / `PONYTAIL_AUDIT_3.md` (2026-08-25).
Net: ~-1100 lines, -4 dependencies possible.

## Delete dead code

- `delete:` vector-PDF fallback (`stylesFor`, `PdfBlocks`, `exportPdfFromIr` + catch-fallback in `exportPdfBlob`) — WYSIWYG sheet capture handles every template; the fallback only fires when capture throws. Surface a toast error instead; drop `@react-pdf/renderer`. [packages/export/src/pdf/exportPdf.tsx:252-411]
- `delete:` root `/fixtures` dir — `arudchayan-resume.json` is byte-identical to the e2e copy, `sample-*.json` are referenced by nothing, `generate.mjs` is not wired into any script/CI. Point tests at `apps/web/e2e/fixtures`, delete the rest. [fixtures/, apps/web/e2e/fixtures/arudchayan-resume.json]
- `delete:` `packages/export/src/json/exportJson.ts` — `exportJsonString` duplicates storage's `exportResumeJson` verbatim; `irFingerprint` has no consumer outside its own parity test. Delete both + their tests. [packages/export/src/json/exportJson.ts, packages/export/src/__tests__/export.test.ts]
- `delete:` `MemoryStorage` shipped in prod source — sole consumer is its own test ("tests / SSR"; there is no SSR). Move into the test file. [packages/storage/src/index.ts:163-185]
- `delete:` dead IR/metric fields — `LayoutIr.sectionAnchors` (populated every build, never read), `SheetPageMetrics.fillsFirstPage` (computed, never displayed), `PaperPreset.jsPdfFormat` (never read; export passes `[w,h]` arrays), `TemplateManifest.atsFriendly`/`supportsPhoto` (metadata nothing consumes). [packages/templates/src/ir/documentToIr.ts:45,52-53, packages/templates/src/preview/paper.ts:9,17,31,56]
- `delete:` `customSections` schema field — `z.array(z.unknown())` persisted, defaulted, never rendered or read anywhere. [packages/core/src/schema/resume.ts:189, packages/core/src/schema/sections.ts:89]
- `delete:` dead store members — `exporting` state typed/set/never-read (EditorPage keeps its own), exported `authPort`/`aiPort` consts (zero consumers). [apps/web/src/lib/store.ts:26-27,39,78]
- `delete:` `getTemplate()` — exported finder with zero callers; EditorPage does `TEMPLATES.find(...)` inline. [packages/templates/src/ir/documentToIr.ts:343-345]

## Delete yagni abstractions

- `yagni:` whole `@resume/ports` package — `NullAuthPort`/`DisabledAiPort` constructed in store.ts but never read by any UI (Phase-B speculation per docs' own comments); `StoragePort`/`ResumeLibraryPort` have exactly one implementation. Move the two storage interfaces into `@resume/storage`, delete package + stub test (incl. saas-seams.md table rows). [packages/ports/src/index.ts, packages/ports/src/__tests__/ports.test.ts]
- `yagni:` `LocalResumeLibrary` wrapper — every method forwards to `IndexedDbStorage`; `duplicate()` has zero callers; store uses 4 of 6 methods. Call `IndexedDbStorage` + `blankResume()` directly from the store. [packages/storage/src/index.ts:113-151]

## Remove unnecessary dependencies

- `stdlib:` `immer` for one `produce()` call on a plain JSON document. `structuredClone(doc)` then mutate — kills the dep and the `Record<string, unknown>` casting dance. [packages/core/src/commands/applyCommand.ts:1,43]
- `native:` `file-saver` dep for two `saveAs(blob, name)` calls — the `URL.createObjectURL` + `a.click()` + revoke pattern is already hand-rolled in store.ts `exportJson`. Share that 6-line helper; drop `file-saver` + `@types/file-saver`. [packages/export/src/pdf/exportPdf.tsx:425, packages/export/src/docx/exportDocx.ts:240]
- `native:` `@dnd-kit/utilities` dep for one call — `CSS.Transform.toString(t)` ≈ `` t ? `translate(${t.x}px, ${t.y}px)` : undefined ``. Inline it. [apps/web/src/pages/EditorPage.tsx:80]
- `yagni:` `react-dom` declared as peer+devDep in `@resume/ui` and `@resume/templates` — neither package touches a react-dom API (no portal/root). Remove declarations; only the web app needs it. [packages/ui/package.json, packages/templates/package.json]

## Shrink exports

- `shrink:` deprecated `A4_PAPER` alias ("kept for existing imports") — swap PageBreakGuides defaults to `PAPER_PRESETS.a4`, drop alias from exports. [packages/templates/src/preview/paper.ts:24-25]
- `shrink:` over-exports — `Label` only ever rendered inside `primitives.tsx` itself (unexport), `defaultTheme` has zero consumers (unexport). [packages/ui/src/components/primitives.tsx:27, packages/ui/src/tokens/themes.ts:69]
