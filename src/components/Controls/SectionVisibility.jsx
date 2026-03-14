import { useMemo, useState } from "react";
import { Eye, EyeOff, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";
import { SECTION_CONFIG, isSectionEmpty, getDefaultVisibility } from "../../constants/sectionConfig";
import { toast } from "sonner";
import PropTypes from 'prop-types';

export default function SectionVisibility({ state, sectionVisibility, setSectionVisibility, sectionOrder, setSectionOrder }) {
  const [isOpen, setIsOpen] = useState(false);
  const orderedSectionIds = useMemo(() => {
    if (sectionOrder && sectionOrder.length) return sectionOrder;
    return SECTION_CONFIG.map(section => section.id);
  }, [sectionOrder]);

  const toggleSection = (sectionId) => {
    const section = SECTION_CONFIG.find(s => s.id === sectionId);
    if (section?.required) {
      toast.warning(`${section.label} section cannot be hidden (required)`);
      return;
    }
    
    setSectionVisibility({
      ...sectionVisibility,
      [sectionId]: !sectionVisibility[sectionId]
    });
  };

  const showAll = () => {
    const newVisibility = {};
    SECTION_CONFIG.forEach(section => {
      newVisibility[section.id] = true;
    });
    setSectionVisibility(newVisibility);
    toast.success("All sections shown");
  };

  const hideEmpty = () => {
    const newVisibility = {};
    SECTION_CONFIG.forEach(section => {
      if (section.required) {
        newVisibility[section.id] = true;
      } else {
        newVisibility[section.id] = !isSectionEmpty(state, section.id);
      }
    });
    setSectionVisibility(newVisibility);
    toast.success("Empty sections hidden");
  };

  const hideOptional = () => {
    const newVisibility = { ...sectionVisibility };
    SECTION_CONFIG.forEach(section => {
      newVisibility[section.id] = section.required;
    });
    setSectionVisibility(newVisibility);
    toast.success("Optional sections hidden");
  };

  const resetDefaults = () => {
    setSectionVisibility(getDefaultVisibility());
    if (setSectionOrder) {
      setSectionOrder(SECTION_CONFIG.map(section => section.id));
    }
    toast.success("Sections reset to defaults");
  };

  const moveSection = (sectionId, direction) => {
    if (!setSectionOrder) return;
    const currentIndex = orderedSectionIds.indexOf(sectionId);
    if (currentIndex === -1) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= orderedSectionIds.length) return;
    const newOrder = [...orderedSectionIds];
    [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];
    setSectionOrder(newOrder);
    toast.success("Section order updated");
  };

  const visibleCount = Object.values(sectionVisibility).filter(Boolean).length;

  return (
    <div className="border-b p-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          aria-label={`Section visibility controls, ${visibleCount} of ${SECTION_CONFIG.length} sections visible`}
          aria-expanded={isOpen}
          aria-controls="section-visibility-options"
        >
          {isOpen ? <EyeOff size={16} /> : <Eye size={16} />}
          Section Visibility ({visibleCount}/{SECTION_CONFIG.length})
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {isOpen && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={showAll}
              className="px-2 py-1 text-xs rounded border hover:bg-white transition-colors"
              aria-label="Show all sections"
            >
              Show All
            </button>
            <button
              onClick={hideEmpty}
              className="px-2 py-1 text-xs rounded border hover:bg-white transition-colors"
              aria-label="Hide empty sections"
            >
              Hide Empty
            </button>
            <button
              onClick={hideOptional}
              className="px-2 py-1 text-xs rounded border hover:bg-white transition-colors"
              aria-label="Hide optional sections"
            >
              Hide Optional
            </button>
            <button
              onClick={resetDefaults}
              className="px-2 py-1 text-xs rounded border hover:bg-white transition-colors"
              aria-label="Reset section visibility and order"
            >
              Reset Defaults
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div id="section-visibility-options" className="mt-3 grid grid-cols-1 gap-2" role="group" aria-label="Section visibility toggles">
          {orderedSectionIds.map(sectionId => {
            const section = SECTION_CONFIG.find(s => s.id === sectionId);
            if (!section) return null;
            const isEmpty = isSectionEmpty(state, section.id);
            const index = orderedSectionIds.indexOf(section.id);
            return (
              <div
                key={section.id}
                className="flex items-center gap-2"
              >
                <label
                  className={`flex flex-1 items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    sectionVisibility[section.id] 
                      ? 'bg-white border-teal-300' 
                      : 'bg-slate-100 border-slate-300'
                  } ${section.required ? 'opacity-60 cursor-not-allowed' : 'hover:border-teal-400'}`}
                  onClick={(e) => {
                    if (section.required) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sectionVisibility[section.id] || false}
                    onChange={() => toggleSection(section.id)}
                    disabled={section.required}
                    className="cursor-pointer"
                    aria-label={`Toggle ${section.label} section visibility`}
                  />
                  <span className="text-xs flex-1">
                    {section.label}
                    {isEmpty && <span className="text-slate-400 ml-1">(empty)</span>}
                    {section.required && <span className="text-slate-400 ml-1">*</span>}
                  </span>
                </label>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    aria-label={`Move ${section.label} up`}
                    className="rounded border border-slate-200 p-1 text-slate-500 transition hover:border-teal-300 hover:text-teal-600 disabled:opacity-30"
                    onClick={() => moveSection(section.id, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${section.label} down`}
                    className="rounded border border-slate-200 p-1 text-slate-500 transition hover:border-teal-300 hover:text-teal-600 disabled:opacity-30"
                    onClick={() => moveSection(section.id, 1)}
                    disabled={index === orderedSectionIds.length - 1}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

SectionVisibility.propTypes = {
  state: PropTypes.object.isRequired,
  sectionVisibility: PropTypes.object.isRequired,
  setSectionVisibility: PropTypes.func.isRequired,
  sectionOrder: PropTypes.arrayOf(PropTypes.string),
  setSectionOrder: PropTypes.func.isRequired,
};
