const { test, expect } = require('@playwright/test');

test.describe('Purchase Order module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/po-create');
    await expect(page.getByTestId('po-create-page')).toBeVisible();
    await expect(page.getByTestId('po-line-row').first()).toBeVisible();
  });

  test('creates a draft PO from an approved PR line', async ({ page }) => {
    const firstRow = page.getByTestId('po-line-row').first();
    const quantityInput = firstRow.getByTestId('po-order-qty');
    const remainingQuantity = Number(await quantityInput.getAttribute('max'));

    expect(remainingQuantity).toBeGreaterThan(0);

    await page.getByTestId('po-vendor-name').fill('Playwright Test Vendor');
    await firstRow.getByTestId('po-line-select').check();
    await quantityInput.fill(String(Math.min(1, remainingQuantity)));
    await firstRow.getByLabel('Unit price').fill('100');
    await page.getByTestId('save-po-draft').click();

    await expect(page).toHaveURL(/\/purchase-orders$/);
    await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible();
    await expect(page.getByText('Playwright Test Vendor')).toBeVisible();
  });

  test('rejects an order quantity greater than the PR line remaining quantity', async ({ page }) => {
    const firstRow = page.getByTestId('po-line-row').first();
    const quantityInput = firstRow.getByTestId('po-order-qty');
    const remainingQuantity = Number(await quantityInput.getAttribute('max'));

    expect(remainingQuantity).toBeGreaterThan(0);

    await page.getByTestId('po-vendor-name').fill('Over Allocation Test Vendor');
    await firstRow.getByTestId('po-line-select').check();
    await quantityInput.fill(String(remainingQuantity + 1));
    await page.getByTestId('save-po-draft').click();

    await expect(page.getByRole('alert')).toContainText('no more than remaining quantity');
    await expect(page).toHaveURL(/\/po-create$/);
  });
});
