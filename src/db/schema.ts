/** SQLite schema — source of truth for table shapes. Types are derived from this file, never duplicated by hand. */
export const SCHEMA_STATEMENTS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS artists (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    artist_id TEXT NOT NULL REFERENCES artists(id),
    is_favorite INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );`,
];

/** Row shape as returned by expo-sqlite for the `artists` table. */
export type ArtistRow = {
  id: string;
  name: string;
  color: string;
  created_at: number;
};

/** Row shape as returned by expo-sqlite for the `tracks` table. SQLite has no boolean type: is_favorite is 0/1. */
export type TrackRow = {
  id: string;
  title: string;
  artist_id: string;
  is_favorite: number;
  created_at: number;
};
