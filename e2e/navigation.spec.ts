import { test, expect } from '@playwright/test';

/**
 * E2E tests for navigation flows
 */
test.describe('Navigation', () => {
  test.describe('Public routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto('/');
      
      // Should redirect to login page
      await expect(page).toHaveURL(/.*login/);
    });

    test('should access login page', async ({ page }) => {
      await page.goto('/auth/login');
      
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator('mat-card')).toBeVisible();
    });

    test('should access register page', async ({ page }) => {
      await page.goto('/auth/register');
      
      await expect(page).toHaveURL(/.*register/);
      await expect(page.locator('mat-card')).toBeVisible();
    });
  });

  test.describe('Auth layout', () => {
    test('should display auth layout on login page', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Auth layout should be present
      await expect(page.locator('app-auth-layout')).toBeVisible();
    });

    test('should display language selector', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Look for language selector button
      const langSelector = page.locator('[aria-label*="language"], [aria-label*="idioma"], button:has(mat-icon:text("language"))');
      await expect(langSelector.first()).toBeVisible({ timeout: 5000 });
    });

    test('should display theme toggle', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Look for theme toggle
      const themeToggle = page.locator('[aria-label*="theme"], [aria-label*="tema"], button:has(mat-icon:text("dark_mode")), button:has(mat-icon:text("light_mode"))');
      await expect(themeToggle.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Page loading', () => {
    test('should load login page within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/auth/login');
      
      await expect(page.locator('mat-card')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should display proper meta tags', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Check viewport meta tag
      const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewportMeta).toContain('width=device-width');
    });
  });
});
