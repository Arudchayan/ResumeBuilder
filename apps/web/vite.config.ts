import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  base: "/ResumeBuilder/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@resume/ui/styles.css",
        replacement: path.resolve(__dirname, "../../packages/ui/src/styles.css"),
      },
      {
        find: "@resume/core",
        replacement: path.resolve(__dirname, "../../packages/core/src/index.ts"),
      },
      {
        find: "@resume/ports",
        replacement: path.resolve(__dirname, "../../packages/ports/src/index.ts"),
      },
      {
        find: "@resume/storage",
        replacement: path.resolve(__dirname, "../../packages/storage/src/index.ts"),
      },
      {
        find: "@resume/templates",
        replacement: path.resolve(__dirname, "../../packages/templates/src/index.ts"),
      },
      {
        find: "@resume/export",
        replacement: path.resolve(__dirname, "../../packages/export/src/index.ts"),
      },
      {
        find: "@resume/ui",
        replacement: path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      },
    ],
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
