import { useId } from "react";
import Section from "../UI/Section";
import Label from "../UI/Label";
import Input from "../UI/Input";
import Textarea from "../UI/Textarea";

export default function IdentitySection({ state, update }) {
  const nameId = useId();
  const headlineId = useId();
  const summaryId = useId();

  return (
    <Section title="Identity">
      <Label htmlFor={nameId}>Full name</Label>
      <Input
        id={nameId}
        value={state.name} 
        onChange={e => update("name", e.target.value)} 
        placeholder="Your full name" 
        maxLength={100}
      />
      <div className="text-xs text-slate-500 mt-1">{state.name?.length || 0}/100 characters</div>
      
      <Label htmlFor={headlineId}>Headline / Title</Label>
      <Input
        id={headlineId}
        value={state.headline} 
        onChange={e => update("headline", e.target.value)} 
        placeholder="e.g., Data & AI Engineer" 
        maxLength={100}
      />
      <div className="text-xs text-slate-500 mt-1">{state.headline?.length || 0}/100 characters</div>
      
      <Label htmlFor={summaryId}>Profile summary</Label>
      <Textarea
        id={summaryId}
        value={state.summary} 
        onChange={e => update("summary", e.target.value)} 
        placeholder="2–3 short paragraphs that sell your value" 
        maxLength={2000}
      />
      <div className="text-xs text-slate-500 mt-1">{state.summary?.length || 0}/2000 characters</div>
    </Section>
  );
}
