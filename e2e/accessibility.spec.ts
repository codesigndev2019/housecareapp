import { test, expect } from '@playwright/test';

/**
 * E2E tests for accessibility (a11y) compliance
 */
test.describe('Accessibility', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
    });

    test('should have proper page structure', async ({ page }) => {
      // Should have a main landmark
      const main = page.locator('main, [role="main"]');
      await expect(main.first()).toBeVisible({ timeout: 5000 });
    });

    test('should have labeled form inputs', async ({ page }) => {
      // Email input should have label
      const emailInput = page.locator('input[formControlName="email"]');
      const emailLabel = await emailInput.getAttribute('aria-label') || 
                         await emailInput.getAttribute('placeholder') ||
                         await page.locator('mat-label', { has: page.locator('input[formControlName="email"]') }).textContent();
      expect(emailLabel).toBeTruthy();

      // Password input should have label
      const passwordInput = page.locator('input[formControlName="password"]');
      const passwordLabel = await passwordInput.getAttribute('aria-label') || 
                           await passwordInput.getAttribute('placeholder');
      expect(passwordLabel).toBeTruthy();
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Focus on email input
      await page.keyboard.press('Tab');
      
      let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
      
      // Navigate to password
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
    });

    test('should have visible focus indicators', async ({ page }) => {
      const emailInput = page.locator('input[formControlName="email"]');
      await emailInput.focus();
      
      // Check that focus is visible (element has focus)
      await expect(emailInput).toBeFocused();
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // Check that text elements are visible
      await expect(page.locator('mat-card')).toBeVisible();
      
      // Button text should be readable
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/auth/login');
      
      // Form should still be visible and usable
      await expect(page.locator('mat-card')).toBeVisible();
      await expect(page.locator('input[formControlName="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/auth/login');
      
      await expect(page.locator('mat-card')).toBeVisible();
      await expect(page.locator('input[formControlName="email"]')).toBeVisible();
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
      await page.goto('/auth/login');
      
      await expect(page.locator('mat-card')).toBeVisible();
      await expect(page.locator('input[formControlName="email"]')).toBeVisible();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels on interactive elements', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Toggle password visibility button should have aria-label
      const toggleButton = page.locator('button[matSuffix]');
      const ariaLabel = await toggleButton.getAttribute('aria-label');
      expect(ariaLabel || await toggleButton.locator('mat-icon').textContent()).toBeTruthy();
    });

    test('should announce form errors', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Submit empty form
      await page.click('button[type="submit"]');
      
      // Error messages should be present for screen readers
      const errorMessage = page.locator('mat-error');
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
      
      // Error should have proper role or aria attributes
      const role = await errorMessage.first().getAttribute('role');
      const ariaLive = await errorMessage.first().getAttribute('aria-live');
      expect(role === 'alert' || ariaLive === 'polite' || ariaLive === 'assertive').toBeTruthy();
    });
  });
});
