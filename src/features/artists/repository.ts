import { type SQLiteDatabase } from 'expo-sqlite';

import { type ArtistRow } from '../../db/schema';
import { type Artist } from './types';

/** Raw SQLite access for the `artists` table. No business logic lives here. */

function toArtist(row: ArtistRow): Artist {
  return { id: row.id, name: row.name, color: row.color, imageUri: row.image_uri, createdAt: row.created_at };
}

export async function listArtists(db: SQLiteDatabase): Promise<Artist[]> {
  const rows = await db.getAllAsync<ArtistRow>('SELECT * FROM artists ORDER BY created_at DESC;');
  return rows.map(toArtist);
}

export async function insertArtist(db: SQLiteDatabase, artist: Artist): Promise<void> {
  await db.runAsync(
    'INSERT INTO artists (id, name, color, image_uri, created_at) VALUES (?, ?, ?, ?, ?);',
    artist.id,
    artist.name,
    artist.color,
    artist.imageUri,
    artist.createdAt
  );
}

export async function setArtistImage(db: SQLiteDatabase, artistId: string, imageUri: string): Promise<void> {
  await db.runAsync('UPDATE artists SET image_uri = ? WHERE id = ?;', imageUri, artistId);
}

export async function setArtistName(db: SQLiteDatabase, artistId: string, name: string): Promise<void> {
  await db.runAsync('UPDATE artists SET name = ? WHERE id = ?;', name, artistId);
}

/** Deletes the artist row. Relies on ON DELETE CASCADE (tracks, and albums once that table exists) — see db/client.ts for the PRAGMA that enables it. */
export async function deleteArtist(db: SQLiteDatabase, artistId: string): Promise<void> {
  await db.runAsync('DELETE FROM artists WHERE id = ?;', artistId);
}
