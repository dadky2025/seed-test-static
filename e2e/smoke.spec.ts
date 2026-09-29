import { expect, test } from '@playwright/test';

const HEALTHZ = '/healthz.json'; // a static file: static hosts have no server route
// After a deploy, also prove the new build is the one answering (decided here, not inside the test).
const EXPECTED_HEALTH = process.env.EXPECTED_VERSION
  ? { status: 'ok', version: process.env.EXPECTED_VERSION }
  : { status: 'ok' };

test('the app is up and reports the deployed version', { tag: '@smoke' }, async ({ request }) => {
  const response = await request.get(HEALTHZ);
  expect(response.ok()).toBe(true);
  const body: unknown = await response.json();
  expect(body).toMatchObject(EXPECTED_HEALTH);
});

test('the home page renders without console errors', { tag: '@smoke' }, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  expect(errors).toEqual([]);
});
