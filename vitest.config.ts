import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    passWithNoTests: true,
    projects: [
      {
        test: {
          include: ["packages/*/src/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
          name: "unit",
        },
      },
      {
        test: {
          include: ["apps/web/src/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
          exclude: ["**/node_modules/**", "**/e2e/**", "**/dist/**"],
          name: "web",
        },
      },
    ],
  },
});
