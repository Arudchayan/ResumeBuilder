import type { ResumeDocument } from "@resume/core";

export type SkillsDensity = "comfortable" | "compact";

/** Auto-pick compact skills when the list is long. */
export function defaultSkillsDensity(doc: ResumeDocument): SkillsDensity {
  return (doc.skills?.length ?? 0) > 12 ? "compact" : "comfortable";
}

/** Hide sections that rarely belong on a tight 1–2 page CV. */
export function applyOnePageVisibility(doc: ResumeDocument): Record<string, boolean> {
  const next = { ...(doc.sectionVisibility ?? {}) };
  next.photo = false;
  next.publications = false;
  next.awards = false;
  // Keep core narrative; certs often push length — hide when many.
  if ((doc.certs?.length ?? 0) > 4) next.certs = false;
  return next;
}

/** Keep the most recent N jobs visible by truncating older roles in a copy. */
export function trimOlderJobs(doc: ResumeDocument, keep = 3): ResumeDocument {
  if (doc.jobs.length <= keep) return doc;
  return { ...doc, jobs: doc.jobs.slice(0, keep) };
}
