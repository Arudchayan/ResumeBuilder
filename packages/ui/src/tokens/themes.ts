export const themes = {
  teal: {
    name: "Teal",
    primary: "#0f766e",
    dark: "#115e59",
    light: "#5eead4",
    surface: "#f0fdfa",
  },
  blue: {
    name: "Ocean",
    primary: "#1d4ed8",
    dark: "#1e3a8a",
    light: "#93c5fd",
    surface: "#eff6ff",
  },
  slate: {
    name: "Slate",
    primary: "#334155",
    dark: "#0f172a",
    light: "#94a3b8",
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
