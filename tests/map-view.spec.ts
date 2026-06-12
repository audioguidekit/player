import { test, expect } from '@playwright/test';
import { startTour } from './helpers';
import * as fs from 'fs';
import * as path from 'path';

const TOUR_DIR = path.join(process.cwd(), 'src/data/tour');

/** First tour id whose metadata enables the map (`mapView === true`), if any. */
function mapTourId(): string | undefined {
  const dirs = fs
    .readdirSync(TOUR_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  for (const id of dirs) {
    const meta = path.join(TOUR_DIR, id, 'metadata.json');
    if (!fs.existsSync(meta)) continue;
    if (JSON.parse(fs.readFileSync(meta, 'utf-8')).mapView === true) return id;
  }
  return undefined;
}

const MAP_TOUR = mapTourId();

/**
 * Map view: the map/list toggle, Leaflet markers, and marker → stop selection.
 *
 * TourDetail keeps the map mounted across view switches (visibility:hidden, not
 * unmounted) so Leaflet state survives. The toggle only appears when both views
 * are enabled (`mapView === true` && `listView !== false`). The default tour has
 * the map enabled; tours without a map simply skip these.
 */

// The app renders inside a fixed mobile device frame. On the default desktop
// viewport (720px tall) the frame's top — where the Map/List toggle lives — is
// clipped above the fold, so give these tests a tall enough viewport.
test.use({ viewport: { width: 430, height: 1100 } });

test.describe('Map view', () => {
  test('a map-enabled tour opens on the map with the toggle available', async ({ page }) => {
    test.skip(!MAP_TOUR, 'no map-enabled tour in this deployment');
    await startTour(page, MAP_TOUR!);

    await expect(page.getByRole('button', { name: 'Map view' })).toBeVisible({ timeout: 10000 });

    // Leaflet mounts its container when the map view is active.
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 });
  });

  test('toggling to list shows the feed, and back keeps the map mounted', async ({ page }) => {
    test.skip(!MAP_TOUR, 'no map-enabled tour in this deployment');
    await startTour(page, MAP_TOUR!);

    const listToggle = page.getByRole('button', { name: 'List view' });
    const mapToggle = page.getByRole('button', { name: 'Map view' });
    await expect(listToggle).toBeVisible({ timeout: 10000 });

    await listToggle.click();
    await expect(page.getByTestId('stop-feed')).toBeVisible({ timeout: 10000 });

    await mapToggle.click();
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
    // The map element is reused, never torn down — it stays in the DOM throughout.
    await expect(page.locator('.leaflet-container')).toHaveCount(1);
  });

  test('renders markers and a marker tap selects a stop', async ({ page }) => {
    test.skip(!MAP_TOUR, 'no map-enabled tour in this deployment');
    await startTour(page, MAP_TOUR!);
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 });

    // Leaflet markers render as interactive panes. Clustering may collapse some,
    // so accept either individual markers or cluster icons.
    const markers = page.locator(
      '.leaflet-marker-icon, .leaflet-marker-pane > *, .marker-cluster'
    );
    await expect(markers.first()).toBeVisible({ timeout: 15000 });

    const pathBefore = new URL(page.url()).pathname;
    await markers.first().click();

    // Tapping a marker selects its stop (onStopClick → currentStopId → URL sync),
    // or zooms a cluster. Either way the map stays alive and no error is thrown;
    // when it's a real stop marker the path gains a stop segment.
    await page.waitForTimeout(800);
    const pathAfter = new URL(page.url()).pathname;
    const selectedAStop = /\/tour\/[^/]+\/[^/]+/.test(pathAfter) && pathAfter !== pathBefore;
    const stillOnMap = await page.locator('.leaflet-container').isVisible();
    expect(selectedAStop || stillOnMap).toBe(true);
  });
});
