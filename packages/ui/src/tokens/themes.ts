export const themes = {
  teal: {
    name: "Teal",
    primary: "#14b8a6",
    dark: "#0f766e",
    light: "#5eead4",
    surface: "#f0f8f9",
  },
  blue: {
    name: "Professional Blue",
    primary: "#3b82f6",
    dark: "#1e40af",
    light: "#93c5fd",
    surface: "#eff6ff",
  },
  purple: {
    name: "Creative Purple",
    primary: "#a855f7",
    dark: "#7e22ce",
    light: "#d8b4fe",
    surface: "#faf5ff",
  },
  green: {
    name: "Nature Green",
    primary: "#22c55e",
    dark: "#15803d",
    light: "#86efac",
    surface: "#f0fdf4",
  },
  slate: {
    name: "Classic Gray",
    primary: "#64748b",
    dark: "#334155",
    light: "#cbd5e1",
    surface: "#f8fafc",
  },
  forest: {
    name: "Forest",
    primary: "#166534",
    dark: "#14532d",
    light: "#86efac",
    surface: "#f0fdf4",
  },
  copper: {
    name: "Copper",
    primary: "#b45309",
    dark: "#78350f",
    light: "#fcd34d",
    surface: "#fffbeb",
  },
  black: {
    name: "Executive Black",
    primary: "#1f2937",
    dark: "#030712",
    light: "#6b7280",
    surface: "#f9fafb",
  },
} as const;

export type ThemeId = keyof typeof themes;
export const defaultTheme: ThemeId = "teal";

export function themeCssVars(themeId: string): Record<string, string> {
  const theme = themes[themeId as ThemeId] ?? themes.teal;
  return {
    "--theme-primary": theme.primary,
    "--theme-dark": theme.dark,
    "--theme-light": theme.light,
    "--theme-surface": theme.surface,
  };
}
