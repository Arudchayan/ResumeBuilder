import { test, expect } from "@playwright/test";

test.describe("PDF template gallery", () => {
  test("gallery shows all three templates with live sample previews", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByRole("heading", { name: "Start with a template" })).toBeVisible();

    for (const id of ["sidebar", "ats", "compact"]) {
      const card = page.locator(`[data-template-card="${id}"]`);
      await expect(card).toBeVisible();
    }

    // Live previews render real sample content, not skeleton thumbs.
    const firstSheet = page.locator(".sheet").first();
    await expect(firstSheet).toContainText("Arudchayan Pirabaharan");
    await expect(firstSheet).toContainText("Senior Data Engineer");
  });

  test("clicking a card switches the live preview without leaving the gallery", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByTestId("gallery-selected-template")).toHaveText("Classic Sidebar");

    await page.locator('[data-template-card="ats"]').click();
    await expect(page.getByTestId("gallery-selected-template")).toHaveText("ATS Single Column");
    await expect(page.getByTestId("gallery-preview-title")).toHaveText("ATS Single Column");

    const previewSheets = page.getByLabel("Template preview").locator(".sheet");
    await expect(previewSheets.first()).toHaveAttribute("data-template", "ats");

    await page.locator('[data-template-card="compact"]').click();
    await expect(page.getByTestId("gallery-preview-title")).toHaveText("Compact Modern");
    await expect(previewSheets.last()).toHaveAttribute("data-template", "compact");

    await page.locator('[data-template-card="sidebar"]').click();
    await expect(page.locator(".sheet").last()).toHaveAttribute("data-template", "sidebar");
  });

  test("selected template is used when starting from gallery", async ({ page }) => {
    await page.goto("./");
    await page.locator('[data-template-card="compact"]').click();
    await expect(page.getByTestId("gallery-selected-template")).toHaveText("Compact Modern");

    await page.getByRole("button", { name: "Load sample" }).click();
    await expect(page.getByRole("banner")).toContainText("Compact Modern");
    await expect(page.getByLabel("Resume preview").locator(".sheet")).toHaveAttribute(
      "data-template",
      "compact",
    );
  });
});
