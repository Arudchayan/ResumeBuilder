import { z } from "zod";

const linkSchema = z.object({
  label: z.string().trim().max(200).optional().default(""),
  url: z.string().trim().max(1000).optional().default(""),
});

const jobSectionSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  bullets: z.array(z.string().max(1000)).optional().default([]),
});

const jobSchema = z.object({
  role: z.string().trim().max(200).optional().default(""),
  company: z.string().trim().max(200).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  start: z.string().trim().max(100).optional().default(""),
  end: z.string().trim().max(100).optional().default(""),
  sections: z.array(jobSectionSchema).optional().default([]),
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

const projectSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
  tech: z.string().trim().max(300).optional().default(""),
  start: z.string().trim().max(100).optional().default(""),
  end: z.string().trim().max(100).optional().default(""),
  url: z.string().trim().max(1000).optional().default(""),
});

const languageSchema = z.object({
  name: z.string().trim().max(100).optional().default(""),
  level: z.string().trim().max(100).optional().default(""),
});

const publicationSchema = z.object({
  title: z.string().trim().max(300).optional().default(""),
  publisher: z.string().trim().max(200).optional().default(""),
  when: z.string().trim().max(100).optional().default(""),
  url: z.string().trim().max(1000).optional().default(""),
});

const awardSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  issuer: z.string().trim().max(200).optional().default(""),
  when: z.string().trim().max(100).optional().default(""),
});

export const resumeSchema = z.object({
  name: z.string().trim().max(200).optional().default(""),
  headline: z.string().trim().max(200).optional().default(""),
  summary: z.string().trim().max(2000).optional().default(""),
  contact: z
    .object({
      location: z.string().trim().max(200).optional().default(""),
      phone: z.string().trim().max(100).optional().default(""),
      email: z.string().trim().max(200).optional().default(""),
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
      url: z.string().trim().max(2000).optional().default(""),
      dataUrl: z.string().optional().default(""),
    })
    .optional()
    .default({ enabled: false, url: "", dataUrl: "" }),
  sectionVisibility: z.record(z.boolean()).optional().default({}),
  sectionOrder: z.array(z.string()).nullable().optional().default(null),
  theme: z.string().optional().default('teal'),
  template: z.string().optional().default('modern'),
  customSections: z.array(z.unknown()).optional().default([]),
});

export function validateResumeData(data) {
  return resumeSchema.safeParse(data);
}

