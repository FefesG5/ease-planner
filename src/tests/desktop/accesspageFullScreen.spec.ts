import { test, expect } from "@playwright/test";

// Access Page Tests focusing on Sign In
test.describe("Access Page Tests - (Fullscreen Mode)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/access");
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  // Sign In Section
  test.describe("Sign In Section", () => {
    test("Email input should be visible and allow text entry", async ({
      page,
    }) => {
      const emailInput = page.locator("input[type='email']");
      await expect(emailInput).toBeVisible();
      await emailInput.fill("test@example.com");
      await expect(emailInput).toHaveValue("test@example.com"); // Ensure input value is correctly entered
    });

    test("Sign in with Email button should be visible", async ({ page }) => {
      const emailSignInButton = page.locator(
        "button:has-text('Sign in with Email link')",
      );
      await expect(emailSignInButton).toBeVisible();
    });

    test("Sign in with Google button should be visible and functional", async ({
      page,
    }) => {
      const googleSignInButton = page.locator(
        "button:has-text('Sign in with Google')",
      );
      await expect(googleSignInButton).toBeVisible();
      const [popup] = await Promise.all([
        page.context().waitForEvent("page"), // Wait for the Google sign-in popup
        googleSignInButton.click(),
      ]);
      await popup.waitForLoadState();
      await expect(popup).toHaveURL(/accounts\.google\.com/); // Check if the popup is the Google sign-in page
    });
  });
});
