import type { ResumeDocument, TemplateId } from "@resume/core";
import { ensureSectionOrder } from "@resume/core";

/** Intermediate representation shared by preview, PDF, and DOCX. */
export type IrInline =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string };

export type IrBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string; sectionId?: string }
  | { type: "paragraph"; text: string; muted?: boolean; sectionId?: string }
  | { type: "bullets"; items: string[]; sectionId?: string }
  | { type: "chips"; items: string[]; sectionId?: string }
  | { type: "kv"; label: string; value: string; sectionId?: string }
  | { type: "photo"; src: string; sectionId?: string }
  | {
      type: "entry";
      title: string;
      subtitle?: string;
      meta?: string;
      body?: string[];
      url?: string;
      sectionId?: string;
    }
  | { type: "spacer"; size: "sm" | "md"; sectionId?: string };

export interface IrColumn {
  id: string;
  width: number; // fraction 0-1
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
  /** Flat section→blocks map for click-to-focus */
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
  return [start, end || "Present"].filter(Boolean).join(" – ");
}

function buildSidebarBlocks(doc: ResumeDocument): { aside: IrBlock[]; main: IrBlock[] } {
  const aside: IrBlock[] = [];
  const main: IrBlock[] = [];

  if (visible(doc, "photo") && doc.photo.enabled && (doc.photo.dataUrl || doc.photo.url)) {
    aside.push({ type: "photo", src: doc.photo.dataUrl || doc.photo.url, sectionId: "photo" });
  }

  if (visible(doc, "contact")) {
    aside.push({ type: "heading", level: 2, text: "Contact", sectionId: "contact" });
    if (doc.contact.location) aside.push({ type: "kv", label: "Location", value: doc.contact.location, sectionId: "contact" });
    if (doc.contact.phone) aside.push({ type: "kv", label: "Phone", value: doc.contact.phone, sectionId: "contact" });
    if (doc.contact.email) aside.push({ type: "kv", label: "Email", value: doc.contact.email, sectionId: "contact" });
    for (const link of doc.links) {
      if (link.url) aside.push({ type: "kv", label: link.label || "Link", value: link.url, sectionId: "contact" });
    }
  }

  if (visible(doc, "skills") && doc.skills.length) {
    aside.push({ type: "heading", level: 2, text: "Skills", sectionId: "skills" });
    aside.push({ type: "chips", items: doc.skills, sectionId: "skills" });
  }

  if (visible(doc, "languages") && doc.languages.length) {
    aside.push({ type: "heading", level: 2, text: "Languages", sectionId: "languages" });
    for (const lang of doc.languages) {
      aside.push({
        type: "kv",
        label: lang.name,
        value: lang.level,
        sectionId: "languages",
      });
    }
  }

  if (visible(doc, "identity")) {
    if (doc.name) main.push({ type: "heading", level: 1, text: doc.name, sectionId: "identity" });
    if (doc.headline) main.push({ type: "paragraph", text: doc.headline, muted: true, sectionId: "identity" });
    if (doc.summary) main.push({ type: "paragraph", text: doc.summary, sectionId: "identity" });
  }

  const order = ensureSectionOrder(doc).filter(
    (id) => !["identity", "photo", "contact", "skills", "languages"].includes(id),
  );

  for (const sectionId of order) {
    if (!visible(doc, sectionId)) continue;
    switch (sectionId) {
      case "employment":
        if (!doc.jobs.length) break;
        main.push({ type: "heading", level: 2, text: "Experience", sectionId });
        for (const job of doc.jobs) {
          const body: string[] = [];
          for (const sec of job.sections) {
            if (sec.title) body.push(sec.title);
            body.push(...sec.bullets.filter(Boolean));
          }
          main.push({
            type: "entry",
            title: job.role,
            subtitle: [job.company, job.location].filter(Boolean).join(" · "),
            meta: dateRange(job.start, job.end),
            body,
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
            subtitle: p.tech,
            meta: dateRange(p.start, p.end),
            body: p.description ? [p.description] : [],
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
            type: "entry",
            title: e.degree,
            subtitle: e.school,
            meta: e.when,
            sectionId,
          });
        }
        break;
      case "certs":
        if (!doc.certs.length) break;
        main.push({ type: "heading", level: 2, text: "Certifications", sectionId });
        for (const c of doc.certs) {
          main.push({
            type: "entry",
            title: c.title,
            subtitle: c.org,
            meta: c.when,
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
            sectionId,
          });
        }
        break;
      case "awards":
        if (!doc.awards.length) break;
        main.push({ type: "heading", level: 2, text: "Awards", sectionId });
        for (const a of doc.awards) {
          main.push({
            type: "entry",
            title: a.title,
            subtitle: a.issuer,
            meta: a.when,
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
      blocks.push({ type: "paragraph", text: bits.join(compact ? " | " : " · "), sectionId: "contact" });
    }
  }
  if (visible(doc, "identity") && doc.summary) {
    blocks.push({ type: "paragraph", text: doc.summary, sectionId: "identity" });
  }
  if (visible(doc, "skills") && doc.skills.length) {
    blocks.push({ type: "heading", level: 2, text: "Skills", sectionId: "skills" });
    blocks.push({
      type: compact ? "paragraph" : "chips",
      ...(compact
        ? { text: doc.skills.join(", "), sectionId: "skills" }
        : { items: doc.skills, sectionId: "skills" }),
    } as IrBlock);
  }

  const { main } = buildSidebarBlocks(doc);
  // reuse main content blocks after identity/skills already handled
  const skip = new Set(["identity"]);
  for (const block of main) {
    if (block.type === "heading" && block.level === 1) continue;
    if (block.type === "paragraph" && block.sectionId === "identity" && block.muted) continue;
    if (block.sectionId && skip.has(block.sectionId) && block.type === "paragraph" && !block.muted) {
      // summary already added
      if (block.text === doc.summary) continue;
    }
    if (block.sectionId === "identity" && block.type === "paragraph" && block.text === doc.summary) continue;
    blocks.push(block);
  }

  if (visible(doc, "languages") && doc.languages.length) {
    blocks.push({ type: "heading", level: 2, text: "Languages", sectionId: "languages" });
    blocks.push({
      type: "paragraph",
      text: doc.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(", "),
      sectionId: "languages",
    });
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
    id: "ats",
    name: "ATS Single Column",
    description: "Clean single-column layout optimized for applicant tracking systems.",
    atsFriendly: true,
    supportsPhoto: false,
    previewAccent: "#334155",
  },
  {
    id: "sidebar",
    name: "Classic Sidebar",
    description: "Two-column professional layout with a tinted sidebar for contact and skills.",
    atsFriendly: false,
    supportsPhoto: true,
    previewAccent: "#0f766e",
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
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[1]!;
}
