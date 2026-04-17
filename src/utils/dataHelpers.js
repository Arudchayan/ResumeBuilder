import DOMPurify from "dompurify";
import { blankState } from "../constants/defaultData";
import { getDefaultVisibility, SECTION_CONFIG } from "../constants/sectionConfig";
import { logger } from "./logger";

export function cleanText(s){ 
  const text = (s ?? "").toString().replace(/\s+/g, " ").trim();
  // Sanitize to prevent XSS
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }); // Strip all HTML tags
}

export function normalizeUrl(u){
  const s = cleanText(u);
  if(!s) return "";
  
  // Add https:// if no protocol
  let url = s;
  if(!/^https?:\/\//i.test(s)) {
    url = "https://" + s;
  }
  
  // Validate URL
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols (block javascript:, data:, etc.)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      logger.warn('Invalid URL protocol:', parsed.protocol);
      return "";
    }
    return parsed.href;
  } catch (e) {
    logger.warn('Invalid URL:', s);
    return "";
  }
}

export function formatLocation(s){
  const t = cleanText(s);
  if(!t) return "";
  let x = t.replace(/\s*,\s*/g, ", ");
  x = x.replace(/\s{2,}/g, " ");
  x = x.replace(/,+/g, ",");
  x = x.replace(/,\s*$/, "");
  return x;
}

export function safeHydrate(data) {
  // Keep only recognized keys/shape
  const base = blankState();
  const next = { ...base, ...data };
  next.contact = { ...base.contact, ...(data.contact || {}) };
  next.links = Array.isArray(data.links) ? data.links.map(x => ({ label: x.label || "", url: x.url || "" })) : [];
  next.skills = Array.isArray(data.skills) ? data.skills.filter(Boolean) : [];
  next.jobs = Array.isArray(data.jobs) ? data.jobs.map(j => ({
    role: j.role || "", company: j.company || "", location: j.location || "",
    start: j.start || "", end: j.end || "",
    sections: Array.isArray(j.sections) ? j.sections.map(s => ({ title: s.title || "", bullets: Array.isArray(s.bullets) ? s.bullets : [] })) : []
  })) : [];
  next.projects = Array.isArray(data.projects) ? data.projects.map(p => ({ 
    title: p.title || "", description: p.description || "", tech: p.tech || "", 
    start: p.start || "", end: p.end || "", url: p.url || "" 
  })) : [];
  next.certs = Array.isArray(data.certs) ? data.certs.map(c => ({ title: c.title || "", org: c.org || "", when: c.when || "" })) : [];
  next.edus = Array.isArray(data.edus) ? data.edus.map(ed => ({ degree: ed.degree || "", school: ed.school || "", when: ed.when || "" })) : [];
  next.languages = Array.isArray(data.languages) ? data.languages.map(l => ({ name: l.name || "", level: l.level || "" })) : [];
  next.publications = Array.isArray(data.publications) ? data.publications.map(p => ({ 
    title: p.title || "", publisher: p.publisher || "", when: p.when || "", url: p.url || "" 
  })) : [];
  next.awards = Array.isArray(data.awards) ? data.awards.map(a => ({ title: a.title || "", issuer: a.issuer || "", when: a.when || "" })) : [];
  next.photo = {
    enabled: !!(data.photo && data.photo.enabled),
    url: (data.photo?.url || "").toString().trim(),
    dataUrl: data.photo?.dataUrl || "",
  };

  const defaultVis = getDefaultVisibility();
  next.sectionVisibility = { ...defaultVis, ...(data.sectionVisibility && typeof data.sectionVisibility === "object" ? data.sectionVisibility : {}) };

  const canonicalOrder = SECTION_CONFIG.map((s) => s.id);
  const rawOrder = data.sectionOrder;
  if (Array.isArray(rawOrder) && rawOrder.length) {
    const seen = new Set();
    const merged = [];
    for (const id of rawOrder) {
      if (typeof id === "string" && canonicalOrder.includes(id) && !seen.has(id)) {
        seen.add(id);
        merged.push(id);
      }
    }
    for (const id of canonicalOrder) {
      if (!seen.has(id)) merged.push(id);
    }
    next.sectionOrder = merged;
  } else {
    next.sectionOrder = canonicalOrder;
  }

  next.theme = typeof data.theme === "string" && data.theme.trim() ? data.theme : "teal";
  next.template = typeof data.template === "string" && data.template.trim() ? data.template : "modern";
  next.customSections = Array.isArray(data.customSections) ? data.customSections : [];

  return next;
}
