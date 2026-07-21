# Resume Forge

A state-of-the-art, **local-first** resume builder: template gallery, section editor, live preview, and vector PDF / DOCX export from a shared layout model.

**Stack:** React 19 · TypeScript · Vite 6 · Tailwind 4 · pnpm workspaces · Zod · IndexedDB · `@react-pdf/renderer` · Playwright

Live demo (GitHub Pages): configure `base` in `apps/web/vite.config.ts` to match your repo path (default `/ResumeBuilder/`).

## Monorepo

```
apps/web              UI (gallery + editor)
packages/core         Schema, commands, history
packages/templates    Layout IR + 3 templates + React preview
packages/export       PDF / DOCX / JSON from IR
packages/storage      StoragePort + IndexedDB + legacy migrator
packages/ports        AuthPort / AiPort stubs for future SaaS
packages/ui           Design tokens + primitives
docs/architecture     Growth seams + delivery phases
```

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000/ResumeBuilder/
pnpm test
pnpm build
```

## Features

- Three templates: ATS single-column, Classic sidebar, Compact modern
- Live preview with zoom / fit; click preview sections to focus the editor
- Autosave to IndexedDB; migrates legacy `localStorage.resume_draft`
- Undo/redo that does **not** steal native text-field undo
- Export JSON, vector PDF, and DOCX from the same IR
- Privacy-first: no accounts, no server uploads

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web app |
| `pnpm build` | Build packages + web |
| `pnpm test` | Unit tests (all packages) |
| `pnpm test:e2e` | Playwright smoke tests |
| `pnpm typecheck` | TypeScript across workspace |

## Documentation

- [Delivery phases (Phase 0–6 checklist)](docs/architecture/delivery-phases.md)
- [SaaS growth seams (Phase B)](docs/architecture/saas-seams.md)

## Migration from v1

On first load, if `localStorage.resume_draft` exists it is validated, mapped (`modern` → `sidebar`), saved to IndexedDB, and marked migrated.

## License

MIT
