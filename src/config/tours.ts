/**
 * Tour configuration
 * Centralized place to manage tour-related settings
 */

import { getDefaultTourId } from '../services/tourDiscovery';

/**
 * Default tour ID to load when no specific tour is requested.
 *
 * Derived dynamically from the tour data discovered at build time (the first
 * tour in src/data/tour/), so the URL slug always matches the bundled tour's
 * actual `id` and can never drift from the data.
 */
export const DEFAULT_TOUR_ID = getDefaultTourId();
