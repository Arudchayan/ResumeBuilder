# Resume Forge — SaaS growth seams

Phase A ships a **local-first** app. These ports exist so Phase B (accounts, sync, AI) can land without rewriting the editor, templates, or export pipeline.

## Ports

| Port | Package | Phase A behavior | Phase B |
|------|---------|------------------|---------|
| `StoragePort` | `@resume/ports` + `@resume/storage` | `IndexedDbStorage` | `CloudStorage` implementing same interface |
| `ResumeLibraryPort` | `@resume/storage` `LocalResumeLibrary` | Multi-resume in IDB | Server-backed library + sync |
| `AuthPort` | `@resume/ports` `NullAuthPort` | `getSession()` → `null` | OAuth / magic link |
| `AiPort` | `@resume/ports` `DisabledAiPort` | `isEnabled()` → `false` | Bullet suggest / rewrite |

## Wiring today

`apps/web/src/lib/store.ts` constructs:

- `IndexedDbStorage` / `LocalResumeLibrary`
- `authPort = new NullAuthPort()`
- `aiPort = new DisabledAiPort()`

UI should gate AI affordances on `aiPort.isEnabled()`. Auth UI should render only when `getSession()` is non-null or a feature flag is on.

## Adding cloud sync later

1. Implement `CloudStorage implements StoragePort` (load/save/list/delete against API).
2. Optionally wrap local + cloud in a syncing adapter (offline queue).
3. Swap construction in the store — **no changes** to `@resume/templates` or `@resume/export`.
4. Add auth session to attach `userId` to resume metadata.

## Adding a fourth template

1. Add id to `TEMPLATE_IDS` in `@resume/core`.
2. Add manifest + IR branch in `@resume/templates`.
3. Ensure PDF/DOCX consume IR only (already true) — export core unchanged.
