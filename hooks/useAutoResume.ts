import { useEffect } from 'react';
import { TourData } from '../types';

type ProgressTracking = ReturnType<typeof import('./useProgressTracking').useProgressTracking>;

export interface UseAutoResumeProps {
  tour: TourData | null;
  currentStopId: string | null;
  urlStopId: string | undefined;
  progressTracking: ProgressTracking;
  resumeStopIdRef: React.MutableRefObject<string | null>;
  resumePositionRef: React.MutableRefObject<number>;
}

/**
 * Hook to detect the first unfinished track on mount and set up auto-resume.
 * Skips if a deep link (urlStopId) is present or if a stop is already playing.
 */
export const useAutoResume = ({
  tour,
  currentStopId,
  urlStopId,
  progressTracking,
  resumeStopIdRef,
  resumePositionRef,
}: UseAutoResumeProps) => {
  useEffect(() => {
    if (!tour || currentStopId !== null || urlStopId) return;

    const audioStops = tour.stops.filter(stop => stop.type === 'audio');
    const firstUnfinished = audioStops.find(stop =>
      !progressTracking.isStopCompleted(stop.id)
    );

    if (firstUnfinished) {
      resumeStopIdRef.current = firstUnfinished.id;
      resumePositionRef.current = progressTracking.getStopPosition(firstUnfinished.id);
      console.log(`[RESUME] Detected unfinished track: ${firstUnfinished.id} at ${resumePositionRef.current}s`);
    } else {
      // All complete or no progress - start from beginning
      resumeStopIdRef.current = null;
      resumePositionRef.current = 0;
    }
  }, [tour, currentStopId, urlStopId, progressTracking, resumeStopIdRef, resumePositionRef]);
};
