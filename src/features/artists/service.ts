import { randomUUID } from 'expo-crypto';
import { type SQLiteDatabase } from 'expo-sqlite';

import { deleteArtist, insertArtist, listArtists } from './repository';
import { type Artist } from './types';

/** Business logic for artists — orchestrates the repository, never touches SQL directly from callers. */

const ARTIST_COLORS = ['#E8001C', '#FFD600', '#0057FF', '#00C896', '#FF6B00', '#C800E8'] as const;

export type CreateArtistResult = { ok: true; artist: Artist } | { ok: false; error: 'empty_name' };

export async function getArtists(db: SQLiteDatabase): Promise<Artist[]> {
  return listArtists(db);
}

export async function createArtist(db: SQLiteDatabase, rawName: string): Promise<CreateArtistResult> {
  const name = rawName.trim();
  if (name.length === 0) {
    return { ok: false, error: 'empty_name' };
  }

  const existingCount = (await listArtists(db)).length;
  const artist: Artist = {
    id: randomUUID(),
    name,
    color: ARTIST_COLORS[existingCount % ARTIST_COLORS.length],
    createdAt: Date.now(),
  };

  await insertArtist(db, artist);
  return { ok: true, artist };
}

/** Deletes an artist. Cascades to their tracks (and albums, once implemented) at the database level. */
export async function removeArtist(db: SQLiteDatabase, artistId: string): Promise<void> {
  await deleteArtist(db, artistId);
}
