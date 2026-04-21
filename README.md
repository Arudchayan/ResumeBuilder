# Resume Builder

A **client-only** résumé product: your content is edited and stored in the browser (with optional JSON backup). There is no sign-in and no server-side storage of your résumé text in the default deployment.

Built with React and Vite. Edit in a structured form, preview in real time, and export to PDF or Microsoft Word (DOCX). The app shell includes **About**, **Privacy**, and **Shortcuts** so users understand how data is handled.

**Live demo:** [https://Arudchayan.github.io/ResumeBuilder/](https://Arudchayan.github.io/ResumeBuilder/)

## Features

- Live preview with print-oriented styling
- JSON import and export
- PDF export (multi-page) and DOCX export
- Drag-and-drop section order and per-section visibility
- Automatic draft persistence in the browser (localStorage) with undo/redo
- Input sanitization (DOMPurify), URL validation, and image upload checks

## Stack

- React 18, Vite 5, Tailwind CSS
- jsPDF, html2canvas, `docx`, `@dnd-kit`, Zod, Sonner

## Prerequisites

- Node.js 18 or newer
- npm

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Opens the dev server (default: `http://localhost:3000`).

## PDF vs browser print

- **Export to PDF** (toolbar) rasterizes the live preview with **html2canvas** and builds a file with **jsPDF** (multi-page when content overflows).
- **Browser Print** (your browser’s print dialog) uses the same **paper size** (A4 / Letter / Legal) for `@page` as the preview selector, though exact print behavior varies by browser.

## Optional end-to-end smoke test

```bash
npx playwright install
npm run test:e2e
```

This starts the Vite dev server automatically (see `playwright.config.cjs`) and runs a minimal load check under `tests/e2e/`. The dev URL uses the same **`/ResumeBuilder/`** base path as production (GitHub Pages); Playwright is configured with a trailing slash because Vite returns **404** without it.

## Production build

```bash
npm run build
```

Output is written to `dist/`.

## Scripts (CI-friendly)

```bash
npm run lint
npm test -- --run
npm run build
```

## Usage

1. Optionally use **Load sample resume** to populate example data.
2. Edit sections in the left panel (identity, contact, experience, projects, and other blocks).
3. Export via **Export JSON**, **Export to PDF**, or **Export to DOCX** as needed.

## Deployment (GitHub Pages)

The repository includes a workflow at `.github/workflows/deploy.yml` that builds and publishes the `dist/` output on pushes to `main`. Set `base` in `vite.config.js` to match your GitHub Pages path (for example `/ResumeBuilder/`).

## Security

- User-entered text is sanitized before rendering.
- Only `http` and `https` URLs are accepted for links; other schemes are rejected.
- Uploaded images are restricted by type, size (≤ 5 MB), and dimensions (100–4000 px).

## License

MIT
