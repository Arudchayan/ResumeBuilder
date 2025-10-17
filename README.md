# Resume Builder

A modern, interactive Resume Builder built with React. Edit your resume with an intuitive editor, see a live preview, and export to PDF or DOCX.

Badges: React 18.3.1 • Tailwind 3.4.3 • Vite 5 • MIT

Live Demo
- https://Arudchayan.github.io/ResumeBuilder/

Features
- Live preview with professional layout and print styles
- Import/Export JSON, multi-page PDF export, and DOCX export
- Drag-and-drop section ordering, toggle section visibility
- Auto-save to localStorage, undo/redo with shortcuts
- Strong input sanitization (XSS-safe), image and URL validation

Tech Stack
- React + Vite + Tailwind CSS
- jsPDF + html2canvas, docx, lucide-react, sonner, @dnd-kit

Quick Start
- Prereqs: Node 18+ and npm
- Install: `npm install`
- Dev: `npm run dev` (opens http://localhost:3000)
- Build: `npm run build` → outputs to `dist/`

Usage
- Load Sample: Click “Load Sample”
- Edit: Use the left panel to edit sections (identity, contact, skills, jobs, projects, certs, education, etc.)
- Export: “Export JSON”, “Export to PDF”, or “Export to DOCX”

Deployment (GitHub Pages)
- This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`
- Push to `main` to build and deploy to Pages
- Ensure Vite base in `vite.config.js` matches your repo path (e.g., `/ResumeBuilder/`)

Security
- All text is sanitized with DOMPurify
- Only http/https links are allowed; other protocols are blocked
- Image uploads validated (type, size ≤ 5MB, dimensions 100–4000px)

Documentation
- Summary: FINAL_SUMMARY.md
- Improvements: IMPROVEMENTS_SUMMARY.md
- Implementation Plan: IMPLEMENTATION_PLAN.md
- Functional Evaluation: FUNCTIONAL_IMPROVEMENTS_EVALUATION.md
