const { test, expect } = require('@playwright/test');

test.use({ baseURL: 'http://localhost:4173' });

test('theme toggle switches between light and dark mode', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /Switch to/i });
  await expect(toggle).toBeVisible();

  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');

  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'light');
});
