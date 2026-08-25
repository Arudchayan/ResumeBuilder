import type { CSSProperties } from "react";

export const themes = {
  teal: {
    name: "Teal",
    primary: "#14b8a6",
    dark: "#0f766e",
    surface: "#f0f8f9",
    gradient: ["#f7fbfb", "#f0f8f9"] as [string, string],
  },
  blue: {
    name: "Professional Blue",
    primary: "#3b82f6",
    dark: "#1e40af",
    surface: "#eff6ff",
    gradient: ["#eff6ff", "#dbeafe"] as [string, string],
  },
  purple: {
    name: "Creative Purple",
    primary: "#a855f7",
    dark: "#7e22ce",
    surface: "#faf5ff",
    gradient: ["#faf5ff", "#f3e8ff"] as [string, string],
  },
  green: {
    name: "Nature Green",
    primary: "#22c55e",
    dark: "#15803d",
    surface: "#f0fdf4",
    gradient: ["#f0fdf4", "#dcfce7"] as [string, string],
  },
  slate: {
    name: "Classic Gray",
    primary: "#64748b",
    dark: "#334155",
    surface: "#f8fafc",
    gradient: ["#f8fafc", "#f1f5f9"] as [string, string],
  },
  forest: {
    name: "Forest",
    primary: "#166534",
    dark: "#14532d",
    surface: "#f0fdf4",
    gradient: ["#f0fdf4", "#dcfce7"] as [string, string],
  },
  copper: {
    name: "Copper",
    primary: "#b45309",
    dark: "#78350f",
    surface: "#fffbeb",
    gradient: ["#fffbeb", "#fef3c7"] as [string, string],
  },
  black: {
    name: "Executive Black",
    primary: "#1f2937",
    dark: "#030712",
    surface: "#f9fafb",
    gradient: ["#f9fafb", "#f3f4f6"] as [string, string],
  },
} as const;

export type ThemeId = keyof typeof themes;

export function themeCssVars(themeId: string): CSSProperties {
  const theme = themes[themeId as ThemeId] ?? themes.teal;
  return {
    "--theme-primary": theme.primary,
    "--theme-dark": theme.dark,
    "--theme-surface": theme.surface,
    "--theme-gradient-from": theme.gradient[0],
    "--theme-gradient-to": theme.gradient[1],
  } as CSSProperties;
}
