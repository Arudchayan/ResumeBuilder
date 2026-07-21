import type { CSSProperties, ReactNode } from "react";
import type { ResumeDocument } from "@resume/core";
import { ensureSectionOrder } from "@resume/core";
import { themeCssVars } from "@resume/ui";

function visible(doc: ResumeDocument, id: string) {
  return doc.sectionVisibility?.[id] !== false;
}

function clean(v?: string) {
  return (v || "").trim();
}

function normalizeUrl(url?: string) {
  const raw = clean(url);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function Kv({
  label,
  value,
  href,
}: {
  label: string;
  value?: string;
  href?: string;
}) {
  const text = clean(value);
  if (!text) return null;
  return (
    <div className="my-2 text-[12px] text-slate-800">
      <div className="mb-0.5 text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="break-all leading-relaxed">
        {href ? (
          <a href={href} className="hover:underline" style={{ color: "var(--theme-primary)" }}>
            {text}
          </a>
        ) : (
          <span>{text}</span>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3
      className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.18em]"
      style={{ color: "var(--theme-dark)" }}
    >
      {children}
    </h3>
  );
}

/** Faithful classic two-column sheet — matches the pre-rewrite teal layout. */
export function ClassicSidebarSheet({
  doc,
  contentPadding = 48,
  fontScale = 100,
  onSectionClick,
  className = "",
}: {
  doc: ResumeDocument;
  contentPadding?: number;
  fontScale?: number;
  onSectionClick?: (sectionId: string) => void;
  className?: string;
}) {
  const vars = themeCssVars(doc.theme) as CSSProperties;
  const photoSrc = doc.photo?.enabled ? doc.photo.dataUrl || doc.photo.url : "";
  const mainSectionIds = ["employment", "projects", "certs", "edus", "languages", "publications", "awards"];
  const order = (ensureSectionOrder(doc).filter((id) => mainSectionIds.includes(id)) as string[]) || mainSectionIds;

  const click = (id: string) => (onSectionClick ? { onClick: () => onSectionClick(id), role: "button" as const, tabIndex: 0 } : {});

  const sectionNodes: Record<string, ReactNode> = {
    employment:
      doc.jobs.length && visible(doc, "employment") ? (
        <section key="employment" className="mt-4" {...click("employment")}>
          <SectionTitle>Employment History</SectionTitle>
          {doc.jobs.map((job, i) => (
            <div key={i} className="mb-3">
              <div className="text-sm font-bold">{clean(job.role)}</div>
              <div className="text-sm font-semibold text-slate-500">
                {[clean(job.company), clean(job.location)].filter(Boolean).join(", ")}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {[clean(job.start), clean(job.end)].filter(Boolean).join(" — ")}
              </div>
              {(job.sections || []).map((s, j) => (
                <div key={j} className="mt-2">
                  {s.title ? <div className="mt-1 font-semibold text-slate-900">{clean(s.title)}</div> : null}
                  {(s.bullets || [])
                    .filter((b) => b && b.trim())
                    .map((b, k) => (
                      <div
                        key={k}
                        className="my-1 grid gap-2 text-[12.5px]"
                        style={{ gridTemplateColumns: "12px 1fr" }}
                      >
                        <span style={{ color: "var(--theme-dark)" }}>•</span>
                        <span>{clean(b)}</span>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </section>
      ) : null,

    projects:
      doc.projects.length && visible(doc, "projects") ? (
        <section key="projects" className="mt-4" {...click("projects")}>
          <SectionTitle>Projects</SectionTitle>
          {doc.projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <div className="text-sm font-bold">
                {clean(proj.title)}
                {proj.url && normalizeUrl(proj.url) ? (
                  <a
                    href={normalizeUrl(proj.url)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="ml-1.5 text-xs hover:underline"
                    style={{ color: "var(--theme-primary)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    ↗
                  </a>
                ) : null}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {[clean(proj.start), clean(proj.end)].filter(Boolean).join(" — ")}
              </div>
              {proj.description ? (
                <p className="mt-1 text-[12.5px] text-slate-800">{clean(proj.description)}</p>
              ) : null}
              {proj.tech ? (
                <div className="mt-1 text-[11.5px] text-slate-600">
                  <span className="font-semibold">Tech:</span> {clean(proj.tech)}
                </div>
              ) : null}
            </div>
          ))}
        </section>
      ) : null,

    certs:
      doc.certs.length && visible(doc, "certs") ? (
        <section key="certs" className="mt-4" {...click("certs")}>
          <SectionTitle>Certifications</SectionTitle>
          {doc.certs.map((c, i) => (
            <div key={i} className="my-1 text-[12.5px]">
              <span className="font-semibold">{clean(c.title)}</span>
              {c.org ? <> — {clean(c.org)}</> : null}{" "}
              {c.when ? <span className="text-slate-500">({clean(c.when)})</span> : null}
            </div>
          ))}
        </section>
      ) : null,

    edus:
      doc.edus.length && visible(doc, "edus") ? (
        <section key="edus" className="mt-4" {...click("edus")}>
          <SectionTitle>Education</SectionTitle>
          {doc.edus.map((ed, i) => (
            <div key={i} className="my-1 text-[12.5px]">
              <span className="font-semibold">{clean(ed.degree)}</span>
              {ed.school ? <> — {clean(ed.school)}</> : null}{" "}
              {ed.when ? <span className="text-slate-500">({clean(ed.when)})</span> : null}
            </div>
          ))}
        </section>
      ) : null,

    languages:
      doc.languages.length && visible(doc, "languages") ? (
        <section key="languages" className="mt-4" {...click("languages")}>
          <SectionTitle>Languages</SectionTitle>
          {doc.languages.map((lang, i) => (
            <div key={i} className="my-1 text-[12.5px]">
              <span className="font-semibold">{clean(lang.name)}</span>{" "}
              {lang.level ? <span className="text-slate-500">— {clean(lang.level)}</span> : null}
            </div>
          ))}
        </section>
      ) : null,

    publications:
      doc.publications.length && visible(doc, "publications") ? (
        <section key="publications" className="mt-4" {...click("publications")}>
          <SectionTitle>Publications</SectionTitle>
          {doc.publications.map((pub, i) => (
            <div key={i} className="my-1.5 text-[12.5px]">
              <div className="font-semibold">
                {clean(pub.title)}
                {pub.url && normalizeUrl(pub.url) ? (
                  <a
                    href={normalizeUrl(pub.url)}
                    className="ml-1 text-xs hover:underline"
                    style={{ color: "var(--theme-primary)" }}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ↗
                  </a>
                ) : null}
              </div>
              <div className="text-slate-600">
                {clean(pub.publisher)}{" "}
                {pub.when ? <span className="text-slate-500">({clean(pub.when)})</span> : null}
              </div>
            </div>
          ))}
        </section>
      ) : null,

    awards:
      doc.awards.length && visible(doc, "awards") ? (
        <section key="awards" className="mt-4" {...click("awards")}>
          <SectionTitle>Awards & Honors</SectionTitle>
          {doc.awards.map((award, i) => (
            <div key={i} className="my-1 text-[12.5px]">
              <span className="font-semibold">{clean(award.title)}</span>
              {award.issuer ? <> — {clean(award.issuer)}</> : null}{" "}
              {award.when ? <span className="text-slate-500">({clean(award.when)})</span> : null}
            </div>
          ))}
        </section>
      ) : null,
  };

  return (
    <div
      className={`sheet border bg-white shadow-lg ${className}`}
      data-template="sidebar"
      style={{
        ...vars,
        width: "210mm",
        minHeight: "297mm",
        fontSize: `${fontScale}%`,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="grid" style={{ gridTemplateColumns: "30% 1fr", minHeight: "297mm" }}>
        <aside
          className="border-r"
          style={{
            padding: `${contentPadding}px ${contentPadding * 0.667}px`,
            background:
              "linear-gradient(180deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%)",
          }}
        >
          {photoSrc && visible(doc, "photo") ? (
            <div className="mb-6 flex items-center justify-center" {...click("photo")}>
              <img
                src={photoSrc}
                alt="Profile photo"
                crossOrigin="anonymous"
                className="h-28 w-28 rounded-full border object-cover shadow-sm"
              />
            </div>
          ) : null}

          {visible(doc, "contact") ? (
            <div {...click("contact")}>
              <h4
                className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.18em]"
                style={{ color: "var(--theme-dark)" }}
              >
                Details
              </h4>
              <Kv label="Location" value={doc.contact.location} />
              <Kv
                label="Phone"
                value={doc.contact.phone}
                href={
                  clean(doc.contact.phone).replace(/[^\d+]/g, "").length >= 5
                    ? `tel:${clean(doc.contact.phone).replace(/[^\d+]/g, "")}`
                    : undefined
                }
              />
              <Kv
                label="Email"
                value={doc.contact.email}
                href={doc.contact.email ? `mailto:${doc.contact.email}` : undefined}
              />

              {doc.links?.length ? (
                <>
                  <h4
                    className="mb-2 mt-6 text-[12px] font-extrabold uppercase tracking-[0.18em]"
                    style={{ color: "var(--theme-dark)" }}
                  >
                    Links
                  </h4>
                  <div className="space-y-1.5">
                    {doc.links.map((l, i) => {
                      const href = normalizeUrl(l.url);
                      const label = clean(l.label);
                      if (!href || !label) return null;
                      return (
                        <div key={i}>
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="block text-[12px] font-medium hover:underline"
                            style={{ color: "var(--theme-primary)" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {label}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {doc.skills?.length && visible(doc, "skills") ? (
            <div className="mt-6" {...click("skills")}>
              <h4
                className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.18em]"
                style={{ color: "var(--theme-dark)" }}
              >
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {doc.skills.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-full border bg-slate-50 px-3 py-1 text-[11.5px] text-slate-800"
                  >
                    {clean(s)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <main style={{ padding: `${contentPadding}px` }}>
          <div {...click("identity")}>
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900">
              {clean(doc.name) || "Your Name"}
            </h1>
            {doc.headline ? (
              <div className="mt-1 font-bold" style={{ color: "var(--theme-dark)" }}>
                {clean(doc.headline)}
              </div>
            ) : null}
            <div
              className="my-4 h-1.5 w-16 rounded-full"
              style={{ backgroundColor: "var(--theme-primary)" }}
            />
            {doc.summary && visible(doc, "identity") ? (
              <section className="mb-2">
                <SectionTitle>Profile</SectionTitle>
                <p className="text-[13px] leading-relaxed text-slate-800">{clean(doc.summary)}</p>
              </section>
            ) : null}
          </div>

          {order.map((id) => sectionNodes[id])}
        </main>
      </div>
    </div>
  );
}
