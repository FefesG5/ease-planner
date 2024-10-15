import { test, expect } from "@playwright/test";
import { navigationLinks } from "@/config/navigationLinks";

test.describe("Home Page Tests - (Fullscreen Mode)", () => {
  // Before each test, navigate to the home page and set viewport to full-screen
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.setViewportSize({ width: 1920, height: 1080 });
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

    test("Theme switch button should toggle between light and dark themes", async ({
      page,
    }) => {
      const themeButton = page.locator(
        "button:has-text('Switch to Dark Theme')",
      );
      await expect(themeButton).toBeVisible();

      // Click to switch to dark theme
      await themeButton.click();
      await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");

      // Click to switch back to light theme
      const themeButtonLight = page.locator(
        "button:has-text('Switch to Light Theme')",
      );
      await expect(themeButtonLight).toBeVisible();
      await themeButtonLight.click();
      await expect(page.locator("body")).toHaveAttribute("data-theme", "light");
    });
  });

  // Navigation Links Section
  test.describe("Navigation Links", () => {
    navigationLinks.forEach((link) => {
      test(`"${link.label}" link navigates to the correct page`, async ({
        page,
      }) => {
        const navLink = page.locator(
          `[data-testid="nav-${link.label.toLowerCase()}"]`,
        );
        await expect(navLink).toBeVisible();
        await expect(navLink).toHaveAttribute("href", link.href);
        await navLink.click();
        await expect(page).toHaveURL(`http://localhost:3000${link.href}`);
      });
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
    test("Footer should be visible on a large screen", async ({ page }) => {
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
