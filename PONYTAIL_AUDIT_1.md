# ponytail-audit — ResumeBuilder

1. `yagni:` vector-PDF fallback (`stylesFor` + `PdfBlocks` + `exportPdfFromIr`) behind a try/catch that almost never runs. Delete; let sheet capture fail loudly (or fall back to browser print). Drops `@react-pdf/renderer`. [packages/export/src/pdf/exportPdf.tsx]
2. `yagni:` entire `@resume/ports` package — speculative `AuthPort`/`NullAuthPort`/"Future SaaS auth" and `AiPort`/`DisabledAiPort` that nothing ever calls. Delete package + its test; drop imports from store. [packages/ports/src/index.ts, apps/web/src/lib/store.ts:19-21]
3. `yagni:` `LocalResumeLibrary` wrapper that only delegates every method to `StoragePort`. Fold `duplicate`/`create` into `IndexedDbStorage` and keep one interface. [packages/storage/src/index.ts:106-151, packages/ports/src/index.ts:44-60]
4. `native:` `file-saver` (+`@types/file-saver`). Replace `saveAs(blob, name)` with `URL.createObjectURL` + `<a download>` click — store.ts already does exactly this. [packages/export/src/pdf/exportPdf.tsx:425, packages/export/src/docx/exportDocx.ts:240]
5. `native:` `immer` for one `produce()` call. Use `structuredClone(doc)`, mutate the clone, return it. [packages/core/src/commands/applyCommand.ts:1,43]
6. `delete:` duplicate JSON helpers `exportJsonString` + `irFingerprint` — `exportResumeJson`/`importResumeJson` already live in storage, and fingerprint serves only the deleted vector-parity test. [packages/export/src/json/exportJson.ts]
7. `delete:` `MemoryStorage` shipped in prod source but used only by its own test. Move into the test file. [packages/storage/src/index.ts:163-185]
8. `shrink:` six near-identical 5-9-line `vitest.config.ts` files. One root config (`environment: "node"`, excludes) run via `pnpm -r` or workspace projects. [packages/*/vitest.config.ts, apps/web/vitest.config.ts]
9. `delete:` `A4_PAPER` alias self-marked `@deprecated` — only internal consumer is `PageBreakGuides`; use `PAPER_PRESETS.a4`. [packages/templates/src/preview/paper.ts:25]
10. `delete:` dead exports never imported anywhere: `isSectionEmpty`, `resumeSchema`/`validateResumeData` (callers use `parseResumeData`), and `PdfExportOptions.name` which is written (`{name: doc.name}`) but never read. [packages/core/src/index.ts, packages/export/src/pdf/exportPdf.tsx]

net: -360 lines, -4 deps possible.
