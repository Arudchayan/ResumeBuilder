import type { ResumeDocument, TemplateId } from "@resume/core";
import { ensureSectionOrder } from "@resume/core";

/** Intermediate representation shared by preview, DOCX, and print. */
export type IrBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string; sectionId?: string }
  | { type: "accentBar"; sectionId?: string }
  | { type: "paragraph"; text: string; muted?: boolean; sectionId?: string }
  | { type: "chips"; items: string[]; sectionId?: string }
  | { type: "kv"; label: string; value: string; sectionId?: string }
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
      sectionId?: string;
    }
  | { type: "lineItem"; text: string; muted?: string; sectionId?: string };

export interface IrColumn {
  id: string;
  blocks: IrBlock[];
}

export interface IrPage {
  columns: IrColumn[];
}

export interface LayoutIr {
  templateId: TemplateId;
  themeId: string;
  pages: IrPage[];
}

export interface TemplateManifest {
  id: TemplateId;
  name: string;
  description: string;
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
  return {
    aside: buildColumn(doc, "aside"),
    main: buildColumn(doc, "main"),
  };
}

function buildColumn(doc: ResumeDocument, target: "aside" | "main"): IrBlock[] {
  const blocks: IrBlock[] = [];
  const push = (block: IrBlock) => blocks.push(block);

  if (target === "aside") {
    if (visible(doc, "photo") && doc.photo.enabled && (doc.photo.dataUrl || doc.photo.url)) {
      push({ type: "photo", src: doc.photo.dataUrl || doc.photo.url, sectionId: "photo" });
    }

    if (visible(doc, "contact")) {
      push({ type: "heading", level: 2, text: "Details", sectionId: "contact" });
      if (doc.contact.location) {
        push({ type: "kv", label: "Location", value: doc.contact.location, sectionId: "contact" });
      }
      if (doc.contact.phone) {
        push({ type: "kv", label: "Phone", value: doc.contact.phone, sectionId: "contact" });
      }
      if (doc.contact.email) {
        push({ type: "kv", label: "Email", value: doc.contact.email, sectionId: "contact" });
      }

      const links = doc.links.filter((l) => l.url && l.label);
      if (links.length) {
        push({ type: "heading", level: 2, text: "Links", sectionId: "contact" });
        for (const link of links) {
          push({ type: "link", label: link.label, href: link.url, sectionId: "contact" });
        }
      }
    }

    if (visible(doc, "skills") && doc.skills.length) {
      push({ type: "heading", level: 2, text: "Skills", sectionId: "skills" });
      push({ type: "chips", items: doc.skills, sectionId: "skills" });
    }
    return blocks;
  }

  // Main column header (classic)
  if (visible(doc, "identity")) {
    push({ type: "heading", level: 1, text: doc.name || "Your Name", sectionId: "identity" });
    if (doc.headline) {
      push({ type: "paragraph", text: doc.headline, muted: true, sectionId: "identity" });
    }
    push({ type: "accentBar", sectionId: "identity" });
    if (doc.summary) {
      push({ type: "heading", level: 2, text: "Profile", sectionId: "identity" });
      push({ type: "paragraph", text: doc.summary, sectionId: "identity" });
    }
  }

  const asideOnly = new Set(["identity", "photo", "contact", "skills"]);
  const order = ensureSectionOrder(doc).filter((id) => !asideOnly.has(id));

  for (const sectionId of order) {
    if (!visible(doc, sectionId)) continue;
    switch (sectionId) {
      case "employment":
        if (!doc.jobs.length) break;
        push({ type: "heading", level: 2, text: "Employment History", sectionId });
        for (const job of doc.jobs) {
          push({
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
        push({ type: "heading", level: 2, text: "Projects", sectionId });
        for (const p of doc.projects) {
          push({
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
        push({ type: "heading", level: 2, text: "Education", sectionId });
        for (const e of doc.edus) {
          push({
            type: "lineItem",
            text: `${e.degree}${e.school ? ` — ${e.school}` : ""}`,
            muted: e.when ? `(${e.when})` : undefined,
            sectionId,
          });
        }
        break;
      case "certs":
        if (!doc.certs.length) break;
        push({ type: "heading", level: 2, text: "Certifications", sectionId });
        for (const c of doc.certs) {
          push({
            type: "lineItem",
            text: `${c.title}${c.org ? ` — ${c.org}` : ""}`,
            muted: c.when ? `(${c.when})` : undefined,
            sectionId,
          });
        }
        break;
      case "languages":
        if (!doc.languages.length) break;
        push({ type: "heading", level: 2, text: "Languages", sectionId });
        for (const lang of doc.languages) {
          push({
            type: "lineItem",
            text: lang.name,
            muted: lang.level ? `— ${lang.level}` : undefined,
            sectionId,
          });
        }
        break;
      case "publications":
        if (!doc.publications.length) break;
        push({ type: "heading", level: 2, text: "Publications", sectionId });
        for (const p of doc.publications) {
          push({
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
        push({ type: "heading", level: 2, text: "Awards & Honors", sectionId });
        for (const a of doc.awards) {
          push({
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

  return blocks;
}

function buildSingleColumn(doc: ResumeDocument, compact: boolean): IrBlock[] {
  const blocks = buildColumn(doc, "main");
  if (visible(doc, "contact")) {
    const bits = [
      doc.contact.location,
      doc.contact.phone,
      doc.contact.email,
      ...doc.links.map((l) => l.url).filter(Boolean),
    ].filter(Boolean);
    if (bits.length) {
      blocks.splice(
        blocks.findIndex((b) => b.type === "heading" && b.level === 2),
        0,
        {
          type: "paragraph",
          text: bits.join(compact ? " | " : " · "),
          sectionId: "contact",
        },
      );
    }
  }
  if (visible(doc, "skills") && doc.skills.length) {
    blocks.push(
      compact
        ? { type: "paragraph", text: doc.skills.join(", "), sectionId: "skills" }
        : { type: "chips", items: doc.skills, sectionId: "skills" },
    );
  }
  return blocks;
}

export function documentToIr(doc: ResumeDocument): LayoutIr {
  const templateId = doc.template;

  if (templateId === "sidebar") {
    const { aside, main } = buildSidebarBlocks(doc);
    return {
      templateId,
      themeId: doc.theme,
      pages: [
        {
          columns: [
            { id: "aside", blocks: aside },
            { id: "main", blocks: main },
          ],
        },
      ],
    };
  }

  const blocks = buildSingleColumn(doc, templateId === "compact");
  return {
    templateId,
    themeId: doc.theme,
    pages: [{ columns: [{ id: "main", blocks }] }],
  };
}

export const TEMPLATES: TemplateManifest[] = [
  {
    id: "sidebar",
    name: "Classic Sidebar",
    description: "Two-column professional layout — the original Resume Builder look.",
    previewAccent: "#14b8a6",
  },
  {
    id: "ats",
    name: "ATS Single Column",
    description: "Clean single-column layout optimized for applicant tracking systems.",
    previewAccent: "#334155",
  },
  {
    id: "compact",
    name: "Compact Modern",
    description: "Dense single-column layout that packs more content per page.",
    previewAccent: "#1d4ed8",
  },
];
