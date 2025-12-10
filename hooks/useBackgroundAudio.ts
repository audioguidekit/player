import { useEffect, useRef } from 'react';

export interface UseBackgroundAudioOptions {
  enabled: boolean;
}

/**
 * Background audio support hook.
 * 
 * On iOS Safari/PWA, background audio works natively when:
 * 1. Media Session API is properly configured
 * 2. Audio element is not recreated/reloaded
 * 3. User has interacted with the page before playing
 * 
 * The "silent audio trick" was removed because it causes issues:
 * - Multiple audio elements compete for audio session
 * - Causes time resets in Control Center
 * - Can cause "A problem repeatedly occurred" crashes
 * 
 * Instead, we now just ensure the audio session stays active
 * by setting navigator.mediaSession.playbackState
 */
export const useBackgroundAudio = ({ enabled }: UseBackgroundAudioOptions) => {
  const wasEnabledRef = useRef(false);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (enabled) {
      navigator.mediaSession.playbackState = 'playing';
      wasEnabledRef.current = true;
    } else if (wasEnabledRef.current) {
      navigator.mediaSession.playbackState = 'paused';
    }
  }, [enabled]);

  return null;
};