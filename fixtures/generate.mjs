import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// Use built dist
const { sampleResume } = await import("../packages/core/dist/index.js");

const root = dirname(fileURLToPath(import.meta.url));
const doc = sampleResume();
writeFileSync(join(root, "sample-sidebar.json"), JSON.stringify(doc, null, 2));
writeFileSync(join(root, "sample-ats.json"), JSON.stringify({ ...doc, template: "ats", id: "fixture-ats" }, null, 2));
writeFileSync(
  join(root, "sample-compact.json"),
  JSON.stringify({ ...doc, template: "compact", id: "fixture-compact" }, null, 2),
);
console.log("fixtures written");
