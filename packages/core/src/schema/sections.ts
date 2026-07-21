import type { ResumeDocument } from "../schema/resume.js";

export const SECTION_CONFIG = [
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

export function isSectionEmpty(state: ResumeDocument, sectionId: string): boolean {
  switch (sectionId) {
    case "identity":
      return !state.name && !state.headline && !state.summary;
    case "photo":
      return !state.photo?.enabled;
    case "contact":
      return (
        !state.contact?.location &&
        !state.contact?.phone &&
        !state.contact?.email &&
        (!state.links || state.links.length === 0)
      );
    case "skills":
      return !state.skills || state.skills.length === 0;
    case "employment":
      return !state.jobs || state.jobs.length === 0;
    case "projects":
      return !state.projects || state.projects.length === 0;
    case "certs":
      return !state.certs || state.certs.length === 0;
    case "edus":
      return !state.edus || state.edus.length === 0;
    case "languages":
      return !state.languages || state.languages.length === 0;
    case "publications":
      return !state.publications || state.publications.length === 0;
    case "awards":
      return !state.awards || state.awards.length === 0;
    default: {
      const _exhaustive: never = sectionId as never;
      void _exhaustive;
      return false;
    }
  }
}

export function blankResume(overrides: Partial<ResumeDocument> = {}): ResumeDocument {
  return {
    id: crypto.randomUUID?.() ?? `local-${Date.now()}`,
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
    customSections: [],
    updatedAt: Date.now(),
    ...overrides,
  };
}
