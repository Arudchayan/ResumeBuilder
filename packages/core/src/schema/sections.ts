import type { ResumeDocument } from "../schema/resume.js";export const SECTION_CONFIG = [
  { id: "identity", label: "Identity", required: true },
  { id: "photo", label: "Photo", required: false },
  { id: "contact", label: "Contact & Links", required: true },
  { id: "skills", label: "Skills", required: false },
  { id: "employment", label: "Employment", required: false },
  { id: "projects", label: "Projects", required: false },
  { id: "certs", label: "Certifications", required: false },
  { id: "edus", label: "Education", required: false },
  { id: "languages", label: "Languages", required: false },
  { id: "publications", label: "Publications", required: false },
  { id: "awards", label: "Awards & Honors", required: false },
] as const;

export type SectionId = (typeof SECTION_CONFIG)[number]["id"];

export function getDefaultVisibility(): Record<string, boolean> {
  const visibility: Record<string, boolean> = {};
  for (const section of SECTION_CONFIG) {
    visibility[section.id] = true;
  }
  return visibility;
}

export function getDefaultSectionOrder(): string[] {
  return SECTION_CONFIG.map((s) => s.id);
}

export function blankResume(overrides: Partial<ResumeDocument> = {}): ResumeDocument {
  return {
    id: crypto.randomUUID(),
    name: "",
    headline: "",
    summary: "",
    contact: { location: "", phone: "", email: "" },
    links: [],
    skills: [],
    jobs: [],
    projects: [],
    certs: [],
    edus: [],
    languages: [],
    publications: [],
    awards: [],
    photo: { enabled: false, url: "", dataUrl: "" },
    sectionVisibility: getDefaultVisibility(),
    sectionOrder: getDefaultSectionOrder(),
    theme: "teal",
    template: "sidebar",
    updatedAt: Date.now(),
    ...overrides,
  };
}
