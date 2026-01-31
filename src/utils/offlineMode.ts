import { TourData, OfflineMode } from '../../types';

/**
 * Get the offline mode for a tour, defaulting to 'optional' for backward compatibility.
 */
export function getOfflineMode(tour: TourData): OfflineMode {
  return tour.offlineMode ?? 'optional';
}
