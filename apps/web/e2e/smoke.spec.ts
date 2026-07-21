import { test, expect } from "@playwright/test";

test("gallery shows brand and templates", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByText("Resume Forge").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose a template" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ATS Single Column" })).toBeVisible();
});

test("start blank opens editor", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Start blank" }).first().click();
  await expect(page.getByRole("banner")).toContainText("Resume Forge");
  await expect(page.getByLabel("Editor")).toBeVisible();
  await page.getByLabel("Full name").fill("Ada Lovelace");
  await expect(page.getByLabel("Preview")).toContainText("Ada Lovelace");
});
