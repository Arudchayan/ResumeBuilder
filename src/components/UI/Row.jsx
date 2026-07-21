import { memo } from "react";
import { Trash2 } from "lucide-react";
import PropTypes from 'prop-types';

const Row = memo(function Row({ title, onRemove, children }) {
  return (
    <div className="rb-row rounded-xl border p-3">
      <div className="rb-row-header mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        <button type="button" className="rb-row-remove px-2 py-1 text-xs rounded-lg border" onClick={onRemove}>
          <Trash2 className="inline -mt-0.5 mr-1" size={14}/>Remove
        </button>
      </div>
      {children}
    </div>
  );
});

Row.propTypes = {
  title: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Row;

