# ponytail-audit 10 — ResumeBuilder

yagni: six-package pnpm workspace (5 extra package.json/tsconfig/barrel files) for one private, never-published app whose packages import src directly with zero build isolation. Single Vite app with folders under src/, one tsconfig. [pnpm-workspace.yaml, packages/*/package.json, packages/*/tsconfig.json]

native: zustand store for two screens' shared state, forcing 20 per-field selector hooks across EditorPage/GalleryPage/App. React useReducer + context (built in), one value per screen. [-1 dep] [apps/web/src/lib/store.ts]

yagni: 5-case ResumeCommand union + setByPath dot-path walker + ArrayKey plumbing — commands are never serialized or replayed, every call site hand-builds {type,path,value} objects typed unknown. Pass a mutate-the-draft callback: apply(d => { d.name = v }); structuredClone stays inside dispatch. [packages/core/src/commands/applyCommand.ts, apps/web/src/components/SectionEditor.tsx]

delete: entire skills-density feature — state, effect sync, "Compact skills" button highlight, reset hook, and defaultSkillsDensity/SkillsDensity exports; no renderer or IR path reads density, the toggle changes nothing visible. Nothing. [apps/web/src/pages/EditorPage.tsx:145,165-167,265,305,642-648,669, packages/templates/src/preview/layoutAssist.ts:3-8]

delete: dependabot group patterns matching zero manifests (@radix-ui/*, @emotion/*, @testing-library/*, jsdom, postcss*, autoprefixer, @eslint/*, eslint*, husky, commitlint, lint-staged, cz-*). Trim groups to react-vendor/build-tools/testing over real deps only. [.github/dependabot.yml]

delete: duplicate .skip-to-content position/focus rules — ui's copy loads first and web's identical copy overrides it; two sources of truth for one link style. Keep apps/web's (loads last). [packages/ui/src/styles.css:64-77]

delete: Field's error/errorId/aria-invalid/aria-describedby plumbing and alert <p> — zero callers pass error anywhere. Label + input/textarea only. [packages/ui/src/components/primitives.tsx:37-76]

shrink: ui's parallel font system (--font-body/--font-display vars + .font-display/.font-body classes) sitting beside web's @theme which already generates the same utilities. Drop ui's defs; point the body rule at var(--font-sans). [packages/ui/src/styles.css:5-6,20-27]

shrink: TocItem's twin near-identical up/down grip buttons. Map over [-1, 1]. [apps/web/src/pages/EditorPage.tsx:68-87]

yagni: overlapping one-page flows — "Fit to 1 page" (fitToPages(1)) is a strict subset of "1-page mode" (hide sections + fitToPages(1)). Keep one button doing both. [apps/web/src/pages/EditorPage.tsx:635-662]

delete: dead store action loadDocument — declared and implemented, zero callers (import/load paths go through createHistory directly). Nothing. [apps/web/src/lib/store.ts:41,153-156]

yagni: IndexedDbStorage.create(template) — one caller, 4-line wrapper around blankResume + own save. Inline blankResume({ template }) + save in store.startBlank. [packages/storage/src/index.ts:103-107]

delete: .rb-section selectors in both break-inside rules — no element emits class rb-section since the IR renderers landed. Drop the selector from each rule. [apps/web/src/styles.css:590,982]

delete: barrel re-exports LayoutIr/IrColumn — no importer outside the templates package (export consumes only IrBlock via documentToIr). Internal types only. [packages/templates/src/index.ts:4-5]

net: -300 lines, -1 deps possible.
