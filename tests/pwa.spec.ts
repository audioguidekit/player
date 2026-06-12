import { test, expect } from '@playwright/test';

/**
 * PWA wiring. These assert the app actually ships a usable manifest and that the
 * service worker registers — not merely that the browser exposes the APIs.
 */

test.describe('PWA', () => {
  test('serves a manifest that parses and declares an installable app', async ({ page, request }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const link = page.locator('link[rel="manifest"]');
    await expect(link).toHaveCount(1);
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();

    const res = await request.get(new URL(href!, page.url()).toString());
    expect(res.ok()).toBe(true);
    const manifest = await res.json();
    // A minimally installable manifest needs a name, a start_url and icons.
    expect(manifest.name || manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(Array.isArray(manifest.icons) && manifest.icons.length).toBeTruthy();
  });

  test('registers a service worker', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for the registration rather than just checking the API exists.
    const registered = await page
      .waitForFunction(
        async () => {
          if (!('serviceWorker' in navigator)) return false;
          const reg = await navigator.serviceWorker.getRegistration();
          return !!reg;
        },
        { timeout: 15000 },
      )
      .then(() => true)
      .catch(() => false);

    expect(registered).toBe(true);
  });
});
