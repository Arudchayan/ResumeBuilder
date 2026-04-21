import packageJson from "../../package.json";

/** Product identity — keep package.json name/description aligned for releases. */
export const PRODUCT_NAME = "Resume Builder";
export const PRODUCT_TAGLINE =
  "Edit, preview, and export your résumé—with your data staying in this browser.";
export const APP_VERSION = packageJson.version;

/** Shown in About; override via VITE_SOURCE_URL for forks. */
export const SOURCE_URL =
  typeof import.meta.env.VITE_SOURCE_URL === "string" && import.meta.env.VITE_SOURCE_URL.trim()
    ? import.meta.env.VITE_SOURCE_URL.trim()
    : "https://github.com/Arudchayan/ResumeBuilder";
