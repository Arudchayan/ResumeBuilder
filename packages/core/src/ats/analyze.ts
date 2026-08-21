import type { ResumeDocument } from "../schema/resume.js";

export interface AtsKeywordMatch {
  keyword: string;
  count: number;
  /** Where the keyword was found on the resume. */
  sources: Array<"skills" | "summary" | "experience" | "education">;
}

export interface AtsAnalyzerResult {
  /** 0–100 keyword match score, weighted by how often each keyword appears in the job description. */
  score: number;
  matched: AtsKeywordMatch[];
  missing: string[];
  jdWordCount: number;
  resumeWordCount: number;
}

const STOPWORDS = new Set([
  "a",
  "all",
  "also",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "been",
  "being",
  "but",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "our",
  "per",
  "so",
  "the",
  "their",
  "this",
  "to",
  "with",
  "will",
  "you",
  "your",
  // Generic job-ad vocabulary that carries no keyword signal.
  "ability",
  "apply",
  "benefits",
  "build",
  "candidate",
  "candidates",
  "employer",
  "experience",
  "experienced",
  "inclusive",
  "join",
  "looking",
  "must",
  "opportunity",
  "own",
  "partner",
  "plus",
  "position",
  "preferred",
  "require",
  "required",
  "requires",
  "requirements",
  "responsibilities",
  "responsibility",
  "role",
  "roles",
  "seeking",
  "should",
  "skill",
  "skills",
  "stakeholder",
  "stakeholders",
  "strong",
  "team",
  "teams",
  "we",
  "work",
  "working",
  "works",
  "year",
  "years",
]);

const TOKEN_SPLIT = /[^a-z0-9+#./-]+/;
const EDGE_NOISE = /^[.#/-]+|[.#/-]+$/g;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(TOKEN_SPLIT)
    .map((token) => token.replace(EDGE_NOISE, ""))
    .filter((token) => token.length > 1 && /[a-z]/.test(token) && !STOPWORDS.has(token));
}

/** Frequency of each unigram and adjacent-word bigram in a piece of text. */
function termFrequencies(text: string): Map<string, number> {
  const words = tokenize(text);
  const freq = new Map<string, number>();
  const bump = (term: string) => freq.set(term, (freq.get(term) ?? 0) + 1);
  for (let i = 0; i < words.length; i++) {
    bump(words[i]!);
    const next = words[i + 1];
    if (next) bump(`${words[i]} ${next}`);
  }
  return freq;
}

function selectKeywords(freq: Map<string, number>, limit: number): Array<[string, number]> {
  const byFreq = (a: [string, number], b: [string, number]) =>
    b[1] - a[1] || a[0].localeCompare(b[0]);

  const unigrams: Array<[string, number]> = [];
  const bigrams: Array<[string, number]> = [];
  for (const entry of freq) {
    if (entry[0].includes(" ")) {
      if (entry[1] >= 2) bigrams.push(entry);
    } else {
      unigrams.push(entry);
    }
  }
  unigrams.sort(byFreq);
  bigrams.sort(byFreq);

  // Keep top repeated phrases, skipping near-duplicates like "learning machine"
  // once "machine learning" is already chosen.
  const phraseSlots = Math.min(bigrams.length, Math.max(4, Math.floor(limit / 6)));
  const chosenBigrams: Array<[string, number]> = [];
  for (const entry of bigrams) {
    const tokens = entry[0].split(" ");
    const duplicated = chosenBigrams.some(([term]) => {
      const chosenTokens = term.split(" ");
      return tokens.every((token) => chosenTokens.includes(token));
    });
    if (duplicated) continue;
    chosenBigrams.push(entry);
    if (chosenBigrams.length >= phraseSlots) break;
  }

  return [...chosenBigrams, ...unigrams].sort(byFreq).slice(0, limit);
}

/** Extract candidate keywords (frequency-ranked unigrams + repeated phrases) from a pasted job description. */
export function extractJobKeywords(description: string, limit = 30): string[] {
  if (!description.trim()) return [];
  return selectKeywords(termFrequencies(description), limit).map(([term]) => term);
}

interface ResumeTextBuckets {
  skills: string[];
  summary: string;
  experience: string[];
  education: string[];
}

function resumeTextBuckets(doc: ResumeDocument): ResumeTextBuckets {
  const skills = (doc.skills ?? []).map((skill) => skill.toLowerCase());
  const summary = doc.summary?.toLowerCase() ?? "";

  const experience: string[] = [];
  for (const job of doc.jobs ?? []) {
    experience.push(job.role ?? "", job.company ?? "");
    for (const section of job.sections ?? []) {
      experience.push(section.title ?? "");
      for (const bullet of section.bullets ?? []) experience.push(bullet);
    }
  }
  for (const project of doc.projects ?? []) {
    experience.push(project.title ?? "", project.description ?? "", project.tech ?? "");
  }
  for (const cert of doc.certs ?? []) experience.push(cert.title ?? "", cert.org ?? "");

  const education: string[] = [];
  for (const edu of doc.edus ?? []) education.push(edu.degree ?? "", edu.school ?? "");

  return { skills, summary, experience, education };
}

/** Flatten a resume into one plain-text blob, mirroring what an ATS parser would read. */
export function resumeToPlainText(doc: ResumeDocument): string {
  const buckets = resumeTextBuckets(doc);
  return [
    doc.name ?? "",
    doc.headline ?? "",
    buckets.summary,
    buckets.skills.join(" "),
    buckets.experience.join(" "),
    buckets.education.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
}

function entryTokens(entry: string): string[] {
  return entry
    .toLowerCase()
    .split(TOKEN_SPLIT)
    .map((token) => token.replace(EDGE_NOISE, ""))
    .filter(Boolean);
}

function hasSubsequence(haystack: string[], needles: string[]): boolean {
  let cursor = 0;
  for (const needle of needles) {
    let found = -1;
    for (let i = cursor; i < haystack.length; i++) {
      if (haystack[i] === needle) {
        found = i;
        break;
      }
    }
    if (found < 0) return false;
    cursor = found + 1;
  }
  return true;
}

function findSources(term: string, buckets: ResumeTextBuckets): AtsKeywordMatch["sources"] {
  const sources: AtsKeywordMatch["sources"] = [];
  const push = (source: AtsKeywordMatch["sources"][number], hit: boolean) => {
    if (hit && !sources.includes(source)) sources.push(source);
  };

  const inList = (list: string[]) =>
    list.some((entry) => {
      const tokens = entryTokens(entry);
      if (term.includes(" ")) return hasSubsequence(tokens, term.split(" "));
      return tokens.includes(term);
    });

  push("skills", inList(buckets.skills));
  push("summary", entryTokens(buckets.summary).includes(term));
  push("experience", inList(buckets.experience));
  push("education", inList(buckets.education));
  return sources;
}

function countOccurrences(term: string, text: string): number {
  if (!term || !text) return 0;
  let count = 0;
  let from = 0;
  for (;;) {
    const index = text.indexOf(term, from);
    if (index < 0) break;
    count++;
    from = index + term.length;
  }
  return count;
}

/**
 * Score a resume against a pasted job description by keyword overlap.
 * Deterministic and local: frequency-ranked unigrams and repeated phrases are
 * extracted from the JD, then matched against skills, summary, experience,
 * and education text. Score is weighted by JD frequency, so keywords the
 * employer repeats matter more than one-off mentions.
 */
export function analyzeAtsMatch(resume: ResumeDocument, jobDescription: string): AtsAnalyzerResult {
  const jdTokens = tokenize(jobDescription);
  const jdWordCount = jdTokens.length;
  const resumeText = resumeToPlainText(resume);
  const resumeWordCount = tokenize(resumeText).length;

  const selected = selectKeywords(termFrequencies(jobDescription), 30);
  const totalWeight = selected.reduce((sum, [, freq]) => sum + freq, 0);
  const buckets = resumeTextBuckets(resume);
  const flatResume = resumeText.toLowerCase();

  const matched: AtsKeywordMatch[] = [];
  const missing: string[] = [];
  let matchedWeight = 0;

  for (const [keyword, freq] of selected) {
    const sources = findSources(keyword, buckets);
    if (sources.length > 0) {
      matchedWeight += freq;
      matched.push({ keyword, count: Math.max(countOccurrences(keyword, flatResume), 1), sources });
    } else {
      missing.push(keyword);
    }
  }

  const score = totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);
  return { score, matched, missing, jdWordCount, resumeWordCount };
}

