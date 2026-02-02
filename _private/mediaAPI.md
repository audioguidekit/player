# iOS Media Session API Debugging Log

## Problem Statement
When user clicks "Start tour":
- Audio plays correctly (progress bar visible in iOS Control Center)
- But Control Center shows **play button** instead of **pause button**
- After manually pressing pause then play **in the app itself**, Control Center shows correct button

## Working Reference
- **Working demo**: `/Users/agilek/Library/Mobile Documents/com~apple~CloudDocs/@git/MediaSessionAPI`
- Uses `use-media-session` library with `useMediaMeta` and `useMediaSession` hooks
- Key pattern: Everything in ONE component with JSX audio element

---

## Solutions & Attempts Summary

### Attempts 1-13
(Previous attempts exploring library wrappers, hooks, etc - detailed logs archived)

### Attempt 14-23 Summary (Failed or Partial)
- **Library wrappers**: Failed to sync state correctly.
- **Manual Event Sync**: Syncing native `pause` events caused issues because `audio.load()` fires pause events, confusing the state.
- **Native PlaybackState**: Manually setting `navigator.mediaSession.playbackState` helped but was fighting with the library overrides.
- **Autoplay Timing**: Setting `isPlaying(true)` BEFORE audio actually started caused race conditions.
- **Singleton Audio**: Moving from React `useRef` creation to module-level singleton helper `getOrCreateAudioElement()` solved some persistence issues but not the button state.

### Attempt 24: The Code Agent Fix (SUCCESS) ⭐⭐⭐
**Problem**: The Control Center would show "Pause" (correct) for about 3 seconds, then revert to "Play" (incorrect), even though audio continued playing.

**Analysis**: 
- The 3-second delay was the smoking gun.
- `useAudioPreloader` was configured with a `setTimeout(..., 3000)` to start buffering next tracks.
- When the preloader fired, it created `new Audio()` elements in the background to buffer content.
- **Root Cause**: On iOS, initializing new Audio elements (even in background) signals a context switch to the OS/media daemon, interrupting the active Media Session state of the main audio element. The OS resets the UI to "Paused" because it detects a new media intent, even if the main audio track is still technically playing.

**The Fix**:
1.  **Disable Preloading**: Commented out `useAudioPreloader` to prevent background Audio element creation.
2.  **Strict Library Usage**: Removed all custom "Watchdog" timers and complex `handleNativePause` logic. Reverted to standard `use-media-session` implementation which works perfectly when interference is removed.
3.  **Simple Event Sync**: Kept simple `isPlaying` sync in `handleNativePlay`/`handleNativePause`, but without complex race-condition guards.

**Result**: Works perfectly. Control Center maintains "Pause" button state throughout playback.

---

## Detailed Solution Reference (Merged from MEDIA.md)

### 1. Transition Audio Looping
**Solution**: Source ID tracking for ended events
- Changed from URL-based `hasEndedForCurrentUrlRef` flag to a `audioSourceId` counter
- Increment ID on each URL change before loading new source
- In `handleEnded`, capture current ID and use `setTimeout(0)` to let pending URL changes process
- If ID doesn't match after timeout, ignore as stale event
- **File**: `hooks/useAudioPlayer.ts`

### 2. Control Center Time Resets / Disappears
- **Singleton Audio**: `getOrCreateAudioElement()` module-level singleton ensures audio element persists across re-renders.
- **Metadata Throttling**: Only update metadata when Track ID changes.
- **Position State Throttling**: Update `setPositionState` only once per second, directly from `audio.currentTime` (not React state).
- **Files**: `hooks/useAudioPlayer.ts`, `App.tsx`

### 3. iOS Playback State Fighting
**Solution**: Single source of truth in `App.tsx`
- Removed `navigator.mediaSession.playbackState` from background hooks.
- Consolidated all Media Session logic into `App.tsx` using `use-media-session`.
- **Files**: `App.tsx`

### 4. Artwork Type
**Solution**: Always include artwork type
- iOS requires consistent artwork specification.
- Use `type: 'image/jpeg'` explicitly in metadata.
- **File**: `App.tsx`

### 5. Transition Audio State Cleanup
**Solution**: Reset transition flags
- Ensure `isTransitioning` and `isAudioCompleting` are reset when tour ends.
- Added timeout fallback for stuck transitions.
- **File**: `hooks/useTourNavigation.ts`

---

## Critical Implementation Details for iOS

### 1. Preloading Rules
> [!WARNING]
> **DO NOT use `new Audio()` for background preloading on iOS.**
> It interferes with the active Media Session. If preloading is needed, use `fetch` (Blob/ArrayBuffer) or only preload when audio is paused.

### 2. Audio Element Visibility
Current implementation uses:
```javascript
globalAudioElement.style.width = '1px';
globalAudioElement.style.height = '1px';
globalAudioElement.style.opacity = '0.01';
// NOT display: none
```
iOS Safari may treat `display: none` elements as background-ineligible.

### 3. Autoplay Pattern
Correct pattern to avoid "Play" button glitch:
```javascript
audio.play()
  .then(() => {
    // Only set state AFTER play succeeds
    setIsPlaying(true); 
  })
```
Setting state *before* play succeeds causes a race condition where Media Session reports "playing" before audio is actually ready, causing iOS to fallback to "paused".
