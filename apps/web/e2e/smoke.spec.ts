import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

test("gallery shows brand and templates", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByText("Resume Builder").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Start with a template" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Classic Sidebar" })).toBeVisible();
});

test("start blank opens editor", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Blank" }).first().click();
  await expect(page.getByRole("banner")).toContainText("Resume Builder");
  await expect(page.getByLabel("Editor")).toBeVisible();
  await page.getByLabel("Full name").fill("Ada Lovelace");
  await expect(page.getByLabel("Preview")).toContainText("Ada Lovelace");
});

test("import legacy resume json", async ({ page }) => {
  await page.goto("./");
  const fileInput = page.locator('input[type="file"][accept*="json"]');
  await fileInput.setInputFiles(path.join(here, "fixtures/arudchayan-resume.json"));
  await expect(page.getByLabel("Preview")).toContainText("Arudchayan Pirabaharan", { timeout: 10000 });
  await expect(page.getByLabel("Preview")).toContainText("Employment History");
});
