import { toast } from "sonner";
import PropTypes from 'prop-types';

export default function Textarea(props) { 
  const handlePaste = (e) => {
    if (props.maxLength) {
      const paste = e.clipboardData.getData('text');
      const currentValue = e.target.value;
      const selectionStart = e.target.selectionStart;
      const selectionEnd = e.target.selectionEnd;
      const newValue = currentValue.substring(0, selectionStart) + paste + currentValue.substring(selectionEnd);
      
      if (newValue.length > props.maxLength) {
        e.preventDefault();
        const allowedPaste = paste.substring(0, props.maxLength - (currentValue.length - (selectionEnd - selectionStart)));
        const finalValue = currentValue.substring(0, selectionStart) + allowedPaste + currentValue.substring(selectionEnd);
        e.target.value = finalValue;
        if (props.onChange) {
          props.onChange({ target: { value: finalValue } });
        }
        toast.warning(`Text trimmed to ${props.maxLength} characters`);
      }
    }
  };
  
  return <textarea {...props} onPaste={handlePaste} className={`w-full min-h-[90px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-400 ${props.className||""}`} />; 
}

Textarea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onPaste: PropTypes.func,
  maxLength: PropTypes.number,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
};

