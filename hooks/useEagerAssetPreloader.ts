import { useEffect, useRef, useState } from 'react';
import { TourData } from '../types';
import { eagerPreloadImage, eagerPreloadAudio } from './useAudioPreloader';

export interface UseEagerAssetPreloaderProps {
  tour: TourData | null;
}

/**
 * Hook to eagerly preload all tour assets before the tour starts.
 * This ensures the first audio and all images are ready for immediate playback.
 *
 * Priority:
 * 1. First audio file (wait for completion)
 * 2. All images in batches of 3
 */
export const useEagerAssetPreloader = ({ tour }: UseEagerAssetPreloaderProps) => {
  const [assetsReady, setAssetsReady] = useState(false);
  const hasPreloadedEagerRef = useRef(false);

  useEffect(() => {
    if (!tour) {
      setAssetsReady(false);
      hasPreloadedEagerRef.current = false;
      return;
    }
    if (hasPreloadedEagerRef.current) return;

    console.log('[EAGER] Starting eager preload for tour:', tour.title);

    const preloadTourAssets = async () => {
      try {
        // Get first audio stop
        const firstAudioStop = tour.stops.find(stop => stop.type === 'audio' && 'audioFile' in stop);
        if (!firstAudioStop || firstAudioStop.type !== 'audio') {
          console.error('[EAGER] No audio stops found in tour');
          setAssetsReady(true);
          return;
        }

        // PRIORITY 1: Preload first audio (wait for completion)
        console.log('[EAGER] ⏳ Loading first audio:', firstAudioStop.audioFile);
        await eagerPreloadAudio(firstAudioStop.audioFile);
        console.log('[EAGER] ✅ First audio ready');

        // PRIORITY 2: Preload ALL images in parallel (max 3 concurrent to avoid overwhelming browser)
        console.log('[EAGER] ⏳ Loading all images...');
        const imageStops = tour.stops.filter(stop =>
          (stop.type === 'audio' || stop.type === 'poi') && 'image' in stop && stop.image
        );

        // Load images in batches of 3
        const BATCH_SIZE = 3;
        for (let i = 0; i < imageStops.length; i += BATCH_SIZE) {
          const batch = imageStops.slice(i, i + BATCH_SIZE);
          await Promise.all(
            batch.map(stop => {
              const image = 'image' in stop ? stop.image : undefined;
              return image ? eagerPreloadImage(image).catch(err => {
                console.warn(`[EAGER] Failed to load image ${image}:`, err);
              }) : Promise.resolve();
            })
          );
        }

        console.log('[EAGER] ✅ All assets ready');
        hasPreloadedEagerRef.current = true;
        setAssetsReady(true);
      } catch (error) {
        console.error('[EAGER] Error during preload:', error);
        // Still mark as ready to not block the UI forever
        setAssetsReady(true);
      }
    };

    preloadTourAssets();
  }, [tour]);

  return { assetsReady };
};
