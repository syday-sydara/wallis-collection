import { test, expect } from "@playwright/test";

test("checkout works on slow 3G network", async ({ page }) => {
  await page.route("**/*", (route) =>
    route.continue({ delay: 500 })
  );

  await page.goto("/checkout");

  await page.fill('input[name="fullName"]', "John Doe");
  await page.fill('input[name="email"]', "john@example.com");
  await page.fill('input[name="phone"]', "08012345678");
  await page.fill('textarea[name="address"]', "123 Street");
  await page.fill('input[name="city"]', "Lagos");
  await page.selectOption('select[name="state"]', "Lagos");

  await page.click('button[type="submit"]');

  await expect(page.locator("button[type=submit]")).toBeDisabled();
});
