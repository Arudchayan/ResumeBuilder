import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()0-9\s.-]{5,}$/;

const isValidEmail = (value: string) => !value || emailPattern.test(value);
const isValidPhone = (value: string) => !value || phonePattern.test(value);
const isValidHttpUrl = (value: string) => {
  if (!value) return true;
  try {
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const parsed = new URL(candidate);
    return ["http:", "https:"].includes(parsed.protocol);
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
  bullets: z.array(z.string().max(1000)).optional().default([]),
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

export const projectSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
  tech: z.string().trim().max(300).optional().default(""),
  start: z.string().trim().max(100).optional().default(""),
  end: z.string().trim().max(100).optional().default(""),
  url: httpUrlField(),
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

export const resumeSchema = z.object({
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
  links: z.array(linkSchema).optional().default([]),
  skills: z.array(z.string().trim().max(100)).optional().default([]),
  jobs: z.array(jobSchema).optional().default([]),
  projects: z.array(projectSchema).optional().default([]),
  certs: z.array(certSchema).optional().default([]),
  edus: z.array(educationSchema).optional().default([]),
  languages: z.array(languageSchema).optional().default([]),
  publications: z.array(publicationSchema).optional().default([]),
  awards: z.array(awardSchema).optional().default([]),
  photo: z
    .object({
      enabled: z.boolean().optional().default(false),
      url: httpUrlField(2000),
      dataUrl: z.string().optional().default(""),
    })
    .optional()
    .default({ enabled: false, url: "", dataUrl: "" }),
  sectionVisibility: z.record(z.string(), z.boolean()).optional().default({}),
  sectionOrder: z.array(z.string()).nullable().optional().default(null),
  theme: z.string().optional().default("teal"),
  template: z.enum(TEMPLATE_IDS).optional().default("sidebar"),
  customSections: z.array(z.unknown()).optional().default([]),
  updatedAt: z.number().optional().default(0),
});

export type ResumeDocument = z.infer<typeof resumeSchema>;
export type Job = z.infer<typeof jobSchema>;
export type Project = z.infer<typeof projectSchema>;

export function validateResumeData(data: unknown) {
  return resumeSchema.safeParse(data);
}

export function parseResumeData(data: unknown): ResumeDocument {
  return resumeSchema.parse(data);
}
