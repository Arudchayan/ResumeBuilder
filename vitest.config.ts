import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/src/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
  },
});
