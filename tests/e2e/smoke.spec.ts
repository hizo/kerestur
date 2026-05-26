import { expect, test } from '@playwright/test';

test('homepage renders heading and links to mockups', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /Farma Kerestúr/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'A' })).toBeVisible();
});
