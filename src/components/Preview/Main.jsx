import { memo } from "react";
import { cleanText, normalizeUrl } from "../../utils/dataHelpers";

const Main = memo(function Main({ state, sectionVisibility, sectionOrder }) {
  const isVisible = (sectionId) => sectionVisibility?.[sectionId] !== false;

  // Sections that belong in Main (not in Aside)
  const mainSections = ['employment', 'projects', 'certs', 'edus', 'languages', 'publications', 'awards'];
  
  // Map section IDs to components
  const sectionComponents = {
    employment: state.jobs?.length && isVisible('employment') ? (
      <section key="employment" className="mt-4">
        <h3 className="text-[12px] uppercase tracking-[0.18em] font-extrabold mb-2" style={{ color: 'var(--theme-dark)' }}>Employment History</h3>
        {state.jobs.map((job, i) => (
          <div key={i} className="mb-3">
            <div className="text-sm font-bold">{cleanText(job.role)}</div>
            <div className="text-slate-500 text-sm font-semibold">{[cleanText(job.company), cleanText(job.location)].filter(Boolean).join(", ")}</div>
            <div className="text-slate-500 text-xs mt-0.5">{[cleanText(job.start), cleanText(job.end)].filter(Boolean).join(" — ")}</div>

            {(job.sections || []).map((s, j) => (
              <div key={j} className="mt-2">
                {s.title ? <div className="font-semibold text-slate-900 mt-1">{cleanText(s.title)}</div> : null}
                {(s.bullets || []).filter(b=>b && b.trim()).map((b, k) => (
                  <div key={k} className="grid grid-cols-[12px_1fr] gap-2 text-[12.5px] my-1">
                    <span style={{ color: 'var(--theme-dark)' }}>•</span>
                    <span>{cleanText(b)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </section>
    ) : null,
    
    projects: state.projects?.length && isVisible('projects') ? (
      <section key="projects" className="mt-4">
        <h3 className="text-[12px] uppercase tracking-[0.18em] font-extrabold mb-2" style={{ color: 'var(--theme-dark)' }}>Projects</h3>
        {state.projects.map((proj, i) => (
          <div key={i} className="mb-3">
            <div className="text-sm font-bold">
              {cleanText(proj.title)}
              {proj.url && normalizeUrl(proj.url) ? (
                <a href={normalizeUrl(proj.url)} target="_blank" rel="noreferrer noopener" className="ml-2 text-xs hover:underline" style={{ color: 'var(--theme-primary)' }}>🔗</a>
              ) : null}
            </div>
            <div className="text-slate-500 text-xs mt-0.5">{[cleanText(proj.start), cleanText(proj.end)].filter(Boolean).join(" — ")}</div>
            {proj.description ? <p className="text-[12.5px] mt-1 text-slate-800">{cleanText(proj.description)}</p> : null}
            {proj.tech ? <div className="text-[11.5px] mt-1 text-slate-600"><span className="font-semibold">Tech:</span> {cleanText(proj.tech)}</div> : null}
          </div>
        ))}
      </section>
    ) : null,
    
    certs: state.certs?.length && isVisible('certs') ? (
      <section key="certs" className="mt-4">
        <h3 className="text-[12px] uppercase tracking-[0.18em] font-extrabold mb-2" style={{ color: 'var(--theme-dark)' }}>Certifications</h3>
        {state.certs.map((c, i) => (
          <div key={i} className="text-[12.5px] my-1">
            <span className="font-semibold">{cleanText(c.title)}</span> — {cleanText(c.org)} {c.when ? <span className="text-slate-500">({cleanText(c.when)})</span> : null}
          </div>
        ))}
      </section>
    ) : null,
    
    edus: state.edus?.length && isVisible('edus') ? (
      <section key="edus" className="mt-4">
        <h3 className="text-[12px] uppercase tracking-[0.18em] font-extrabold mb-2" style={{ color: 'var(--theme-dark)' }}>Education</h3>
        {state.edus.map((ed, i) => (
          <div key={i} className="text-[12.5px] my-1">
            <span className="font-semibold">{cleanText(ed.degree)}</span> — {cleanText(ed.school)} {ed.when ? <span className="text-slate-500">({cleanText(ed.when)})</span> : null}
          </div>
        ))}
      </section>
    ) : null,
    
    languages: state.languages?.length && isVisible('languages') ? (
      <section key="languages" className="mt-4">
        <h3 className="text-[12px] uppercase tracking-[0.18em] font-extrabold mb-2" style={{ color: 'var(--theme-dark)' }}>Languages</h3>
        {state.languages.map((lang, i) => (
          <div key={i} className="text-[12.5px] my-1">
            <span className="font-semibold">{cleanText(lang.name)}</span> {lang.level ? <span className="text-slate-500">— {cleanText(lang.level)}</span> : null}
          </div>
        ))}
      </section>
    ) : null,
    
    publications: state.publications?.length && isVisible('publications') ? (
      <section key="publications" className="mt-4">
        <h3 className="text-[12px] uppercase tracking-[0.18em] font-extrabold mb-2" style={{ color: 'var(--theme-dark)' }}>Publications</h3>
        {state.publications.map((pub, i) => (
          <div key={i} className="text-[12.5px] my-1.5">
            <div className="font-semibold">
              {cleanText(pub.title)}
              {pub.url && normalizeUrl(pub.url) ? (
                <a href={normalizeUrl(pub.url)} target="_blank" rel="noreferrer noopener" className="ml-1 text-xs hover:underline" style={{ color: 'var(--theme-primary)' }}>🔗</a>
              ) : null}
            </div>
            <div className="text-slate-600">
              {cleanText(pub.publisher)} {pub.when ? <span className="text-slate-500">({cleanText(pub.when)})</span> : null}
            </div>
          </div>
        ))}
      </section>
    ) : null,
    
    awards: state.awards?.length && isVisible('awards') ? (
      <section key="awards" className="mt-4">
        <h3 className="text-[12px] uppercase tracking-[0.18em] font-extrabold mb-2" style={{ color: 'var(--theme-dark)' }}>Awards & Honors</h3>
        {state.awards.map((award, i) => (
          <div key={i} className="text-[12.5px] my-1">
            <span className="font-semibold">{cleanText(award.title)}</span> — {cleanText(award.issuer)} {award.when ? <span className="text-slate-500">({cleanText(award.when)})</span> : null}
          </div>
        ))}
      </section>
    ) : null,
  };

  // Render sections in order
  const orderedSections = (sectionOrder || mainSections)
    .filter(id => mainSections.includes(id))
    .map(id => sectionComponents[id])
    .filter(Boolean);

  return (
    <div>
      <h1 className="text-3xl font-extrabold leading-tight">{cleanText(state.name) || "Your Name"}</h1>
      {state.headline ? <div className="font-bold mt-1" style={{ color: 'var(--theme-dark)' }}>{cleanText(state.headline)}</div> : null}
      <div className="h-1.5 w-16 rounded-full my-4" style={{ backgroundColor: 'var(--theme-primary)' }} />

      {state.summary && isVisible('identity') ? (
        <section className="mb-2">
          <h3 className="text-[12px] uppercase tracking-[0.18em] font-extrabold mb-2" style={{ color: 'var(--theme-dark)' }}>Profile</h3>
          <p className="text-[13px] leading-relaxed text-slate-800">{cleanText(state.summary)}</p>
        </section>
      ) : null}

      {/* Render sections in custom order */}
      {orderedSections}
    </div>
  );
});

export default Main;
