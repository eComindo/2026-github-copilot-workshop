// @ts-check
const { test, expect } = require('@playwright/test');

const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:3000';

async function createApprovedRequisition(request, suffix) {
  const createResponse = await request.post(`${API_BASE_URL}/api/requisitions`, {
    data: {
      requesterName: `PO E2E ${suffix}`,
      departmentName: 'QA',
      title: `PO E2E Source ${suffix}`,
      notes: 'Created by Playwright PO e2e',
      lines: [
        {
          itemCode: `E2E-BRG-${suffix}`,
          itemName: `E2E Bearing ${suffix}`,
          qtyRequested: 10,
          uom: 'PCS',
          estUnitPrice: 100000,
          siteCode: 'JKT-PLANT',
        },
      ],
    },
  });

  expect(createResponse.ok()).toBeTruthy();
  const requisition = await createResponse.json();

  const submitResponse = await request.post(
    `${API_BASE_URL}/api/requisitions/${requisition.id}/submit`
  );
  expect(submitResponse.ok()).toBeTruthy();

  const approveResponse = await request.post(
    `${API_BASE_URL}/api/requisitions/${requisition.id}/approve`
  );
  expect(approveResponse.ok()).toBeTruthy();

  return requisition;
}

async function openCreatePoPageAndLoadLines(page, prNumber, vendorName) {
  await page.goto('/purchase-orders/new');
  await expect(page.getByRole('heading', { name: 'Create Purchase Order' })).toBeVisible();

  const vendorInput = page
    .locator('.form-group')
    .filter({ hasText: 'Vendor Name' })
    .locator('input');
  const sourcePrInput = page
    .locator('.form-group')
    .filter({ hasText: 'Source PR Number' })
    .locator('input');

  await vendorInput.fill(vendorName);
  await sourcePrInput.fill(prNumber);
  await page.getByRole('button', { name: 'Load Approved PR Open Lines' }).click();

  await expect(page.getByText(`Loaded 1 open line(s) from ${prNumber}`)).toBeVisible();
}

function getAllocationRow(page, itemCode) {
  return page
    .locator('.card-panel table tbody tr')
    .filter({ has: page.locator(`input[value="${itemCode}"]`) })
    .first();
}

test.describe('PO Module', () => {
  test('happy path: create draft PO, verify list/detail, then submit', async ({ page, request }) => {
    const suffix = `HAPPY-${Date.now()}`;
    const requisition = await createApprovedRequisition(request, suffix);

    await openCreatePoPageAndLoadLines(page, requisition.prNumber, 'PT Happy Path Vendor');

    const lineRow = getAllocationRow(page, `E2E-BRG-${suffix}`);
    await expect(lineRow).toBeVisible();

    // qtyRemaining, qtyAllocate, and unitPrice are decimal inputs in that order.
    const numericInputs = lineRow.locator('input[type="number"][step="0.01"]');
    await numericInputs.nth(1).fill('4');

    await page.getByRole('button', { name: 'Save As Draft' }).click();
    await expect(page.getByText(/PO\s+PO-2026-\d{4}\s+saved as DRAFT/)).toBeVisible();

    const poNumberInput = page
      .locator('.form-group')
      .filter({ hasText: 'PO Number' })
      .locator('input');
    const poNumber = await poNumberInput.inputValue();
    expect(poNumber).toMatch(/^PO-2026-\d{4}$/);

    await page.getByRole('link', { name: 'Purchase Orders' }).click();
    await expect(page).toHaveURL('/purchase-orders');
    await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible();

    const poLink = page.getByRole('link', { name: poNumber });
    const poRow = page.locator('tbody tr').filter({ has: poLink }).first();
    await expect(poLink).toBeVisible();
    await expect(poRow).toContainText('DRAFT');

    await poLink.click();
    await expect(page.getByRole('heading', { name: 'Detail Purchase Order' })).toBeVisible();
    await expect(page.locator('.status-badge')).toHaveText('DRAFT');

    await page.getByRole('button', { name: 'Submit PO' }).click();
    await expect(page.locator('.status-badge')).toHaveText('SUBMITTED');
    await expect(page.getByRole('button', { name: 'Submit PO' })).toHaveCount(0);
  });

  test('negative path: backend rejects over-allocation with clear message', async ({ page, request }) => {
    const suffix = `OVER-${Date.now()}`;
    const requisition = await createApprovedRequisition(request, suffix);

    await openCreatePoPageAndLoadLines(page, requisition.prNumber, 'PT Over Allocation Vendor');

    const lineRow = getAllocationRow(page, `E2E-BRG-${suffix}`);
    await expect(lineRow).toBeVisible();

    const numericInputs = lineRow.locator('input[type="number"][step="0.01"]');
    await numericInputs.first().fill('999');
    await numericInputs.nth(1).fill('11');

    await page.getByRole('button', { name: 'Save As Draft' }).click();

    const errorMessage = page.locator('.error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('allocation qty 11 exceeds remaining 10');

    const successNotice = page.locator('.muted').filter({ hasText: 'saved as DRAFT' });
    await expect(successNotice).toHaveCount(0);
    await expect(page).toHaveURL('/purchase-orders/new');
  });
});