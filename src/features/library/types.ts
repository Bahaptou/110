/**
 * On-disk shape of an exported library (`.110.json`).
 *
 * Audio and images travel base64-encoded inside this JSON rather than as separate files, so a whole
 * library is one shareable document — the same on Android and iOS, with no archive format or native
 * module involved.
 */
export type LibraryBundle = {
  /** Bumped when the shape changes incompatibly; import refuses anything it doesn't understand. */
  formatVersion: 1;
  exportedAt: number;
  /** Free-form label shown before importing, e.g. "Bibliothèque de Baptiste". */
  label: string;
  artists: BundledArtist[];
  albums: BundledAlbum[];
  tracks: BundledTrack[];
  playlists: BundledPlaylist[];
};

/** Ids are carried over from the source device so a re-import can recognise what it already has. */
export type BundledArtist = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  /** Base64 payload of the cover, or null when there is none. */
  image: BundledFile | null;
};

export type BundledAlbum = {
  id: string;
  name: string;
  artistId: string;
  color: string;
  createdAt: number;
  image: BundledFile | null;
};

export type BundledTrack = {
  id: string;
  title: string;
  artistId: string;
  albumId: string | null;
  durationSeconds: number;
  isFavorite: boolean;
  createdAt: number;
  audio: BundledFile | null;
  image: BundledFile | null;
};

export type BundledPlaylist = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  image: BundledFile | null;
  /** Track ids in the user's chosen order; ids missing from `tracks` are skipped on import. */
  trackIds: string[];
};

/** A file carried inside the bundle: its extension plus its base64 content. */
export type BundledFile = {
  extension: string;
  base64: string;
};
