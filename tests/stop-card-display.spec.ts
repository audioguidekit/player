import { test, expect } from '@playwright/test';
import { getTourId, dismissSplashIfPresent } from './helpers';
import * as fs from 'fs';
import * as path from 'path';

// All 8 combinations of the three boolean settings
const combinations = [
  { showStopImage: true,  showStopDuration: true,  showStopNumber: true,  name: '1-full-card' },
  { showStopImage: true,  showStopDuration: true,  showStopNumber: false, name: '2-card-no-number' },
  { showStopImage: true,  showStopDuration: false, showStopNumber: true,  name: '3-card-no-duration' },
  { showStopImage: true,  showStopDuration: false, showStopNumber: false, name: '4-card-minimal' },
  { showStopImage: false, showStopDuration: true,  showStopNumber: true,  name: '5-list-full' },
  { showStopImage: false, showStopDuration: true,  showStopNumber: false, name: '6-list-no-number' },
  { showStopImage: false, showStopDuration: false, showStopNumber: true,  name: '7-list-no-duration' },
  { showStopImage: false, showStopDuration: false, showStopNumber: false, name: '8-list-minimal' },
];

// Per-tour metadata lives at src/data/tour/<tourId>/metadata.json since the
// multi-tour restructure. The path depends on the active tour id, so it is
// resolved (and the original captured) on the first test run.
const TOUR_DIR = path.join(process.cwd(), 'src/data/tour');
let metadataPath: string | undefined;
let originalMetadata: string | undefined;

// Run tests serially since we're modifying the same file
test.describe.configure({ mode: 'serial' });

test.describe('Stop Card Display Options', () => {
  test.afterAll(async () => {
    // Restore original metadata
    if (metadataPath && originalMetadata !== undefined) {
      fs.writeFileSync(metadataPath, originalMetadata);
    }
  });

  for (const combo of combinations) {
    test(`${combo.name}: image=${combo.showStopImage}, duration=${combo.showStopDuration}, number=${combo.showStopNumber}`, async ({ page, request }) => {
      const tourId = await getTourId(request);

      // Resolve the per-tour metadata path and capture the original once.
      if (!metadataPath) {
        metadataPath = path.join(TOUR_DIR, tourId, 'metadata.json');
        originalMetadata = fs.readFileSync(metadataPath, 'utf-8');
      }

      // Read current metadata and update settings
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      metadata.showStopImage = combo.showStopImage;
      metadata.showStopDuration = combo.showStopDuration;
      metadata.showStopNumber = combo.showStopNumber;

      // Write updated metadata (triggers Vite HMR)
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');

      // Wait for Vite to pick up the change and rebuild
      await page.waitForTimeout(2000);

      // Navigate to tour start page (fresh load to get new bundle)
      await page.goto(`/tour/${tourId}`, { waitUntil: 'domcontentloaded' });
      await dismissSplashIfPresent(page);

      // Click "Start tour" to enter the feed. A JSON write can trigger a Vite
      // full-reload that bounces back to the start screen, so re-click if the
      // feed list hasn't appeared.
      const startButton = page.locator('button:has-text("Start tour")');
      const feed = page.locator('[data-testid="stop-feed"]');
      await startButton.waitFor({ timeout: 10000 });
      await startButton.click();
      await feed.waitFor({ state: 'visible', timeout: 8000 }).catch(async () => {
        await dismissSplashIfPresent(page);
        await startButton.click();
        await feed.waitFor({ state: 'visible', timeout: 10000 });
      });

      // Take a screenshot of the stop cards
      await page.screenshot({
        path: `test-results/stop-cards-${combo.name}.png`,
        fullPage: false,
      });

      // Verify the page rendered correctly - look for h3 elements (stop titles)
      const titles = page.locator('h3');
      await expect(titles.first()).toBeVisible({ timeout: 10000 });
      expect(await titles.count()).toBeGreaterThan(0);
    });
  }
});
