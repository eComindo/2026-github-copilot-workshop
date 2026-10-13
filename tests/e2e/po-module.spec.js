const { test, expect } = require('@playwright/test');

const apiUrl = 'http://localhost:3000';

const createApprovedRequisition = async (request, suffix) => {
  const createdResponse = await request.post(`${apiUrl}/api/requisitions`, {
    data: {
      requesterName: 'Playwright Tester',
      departmentName: 'Quality',
      title: `PO E2E ${suffix}`,
      neededByDate: '2026-12-31',
      lines: [{
        itemCode: `E2E-${suffix}`,
        itemName: 'Playwright allocation item',
        qtyRequested: 10,
        uom: 'PCS',
        estUnitPrice: 125000,
        siteCode: 'E2E-SITE',
        requiredDate: '2026-12-31',
        budgetCenter: 'E2E-TEST',
      }],
    },
  });
  expect(createdResponse.ok()).toBeTruthy();
  const requisition = await createdResponse.json();

  const submittedResponse = await request.post(`${apiUrl}/api/requisitions/${requisition.id}/submit`);
  expect(submittedResponse.ok()).toBeTruthy();

  const approvedResponse = await request.post(`${apiUrl}/api/requisitions/${requisition.id}/approve`);
  expect(approvedResponse.ok()).toBeTruthy();
  return approvedResponse.json();
};

test.describe('purchase order module', () => {
  test('creates and submits a PO from an approved PR line', async ({ page, request }) => {
    const suffix = `happy-${Date.now()}`;
    const requisition = await createApprovedRequisition(request, suffix);

    await page.goto('/purchase-orders/new');
    await expect(page.getByTestId('po-create-form')).toBeVisible();
    await page.getByTestId('po-supplier').fill('PT Playwright Supplier');
    await page.getByTestId('po-pr-line-0').selectOption({
      label: `${requisition.prNumber} / Line 1`,
    });
    await expect(page.getByTestId('po-remaining-qty-0')).toHaveText('10');

    await page.getByTestId('po-save-draft').click();
    await expect(page).toHaveURL(/\/purchase-orders\/[^/]+$/);
    await expect(page.getByRole('heading', { name: 'Purchase Order Detail' })).toBeVisible();
    await expect(page.getByDisplayValue('PT Playwright Supplier')).toBeVisible();
    await expect(page.getByTestId('po-status')).toHaveText('DRAFT');

    await page.getByTestId('po-submit').click();
    await expect(page.getByTestId('po-status')).toHaveText('SUBMITTED');
  });

  test('rejects allocation above the selected PR line remaining quantity', async ({ page, request }) => {
    const suffix = `over-allocation-${Date.now()}`;
    const requisition = await createApprovedRequisition(request, suffix);
    const purchaseOrderPosts = [];

    page.on('request', (requestEvent) => {
      if (requestEvent.method() === 'POST' && requestEvent.url() === `${apiUrl}/api/purchase-orders`) {
        purchaseOrderPosts.push(requestEvent);
      }
    });

    await page.goto('/purchase-orders/new');
    await page.getByTestId('po-supplier').fill('PT Playwright Supplier');
    await page.getByTestId('po-pr-line-0').selectOption({
      label: `${requisition.prNumber} / Line 1`,
    });
    await page.getByTestId('po-allocate-qty-0').fill('11');
    await page.getByTestId('po-save-draft').click();

    await expect(page.getByTestId('po-error')).toHaveText(
      'Line 1: allocation quantity cannot exceed the remaining PR quantity (10)'
    );
    await expect(page).toHaveURL(/\/purchase-orders\/new$/);
    expect(purchaseOrderPosts).toHaveLength(0);
  });
});
