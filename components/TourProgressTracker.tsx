import { useEffect } from 'react';
import { TourData } from '../types';

type ProgressTracking = ReturnType<typeof import('../hooks/useProgressTracking').useProgressTracking>;

export interface TourProgressTrackerProps {
  tour: TourData | null;
  currentStopId: string | null;
  audioPlayerProgress: number;
  progressTracking: ProgressTracking;
  hasShownCompletionSheet: boolean;
  onTourComplete: () => void;
}

/**
 * Component that monitors tour progress and triggers completion callback.
 * Renders nothing - purely manages side effects.
 */
export const TourProgressTracker: React.FC<TourProgressTrackerProps> = ({
  tour,
  currentStopId,
  audioPlayerProgress,
  progressTracking,
  hasShownCompletionSheet,
  onTourComplete,
}) => {
  useEffect(() => {
    if (!tour || !currentStopId) return;
    const progress = progressTracking.getRealtimeProgressPercentage(
      tour.stops,
      currentStopId,
      audioPlayerProgress
    );

    if (progress >= 100 && !hasShownCompletionSheet) {
      onTourComplete();
    }
  }, [tour, currentStopId, audioPlayerProgress, progressTracking, hasShownCompletionSheet, onTourComplete]);

  return null; // Renders nothing
};
