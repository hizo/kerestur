import { expect, test } from '@playwright/test';

test('homepage renders the hero heading and primary navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /pštrosia farma/i })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Hlavná navigácia' }).getByRole('link', { name: 'Pštros' })
  ).toBeVisible();
});
