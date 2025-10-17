import { getDefaultVisibility, SECTION_CONFIG } from "./sectionConfig";
import { defaultTheme } from "./themes";

export function blankState() {
  return {
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
    sectionOrder: SECTION_CONFIG.map(s => s.id),
    theme: defaultTheme,
  };
}
