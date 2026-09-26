# Ponytail Audit 1 — 2026-08-26

Scope: whole tree (src only; `dist/` untracked, verified via `git ls-files`). Every finding below
carries the exact proof command. Config/docs/workflows excluded per rules.

## Findings (ranked)

1. `delete:` Dead devDependency `vitest@^4.1.11` in `packages/export` — the package ships zero test
   files (`find packages/export -name "*.test.*" -o -name "*.spec.*"` → nothing) and zero vitest
   imports (`grep -rn "vitest" packages/export/src` → no matches). Sibling packages keep theirs;
   this one never got tests. Cut the entry from `packages/export/package.json`.
   Proof: `grep -rn "vitest" packages/export --include="*.ts"` → 0 hits in src.
   [packages/export/package.json]

2. `yagni:` Unused exports — types/constants exported but with zero importers anywhere in the repo
   (each is still used *inside its own file*, so remove only the `export` keyword, not the code).
   Proof pattern: `grep -rn --include='*.ts' --include='*.tsx' "\b<Name>\b" apps packages | grep -v node_modules | grep -v '/dist/'`
   shows hits only in the defining file:
   - `ResumeMeta` — [packages/storage/src/index.ts:50]
   - `IrColumn`, `TemplateManifest` — [packages/templates/src/ir/documentToIr.ts:25,36]
   - `ThemeId` — [packages/ui/src/tokens/themes.ts:62]
   - `linkSchema`, `jobSectionSchema`, `jobSchema`, `educationSchema`, `certSchema`,
     `projectSchema`, `languageSchema`, `publicationSchema`, `awardSchema`, `TEMPLATE_IDS`,
     `resumeSchema` — all consumed only within [packages/core/src/schema/resume.ts]; none appear
     in `core/src/index.ts`, so their module-level `export` is unreachable surface.

## Checked and alive (not findings)

- All 6 workspace deps (`@resume/{core,export,storage,templates,ui}`) have importers in apps/web.
- Every npm dep resolves to ≥1 real usage: `docx` (exportDocx.ts:17), `zod` (resume.ts),
  `zustand` (store.ts), `sonner` (main/Gallery/Editor), `lucide-react` (all 17 imported icons
  render in EditorPage/SectionEditor), `fake-indexeddb` (storage.test.ts:1),
  `@playwright/test` (e2e + config), `tailwindcss`/`@tailwindcss/vite` (styles.css:1 +
  vite.config.ts), `@vitejs/plugin-react`, `react(-dom)`, `typescript`.
- No unreferenced files: every file under apps/web/src and packages/*/src is reachable from
  `main.tsx` or a package barrel / test runner include (`vitest.config.ts`).
- All barrel exports in packages/{core,templates,ui}/src/index.ts have external callers
  (`grep -rn "<symbol>" apps/web/src` → ≥1 hit each); earlier audit rounds already pruned the rest.
- `packages/*/dist/` and `test-results/` are gitignored, not tracked — no artifact debt.

net: -0 lines, -1 dep possible.
