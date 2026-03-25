import { expect, test } from "@playwright/test";

test("navigates routes and flips to rtl", async ({ page }) => {
  await page.goto("/chat?debug-flags=1");

  await expect(page.getByRole("heading", { name: "Chat", level: 2 })).toBeVisible();
  await page.getByRole("link", { name: "Memory" }).click();
  await expect(page).toHaveURL(/\/memory$/);

  await page.getByRole("button", { name: "Logs" }).click();
  await expect(page.getByRole("heading", { name: "Logs" })).toBeVisible();

  await page.keyboard.press("Escape");
  await page.getByLabel("Language").selectOption("ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("button", { name: "السجلات" })).toBeVisible();
});
