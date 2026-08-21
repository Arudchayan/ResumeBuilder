import { useMemo, useState } from "react";
import { analyzeAtsMatch, type ResumeDocument } from "@resume/core";
import { Button, Dialog } from "@resume/ui";
import { CircleAlert, ScanSearch } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  skills: "Skills",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
};

function scoreColor(score: number) {
  if (score >= 70) return "#15803d";
  if (score >= 40) return "#a16207";
  return "#b91c1c";
}

export function AtsAnalyzer({ doc }: { doc: ResumeDocument }) {
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [submitted, setSubmitted] = useState("");

  const result = useMemo(
    () => (submitted.trim() ? analyzeAtsMatch(doc, submitted) : null),
    [doc, submitted],
  );

  const close = () => setOpen(false);

  return (
    <div className="ats-analyzer">
      <span className="settings-label">ATS match</span>
      <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        <ScanSearch className="h-4 w-4" aria-hidden="true" /> Analyze vs job description
      </Button>
      <Dialog open={open} title="ATS keyword match" onClose={close}>
        <p>
          Paste the job description below. Everything is analyzed locally — nothing leaves your browser.
        </p>
        <textarea
          className="mt-3 min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-[var(--theme-primary)] focus:ring-2"
          placeholder="Paste the full job description here…"
          aria-label="Job description"
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" onClick={close}>
            Close
          </Button>
          <Button
            disabled={!jobDescription.trim()}
            onClick={() => setSubmitted(jobDescription)}
          >
            <ScanSearch className="h-4 w-4" aria-hidden="true" /> Analyze
          </Button>
        </div>

        {result ? (
          <div className="ats-result mt-4 border-t border-slate-100 pt-4" aria-live="polite">
            <div className="flex items-center gap-3">
              <span
                className="grid h-14 w-14 place-items-center rounded-full text-lg font-bold text-white"
                style={{ background: scoreColor(result.score) }}
                aria-hidden="true"
              >
                {result.score}
              </span>
              <div className="text-sm">
                <p className="font-semibold text-slate-900">Keyword match score: {result.score}/100</p>
                <p className="text-slate-500">
                  {result.matched.length} matched · {result.missing.length} missing ·{" "}
                  {result.jdWordCount} JD words · {result.resumeWordCount} resume words
                </p>
              </div>
            </div>

            <p className="settings-label mt-4">Matched keywords</p>
            {result.matched.length ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {result.matched.map((match) => (
                  <li
                    key={match.keyword}
                    className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-900"
                    title={match.sources.map((source) => SOURCE_LABELS[source]).join(", ")}
                  >
                    {match.keyword}
                    <span className="ml-1 text-[0.65rem] text-teal-700">×{match.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state mt-2">No keywords matched yet.</p>
            )}

            <p className="settings-label mt-4">Missing keywords</p>
            {result.missing.length ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {result.missing.map((keyword) => (
                  <li
                    key={keyword}
                    className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-900"
                  >
                    <CircleAlert className="h-3 w-3" aria-hidden="true" />
                    {keyword}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state mt-2">Nothing missing — every keyword is covered.</p>
            )}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
