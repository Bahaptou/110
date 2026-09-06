import { type SQLiteDatabase } from 'expo-sqlite';

import { type TrackRow } from '../../db/schema';
import { type Track } from './types';

/** Raw SQLite access for the `tracks` table. No business logic lives here. */

function toTrack(row: TrackRow): Track {
  return { id: row.id, title: row.title, artistId: row.artist_id, isFavorite: row.is_favorite === 1, createdAt: row.created_at };
}

export async function listTracksByArtist(db: SQLiteDatabase, artistId: string): Promise<Track[]> {
  const rows = await db.getAllAsync<TrackRow>(
    'SELECT * FROM tracks WHERE artist_id = ? ORDER BY created_at DESC;',
    artistId
  );
  return rows.map(toTrack);
}

export async function insertTrack(db: SQLiteDatabase, track: Track): Promise<void> {
  await db.runAsync(
    'INSERT INTO tracks (id, title, artist_id, is_favorite, created_at) VALUES (?, ?, ?, ?, ?);',
    track.id,
    track.title,
    track.artistId,
    track.isFavorite ? 1 : 0,
    track.createdAt
  );
}

export async function setTrackFavorite(db: SQLiteDatabase, trackId: string, isFavorite: boolean): Promise<void> {
  await db.runAsync('UPDATE tracks SET is_favorite = ? WHERE id = ?;', isFavorite ? 1 : 0, trackId);
}

export async function countTracksByArtist(db: SQLiteDatabase, artistId: string): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM tracks WHERE artist_id = ?;',
    artistId
  );
  return row?.count ?? 0;
}
