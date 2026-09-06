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
    artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    audio_uri TEXT NOT NULL DEFAULT '',
    duration_seconds REAL NOT NULL DEFAULT 0,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
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
  audio_uri: string;
  duration_seconds: number;
  is_favorite: number;
  created_at: number;
};
