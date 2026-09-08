/** SQLite schema — source of truth for table shapes. Types are derived from this file, never duplicated by hand. */
export const SCHEMA_STATEMENTS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS artists (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    image_uri TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );`,
  // Declared before `tracks`, which references it.
  `CREATE TABLE IF NOT EXISTS albums (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    color TEXT NOT NULL DEFAULT '#E8001C',
    image_uri TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    -- Nullable: a track doesn't have to belong to an album. SET NULL rather than CASCADE, since
    -- deleting an album shouldn't delete the sounds it grouped.
    album_id TEXT REFERENCES albums(id) ON DELETE SET NULL,
    audio_uri TEXT NOT NULL DEFAULT '',
    image_uri TEXT NOT NULL DEFAULT '',
    duration_seconds REAL NOT NULL DEFAULT 0,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#E8001C',
    image_uri TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );`,
  // Join table: unlike an album (one column on the track), a track can sit in several playlists, and a
  // playlist mixes artists. `position` keeps the user's ordering within each playlist.
  `CREATE TABLE IF NOT EXISTS playlist_tracks (
    playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, track_id)
  );`,
  // Key/value store for user settings that must survive an app restart (e.g. the cover-source toggle).
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );`,
];

/**
 * ALTER statements for columns added after the initial CREATE TABLE above. CREATE TABLE IF NOT EXISTS
 * is a no-op on a database that already has the `tracks` table from before these columns existed, so
 * they're added here instead. Each must tolerate re-running (SQLite has no ADD COLUMN IF NOT EXISTS,
 * so migrateDatabase in db/client.ts swallows the "duplicate column" error per statement).
 */
export const MIGRATION_STATEMENTS: readonly string[] = [
  `ALTER TABLE tracks ADD COLUMN audio_uri TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE tracks ADD COLUMN duration_seconds REAL NOT NULL DEFAULT 0;`,
  `ALTER TABLE artists ADD COLUMN image_uri TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE tracks ADD COLUMN image_uri TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE tracks ADD COLUMN album_id TEXT REFERENCES albums(id) ON DELETE SET NULL;`,
];

/** Row shape as returned by expo-sqlite for the `albums` table. */
export type AlbumRow = {
  id: string;
  name: string;
  artist_id: string;
  color: string;
  /** file:// URI into persistent image storage, or '' to fall back to the coloured tile. */
  image_uri: string;
  created_at: number;
};

/** Row shape as returned by expo-sqlite for the `playlists` table. */
export type PlaylistRow = {
  id: string;
  name: string;
  color: string;
  /** file:// URI into persistent image storage, or '' to fall back to the coloured tile. */
  image_uri: string;
  created_at: number;
};

/** Row shape as returned by expo-sqlite for the `settings` table. */
export type SettingRow = {
  key: string;
  value: string;
};

/** Row shape as returned by expo-sqlite for the `artists` table. */
export type ArtistRow = {
  id: string;
  name: string;
  color: string;
  /** file:// URI into persistent image storage, or '' to fall back to the colored initials tile. */
  image_uri: string;
  created_at: number;
};

/** Row shape as returned by expo-sqlite for the `tracks` table. SQLite has no boolean type: is_favorite is 0/1. */
export type TrackRow = {
  id: string;
  title: string;
  artist_id: string;
  /** null when the track isn't in any album. A track belongs to at most one. */
  album_id: string | null;
  audio_uri: string;
  /** file:// URI into persistent image storage, or '' to inherit the artist's cover. */
  image_uri: string;
  duration_seconds: number;
  is_favorite: number;
  created_at: number;
};
