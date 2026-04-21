import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useId } from "react";
import { toast } from 'sonner';

import SortableSection from './SortableSection';
import IdentitySection from './IdentitySection';
import PhotoSection from './PhotoSection';
import ContactSection from './ContactSection';
import SkillsSection from './SkillsSection';
import EmploymentSection from './EmploymentSection';
import { Plus } from 'lucide-react';
import Section from '../UI/Section';
import Row from '../UI/Row';
import Label from '../UI/Label';
import Input from '../UI/Input';
import Textarea from '../UI/Textarea';

export default function EditorPanelWithDnd({ state, actions, sectionVisibility, sectionOrder, setSectionOrder, validationMessages = {} }) {
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

  const formId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return; // guard when dropped outside a droppable

    if (active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id);
      const newIndex = sectionOrder.indexOf(over.id);

      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      setSectionOrder(newOrder);
      toast.success('Section order updated');
    }
  };

  const isVisible = (sectionId) => sectionVisibility?.[sectionId] !== false;

  // Map section IDs to components
  const sectionComponents = {
    identity: (
      <SortableSection key="identity" id="identity">
        <IdentitySection state={state} update={update} />
      </SortableSection>
    ),
    photo: (
      <SortableSection key="photo" id="photo">
        <PhotoSection state={state} updatePhoto={updatePhoto} />
      </SortableSection>
    ),
    contact: (
      <SortableSection key="contact" id="contact">
        <ContactSection 
          state={state} 
          update={update} 
          addRow={addRow} 
          removeRow={removeRow} 
          setState={setState}
          validationMessages={validationMessages}
        />
      </SortableSection>
    ),
    skills: (
      <SortableSection key="skills" id="skills">
        <SkillsSection state={state} update={update} />
      </SortableSection>
    ),
    employment: (
      <SortableSection key="employment" id="employment">
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
      </SortableSection>
    ),
    projects: (
      <SortableSection key="projects" id="projects">
        <Section title="Projects">
          <div className="space-y-2">
            {state.projects.map((proj, idx) => (
              <Row key={idx} title="Project" onRemove={() => removeRow("projects", idx)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`${formId}-proj-${idx}-title`}>Project Title</Label>
                    <Input id={`${formId}-proj-${idx}-title`} value={proj.title} onChange={e=>{ const next = structuredClone(state); next.projects[idx].title = e.target.value; setState(next); }} maxLength={100}/>
                  </div>
                  <div>
                    <Label htmlFor={`${formId}-proj-${idx}-url`}>Project URL (optional)</Label>
                    <Input id={`${formId}-proj-${idx}-url`} value={proj.url} onChange={e=>{ const next = structuredClone(state); next.projects[idx].url = e.target.value; setState(next); }} placeholder="https://github.com/..."/>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label htmlFor={`${formId}-proj-${idx}-start`}>Start Date</Label>
                    <Input id={`${formId}-proj-${idx}-start`} value={proj.start} onChange={e=>{ const next = structuredClone(state); next.projects[idx].start = e.target.value; setState(next); }} placeholder="e.g., Jan 2024"/>
                  </div>
                  <div>
                    <Label htmlFor={`${formId}-proj-${idx}-end`}>End Date</Label>
                    <Input id={`${formId}-proj-${idx}-end`} value={proj.end} onChange={e=>{ const next = structuredClone(state); next.projects[idx].end = e.target.value; setState(next); }} placeholder="e.g., Present"/>
                  </div>
                </div>
                <div className="mt-3">
                  <Label htmlFor={`${formId}-proj-${idx}-desc`}>Description</Label>
                  <Textarea id={`${formId}-proj-${idx}-desc`} value={proj.description} onChange={e=>{ const next = structuredClone(state); next.projects[idx].description = e.target.value; setState(next); }} placeholder="Brief description of the project" maxLength={300}/>
                  <div className="text-xs text-slate-500 mt-1">{proj.description?.length || 0}/300 characters</div>
                </div>
                <div className="mt-3">
                  <Label htmlFor={`${formId}-proj-${idx}-tech`}>Technologies Used</Label>
                  <Input id={`${formId}-proj-${idx}-tech`} value={proj.tech} onChange={e=>{ const next = structuredClone(state); next.projects[idx].tech = e.target.value; setState(next); }} placeholder="e.g., React, Node.js, MongoDB" maxLength={150}/>
                </div>
              </Row>
            ))}
            <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("projects", {title:"", description:"", tech:"", start:"", end:"", url:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add project</button>
          </div>
        </Section>
      </SortableSection>
    ),
    certs: (
      <SortableSection key="certs" id="certs">
        <Section title="Certifications">
          <div className="space-y-2">
            {state.certs.map((c, idx) => (
              <Row key={idx} title="Certification" onRemove={() => removeRow("certs", idx)}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`${formId}-cert-${idx}-title`}>Title</Label>
                    <Input id={`${formId}-cert-${idx}-title`} value={c.title} onChange={e=>{ const next = structuredClone(state); next.certs[idx].title = e.target.value; setState(next); }} />
                  </div>
                  <div>
                    <Label htmlFor={`${formId}-cert-${idx}-org`}>Issuer</Label>
                    <Input id={`${formId}-cert-${idx}-org`} value={c.org} onChange={e=>{ const next = structuredClone(state); next.certs[idx].org = e.target.value; setState(next); }} />
                  </div>
                  <div>
                    <Label htmlFor={`${formId}-cert-${idx}-when`}>Date/Year</Label>
                    <Input id={`${formId}-cert-${idx}-when`} value={c.when} onChange={e=>{ const next = structuredClone(state); next.certs[idx].when = e.target.value; setState(next); }} />
                  </div>
                </div>
              </Row>
            ))}
            <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("certs", {title:"", org:"", when:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add certification</button>
          </div>
        </Section>
      </SortableSection>
    ),
    edus: (
      <SortableSection key="edus" id="edus">
        <Section title="Education">
          <div className="space-y-2">
            {state.edus.map((ed, idx) => (
              <Row key={idx} title="Education" onRemove={() => removeRow("edus", idx)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`${formId}-edu-${idx}-degree`}>Degree / Program</Label>
                    <Input id={`${formId}-edu-${idx}-degree`} value={ed.degree} onChange={e=>{ const next = structuredClone(state); next.edus[idx].degree = e.target.value; setState(next); }} />
                  </div>
                  <div>
                    <Label htmlFor={`${formId}-edu-${idx}-school`}>Institution</Label>
                    <Input id={`${formId}-edu-${idx}-school`} value={ed.school} onChange={e=>{ const next = structuredClone(state); next.edus[idx].school = e.target.value; setState(next); }} />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`${formId}-edu-${idx}-when`}>Dates (e.g., 2018 — 2021)</Label>
                  <Input id={`${formId}-edu-${idx}-when`} value={ed.when} onChange={e=>{ const next = structuredClone(state); next.edus[idx].when = e.target.value; setState(next); }} />
                </div>
              </Row>
            ))}
            <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("edus", {degree:"", school:"", when:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add education</button>
          </div>
        </Section>
      </SortableSection>
    ),
    languages: (
      <SortableSection key="languages" id="languages">
        <Section title="Languages">
          <div className="space-y-2">
            {state.languages.map((lang, idx) => (
              <Row key={idx} title="Language" onRemove={() => removeRow("languages", idx)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`${formId}-lang-${idx}-name`}>Language</Label>
                    <Input id={`${formId}-lang-${idx}-name`} value={lang.name} onChange={e=>{ const next = structuredClone(state); next.languages[idx].name = e.target.value; setState(next); }} placeholder="e.g., English"/>
                  </div>
                  <div>
                    <Label htmlFor={`${formId}-lang-${idx}-level`}>Proficiency Level</Label>
                    <Input id={`${formId}-lang-${idx}-level`} value={lang.level} onChange={e=>{ const next = structuredClone(state); next.languages[idx].level = e.target.value; setState(next); }} placeholder="e.g., Native, Fluent, Intermediate"/>
                  </div>
                </div>
              </Row>
            ))}
            <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("languages", {name:"", level:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add language</button>
          </div>
        </Section>
      </SortableSection>
    ),
    publications: (
      <SortableSection key="publications" id="publications">
        <Section title="Publications">
          <div className="space-y-2">
            {state.publications.map((pub, idx) => (
              <Row key={idx} title="Publication" onRemove={() => removeRow("publications", idx)}>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor={`${formId}-pub-${idx}-title`}>Title</Label>
                    <Input id={`${formId}-pub-${idx}-title`} value={pub.title} onChange={e=>{ const next = structuredClone(state); next.publications[idx].title = e.target.value; setState(next); }} placeholder="Paper or article title" maxLength={150}/>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`${formId}-pub-${idx}-publisher`}>Publisher/Venue</Label>
                      <Input id={`${formId}-pub-${idx}-publisher`} value={pub.publisher} onChange={e=>{ const next = structuredClone(state); next.publications[idx].publisher = e.target.value; setState(next); }} placeholder="Journal, conference, etc."/>
                    </div>
                    <div>
                      <Label htmlFor={`${formId}-pub-${idx}-when`}>Date</Label>
                      <Input id={`${formId}-pub-${idx}-when`} value={pub.when} onChange={e=>{ const next = structuredClone(state); next.publications[idx].when = e.target.value; setState(next); }} placeholder="e.g., 2024"/>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`${formId}-pub-${idx}-url`}>URL (optional)</Label>
                    <Input id={`${formId}-pub-${idx}-url`} value={pub.url} onChange={e=>{ const next = structuredClone(state); next.publications[idx].url = e.target.value; setState(next); }} placeholder="https://doi.org/..."/>
                  </div>
                </div>
              </Row>
            ))}
            <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("publications", {title:"", publisher:"", when:"", url:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add publication</button>
          </div>
        </Section>
      </SortableSection>
    ),
    awards: (
      <SortableSection key="awards" id="awards">
        <Section title="Awards & Honors">
          <div className="space-y-2">
            {state.awards.map((award, idx) => (
              <Row key={idx} title="Award" onRemove={() => removeRow("awards", idx)}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`${formId}-award-${idx}-title`}>Award Title</Label>
                    <Input id={`${formId}-award-${idx}-title`} value={award.title} onChange={e=>{ const next = structuredClone(state); next.awards[idx].title = e.target.value; setState(next); }} maxLength={100}/>
                  </div>
                  <div>
                    <Label htmlFor={`${formId}-award-${idx}-issuer`}>Issuing Organization</Label>
                    <Input id={`${formId}-award-${idx}-issuer`} value={award.issuer} onChange={e=>{ const next = structuredClone(state); next.awards[idx].issuer = e.target.value; setState(next); }}/>
                  </div>
                  <div>
                    <Label htmlFor={`${formId}-award-${idx}-when`}>Date/Year</Label>
                    <Input id={`${formId}-award-${idx}-when`} value={award.when} onChange={e=>{ const next = structuredClone(state); next.awards[idx].when = e.target.value; setState(next); }}/>
                  </div>
                </div>
              </Row>
            ))}
            <button className="px-2 py-1 text-xs rounded-lg border" onClick={()=>addRow("awards", {title:"", issuer:"", when:""})}><Plus className="inline -mt-0.5 mr-1" size={14}/>Add award</button>
          </div>
        </Section>
      </SortableSection>
    ),
  };

  // Filter visible sections and render in order
  const visibleSections = sectionOrder
    .filter(sectionId => isVisible(sectionId))
    .map(sectionId => sectionComponents[sectionId])
    .filter(Boolean);

  return (
    <div className="p-4 space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionOrder.filter(id => isVisible(id))}
          strategy={verticalListSortingStrategy}
        >
          {visibleSections}
        </SortableContext>
      </DndContext>
    </div>
  );
}
