import { expect, test } from "@playwright/test";

const DEPLOY_BASE = "/axinite-mockup";

test("navigates routes and flips to rtl", async ({ page }) => {
  await page.goto(`${DEPLOY_BASE}/chat?debug-flags=1`);

  await expect(page.getByRole("heading", { name: "Chat", level: 2 })).toBeVisible();
  await page.getByRole("link", { name: "Memory" }).click();
  await expect(page).toHaveURL(/\/axinite-mockup\/memory$/);
  await expect(page.getByRole("heading", { name: "Memory", level: 2 })).toBeVisible();

  await page.getByRole("link", { name: "Jobs" }).click();
  await expect(page).toHaveURL(/\/axinite-mockup\/jobs$/);
  await expect(page.getByRole("heading", { name: "Jobs", level: 2 })).toBeVisible();

  await page.getByRole("link", { name: "Routines" }).click();
  await expect(page).toHaveURL(/\/axinite-mockup\/routines$/);
  await expect(page.getByRole("heading", { name: "Routines", level: 2 })).toBeVisible();

  await page.getByRole("link", { name: "Extensions" }).click();
  await expect(page).toHaveURL(/\/axinite-mockup\/extensions$/);
  await expect(page.getByRole("heading", { name: "Extensions", level: 2 })).toBeVisible();

  await page.getByRole("link", { name: "Skills" }).click();
  await expect(page).toHaveURL(/\/axinite-mockup\/skills$/);
  await expect(page.getByRole("heading", { name: "Skills", level: 2 })).toBeVisible();

  await page.getByRole("button", { name: "Logs" }).click();
  await expect(page.getByRole("heading", { name: "Logs" })).toBeVisible();

  await page.keyboard.press("Escape");
  await page.getByLabel("Language").selectOption("ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("button", { name: "السجلات" })).toBeVisible();
});
