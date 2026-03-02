// @ts-check
const { test, expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// Seed data constants (from 002_seed_procurement_mvp.sql)
// ---------------------------------------------------------------------------
const SEED_PR_APPROVED = { prNumber: 'PR-2026-0001', requester: 'Sari Lestari', status: 'APPROVED' };
const SEED_PR_SUBMITTED = { prNumber: 'PR-2026-0002', requester: 'Budi Santoso', status: 'SUBMITTED' };
const SEED_PR_DRAFT = { prNumber: 'PR-2026-0003', requester: 'Nina Prasetyo', status: 'DRAFT' };

// ===========================================================================
// 1. Dashboard Page
// ===========================================================================
test.describe('Dashboard Page', () => {
  test('should display navbar with correct navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.navbar-brand')).toHaveText('Procurement MVP');
    await expect(page.locator('.navbar nav a')).toHaveCount(2);
    await expect(page.locator('.navbar nav a').first()).toHaveText('Dashboard');
    await expect(page.locator('.navbar nav a').nth(1)).toHaveText('Purchase Requisitions');
  });

  test('should display page header and New PR button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.page-header h2')).toHaveText('Procurement Dashboard');
    await expect(page.locator('.page-header .btn-outline')).toHaveText('+ New PR');
  });

  test('should display stat cards with correct counts from seed data', async ({ page }) => {
    await page.goto('/');

    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(4);

    // Labels
    await expect(statCards.nth(0).locator('.stat-card-title')).toHaveText('Open PR');
    await expect(statCards.nth(1).locator('.stat-card-title')).toHaveText('Draft');
    await expect(statCards.nth(2).locator('.stat-card-title')).toHaveText('Submitted');
    await expect(statCards.nth(3).locator('.stat-card-title')).toHaveText('Approved');

    // Verify card values are numeric and total = draft + submitted + approved
    const total = Number(await statCards.nth(0).locator('.stat-card-value').textContent());
    const draft = Number(await statCards.nth(1).locator('.stat-card-value').textContent());
    const submitted = Number(await statCards.nth(2).locator('.stat-card-value').textContent());
    const approved = Number(await statCards.nth(3).locator('.stat-card-value').textContent());

    expect(total).toBeGreaterThanOrEqual(3);
    expect(draft).toBeGreaterThanOrEqual(1);
    expect(submitted).toBeGreaterThanOrEqual(1);
    expect(approved).toBeGreaterThanOrEqual(1);
    expect(draft + submitted + approved).toBe(total);
  });

  test('should display recent PR table with seed data', async ({ page }) => {
    await page.goto('/');

    const table = page.locator('.card-panel table');
    await expect(table).toBeVisible();

    // Table headers
    const headers = table.locator('thead th');
    await expect(headers.nth(0)).toHaveText('PR No');
    await expect(headers.nth(1)).toHaveText('Requester');
    await expect(headers.nth(2)).toHaveText('Status');
    await expect(headers.nth(3)).toHaveText('Created');

    // Should show up to 5 recent PRs (seed has 3; more may exist from test runs)
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(3);
    expect(rowCount).toBeLessThanOrEqual(5);
  });

  test('should navigate to create PR page from New PR button', async ({ page }) => {
    await page.goto('/');
    await page.locator('.page-header .btn-outline').click();
    await expect(page).toHaveURL('/requisitions/new');
  });

  test('should navigate to PR list from View All link', async ({ page }) => {
    await page.goto('/');
    await page.locator('.card-panel-header a').click();
    await expect(page).toHaveURL('/requisitions');
  });

  test('should navigate to PR detail when clicking PR number', async ({ page }) => {
    await page.goto('/');
    await page.locator('.card-panel table tbody tr').first().locator('a').click();
    await expect(page).toHaveURL(/\/requisitions\/.+/);
  });
});

// ===========================================================================
// 2. PR List Page
// ===========================================================================
test.describe('PR List Page', () => {
  test('should display page header with back button', async ({ page }) => {
    await page.goto('/requisitions');
    await expect(page.locator('.page-header h2')).toHaveText('Purchase Requisitions');
    await expect(page.locator('.back-btn')).toBeVisible();
  });

  test('should display table with all seed PRs', async ({ page }) => {
    await page.goto('/requisitions');

    const table = page.locator('.card-panel table');
    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(6);
    await expect(headers.nth(0)).toHaveText('PR Number');
    await expect(headers.nth(1)).toHaveText('Requester');
    await expect(headers.nth(2)).toHaveText('Department');
    await expect(headers.nth(3)).toHaveText('Title');
    await expect(headers.nth(4)).toHaveText('Status');
    await expect(headers.nth(5)).toHaveText('Needed By');

    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(3);
  });

  test('should show status badges with correct classes', async ({ page }) => {
    await page.goto('/requisitions');

    const badges = page.locator('.status-badge');
    // At least 3 badges (seed data); more may exist from prior test runs
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThanOrEqual(3);

    const badgeTexts = await badges.allTextContents();
    expect(badgeTexts).toContain('APPROVED');
    expect(badgeTexts).toContain('SUBMITTED');
    expect(badgeTexts).toContain('DRAFT');
  });

  test('should navigate back to dashboard via back button', async ({ page }) => {
    await page.goto('/requisitions');
    await page.locator('.back-btn').click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate to create PR page', async ({ page }) => {
    await page.goto('/requisitions');
    await page.locator('.btn-outline', { hasText: '+ New PR' }).click();
    await expect(page).toHaveURL('/requisitions/new');
  });

  test('should navigate to PR detail when clicking PR number', async ({ page }) => {
    await page.goto('/requisitions');
    await page.locator('.card-panel table tbody tr').first().locator('a').click();
    await expect(page).toHaveURL(/\/requisitions\/.+/);
    await expect(page.locator('.page-header h2')).toHaveText('Detail Purchase Requisition');
  });
});

// ===========================================================================
// 3. PR Create Page
// ===========================================================================
test.describe('PR Create Page', () => {
  test('should display form structure with header and lines cards', async ({ page }) => {
    await page.goto('/requisitions/new');

    await expect(page.locator('.page-header h2')).toHaveText('Create Purchase Requisition');
    await expect(page.locator('.back-btn')).toBeVisible();

    // Two card panels: PR Header and PR Lines
    const panels = page.locator('.card-panel');
    await expect(panels).toHaveCount(2);
    await expect(panels.nth(0).locator('.form-section-title')).toHaveText('PR Header');
    await expect(panels.nth(1).locator('.form-section-title')).toHaveText('PR Lines');
  });

  test('should have required header fields', async ({ page }) => {
    await page.goto('/requisitions/new');

    const headerPanel = page.locator('.card-panel').first();
    await expect(headerPanel.locator('label', { hasText: 'Requester Name' })).toBeVisible();
    await expect(headerPanel.locator('label', { hasText: 'Department' })).toBeVisible();
    await expect(headerPanel.locator('label', { hasText: 'PR Title' })).toBeVisible();
    await expect(headerPanel.locator('label', { hasText: 'Needed By date' })).toBeVisible();
    await expect(headerPanel.locator('label', { hasText: 'Notes' })).toBeVisible();
  });

  test('should start with one empty line item', async ({ page }) => {
    await page.goto('/requisitions/new');

    const linesTable = page.locator('.card-panel').nth(1).locator('table');
    const rows = linesTable.locator('tbody tr');
    await expect(rows).toHaveCount(1);
  });

  test('should add and remove line items', async ({ page }) => {
    await page.goto('/requisitions/new');

    const linesPanel = page.locator('.card-panel').nth(1);
    const rows = linesPanel.locator('table tbody tr');

    // Start with 1 line
    await expect(rows).toHaveCount(1);

    // Add a line
    await linesPanel.locator('.btn-outline', { hasText: '+ New Line' }).click();
    await expect(rows).toHaveCount(2);

    // Add another
    await linesPanel.locator('.btn-outline', { hasText: '+ New Line' }).click();
    await expect(rows).toHaveCount(3);

    // Remove last line
    await rows.nth(2).locator('.btn-danger-icon').click();
    await expect(rows).toHaveCount(2);
  });

  test('should not remove the last remaining line', async ({ page }) => {
    await page.goto('/requisitions/new');

    const linesPanel = page.locator('.card-panel').nth(1);
    const rows = linesPanel.locator('table tbody tr');

    await expect(rows).toHaveCount(1);
    // Click remove on the only line — it should stay
    await rows.first().locator('.btn-danger-icon').click();
    await expect(rows).toHaveCount(1);
  });

  test('should create a new PR and redirect to detail page', async ({ page }) => {
    await page.goto('/requisitions/new');

    // Fill header
    const headerPanel = page.locator('.card-panel').first();
    await headerPanel.locator('.form-group').filter({ hasText: 'Requester Name' }).locator('input').fill('E2E Test User');
    await headerPanel.locator('.form-group').filter({ hasText: 'Department' }).locator('input').fill('QA');
    await headerPanel.locator('.form-group').filter({ hasText: 'PR Title' }).locator('input').fill('Playwright Test PR');

    // Fill first line
    const linesTable = page.locator('.card-panel').nth(1).locator('table tbody tr').first();
    await linesTable.locator('td').nth(1).locator('input').fill('TEST-001');
    await linesTable.locator('td').nth(2).locator('input').fill('Test Item');
    await linesTable.locator('td').nth(3).locator('input').fill('5');
    await linesTable.locator('td').nth(4).locator('input').fill('PCS');
    await linesTable.locator('td').nth(5).locator('input').fill('10000');
    await linesTable.locator('td').nth(6).locator('input').fill('SITE-01');

    // Submit form
    await page.locator('.btn-primary', { hasText: 'Save As Draft' }).click();

    // Should redirect to detail page
    await expect(page).toHaveURL(/\/requisitions\/.+/);
    await expect(page.locator('.page-header h2')).toHaveText('Detail Purchase Requisition');

    // Verify created PR data on detail page
    await expect(page.locator('.form-group').filter({ hasText: 'Requester Name' }).locator('input')).toHaveValue('E2E Test User');
    await expect(page.locator('.form-group').filter({ hasText: 'Department' }).locator('input')).toHaveValue('QA');
    await expect(page.locator('.form-group').filter({ hasText: 'PR Title' }).locator('input')).toHaveValue('Playwright Test PR');
    await expect(page.locator('.status-badge')).toHaveText('DRAFT');
  });

  test('should navigate back via Cancel button', async ({ page }) => {
    await page.goto('/requisitions/new');
    await page.locator('.btn-outline', { hasText: 'Cancel' }).click();
    await expect(page).toHaveURL('/requisitions');
  });
});

// ===========================================================================
// 4. PR Detail Page (seed data)
// ===========================================================================
test.describe('PR Detail Page', () => {
  test('should display detail page structure for a seed PR', async ({ page }) => {
    // Navigate via list page to the first PR
    await page.goto('/requisitions');
    await page.locator('.card-panel table tbody tr').first().locator('a').click();

    await expect(page.locator('.page-header h2')).toHaveText('Detail Purchase Requisition');
    await expect(page.locator('.back-btn')).toBeVisible();

    // PR Header card
    const panels = page.locator('.card-panel');
    await expect(panels).toHaveCount(2);
    await expect(panels.nth(0).locator('.form-section-title')).toHaveText('PR Header');
    await expect(panels.nth(1).locator('.form-section-title')).toHaveText('PR Lines');
  });

  test('should display read-only header fields', async ({ page }) => {
    await page.goto('/requisitions');
    await page.locator('.card-panel table tbody tr').first().locator('a').click();

    const headerPanel = page.locator('.card-panel').first();
    // All inputs should be disabled
    const inputs = headerPanel.locator('input');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      await expect(inputs.nth(i)).toBeDisabled();
    }

    // Textarea should also be disabled
    await expect(headerPanel.locator('textarea')).toBeDisabled();
  });

  test('should display PR lines in a read-only table', async ({ page }) => {
    await page.goto('/requisitions');
    await page.locator('.card-panel table tbody tr').first().locator('a').click();

    const linesTable = page.locator('.card-panel').nth(1).locator('table');
    const headers = linesTable.locator('thead th');
    await expect(headers.nth(0)).toHaveText('Line');
    await expect(headers.nth(1)).toHaveText('Item Code');
    await expect(headers.nth(2)).toHaveText('Item Name');
    await expect(headers.nth(3)).toHaveText('QTY');
    await expect(headers.nth(4)).toHaveText('UOM');

    // Should have at least 1 line
    const rows = linesTable.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });
});

// ===========================================================================
// 5. PR Workflow: Draft → Submit → Approve
// ===========================================================================
test.describe('PR Workflow: Create → Submit → Approve', () => {
  test('should complete full PR lifecycle', async ({ page }) => {
    // Step 1: Create a new PR
    await page.goto('/requisitions/new');

    const headerPanel = page.locator('.card-panel').first();
    await headerPanel.locator('.form-group').filter({ hasText: 'Requester Name' }).locator('input').fill('Workflow Tester');
    await headerPanel.locator('.form-group').filter({ hasText: 'Department' }).locator('input').fill('Operations');
    await headerPanel.locator('.form-group').filter({ hasText: 'PR Title' }).locator('input').fill('Full Lifecycle PR');

    const linesTable = page.locator('.card-panel').nth(1).locator('table tbody tr').first();
    await linesTable.locator('td').nth(1).locator('input').fill('LIFE-001');
    await linesTable.locator('td').nth(2).locator('input').fill('Lifecycle Item');
    await linesTable.locator('td').nth(3).locator('input').fill('10');
    await linesTable.locator('td').nth(4).locator('input').fill('PCS');
    await linesTable.locator('td').nth(5).locator('input').fill('5000');
    await linesTable.locator('td').nth(6).locator('input').fill('SITE-01');

    await page.locator('.btn-primary', { hasText: 'Save As Draft' }).click();
    await expect(page).toHaveURL(/\/requisitions\/.+/);

    // Verify status is DRAFT and Submit button is visible
    await expect(page.locator('.status-badge')).toHaveText('DRAFT');
    await expect(page.locator('.btn-primary', { hasText: 'Submit PR' })).toBeVisible();
    // Approve button should NOT be visible in DRAFT state
    await expect(page.locator('.btn-primary', { hasText: 'Approve PR' })).not.toBeVisible();

    // Step 2: Submit the PR
    await page.locator('.btn-primary', { hasText: 'Submit PR' }).click();

    await expect(page.locator('.status-badge')).toHaveText('SUBMITTED');
    await expect(page.locator('.btn-primary', { hasText: 'Approve PR' })).toBeVisible();
    // Submit button should NOT be visible after submission
    await expect(page.locator('.btn-primary', { hasText: 'Submit PR' })).not.toBeVisible();

    // Step 3: Approve the PR
    await page.locator('.btn-primary', { hasText: 'Approve PR' }).click();

    await expect(page.locator('.status-badge')).toHaveText('APPROVED');
    // No action buttons should be visible after approval
    await expect(page.locator('.btn-primary', { hasText: 'Submit PR' })).not.toBeVisible();
    await expect(page.locator('.btn-primary', { hasText: 'Approve PR' })).not.toBeVisible();
  });
});

// ===========================================================================
// 6. Navbar Active State
// ===========================================================================
test.describe('Navbar Active State', () => {
  test('should highlight Dashboard link on home page', async ({ page }) => {
    await page.goto('/');
    const dashLink = page.locator('.navbar nav a').first();
    await expect(dashLink).toHaveClass(/active/);
  });

  test('should highlight Purchase Requisitions link on PR pages', async ({ page }) => {
    await page.goto('/requisitions');
    const prLink = page.locator('.navbar nav a').nth(1);
    await expect(prLink).toHaveClass(/active/);

    // Also on create page
    await page.goto('/requisitions/new');
    await expect(prLink).toHaveClass(/active/);
  });
});
