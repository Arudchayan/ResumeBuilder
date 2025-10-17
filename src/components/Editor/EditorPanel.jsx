import IdentitySection from "./IdentitySection";
import PhotoSection from "./PhotoSection";
import ContactSection from "./ContactSection";
import SkillsSection from "./SkillsSection";
import EmploymentSection from "./EmploymentSection";
import { Plus } from "lucide-react";
import Section from "../UI/Section";
import Row from "../UI/Row";
import Label from "../UI/Label";
import Input from "../UI/Input";
import Textarea from "../UI/Textarea";

export default function EditorPanel({ state, actions, sectionVisibility }) {
  const {
    update,
    updatePhoto,
    addRow,
    removeRow,
    setState,
    updateJob,
    removeJob,
    addJobSection,
    removeJobSection,
    updateJobSection,
    addBullet,
    updateBullet,
    removeBullet
  } = actions;

  const isVisible = (sectionId) => sectionVisibility?.[sectionId] !== false;

  return (
    <div className="p-4 space-y-4">
      {isVisible('identity') && <IdentitySection state={state} update={update} />}
      
      {isVisible('photo') && <PhotoSection state={state} updatePhoto={updatePhoto} />}
      
      {isVisible('contact') && (
        <ContactSection 
          state={state} 
          update={update} 
          addRow={addRow} 
          removeRow={removeRow} 
          setState={setState}
        />
      )}
      
      {isVisible('skills') && <SkillsSection state={state} update={update} />}
      
      {isVisible('employment') && (
        <EmploymentSection
          state={state}
          updateJob={updateJob}
          removeJob={removeJob}
          addJobSection={addJobSection}
          removeJobSection={removeJobSection}
          updateJobSection={updateJobSection}
          addBullet={addBullet}
          updateBullet={updateBullet}
          removeBullet={removeBullet}
          addRow={addRow}
        />
      )}

      {/* Projects Section */}
      {isVisible('projects') && (
      <Section title="Projects">
        <div className="space-y-2">
          {state.projects.map((proj, idx) => (
            <Row key={idx} title="Project" onRemove={() => removeRow("projects", idx)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Project Title</Label>
                  <Input value={proj.title} onChange={e=>{ const next = structuredClone(state); next.projects[idx].title = e.target.value; setState(next); }} maxLength={100}/>
                </div>
                <div>
                  <Label>Project URL (optional)</Label>
                  <Input value={proj.url} onChange={e=>{ const next = structuredClone(state); next.projects[idx].url = e.target.value; setState(next); }} placeholder="https://github.com/..."/>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <Label>Start Date</Label>
                  <Input value={proj.start} onChange={e=>{ const next = structuredClone(state); next.projects[idx].start = e.target.value; setState(next); }} placeholder="e.g., Jan 2024"/>
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input value={proj.end} onChange={e=>{ const next = structuredClone(state); next.projects[idx].end = e.target.value; setState(next); }} placeholder="e.g., Present"/>
                </div>
              </div>
              <div className="mt-3">
                <Label>Description</Label>
                <Textarea value={proj.description} onChange={e=>{ const next = structuredClone(state); next.projects[idx].description = e.target.value; setState(next); }} placeholder="Brief description of the project" maxLength={300}/>
                <div className="text-xs text-slate-500 mt-1">{proj.description?.length || 0}/300 characters</div>
              </div>
              <div className="mt-3">
                <Label>Technologies Used</Label>
                <Input value={proj.tech} onChange={e=>{ const next = structuredClone(state); next.projects[idx].tech = e.target.value; setState(next); }} placeholder="e.g., React, Node.js, MongoDB" maxLength={150}/>
              </div>
            </Row>
          ))}
          <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("projects", {title:"", description:"", tech:"", start:"", end:"", url:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add project</button>
        </div>
      </Section>
      )}

      {/* Certifications Section */}
      {isVisible('certs') && (
      <Section title="Certifications">
        <div className="space-y-2">
          {state.certs.map((c, idx) => (
            <Row key={idx} title="Certification" onRemove={() => removeRow("certs", idx)}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Title</Label>
                  <Input value={c.title} onChange={e=>{ const next = structuredClone(state); next.certs[idx].title = e.target.value; setState(next); }} />
                </div>
                <div>
                  <Label>Issuer</Label>
                  <Input value={c.org} onChange={e=>{ const next = structuredClone(state); next.certs[idx].org = e.target.value; setState(next); }} />
                </div>
                <div>
                  <Label>Date/Year</Label>
                  <Input value={c.when} onChange={e=>{ const next = structuredClone(state); next.certs[idx].when = e.target.value; setState(next); }} />
                </div>
              </div>
            </Row>
          ))}
          <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("certs", {title:"", org:"", when:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add certification</button>
        </div>
      </Section>
      )}

      {/* Education Section */}
      {isVisible('edus') && (
      <Section title="Education">
        <div className="space-y-2">
          {state.edus.map((ed, idx) => (
            <Row key={idx} title="Education" onRemove={() => removeRow("edus", idx)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Degree / Program</Label>
                  <Input value={ed.degree} onChange={e=>{ const next = structuredClone(state); next.edus[idx].degree = e.target.value; setState(next); }} />
                </div>
                <div>
                  <Label>Institution</Label>
                  <Input value={ed.school} onChange={e=>{ const next = structuredClone(state); next.edus[idx].school = e.target.value; setState(next); }} />
                </div>
              </div>
              <div>
                <Label>Dates (e.g., 2018 — 2021)</Label>
                <Input value={ed.when} onChange={e=>{ const next = structuredClone(state); next.edus[idx].when = e.target.value; setState(next); }} />
              </div>
            </Row>
          ))}
          <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("edus", {degree:"", school:"", when:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add education</button>
        </div>
      </Section>
      )}

      {/* Languages Section */}
      {isVisible('languages') && (
      <Section title="Languages">
        <div className="space-y-2">
          {state.languages.map((lang, idx) => (
            <Row key={idx} title="Language" onRemove={() => removeRow("languages", idx)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Language</Label>
                  <Input value={lang.name} onChange={e=>{ const next = structuredClone(state); next.languages[idx].name = e.target.value; setState(next); }} placeholder="e.g., English"/>
                </div>
                <div>
                  <Label>Proficiency Level</Label>
                  <Input value={lang.level} onChange={e=>{ const next = structuredClone(state); next.languages[idx].level = e.target.value; setState(next); }} placeholder="e.g., Native, Fluent, Intermediate"/>
                </div>
              </div>
            </Row>
          ))}
          <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("languages", {name:"", level:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add language</button>
        </div>
      </Section>
      )}

      {/* Publications Section */}
      {isVisible('publications') && (
      <Section title="Publications">
        <div className="space-y-2">
          {state.publications.map((pub, idx) => (
            <Row key={idx} title="Publication" onRemove={() => removeRow("publications", idx)}>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label>Title</Label>
                  <Input value={pub.title} onChange={e=>{ const next = structuredClone(state); next.publications[idx].title = e.target.value; setState(next); }} placeholder="Paper or article title" maxLength={150}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Publisher/Venue</Label>
                    <Input value={pub.publisher} onChange={e=>{ const next = structuredClone(state); next.publications[idx].publisher = e.target.value; setState(next); }} placeholder="Journal, conference, etc."/>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input value={pub.when} onChange={e=>{ const next = structuredClone(state); next.publications[idx].when = e.target.value; setState(next); }} placeholder="e.g., 2024"/>
                  </div>
                </div>
                <div>
                  <Label>URL (optional)</Label>
                  <Input value={pub.url} onChange={e=>{ const next = structuredClone(state); next.publications[idx].url = e.target.value; setState(next); }} placeholder="https://doi.org/..."/>
                </div>
              </div>
            </Row>
          ))}
          <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("publications", {title:"", publisher:"", when:"", url:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add publication</button>
        </div>
      </Section>
      )}

      {/* Awards Section */}
      {isVisible('awards') && (
      <Section title="Awards & Honors">
        <div className="space-y-2">
          {state.awards.map((award, idx) => (
            <Row key={idx} title="Award" onRemove={() => removeRow("awards", idx)}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Award Title</Label>
                  <Input value={award.title} onChange={e=>{ const next = structuredClone(state); next.awards[idx].title = e.target.value; setState(next); }} maxLength={100}/>
                </div>
                <div>
                  <Label>Issuing Organization</Label>
                  <Input value={award.issuer} onChange={e=>{ const next = structuredClone(state); next.awards[idx].issuer = e.target.value; setState(next); }}/>
                </div>
                <div>
                  <Label>Date/Year</Label>
                  <Input value={award.when} onChange={e=>{ const next = structuredClone(state); next.awards[idx].when = e.target.value; setState(next); }}/>
                </div>
              </div>
            </Row>
          ))}
          <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("awards", {title:"", issuer:"", when:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add award</button>
        </div>
      </Section>
      )}
    </div>
  );
}
