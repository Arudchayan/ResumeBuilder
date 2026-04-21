import { test, expect } from "@playwright/test";

test("loads app shell", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("banner").getByRole("heading", { name: "Resume Builder" }),
  ).toBeVisible();
});