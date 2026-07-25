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

  test("sample 2026 resume: page guides + multi-page PDF", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto("./");
    await page
      .locator('input[type="file"][accept*="json"]')
      .setInputFiles(path.join(here, "fixtures/arudchayan-sample-2026.json"));
    await expect(page.getByLabel("Resume preview")).toContainText("Arudchayan Pirabaharan", {
      timeout: 10000,
    });
    await expect(page.getByLabel("Resume preview")).toContainText("Senior Data Engineer");
    await expect(page.getByLabel("Resume preview")).toContainText("University of Basel");

    // Legacy template: modern → sidebar
    await expect(page.locator(".sheet")).toHaveAttribute("data-template", "sidebar");

    await expect(page.getByTestId("paper-meta")).toContainText("A4");
    await expect(page.getByTestId("page-count-label")).toContainText(/Exports as \d+ × A4 pages?/);

    const pageCountText = await page.getByTestId("page-count-label").innerText();
    const match = pageCountText.match(/Exports as (\d+)/);
    expect(match).toBeTruthy();
    const pagesBefore = Number(match![1]);
    expect(pagesBefore).toBeGreaterThanOrEqual(2);

    await expect(page.locator(".page-break-indicator").first()).toBeVisible();
    await expect(page.locator(".page-number-badge").first()).toContainText("1/");

    // Compact skills should reduce length
    await page.getByRole("button", { name: "Compact skills" }).click();
    await page.waitForTimeout(300);
    const afterCompact = await page.getByTestId("page-count-label").innerText();
    const pagesAfterCompact = Number(afterCompact.match(/Exports as (\d+)/)?.[1] ?? pagesBefore);
    expect(pagesAfterCompact).toBeLessThanOrEqual(pagesBefore);

    // Letter paper option available
    await page.locator("#paper-select").selectOption("letter");
    await expect(page.getByTestId("paper-meta")).toContainText("Letter");
    await page.locator("#paper-select").selectOption("a4");

    const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
    await page.getByRole("button", { name: "Export PDF" }).click();
    await expect(page.getByText(/Rendering page|Capturing live preview|Preparing/i).first()).toBeVisible({
      timeout: 5000,
    }).catch(() => undefined);
    const download = await downloadPromise;
    const pdfPath = path.join(outDir, "sample-2026.pdf");
    await download.saveAs(pdfPath);
    const size = fs.statSync(pdfPath).size;
    expect(size).toBeGreaterThan(40_000);

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
