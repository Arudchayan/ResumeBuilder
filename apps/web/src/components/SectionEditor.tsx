import type { ReactNode } from "react";
import type { ResumeCommand, ResumeDocument, ArrayKey } from "@resume/core";
import { Button, Field, TextAreaField } from "@resume/ui";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  doc: ResumeDocument;
  sectionId: string;
  apply: (command: ResumeCommand) => void;
}

function emptyItem(key: ArrayKey): unknown {
  switch (key) {
    case "links":
      return { label: "", url: "" };
    case "jobs":
      return {
        role: "",
        company: "",
        location: "",
        start: "",
        end: "",
        sections: [{ title: "", bullets: [""] }],
      };
    case "projects":
      return { title: "", description: "", tech: "", start: "", end: "", url: "" };
    case "certs":
      return { title: "", org: "", when: "" };
    case "edus":
      return { degree: "", school: "", when: "" };
    case "languages":
      return { name: "", level: "" };
    case "publications":
      return { title: "", publisher: "", when: "", url: "" };
    case "awards":
      return { title: "", issuer: "", when: "" };
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

export function SectionEditor({ doc, sectionId, apply }: Props) {
  switch (sectionId) {
    case "identity":
      return (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Identity</h2>
          <Field label="Full name" value={doc.name} onChange={(e) => apply({ type: "setField", path: "name", value: e.target.value })} />
          <Field label="Headline" value={doc.headline} onChange={(e) => apply({ type: "setField", path: "headline", value: e.target.value })} />
          <TextAreaField label="Summary" value={doc.summary} onChange={(e) => apply({ type: "setField", path: "summary", value: e.target.value })} />
        </div>
      );
    case "photo":
      return (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Photo</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={doc.photo.enabled}
              onChange={(e) => apply({ type: "setField", path: "photo.enabled", value: e.target.checked })}
            />
            Show photo on resume
          </label>
          <Field
            label="Photo URL"
            value={doc.photo.url}
            onChange={(e) => apply({ type: "setField", path: "photo.url", value: e.target.value })}
          />
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Upload image
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) return;
                const reader = new FileReader();
                reader.onload = () => {
                  apply({ type: "setField", path: "photo.dataUrl", value: String(reader.result || "") });
                  apply({ type: "setField", path: "photo.enabled", value: true });
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>
      );
    case "contact":
      return (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Contact & Links</h2>
          <Field label="Location" value={doc.contact.location} onChange={(e) => apply({ type: "setField", path: "contact.location", value: e.target.value })} />
          <Field label="Phone" value={doc.contact.phone} onChange={(e) => apply({ type: "setField", path: "contact.phone", value: e.target.value })} />
          <Field label="Email" value={doc.contact.email} onChange={(e) => apply({ type: "setField", path: "contact.email", value: e.target.value })} />
          <ArrayEditor
            title="Links"
            items={doc.links}
            onAdd={() => apply({ type: "addArrayItem", key: "links", item: emptyItem("links") })}
            onRemove={(index) => apply({ type: "removeArrayItem", key: "links", index })}
            renderItem={(item, index) => (
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Label" value={item.label} onChange={(e) => apply({ type: "updateArrayItem", key: "links", index, item: { ...item, label: e.target.value } })} />
                <Field label="URL" value={item.url} onChange={(e) => apply({ type: "updateArrayItem", key: "links", index, item: { ...item, url: e.target.value } })} />
              </div>
            )}
          />
        </div>
      );
    case "skills":
      return (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Skills</h2>
          <SkillChips
            skills={doc.skills}
            onChange={(skills) => apply({ type: "setSkills", skills })}
          />
        </div>
      );
    case "employment":
      return (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Employment</h2>
          <ArrayEditor
            title="Roles"
            items={doc.jobs}
            onAdd={() => apply({ type: "addArrayItem", key: "jobs", item: emptyItem("jobs") })}
            onRemove={(index) => apply({ type: "removeArrayItem", key: "jobs", index })}
            renderItem={(job, index) => (
              <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Role" value={job.role} onChange={(e) => apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, role: e.target.value } })} />
                  <Field label="Company" value={job.company} onChange={(e) => apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, company: e.target.value } })} />
                  <Field label="Location" value={job.location} onChange={(e) => apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, location: e.target.value } })} />
                  <Field label="Start" value={job.start} onChange={(e) => apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, start: e.target.value } })} />
                  <Field label="End" value={job.end} onChange={(e) => apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, end: e.target.value } })} />
                </div>
                {(job.sections ?? []).map((sec, sIdx) => (
                  <div key={sIdx} className="rounded-lg border border-slate-100 p-2">
                    <Field
                      label="Section title"
                      value={sec.title}
                      onChange={(e) => {
                        const sections = [...job.sections];
                        sections[sIdx] = { ...sec, title: e.target.value };
                        apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, sections } });
                      }}
                    />
                    <BulletEditor
                      bullets={sec.bullets}
                      onChange={(bullets) => {
                        const sections = [...job.sections];
                        sections[sIdx] = { ...sec, bullets };
                        apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, sections } });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          />
        </div>
      );
    case "projects":
    case "certs":
    case "edus":
    case "languages":
    case "publications":
    case "awards":
      return <GenericListSection doc={doc} sectionId={sectionId} apply={apply} />;
    default:
      return <p className="text-sm text-slate-600">Unknown section.</p>;
  }
}

function GenericListSection({
  doc,
  sectionId,
  apply,
}: {
  doc: ResumeDocument;
  sectionId: string;
  apply: (c: ResumeCommand) => void;
}) {
  const key = sectionId as ArrayKey;
  const titles: Record<string, string> = {
    projects: "Projects",
    certs: "Certifications",
    edus: "Education",
    languages: "Languages",
    publications: "Publications",
    awards: "Awards",
  };
  const items = doc[key] as Record<string, string>[];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl">{titles[sectionId]}</h2>
      <ArrayEditor
        title={titles[sectionId] ?? sectionId}
        items={items}
        onAdd={() => apply({ type: "addArrayItem", key, item: emptyItem(key) })}
        onRemove={(index) => apply({ type: "removeArrayItem", key, index })}
        renderItem={(item, index) => (
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.keys(item).map((field) => (
              <Field
                key={field}
                label={field}
                value={item[field] ?? ""}
                onChange={(e) =>
                  apply({
                    type: "updateArrayItem",
                    key,
                    index,
                    item: { ...item, [field]: e.target.value },
                  })
                }
              />
            ))}
          </div>
        )}
      />
    </div>
  );
}

function ArrayEditor<T>({
  title,
  items,
  onAdd,
  onRemove,
  renderItem,
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {title} #{index + 1}
            </span>
            <Button variant="ghost" aria-label={`Remove ${title} ${index + 1}`} onClick={() => onRemove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {renderItem(item, index)}
        </div>
      ))}
      <Button variant="secondary" onClick={onAdd}>
        <Plus className="h-4 w-4" /> Add {title}
      </Button>
    </div>
  );
}

function BulletEditor({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}) {
  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bullets</p>
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={b}
            aria-label={`Bullet ${i + 1}`}
            onChange={(e) => {
              const next = [...bullets];
              next[i] = e.target.value;
              onChange(next);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const next = [...bullets];
                next.splice(i + 1, 0, "");
                onChange(next);
              }
            }}
          />
          <Button
            variant="ghost"
            aria-label={`Remove bullet ${i + 1}`}
            onClick={() => onChange(bullets.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={() => onChange([...bullets, ""])}>
        <Plus className="h-4 w-4" /> Add bullet
      </Button>
    </div>
  );
}

function SkillChips({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <button
            key={skill}
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-[var(--theme-primary)]/10 px-3 py-1 text-sm text-[var(--theme-dark)]"
            onClick={() => onChange(skills.filter((s) => s !== skill))}
            aria-label={`Remove skill ${skill}`}
          >
            {skill} ×
          </button>
        ))}
      </div>
      <Field
        label="Add skill"
        placeholder="Type a skill and press Enter"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const value = (e.target as HTMLInputElement).value.trim();
            if (!value) return;
            if (!skills.includes(value)) onChange([...skills, value]);
            (e.target as HTMLInputElement).value = "";
          }
        }}
      />
    </div>
  );
}
