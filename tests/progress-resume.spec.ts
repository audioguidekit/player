import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import { getTourId, getFirstTourData, openTour, startButton, dismissSplashIfPresent } from './helpers';

/**
 * Progress persistence + auto-resume.
 *
 * `useProgressTracking` stores per-stop completion/position under
 * `tour_progress_<tourId>` in localStorage; `useAutoResume` reads it on mount to
 * pick the first unfinished audio stop, and `handleStartTour` resumes there.
 *
 * These seed localStorage before the app boots and assert the observable
 * consequences: the resumed stop in the URL and the completed-stop checkmark in
 * the list (a `[data-testid="stop-completed"]` marker on AnimatedCheckmark).
 */

const progressKey = (tourId: string) => `tour_progress_${tourId}`;

/** Audio stop ids of the default (flat) tour, in order. */
async function audioStopIds(request: APIRequestContext): Promise<string[]> {
  const data = (await getFirstTourData(request)) as { stops?: { id: string; type: string }[] } | null;
  return (data?.stops ?? []).filter((s) => s.type === 'audio').map((s) => s.id);
}

/** Writes a progress blob into localStorage for the given tour, before the app loads. */
async function seedProgress(
  page: Page,
  tourId: string,
  stops: Record<string, { isCompleted?: boolean; lastPosition?: number }>,
): Promise<void> {
  // Need a same-origin document first so localStorage is writable.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ key, value }) => {
      localStorage.clear();
      const blob = {
        stops: Object.fromEntries(
          Object.entries(value).map(([id, s]) => [
            id,
            { isCompleted: !!s.isCompleted, lastPosition: s.lastPosition ?? 0 },
          ]),
        ),
      };
      localStorage.setItem(key, JSON.stringify(blob));
    },
    { key: progressKey(tourId), value: stops },
  );
}

test.describe('Progress & auto-resume', () => {
  test('auto-resume starts at the first unfinished stop', async ({ page, request }) => {
    const tourId = await getTourId(request);
    const ids = await audioStopIds(request);
    test.skip(ids.length < 2, 'need at least two audio stops to assert resume target');

    // Mark the first stop complete; resume should target the second.
    await seedProgress(page, tourId, { [ids[0]]: { isCompleted: true } });

    await openTour(page, tourId);
    await startButton(page).click();

    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 10000 })
      .toMatch(new RegExp(`/tour/[^/]+/${ids[1]}$`));
  });

  test('a completed stop shows a checkmark, and it survives a reload', async ({ page, request }) => {
    const tourId = await getTourId(request);
    const ids = await audioStopIds(request);
    test.skip(ids.length < 1, 'no audio stops');

    await seedProgress(page, tourId, { [ids[0]]: { isCompleted: true } });

    await openTour(page, tourId);
    await startButton(page).click();
    await page.getByTestId('mini-player').waitFor({ state: 'attached', timeout: 15000 });

    // Switch to the list if the tour opened on the map.
    const listToggle = page.getByRole('button', { name: 'List view' });
    if (await listToggle.isVisible().catch(() => false)) {
      await listToggle.click();
    }

    await expect(page.getByTestId('stop-completed').first()).toBeVisible({ timeout: 10000 });

    // Reload — completion lives in localStorage, so the checkmark must return.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await dismissSplashIfPresent(page);
    const listToggle2 = page.getByRole('button', { name: 'List view' });
    if (await listToggle2.isVisible({ timeout: 5000 }).catch(() => false)) {
      await listToggle2.click();
    }
    await expect(page.getByTestId('stop-completed').first()).toBeVisible({ timeout: 10000 });
  });

  test('with no stored progress, the tour starts at the first stop', async ({ page, request }) => {
    const tourId = await getTourId(request);
    const ids = await audioStopIds(request);
    test.skip(ids.length < 1, 'no audio stops');

    await seedProgress(page, tourId, {}); // clears storage

    await openTour(page, tourId);
    await startButton(page).click();

    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 10000 })
      .toMatch(new RegExp(`/tour/[^/]+/${ids[0]}$`));
  });
});
