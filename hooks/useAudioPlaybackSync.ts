import { useEffect, useRef, useState } from 'react';
import { TourData } from '../types';
import { UseAudioPlayerReturn } from './useAudioPlayer';

export interface UseAudioPlaybackSyncProps {
  audioPlayer: UseAudioPlayerReturn;
  tour: TourData | null;
  assetsReady: boolean;
  currentStopId: string | null;
  setIsPlaying: (value: boolean | ((prev: boolean) => boolean)) => void;
  pendingSeekRef: React.MutableRefObject<number | null>;
}

export interface UseAudioPlaybackSyncReturn {
  /**
   * Request that playback start once the audio element is ready. Used by
   * "Start tour" / "Reset tour" flows where play() must be deferred until the
   * singleton audio element has buffered (iOS requires play() to succeed before
   * isPlaying is flipped true).
   */
  setPendingAutoPlay: (pending: boolean) => void;
}

/**
 * Owns the low-level coordination between the singleton HTMLAudioElement and the
 * React `isPlaying` state. Extracted from App.tsx. Bundles four cooperating
 * effects that all touch `audioPlayer.audioElement`:
 *
 * 1. Native play/pause event -> React state sync.
 * 2. iOS singleton preload of the first audio stop (so Media Session activates).
 * 3. Resume-seek: restore a queued playback position once metadata loads.
 * 4. pendingAutoPlay: start playback after the element is ready, setting
 *    isPlaying only once play() resolves.
 */
export const useAudioPlaybackSync = ({
  audioPlayer,
  tour,
  assetsReady,
  currentStopId,
  setIsPlaying,
  pendingSeekRef,
}: UseAudioPlaybackSyncProps): UseAudioPlaybackSyncReturn => {
  // ---------------------------------------------------------------------------
  // 1. Sync native audio events to React state.
  // Track if audio was playing before pause to distinguish real pauses from
  // load()-induced pauses.
  // ---------------------------------------------------------------------------
  const wasPlayingBeforePauseRef = useRef(false);

  useEffect(() => {
    const audio = audioPlayer.audioElement;
    if (!audio) return;

    const handleNativePlay = () => {
      wasPlayingBeforePauseRef.current = true;
      setIsPlaying(true);
    };

    const handleNativePause = () => {
      const audio = audioPlayer.audioElement;
      // Only sync pause if audio was actually playing before.
      // Don't set isPlaying(false) if audio ended - let the ended handler manage
      // the transition.
      if (wasPlayingBeforePauseRef.current && !audio?.ended) {
        setIsPlaying(false);
      }
      wasPlayingBeforePauseRef.current = false;
    };

    audio.addEventListener('play', handleNativePlay);
    audio.addEventListener('pause', handleNativePause);

    return () => {
      audio.removeEventListener('play', handleNativePlay);
      audio.removeEventListener('pause', handleNativePause);
    };
  }, [audioPlayer.audioElement, setIsPlaying]);

  // ---------------------------------------------------------------------------
  // 2. CRITICAL FOR iOS: Pre-load first audio into the singleton element so it
  // is ALREADY LOADED when the user clicks "Start tour". iOS requires actual
  // audio playback (not just buffering) for Media Session to activate.
  // ---------------------------------------------------------------------------
  const hasPreloadedSingletonRef = useRef(false);
  useEffect(() => {
    if (!tour || !assetsReady || hasPreloadedSingletonRef.current) return;
    if (!audioPlayer.audioElement) return;

    const firstAudioStop = tour.stops.find(s => s.type === 'audio');
    if (!firstAudioStop || firstAudioStop.type !== 'audio') return;

    const audioUrl = firstAudioStop.audioFile;
    const audio = audioPlayer.audioElement;

    // Only preload if not already playing something
    if (audio.src && !audio.paused) return;

    audio.src = audioUrl;
    audio.load();

    const handleCanPlay = () => {
      hasPreloadedSingletonRef.current = true;
      audio.removeEventListener('canplay', handleCanPlay);
    };

    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [tour, assetsReady, audioPlayer.audioElement]);

  // ---------------------------------------------------------------------------
  // 3. AUTO-RESUME: Restore playback position when resuming.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!audioPlayer?.audioElement || !currentStopId) return;
    if (pendingSeekRef.current === null) return;

    const audio = audioPlayer.audioElement;

    // Wait for audio metadata to load before seeking
    if (audio.readyState >= 1 && audio.duration > 0) {
      const seekPosition = pendingSeekRef.current;
      audioPlayer.seek(seekPosition);
      pendingSeekRef.current = null;
    }
  }, [audioPlayer, currentStopId, audioPlayer?.audioElement?.readyState, audioPlayer?.duration, pendingSeekRef]);

  // ---------------------------------------------------------------------------
  // 4. pendingAutoPlay: start playback once audio becomes available.
  // MATCHING WORKING DEMO: set isPlaying(true) only AFTER play() resolves.
  // ---------------------------------------------------------------------------
  const [pendingAutoPlay, setPendingAutoPlay] = useState(false);

  useEffect(() => {
    if (!pendingAutoPlay || !audioPlayer.audioElement) return;

    const audio = audioPlayer.audioElement;

    const attemptPlay = () => {
      // CRITICAL FIX: Do NOT set state before play(). iOS would see
      // playbackState='playing' but audio.paused=true and show the play button.
      // Must wait for play() to succeed, THEN set state.
      setPendingAutoPlay(false);

      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('[AUTOPLAY] play() promise rejected:', error);
          // No need to revert - we never set isPlaying=true
        });
    };

    if (audio.readyState >= 2) {
      attemptPlay();
    } else {
      const handleCanPlay = () => {
        attemptPlay();
        audio.removeEventListener('canplay', handleCanPlay);
      };
      audio.addEventListener('canplay', handleCanPlay, { once: true });
    }
  }, [pendingAutoPlay, audioPlayer.audioElement, setIsPlaying]);

  return { setPendingAutoPlay };
};
