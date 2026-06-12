import { test, expect } from '@playwright/test';
import { getTourId, getFirstTourData, openTour, startTour, startButton } from './helpers';

/**
 * The core happy path: open a tour, start it, and confirm the feed lists the
 * tour's stops. Complements playback-flow.spec (player behavior) and
 * navigation.spec (routing) by covering the feed content itself.
 */

test.describe('Tour start flow', () => {
  test('the start screen shows the tour title and a primary CTA', async ({ page, request }) => {
    const tourId = await getTourId(request);
    const data = (await getFirstTourData(request)) as { title?: string } | null;
    await openTour(page, tourId);

    if (data?.title) {
      await expect(page.getByRole('heading', { level: 1, name: data.title })).toBeVisible();
    }
    await expect(startButton(page)).toBeVisible();
  });

  test('starting the tour renders the stop feed with every stop', async ({ page, request }) => {
    const tourId = await getTourId(request);
    const data = (await getFirstTourData(request)) as { stops?: { id: string; type: string }[] } | null;
    const stops = data?.stops ?? [];

    await startTour(page, tourId);

    // Move to the list if the tour opened on the map.
    const listToggle = page.getByRole('button', { name: 'List view' });
    if (await listToggle.isVisible().catch(() => false)) {
      await listToggle.click();
    }

    const feed = page.getByTestId('stop-feed');
    await expect(feed).toBeVisible({ timeout: 10000 });

    // Each rendered stop carries id="stop-<id>"; the feed virtualises with
    // content-visibility but the elements are still in the DOM.
    const renderedStops = page.locator('[id^="stop-"]');
    await expect(renderedStops.first()).toBeVisible();
    if (stops.length > 0) {
      expect(await renderedStops.count()).toBe(stops.length);
    }
  });
});
