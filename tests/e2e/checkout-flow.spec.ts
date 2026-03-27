import { test, expect } from "@playwright/test";

test("user can complete checkout flow", async ({ page }) => {
  // Navigate to checkout page
  await page.goto("/checkout");

  // Fill out form fields
  await page.getByLabel("Full Name").fill("John Doe");
  await page.getByLabel("Email").fill("john@example.com");
  await page.getByLabel("Phone").fill("08012345678");
  await page.getByLabel("Address").fill("123 Street");
  await page.getByLabel("City").fill("Lagos");
  await page.getByLabel("State").selectOption("Lagos");

  // Submit the form
  await page.getByRole("button", { name: /continue|submit/i }).click();

  // Wait for redirect to success or payment provider
  await page.waitForURL(/checkout\/success|paystack|monnify/);

  // Assert we landed somewhere valid
  expect(page.url()).toMatch(/checkout\/success|paystack|monnify/);
});