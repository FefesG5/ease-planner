import { test, expect } from "@playwright/test";
import { navigationLinks } from "@/config/navigationLinks";

test.describe("Home Page Tests - (Mobile View)", () => {
  // Before each test, navigate to the home page and set the viewport to mobile size
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.setViewportSize({ width: 375, height: 667 }); // Set to iPhone SE dimensions or similar mobile viewport
  });

  // Header Section
  test.describe("Header Section", () => {
    test("Logo should be visible and navigate to the home page", async ({
      page,
    }) => {
      const logo = page.locator("a[href='/'] img[alt='Next.js Logo']");
      await expect(logo).toBeVisible();

      await logo.click();
      await expect(page).toHaveURL("http://localhost:3000");
    });

    test("Menu icon should be visible and open the sidebar", async ({
      page,
    }) => {
      const menuIcon = page.locator("button:has(img[alt='Menu Icon'])");
      await expect(menuIcon).toBeVisible();

      await menuIcon.click();
      const sidebar = page.locator("aside");
      await expect(sidebar).toBeVisible();

      // Close the sidebar by clicking the close button inside the sidebar
      const closeButton = page.locator("button:has(img[alt='Close Sidebar'])");
      await expect(closeButton).toBeVisible();
      await closeButton.click();
      await expect(sidebar).not.toBeVisible();
    });

    test("Theme switch button should toggle between light and dark themes", async ({
      page,
    }) => {
      const menuIcon = page.locator("button:has(img[alt='Menu Icon'])");
      await expect(menuIcon).toBeVisible();

      await menuIcon.click();
      const themeButton = page.locator(
        "aside button:has-text('Switch to Dark Theme')",
      );
      await expect(themeButton).toBeVisible();

      // Click to switch to dark theme
      await themeButton.click();
      await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");

      // Click to switch back to light theme
      const themeButtonLight = page.locator(
        "aside button:has-text('Switch to Light Theme')",
      );
      await expect(themeButtonLight).toBeVisible();
      await themeButtonLight.click();
      await expect(page.locator("body")).toHaveAttribute("data-theme", "light");
    });

    // Navigation Links Section
    test("Navigation links should be visible and functional after the menu icon is pressed", async ({
      page,
    }) => {
      const menuIcon = page.locator("button:has(img[alt='Menu Icon'])");
      await expect(menuIcon).toBeVisible();
      await menuIcon.click();

      for (const link of navigationLinks) {
        const navLink = page.locator(`aside a:has-text('${link.label}')`);
        await expect(navLink).toBeVisible();
        await navLink.click();
        await expect(page).toHaveURL(`http://localhost:3000${link.href}`);
        await menuIcon.click(); // Reopen sidebar for the next link
      }
    });
  });

  // Page Title and Content Section
  test.describe("Page Title and Content", () => {
    test("Home Page has the correct document title", async ({ page }) => {
      await expect(page).toHaveTitle(/Create Next App/i);
    });

    test("Home Page displays the correct h1 heading", async ({ page }) => {
      const heading = page.locator("h1", { hasText: "Home Page" });
      await expect(heading).toBeVisible();
    });
  });

  // Footer Section
  test.describe("Footer Section", () => {
    test("Footer should be visible on a mobile screen", async ({ page }) => {
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
    });

    test("Footer should contain a link to Vercel", async ({ page }) => {
      const vercelLink = page.locator("footer a[href='https://vercel.com']");
      await expect(vercelLink).toBeVisible();
      await expect(vercelLink).toHaveAttribute("target", "_blank");

      const [newPage] = await Promise.all([
        page.context().waitForEvent("page"),
        vercelLink.click(),
      ]);
      await newPage.waitForLoadState();
      await expect(newPage).toHaveURL(/https:\/\/vercel\.com/);
    });

    test("Footer should display the Vercel logo", async ({ page }) => {
      const vercelLogo = page.locator("footer img[alt='Vercel Logo']");
      await expect(vercelLogo).toBeVisible();
      await expect(vercelLogo).toHaveAttribute("src", "/vercel.svg");
    });
  });
});
