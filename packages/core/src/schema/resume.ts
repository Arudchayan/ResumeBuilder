import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()0-9\s.-]{5,}$/;

const isValidEmail = (value: string) => !value || emailPattern.test(value);
const isValidPhone = (value: string) => !value || phonePattern.test(value);
const isValidHttpUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/[<>"'\s]/.test(trimmed)) return false;
  try {
    // A `scheme:` prefix that is not http/https (e.g. `javascript:`) must
    // fail — never prepend `https://` and re-test the protocol.
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
    const candidate = hasScheme ? trimmed : `https://${trimmed}`;
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
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

const linkSchema = z.object({
  label: z.string().trim().max(200).optional().default(""),
  url: httpUrlField(),
});

const jobSectionSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  bullets: z.array(z.string().max(1000)).max(100).optional().default([]),
});

const jobSchema = z.object({
  role: z.string().trim().max(200).optional().default(""),
  company: z.string().trim().max(200).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  start: z.string().trim().max(100).optional().default(""),
  end: z.string().trim().max(100).optional().default(""),
  sections: z.array(jobSectionSchema).max(20).optional().default([]),
});

const educationSchema = z.object({
  degree: z.string().trim().max(200).optional().default(""),
  school: z.string().trim().max(200).optional().default(""),
  when: z.string().trim().max(100).optional().default(""),
});

const certSchema = z.object({
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

const projectSchema = z
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

const languageSchema = z.object({
  name: z.string().trim().max(100).optional().default(""),
  level: z.string().trim().max(100).optional().default(""),
});

const publicationSchema = z.object({
  title: z.string().trim().max(300).optional().default(""),
  publisher: z.string().trim().max(200).optional().default(""),
  when: z.string().trim().max(100).optional().default(""),
  url: httpUrlField(),
});

const awardSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  issuer: z.string().trim().max(200).optional().default(""),
  when: z.string().trim().max(100).optional().default(""),
});

const TEMPLATE_IDS = ["ats", "sidebar", "compact"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

/** Map legacy template ids (e.g. "modern") onto current ones. */
export function normalizeTemplateId(raw: unknown): TemplateId {
  return typeof raw === "string" && (TEMPLATE_IDS as readonly string[]).includes(raw)
    ? (raw as TemplateId)
    : "sidebar";
}

export const THEME_IDS = [
  "teal",
  "blue",
  "purple",
  "green",
  "slate",
  "forest",
  "copper",
  "black",
] as const;
export type ThemeId = (typeof THEME_IDS)[number];

/** Coerce unknown/legacy theme ids onto a known theme (mirrors templates). */
export function normalizeThemeId(raw: unknown): ThemeId {
  return typeof raw === "string" && (THEME_IDS as readonly string[]).includes(raw)
    ? (raw as ThemeId)
    : "teal";
}

/**
 * Load-path truncation caps, mirrored by applyCommand ARRAY_CAPS.
 * Over-long arrays degrade gracefully instead of failing closed.
 */
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
};

const resumeSchema = z.preprocess(
  (input) => {
    if (!input || typeof input !== "object") return input;
    const data = { ...(input as Record<string, unknown>) };
    data.template = normalizeTemplateId(data.template);
    data.theme = normalizeThemeId(data.theme);
    for (const [key, cap] of Object.entries(TOP_LEVEL_ARRAY_CAPS)) {
      const arr = data[key];
      if (Array.isArray(arr) && arr.length > cap) data[key] = arr.slice(0, cap);
    }
    if (Array.isArray(data.jobs)) {
      for (const job of data.jobs) {
        if (!job || typeof job !== "object") continue;
        const sections = (job as Record<string, unknown>).sections;
        if (!Array.isArray(sections)) continue;
        for (const section of sections) {
          if (!section || typeof section !== "object") continue;
          const bullets = (section as Record<string, unknown>).bullets;
          if (Array.isArray(bullets) && bullets.length > 100) {
            (section as Record<string, unknown>).bullets = bullets.slice(0, 100);
          }
        }
      }
    }
    if (!data.id) data.id = "";
    return data;
  },
  z.object({
    id: z.string().optional().default(""),
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
          .max(7_000_000)
          .refine(
            (v) => {
              if (!v) return true;
              if (v.startsWith("https://")) return true;
              return /^data:image\/[a-z0-9.+-]+;base64,/i.test(v);
            },
            { message: "Photo must be an https URL or an image data URL under ~7MB" },
          )
          .optional()
          .default(""),
      })
      .optional()
      .default({ enabled: false, url: "", dataUrl: "" }),
    sectionVisibility: z
      .record(z.string().max(64), z.boolean())
      .refine((v) => Object.keys(v).length <= 64, { message: "Too many section overrides" })
      .optional()
      .default({}),
    sectionOrder: z.array(z.string().max(64)).max(64).nullable().optional().default(null),
    theme: z.enum(THEME_IDS).optional().default("teal"),
    template: z.enum(TEMPLATE_IDS).optional().default("sidebar"),
    updatedAt: z.number().optional().default(0),
  }),
);

export type ResumeDocument = z.infer<typeof resumeSchema>;

/**
 * Loose metadata parser for library listings: never hides a row because a
 * body field is strict — full validation happens on load.
 */
export const resumeMetaSchema = z
  .object({
    id: z.string().catch("unknown"),
    name: z.string().catch(""),
    template: z.string().catch("sidebar"),
    updatedAt: z.number().catch(0),
  })
  .catchall(z.unknown());

export function parseResumeMeta(row: unknown) {
  const parsed = resumeMetaSchema.safeParse(row);
  if (!parsed.success) return null;
  return { ...parsed.data, template: normalizeTemplateId(parsed.data.template) };
}

export function parseResumeData(data: unknown): ResumeDocument {
  return resumeSchema.parse(data);
}
