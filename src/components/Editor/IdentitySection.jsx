import Section from "../UI/Section";
import Label from "../UI/Label";
import Input from "../UI/Input";
import Textarea from "../UI/Textarea";

export default function IdentitySection({ state, update }) {
  return (
    <Section title="Identity">
      <Label>Full name</Label>
      <Input 
        value={state.name} 
        onChange={e => update("name", e.target.value)} 
        placeholder="Your full name" 
        maxLength={100}
      />
      <div className="text-xs text-slate-500 mt-1">{state.name?.length || 0}/100 characters</div>
      
      <Label>Headline / Title</Label>
      <Input 
        value={state.headline} 
        onChange={e => update("headline", e.target.value)} 
        placeholder="e.g., Data & AI Engineer" 
        maxLength={100}
      />
      <div className="text-xs text-slate-500 mt-1">{state.headline?.length || 0}/100 characters</div>
      
      <Label>Profile summary</Label>
      <Textarea 
        value={state.summary} 
        onChange={e => update("summary", e.target.value)} 
        placeholder="2–3 sentences that sell your value" 
        maxLength={500}
      />
      <div className="text-xs text-slate-500 mt-1">{state.summary?.length || 0}/500 characters</div>
    </Section>
  );
}
