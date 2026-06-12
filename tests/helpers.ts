import { Page, APIRequestContext } from '@playwright/test';

export interface TourMetadata {
  id: string;
  defaultLanguage?: string;
  [key: string]: unknown;
}

export interface TourData {
  id: string;
  language: string;
  title?: string;
  [key: string]: unknown;
}

/**
 * Fetches tour metadata from the app
 */
export async function getTourMetadata(request: APIRequestContext): Promise<TourMetadata | null> {
  try {
    const response = await request.get('/data/tour/metadata.json');
    if (response.ok()) {
      return await response.json();
    }
  } catch {
    // Metadata might not exist
  }
  return null;
}

/**
 * Discovers available tour languages by checking common language codes
 */
export async function discoverTourLanguages(request: APIRequestContext): Promise<string[]> {
  const possibleLanguages = ['en', 'de', 'fr', 'es', 'it', 'cs', 'pl', 'pt', 'nl', 'ja', 'zh', 'ko'];
  const availableLanguages: string[] = [];

  for (const lang of possibleLanguages) {
    try {
      const response = await request.get(`/data/tour/${lang}.json`);
      if (response.ok()) {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          availableLanguages.push(lang);
        }
      }
    } catch {
      // Language file doesn't exist
    }
  }

  return availableLanguages;
}

/**
 * Gets the first available tour language data
 */
export async function getFirstTourData(request: APIRequestContext): Promise<TourData | null> {
  const languages = await discoverTourLanguages(request);

  if (languages.length === 0) {
    return null;
  }

  try {
    const response = await request.get(`/data/tour/${languages[0]}.json`);
    if (response.ok()) {
      return await response.json();
    }
  } catch {
    // Failed to load tour data
  }

  return null;
}

/**
 * Gets the tour ID from metadata or first available tour
 */
export async function getTourId(request: APIRequestContext): Promise<string> {
  const metadata = await getTourMetadata(request);
  if (metadata?.id) {
    return metadata.id;
  }

  const tourData = await getFirstTourData(request);
  if (tourData?.id) {
    return tourData.id;
  }

  // Fallback - most apps will have at least one tour
  return 'tour';
}

/**
 * Waits for the app to finish loading (loading screen to disappear)
 */
export async function waitForAppLoad(page: Page, timeout = 30000): Promise<void> {
  // Common loading indicators to wait for
  const loadingSelectors = [
    'text=Preparing your tour',
    'text=Loading',
    '[data-testid="loading"]',
    '.loading-spinner'
  ];

  for (const selector of loadingSelectors) {
    try {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 1000 })) {
        await element.waitFor({ state: 'hidden', timeout });
        return;
      }
    } catch {
      // Selector not found or already hidden
    }
  }

  // Fallback: wait for the first heading (landing/tour title) to render.
  // `networkidle` is unreliable once audio starts streaming — a deep link to a
  // stop keeps a media connection open and the page never goes idle.
  await page
    .locator('h1')
    .first()
    .waitFor({ state: 'visible', timeout })
    .catch(() => page.waitForLoadState('domcontentloaded'));
}

/**
 * Dismisses the branding SplashScreen overlay if present.
 *
 * The splash (a portal with `role="button"`, label "Swipe or tap to continue")
 * renders above the picker / tour screens and intercepts pointer events until
 * tapped, so any test that clicks the UI must dismiss it first.
 */
export async function dismissSplashIfPresent(page: Page): Promise<void> {
  const splash = page.getByRole('button', { name: 'Swipe or tap to continue' });
  // The splash slides in a beat after load, so wait for it to appear before
  // deciding it isn't there — otherwise it pops up and blocks the next click.
  await splash.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
  if (await splash.isVisible().catch(() => false)) {
    await splash.click();
    await splash.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
}

// The TourStart primary CTA varies with stored progress: "Start tour" with no
// progress, "Resume tour" mid-tour, "Replay tour" once everything is complete.
export const START_CTA = /Start tour|Resume tour|Replay tour/;

/** The TourStart primary action button (start / resume / replay). */
export function startButton(page: Page) {
  return page.getByRole('button', { name: START_CTA });
}

/**
 * Opens a tour's start screen directly (`/` is the multi-tour picker) and
 * dismisses the branding splash. Leaves the page on the TourStart screen.
 * Avoids `networkidle` — the feed streams audio and never reaches idle.
 */
export async function openTour(page: Page, tourId: string): Promise<void> {
  await page.goto(`/tour/${tourId}`, { waitUntil: 'domcontentloaded' });
  await dismissSplashIfPresent(page);
  await startButton(page).waitFor({ timeout: 15000 });
}

/**
 * Opens a tour and taps the primary CTA, landing in the player. Returns once the
 * mini player is attached (it animates in via AnimatePresence).
 */
export async function startTour(page: Page, tourId: string): Promise<void> {
  await openTour(page, tourId);
  await startButton(page).click();
  await page.locator('[data-testid="mini-player"]').waitFor({ state: 'attached', timeout: 15000 });
}

/**
 * Checks if the app has multiple languages available
 */
export async function hasMultipleLanguages(request: APIRequestContext): Promise<boolean> {
  const languages = await discoverTourLanguages(request);
  return languages.length > 1;
}

/**
 * Clears app state (localStorage) to ensure clean test state
 */
export async function clearAppState(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Gets the current language from localStorage
 */
export async function getStoredLanguage(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    const prefs = localStorage.getItem('app-preferences');
    if (prefs) {
      try {
        return JSON.parse(prefs).selectedLanguage || null;
      } catch {
        return null;
      }
    }
    return null;
  });
}
