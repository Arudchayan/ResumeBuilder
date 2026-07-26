# Delivery phases — Resume Forge rewrite

This rewrite was delivered in six shippable phases. **All Phase A items are complete** in the monorepo on `main` (via PR #9).

## Phase 0 — Monorepo foundation ✅

- pnpm workspaces (`apps/web`, `packages/*`)
- TypeScript strict base config
- Root scripts: `dev`, `build`, `test`, `typecheck`, `test:e2e`
- Port interface stubs in `@resume/ports`

**Verify:** `pnpm install && pnpm typecheck`

## Phase 1 — Core + storage ✅

- `@resume/core`: Zod schema, immer commands, undo/redo history
- `@resume/storage`: IndexedDB adapter, memory adapter (tests), legacy `localStorage.resume_draft` migrator
- Unit tests: `packages/core`, `packages/storage`

**Verify:** `pnpm --filter @resume/core test && pnpm --filter @resume/storage test`

## Phase 2 — Template engine + 3 templates ✅

- Layout IR (`documentToIr`) shared by preview and export
- Templates: **ATS**, **Classic Sidebar**, **Compact Modern**
- React preview with zoom, theme tokens, click-to-focus section anchors

**Verify:** `pnpm --filter @resume/templates test`

## Phase 3 — Editor UX ✅

- Template gallery (brand-first entry)
- Section TOC with single DnD reorder surface + visibility toggles
- Focused section forms (identity, photo, contact, skills, employment, lists)
- Autosave + undo/redo that respects focused inputs
- Mobile edit/preview toggle + export on preview pane

**Verify:** `pnpm dev` → gallery → start blank → edit → preview updates live

## Phase 4 — Export parity ✅

- Vector PDF via `@react-pdf/renderer`
- DOCX via `docx` from same IR
- JSON import/export
- Fixture resumes in `fixtures/` + IR fingerprint tests

**Verify:** `pnpm --filter @resume/export test`

## Phase 5 — Polish + quality ✅

- Skip link, landmarks, dialog focus trap, labeled fields
- Product modals (About, Privacy, Shortcuts)
- Playwright smoke (gallery + editor)
- CI gates: typecheck, unit tests, build, e2e before Pages deploy

**Verify:** `pnpm test:e2e`

## Phase 6 — SaaS readiness (stubs only) ✅

- `NullAuthPort`, `DisabledAiPort`, `ResumeLibraryPort` local implementation
- Architecture doc: [`saas-seams.md`](./saas-seams.md)
- **Not built:** accounts, cloud sync, AI — Phase B

**Verify:** `pnpm --filter @resume/ports test`

---

## Phase B (future, out of scope)

| Capability | Status |
|------------|--------|
| User accounts / OAuth | Not started — use `AuthPort` |
| Cloud sync | Not started — new `StoragePort` adapter |
| AI bullet suggestions | Not started — wire `AiPort` |
| Template marketplace | Not started |

## Success criteria checklist (Phase A)

- [x] Preview, PDF, and DOCX consume the same IR
- [x] Three templates shipped
- [x] No god component; packages have focused responsibilities
- [x] Core logic unit-tested without DOM
- [x] Keyboard undo defers inside text fields
- [x] Offline edit + export after first load
- [x] Adding a 4th template = template package only
- [x] Legacy v1 draft migration path
