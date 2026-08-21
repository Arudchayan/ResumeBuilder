import { describe, expect, it } from "vitest";
import { analyzeAtsMatch, blankResume, extractJobKeywords } from "../index.js";
import type { ResumeDocument } from "../index.js";

const JD = `
Senior Data Engineer — Remote
We are looking for a senior data engineer with strong Python and SQL skills.
You will build reproducible data pipelines in PySpark on Azure Databricks, own ETL
workflows, and partner with analytics teams. Requirements:
- 5+ years Python, SQL
- Experience with Apache Spark, DataOps and CI/CD
- Power BI dashboards for stakeholders
`;

function resumeWith(overrides: Partial<ResumeDocument> = {}): ResumeDocument {
  return blankResume({
    name: "Ada",
    headline: "Data Engineer",
    summary: "Builds reliable pipelines with Python.",
    skills: ["Python", "SQL", "PySpark", "Apache Spark", "Azure", "Databricks", "ETL", "DataOps"],
    jobs: [
      {
        role: "Data Engineer",
        company: "Acme",
        location: "",
        start: "2023",
        end: "",
        sections: [{ title: "", bullets: ["Built CI/CD pipelines and Power BI dashboards"] }],
      },
    ],
    ...overrides,
  });
}

describe("extractJobKeywords", () => {
  it("ranks frequent unigrams first and drops stopwords", () => {
    const keywords = extractJobKeywords("Python python SQL python sql team");
    expect(keywords[0]).toBe("python");
    expect(keywords).not.toContain("the");
    expect(keywords).toContain("sql");
  });

  it("keeps bigrams only when they repeat and beats their parts", () => {
    const keywords = extractJobKeywords(
      "machine learning machine learning machine learning spark spark",
    );
    expect(keywords).toContain("machine learning");
    expect(keywords).not.toContain("learning machine");
  });

  it("returns empty for empty input", () => {
    expect(extractJobKeywords("")).toEqual([]);
    expect(extractJobKeywords("   \n\t ")).toEqual([]);
  });

  it("preserves technical tokens like c++ and ci/cd", () => {
    const keywords = extractJobKeywords("c++ c++ ci/cd ci/cd go");
    expect(keywords).toContain("c++");
    expect(keywords).toContain("ci/cd");
  });
});

describe("analyzeAtsMatch", () => {
  it("scores a matching resume high against the JD", () => {
    const result = analyzeAtsMatch(resumeWith(), JD);
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.matched.map((m) => m.keyword)).toContain("python");
    expect(result.missing).not.toContain("pyspark");
  });

  it("scores an unrelated resume low", () => {
    const result = analyzeAtsMatch(
      resumeWith({
        skills: ["gardening"],
        jobs: [],
        summary: "",
        headline: "",
      }),
      JD,
    );
    expect(result.score).toBeLessThan(30);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it("reports keyword sources across sections", () => {
    const result = analyzeAtsMatch(resumeWith(), JD);
    const python = result.matched.find((m) => m.keyword === "python");
    expect(python?.sources).toContain("skills");
    const cicd = result.matched.find((m) => m.keyword === "ci/cd");
    expect(cicd?.sources).toContain("experience");
  });

  it("matches multi-word phrases inside bullet text", () => {
    const doc = resumeWith({
      jobs: [
        {
          role: "",
          company: "",
          location: "",
          start: "",
          end: "",
          sections: [
            { title: "", bullets: ["Owned machine learning experimentation end to end"] },
          ],
        },
      ],
      skills: [],
    });
    const jd = "Looking for machine learning experience. Machine learning is core to the role.";
    const result = analyzeAtsMatch(doc, jd);
    expect(result.matched.some((m) => m.keyword.includes("machine learning"))).toBe(true);
  });

  it("returns zero score when either side is empty", () => {
    expect(analyzeAtsMatch(blankResume(), "").score).toBe(0);
    expect(analyzeAtsMatch(resumeWith(), "").score).toBe(0);
  });

  it("counts words on both sides", () => {
    const result = analyzeAtsMatch(resumeWith(), "python python");
    expect(result.jdWordCount).toBe(2);
    expect(result.resumeWordCount).toBeGreaterThan(0);
  });

  it("is deterministic for identical inputs", () => {
    const a = analyzeAtsMatch(resumeWith(), JD);
    const b = analyzeAtsMatch(resumeWith(), JD);
    expect(a).toEqual(b);
  });
});
