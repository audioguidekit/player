import { useEffect, useRef, useCallback } from 'react';
import { AudioStop } from '../types';

const DEBUG_PRELOAD = import.meta.env.VITE_DEBUG_AUDIO === 'true' || import.meta.env.DEV;

const debugLog = (...args: unknown[]) => {
  if (DEBUG_PRELOAD) {
    console.log('[PRELOAD]', ...args);
  }
};

interface UseAudioPreloaderOptions {
  audioPlaylist: AudioStop[];
  currentStopId: string | null;
  preloadCount?: number;
}

interface PreloadedAudio {
  url: string;
  audio: HTMLAudioElement;
  loaded: boolean;
}

export const useAudioPreloader = ({
  audioPlaylist,
  currentStopId,
  preloadCount = 1,
}: UseAudioPreloaderOptions) => {
  const preloadedRef = useRef<Map<string, PreloadedAudio>>(new Map());
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const preloadAudio = useCallback((url: string): Promise<HTMLAudioElement> => {
    return new Promise((resolve, reject) => {
      const existing = preloadedRef.current.get(url);
      if (existing?.loaded) {
        debugLog('✅ Already preloaded:', url);
        resolve(existing.audio);
        return;
      }

      debugLog('⏳ Preloading:', url);
      const audio = new Audio();
      audio.preload = 'auto';
      
      const entry: PreloadedAudio = { url, audio, loaded: false };
      preloadedRef.current.set(url, entry);

      const handleCanPlayThrough = () => {
        entry.loaded = true;
        debugLog('✅ Preloaded:', url);
        cleanup();
        resolve(audio);
      };

      const handleError = (e: Event) => {
        debugLog('❌ Preload failed:', url, e);
        preloadedRef.current.delete(url);
        cleanup();
        reject(e);
      };

      const cleanup = () => {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('error', handleError);
      };

      audio.addEventListener('canplaythrough', handleCanPlayThrough, { once: true });
      audio.addEventListener('error', handleError, { once: true });
      
      audio.src = url;
      audio.load();
    });
  }, []);

  const getPreloadedAudio = useCallback((url: string): HTMLAudioElement | null => {
    const entry = preloadedRef.current.get(url);
    return entry?.loaded ? entry.audio : null;
  }, []);

  const cleanupOldPreloads = useCallback((keepUrls: Set<string>) => {
    for (const [url, entry] of preloadedRef.current.entries()) {
      if (!keepUrls.has(url)) {
        debugLog('🗑️ Cleaning up old preload:', url);
        entry.audio.src = '';
        preloadedRef.current.delete(url);
      }
    }
  }, []);

  useEffect(() => {
    if (!currentStopId || audioPlaylist.length === 0) return;

    const currentIndex = audioPlaylist.findIndex(s => s.id === currentStopId);
    if (currentIndex === -1) return;

    const urlsToKeep = new Set<string>();
    const preloadPromises: Promise<HTMLAudioElement>[] = [];

    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < audioPlaylist.length) {
        const nextStop = audioPlaylist[nextIndex];
        if (nextStop.audioFile) {
          urlsToKeep.add(nextStop.audioFile);
          preloadPromises.push(
            preloadAudio(nextStop.audioFile).catch(() => null as unknown as HTMLAudioElement)
          );
        }
      }
    }

    const currentStop = audioPlaylist[currentIndex];
    if (currentStop?.audioFile) {
      urlsToKeep.add(currentStop.audioFile);
    }

    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    cleanupTimeoutRef.current = setTimeout(() => {
      cleanupOldPreloads(urlsToKeep);
    }, 5000);

    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, [audioPlaylist, currentStopId, preloadCount, preloadAudio, cleanupOldPreloads]);

  useEffect(() => {
    return () => {
      for (const entry of preloadedRef.current.values()) {
        entry.audio.src = '';
      }
      preloadedRef.current.clear();
    };
  }, []);

  return {
    getPreloadedAudio,
    preloadAudio,
  };
};
