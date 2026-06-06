/**
 * Authoring contracts for the tour JSON files.
 *
 * These types describe exactly what a developer/content editor writes into the
 * data files — `metadata.json` and the per-language files (en.json, de.json, …).
 *
 * They are DERIVED from the runtime types in `types.ts` so they can never drift:
 * the only difference is that runtime-injected playback state (`isCompleted`,
 * `isPlaying`) is stripped, since those are computed at runtime and never authored.
 *
 * The JSON Schemas used for editor validation and the build/CI gate are generated
 * from `TourFile` and `TourMetadataFile` below (see scripts/generate-schema.ts).
 */
import type { TourData, TourMetadata, Stop, AudioStop } from '../../types';

/** Playback state injected at runtime (see isStopCompleted) — never written in JSON. */
type RuntimeStopState = 'isCompleted' | 'isPlaying';

/** An audio stop as authored in JSON, with runtime playback state removed. */
type AuthoredAudioStop = Omit<AudioStop, RuntimeStopState>;

/** Any stop as authored in JSON. */
type AuthoredStop = Exclude<Stop, AudioStop> | AuthoredAudioStop;

/**
 * Shape of a language file, e.g. `src/data/tour/en.json`.
 * Mirrors {@link TourData} but with runtime-only stop state removed.
 */
export interface TourFile extends Omit<TourData, 'stops'> {
  stops: AuthoredStop[];
}

/**
 * Shape of `src/data/tour/metadata.json` — properties shared across languages.
 */
export type TourMetadataFile = TourMetadata;
