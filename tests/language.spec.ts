import { test, expect } from '@playwright/test';
import { waitForAppLoad, discoverTourLanguages, hasMultipleLanguages, clearAppState, getStoredLanguage, getTourId, openTour } from './helpers';

test.describe('Language System', () => {
  test('should load app with tour content', async ({ page }) => {
    await page.goto('/');

    // Wait for loading to complete
    await waitForAppLoad(page);

    // Wait for tour content to appear (h1 element with any title)
    const title = page.locator('h1').first();
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test('shows a language selector on the start screen when multiple languages exist', async ({ page, request }) => {
    const multipleLanguages = await hasMultipleLanguages(request);
    const tourId = await getTourId(request);

    await openTour(page, tourId);

    const languageButton = page.getByRole('button', { name: 'Change language' });
    if (multipleLanguages) {
      await expect(languageButton).toBeVisible({ timeout: 10000 });
      // Activating it opens the language chooser sheet (a modal dialog).
      await languageButton.click();
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
    } else {
      // Single-language tours correctly hide the selector.
      await expect(languageButton).toHaveCount(0);
    }
  });

  test('should have localStorage available for language preference', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check that localStorage is accessible
    const storageAvailable = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    });

    expect(storageAvailable).toBe(true);
  });
});

test.describe('Multi-language Tours', () => {
  test('should discover available tour languages', async ({ request }) => {
    const languages = await discoverTourLanguages(request);

    // App should have at least one language available
    expect(languages.length).toBeGreaterThanOrEqual(1);
  });

  test('should load tour data for each discovered language', async ({ request }) => {
    const languages = await discoverTourLanguages(request);

    for (const lang of languages) {
      const response = await request.get(`/data/tour/${lang}.json`);
      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(data).toBeTruthy();
      expect(data.id).toBeTruthy();
      expect(data.language).toBe(lang);
    }
  });

  test('should have consistent tour ID across all languages', async ({ request }) => {
    const languages = await discoverTourLanguages(request);

    if (languages.length <= 1) {
      // Skip test for single-language tours
      return;
    }

    const tourIds: string[] = [];

    for (const lang of languages) {
      const response = await request.get(`/data/tour/${lang}.json`);
      if (response.ok()) {
        const data = await response.json();
        tourIds.push(data.id);
      }
    }

    // All tour files should have the same tour ID
    const uniqueIds = [...new Set(tourIds)];
    expect(uniqueIds.length).toBe(1);
  });
});

test.describe('URL Language Parameter (?lang=)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure clean state
    await page.goto('/');
    await clearAppState(page);
  });

  test('should load tour in specified language via ?lang= parameter', async ({ page, request }) => {
    const languages = await discoverTourLanguages(request);

    if (languages.length < 2) {
      test.skip();
      return;
    }

    // Get tour data for the second language to verify content
    const targetLang = languages.find(l => l !== 'en') || languages[1];
    const response = await request.get(`/data/tour/${targetLang}.json`);
    const tourData = await response.json();
    const expectedTitle = tourData.title;

    // Navigate with ?lang= parameter
    const tourId = await getTourId(request);
    await page.goto(`/tour/${tourId}?lang=${targetLang}`);
    await waitForAppLoad(page);

    // The tour pushes in over the multi-tour picker, so `h1.first()` is the
    // picker's landing title. Assert the tour-start heading (level 1) renders
    // in the requested language instead.
    const title = page.getByRole('heading', { level: 1, name: expectedTitle });
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test('should save URL language parameter to localStorage', async ({ page, request }) => {
    const languages = await discoverTourLanguages(request);

    if (languages.length < 2) {
      test.skip();
      return;
    }

    const targetLang = languages.find(l => l !== 'en') || languages[1];

    // Navigate with ?lang= parameter
    const tourId = await getTourId(request);
    await page.goto(`/tour/${tourId}?lang=${targetLang}`);
    await waitForAppLoad(page);

    // Wait for language to be saved
    await page.waitForTimeout(1000);

    // Verify language is saved to localStorage
    const storedLang = await getStoredLanguage(page);
    expect(storedLang).toBe(targetLang);
  });

  test('should ignore invalid language codes and fall back gracefully', async ({ page, request }) => {
    // Navigate with invalid language code
    const tourId = await getTourId(request);
    await page.goto(`/tour/${tourId}?lang=invalid_lang`);
    await waitForAppLoad(page);

    // App should still load without errors
    const title = page.locator('h1').first();
    await expect(title).toBeVisible({ timeout: 10000 });

    // Should fall back to a valid language (not 'invalid_lang')
    const storedLang = await getStoredLanguage(page);
    expect(storedLang).not.toBe('invalid_lang');
  });

  test('should work with ?lang= parameter on stop deep links', async ({ page, request }) => {
    const languages = await discoverTourLanguages(request);

    if (languages.length < 2) {
      test.skip();
      return;
    }

    const targetLang = languages.find(l => l !== 'en') || languages[1];

    // Navigate to a stop with ?lang= parameter
    const tourId = await getTourId(request);
    await page.goto(`/tour/${tourId}/1?lang=${targetLang}`);
    await waitForAppLoad(page);

    // Verify language is saved
    await page.waitForTimeout(1000);
    const storedLang = await getStoredLanguage(page);
    expect(storedLang).toBe(targetLang);
  });

  test('should handle case-insensitive language codes', async ({ page, request }) => {
    const languages = await discoverTourLanguages(request);

    if (languages.length < 2) {
      test.skip();
      return;
    }

    const targetLang = languages.find(l => l !== 'en') || languages[1];

    // Navigate with uppercase language code
    const tourId = await getTourId(request);
    await page.goto(`/tour/${tourId}?lang=${targetLang.toUpperCase()}`);
    await waitForAppLoad(page);

    // Wait for language to be saved
    await page.waitForTimeout(1000);

    // Verify language is saved (should be lowercase)
    const storedLang = await getStoredLanguage(page);
    expect(storedLang).toBe(targetLang.toLowerCase());
  });
});
