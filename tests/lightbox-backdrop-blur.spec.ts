import { test, expect } from '@playwright/test';
import { getTourId, dismissSplashIfPresent } from './helpers';

test.describe('Image lightbox backdrop blur', () => {
  test('backdropFilter blur is applied to lightbox backdrop', async ({ page, request }) => {
    const tourId = await getTourId(request);

    // Navigate to a real tour and enter it
    await page.goto(`/tour/${tourId}`, { waitUntil: 'domcontentloaded' });
    await dismissSplashIfPresent(page);

    const startButton = page.locator('button:has-text("Start tour")');
    await startButton.waitFor({ timeout: 10000 });
    await startButton.click();

    // Don't wait for networkidle — the feed streams audio and never idles.
    await page.waitForTimeout(1000);

    // Only image-text / gallery cards trigger ImageLightbox (audio-stop
    // thumbnails just navigate). If the active tour has no such stop, there is
    // nothing to exercise — skip rather than fail. The test runs automatically
    // once a tour ships an image stop.
    const feedImage = page.locator('[data-testid="lightbox-trigger"]').first();
    test.skip(
      (await feedImage.count()) === 0,
      'active tour has no image-text/gallery stop to open a lightbox',
    );
    await feedImage.scrollIntoViewIfNeeded();
    await feedImage.click();

    // Wait for lightbox to open (close button visible)
    const closeButton = page.getByLabel('Close');
    await closeButton.waitFor({ timeout: 10000 });

    // In the portal, find the backdrop div that has a non-none backdropFilter
    const blurInfo = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('div'));
      const matches: { idx: number; backdropFilter: string }[] = [];
      allDivs.forEach((el, idx) => {
        const style = window.getComputedStyle(el);
        const bf = (style as any).backdropFilter as string;
        if (bf && bf !== 'none') {
          matches.push({ idx, backdropFilter: bf });
        }
      });
      return matches;
    });

    // Expect at least one element to have a blur() backdropFilter applied
    expect(Array.isArray(blurInfo)).toBe(true);
    expect(blurInfo.length).toBeGreaterThan(0);

    // Optionally, assert it contains blur with a radius (browser may normalize the value)
    const hasBlur = blurInfo.some((m: any) =>
      typeof m.backdropFilter === 'string' && m.backdropFilter.includes('blur')
    );
    expect(hasBlur).toBe(true);
  });
});

