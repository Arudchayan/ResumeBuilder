import { useId } from "react";
import { toast } from "sonner";
import PropTypes from 'prop-types';

export default function Textarea({
  className = "",
  error,
  helperText,
  maxLength,
  onChange,
  onPaste,
  ...rest
}) { 
  const helperId = useId();

  const handlePaste = (e) => {
    if (maxLength) {
      const paste = e.clipboardData.getData('text');
      const currentValue = e.target.value;
      const selectionStart = e.target.selectionStart;
      const selectionEnd = e.target.selectionEnd;
      const newValue = currentValue.substring(0, selectionStart) + paste + currentValue.substring(selectionEnd);
      
      if (newValue.length > maxLength) {
        e.preventDefault();
        const allowedPaste = paste.substring(0, maxLength - (currentValue.length - (selectionEnd - selectionStart)));
        const finalValue = currentValue.substring(0, selectionStart) + allowedPaste + currentValue.substring(selectionEnd);
        e.target.value = finalValue;
        if (onChange) {
          onChange({ target: { value: finalValue } });
        }
        toast.warning(`Text trimmed to ${maxLength} characters`);
      }
    }
    if (onPaste) onPaste(e);
  };

  const describedBy = error || helperText ? `${helperId}-helper` : undefined;

  return (
    <div className="space-y-1">
      <textarea
        {...rest}
        maxLength={maxLength}
        onChange={onChange}
        onPaste={handlePaste}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`w-full min-h-[90px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${error ? 'border-red-300 focus:ring-red-300' : 'border-slate-200 focus:ring-teal-400'} ${className}`}
      />
      {(error || helperText) && (
        <p id={describedBy} className={`text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
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
  error: PropTypes.string,
  helperText: PropTypes.string,
};

