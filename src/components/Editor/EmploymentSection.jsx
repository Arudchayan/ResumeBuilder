import { useId } from "react";
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
  addRow,
}) {
  const base = useId();

  return (
    <Section title="Employment">
      <div className="space-y-2">
        {state.jobs.map((job, jdx) => (
          <Row key={jdx} title="Role" onRemove={() => removeJob(jdx)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`${base}-j${jdx}-role`}>Title / Role</Label>
                <Input
                  id={`${base}-j${jdx}-role`}
                  value={job.role}
                  onChange={(e) => updateJob(jdx, "role", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`${base}-j${jdx}-company`}>Company</Label>
                <Input
                  id={`${base}-j${jdx}-company`}
                  value={job.company}
                  onChange={(e) => updateJob(jdx, "company", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <Label htmlFor={`${base}-j${jdx}-loc`}>Location</Label>
                <Input
                  id={`${base}-j${jdx}-loc`}
                  value={job.location}
                  onChange={(e) => updateJob(jdx, "location", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`${base}-j${jdx}-start`}>Start (e.g., Jan 2024)</Label>
                <Input
                  id={`${base}-j${jdx}-start`}
                  value={job.start}
                  onChange={(e) => updateJob(jdx, "start", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`${base}-j${jdx}-end`}>End (e.g., Present)</Label>
                <Input
                  id={`${base}-j${jdx}-end`}
                  value={job.end}
                  onChange={(e) => updateJob(jdx, "end", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <h4 className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                Sub-sections (project areas)
              </h4>
              {job.sections.map((sub, sidx) => (
                <div key={sidx} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold">Sub-section</h5>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded-lg border"
                      onClick={() => removeJobSection(jdx, sidx)}
                    >
                      <Trash2 className="inline -mt-0.5 mr-1" size={14} />
                      Remove
                    </button>
                  </div>
                  <Label htmlFor={`${base}-j${jdx}-s${sidx}-title`}>Title</Label>
                  <Input
                    id={`${base}-j${jdx}-s${sidx}-title`}
                    value={sub.title}
                    onChange={(e) => updateJobSection(jdx, sidx, "title", e.target.value)}
                  />
                  <div className="mt-2 space-y-2">
                    {(sub.bullets || []).map((b, bidx) => (
                      <div key={bidx} className="grid grid-cols-[1fr_auto] gap-2 items-start">
                        <Textarea
                          id={`${base}-j${jdx}-s${sidx}-b${bidx}`}
                          value={b}
                          onChange={(e) => updateBullet(jdx, sidx, bidx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              addBullet(jdx, sidx);
                            }
                          }}
                          aria-label={`Bullet ${bidx + 1}`}
                        />
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded-lg border"
                          onClick={() => removeBullet(jdx, sidx, bidx)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded-lg border"
                      onClick={() => addBullet(jdx, sidx)}
                    >
                      <Plus className="inline -mt-0.5 mr-1" size={14} />
                      Add bullet
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="px-2 py-1 text-xs rounded-lg border"
                onClick={() => addJobSection(jdx)}
              >
                <Plus className="inline -mt-0.5 mr-1" size={14} />
                Add sub-section
              </button>
            </div>
          </Row>
        ))}
        <button
          type="button"
          className="px-2 py-1 text-xs rounded-lg border"
          onClick={() =>
            addRow("jobs", {
              role: "",
              company: "",
              location: "",
              start: "",
              end: "",
              sections: [{ title: "", bullets: [""] }],
            })
          }
        >
          <Plus className="inline -mt-0.5 mr-1" size={14} />
          Add role
        </button>
      </div>
    </Section>
  );
}
