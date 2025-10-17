import { Plus, Trash2 } from "lucide-react";
import Section from "../UI/Section";
import Row from "../UI/Row";
import Label from "../UI/Label";
import Input from "../UI/Input";
import Textarea from "../UI/Textarea";

export default function EmploymentSection({ 
  state, 
  updateJob, 
  removeJob, 
  addJobSection, 
  removeJobSection, 
  updateJobSection, 
  addBullet, 
  updateBullet, 
  removeBullet, 
  addRow 
}) {
  return (
    <Section title="Employment">
      <div className="space-y-2">
        {state.jobs.map((job, jdx) => (
          <Row key={jdx} title="Role" onRemove={() => removeJob(jdx)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Title / Role</Label>
                <Input 
                  value={job.role} 
                  onChange={e => updateJob(jdx, "role", e.target.value)} 
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input 
                  value={job.company} 
                  onChange={e => updateJob(jdx, "company", e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <Label>Location</Label>
                <Input 
                  value={job.location} 
                  onChange={e => updateJob(jdx, "location", e.target.value)} 
                />
              </div>
              <div>
                <Label>Start (e.g., Jan 2024)</Label>
                <Input 
                  value={job.start} 
                  onChange={e => updateJob(jdx, "start", e.target.value)} 
                />
              </div>
              <div>
                <Label>End (e.g., Present)</Label>
                <Input 
                  value={job.end} 
                  onChange={e => updateJob(jdx, "end", e.target.value)} 
                />
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <h4 className="text-xs font-semibold tracking-wider text-slate-600 uppercase">Sub-sections (project areas)</h4>
              {job.sections.map((sub, sidx) => (
                <div key={sidx} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold">Sub-section</h5>
                    <button 
                      className="px-2 py-1 text-xs rounded-lg border" 
                      onClick={() => removeJobSection(jdx, sidx)}
                    >
                      <Trash2 className="inline -mt-0.5 mr-1" size={14}/>Remove
                    </button>
                  </div>
                  <Label>Title</Label>
                  <Input 
                    value={sub.title} 
                    onChange={e => updateJobSection(jdx, sidx, "title", e.target.value)} 
                  />
                  <div className="mt-2 space-y-2">
                    {(sub.bullets || []).map((b, bidx) => (
                      <div key={bidx} className="grid grid-cols-[1fr_auto] gap-2 items-start">
                        <Textarea 
                          value={b} 
                          onChange={e => updateBullet(jdx, sidx, bidx, e.target.value)} 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              addBullet(jdx, sidx);
                            }
                          }}
                        />
                        <button 
                          className="px-2 py-1 text-xs rounded-lg border" 
                          onClick={() => removeBullet(jdx, sidx, bidx)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button 
                      className="px-2 py-1 text-xs rounded-lg border" 
                      onClick={() => addBullet(jdx, sidx)}
                    >
                      <Plus className="inline -mt-0.5 mr-1" size={14}/>Add bullet
                    </button>
                  </div>
                </div>
              ))}
              <button 
                className="px-2 py-1 text-xs rounded-lg border" 
                onClick={() => addJobSection(jdx)}
              >
                <Plus className="inline -mt-0.5 mr-1" size={14}/>Add sub-section
              </button>
            </div>
          </Row>
        ))}
        <button 
          className="px-2 py-1 text-xs rounded-lg border" 
          onClick={() => addRow("jobs", { role:"", company:"", location:"", start:"", end:"", sections:[] })}
        >
          <Plus className="inline -mt-0.5 mr-1" size={14}/>Add role
        </button>
      </div>
    </Section>
  );
}
