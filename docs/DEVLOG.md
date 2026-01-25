# Development Log

## 2026-01-25: Configurable UI Languages for Bundle Size Optimization

### What was done
- Created `src/config/languages.ts` - central config file for selecting which UI languages to bundle
- Refactored `src/translations/index.tsx` to use the config instead of importing all languages directly
- Added `SupportedLanguageCode` type that's automatically derived from the config
- Added `isLanguageSupported()` helper function for runtime language validation
- Implemented graceful fallback: if tour language doesn't have UI translation, falls back to English silently
- Updated `docs/LANGUAGES.md` with new "Configuring UI Languages" section
- Updated `CLAUDE.md` to reference the new config file

### How it works
1. Developer edits `src/config/languages.ts` - comments/uncomments imports and object entries
2. Vite's tree-shaking removes unused language files from the bundle
3. At runtime, `isLanguageSupported()` checks if a language is available
4. If tour is in unsupported UI language, the provider falls back to English automatically

### Bundle size impact
- All 6 languages: ~1,734 KB
- English only: ~1,726 KB (~8 KB savings)
- Savings grow as translation files expand with more strings

### Lessons Learned
- Use TypeScript's `satisfies` keyword to maintain type safety while allowing partial records
- Graceful fallback at the provider level ensures no errors shown to users
- Keep tour content languages (JSON files) separate from UI languages (TypeScript)

---

## 2026-01-25: Optional Rating Feature

### What was done
- Added `ratingAvailable` property to `TourData` interface in `types.ts`
- Modified `TourStart.tsx` to conditionally show the rating button based on `tour.ratingAvailable !== false`
- Updated `TourCompleteSheet.tsx` to:
  - Accept `ratingAvailable` prop
  - Hide "Rate this tour" / "Skip rating" buttons when rating is disabled
  - Show a simple "Done" button instead
  - Fixed prop name mismatch (`onRateTour` → `onRate`) to match App.tsx usage
- Added `done` translation to all 6 locale files (en, cs, de, fr, it, es)
- Added `ratingAvailable: true` to tour JSON files (en, cs, de)

### How it works
- `ratingAvailable: true` (default): Rating button visible on main screen, rate option in tour complete sheet
- `ratingAvailable: false`: Rating button hidden, tour complete shows only "Done" button
- Important: The `type: "rating"` stop in the stops array works independently - it's part of tour content

### Lessons Learned
- Default to `!== false` pattern for optional boolean props to maintain backward compatibility
- When adding translations, must update both the types file and all locale files

---

## 2026-01-25: Playwright Testing Setup

### What was done
- Installed Playwright testing framework (`@playwright/test`)
- Installed Chromium browser for testing
- Created `playwright.config.ts` with:
  - Desktop Chrome, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12) configurations
  - Auto-start dev server during tests
  - Screenshot on failure, trace on retry
- Created test files in `/tests/`:
  - `app.spec.ts` - Basic app loading and responsive design tests
  - `tour-flow.spec.ts` - Tour start and navigation tests
  - `audio-player.spec.ts` - Audio player and mini player tests
  - `language.spec.ts` - Multi-language system tests
  - `pwa.spec.ts` - PWA and offline capability tests
- Added npm scripts:
  - `bun test` - Run all tests
  - `bun test:ui` - Open Playwright UI
  - `bun test:headed` - Run tests with browser visible
  - `bun test:debug` - Debug mode

### Lessons Learned
- Playwright auto-manages dev server via `webServer` config
- Mobile testing requires specific device profiles from Playwright
- Service worker tests need careful handling due to caching

### Test Results
- **25 tests passed** across 5 test files
- Test run time: ~1.3 minutes (includes dev server startup)

### Documentation
- Created `/docs/TESTING.md` with full guide on running, writing, and debugging tests

### What Could Be Improved
- Add more specific UI interaction tests once app flow is established
- Add visual regression tests with `toHaveScreenshot()`
- Add performance tests for audio loading
- Consider adding accessibility tests
