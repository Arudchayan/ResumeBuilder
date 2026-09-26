import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()0-9\s.-]{5,}$/;

const isValidEmail = (value: string) => !value || emailPattern.test(value);
const isValidPhone = (value: string) => !value || phonePattern.test(value);
const isValidHttpUrl = (value: string) => {
  if (!value) return true;
  const trimmed = value.trim();
  if (/^[\s]*javascript:/i.test(trimmed) || /^[\s]*data:/i.test(trimmed) || /^[\s]*vbscript:/i.test(trimmed)) {
    return false;
  }
  try {
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(candidate);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    if (/[<>"'\s]/.test(trimmed)) return false;
    return true;
  } catch {
    return false;
  }
};

const emailField = () =>
  z
    .string()
    .trim()
    .max(200)
    .refine(isValidEmail, { message: "Enter a valid email address" })
    .optional()
    .default("");

const phoneField = () =>
  z
    .string()
    .trim()
    .max(100)
    .refine(isValidPhone, { message: "Enter a valid phone number" })
    .optional()
    .default("");

const httpUrlField = (max = 1000) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(isValidHttpUrl, { message: "Enter a valid URL (http/https)" })
    .optional()
    .default("");

export const linkSchema = z.object({
  label: z.string().trim().max(200).optional().default(""),
  url: httpUrlField(),
});

export const jobSectionSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  bullets: z.array(z.string().trim().max(1000)).max(100).optional().default([]),
});

export const jobSchema = z.object({
  role: z.string().trim().max(200).optional().default(""),
  company: z.string().trim().max(200).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  start: z.string().trim().max(100).optional().default(""),
  end: z.string().trim().max(100).optional().default(""),
  sections: z.array(jobSectionSchema).optional().default([]),
});

export const educationSchema = z.object({
  degree: z.string().trim().max(200).optional().default(""),
  school: z.string().trim().max(200).optional().default(""),
  when: z.string().trim().max(100).optional().default(""),
});

export const certSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  org: z.string().trim().max(200).optional().default(""),
  when: z.string().trim().max(100).optional().default(""),
});

/** Accept string or string[] (legacy exports used arrays). */
const techField = z.preprocess((val) => {
  if (Array.isArray(val)) return val.filter((x) => typeof x === "string").join(", ");
  if (val == null) return "";
  return val;
}, z.string().trim().max(300).optional().default(""));

export const projectSchema = z
  .object({
    title: z.string().trim().max(200).optional().default(""),
    description: z.string().trim().max(1000).optional().default(""),
    tech: techField,
    start: z.string().trim().max(100).optional().default(""),
    end: z.string().trim().max(100).optional().default(""),
    when: z.string().trim().max(100).optional(),
    url: httpUrlField(),
  })
  .transform((p) => {
    // Legacy projects used `when` instead of start/end
    if ((!p.start && !p.end) && p.when) {
      const parts = p.when.split(/\s*[—–-]\s*/);
      return {
        title: p.title,
        description: p.description,
        tech: p.tech,
        start: parts[0]?.trim() ?? "",
        end: parts[1]?.trim() ?? "",
        url: p.url,
      };
    }
    return {
      title: p.title,
      description: p.description,
      tech: p.tech,
      start: p.start,
      end: p.end,
      url: p.url,
    };
  });

export const languageSchema = z.object({
  name: z.string().trim().max(100).optional().default(""),
  level: z.string().trim().max(100).optional().default(""),
});

export const publicationSchema = z.object({
  title: z.string().trim().max(300).optional().default(""),
  publisher: z.string().trim().max(200).optional().default(""),
  when: z.string().trim().max(100).optional().default(""),
  url: httpUrlField(),
});

export const awardSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  issuer: z.string().trim().max(200).optional().default(""),
  when: z.string().trim().max(100).optional().default(""),
});

export const TEMPLATE_IDS = ["ats", "sidebar", "compact"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

/** Map legacy template ids (e.g. "modern") onto current ones. */
export function normalizeTemplateId(raw: unknown): TemplateId {
  if (typeof raw === "string" && (TEMPLATE_IDS as readonly string[]).includes(raw)) {
    return raw as TemplateId;
  }
  if (raw === "modern" || raw === "classic" || raw === "default") return "sidebar";
  return "sidebar";
}

export const THEME_IDS = ["teal", "blue", "purple", "green", "slate", "forest", "copper", "black"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

/** Coerce unknown/legacy theme ids onto the closest built-in instead of failing closed. */
export function normalizeThemeId(raw: unknown): ThemeId {
  if (typeof raw === "string" && (THEME_IDS as readonly string[]).includes(raw)) {
    return raw as ThemeId;
  }
  return "teal";
}

/** Caps mirrored by applyCommand ARRAY_CAPS; over-long arrays truncate, never reject. */
const TOP_LEVEL_ARRAY_CAPS: Record<string, number> = {
  links: 50,
  skills: 100,
  jobs: 50,
  projects: 50,
  certs: 50,
  edus: 20,
  languages: 30,
  publications: 50,
  awards: 50,
  customSections: 50,
};

export const resumeSchema = z.preprocess(
  (input) => {
    if (!input || typeof input !== "object") return input;
    const data = { ...(input as Record<string, unknown>) };
    data.template = normalizeTemplateId(data.template);
    data.theme = normalizeThemeId(data.theme);
    if (!data.id) data.id = "";
    // Degrade gracefully: truncate over-long arrays (incl. nested job
    // bullets) instead of failing closed and stranding the document.
    for (const [key, cap] of Object.entries(TOP_LEVEL_ARRAY_CAPS)) {
      const value = data[key];
      if (Array.isArray(value) && value.length > cap) data[key] = value.slice(0, cap);
    }
    if (Array.isArray(data.jobs)) {
      for (const job of data.jobs) {
        if (job && typeof job === "object" && Array.isArray((job as Record<string, unknown>).sections)) {
          for (const section of (job as Record<string, unknown>).sections as Record<string, unknown>[]) {
            if (section && Array.isArray(section.bullets) && section.bullets.length > 100) {
              section.bullets = section.bullets.slice(0, 100);
            }
          }
        }
      }
    }
    return data;
  },
  z.object({
    id: z.string().max(100).optional().default(""),
    name: z.string().trim().max(200).optional().default(""),
    headline: z.string().trim().max(200).optional().default(""),
    summary: z.string().trim().max(2000).optional().default(""),
    contact: z
      .object({
        location: z.string().trim().max(200).optional().default(""),
        phone: phoneField(),
        email: emailField(),
      })
      .optional()
      .default({ location: "", phone: "", email: "" }),
    links: z.array(linkSchema).max(50).optional().default([]),
    skills: z.array(z.string().trim().max(100)).max(100).optional().default([]),
    jobs: z.array(jobSchema).max(50).optional().default([]),
    projects: z.array(projectSchema).max(50).optional().default([]),
    certs: z.array(certSchema).max(50).optional().default([]),
    edus: z.array(educationSchema).max(20).optional().default([]),
    languages: z.array(languageSchema).max(30).optional().default([]),
    publications: z.array(publicationSchema).max(50).optional().default([]),
    awards: z.array(awardSchema).max(50).optional().default([]),
    photo: z
      .object({
        enabled: z.boolean().optional().default(false),
        url: httpUrlField(2000),
        dataUrl: z
          .string()
          .max(7000000)
          .refine(
            (v) =>
              !v ||
              /^data:image\/[a-z0-9.+-]+;base64,/i.test(v) ||
              /^https?:\/\//i.test(v),
            { message: "Photo must be https URL or image data URL under ~7MB" },
          )
          .optional()
          .default(""),
      })
      .optional()
      .default({ enabled: false, url: "", dataUrl: "" }),
    sectionVisibility: z.record(z.string().max(64), z.boolean()).optional().default({}),
    sectionOrder: z.array(z.string().max(64)).max(64).nullable().optional().default(null),
    theme: z.enum(["teal", "blue", "purple", "green", "slate", "forest", "copper", "black"]).optional().default("teal"),
    template: z.enum(TEMPLATE_IDS).optional().default("sidebar"),
    customSections: z.array(z.unknown()).max(50).optional().default([]),
    updatedAt: z.number().optional().default(0),
  }),
);

export type ResumeDocument = z.infer<typeof resumeSchema>;
export type Job = z.infer<typeof jobSchema>;
export type Project = z.infer<typeof projectSchema>;

export function validateResumeData(data: unknown) {
  return resumeSchema.safeParse(data);
}

/** Lightweight row check for list(): never hides a row just because a
 *  body field is over-strict; full validation still happens on load. */
export const resumeMetaSchema = z
  .object({
    id: z.string().min(1).max(100).catch("unknown"),
    name: z.string().max(200).catch(""),
    template: z.string().max(32).catch("sidebar"),
    updatedAt: z.number().catch(0),
  })
  .catchall(z.unknown());

export function parseResumeMeta(row: unknown) {
  return resumeMetaSchema.safeParse(row);
}

export function parseResumeData(data: unknown): ResumeDocument {
  return resumeSchema.parse(data);
}
