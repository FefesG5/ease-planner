import { test, expect } from "@playwright/test";

// Access Page Tests focusing on Sign In
test.describe("Access Page Tests - (Fullscreen Mode)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/access");
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  // Sign In Section
  test.describe("Sign In Section", () => {
    test("Instruction message should be visible", async ({ page }) => {
      const instructionMessage = page.locator(
        "p:has-text('Please sign in to continue. Use your Google account to get started.')",
      );
      await expect(instructionMessage).toBeVisible();
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
