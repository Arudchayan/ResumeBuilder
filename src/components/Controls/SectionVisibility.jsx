import { useState } from "react";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { SECTION_CONFIG, isSectionEmpty } from "../../constants/sectionConfig";
import { toast } from "sonner";

export default function SectionVisibility({ state, sectionVisibility, setSectionVisibility }) {
  const [isOpen, setIsOpen] = useState(false);

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

  const visibleCount = Object.values(sectionVisibility).filter(Boolean).length;

  return (
    <div className="border-b p-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          {isOpen ? <EyeOff size={16} /> : <Eye size={16} />}
          Section Visibility ({visibleCount}/{SECTION_CONFIG.length})
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {isOpen && (
          <div className="flex gap-2">
            <button
              onClick={showAll}
              className="px-2 py-1 text-xs rounded border hover:bg-white transition-colors"
            >
              Show All
            </button>
            <button
              onClick={hideEmpty}
              className="px-2 py-1 text-xs rounded border hover:bg-white transition-colors"
            >
              Hide Empty
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SECTION_CONFIG.map(section => {
            const isEmpty = isSectionEmpty(state, section.id);
            return (
              <label
                key={section.id}
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
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
                />
                <span className="text-xs flex-1">
                  {section.label}
                  {isEmpty && <span className="text-slate-400 ml-1">(empty)</span>}
                  {section.required && <span className="text-slate-400 ml-1">*</span>}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
