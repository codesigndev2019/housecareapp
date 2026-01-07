import { test as base, expect } from '@playwright/test';

/**
 * Test fixtures for HouseCare E2E tests
 * Contains reusable test data and authenticated page helpers
 */

// Test user credentials
export const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  fullName: 'Test User',
  phone: '+521234567890'
};

// Test data for various entities
export const testData = {
  chore: {
    name: 'Test Chore',
    frequency: 'daily',
    description: 'A test chore for E2E testing'
  },
  recipe: {
    name: 'Test Recipe',
    description: 'A delicious test recipe',
    ingredients: 'Test ingredients list',
    preparation: 'Test preparation steps'
  },
  event: {
    title: 'Test Event',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    description: 'A test event'
  },
  familyMember: {
    name: 'Test Family Member',
    relation: 'other'
  }
};

/**
 * Custom test fixtures extending base Playwright test
 */
export const test = base.extend<{
  authenticatedPage: ReturnType<typeof base.extend>;
}>({
  // Add custom fixtures here as needed
});

export { expect };

/**
 * Helper to fill login form
 */
export async function fillLoginForm(page: any, email: string, password: string) {
  await page.fill('input[formControlName="email"]', email);
  await page.fill('input[formControlName="password"]', password);
}

/**
 * Helper to fill registration form
 */
export async function fillRegisterForm(page: any, data: {
  fullName: string;
  email: string;
  password: string;
  confirm: string;
  phone?: string;
}) {
  await page.fill('input[formControlName="fullName"]', data.fullName);
  await page.fill('input[formControlName="email"]', data.email);
  await page.fill('input[formControlName="password"]', data.password);
  await page.fill('input[formControlName="confirm"]', data.confirm);
  if (data.phone) {
    await page.fill('input[formControlName="phone"]', data.phone);
  }
}

/**
 * Helper to wait for page load
 */
export async function waitForPageLoad(page: any) {
  await page.waitForLoadState('networkidle');
}

/**
 * Helper to check if element is in viewport
 */
export async function isInViewport(page: any, selector: string): Promise<boolean> {
  const element = page.locator(selector);
  const boundingBox = await element.boundingBox();
  if (!boundingBox) return false;
  
  const viewport = page.viewportSize();
  return (
    boundingBox.x >= 0 &&
    boundingBox.y >= 0 &&
    boundingBox.x + boundingBox.width <= viewport.width &&
    boundingBox.y + boundingBox.height <= viewport.height
  );
}

/**
 * Helper to take screenshot with timestamp
 */
export async function takeScreenshot(page: any, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `./e2e/screenshots/${name}-${timestamp}.png` });
}
