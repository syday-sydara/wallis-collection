import { test, expect } from "@playwright/test";

test("double-clicking submit does not create duplicate orders", async ({ page }) => {
  await page.goto("/checkout");

  await page.fill('input[name="fullName"]', "John Doe");
  await page.fill('input[name="email"]', "john@example.com");
  await page.fill('input[name="phone"]', "08012345678");
  await page.fill('textarea[name="address"]', "123 Street");
  await page.fill('input[name="city"]', "Lagos");
  await page.selectOption('select[name="state"]', "Lagos");

  const submit = page.locator('button[type="submit"]');

  await Promise.all([
    submit.click(),
    submit.click(),
    submit.click()
  ]);

  await expect(submit).toBeDisabled();
});
