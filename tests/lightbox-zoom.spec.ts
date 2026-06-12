import { test, expect } from '@playwright/test';
import { getTourId, dismissSplashIfPresent } from './helpers';

test.describe('Image lightbox zoom', () => {
  test('double-tap (double-click) zooms image in lightbox', async ({ page, request }) => {
    const tourId = await getTourId(request);

    // Go directly to tour detail and enter the tour
    await page.goto(`/tour/${tourId}`, { waitUntil: 'domcontentloaded' });
    await dismissSplashIfPresent(page);

    const startButton = page.locator('button:has-text("Start tour")');
    await startButton.waitFor({ timeout: 10000 });
    await startButton.click();

    // Give the feed time to render. Don't wait for networkidle — the feed
    // streams audio and never reaches an idle state.
    await page.waitForTimeout(1000);

    // Only image-text / gallery cards open a lightbox (audio-stop thumbnails
    // just navigate). If the active tour has no such stop, there is nothing to
    // exercise — skip rather than fail. The test runs automatically once a tour
    // ships an image stop.
    const feedImage = page.locator('[data-testid="lightbox-trigger"]').first();
    test.skip(
      (await feedImage.count()) === 0,
      'active tour has no image-text/gallery stop to open a lightbox',
    );
    await feedImage.scrollIntoViewIfNeeded();
    await feedImage.click();

    // Wait for lightbox to open (close button appears)
    const closeButton = page.getByLabel('Close');
    await closeButton.waitFor({ timeout: 10000 });

    // The lightbox image is rendered in the portal; last img on the page is a good approximation.
    const lightboxImage = page.locator('img').last();
    await lightboxImage.waitFor({ timeout: 10000 });

    const beforeBox = await lightboxImage.boundingBox();
    expect(beforeBox).not.toBeNull();

    // Simulate a quick double-tap via double-click
    await lightboxImage.dblclick();
    await page.waitForTimeout(400);

    const afterBox = await lightboxImage.boundingBox();
    expect(afterBox).not.toBeNull();

    // After zoom, the rendered width should be noticeably larger
    if (beforeBox && afterBox) {
      expect(afterBox.width).toBeGreaterThan(beforeBox.width * 1.15);
      expect(afterBox.height).toBeGreaterThan(beforeBox.height * 1.15);
    }
  });
});

