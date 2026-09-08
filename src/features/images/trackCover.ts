import { type Track } from '../tracks/types';

export type TrackCoverSources = {
  /** Cover of the album this track belongs to, or '' when it has no album (or albums don't exist yet). */
  albumImageUri: string;
  artistImageUri: string;
};

/**
 * Single place deciding which image represents a track.
 *
 * The track's own image always wins — `preferArtistCover` only swaps which fallback is used when the
 * track has none, so turning the toggle on never hides a cover the user set deliberately.
 */
export function resolveTrackCoverUri(
  track: Track,
  { albumImageUri, artistImageUri }: TrackCoverSources,
  preferArtistCover: boolean
): string {
  if (track.imageUri.length > 0) return track.imageUri;
  if (preferArtistCover) return artistImageUri;
  return albumImageUri.length > 0 ? albumImageUri : artistImageUri;
}
