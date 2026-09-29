import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import fixtures from '../src/features/items/api/items.fixtures.json' with { type: 'json' };

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
// Checked once at module level: a condition inside a test body fails playwright/no-conditional-in-test.
const [first] = fixtures;
if (!first) throw new Error('fixtures must not be empty');

test('the list shows every item and has no accessibility violations', async ({ page }) => {
  await page.goto('/items');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(fixtures.length);

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations).toEqual([]);
});

test('opening an item shows its detail', async ({ page }) => {
  await page.goto('/items');
  await page.getByRole('link', { name: first.title }).click();
  await expect(page).toHaveURL(new RegExp(`/items/${first.id}$`));
  await expect(page.getByRole('heading', { level: 1, name: first.title })).toBeVisible();
});
