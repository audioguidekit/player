import { test, expect } from '@playwright/test';
import { getTourId } from './helpers';
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

const METADATA_PATH = path.join(process.cwd(), 'src/data/tour/metadata.json');

// Store original metadata to restore after tests
let originalMetadata: string;

// Run tests serially since we're modifying the same file
test.describe.configure({ mode: 'serial' });

test.describe('Stop Card Display Options', () => {
  test.beforeAll(async () => {
    // Save original metadata
    originalMetadata = fs.readFileSync(METADATA_PATH, 'utf-8');
  });

  test.afterAll(async () => {
    // Restore original metadata
    fs.writeFileSync(METADATA_PATH, originalMetadata);
  });

  for (const combo of combinations) {
    test(`${combo.name}: image=${combo.showStopImage}, duration=${combo.showStopDuration}, number=${combo.showStopNumber}`, async ({ page, request }) => {
      const tourId = await getTourId(request);

      // Read current metadata and update settings
      const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf-8'));
      metadata.showStopImage = combo.showStopImage;
      metadata.showStopDuration = combo.showStopDuration;
      metadata.showStopNumber = combo.showStopNumber;

      // Write updated metadata (triggers Vite HMR)
      fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2) + '\n');

      // Wait for Vite to pick up the change and rebuild
      await page.waitForTimeout(2000);

      // Navigate to tour start page (fresh load to get new bundle)
      await page.goto(`/tour/${tourId}`, { waitUntil: 'networkidle' });

      // Click "Start tour" button to enter tour detail view
      const startButton = page.locator('button:has-text("Start tour")');
      await startButton.waitFor({ timeout: 10000 });
      await startButton.click();

      // Wait for the tour detail view to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Take a screenshot of the stop cards
      await page.screenshot({
        path: `test-results/stop-cards-${combo.name}.png`,
        fullPage: false,
      });

      // Verify the page rendered correctly - look for h3 elements (stop titles)
      const titles = page.locator('h3');
      const titleCount = await titles.count();
      expect(titleCount).toBeGreaterThan(0);
    });
  }
});
