import { test, expect } from '@playwright/test';

/**
 * E2E tests for authentication flows
 */
test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
    });

    test('should display login form', async ({ page }) => {
      // Check page title or header
      await expect(page.locator('mat-card')).toBeVisible();
      
      // Check form fields exist
      await expect(page.locator('input[formControlName="email"]')).toBeVisible();
      await expect(page.locator('input[formControlName="password"]')).toBeVisible();
      
      // Check submit button exists
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      // Click submit without filling form
      await page.click('button[type="submit"]');
      
      // Expect validation errors to appear
      await expect(page.locator('mat-error').first()).toBeVisible({ timeout: 5000 });
    });

    test('should validate email format', async ({ page }) => {
      // Enter invalid email
      await page.fill('input[formControlName="email"]', 'invalid-email');
      await page.fill('input[formControlName="password"]', 'password123');
      
      // Click somewhere else to trigger validation
      await page.click('input[formControlName="password"]');
      
      // Email field should show error
      const emailField = page.locator('input[formControlName="email"]');
      await expect(emailField).toHaveAttribute('aria-invalid', 'true');
    });

    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.locator('input[formControlName="password"]');
      const toggleButton = page.locator('button[matSuffix]');
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle button
      await toggleButton.click();
      
      // Password should now be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click again to hide
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should have link to register page', async ({ page }) => {
      const registerLink = page.locator('a[href*="register"]');
      await expect(registerLink).toBeVisible();
      
      await registerLink.click();
      await expect(page).toHaveURL(/.*register/);
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/register');
    });

    test('should display registration form', async ({ page }) => {
      await expect(page.locator('mat-card')).toBeVisible();
      
      // Check form fields exist
      await expect(page.locator('input[formControlName="fullName"]')).toBeVisible();
      await expect(page.locator('input[formControlName="email"]')).toBeVisible();
      await expect(page.locator('input[formControlName="password"]')).toBeVisible();
      await expect(page.locator('input[formControlName="confirm"]')).toBeVisible();
    });

    test('should have password strength indicator', async ({ page }) => {
      await page.fill('input[formControlName="password"]', 'weakpass');
      
      // Password strength component should be visible
      await expect(page.locator('app-password-strength')).toBeVisible();
    });

    test('should validate password match', async ({ page }) => {
      await page.fill('input[formControlName="fullName"]', 'Test User');
      await page.fill('input[formControlName="email"]', 'test@example.com');
      await page.fill('input[formControlName="password"]', 'Password123!');
      await page.fill('input[formControlName="confirm"]', 'DifferentPass123!');
      
      // Blur confirm field
      await page.click('input[formControlName="fullName"]');
      
      // Should show password mismatch error
      await expect(page.locator('mat-error')).toBeVisible({ timeout: 5000 });
    });

    test('should have link to login page', async ({ page }) => {
      const loginLink = page.locator('a[href*="login"]');
      await expect(loginLink).toBeVisible();
      
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    });
  });
});
