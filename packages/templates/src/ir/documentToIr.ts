import type { ResumeDocument, TemplateId } from "@resume/core";
import { ensureSectionOrder } from "@resume/core";

/** Intermediate representation shared by preview, PDF, and DOCX. */
export type IrBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string; sectionId?: string }
  | { type: "accentBar"; sectionId?: string }
  | { type: "paragraph"; text: string; muted?: boolean; sectionId?: string }
  | { type: "bullets"; items: string[]; sectionId?: string }
  | { type: "chips"; items: string[]; sectionId?: string }
  | { type: "kv"; label: string; value: string; href?: string; sectionId?: string }
  | { type: "link"; label: string; href: string; sectionId?: string }
  | { type: "photo"; src: string; sectionId?: string }
  | {
      type: "entry";
      title: string;
      subtitle?: string;
      meta?: string;
      /** Optional bold subsection titles paired with following bullets */
      subsections?: { title?: string; bullets: string[] }[];
      body?: string[];
      url?: string;
      /** Compact single-line style (certs / edu) */
      compact?: boolean;
      sectionId?: string;
    }
  | { type: "lineItem"; text: string; muted?: string; sectionId?: string }
  | { type: "spacer"; size: "sm" | "md"; sectionId?: string };

export interface IrColumn {
  id: string;
  width: number;
  blocks: IrBlock[];
}

export interface IrPage {
  columns: IrColumn[];
}

export interface LayoutIr {
  templateId: TemplateId;
  paper: { widthMm: number; heightMm: number };
  themeId: string;
  pages: IrPage[];
  sectionAnchors: string[];
}

export interface TemplateManifest {
  id: TemplateId;
  name: string;
  description: string;
  atsFriendly: boolean;
  supportsPhoto: boolean;
  previewAccent: string;
}

function visible(doc: ResumeDocument, id: string) {
  return doc.sectionVisibility?.[id] !== false;
}

function dateRange(start?: string, end?: string) {
  if (!start && !end) return "";
  return [start, end].filter(Boolean).join(" — ");
}

/** Classic sidebar: aside = photo/details/links/skills; main = identity + ordered content. */
function buildSidebarBlocks(doc: ResumeDocument): { aside: IrBlock[]; main: IrBlock[] } {
  const aside: IrBlock[] = [];
  const main: IrBlock[] = [];

  if (visible(doc, "photo") && doc.photo.enabled && (doc.photo.dataUrl || doc.photo.url)) {
    aside.push({ type: "photo", src: doc.photo.dataUrl || doc.photo.url, sectionId: "photo" });
  }

  if (visible(doc, "contact")) {
    aside.push({ type: "heading", level: 2, text: "Details", sectionId: "contact" });
    if (doc.contact.location) {
      aside.push({ type: "kv", label: "Location", value: doc.contact.location, sectionId: "contact" });
    }
    if (doc.contact.phone) {
      aside.push({
        type: "kv",
        label: "Phone",
        value: doc.contact.phone,
        href: `tel:${doc.contact.phone.replace(/[^\d+]/g, "")}`,
        sectionId: "contact",
      });
    }
    if (doc.contact.email) {
      aside.push({
        type: "kv",
        label: "Email",
        value: doc.contact.email,
        href: `mailto:${doc.contact.email}`,
        sectionId: "contact",
      });
    }

    const links = doc.links.filter((l) => l.url && l.label);
    if (links.length) {
      aside.push({ type: "heading", level: 2, text: "Links", sectionId: "contact" });
      for (const link of links) {
        aside.push({ type: "link", label: link.label, href: link.url, sectionId: "contact" });
      }
    }
  }

  if (visible(doc, "skills") && doc.skills.length) {
    aside.push({ type: "heading", level: 2, text: "Skills", sectionId: "skills" });
    aside.push({ type: "chips", items: doc.skills, sectionId: "skills" });
  }

  // Main column header (classic)
  if (visible(doc, "identity")) {
    main.push({ type: "heading", level: 1, text: doc.name || "Your Name", sectionId: "identity" });
    if (doc.headline) {
      main.push({ type: "paragraph", text: doc.headline, muted: true, sectionId: "identity" });
    }
    main.push({ type: "accentBar", sectionId: "identity" });
    if (doc.summary) {
      main.push({ type: "heading", level: 2, text: "Profile", sectionId: "identity" });
      main.push({ type: "paragraph", text: doc.summary, sectionId: "identity" });
    }
  }

  const asideOnly = new Set(["identity", "photo", "contact", "skills"]);
  const order = ensureSectionOrder(doc).filter((id) => !asideOnly.has(id));

  for (const sectionId of order) {
    if (!visible(doc, sectionId)) continue;
    switch (sectionId) {
      case "employment":
        if (!doc.jobs.length) break;
        main.push({ type: "heading", level: 2, text: "Employment History", sectionId });
        for (const job of doc.jobs) {
          main.push({
            type: "entry",
            title: job.role,
            subtitle: [job.company, job.location].filter(Boolean).join(", "),
            meta: dateRange(job.start, job.end),
            subsections: (job.sections || []).map((s) => ({
              title: s.title || undefined,
              bullets: (s.bullets || []).filter((b) => b && b.trim()),
            })),
            sectionId,
          });
        }
        break;
      case "projects":
        if (!doc.projects.length) break;
        main.push({ type: "heading", level: 2, text: "Projects", sectionId });
        for (const p of doc.projects) {
          main.push({
            type: "entry",
            title: p.title,
            meta: dateRange(p.start, p.end),
            body: [
              ...(p.description ? [p.description] : []),
              ...(p.tech ? [`Tech: ${p.tech}`] : []),
            ],
            url: p.url || undefined,
            sectionId,
          });
        }
        break;
      case "edus":
        if (!doc.edus.length) break;
        main.push({ type: "heading", level: 2, text: "Education", sectionId });
        for (const e of doc.edus) {
          main.push({
            type: "lineItem",
            text: `${e.degree}${e.school ? ` — ${e.school}` : ""}`,
            muted: e.when ? `(${e.when})` : undefined,
            sectionId,
          });
        }
        break;
      case "certs":
        if (!doc.certs.length) break;
        main.push({ type: "heading", level: 2, text: "Certifications", sectionId });
        for (const c of doc.certs) {
          main.push({
            type: "lineItem",
            text: `${c.title}${c.org ? ` — ${c.org}` : ""}`,
            muted: c.when ? `(${c.when})` : undefined,
            sectionId,
          });
        }
        break;
      case "languages":
        if (!doc.languages.length) break;
        main.push({ type: "heading", level: 2, text: "Languages", sectionId });
        for (const lang of doc.languages) {
          main.push({
            type: "lineItem",
            text: lang.name,
            muted: lang.level ? `— ${lang.level}` : undefined,
            sectionId,
          });
        }
        break;
      case "publications":
        if (!doc.publications.length) break;
        main.push({ type: "heading", level: 2, text: "Publications", sectionId });
        for (const p of doc.publications) {
          main.push({
            type: "entry",
            title: p.title,
            subtitle: p.publisher,
            meta: p.when,
            url: p.url || undefined,
            compact: true,
            sectionId,
          });
        }
        break;
      case "awards":
        if (!doc.awards.length) break;
        main.push({ type: "heading", level: 2, text: "Awards & Honors", sectionId });
        for (const a of doc.awards) {
          main.push({
            type: "lineItem",
            text: `${a.title}${a.issuer ? ` — ${a.issuer}` : ""}`,
            muted: a.when ? `(${a.when})` : undefined,
            sectionId,
          });
        }
        break;
      default:
        break;
    }
  }

  return { aside, main };
}

function buildSingleColumn(doc: ResumeDocument, compact: boolean): IrBlock[] {
  const blocks: IrBlock[] = [];
  if (visible(doc, "identity")) {
    if (doc.name) blocks.push({ type: "heading", level: 1, text: doc.name, sectionId: "identity" });
    if (doc.headline) blocks.push({ type: "paragraph", text: doc.headline, muted: true, sectionId: "identity" });
  }
  if (visible(doc, "contact")) {
    const bits = [
      doc.contact.location,
      doc.contact.phone,
      doc.contact.email,
      ...doc.links.map((l) => l.url).filter(Boolean),
    ].filter(Boolean);
    if (bits.length) {
      blocks.push({
        type: "paragraph",
        text: bits.join(compact ? " | " : " · "),
        sectionId: "contact",
      });
    }
  }
  if (visible(doc, "identity") && doc.summary) {
    blocks.push({ type: "heading", level: 2, text: "Profile", sectionId: "identity" });
    blocks.push({ type: "paragraph", text: doc.summary, sectionId: "identity" });
  }
  if (visible(doc, "skills") && doc.skills.length) {
    blocks.push({ type: "heading", level: 2, text: "Skills", sectionId: "skills" });
    blocks.push(
      compact
        ? { type: "paragraph", text: doc.skills.join(", "), sectionId: "skills" }
        : { type: "chips", items: doc.skills, sectionId: "skills" },
    );
  }

  const { main } = buildSidebarBlocks(doc);
  for (const block of main) {
    if (block.type === "heading" && block.level === 1) continue;
    if (block.type === "accentBar") continue;
    if (block.type === "paragraph" && block.muted && block.sectionId === "identity") continue;
    if (block.type === "heading" && block.text === "Profile") continue;
    if (block.type === "paragraph" && block.sectionId === "identity" && block.text === doc.summary) continue;
    blocks.push(block);
  }
  return blocks;
}

export function documentToIr(doc: ResumeDocument): LayoutIr {
  const templateId = doc.template;
  const sectionAnchors = ensureSectionOrder(doc);
  const paper = { widthMm: 210, heightMm: 297 };

  if (templateId === "sidebar") {
    const { aside, main } = buildSidebarBlocks(doc);
    return {
      templateId,
      paper,
      themeId: doc.theme,
      sectionAnchors,
      pages: [
        {
          columns: [
            { id: "aside", width: 0.32, blocks: aside },
            { id: "main", width: 0.68, blocks: main },
          ],
        },
      ],
    };
  }

  const blocks = buildSingleColumn(doc, templateId === "compact");
  return {
    templateId,
    paper,
    themeId: doc.theme,
    sectionAnchors,
    pages: [{ columns: [{ id: "main", width: 1, blocks }] }],
  };
}

export const TEMPLATES: TemplateManifest[] = [
  {
    id: "sidebar",
    name: "Classic Sidebar",
    description: "Two-column professional layout — the original Resume Builder look.",
    atsFriendly: false,
    supportsPhoto: true,
    previewAccent: "#14b8a6",
  },
  {
    id: "ats",
    name: "ATS Single Column",
    description: "Clean single-column layout optimized for applicant tracking systems.",
    atsFriendly: true,
    supportsPhoto: false,
    previewAccent: "#334155",
  },
  {
    id: "compact",
    name: "Compact Modern",
    description: "Dense single-column layout that packs more content per page.",
    atsFriendly: true,
    supportsPhoto: false,
    previewAccent: "#1d4ed8",
  },
];

export function getTemplate(id: TemplateId): TemplateManifest {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}
