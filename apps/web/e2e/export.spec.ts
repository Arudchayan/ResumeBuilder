import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = "/tmp/export-diag";

test.describe("PDF export", () => {
  test.beforeAll(() => {
    fs.mkdirSync(outDir, { recursive: true });
  });

  test("desktop copper theme exports a PDF (oklch-safe)", async ({ page }) => {
    test.setTimeout(180_000);
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleLogs.push(msg.text());
    });
    page.on("pageerror", (err) => consoleLogs.push(err.message));

    await page.goto("./");
    await page
      .locator('input[type="file"][accept*="json"]')
      .setInputFiles(path.join(here, "fixtures/arudchayan-resume.json"));
    await expect(page.getByLabel("Resume preview")).toContainText("Arudchayan Pirabaharan", {
      timeout: 10000,
    });
    await page.locator("#theme-select").selectOption("copper");

    const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
    await page.getByRole("button", { name: "Export PDF" }).click();
    const download = await downloadPromise;
    const pdfPath = path.join(outDir, "desktop.pdf");
    await download.saveAs(pdfPath);

    expect(fs.statSync(pdfPath).size).toBeGreaterThan(20_000);
    expect(consoleLogs.join("\n")).not.toMatch(/unsupported color function "oklch"/i);
    await expect(page.locator("[data-sonner-toast]").filter({ hasText: /PDF downloaded/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test("mobile edit pane exports PDF while preview is hidden", async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./");
    await page
      .locator('input[type="file"][accept*="json"]')
      .setInputFiles(path.join(here, "fixtures/arudchayan-resume.json"));
    await expect(page.getByRole("textbox", { name: "Full name" })).toBeVisible({ timeout: 10000 });

    const metrics = await page.evaluate(() => {
      const preview = document.querySelector<HTMLElement>(".workspace-preview");
      const sheet = document.querySelector<HTMLElement>(".sheet");
      return {
        previewDisplay: preview ? getComputedStyle(preview).display : "missing",
        sheetW: sheet?.offsetWidth ?? 0,
      };
    });
    expect(metrics.previewDisplay).toBe("none");
    expect(metrics.sheetW).toBe(0);

    const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
    await page.getByRole("button", { name: "PDF", exact: true }).click();
    const download = await downloadPromise;
    const pdfPath = path.join(outDir, "mobile-edit.pdf");
    await download.saveAs(pdfPath);
    expect(fs.statSync(pdfPath).size).toBeGreaterThan(20_000);
  });
});
