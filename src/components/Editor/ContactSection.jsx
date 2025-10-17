import { Plus } from "lucide-react";
import Section from "../UI/Section";
import Row from "../UI/Row";
import Label from "../UI/Label";
import Input from "../UI/Input";

export default function ContactSection({ state, update, addRow, removeRow, setState }) {
  return (
    <Section title="Contact & Links">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label>Location</Label>
          <Input 
            value={state.contact.location} 
            onChange={e => update("contact.location", e.target.value)} 
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input 
            value={state.contact.phone} 
            onChange={e => update("contact.phone", e.target.value)} 
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input 
            value={state.contact.email} 
            onChange={e => update("contact.email", e.target.value)} 
          />
        </div>
      </div>

      <div className="space-y-2 mt-2">
        {state.links.map((l, idx) => (
          <Row key={idx} title="Link" onRemove={() => removeRow("links", idx)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Label</Label>
                <Input 
                  value={l.label} 
                  onChange={e => {
                    const next = structuredClone(state);
                    next.links[idx].label = e.target.value;
                    setState(next);
                  }}
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input 
                  value={l.url} 
                  onChange={e => {
                    const next = structuredClone(state);
                    next.links[idx].url = e.target.value;
                    setState(next);
                  }}
                />
              </div>
            </div>
          </Row>
        ))}
        <button 
          className="px-2 py-1 text-xs rounded-lg border" 
          onClick={() => addRow("links", {label:"LinkedIn", url:""})}
        >
          <Plus className="inline -mt-0.5 mr-1" size={14}/>Add link
        </button>
      </div>
    </Section>
  );
}
