import { useEffect, useRef, useState } from 'react';

export interface UseAudioPlayerProps {
  audioUrl: string | null;
  id?: string;
  isPlaying: boolean;
  onEnded?: () => void;
  onProgress?: (id: string | undefined, currentTime: number, duration: number, percentComplete: number) => void;
  onPlayBlocked?: (error: unknown) => void;
}

export interface UseAudioPlayerReturn {
  progress: number;
  duration: number;
  currentTime: number;
  seek: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  audioElement: HTMLAudioElement | null;
}

/**
 * Custom hook for audio playback
 */
export const useAudioPlayer = ({
  audioUrl,
  id,
  isPlaying,
  onEnded,
  onProgress,
  onPlayBlocked,
}: UseAudioPlayerProps): UseAudioPlayerReturn => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const logAudioState = (label: string) => {
    const audio = audioRef.current;
    if (!audio) {
      console.log(`[AUDIO] ${label} - no audio ref`);
      return;
    }
    console.log(
      `[AUDIO] ${label}`,
      {
        readyState: audio.readyState,
        networkState: audio.networkState,
        paused: audio.paused,
        ended: audio.ended,
        currentTime: audio.currentTime.toFixed(2),
        duration: audio.duration || 0,
        src: audio.src,
        visibility: document.visibilityState,
      }
    );
  };

  // Use refs for callbacks to avoid effect re-runs
  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);

  // Update refs when callbacks change
  useEffect(() => {
    onEndedRef.current = onEnded;
    onProgressRef.current = onProgress;
  }, [onEnded, onProgress]);

  // Create audio element when URL changes
  useEffect(() => {
    if (!audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        currentAudioUrlRef.current = null;
      }
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    // Don't recreate audio if URL hasn't changed - return before cleanup runs
    if (currentAudioUrlRef.current === audioUrl && audioRef.current) {
      console.log('Audio URL unchanged, keeping existing audio element');
      return;
    }

    console.log('Loading audio:', audioUrl);

    // Clean up old audio if it exists
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    // Reset progress state immediately when switching tracks
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    currentAudioUrlRef.current = audioUrl;

    // Create new audio element
    const audio = new Audio();
    audioRef.current = audio;

    // Set audio properties
    audio.crossOrigin = 'anonymous'; // Ensure CORS is used to match cached response
    audio.src = audioUrl; // Set src AFTER setting crossOrigin
    audio.preload = 'auto';
    audio.volume = 1.0;
    audio.muted = false;
    audio.load(); // Ensure loading starts immediately

    // Set up event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      // console.log('⏱️ timeupdate - currentTime:', audio.currentTime.toFixed(2));
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        const percentComplete = (audio.currentTime / audio.duration) * 100;
        // console.log('📊 Progress:', percentComplete.toFixed(1) + '%');
        setProgress(percentComplete);

        // Call progress callback if provided
        if (onProgressRef.current) {
          onProgressRef.current(id, audio.currentTime, audio.duration, percentComplete);
        }
      }
    };

    const handleEnded = () => {
      console.log('🏁 Audio ended');
      setProgress(0);
      setCurrentTime(0);
      onEndedRef.current?.();
    };

    const handleError = (e: Event) => {
      console.error('❌ Audio loading error:', e);
      console.error('Failed to load:', audioUrl);
      logAudioState('error');
    };

    const handlePlay = () => {
      console.log('▶️ Audio playing');
    };

    const handlePause = () => {
      console.log('⏸️ Audio paused');
      logAudioState('paused');
    };

    const handleStalled = () => {
      console.warn('⚠️ Audio stalled - readyState:', audio.readyState, 'networkState:', audio.networkState);
    };

    const handleWaiting = () => {
      console.warn('⏳ Audio waiting for data - readyState:', audio.readyState, 'networkState:', audio.networkState);
    };

    const handleSuspend = () => {
      console.warn('⚠️ Audio loading suspended - readyState:', audio.readyState, 'networkState:', audio.networkState);
    };

    const handleAbort = () => {
      console.warn('⚠️ Audio load aborted - readyState:', audio.readyState, 'networkState:', audio.networkState);
    };

    const handleEmptied = () => {
      console.warn('⚠️ Audio emptied - readyState:', audio.readyState, 'networkState:', audio.networkState);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('suspend', handleSuspend);
    audio.addEventListener('abort', handleAbort);
    audio.addEventListener('emptied', handleEmptied);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('suspend', handleSuspend);
      audio.removeEventListener('abort', handleAbort);
      audio.removeEventListener('emptied', handleEmptied);
      audio.pause();
    };
  }, [audioUrl, isPlaying]);

  // Handle play/pause
  useEffect(() => {
    console.log('🎮 Play/pause effect - isPlaying:', isPlaying, 'url:', audioUrl);
    if (!audioRef.current) {
      console.log('⚠️ No audio ref');
      return;
    }

    const audio = audioRef.current;

    if (isPlaying) {
      console.log('▶️ Attempting to play...');
      logAudioState('before play');
      // Wait for audio to be ready before playing
      const attemptPlay = () => {
        // If already playing, no-op
        if (!audio.paused && !audio.ended) {
          return;
        }
        if (audio.readyState >= 2) {
          console.log('✅ Audio ready, playing');
          audio.play().catch((error) => {
            console.error('❌ Play failed:', error);
            logAudioState('play failed');
            onPlayBlocked?.(error);
          });
        } else {
          console.log('⏳ Waiting for audio to be ready...');
          // Audio not ready yet, wait for canplay event
          const handleCanPlay = () => {
            console.log('✅ Audio ready, playing');
            audio.play().catch((error) => {
              console.error('❌ Play failed:', error);
              logAudioState('play failed after canplay');
              onPlayBlocked?.(error);
            });
            audio.removeEventListener('canplay', handleCanPlay);
          };
          audio.addEventListener('canplay', handleCanPlay, { once: true });
        }
      };

      attemptPlay();
    } else {
      console.log('⏸️ Pausing audio');
      audio.pause();
    }
  }, [isPlaying, audioUrl]);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipForward = (seconds: number = 15) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + seconds,
        audioRef.current.duration
      );
    }
  };

  const skipBackward = (seconds: number = 15) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - seconds, 0);
    }
  };

  return {
    progress,
    duration,
    currentTime,
    seek,
    skipForward,
    skipBackward,
    audioElement: audioRef.current,
  };
};
