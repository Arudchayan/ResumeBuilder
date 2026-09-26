import type { ResumeDocument } from "../schema/resume.js";export const SECTION_CONFIG = [
  { id: "identity", label: "Identity", required: true, blurb: "Make the first impression clear: your name, positioning, and short profile." },
  { id: "photo", label: "Photo", required: false, blurb: "Add an optional professional photo for templates that support it." },
  { id: "contact", label: "Contact & Links", required: true, blurb: "Give recruiters an easy way to reach you and find your work." },
  { id: "skills", label: "Skills", required: false, blurb: "Keep this focused on tools, methods, and strengths relevant to the role." },
  { id: "employment", label: "Employment", required: false, blurb: "Show impact with concise roles, dates, and evidence-led bullet points." },
  { id: "projects", label: "Projects", required: false, blurb: "Highlight selected work with the outcome, stack, and a useful link." },
  { id: "certs", label: "Certifications", required: false, blurb: "List credentials that add signal for the roles you are targeting." },
  { id: "edus", label: "Education", required: false, blurb: "Add degrees, institutions, and dates in the order you want them shown." },
  { id: "languages", label: "Languages", required: false, blurb: "Share languages and proficiency when they are relevant to the role." },
  { id: "publications", label: "Publications", required: false, blurb: "Add articles, papers, or other work that strengthens your profile." },
  { id: "awards", label: "Awards & Honors", required: false, blurb: "Include meaningful recognition with the organization and date." },
] as const;

type SectionId = (typeof SECTION_CONFIG)[number]["id"];

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
