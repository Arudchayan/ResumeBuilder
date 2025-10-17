import { memo } from "react";
import { Trash2 } from "lucide-react";

const Row = memo(function Row({ title, onRemove, children }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        <button className="px-2 py-1 text-xs rounded-lg border" onClick={onRemove}>
          <Trash2 className="inline -mt-0.5 mr-1" size={14}/>Remove
        </button>
      </div>
      {children}
    </div>
  );
});

export default Row;

