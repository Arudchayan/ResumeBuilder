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
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-3 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 z-10"
        title="Drag to reorder"
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
