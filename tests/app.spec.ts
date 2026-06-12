import { test, expect } from '@playwright/test';
import { getTourId, dismissSplashIfPresent } from './helpers';

test.describe('App loading', () => {
  test('loads without uncaught errors or critical console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    // Attach listeners BEFORE navigating so load-time errors are captured.
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // The landing surface renders a level-1 heading (picker title or tour title).
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    const critical = consoleErrors.filter(
      (e) => !/service worker|favicon|manifest|the server responded with a status of 4/i.test(e),
    );
    expect(pageErrors, `Uncaught page errors:\n${pageErrors.join('\n')}`).toEqual([]);
    expect(critical, `Critical console errors:\n${critical.join('\n')}`).toEqual([]);
  });

  test('the multi-tour picker renders the landing title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissSplashIfPresent(page);
    // "Discover New York" etc. — the app-level title from app.json.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Navigation', () => {
  test('navigating directly to a tour shows its start screen', async ({ page, request }) => {
    const tourId = await getTourId(request);
    await page.goto(`/tour/${tourId}`, { waitUntil: 'domcontentloaded' });
    await dismissSplashIfPresent(page);

    expect(page.url()).toContain(tourId);
    // The tour start screen exposes the primary CTA.
    await expect(page.getByRole('button', { name: /Start tour|Resume tour|Replay tour/ }))
      .toBeVisible({ timeout: 15000 });
  });

  test('a stop deep link keeps the tour + stop in the URL and renders the player', async ({ page, request }) => {
    const tourId = await getTourId(request);
    await page.goto(`/tour/${tourId}/1`, { waitUntil: 'domcontentloaded' });
    await dismissSplashIfPresent(page);

    expect(page.url()).toContain(tourId);
    await expect(page.getByTestId('mini-player')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Responsive design', () => {
  for (const { name, width, height } of [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
  ]) {
    test(`renders on a ${name} viewport without horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

      // No runaway horizontal scroll (allow a small rounding margin).
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(2);
    });
  }
});
