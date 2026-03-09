// @ts-check
const { test, expect } = require('@playwright/test');

// ===========================================================================
// Helper: Create and approve a fresh PR so PO tests have a known open line
// ===========================================================================
async function createApprovedPR(page, itemCode, itemName, qty) {
  await page.goto('/requisitions/new');

  const headerPanel = page.locator('.card-panel').first();
  await headerPanel.locator('.form-group').filter({ hasText: 'Requester Name' }).locator('input').fill('PO E2E Bot');
  await headerPanel.locator('.form-group').filter({ hasText: 'Department' }).locator('input').fill('QA');
  await headerPanel.locator('.form-group').filter({ hasText: 'PR Title' }).locator('input').fill('PR for PO E2E');

  const lineRow = page.locator('.card-panel').nth(1).locator('table tbody tr').first();
  await lineRow.locator('td').nth(1).locator('input').fill(itemCode);
  await lineRow.locator('td').nth(2).locator('input').fill(itemName);
  await lineRow.locator('td').nth(3).locator('input').fill(String(qty));
  await lineRow.locator('td').nth(4).locator('input').fill('PCS');
  await lineRow.locator('td').nth(5).locator('input').fill('50000');
  await lineRow.locator('td').nth(6).locator('input').fill('SITE-E2E');

  await page.locator('.btn-primary', { hasText: 'Save As Draft' }).click();
  await expect(page).toHaveURL(/\/requisitions\/.+/);
  await expect(page.locator('.status-badge')).toHaveText('DRAFT');

  // Submit
  await page.locator('.btn-primary', { hasText: 'Submit PR' }).click();
  await expect(page.locator('.status-badge')).toHaveText('SUBMITTED');

  // Approve
  await page.locator('.btn-primary', { hasText: 'Approve PR' }).click();
  await expect(page.locator('.status-badge')).toHaveText('APPROVED');

  // Extract PR number from the detail page subtitle
  const subtitle = await page.locator('.page-header .muted').textContent();
  const prNumber = subtitle.split(' ')[0]; // e.g. "PR-2026-0011"

  return prNumber;
}

// ===========================================================================
// 1. PO List Page
// ===========================================================================
test.describe('PO List Page', () => {
  test('should display page header and table', async ({ page }) => {
    await page.goto('/purchase-orders');

    await expect(page.locator('.page-header h2')).toHaveText('Purchase Orders');
    await expect(page.locator('.btn-outline', { hasText: '+ New PO' })).toBeVisible();

    const table = page.locator('.card-panel table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(4);
    await expect(headers.nth(0)).toHaveText('PO Number');
    await expect(headers.nth(1)).toHaveText('Vendor');
    await expect(headers.nth(2)).toHaveText('Status');
    await expect(headers.nth(3)).toHaveText('Created');
  });

  test('should navigate to PO create page', async ({ page }) => {
    await page.goto('/purchase-orders');
    await page.locator('.btn-outline', { hasText: '+ New PO' }).click();
    await expect(page).toHaveURL('/purchase-orders/new');
  });
});

// ===========================================================================
// 2. Happy Path: Create + Submit PO from Approved PR
// ===========================================================================
test.describe('PO Happy Path: Create and Submit', () => {
  const ITEM_NAME = 'Happy Path Widget';
  const QTY = 25;

  test('should create a PO, verify detail, and submit it', async ({ page }) => {
    // Use unique item code per run to avoid collisions with prior test data
    const ITEM_CODE = `HP-${Date.now()}`;

    // -- Prerequisite: create a fresh APPROVED PR --
    const prNumber = await createApprovedPR(page, ITEM_CODE, ITEM_NAME, QTY);

    // -- Step 1: Navigate to PO Create --
    await page.goto('/purchase-orders/new');
    await expect(page.locator('.page-header h2')).toHaveText('Create Purchase Order');

    // -- Step 2: Fill vendor name --
    const vendorInput = page.locator('.form-group').filter({ hasText: 'Vendor Name' }).locator('input');
    await vendorInput.fill('PT E2E Happy Vendor');

    // -- Step 3: Wait for allocation table to load --
    const allocPanel = page.locator('.card-panel').filter({ hasText: 'Allocate PR Lines' });
    const tableBody = allocPanel.locator('table tbody');

    // Wait for our specific row (match by unique PR number)
    const targetRow = tableBody.locator('tr', { hasText: prNumber });
    await expect(targetRow).toBeVisible({ timeout: 15000 });

    // Verify it shows correct item code and qty open
    await expect(targetRow).toContainText(ITEM_CODE);
    await expect(targetRow).toContainText(String(QTY));

    // -- Step 4: Select the line by checking its checkbox --
    await targetRow.locator('input[type="checkbox"]').check();

    // The Allocate QTY input should now be enabled and pre-filled with qtyOpen
    const allocQtyInput = targetRow.locator('input[type="number"]').first();
    await expect(allocQtyInput).toBeEnabled();

    // Use a smaller allocation qty
    await allocQtyInput.fill('10');

    // Set unit price
    const unitPriceInput = targetRow.locator('input[type="number"]').nth(1);
    await unitPriceInput.fill('50000');

    // -- Step 5: Submit the form --
    await page.locator('.btn-primary', { hasText: 'Save As Draft' }).click();

    // -- Step 6: Verify redirect to PO detail page --
    await expect(page).toHaveURL(/\/purchase-orders\/.+/);
    await expect(page.locator('.page-header h2')).toHaveText('Detail Purchase Order');

    // Verify vendor name
    const vendorField = page.locator('.form-group').filter({ hasText: 'Vendor Name' }).locator('input');
    await expect(vendorField).toHaveValue('PT E2E Happy Vendor');

    // Status should be DRAFT
    await expect(page.locator('.status-badge').first()).toHaveText('DRAFT');

    // PO Lines table should show the allocated item
    const poLinesPanel = page.locator('.card-panel').filter({ hasText: 'PO Lines' });
    const poLinesBody = poLinesPanel.locator('table tbody');
    await expect(poLinesBody.locator('tr')).toHaveCount(1);

    const poLineRow = poLinesBody.locator('tr').first();
    await expect(poLineRow).toContainText(ITEM_CODE);
    await expect(poLineRow).toContainText(ITEM_NAME);
    // QTY Ordered column
    await expect(poLineRow.locator('td').nth(3)).toHaveText('10');
    // Source PR column should reference our PR
    await expect(poLineRow).toContainText(prNumber);

    // -- Step 7: Submit the PO (DRAFT -> SUBMITTED) --
    const submitBtn = page.locator('.btn-primary', { hasText: 'Submit PO' });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Status should change to SUBMITTED
    await expect(page.locator('.status-badge').first()).toHaveText('SUBMITTED');

    // Submit button should disappear
    await expect(page.locator('.btn-primary', { hasText: 'Submit PO' })).not.toBeVisible();
  });
});

// ===========================================================================
// 3. Negative Path: Over-allocation Rejection
// ===========================================================================
test.describe('PO Negative Path: Over-allocation', () => {
  const ITEM_NAME = 'Over Alloc Part';
  const QTY = 10;

  test('should reject allocation qty that exceeds PR remaining qty', async ({ page }) => {
    // Use unique item code per run
    const ITEM_CODE = `OV-${Date.now()}`;

    // -- Prerequisite: create a fresh APPROVED PR with qty=10 --
    const prNumber = await createApprovedPR(page, ITEM_CODE, ITEM_NAME, QTY);

    // -- Step 1: Navigate to PO Create --
    await page.goto('/purchase-orders/new');
    await expect(page.locator('.page-header h2')).toHaveText('Create Purchase Order');

    // -- Step 2: Fill vendor name --
    const vendorInput = page.locator('.form-group').filter({ hasText: 'Vendor Name' }).locator('input');
    await vendorInput.fill('PT Over-Allocator');

    // -- Step 3: Wait for our specific row in the allocation table --
    const allocPanel = page.locator('.card-panel').filter({ hasText: 'Allocate PR Lines' });
    const tableBody = allocPanel.locator('table tbody');

    const targetRow = tableBody.locator('tr', { hasText: prNumber });
    await expect(targetRow).toBeVisible({ timeout: 15000 });

    // -- Step 4: Select the line --
    await targetRow.locator('input[type="checkbox"]').check();

    // -- Step 5: Set allocation qty that far exceeds remaining (10) --
    const allocQtyInput = targetRow.locator('input[type="number"]').first();
    await allocQtyInput.fill('999');

    // Set a unit price
    const unitPriceInput = targetRow.locator('input[type="number"]').nth(1);
    await unitPriceInput.fill('50000');

    // -- Step 6: Submit the form --
    await page.getByRole('button', { name: 'Save As Draft' }).click();

    // -- Step 7: Verify error message (server rejects over-allocation) --
    const errorEl = page.locator('.error');
    await expect(errorEl).toBeVisible({ timeout: 10000 });

    // -- Step 7: Verify error message --
    const errorText = await errorEl.textContent();
    expect(errorText).toContain('exceeds remaining');

    // Should still be on the create page (no redirect)
    await expect(page).toHaveURL('/purchase-orders/new');
  });
});
