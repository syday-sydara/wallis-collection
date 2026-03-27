import { test, expect, devices } from "@playwright/test";

test.use(devices["iPhone 12"]);

test("checkout works on mobile", async ({ page }) => {
  await page.goto("/checkout");

  await page.fill('input[name="fullName"]', "John Doe");
  await page.fill('input[name="email"]', "john@example.com");

  await page.click('button[type="submit"]');

  await expect(page.locator("text=Full name is required")).toBeVisible();
});
