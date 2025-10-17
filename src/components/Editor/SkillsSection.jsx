import { useMemo } from "react";
import Section from "../UI/Section";
import Input from "../UI/Input";

export default function SkillsSection({ state, update }) {
  const asChips = useMemo(() => (state.skills || []).filter(Boolean), [state.skills]);
  
  return (
    <Section title="Skills (comma-separated)">
      <Input 
        value={state.skills.join(", ")} 
        onChange={e => update("skills", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} 
        placeholder="e.g., ETL, Databricks, Python, Spark"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {asChips.map((s, i) => (
          <span key={i} className="px-3 py-1 rounded-full border text-xs bg-slate-50">{s}</span>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-1">Use commas to separate skills. They'll render as tidy pills.</p>
    </Section>
  );
}
