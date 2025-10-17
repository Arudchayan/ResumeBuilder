export default function Label({ children, className = "" }) { 
  return <label className={`block text-[12px] text-slate-600 mb-1 ${className}`}>{children}</label>; 
}

