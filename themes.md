# Theme Properties Analysis

Analysis of theme properties in `src/theme/themes/calm.ts` to determine which properties are actually used in the codebase and affecting the app's appearance.

---

## ✅ USED & WORKING

### header
All properties are used and working:
- ✅ `backgroundColor` - Top header bar background
- ✅ `iconColor` - Header icons (home button, settings, etc.)
- ✅ `textColor` - Header title text (remaining time, etc.)
- ✅ `progressBar.backgroundColor` - Header progress bar track
- ✅ `progressBar.highlightColor` - Header progress bar fill/completion

**Files:** `components/TourHeaderAlt.tsx`

---

### mainContent
All properties are used:
- ✅ `backgroundColor` - Main screen background (behind all cards and content)

**Files:** `screens/TourStart.tsx`, `screens/TourDetail.tsx`

---

### cards
All properties are used and working:
- ✅ `backgroundColor` - Card container background
- ✅ `textColor` - Card text content (titles, descriptions)
- ✅ `borderColor` - Card border outline
- ✅ `borderRadius` - Card corner rounding (component-specific, direct pixels)
- ✅ `shadow` - Card drop shadow for elevation (component-specific, direct CSS value)
- ✅ `image.placeholderColor` - Card image placeholder/loading state background
- ✅ `image.durationBadgeBackground` - Duration/time badge overlay background on card images
- ✅ `image.durationBadgeText` - Duration/time badge text on card images

**Files:** Multiple card components in `components/feed/`

---

### stepIndicators

#### active
- ✅ `outlineColor` - Active step circle border/outline
- ✅ `backgroundColor` - Active step circle background
- ✅ `numberColor` - Active step number text - **NOW WORKING** (fixed)

#### inactive
All properties are used:
- ✅ `borderColor` - Inactive/future step circle border
- ✅ `numberColor` - Inactive/future step number text
- ✅ `backgroundColor` - Inactive/future step circle background

#### completed
- ✅ `backgroundColor` - Completed step circle background (filled) - **NOW WORKING** (fixed)
- ✅ `checkmarkColor` - Completed step checkmark icon - **NOW WORKING** (fixed)

**Files:** `components/feed/AudioStopCardCompact.tsx`, `components/AnimatedCheckmark.tsx`

**Note:** The `completed` properties were initially unused but have been fixed to properly reference the theme.

---

### buttons

#### primary
- ✅ `backgroundColor` - Primary action button background (Start, Continue, Submit)
- ✅ `textColor` - Primary button text
- ✅ `hoverBackground` - Primary button background on hover/press
- ✅ `iconColor` - Primary button icon color - **NOW WORKING** (fixed)

#### secondary
- ✅ `backgroundColor` - Secondary action button background (Cancel, Skip)
- ✅ `textColor` - Secondary button text
- ✅ `borderColor` - Secondary button border - **NOW WORKING** (fixed)
- ✅ `hoverBackground` - Secondary button background on hover/press - **NOW WORKING** (fixed)

#### transcription
- ✅ `backgroundColor` - Transcription toggle button background
- ✅ `iconColor` - Transcription button icon
- ✅ `hoverBackground` - Transcription button background on hover/press - **NOW WORKING** (fixed)

**Files:** `components/StartCard.tsx`, `components/MiniPlayer.tsx`, `components/sheets/TourCompleteSheet.tsx`, various card components

---

### branding
- ✅ `iconColor` - App logo/branding icon color
- ⚠️ `logoUrl` - Set to `undefined`

**Files:** `components/StartCard.tsx`

---

### miniPlayer
- ✅ `backgroundColor` - Mini player bar background
- ✅ `textColor` - Mini player title and time text
- ✅ `progressBar.backgroundColor` - Mini player progress bar track - **NOW WORKING** (fixed)
- ✅ `progressBar.highlightColor` - Mini player progress bar fill/completion
- ✅ `controls.playButtonBackground` - Mini player play/pause button background (expanded state)
- ✅ `controls.playButtonIcon` - Mini player play/pause icon (expanded state)
- ✅ `controls.otherButtonsBackground` - Mini player skip/rewind buttons background
- ✅ `controls.otherButtonsIcon` - Mini player skip/rewind icons
- ✅ `minimized.playButtonIcon` - Mini player play/pause icon (minimized state) - **NEWLY ADDED**

**Files:** `components/MiniPlayer.tsx`, `components/player/PlayPauseButton.tsx`, `components/player/SkipButton.tsx`, `components/player/ProgressRing.tsx`

---

### sheets
All properties are used:
- ✅ `backgroundColor` - Bottom sheet modal background
- ✅ `handleColor` - Bottom sheet drag handle
- ✅ `textColor` - Bottom sheet text content
- ✅ `borderColor` - Bottom sheet top border

**Files:** `components/BottomSheet.tsx`, `components/MainSheet.tsx`

⚠️ **WARNING:** `textColor` is set to `#FF00FF` (magenta) - appears to be a debug/placeholder value

---

### status
- ✅ `success` - Success message text and icons
- ✅ `error` - Error message text and icons
- ✅ `warning` - Warning message text and icons
- ❌ **`info`** - Info message text and icons - **NOT USED**

**Files:** Multiple components including `components/StartCard.tsx`, rating/email cards, sheets

---

### loading
All properties are used:
- ✅ `spinnerColor` - Loading spinner/indicator color
- ✅ `backgroundColor` - Loading screen background

**Files:** `src/components/screens/LoadingScreen.tsx`, `src/components/screens/AssetsLoadingScreen.tsx`

---

### inputs
All properties are used:
- ✅ `backgroundColor` - Text input field background
- ✅ `textColor` - Text input field text
- ✅ `borderColor` - Text input field border (default state)
- ✅ `focusBorderColor` - Text input field border (focused/active state)
- ✅ `placeholderColor` - Text input placeholder text

**Files:** `components/feed/EmailCard.tsx`, `components/feed/RatingCard.tsx`, `components/sheets/RatingSheet.tsx`

---

### colors

All properties are used:

#### text
- ✅ `primary` - Primary text (headings, main content, body text)
- ✅ `secondary` - Secondary text (subtitles, supporting text, labels)
- ✅ `tertiary` - Tertiary text (metadata, timestamps, helper text)
- ✅ `inverse` - Inverse text (on dark backgrounds)

#### border
- ✅ `light` - Light borders (subtle dividers, decorative lines)
- ✅ `medium` - Medium borders (card borders, section separators)
- ✅ `dark` - Dark borders (emphasized dividers, focused borders)

#### background
- ✅ `primary` - Primary background (cards, modals, overlays)
- ✅ `secondary` - Secondary background (page background, sections)
- ✅ `tertiary` - Tertiary background (hover states, disabled elements)

**Files:** Used extensively across all components

---

### typography

#### fontFamily
- ✅ `sans` - Primary font family for body text, buttons, and UI elements
- ✅ `heading` - Font family for headings (Space Grotesk)
- ✅ `numbers` - Font family for numerical displays (Space Grotesk)

#### fontWeight
- ✅ `regular` - Body text (400)
- ✅ `medium` - Subtle emphasis (500)
- ✅ `semibold` - Strong hierarchy (600)
- ✅ `bold` - Display headings (700)

**Files:**
- fontFamily.sans: `GlobalStyles.tsx`, `TourStart.tsx`, `MiniPlayer.tsx`, `StartCard.tsx`, `RatingSheet.tsx`, `LanguageSheet.tsx`, `AudioStopCardCompact.tsx`, `TourHeaderAlt.tsx`
- fontFamily.heading: `GlobalStyles.tsx`
- fontFamily.numbers: `TourHeaderAlt.tsx`, `AudioStopCardCompact.tsx`, `StartCard.tsx`
- fontWeight: Multiple components

---

## Summary

### Architecture Changes
**Generic Design Scales Removed:**
The theme system has been refactored to remove unused generic design token scales in favor of component-specific semantic properties with direct pixel values:

- ❌ **`typography.fontSize.*`** - Removed entirely (all 7 sizes were unused)
- ❌ **`spacing.*`** - Removed entirely (all 9 values were unused)
- ❌ **`borderRadius.*`** - Removed entirely (generic scale was mostly unused)
- ❌ **`shadows.*`** - Removed entirely (generic scale was partially unused)

**Component-Specific Properties Added:**
- ✅ `cards.borderRadius` - Direct pixel value (e.g., '12px') instead of scale reference
- ✅ `cards.shadow` - Direct CSS shadow value instead of scale reference

This architecture change makes themes simpler, more maintainable, and removes the cognitive overhead of unused generic scales.

### Partially Unused Properties
- `status.info`

### Suspicious/Debug Values
- `sheets.textColor: '#FF00FF'` (magenta) - Appears to be a debug/placeholder value

### Recently Fixed
- `stepIndicators.completed.backgroundColor` and `checkmarkColor` were unused but have been fixed to properly reference the theme in `components/AnimatedCheckmark.tsx`
- `stepIndicators.active.numberColor` was unused but has been fixed to properly reference the theme in `components/feed/AudioStopCardCompact.tsx`
- `miniPlayer.progressBar.backgroundColor` was unused but has been fixed to properly reference the theme in `components/player/ProgressRing.tsx`
- `buttons.transcription.hoverBackground` was unused but has been fixed to add hover state support in `components/MiniPlayer.tsx`
- `buttons.primary.iconColor` was unused but has been fixed to control icon colors in primary buttons in `components/StartCard.tsx`
- `buttons.secondary.borderColor` was unused but has been fixed to add border support in `components/sheets/TourCompleteSheet.tsx`
- `buttons.secondary.hoverBackground` was unused but has been fixed to add hover state support in `components/sheets/TourCompleteSheet.tsx`

### Recently Added
- `miniPlayer.minimized.playButtonIcon` - New theme property added to control the play/pause icon color in the minimized mini player state. Updated in all theme files (calm.ts, default.ts, modern.ts) and TypeScript types.

### Recently Removed
- `buttons.ghost.*` - Removed ghost button variant as it was completely unused in the application. Cleaned up from all theme files (calm.ts, default.ts, modern.ts) and TypeScript types.

### Corrections
- `typography.fontFamily.sans` - Previously incorrectly marked as unused. This property is actually **extensively used** throughout the application in 8+ components including GlobalStyles, MiniPlayer, StartCard, and more.

---

## Recommendations

1. ✅ **COMPLETED: Remove unused generic scales** - fontSize, spacing, borderRadius, and shadows have been removed and replaced with component-specific properties where needed
2. **Investigate `sheets.textColor`** - Replace magenta debug color with proper theme color (#FF00FF in calm.ts)
3. **Consider adding more component-specific properties** - As new components are added, define properties directly on relevant theme sections rather than creating new generic scales
