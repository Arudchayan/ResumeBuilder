import type { ReactNode } from "react";
import type { ArrayKey, ResumeCommand, ResumeDocument } from "@resume/core";
import { Button, Field, TextAreaField } from "@resume/ui";
import { Plus, Trash2, Upload } from "lucide-react";

interface Props {
  doc: ResumeDocument;
  sectionId: string;
  apply: (command: ResumeCommand) => void;
}

const sectionCopy: Record<string, { title: string; description: string }> = {
  identity: { title: "Identity", description: "Make the first impression clear: your name, positioning, and short profile." },
  photo: { title: "Photo", description: "Add an optional professional photo for templates that support it." },
  contact: { title: "Contact & links", description: "Give recruiters an easy way to reach you and find your work." },
  skills: { title: "Skills", description: "Keep this focused on tools, methods, and strengths relevant to the role." },
  employment: { title: "Employment", description: "Show impact with concise roles, dates, and evidence-led bullet points." },
  projects: { title: "Projects", description: "Highlight selected work with the outcome, stack, and a useful link." },
  certs: { title: "Certifications", description: "List credentials that add signal for the roles you are targeting." },
  edus: { title: "Education", description: "Add degrees, institutions, and dates in the order you want them shown." },
  languages: { title: "Languages", description: "Share languages and proficiency when they are relevant to the role." },
  publications: { title: "Publications", description: "Add articles, papers, or other work that strengthens your profile." },
  awards: { title: "Awards & honors", description: "Include meaningful recognition with the organization and date." },
};

function SectionIntro({ sectionId, count }: { sectionId: string; count?: number }) {
  const copy = sectionCopy[sectionId] ?? { title: sectionId, description: "Add the details you want to appear on your resume." };
  return (
    <div className="section-editor-heading">
      <div className="flex items-center justify-between gap-3">
        <h2>{copy.title}</h2>
        {count !== undefined ? <span className="section-count">{count} {count === 1 ? "item" : "items"}</span> : null}
      </div>
      <p>{copy.description}</p>
    </div>
  );
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
        <div className="section-editor">
          <SectionIntro sectionId={sectionId} />
          <div className="field-stack">
            <Field
              label="Full name"
              placeholder="e.g. Arudchayan Pirabaharan"
              value={doc.name}
              onChange={(event) => apply({ type: "setField", path: "name", value: event.target.value })}
            />
            <Field
              label="Professional headline"
              placeholder="e.g. Software Engineer · Product-minded builder"
              value={doc.headline}
              onChange={(event) => apply({ type: "setField", path: "headline", value: event.target.value })}
            />
            <TextAreaField
              label="Profile summary"
              placeholder="Two or three sentences that connect your experience to the work you want next."
              value={doc.summary}
              onChange={(event) => apply({ type: "setField", path: "summary", value: event.target.value })}
            />
          </div>
        </div>
      );

    case "photo":
      return (
        <div className="section-editor">
          <SectionIntro sectionId={sectionId} />
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--workspace-line)] bg-white/70 px-3 text-sm font-semibold text-[var(--workspace-ink)]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--theme-primary)]"
              checked={doc.photo.enabled}
              onChange={(event) => apply({ type: "setField", path: "photo.enabled", value: event.target.checked })}
            />
            Show photo on resume
          </label>
          <div className="field-stack">
            <Field
              label="Photo URL"
              placeholder="https://…"
              value={doc.photo.url}
              onChange={(event) => apply({ type: "setField", path: "photo.url", value: event.target.value })}
            />
            <label className="grid gap-2 rounded-xl border border-dashed border-[#bfd6d1] bg-[#f6fbf9] p-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500">
              <span>Upload image</span>
              <span className="flex min-h-10 items-center gap-2 rounded-lg border border-white bg-white px-3 text-sm font-semibold normal-case tracking-normal text-[var(--workspace-ink)]">
                <Upload className="h-4 w-4 text-[var(--theme-dark)]" aria-hidden="true" /> Choose an image
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file || file.size > 5 * 1024 * 1024) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      apply({ type: "setField", path: "photo.dataUrl", value: String(reader.result || "") });
                      apply({ type: "setField", path: "photo.enabled", value: true });
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </span>
              <span className="normal-case tracking-normal text-slate-400">JPG, PNG, or WebP up to 5 MB.</span>
            </label>
          </div>
        </div>
      );

    case "contact":
      return (
        <div className="section-editor">
          <SectionIntro sectionId={sectionId} count={doc.links.length} />
          <div className="field-stack">
            <Field label="Location" placeholder="City, country" value={doc.contact.location} onChange={(event) => apply({ type: "setField", path: "contact.location", value: event.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone" placeholder="+94 …" value={doc.contact.phone} onChange={(event) => apply({ type: "setField", path: "contact.phone", value: event.target.value })} />
              <Field label="Email" placeholder="you@example.com" value={doc.contact.email} onChange={(event) => apply({ type: "setField", path: "contact.email", value: event.target.value })} />
            </div>
          </div>
          <ArrayEditor
            title="Links"
            items={doc.links}
            onAdd={() => apply({ type: "addArrayItem", key: "links", item: emptyItem("links") })}
            onRemove={(index) => apply({ type: "removeArrayItem", key: "links", index })}
            renderItem={(item, index) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label" placeholder="LinkedIn" value={item.label} onChange={(event) => apply({ type: "updateArrayItem", key: "links", index, item: { ...item, label: event.target.value } })} />
                <Field label="URL" placeholder="https://…" value={item.url} onChange={(event) => apply({ type: "updateArrayItem", key: "links", index, item: { ...item, url: event.target.value } })} />
              </div>
            )}
          />
        </div>
      );

    case "skills":
      return (
        <div className="section-editor">
          <SectionIntro sectionId={sectionId} count={doc.skills.length} />
          <SkillChips skills={doc.skills} onChange={(skills) => apply({ type: "setSkills", skills })} />
        </div>
      );

    case "employment":
      return (
        <div className="section-editor">
          <SectionIntro sectionId={sectionId} count={doc.jobs.length} />
          <ArrayEditor
            title="Roles"
            items={doc.jobs}
            onAdd={() => apply({ type: "addArrayItem", key: "jobs", item: emptyItem("jobs") })}
            onRemove={(index) => apply({ type: "removeArrayItem", key: "jobs", index })}
            renderItem={(job, index) => (
              <div className="field-stack">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Role" placeholder="Senior software engineer" value={job.role} onChange={(event) => apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, role: event.target.value } })} />
                  <Field label="Company" placeholder="Company name" value={job.company} onChange={(event) => apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, company: event.target.value } })} />
                  <Field label="Location" placeholder="Remote or city" value={job.location} onChange={(event) => apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, location: event.target.value } })} />
                  <Field label="Start" placeholder="Jan 2023" value={job.start} onChange={(event) => apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, start: event.target.value } })} />
                  <Field label="End" placeholder="Present" value={job.end} onChange={(event) => apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, end: event.target.value } })} />
                </div>
                {(job.sections ?? []).map((section, sectionIndex) => (
                  <div key={sectionIndex} className="grid gap-3 rounded-xl border border-[#e7efed] bg-[#fbfdfc] p-3">
                    <Field
                      label="Role focus (optional)"
                      placeholder="What you owned"
                      value={section.title}
                      onChange={(event) => {
                        const sections = [...(job.sections ?? [])];
                        sections[sectionIndex] = { ...section, title: event.target.value };
                        apply({ type: "updateArrayItem", key: "jobs", index, item: { ...job, sections } });
                      }}
                    />
                    <BulletEditor
                      bullets={section.bullets ?? []}
                      onChange={(bullets) => {
                        const sections = [...(job.sections ?? [])];
                        sections[sectionIndex] = { ...section, bullets };
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
      return <p className="empty-state">This section is not available in the current document.</p>;
  }
}

function GenericListSection({ doc, sectionId, apply }: { doc: ResumeDocument; sectionId: string; apply: (command: ResumeCommand) => void }) {
  const key = sectionId as ArrayKey;
  const items = doc[key] as Record<string, string>[];

  return (
    <div className="section-editor">
      <SectionIntro sectionId={sectionId} count={items.length} />
      <ArrayEditor
        title={sectionCopy[sectionId]?.title ?? sectionId}
        items={items}
        onAdd={() => apply({ type: "addArrayItem", key, item: emptyItem(key) })}
        onRemove={(index) => apply({ type: "removeArrayItem", key, index })}
        renderItem={(item, index) => (
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.keys(item).map((field) => {
              const label = friendlyFieldLabel(field);
              const update = (value: string) =>
                apply({ type: "updateArrayItem", key, index, item: { ...item, [field]: value } });
              if (field === "description") {
                return <TextAreaField key={field} label={label} value={item[field] ?? ""} onChange={(event) => update(event.target.value)} className="sm:col-span-2" />;
              }
              return <Field key={field} label={label} value={item[field] ?? ""} onChange={(event) => update(event.target.value)} />;
            })}
          </div>
        )}
      />
    </div>
  );
}

function friendlyFieldLabel(field: string) {
  const labels: Record<string, string> = {
    title: "Title",
    description: "Description",
    tech: "Tech stack",
    start: "Start",
    end: "End",
    url: "URL",
    org: "Organization",
    degree: "Degree",
    school: "Institution",
    when: "Date",
    name: "Language",
    level: "Proficiency",
    publisher: "Publisher",
    issuer: "Issuer",
  };
  return labels[field] ?? field.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

function ArrayEditor<T>({ title, items, onAdd, onRemove, renderItem }: { title: string; items: T[]; onAdd: () => void; onRemove: (index: number) => void; renderItem: (item: T, index: number) => ReactNode }) {
  return (
    <div className="entry-list">
      {items.length === 0 ? <p className="empty-state">Nothing here yet. Add an entry when you are ready.</p> : null}
      {items.map((item, index) => (
        <div key={index} className="entry-card">
          <div className="entry-card-head">
            <span className="entry-card-title">{title} <span className="entry-card-index">#{index + 1}</span></span>
            <Button
              variant="ghost"
              className="button-danger !min-h-9 !rounded-lg !px-2"
              aria-label={`Remove ${title} ${index + 1}`}
              title={`Remove ${title} ${index + 1}`}
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          {renderItem(item, index)}
        </div>
      ))}
      <Button variant="secondary" className="w-full" onClick={onAdd}>
        <Plus className="h-4 w-4" aria-hidden="true" /> Add {title}
      </Button>
    </div>
  );
}

function BulletEditor({ bullets, onChange }: { bullets: string[]; onChange: (bullets: string[]) => void }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="settings-label">Impact bullets</p>
        <span className="text-xs text-slate-400">Press Enter for a new bullet</span>
      </div>
      {bullets.map((bullet, index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="mt-3 text-[var(--theme-dark)]" aria-hidden="true">•</span>
          <input
            className="field-control min-w-0 flex-1 rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
            value={bullet}
            aria-label={`Impact bullet ${index + 1}`}
            placeholder="Describe the result, not just the responsibility"
            onChange={(event) => {
              const next = [...bullets];
              next[index] = event.target.value;
              onChange(next);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              const next = [...bullets];
              next.splice(index + 1, 0, "");
              onChange(next);
            }}
          />
          <Button
            variant="ghost"
            className="button-danger !min-h-10 !rounded-lg !px-2"
            aria-label={`Remove bullet ${index + 1}`}
            title={`Remove bullet ${index + 1}`}
            onClick={() => onChange(bullets.filter((_, bulletIndex) => bulletIndex !== index))}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" className="justify-self-start !min-h-9 !rounded-lg !px-2.5 text-xs" onClick={() => onChange([...bullets, ""])}>
        <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add bullet
      </Button>
    </div>
  );
}

function SkillChips({ skills, onChange }: { skills: string[]; onChange: (skills: string[]) => void }) {
  return (
    <div className="grid gap-4">
      {skills.length ? (
        <div className="flex flex-wrap gap-2" aria-label="Current skills">
          {skills.map((skill) => (
            <button
              key={skill}
              type="button"
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--theme-primary)_22%,white)] bg-[color-mix(in_srgb,var(--theme-primary)_9%,white)] px-3 text-sm font-semibold text-[var(--theme-dark)] transition hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--theme-primary)_15%,white)]"
              onClick={() => onChange(skills.filter((current) => current !== skill))}
              aria-label={`Remove skill ${skill}`}
              title={`Remove ${skill}`}
            >
              {skill} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="empty-state">Add a few focused skills. Click a chip later to remove it.</p>
      )}
      <Field
        label="Add a skill"
        placeholder="Type a skill and press Enter"
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          const input = event.target as HTMLInputElement;
          const value = input.value.trim();
          if (!value) return;
          if (!skills.includes(value)) onChange([...skills, value]);
          input.value = "";
        }}
      />
    </div>
  );
}
