import { describe, expect, it } from "vitest";
import { pickThemeColors } from "../pdf/exportPdf.js";

describe("pickThemeColors", () => {
  it("prefers the first source that defines --theme-primary (sheet over :root)", () => {
    expect(
      pickThemeColors([
        {
          "--theme-primary": "#b45309",
          "--theme-dark": "#78350f",
          "--theme-light": "#fcd34d",
          "--theme-gradient-from": "#fffbeb",
          "--theme-gradient-to": "#fef3c7",
        },
        {
          "--theme-primary": "#0f766e",
          "--theme-dark": "#115e59",
        },
      ]),
    ).toEqual({
      primary: "#b45309",
      dark: "#78350f",
      light: "#fcd34d",
      gradientFrom: "#fffbeb",
      gradientTo: "#fef3c7",
    });
  });

  it("skips empty sheet tokens and uses workspace", () => {
    const colors = pickThemeColors([
      { "--theme-primary": "  " },
      { "--theme-primary": "#3b82f6", "--theme-dark": "#1e40af" },
    ]);
    expect(colors.primary).toBe("#3b82f6");
    expect(colors.dark).toBe("#1e40af");
  });

  it("returns teal defaults when nothing is set", () => {
    expect(pickThemeColors([null, undefined, {}]).primary).toBe("#14b8a6");
  });
});
