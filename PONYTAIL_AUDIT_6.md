# ponytail-audit 6 — ResumeBuilder

1. `delete:` orphaned `packages/ports/` tree — dist-only residue (`index.js` 13 lines + `index.d.ts` 49) with no `package.json`, no `src/`, untracked by git, and zero `@resume/ports` references anywhere after the ports package was removed. Delete the directory. [packages/ports/]
2. `yagni:` six-entry `resolve.alias` block in vite config duplicating workspace resolution — every `@resume/*` package.json already maps `exports` to `./src/index.ts` (and `./styles.css`), which Vite resolves through the pnpm symlinks. Delete the whole `resolve.alias` block. [apps/web/vite.config.ts:9-33]
3. `yagni:` manifest script ceremony in five library packages — `lint` byte-identical to `typecheck` (×6 including web), `build: tsc -p` emitting `dist/` nothing consumes (exports point at src), per-package `test` shadowed by the root vitest include. Keep one `typecheck` per package. [packages/*/package.json]
4. `shrink:` `buildSidebarBlocks()` wrapper — called once, just destructure-renames two `buildColumn()` calls. Inline `{ aside: buildColumn(doc,"aside"), main: buildColumn(doc,"main") }` at the call site. [packages/templates/src/ir/documentToIr.ts:53-58,255]
5. `native:` `react-dom` devDeps in `@resume/ui` and `@resume/templates` — neither package touches a react-dom API (no portals/roots; grep-clean). Remove both declarations. [-2 deps] [packages/ui/package.json, packages/templates/package.json]
6. `native:` `"@resume/ui": "workspace:*"` dependency in `@resume/export` — exportDocx imports only docx/@resume/core/@resume/templates; ui is reached transitively at worst. Delete the line. [-1 dep] [packages/export/package.json]
7. `delete:` duplicate skip-to-content link — App.tsx already renders `<a href="#main">` targeting the same editor `#main` element; EditorPage's copy makes two consecutive skip links. Keep App's. [apps/web/src/pages/EditorPage.tsx:328-330]
8. `delete:` `.env.example` documenting `VITE_SOURCE_URL` — no `import.meta.env` read anywhere in src; the About modal hardcodes its text. Delete the file. [.env.example]

net: -118 lines, -3 deps possible.
