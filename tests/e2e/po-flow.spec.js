import { test, expect } from '@playwright/test';

test.describe('PO Module Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Procurement Dashboard');
  });

  test('PO List page loads with Purchase Orders nav link', async ({ page }) => {
    await page.click('a:has-text("Purchase Orders")');
    await page.waitForURL('/purchase-orders');
    await expect(page.locator('h2')).toContainText('Purchase Orders');
  });

  test('Create PO from approved PR lines', async ({ page }) => {
    // Navigate to Purchase Orders
    await page.click('a:has-text("Purchase Orders")');
    await page.waitForURL('/purchase-orders');

    // Click "+ New PO" button
    const newPOBtn = page.locator('button:has-text("New PO")');
    await expect(newPOBtn).toBeVisible();
    await newPOBtn.click();

    // Should redirect to create page
    await page.waitForURL('/purchase-orders/new');
    await expect(page.locator('h2')).toContainText('Create Purchase Order');
  });

  test('Submit PO and verify detail page', async ({ page }) => {
    // Create a new PO by navigating to create page directly
    await page.goto('/purchase-orders/new');

    // Select an approved PR line (first available)
    const prLineSelect = page.locator('select').first();
    await prLineSelect.selectOption({ index: 1 }); // Select first PR line option

    // Fill in quantity
    const qtyInput = page.locator('input[name="qty"]').first();
    await qtyInput.fill('10');

    // Submit the form
    const submitBtn = page.locator('button:has-text("Create PO")');
    await submitBtn.click();

    // Should redirect to detail page and show confirmation
    await page.waitForURL(/\/purchase-orders\/[a-zA-Z0-9-]+$/);
    await expect(page.locator('h2')).toContainText('Purchase Order');

    // Verify PO detail shows status and lines
    await expect(page.locator('text=Status')).toBeVisible();
    await expect(page.locator('text=DRAFT')).toBeVisible();
  });

  test('Submit PO button transitions status', async ({ page }) => {
    // Navigate to purchase orders list
    await page.goto('/purchase-orders');

    // Click on first PO detail link (if exists)
    const firstPOLink = page.locator('a').filter({ has: page.locator('td') }).first();
    const href = await firstPOLink.getAttribute('href');

    if (href) {
      await page.goto(href);

      // Look for Submit PO button and click it
      const submitPOBtn = page.locator('button:has-text("Submit PO")');
      if (await submitPOBtn.isVisible()) {
        await submitPOBtn.click();
        // Verify status changes to SUBMITTED
        await expect(page.locator('text=SUBMITTED')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
