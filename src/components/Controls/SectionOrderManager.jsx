import { useState } from "react";
import { ArrowUpDown, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { SECTION_CONFIG } from "../../constants/sectionConfig";
import { toast } from "sonner";
import PropTypes from 'prop-types';

export default function SectionOrderManager({ sectionOrder, setSectionOrder }) {
  const [isOpen, setIsOpen] = useState(false);

  const resetOrder = () => {
    const defaultOrder = SECTION_CONFIG.map(s => s.id);
    setSectionOrder(defaultOrder);
    toast.success("Section order reset to default");
  };

  const getSectionLabel = (id) => {
    return SECTION_CONFIG.find(s => s.id === id)?.label || id;
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newOrder = [...sectionOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSectionOrder(newOrder);
  };

  const moveDown = (index) => {
    if (index === sectionOrder.length - 1) return;
    const newOrder = [...sectionOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSectionOrder(newOrder);
  };

  return (
    <div className="border-b p-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          aria-label="Section order controls"
          aria-expanded={isOpen}
          aria-controls="section-order-list"
        >
          <ArrowUpDown size={16} />
          Section Order
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {isOpen && (
          <button
            onClick={resetOrder}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border hover:bg-white transition-colors"
            aria-label="Reset section order to default"
          >
            <RotateCcw size={12} />
            Reset Order
          </button>
        )}
      </div>

      {isOpen && (
        <div id="section-order-list" className="mt-3 space-y-1">
          <p className="text-xs text-slate-500 mb-2">Drag sections below or use arrows to reorder</p>
          {sectionOrder.map((sectionId, index) => (
            <div
              key={sectionId}
              className="flex items-center gap-2 p-2 rounded border bg-white"
            >
              <span className="text-xs text-slate-400 w-6">{index + 1}.</span>
              <span className="text-xs flex-1">{getSectionLabel(sectionId)}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className={`p-1 text-xs rounded ${
                    index === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Move up"
                  aria-label={`Move ${getSectionLabel(sectionId)} section up`}
                >
                  ↑
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === sectionOrder.length - 1}
                  className={`p-1 text-xs rounded ${
                    index === sectionOrder.length - 1
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Move down"
                  aria-label={`Move ${getSectionLabel(sectionId)} section down`}
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

SectionOrderManager.propTypes = {
  sectionOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSectionOrder: PropTypes.func.isRequired,
};
