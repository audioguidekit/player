import { test, expect } from '@playwright/test';
import { getTourId, getFirstTourData, openTour, startButton, dismissSplashIfPresent } from './helpers';

/**
 * Push/pop navigation (RootNavigator) and stop deep links.
 *
 * `/` is the multi-tour picker; tapping a card pushes the tour over it, and the
 * TourStart "Back to tours" affordance (shown only in multi-tour deployments)
 * pops back. Deep links to `/tour/<id>/<stopId>` should open the tour with that
 * stop already selected.
 */

const TOUR_CARD = 'button:has(h2)';

test.describe('Navigation — push/pop', () => {
  test('tapping a tour card pushes the tour, then back returns to the picker', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissSplashIfPresent(page);

    const cards = page.locator(TOUR_CARD);
    // Single-tour deployments skip the picker entirely — nothing to pop back to.
    test.skip((await cards.count()) < 2, 'not a multi-tour deployment');

    await cards.first().click();
    await expect.poll(() => page.url(), { timeout: 10000 }).toContain('/tour/');
    await expect(page.locator('button:has-text("Start tour")')).toBeVisible({ timeout: 15000 });

    // Pop back to the picker via the TourStart back affordance.
    const back = page.getByRole('button', { name: 'Back to tours' });
    await expect(back).toBeVisible({ timeout: 10000 });
    await back.click();

    await expect(page.locator(TOUR_CARD).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(TOUR_CARD)).toHaveCount(await cards.count());
  });

  test('Home from inside a started tour returns to the tour start screen', async ({ page, request }) => {
    // The header (with Home) sits at the top of the mobile frame, which is
    // clipped on the default desktop viewport — make it tall enough to show.
    await page.setViewportSize({ width: 430, height: 1100 });
    const tourId = await getTourId(request);
    await openTour(page, tourId);
    await page.locator('button:has-text("Start tour")').click();
    await page.getByTestId('mini-player').waitFor({ state: 'attached', timeout: 15000 });

    // The TourHeader home button returns to the tour start screen.
    await page.getByRole('button', { name: 'Home' }).click();

    // Back on the start screen, the primary CTA is available again.
    await expect(startButton(page)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Navigation — deep links', () => {
  test('a stop deep link opens the tour with that stop selected', async ({ page, request }) => {
    const tourId = await getTourId(request);
    const data = (await getFirstTourData(request)) as
      | { stops?: { id: string; type: string; title?: string }[] }
      | null;
    const audioStops = (data?.stops ?? []).filter((s) => s.type === 'audio');
    test.skip(audioStops.length < 2, 'need a non-first audio stop to deep link to');

    const target = audioStops[1];
    await page.goto(`/tour/${tourId}/${target.id}`, { waitUntil: 'domcontentloaded' });
    await dismissSplashIfPresent(page);

    // The mini player should mount for the deep-linked stop.
    const miniPlayer = page.getByTestId('mini-player');
    await expect(miniPlayer).toBeVisible({ timeout: 15000 });

    // URL retains the stop segment…
    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 10000 })
      .toMatch(new RegExp(`/${target.id}$`));

    // …and the player shows that stop's title.
    if (target.title) {
      await expect(miniPlayer.getByText(target.title, { exact: false }).first()).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test('an unknown stop id falls back gracefully without crashing', async ({ page, request }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const tourId = await getTourId(request);
    await page.goto(`/tour/${tourId}/this-stop-does-not-exist`, { waitUntil: 'domcontentloaded' });
    await dismissSplashIfPresent(page);

    // App still renders something usable (start screen or feed), no uncaught errors.
    await expect(page.locator('h1, [data-testid="stop-feed"], button:has-text("Start tour")').first())
      .toBeVisible({ timeout: 15000 });
    expect(pageErrors, `Uncaught page errors:\n${pageErrors.join('\n')}`).toEqual([]);
  });
});
