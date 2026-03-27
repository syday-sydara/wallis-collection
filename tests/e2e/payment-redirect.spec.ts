import { test, expect } from "@playwright/test";

test("redirects to payment provider after checkout", async ({ page }) => {
  await page.goto("/checkout");

  await page.fill('input[name="fullName"]', "John Doe");
  await page.fill('input[name="email"]', "john@example.com");
  await page.fill('input[name="phone"]', "08012345678");
  await page.fill('textarea[name="address"]', "123 Street");
  await page.fill('input[name="city"]', "Lagos");
  await page.selectOption('select[name="state"]', "Lagos");

  await page.click('button[type="submit"]');

  await page.waitForURL(/paystack|monnify/);
});
