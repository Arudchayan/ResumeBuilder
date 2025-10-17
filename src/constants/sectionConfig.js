// Section metadata configuration
export const SECTION_CONFIG = [
  { id: 'identity', label: 'Identity', required: true },
  { id: 'photo', label: 'Photo', required: false },
  { id: 'contact', label: 'Contact & Links', required: true },
  { id: 'skills', label: 'Skills', required: false },
  { id: 'employment', label: 'Employment', required: false },
  { id: 'projects', label: 'Projects', required: false },
  { id: 'certs', label: 'Certifications', required: false },
  { id: 'edus', label: 'Education', required: false },
  { id: 'languages', label: 'Languages', required: false },
  { id: 'publications', label: 'Publications', required: false },
  { id: 'awards', label: 'Awards & Honors', required: false },
];

export function getDefaultVisibility() {
  const visibility = {};
  SECTION_CONFIG.forEach(section => {
    visibility[section.id] = true; // All visible by default
  });
  return visibility;
}

export function isSectionEmpty(state, sectionId) {
  switch (sectionId) {
    case 'identity':
      return !state.name && !state.headline && !state.summary;
    case 'photo':
      return !state.photo?.enabled;
    case 'contact':
      return !state.contact?.location && !state.contact?.phone && !state.contact?.email && (!state.links || state.links.length === 0);
    case 'skills':
      return !state.skills || state.skills.length === 0;
    case 'employment':
      return !state.jobs || state.jobs.length === 0;
    case 'projects':
      return !state.projects || state.projects.length === 0;
    case 'certs':
      return !state.certs || state.certs.length === 0;
    case 'edus':
      return !state.edus || state.edus.length === 0;
    case 'languages':
      return !state.languages || state.languages.length === 0;
    case 'publications':
      return !state.publications || state.publications.length === 0;
    case 'awards':
      return !state.awards || state.awards.length === 0;
    default:
      return false;
  }
}
