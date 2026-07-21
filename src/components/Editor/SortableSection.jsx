import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export default function SortableSection({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`rb-sortable-section ${isDragging ? 'is-dragging' : ''}`}>
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="rb-drag-handle"
        title="Drag to reorder"
        aria-label="Drag to reorder section"
      >
        <GripVertical size={20} />
      </div>
      
      {/* Section Content */}
      <div className={isDragging ? 'ring-2 ring-teal-400 rounded-xl' : ''}>
        {children}
      </div>
    </div>
  );
}
