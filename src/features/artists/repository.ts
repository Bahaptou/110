import { type SQLiteDatabase } from 'expo-sqlite';

import { type ArtistRow } from '../../db/schema';
import { type Artist } from './types';

/** Raw SQLite access for the `artists` table. No business logic lives here. */

function toArtist(row: ArtistRow): Artist {
  return { id: row.id, name: row.name, color: row.color, createdAt: row.created_at };
}

export async function listArtists(db: SQLiteDatabase): Promise<Artist[]> {
  const rows = await db.getAllAsync<ArtistRow>('SELECT * FROM artists ORDER BY created_at DESC;');
  return rows.map(toArtist);
}

export async function insertArtist(db: SQLiteDatabase, artist: Artist): Promise<void> {
  await db.runAsync(
    'INSERT INTO artists (id, name, color, created_at) VALUES (?, ?, ?, ?);',
    artist.id,
    artist.name,
    artist.color,
    artist.createdAt
  );
}
