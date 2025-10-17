import { useState } from "react";
import { Palette, ChevronDown, ChevronUp } from "lucide-react";
import { themes } from "../../constants/themes";
import { toast } from "sonner";

export default function ThemePicker({ theme, setTheme }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    toast.success(`Theme changed to ${themes[themeId].name}`);
  };

  const currentTheme = themes[theme] || themes.teal;

  return (
    <div className="border-b p-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <Palette size={16} />
          Color Theme: {currentTheme.name}
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(themes).map(([id, themeData]) => (
            <button
              key={id}
              onClick={() => handleThemeChange(id)}
              className={`flex items-center gap-2 p-2 rounded border transition-all ${
                theme === id
                  ? 'border-2 border-current shadow-md'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              style={{ borderColor: theme === id ? themeData.primary : undefined }}
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${themeData.gradient[0]} 0%, ${themeData.gradient[1]} 100%)` }}
              />
              <span className="text-xs flex-1 text-left">{themeData.name}</span>
              {theme === id && (
                <span className="text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
